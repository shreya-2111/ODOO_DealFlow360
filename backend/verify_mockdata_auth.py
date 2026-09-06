"""
Verification script for DealFlow360 Authentication.
Validates all personas from frontend/src/data/mockData.js against the backend API.
"""

import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealflow360.settings')

import django
django.setup()

from django.core.management import call_command
from rest_framework.test import APIClient
from authentication.models import User, RoleChoices

def run_validation():
    print("=" * 70)
    print("DealFlow360 - Authentication & MockData.js Parity Validation")
    print("=" * 70)

    # 1. Run migrations and seed personas
    print("\n[1/4] Ensuring database migrations and seeding personas...")
    call_command('migrate', interactive=False, verbosity=0)
    call_command('seed_auth_users', password='password123', verbosity=0)
    print("  -> Seeded 5 personas from mockData.js with password 'password123'")

    client = APIClient()

    # 2. Test Personas Authentication
    personas = [
        {
            'id': 'sales_rep',
            'name': 'Amit Sharma',
            'email': 'amit.sharma@dealflow360.in',
            'role': 'Sales Representative',
            'team': 'Enterprise Direct',
            'is_internal': True,
        },
        {
            'id': 'sales_manager',
            'name': 'Priya Patel',
            'email': 'priya.patel@dealflow360.in',
            'role': 'Sales Manager / Approver',
            'team': 'Regional Revenue Operations',
            'is_internal': True,
        },
        {
            'id': 'finance_ops',
            'name': 'Rajesh Verma',
            'email': 'rajesh.verma@dealflow360.in',
            'role': 'Finance / Operations',
            'team': 'Treasury & Supply Chain',
            'is_internal': True,
        },
        {
            'id': 'customer',
            'name': 'Vikram Malhotra',
            'email': 'v.malhotra@acmecorp.in',
            'role': 'Customer / Portal User',
            'team': 'Acme Corp / Reliance Infotech',
            'is_internal': False,
        },
        {
            'id': 'admin',
            'name': 'Neha Gupta',
            'email': 'neha.gupta@dealflow360.in',
            'role': 'Admin',
            'team': 'Platform Governance & IT',
            'is_internal': True,
        },
    ]

    print("\n[2/4] Testing POST /api/auth/login/ for each mockData.js persona:")
    all_passed = True

    tokens = {}
    for p in personas:
        payload = {
            'email': p['email'],
            'password': 'password123',
            'selectedRole': p['id'],
        }
        res = client.post('/api/auth/login/', payload, format='json')
        if res.status_code == 200:
            user_data = res.data['user']
            tokens[p['id']] = res.data['tokens']['access']
            name_ok = user_data['name'] == p['name']
            role_ok = res.data['role'] == p['id']
            internal_ok = user_data['is_internal'] == p['is_internal']
            status_symbol = "[PASS]" if (name_ok and role_ok and internal_ok) else "[FAIL]"
            print(f"  {status_symbol} {p['name']:<18} | Role: {res.data['role']:<15} | Internal: {str(user_data['is_internal']):<5} | Status: 200 OK")
            if not (name_ok and role_ok and internal_ok):
                all_passed = False
        else:
            print(f"  [FAIL] {p['name']:<18} | FAILED with status {res.status_code}: {res.data}")
            all_passed = False

    # 3. Test GET /api/auth/me/
    print("\n[3/4] Testing GET /api/auth/me/ with JWT Bearer tokens:")
    for p in personas:
        token = tokens.get(p['id'])
        if not token:
            continue
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = client.get('/api/auth/me/')
        if res.status_code == 200 and res.data['user']['email'] == p['email']:
            print(f"  [PASS] {p['name']:<18} | Profile parity verified (ID: {res.data['user']['id']})")
        else:
            print(f"  [FAIL] {p['name']:<18} | Profile check failed: {res.status_code}")
            all_passed = False

    # 4. Security Checks
    print("\n[4/4] Testing Security Boundaries:")
    client.credentials()  # Clear auth

    # Unauthenticated /me
    anon_me = client.get('/api/auth/me/')
    if anon_me.status_code == 401:
        print("  [PASS] Anonymous GET /api/auth/me/ correctly blocked (401 Unauthorized)")
    else:
        print(f"  [FAIL] Anonymous access was not blocked: {anon_me.status_code}")
        all_passed = False

    # Anonymous admin registration attempt
    hacker_res = client.post(
        '/api/auth/register/',
        {'email': 'badactor@dealflow360.in', 'password': 'Password123!', 'role': 'ADMIN'},
        format='json'
    )
    if hacker_res.status_code == 400:
        print("  [PASS] Anonymous privilege escalation to ADMIN correctly blocked (400 Bad Request)")
    else:
        print(f"  [FAIL] Anonymous privilege escalation was not rejected: {hacker_res.status_code}")
        all_passed = False

    print("\n" + "=" * 70)
    if all_passed:
        print("RESULT: ALL MOCKDATA PERSONA VALIDATIONS PASSED SUCCESSFULLY! [OK]")
    else:
        print("RESULT: SOME CHECKS FAILED! Please review above errors. [FAIL]")
    print("=" * 70)

if __name__ == '__main__':
    run_validation()
