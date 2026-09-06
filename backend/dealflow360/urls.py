"""
URL configuration for dealflow360 project.
Includes authentication and deals apps with unified Admin dashboard.
"""

from django.contrib import admin
from django.contrib.auth.models import Group
from django.http import JsonResponse
from django.urls import include, path

# Unregister default Group from Django admin
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

# Custom Admin Site Header & Title
admin.site.site_header = 'DealFlow360 Administration'
admin.site.site_title = 'DealFlow360 Admin Portal'
admin.site.index_title = 'DealFlow360 System Overview'

# Custom unified ordering in Django Admin dashboard
_original_get_app_list = admin.site.get_app_list


def _custom_get_app_list(request, app_label=None):
    app_list = _original_get_app_list(request, app_label)
    if app_label:
        return app_list

    MODEL_ORDER = [
        'User',
        'Role',
        'Customer',
        'CustomerTier',
        'Quotation',
        'QuotationItem',
        'Product',
        'ProductCategory',
        'ProductVariant',
        'ApprovalRequest',
        'DealHealthAlert',
        'RecommendationRule',
        'DiscountTierRule',
        'SubscriptionPlan',
    ]

    all_models = {}
    for app in app_list:
        for model in app['models']:
            all_models[model['object_name']] = model

    sorted_models = [all_models[k] for k in MODEL_ORDER if k in all_models]
    for k, v in all_models.items():
        if k not in MODEL_ORDER:
            sorted_models.append(v)

    if not sorted_models:
        return app_list

    return [
        {
            'name': 'DealFlow360 Management',
            'app_label': 'dealflow360',
            'app_url': '',
            'has_module_perms': True,
            'models': sorted_models,
        }
    ]


admin.site.get_app_list = _custom_get_app_list


try:
    from drf_spectacular.views import (
        SpectacularAPIView,
        SpectacularRedocView,
        SpectacularSwaggerView,
    )
    HAS_SPECTACULAR = True
except ImportError:
    HAS_SPECTACULAR = False


def api_root(request):
    """Interactive root endpoint listing all available documentation and API endpoints."""
    doc_links = {
        'django_admin_portal': 'http://127.0.0.1:8000/admin/',
    }
    if HAS_SPECTACULAR:
        doc_links.update({
            'swagger_interactive_ui': 'http://127.0.0.1:8000/docs/',
            'swagger_ui_alt': 'http://127.0.0.1:8000/api/docs/',
            'redoc_interactive_docs': 'http://127.0.0.1:8000/redoc/',
            'openapi_schema_json': 'http://127.0.0.1:8000/api/schema/',
        })

    return JsonResponse({
        'project': 'DealFlow360 Enterprise ERP & CPQ API',
        'status': 'online',
        'version': '1.0.0',
        'total_api_operations': 87,
        'documentation_links': doc_links,
        'api_endpoints': {
            'authentication': {
                'login': '/api/auth/login/',
                'register': '/api/auth/register/',
                'me': '/api/auth/me/',
                'token_refresh': '/api/auth/token/refresh/',
                'logout': '/api/auth/logout/',
            },
            'cpq_and_deals': {
                'quotations': '/api/quotations/',
                'quotation_items': '/api/quotation-items/',
                'approval_requests': '/api/approval-requests/',
                'deal_health_alerts': '/api/deal-health-alerts/',
            },
            'catalog_and_governance': {
                'products': '/api/products/',
                'variants': '/api/variants/',
                'categories': '/api/categories/',
                'customer_tiers': '/api/customer-tiers/',
                'customers': '/api/customers/',
                'recommendation_rules': '/api/recommendation-rules/',
                'discount_tier_rules': '/api/discount-tier-rules/',
                'subscription_plans': '/api/subscription-plans/',
            },
        },
        'frontend_dashboard_url': 'http://localhost:5173/',
    })


urlpatterns = [
    # API Root & Admin
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),

    # App APIs
    path('api/auth/', include('authentication.urls')),
    path('api/', include('deals.urls')),
]

if HAS_SPECTACULAR:
    urlpatterns = [
        path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui-alt'),
        path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    ] + urlpatterns
