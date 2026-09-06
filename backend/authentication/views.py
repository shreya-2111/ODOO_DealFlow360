from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    UserSerializer,
)


try:
    from drf_spectacular.utils import extend_schema
except ImportError:
    def extend_schema(*args, **kwargs):
        def decorator(func_or_class):
            return func_or_class
        return decorator


@extend_schema(tags=['Authentication'])
class RegisterView(APIView):
    """
    POST /api/auth/register/
    Registers a new user into users table with foreign key to roles table.
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @extend_schema(
        request=RegisterSerializer,
        summary='Register a new user',
        description='Creates a new user record with role assignment and returns initial JWT tokens.',
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            refresh['email'] = user.email
            refresh['role'] = user.role.name if user.role else ''

            user_data = UserSerializer(user).data

            return Response(
                {
                    'message': f"User {user.full_name} registered successfully.",
                    'user': user_data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    },
                    'role': user.role.name if user.role else '',
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Authentication'])
class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticates user with email & password and returns JWT token pair.
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(
        request=LoginSerializer,
        summary='Authenticate user and get JWT tokens',
        description='Validates user credentials against database and issues JWT access and refresh tokens.',
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            data = serializer.validated_data
            user = data['user']
            user_data = UserSerializer(user).data

            return Response(
                {
                    'message': f"Authenticated successfully as {user.full_name}.",
                    'user': user_data,
                    'tokens': {
                        'access': data['access'],
                        'refresh': data['refresh'],
                    },
                    'role': data['role'],
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Authentication'])
class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the user's refresh token.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    @extend_schema(
        request=LogoutSerializer,
        summary='Logout and blacklist refresh token',
        description='Submits a refresh token to the blacklist so it can no longer be used.',
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            return Response(
                {
                    'message': 'Successfully logged out. Refresh token has been blacklisted.'
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Authentication'])
class CurrentUserView(APIView):
    """
    GET /api/auth/me/
    Returns currently authenticated user profile from users table.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(
        responses={200: UserSerializer},
        summary='Get current user profile',
        description='Returns profile details, assigned role, and permissions of the currently authenticated user.',
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(
            {
                'user': serializer.data,
            },
            status=status.HTTP_200_OK,
        )
