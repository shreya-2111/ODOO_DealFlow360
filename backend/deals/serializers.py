from decimal import Decimal
from rest_framework import serializers

from authentication.serializers import UserSerializer
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


class CustomerTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerTier
        fields = ['id', 'name', 'discount_percentage', 'created_at']
        read_only_fields = ['id', 'created_at']


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'billing_frequency', 'price', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'max_discretionary_discount']
        read_only_fields = ['id']


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product',
            'product_name',
            'product_sku',
            'variant_sku',
            'attribute_name',
            'attribute_value',
            'extra_cost',
            'extra_price',
        ]
        read_only_fields = ['id']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    subscription_plan_name = serializers.CharField(source='subscription_plan.name', read_only=True, allow_null=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'category',
            'category_name',
            'subscription_plan',
            'subscription_plan_name',
            'sku',
            'name',
            'description',
            'product_type',
            'unit_of_measure',
            'cost_price',
            'list_price',
            'tax_rate',
            'is_active',
            'variants',
        ]
        read_only_fields = ['id']


class CustomerSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    tier_name = serializers.CharField(source='tier.name', read_only=True)
    sales_rep_name = serializers.CharField(source='assigned_sales_rep.full_name', read_only=True, allow_null=True)
    sales_rep_email = serializers.EmailField(source='assigned_sales_rep.email', read_only=True, allow_null=True)

    class Meta:
        model = Customer
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'tier',
            'tier_name',
            'assigned_sales_rep',
            'sales_rep_name',
            'sales_rep_email',
            'company_name',
            'billing_address',
            'shipping_address',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RecommendationRuleSerializer(serializers.ModelSerializer):
    source_sku = serializers.CharField(source='source_product.sku', read_only=True)
    source_name = serializers.CharField(source='source_product.name', read_only=True)
    suggested_sku = serializers.CharField(source='suggested_product.sku', read_only=True)
    suggested_name = serializers.CharField(source='suggested_product.name', read_only=True)

    class Meta:
        model = RecommendationRule
        fields = [
            'id',
            'source_product',
            'source_sku',
            'source_name',
            'suggested_product',
            'suggested_sku',
            'suggested_name',
            'recommendation_type',
            'priority',
            'is_promoted',
            'min_margin_threshold',
        ]
        read_only_fields = ['id']


class DiscountTierRuleSerializer(serializers.ModelSerializer):
    tier_name = serializers.CharField(source='tier.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = DiscountTierRule
        fields = [
            'id',
            'tier',
            'tier_name',
            'category',
            'category_name',
            'max_allowed_discount',
        ]
        read_only_fields = ['id']


class QuotationItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_sku = serializers.CharField(source='variant.variant_sku', read_only=True, allow_null=True)

    class Meta:
        model = QuotationItem
        fields = [
            'id',
            'quotation',
            'product',
            'product_sku',
            'product_name',
            'variant',
            'variant_sku',
            'subscription_plan',
            'quantity',
            'unit_price',
            'cost_price',
            'discount_percent',
            'discount_amount',
            'tax_amount',
            'line_total',
            'margin_amount',
            'margin_percent',
            'line_risk_score',
        ]
        read_only_fields = [
            'id',
            'discount_amount',
            'tax_amount',
            'line_total',
            'margin_amount',
            'margin_percent',
        ]

    def validate(self, attrs):
        quantity = attrs.get('quantity', 1)
        unit_price = attrs.get('unit_price')
        cost_price = attrs.get('cost_price')
        product = attrs.get('product')

        if unit_price is None and product:
            unit_price = product.list_price
            attrs['unit_price'] = unit_price

        if cost_price is None and product:
            cost_price = product.cost_price
            attrs['cost_price'] = cost_price

        discount_percent = attrs.get('discount_percent', Decimal('0.00'))
        tax_rate = product.tax_rate if product else Decimal('0.00')

        gross = Decimal(str(unit_price)) * Decimal(str(quantity))
        disc_amt = gross * (Decimal(str(discount_percent)) / Decimal('100'))
        net_after_disc = gross - disc_amt
        tax_amt = net_after_disc * (Decimal(str(tax_rate)) / Decimal('100'))
        line_tot = net_after_disc + tax_amt

        cost_tot = Decimal(str(cost_price)) * Decimal(str(quantity))
        margin_amt = net_after_disc - cost_tot
        if net_after_disc > Decimal('0.00'):
            raw_margin_pct = (margin_amt / net_after_disc) * Decimal('100')
            margin_pct = max(Decimal('-100.00'), min(Decimal('100.00'), raw_margin_pct))
        elif cost_tot > Decimal('0.00'):
            margin_pct = Decimal('-100.00')
        else:
            margin_pct = Decimal('0.00')

        attrs['discount_amount'] = disc_amt.quantize(Decimal('0.01'))
        attrs['tax_amount'] = tax_amt.quantize(Decimal('0.01'))
        attrs['line_total'] = line_tot.quantize(Decimal('0.01'))
        attrs['margin_amount'] = margin_amt.quantize(Decimal('0.01'))
        attrs['margin_percent'] = margin_pct.quantize(Decimal('0.01'))

        return attrs


class QuotationSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.company_name', read_only=True)
    sales_rep_name = serializers.CharField(source='sales_rep.full_name', read_only=True)
    sales_rep_email = serializers.EmailField(source='sales_rep.email', read_only=True)
    items = QuotationItemSerializer(many=True, read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id',
            'customer',
            'customer_name',
            'sales_rep',
            'sales_rep_name',
            'sales_rep_email',
            'quotation_number',
            'status',
            'total_gross_amount',
            'total_discount_amount',
            'total_net_amount',
            'total_cost',
            'margin_percent',
            'blended_risk_score',
            'order_discount_percent',
            'items',
            'last_interaction_at',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'sales_rep',
            'total_gross_amount',
            'total_discount_amount',
            'total_net_amount',
            'total_cost',
            'margin_percent',
            'last_interaction_at',
            'created_at',
        ]


class ApprovalRequestSerializer(serializers.ModelSerializer):
    quotation_number = serializers.CharField(source='quotation.quotation_number', read_only=True)
    customer_company = serializers.CharField(source='quotation.customer.company_name', read_only=True)
    sales_rep_name = serializers.CharField(source='quotation.sales_rep.full_name', read_only=True)

    class Meta:
        model = ApprovalRequest
        fields = [
            'id',
            'quotation',
            'quotation_number',
            'customer_company',
            'sales_rep_name',
            'blended_risk_score',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class DealHealthAlertSerializer(serializers.ModelSerializer):
    quotation_number = serializers.CharField(source='quotation.quotation_number', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by_user.full_name', read_only=True, allow_null=True)

    class Meta:
        model = DealHealthAlert
        fields = [
            'id',
            'quotation',
            'quotation_number',
            'resolved_by_user',
            'resolved_by_name',
            'alert_type',
            'severity',
            'description',
            'is_resolved',
            'created_at',
        ]
        read_only_fields = ['id', 'resolved_by_user', 'created_at']
