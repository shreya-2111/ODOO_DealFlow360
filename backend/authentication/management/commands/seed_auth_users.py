from django.core.management.base import BaseCommand
from django.db import connection
from authentication.models import Role, User

# EXACT 4 ROLES REQUESTED:
# 1. admin
# 2. finance
# 3. sales manager
# 4. sales representative
FOUR_ROLES = [
    {'id': 1, 'role_name': 'admin'},
    {'id': 2, 'role_name': 'finance manager'},
    {'id': 3, 'role_name': 'sales manager'},
    {'id': 4, 'role_name': 'sales representative'},
]

# Users mapped strictly to these 4 roles
USERS_LIST = [
    {
        'email': 'utang@gmail.com',
        'first_name': 'Utang',
        'last_name': 'Patel',
        'role_id': 1,  # admin
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'email': 'neha.gupta@gmail.com',
        'first_name': 'Neha',
        'last_name': 'Gupta',
        'role_id': 1,  # admin
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'email': 'admin@dealflow360.in',
        'first_name': 'Admin',
        'last_name': 'DealFlow',
        'role_id': 1,  # admin
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'email': 'amit.sharma@gmail.com',
        'first_name': 'Amit',
        'last_name': 'Sharma',
        'role_id': 4,  # sales representative
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'amit.sharma@dealflow360.in',
        'first_name': 'Amit',
        'last_name': 'Sharma',
        'role_id': 4,  # sales representative
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'rohan.das@gmail.com',
        'first_name': 'Rohan',
        'last_name': 'Das',
        'role_id': 4,  # sales representative
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'priya.patel@gmail.com',
        'first_name': 'Priya',
        'last_name': 'Patel',
        'role_id': 3,  # sales manager
        'is_staff': True,
        'is_superuser': False,
    },
    {
        'email': 'priya.patel@dealflow360.in',
        'first_name': 'Priya',
        'last_name': 'Patel',
        'role_id': 3,  # sales manager
        'is_staff': True,
        'is_superuser': False,
    },
    {
        'email': 'karan.mehta@gmail.com',
        'first_name': 'Karan',
        'last_name': 'Mehta',
        'role_id': 3,  # sales manager
        'is_staff': True,
        'is_superuser': False,
    },
    {
        'email': 'rajesh.verma@gmail.com',
        'first_name': 'Rajesh',
        'last_name': 'Verma',
        'role_id': 2,  # finance
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'rajesh.verma@dealflow360.in',
        'first_name': 'Rajesh',
        'last_name': 'Verma',
        'role_id': 2,  # finance
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'ananya.iyer@gmail.com',
        'first_name': 'Ananya',
        'last_name': 'Iyer',
        'role_id': 2,  # finance
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'suresh.nair@gmail.com',
        'first_name': 'Suresh',
        'last_name': 'Nair',
        'role_id': 2,  # finance
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'v.malhotra@gmail.com',
        'first_name': 'Vikram',
        'last_name': 'Malhotra',
        'role_id': 4,  # sales representative
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'vikram.malhotra@dealflow360.in',
        'first_name': 'Vikram',
        'last_name': 'Malhotra',
        'role_id': 4,  # sales representative
        'is_staff': False,
        'is_superuser': False,
    },
]

DEFAULT_PASSWORD = 'password123'


class Command(BaseCommand):
    help = 'Clears and sets strictly the 4 roles (admin, finance, sales manager, sales representative) and users.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            type=str,
            default=DEFAULT_PASSWORD,
            help=f'Password to set for users (default: {DEFAULT_PASSWORD})'
        )

    def handle(self, *args, **options):
        password = options['password']

        self.stdout.write(self.style.NOTICE('1. Populating/updating exactly 4 roles:'))
        roles_map = {}
        for r_data in FOUR_ROLES:
            role, _ = Role.objects.get_or_create(
                id=r_data['id'],
                defaults={'role_name': r_data['role_name']}
            )
            if role.role_name != r_data['role_name']:
                role.role_name = r_data['role_name']
                role.save()
            roles_map[role.id] = role
            self.stdout.write(self.style.SUCCESS(f"  [{role.id}] {role.role_name}"))

        # Insert / Update Users
        self.stdout.write(self.style.NOTICE('\n2. Populating users with assigned roles:'))
        for u_data in USERS_LIST:
            role = roles_map[u_data['role_id']]
            user = User.objects.filter(email=u_data['email']).first()
            if not user:
                user = User.objects.create_user(
                    email=u_data['email'],
                    first_name=u_data['first_name'],
                    last_name=u_data['last_name'],
                    password=password,
                    role=role,
                    is_staff=u_data['is_staff'],
                    is_superuser=u_data['is_superuser'],
                    is_active=True,
                )
            else:
                user.first_name = u_data['first_name']
                user.last_name = u_data['last_name']
                user.role = role
                user.is_staff = u_data['is_staff']
                user.is_superuser = u_data['is_superuser']
                user.is_active = True
                user.set_password(password)
                user.save()
            user_type = "SUPERUSER" if user.is_superuser else ("STAFF" if user.is_staff else "USER")
            self.stdout.write(
                self.style.SUCCESS(
                    f"  [{user.id:2d}] {user.full_name:<16} | {user.email:<26} | Role: {role.role_name:<20} | [{user_type}]"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully configured exactly 4 roles in database! Password for accounts: '{password}'"
            )
        )
