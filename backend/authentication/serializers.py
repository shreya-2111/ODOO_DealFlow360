from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import Role, User


class RoleSerializer(serializers.ModelSerializer):
    """Serializes Role model (roles table)."""
    class Meta:
        model = Role
        fields = ['id', 'role_name']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializes User model (users table):
        id, role_id, first_name, last_name, email,
        magic_token, magic_token_expires_at, is_active, created_at
    """
    name = serializers.CharField(source='full_name', read_only=True)
    role_name = serializers.CharField(source='role.role_name', read_only=True)
    role_id = serializers.IntegerField(source='role.id', read_only=True)
    is_internal = serializers.BooleanField(read_only=True)
    is_customer = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'role_id',
            'role_name',
            'first_name',
            'last_name',
            'name',
            'email',
            'magic_token',
            'magic_token_expires_at',
            'is_active',
            'is_staff',
            'created_at',
            'is_internal',
            'is_customer',
        ]
        read_only_fields = [
            'id',
            'name',
            'role_name',
            'role_id',
            'is_internal',
            'is_customer',
            'created_at',
        ]


class RegisterSerializer(serializers.Serializer):
    """
    Registers a new user matching the schema:
    email, first_name, last_name, password, role_id / role
    """
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True, max_length=50)
    last_name = serializers.CharField(required=True, max_length=50)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=False)
    role_id = serializers.IntegerField(required=False)
    role = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError('A user with this email address already exists.')
        return normalized

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if confirm_password and password != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        validate_password(password)

        role_id = attrs.get('role_id')
        role_name = attrs.get('role')

        if role_id is not None:
            role_obj = Role.objects.filter(id=role_id).first()
            if not role_obj:
                raise serializers.ValidationError({'role_id': f'Role ID {role_id} does not exist.'})
            if role_obj.role_name not in Role.ALLOWED_ROLES:
                raise serializers.ValidationError({
                    'role_id': f"Role '{role_obj.role_name}' is not allowed. Allowed roles: {', '.join(Role.ALLOWED_ROLES)}"
                })
        elif role_name:
            normalized = role_name.strip().lower()
            if normalized not in Role.ALLOWED_ROLES:
                raise serializers.ValidationError({
                    'role': f"Invalid role '{role_name}'. Allowed roles are only: {', '.join(Role.ALLOWED_ROLES)}"
                })

        return attrs

    def create(self, validated_data):
        email = validated_data['email']
        first_name = validated_data['first_name']
        last_name = validated_data['last_name']
        password = validated_data['password']

        role_id = validated_data.get('role_id')
        role_name = validated_data.get('role')

        role = None
        if role_id:
            role = Role.objects.filter(id=role_id).first()
        elif role_name:
            role = Role.objects.filter(role_name__iexact=role_name.strip()).first()

        if not role:
            # Default strictly to sales representative
            role = Role.objects.filter(role_name=Role.SALES_REPRESENTATIVE).first()
            if not role:
                role = Role.objects.create(role_name=Role.SALES_REPRESENTATIVE)

        user = User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            role=role,
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Authenticates email & password, returns JWT tokens and user payload.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')

        try:
            user = User.objects.select_related('role').get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid email or password.')

        if not user.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')

        if not user.is_active:
            raise serializers.ValidationError('This user account has been deactivated.')

        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['role'] = user.role.role_name if user.role else 'No Role'

        return {
            'user': user,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role.role_name if user.role else 'No Role',
        }


class LogoutSerializer(serializers.Serializer):
    """Blacklists refresh token upon logout."""
    refresh = serializers.CharField(required=True)

    def validate(self, attrs):
        refresh_token = attrs.get('refresh')
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as e:
            raise serializers.ValidationError({'refresh': f'Invalid or expired token: {str(e)}'})
        return attrs
