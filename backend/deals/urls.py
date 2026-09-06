from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ApprovalRequestViewSet,
    CustomerTierViewSet,
    CustomerViewSet,
    DealHealthAlertViewSet,
    DiscountTierRuleViewSet,
    ProductCategoryViewSet,
    ProductVariantViewSet,
    ProductViewSet,
    QuotationItemViewSet,
    QuotationViewSet,
    RecommendationRuleViewSet,
    SubscriptionPlanViewSet,
)

app_name = 'deals'

router = DefaultRouter()
router.register(r'customer-tiers', CustomerTierViewSet, basename='customer-tier')
router.register(r'subscription-plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register(r'categories', ProductCategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'variants', ProductVariantViewSet, basename='variant')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'recommendation-rules', RecommendationRuleViewSet, basename='recommendation-rule')
router.register(r'discount-tier-rules', DiscountTierRuleViewSet, basename='discount-tier-rule')
router.register(r'quotations', QuotationViewSet, basename='quotation')
router.register(r'quotation-items', QuotationItemViewSet, basename='quotation-item')
router.register(r'approval-requests', ApprovalRequestViewSet, basename='approval-request')
router.register(r'deal-health-alerts', DealHealthAlertViewSet, basename='deal-health-alert')

urlpatterns = [
    path('', include(router.urls)),
]
