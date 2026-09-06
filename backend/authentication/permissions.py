from rest_framework.permissions import BasePermission


class IsInternalUser(BasePermission):
    """
    Allows access to all internal enterprise users:
    - admin
    - finance
    - sales manager
    - sales representative
    """
    message = 'Access restricted: Only internal users can access this endpoint.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.is_superuser:
            return True
        role_name = (request.user.role.role_name if request.user.role else '').lower()
        return role_name in ('admin', 'finance', 'finance manager', 'sales manager', 'sales representative')


class IsSalesRep(BasePermission):
    """
    Allows access to sales representative and admin.
    """
    message = 'Access restricted: Requires sales representative role.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.is_superuser:
            return True
        role_name = (request.user.role.role_name if request.user.role else '').lower()
        return role_name in ('sales representative', 'admin')


class IsSalesManager(BasePermission):
    """
    Allows access to sales manager and admin.
    """
    message = 'Access restricted: Requires sales manager role.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.is_superuser:
            return True
        role_name = (request.user.role.role_name if request.user.role else '').lower()
        return role_name in ('sales manager', 'admin')


class IsFinanceOperations(BasePermission):
    """
    Allows access to finance and admin.
    """
    message = 'Access restricted: Requires finance role.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.is_superuser:
            return True
        role_name = (request.user.role.role_name if request.user.role else '').lower()
        return role_name in ('finance', 'finance manager', 'admin')


class IsCustomer(BasePermission):
    """
    Allows access to customer role.
    """
    message = 'Access restricted: Only customer users can access this endpoint.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        role_name = (request.user.role.role_name if request.user.role else '').lower()
        return role_name == 'customer'


class IsAdmin(BasePermission):
    """
    Allows access only to admin role or superusers.
    """
    message = 'Access restricted: Requires admin privileges.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        role_name = (request.user.role.role_name if request.user.role else '').lower()
        return role_name == 'admin'
