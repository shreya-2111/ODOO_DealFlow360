from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models


class Role(models.Model):
    """
    Roles table representing user roles in the system.
    Matches SQL schema:
        CREATE TABLE roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_name VARCHAR(50) NOT NULL UNIQUE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    Strictly restricted to exactly 4 roles:
    1. admin
    2. finance
    3. sales manager
    4. sales representative
    """
    ADMIN = 'admin'
    FINANCE = 'finance manager'
    SALES_MANAGER = 'sales manager'
    SALES_REPRESENTATIVE = 'sales representative'

    ALLOWED_ROLES = [ADMIN, FINANCE, 'finance', SALES_MANAGER, SALES_REPRESENTATIVE]

    ROLE_CHOICES = [
        (ADMIN, 'admin'),
        (FINANCE, 'finance manager'),
        (SALES_MANAGER, 'sales manager'),
        (SALES_REPRESENTATIVE, 'sales representative'),
    ]

    role_name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Role Name',
        help_text='Role name (e.g. admin, finance, sales manager, sales representative)'
    )

    class Meta:
        db_table = 'roles'
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
        ordering = ['id']

    def clean(self):
        super().clean()
        if self.role_name:
            self.role_name = self.role_name.lower().strip()

    def save(self, *args, **kwargs):
        if self.role_name:
            self.role_name = self.role_name.lower().strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.role_name

    @property
    def name(self):
        return self.role_name


class UserManager(BaseUserManager):
    """
    Custom manager for User model where email is the primary login credential.
    """

    def create_user(self, email, first_name, last_name, password=None, role=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email).lower()

        # Assign or resolve role (strictly among the 4 allowed roles)
        if role is None:
            role = Role.objects.filter(role_name=Role.SALES_REPRESENTATIVE).first()
            if not role:
                role = Role.objects.create(role_name=Role.SALES_REPRESENTATIVE)
        elif isinstance(role, int):
            role = Role.objects.get(id=role)
        elif isinstance(role, str):
            normalized = role.lower().strip()
            if normalized not in Role.ALLOWED_ROLES:
                raise ValueError(
                    f"Invalid role '{role}'. Allowed roles are only: {', '.join(Role.ALLOWED_ROLES)}"
                )
            role = Role.objects.filter(role_name=normalized).first()
            if not role:
                role = Role.objects.create(role_name=normalized)

        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)

        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            **extra_fields
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name='Admin', last_name='User', password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        admin_role = Role.objects.filter(role_name=Role.ADMIN).first()
        if not admin_role:
            admin_role = Role.objects.create(role_name=Role.ADMIN)
        extra_fields['role'] = admin_role

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            **extra_fields
        )


class User(AbstractBaseUser, PermissionsMixin):
    """
    User model matching exact table schema:
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_id INT NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            magic_token VARCHAR(255) NULL,
            magic_token_expires_at DATETIME NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name='users',
        db_column='role_id',
        verbose_name='Role',
        help_text='Foreign key referencing roles(id)'
    )
    first_name = models.CharField(max_length=50, verbose_name='First Name')
    last_name = models.CharField(max_length=50, verbose_name='Last Name')
    email = models.EmailField(max_length=100, unique=True, db_index=True, verbose_name='Email Address')
    password = models.CharField(max_length=255, db_column='password_hash', verbose_name='Password Hash')
    magic_token = models.CharField(max_length=255, blank=True, null=True, verbose_name='Magic Token')
    magic_token_expires_at = models.DateTimeField(blank=True, null=True, verbose_name='Magic Token Expiry')
    is_active = models.BooleanField(default=True, verbose_name='Is Active')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')

    # Django Admin access flag
    is_staff = models.BooleanField(default=False, verbose_name='Staff Status')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        role_label = self.role.role_name if self.role else 'No Role'
        return f"{self.email} ({role_label})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def password_hash(self):
        return self.password

    @password_hash.setter
    def password_hash(self, value):
        self.password = value

    @property
    def is_internal(self):
        if not self.role:
            return False
        return self.role.role_name.lower() in ('admin', 'finance', 'sales manager', 'sales representative')

    @property
    def is_customer(self):
        if not self.role:
            return False
        return self.role.role_name.lower() == 'customer'
