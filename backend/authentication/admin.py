from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """
    Django Admin for roles table:
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE

    Restricted strictly to the 4 system roles:
    1. admin
    2. finance
    3. sales manager
    4. sales representative
    """
    list_display = ['id', 'role_name']
    search_fields = ['role_name']
    ordering = ['id']

    def has_delete_permission(self, request, obj=None):
        # Protect core system roles from deletion
        if obj and getattr(obj, 'role_name', '') in Role.ALLOWED_ROLES:
            return False
        return True



@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Django Admin for users table:
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        magic_token VARCHAR(255) NULL,
        magic_token_expires_at DATETIME NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    """
    list_display = [
        'id',
        'email',
        'first_name',
        'last_name',
        'role',
        'is_active',
        'is_staff',
        'created_at',
        'magic_token',
    ]
    list_filter = [
        'role',
        'is_active',
        'is_staff',
        'is_superuser',
        'created_at',
    ]
    search_fields = [
        'email',
        'first_name',
        'last_name',
        'role__role_name',
    ]
    ordering = ['-created_at']

    fieldsets = (
        ('Authentication Credentials', {'fields': ('email', 'password')}),
        ('Personal Information', {'fields': ('first_name', 'last_name')}),
        ('Role Assignment', {'fields': ('role',)}),
        ('Magic Token (Passwordless Access)', {
            'fields': ('magic_token', 'magic_token_expires_at'),
            'description': 'Fields for passwordless magic link authentication.'
        }),
        ('Permissions & Staff Status', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {'fields': ('created_at', 'last_login')}),
    )

    readonly_fields = ['created_at', 'last_login']

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )

    actions = ['activate_users', 'deactivate_users']

    @admin.action(description='Activate selected users')
    def activate_users(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} user(s) successfully activated.')

    @admin.action(description='Deactivate selected users')
    def deactivate_users(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} user(s) successfully deactivated.')


# Hide Token Blacklist models from Django Admin sidebar
try:
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

    admin.site.unregister(OutstandingToken)
    admin.site.unregister(BlacklistedToken)
except (admin.sites.NotRegistered, ImportError):
    pass

