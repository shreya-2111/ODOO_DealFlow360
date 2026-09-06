from decimal import Decimal
from django.db import transaction
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import generics 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from authentication.permissions import IsAdmin, IsInternalUser, IsSalesManager, IsSalesRep
from .models import (
    ApprovalRequest,
    Customer,
    CustomerTier,
    DealHealthAlert,
    DiscountTierRule,
    Product,
    ProductCategory,
    ProductVariant,
    Quotation,
    QuotationItem,
    RecommendationRule,
    SubscriptionPlan,
)
from .serializers import (
    ApprovalRequestSerializer,
    CustomerSerializer,
    CustomerTierSerializer,
    DealHealthAlertSerializer,
    DiscountTierRuleSerializer,
    ProductCategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
    QuotationItemSerializer,
    QuotationSerializer,
    RecommendationRuleSerializer,
    SubscriptionPlanSerializer,
)


def recalculate_quotation(quotation):
    """Recalculates totals, margins and blended risk score for a quotation."""
    items = quotation.items.select_related('product').all()
    gross = Decimal('0.00')
    disc = Decimal('0.00')
    net = Decimal('0.00')
    cost = Decimal('0.00')
    risk_sum = Decimal('0.00')
    count = 0

    for it in items:
        gross += Decimal(str(it.unit_price)) * Decimal(str(it.quantity))
        disc += Decimal(str(it.discount_amount))
        net += Decimal(str(it.line_total))
        cost += Decimal(str(it.cost_price)) * Decimal(str(it.quantity))
        risk_sum += Decimal(str(it.line_risk_score))
        count += 1

    quotation.total_gross_amount = gross.quantize(Decimal('0.01'))
    quotation.total_discount_amount = disc.quantize(Decimal('0.01'))
    quotation.total_net_amount = net.quantize(Decimal('0.01'))
    quotation.total_cost = cost.quantize(Decimal('0.01'))

    if net > 0:
        margin = ((net - cost) / net) * Decimal('100')
        quotation.margin_percent = margin.quantize(Decimal('0.01'))
    else:
        quotation.margin_percent = Decimal('0.00')

    quotation.blended_risk_score = (risk_sum / Decimal(str(count))).quantize(Decimal('0.01')) if count > 0 else Decimal('0.00')
    quotation.save()


class CustomerTierViewSet(viewsets.ModelViewSet):
    queryset = CustomerTier.objects.all()
    serializer_class = CustomerTierSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['id', 'name', 'created_at']


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['id', 'name', 'price']


