from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import Role, User
from authentication.permissions import (
    IsAdmin,
    IsFinanceOperations,
    IsInternalUser,
    IsSalesManager,
    IsSalesRep,
)


class AuthenticationTests(APITestCase):
    """
    Automated test suite covering the 4 exact roles:
    - admin
    - finance
    - sales manager
    - sales representative
    """

    def setUp(self):
        self.register_url = reverse('authentication:register')
        self.login_url = reverse('authentication:login')
        self.refresh_url = reverse('authentication:token_refresh')
        self.logout_url = reverse('authentication:logout')
        self.me_url = reverse('authentication:me')

        self.password = 'StrongP@ssw0rd2026!'

        # Setup the 4 standard roles
        self.role_admin, _ = Role.objects.get_or_create(role_name='admin')
        self.role_finance, _ = Role.objects.get_or_create(role_name='finance')
        self.role_sales_manager, _ = Role.objects.get_or_create(role_name='sales manager')
        self.role_sales_rep, _ = Role.objects.get_or_create(role_name='sales representative')

        # Setup users
        self.sales_rep = User.objects.create_user(
            email='amit.sharma@gmail.com',
            password=self.password,
            first_name='Amit',
            last_name='Sharma',
            role=self.role_sales_rep,
        )

        self.sales_manager = User.objects.create_user(
            email='priya.patel@gmail.com',
            password=self.password,
            first_name='Priya',
            last_name='Patel',
            role=self.role_sales_manager,
            is_staff=True,
        )

        self.finance_user = User.objects.create_user(
            email='rajesh.verma@gmail.com',
            password=self.password,
            first_name='Rajesh',
            last_name='Verma',
            role=self.role_finance,
        )

        self.admin_user = User.objects.create_superuser(
            email='utang@gmail.com',
            password=self.password,
            first_name='Utang',
            last_name='Patel',
        )

    # 1. Registration success
    def test_01_registration_success(self):
        payload = {
            'email': 'new.rep@gmail.com',
            'password': 'SecureP@ssword2026!',
            'confirm_password': 'SecureP@ssword2026!',
            'first_name': 'Rohan',
            'last_name': 'Das',
            'role_id': self.role_sales_rep.id,
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'new.rep@gmail.com')
        self.assertEqual(response.data['user']['first_name'], 'Rohan')
        self.assertEqual(response.data['user']['last_name'], 'Das')
        self.assertEqual(response.data['user']['role_id'], self.role_sales_rep.id)

    # 2. Duplicate registration
    def test_02_duplicate_registration(self):
        payload = {
            'email': 'amit.sharma@gmail.com',
            'password': 'SecureP@ssword2026!',
            'confirm_password': 'SecureP@ssword2026!',
            'first_name': 'Amit',
            'last_name': 'Sharma',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    # 3. Invalid email
    def test_03_invalid_email(self):
        payload = {
            'email': 'not-an-email-address',
            'password': 'SecureP@ssword2026!',
            'first_name': 'Test',
            'last_name': 'User',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    # 4. Weak password
    def test_04_weak_password(self):
        payload = {
            'email': 'weak.pass@gmail.com',
            'password': '123',
            'first_name': 'Weak',
            'last_name': 'Pass',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    # 5. Successful login
    def test_05_successful_login(self):
        payload = {
            'email': 'amit.sharma@gmail.com',
            'password': self.password,
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'amit.sharma@gmail.com')
        self.assertEqual(response.data['role'], 'sales representative')

    # 6. Wrong password
    def test_06_wrong_password(self):
        payload = {
            'email': 'amit.sharma@gmail.com',
            'password': 'IncorrectPassword!',
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 7. Non-existent user login
    def test_07_nonexistent_user_login(self):
        payload = {
            'email': 'nonexistent@gmail.com',
            'password': self.password,
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 8. JWT refresh
    def test_08_jwt_refresh(self):
        refresh = RefreshToken.for_user(self.sales_rep)
        payload = {'refresh': str(refresh)}
        response = self.client.post(self.refresh_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    # 9. GET /me with valid token
    def test_09_me_with_valid_token(self):
        refresh = RefreshToken.for_user(self.sales_rep)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], 'amit.sharma@gmail.com')
        self.assertEqual(response.data['user']['name'], 'Amit Sharma')
        self.assertEqual(response.data['user']['role_name'], 'sales representative')

    # 10. GET /me without token
    def test_10_me_without_token(self):
        self.client.credentials()
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 11. Sales Rep permissions
    def test_11_sales_rep_permissions(self):
        perm = IsSalesRep()
        self.assertTrue(perm.has_permission(type('Request', (), {'user': self.sales_rep})(), None))
        self.assertFalse(perm.has_permission(type('Request', (), {'user': self.finance_user})(), None))

    # 12. Sales Manager permissions
    def test_12_sales_manager_permissions(self):
        perm = IsSalesManager()
        self.assertTrue(perm.has_permission(type('Request', (), {'user': self.sales_manager})(), None))
        self.assertFalse(perm.has_permission(type('Request', (), {'user': self.sales_rep})(), None))

    # 13. Finance permissions
    def test_13_finance_permissions(self):
        perm = IsFinanceOperations()
        self.assertTrue(perm.has_permission(type('Request', (), {'user': self.finance_user})(), None))
        self.assertFalse(perm.has_permission(type('Request', (), {'user': self.sales_rep})(), None))

    # 14. Admin permissions
    def test_14_admin_permissions(self):
        perm = IsAdmin()
        self.assertTrue(perm.has_permission(type('Request', (), {'user': self.admin_user})(), None))
        self.assertFalse(perm.has_permission(type('Request', (), {'user': self.sales_rep})(), None))

    # 15. Internal permissions
    def test_15_internal_permissions(self):
        perm = IsInternalUser()
        self.assertTrue(perm.has_permission(type('Request', (), {'user': self.sales_rep})(), None))
        self.assertTrue(perm.has_permission(type('Request', (), {'user': self.sales_manager})(), None))
        self.assertTrue(perm.has_permission(type('Request', (), {'user': self.finance_user})(), None))
        self.assertTrue(perm.has_permission(type('Request', (), {'user': self.admin_user})(), None))

    # 16. Logout / Token Blacklist
    def test_16_logout_and_blacklist(self):
        refresh = RefreshToken.for_user(self.sales_rep)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        logout_response = self.client.post(self.logout_url, {'refresh': str(refresh)}, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        refresh_response = self.client.post(self.refresh_url, {'refresh': str(refresh)}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
