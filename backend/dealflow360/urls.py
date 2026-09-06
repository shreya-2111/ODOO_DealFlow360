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
        # Authentication & Role RBAC
        'authentication.User',
        'authentication.Role',
        # Core DealFlow CPQ
        'deals.Customer',
        'deals.CustomerTier',
        'deals.Quotation',
        'deals.QuotationItem',
        'deals.Product',
        'deals.ProductCategory',
        'deals.ProductVariant',
        'deals.ApprovalRequest',
        'deals.DealHealthAlert',
        'deals.RecommendationRule',
        'deals.DiscountTierRule',
        'deals.SubscriptionPlan',
        # Billing & Invoicing
        'billing.Invoice',
        'billing.Payment',
        'billing.CreditNote',
        # Warehouse & Inventory
        'inventory.Warehouse',
        'inventory.Inventory',
        'inventory.FulfillmentSplit',
        # Customer Portal
        'portal.PortalNegotiation',
        # Subscriptions & Recurring Contracts
        'subscriptions.SubscriptionPlan',
        'subscriptions.Subscription',
    ]

    all_models = {}
    for app in app_list:
        for model in app['models']:
            qualified_name = f"{app['app_label']}.{model['object_name']}"
            all_models[qualified_name] = model

    sorted_models = []
    seen = set()

    for key in MODEL_ORDER:
        if key in all_models:
            m = all_models[key]
            m_id = id(m)
            if m_id not in seen:
                sorted_models.append(m)
                seen.add(m_id)

    # Any remaining models not explicitly in MODEL_ORDER
    for key, model in all_models.items():
        m_id = id(model)
        if m_id not in seen:
            sorted_models.append(model)
            seen.add(m_id)

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
            'billing_and_invoices': {
                'invoices': '/api/billing/',
                'invoice_create': '/api/billing/create/',
                'calculate': '/api/billing/calculate/',
                'generate': '/api/billing/generate/',
                'payments': '/api/billing/payments/',
                'credit_notes': '/api/billing/credit-notes/',
            },
            'inventory_and_fulfillment': {
                'warehouses': '/api/warehouses/',
                'inventory': '/api/inventory/',
                'fulfillment_splits': '/api/fulfillment-splits/',
                'auto_fulfillment': '/api/fulfillment/auto/',
                'manual_override': '/api/fulfillment/manual/',
                'consolidate_backorders': '/api/fulfillment/backorders/consolidate/',
            },
            'subscriptions_and_lifecycle': {
                'plans': '/api/subscriptions/plans/',
                'subscriptions': '/api/subscriptions/',
                'create': '/api/subscriptions/create/',
                'due_subscriptions': '/api/subscriptions/process-due/',
            },
            'customer_portal': {
                'negotiations': '/api/portal/negotiations/',
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
    path('api/', include('inventory.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/portal/', include('portal.urls')),
]

if HAS_SPECTACULAR:
    urlpatterns = [
        path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui-alt'),
        path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    ] + urlpatterns