class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['id', 'name']


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.select_related('product').all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['variant_sku', 'attribute_name', 'attribute_value', 'product__name', 'product__sku']
    ordering_fields = ['id', 'variant_sku', 'extra_price']

    def get_queryset(self):
        qs = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            qs = qs.filter(product_id=product_id)
        return qs


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'subscription_plan').prefetch_related('variants').all()
    serializer_class = ProductSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['sku', 'name', 'description', 'category__name']
    ordering_fields = ['id', 'sku', 'name', 'list_price', 'cost_price']

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        product_type = self.request.query_params.get('product_type')
        if product_type:
            qs = qs.filter(product_type=product_type)
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ('true', '1'))
        return qs

    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        product = self.get_object()
        serializer = ProductVariantSerializer(product.variants.all(), many=True)
        return Response(serializer.data)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.select_related('user', 'tier', 'assigned_sales_rep').all()
    serializer_class = CustomerSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['company_name', 'user__email', 'user__first_name', 'user__last_name', 'billing_address', 'shipping_address']
    ordering_fields = ['id', 'company_name', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        tier = self.request.query_params.get('tier')
        if tier:
            qs = qs.filter(tier_id=tier)
        sales_rep = self.request.query_params.get('sales_rep')
        if sales_rep:
            qs = qs.filter(assigned_sales_rep_id=sales_rep)
        return qs

    @action(detail=True, methods=['get'])
    def quotations(self, request, pk=None):
        customer = self.get_object()
        serializer = QuotationSerializer(customer.quotations.all(), many=True)
        return Response(serializer.data)


class RecommendationRuleViewSet(viewsets.ModelViewSet):
    queryset = RecommendationRule.objects.select_related('source_product', 'suggested_product').all()
    serializer_class = RecommendationRuleSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['source_product__sku', 'source_product__name', 'suggested_product__sku', 'suggested_product__name']
    ordering_fields = ['priority', 'id']

    def get_queryset(self):
        qs = super().get_queryset()
        source_id = self.request.query_params.get('source_product')
        if source_id:
            qs = qs.filter(source_product_id=source_id)
        recom_type = self.request.query_params.get('type')
        if recom_type:
            qs = qs.filter(recommendation_type=recom_type.upper())
        return qs


class DiscountTierRuleViewSet(viewsets.ModelViewSet):
    queryset = DiscountTierRule.objects.select_related('tier', 'category').all()
    serializer_class = DiscountTierRuleSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['tier', 'category', 'max_allowed_discount']

    def get_queryset(self):
        qs = super().get_queryset()
        tier = self.request.query_params.get('tier')
        if tier:
            qs = qs.filter(tier_id=tier)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        return qs


class QuotationItemViewSet(viewsets.ModelViewSet):
    queryset = QuotationItem.objects.select_related('quotation', 'product', 'variant', 'subscription_plan').all()
    serializer_class = QuotationItemSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'product__sku', 'quotation__quotation_number']
    ordering_fields = ['id', 'quantity', 'unit_price', 'line_total']

    def get_queryset(self):
        qs = super().get_queryset()
        quotation_id = self.request.query_params.get('quotation')
        if quotation_id:
            qs = qs.filter(quotation_id=quotation_id)
        return qs

    def perform_create(self, serializer):
        item = serializer.save()
        recalculate_quotation(item.quotation)

    def perform_update(self, serializer):
        item = serializer.save()
        recalculate_quotation(item.quotation)

    def perform_destroy(self, instance):
        quotation = instance.quotation
        instance.delete()
        recalculate_quotation(quotation)


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.select_related('customer', 'sales_rep').prefetch_related('items__product').all()
    serializer_class = QuotationSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['quotation_number', 'customer__company_name', 'customer__user__email', 'sales_rep__email']
    ordering_fields = ['id', 'created_at', 'total_net_amount', 'margin_percent']

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param.upper())
        customer_id = self.request.query_params.get('customer')
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        sales_rep_id = self.request.query_params.get('sales_rep')
        if sales_rep_id:
            qs = qs.filter(sales_rep_id=sales_rep_id)
        return qs

    def perform_create(self, serializer):
        sales_rep = serializer.validated_data.get('sales_rep')
        if not sales_rep:
            sales_rep = self.request.user
        serializer.save(sales_rep=sales_rep)

    @action(detail=True, methods=['post'], url_path='submit-approval')
    def submit_approval(self, request, pk=None):
        quotation = self.get_object()
        recalculate_quotation(quotation)

        with transaction.atomic():
            quotation.status = Quotation.Status.PENDING_APPROVAL
            quotation.save()

            approval = ApprovalRequest.objects.create(
                quotation=quotation,
                blended_risk_score=quotation.blended_risk_score,
                status=ApprovalRequest.Status.PENDING
            )

        return Response({
            'message': f"Quotation {quotation.quotation_number} submitted for approval.",
            'quotation_status': quotation.status,
            'approval_request_id': approval.id,
            'blended_risk_score': str(quotation.blended_risk_score)
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        # Must be sales manager or admin
        user = request.user
        role_name = (user.role.role_name if user.role else '').lower()
        if not (user.is_superuser or user.is_staff or role_name in ('sales manager', 'admin')):
            return Response({'error': 'Only Sales Managers or Admins can approve quotations.'}, status=status.HTTP_403_FORBIDDEN)

        quotation = self.get_object()
        quotation.status = Quotation.Status.APPROVED
        quotation.save()

        # Update latest approval request if exists
        approval = quotation.approval_requests.order_by('-created_at').first()
        if approval:
            approval.status = ApprovalRequest.Status.APPROVED
            approval.save()

        return Response({
            'message': f"Quotation {quotation.quotation_number} approved successfully.",
            'quotation_status': quotation.status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        quotation = self.get_object()
        quotation.status = Quotation.Status.REJECTED
        quotation.save()

        approval = quotation.approval_requests.order_by('-created_at').first()
        if approval:
            approval.status = ApprovalRequest.Status.REJECTED
            approval.save()

        return Response({
            'message': f"Quotation {quotation.quotation_number} has been rejected.",
            'quotation_status': quotation.status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='recalculate')
    def recalculate(self, request, pk=None):
        quotation = self.get_object()
        recalculate_quotation(quotation)
        serializer = self.get_serializer(quotation)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ApprovalRequestViewSet(viewsets.ModelViewSet):
    queryset = ApprovalRequest.objects.select_related('quotation__customer', 'quotation__sales_rep').all()
    serializer_class = ApprovalRequestSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['quotation__quotation_number', 'quotation__customer__company_name']
    ordering_fields = ['id', 'created_at', 'blended_risk_score', 'status']

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param.upper())
        return qs

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        user = request.user
        role_name = (user.role.role_name if user.role else '').lower()
        if not (user.is_superuser or user.is_staff or role_name in ('sales manager', 'admin')):
            return Response({'error': 'Only Sales Managers or Admins can approve.'}, status=status.HTTP_403_FORBIDDEN)

        approval = self.get_object()
        approval.status = ApprovalRequest.Status.APPROVED
        approval.save()

        quotation = approval.quotation
        quotation.status = Quotation.Status.APPROVED
        quotation.save()

        return Response({
            'message': f"Approval request {approval.id} approved. Quotation {quotation.quotation_number} is now APPROVED.",
            'status': approval.status
        })

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        approval = self.get_object()
        approval.status = ApprovalRequest.Status.REJECTED
        approval.save()

        quotation = approval.quotation
        quotation.status = Quotation.Status.REJECTED
        quotation.save()

        return Response({
            'message': f"Approval request {approval.id} rejected. Quotation {quotation.quotation_number} is now REJECTED.",
            'status': approval.status
        })

    @action(detail=True, methods=['post'], url_path='return')
    def return_deal(self, request, pk=None):
        approval = self.get_object()
        approval.status = ApprovalRequest.Status.RETURNED
        approval.save()

        quotation = approval.quotation
        quotation.status = Quotation.Status.UNDER_NEGOTIATION
        quotation.save()

        return Response({
            'message': f"Approval request {approval.id} returned. Quotation {quotation.quotation_number} status is UNDER_NEGOTIATION.",
            'status': approval.status
        })


class DealHealthAlertViewSet(viewsets.ModelViewSet):
    queryset = DealHealthAlert.objects.select_related('quotation', 'resolved_by_user').all()
    serializer_class = DealHealthAlertSerializer
    permission_classes = [IsInternalUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['quotation__quotation_number', 'description']
    ordering_fields = ['id', 'created_at', 'severity']

    def get_queryset(self):
        qs = super().get_queryset()
        severity = self.request.query_params.get('severity')
        if severity:
            qs = qs.filter(severity=severity.upper())
        alert_type = self.request.query_params.get('alert_type')
        if alert_type:
            qs = qs.filter(alert_type=alert_type.upper())
        is_resolved = self.request.query_params.get('is_resolved')
        if is_resolved is not None:
            qs = qs.filter(is_resolved=is_resolved.lower() in ('true', '1'))
        return qs

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        alert = self.get_object()
        alert.is_resolved = True
        alert.resolved_by_user = request.user
        alert.save()
        return Response({
            'message': f"Alert {alert.id} resolved successfully by {request.user.full_name}.",
            'is_resolved': alert.is_resolved
        })
