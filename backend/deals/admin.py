from django.contrib import admin
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


@admin.register(CustomerTier)
class CustomerTierAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'discount_percentage', 'created_at']
    search_fields = ['name']
    ordering = ['id']


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'billing_frequency', 'price', 'created_at']
    list_filter = ['billing_frequency']
    search_fields = ['name']
    ordering = ['id']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'company_name',
        'user_email',
        'tier',
        'assigned_sales_rep',
        'created_at',
    ]
    list_filter = ['tier', 'assigned_sales_rep', 'created_at']
    search_fields = [
        'company_name',
        'user__email',
        'user__first_name',
        'user__last_name',
        'billing_address',
        'shipping_address',
    ]
    ordering = ['-created_at']
    autocomplete_fields = ['user', 'assigned_sales_rep']

    @admin.display(description='User Email')
    def user_email(self, obj):
        return obj.user.email if obj.user else '-'


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'max_discretionary_discount']
    search_fields = ['name']
    ordering = ['name']


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['variant_sku', 'attribute_name', 'attribute_value', 'extra_cost', 'extra_price']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'sku',
        'name',
        'category',
        'product_type',
        'cost_price',
        'list_price',
        'tax_rate',
        'is_active',
    ]
    list_filter = ['category', 'product_type', 'is_active']
    search_fields = ['sku', 'name', 'description']
    ordering = ['sku']
    inlines = [ProductVariantInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'variant_sku',
        'product',
        'attribute_name',
        'attribute_value',
        'extra_cost',
        'extra_price',
    ]
    list_filter = ['attribute_name']
    search_fields = ['variant_sku', 'product__name', 'product__sku', 'attribute_name', 'attribute_value']
    ordering = ['variant_sku']
    autocomplete_fields = ['product']


@admin.register(RecommendationRule)
class RecommendationRuleAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'source_product',
        'suggested_product',
        'recommendation_type',
        'priority',
        'is_promoted',
        'min_margin_threshold',
    ]
    list_filter = ['recommendation_type', 'is_promoted']
    search_fields = [
        'source_product__sku',
        'source_product__name',
        'suggested_product__sku',
        'suggested_product__name',
    ]
    ordering = ['-priority', 'id']
    autocomplete_fields = ['source_product', 'suggested_product']


@admin.register(DiscountTierRule)
class DiscountTierRuleAdmin(admin.ModelAdmin):
    list_display = ['id', 'tier', 'category', 'max_allowed_discount']
    list_filter = ['tier', 'category']
    search_fields = ['tier__name', 'category__name']
    ordering = ['tier', 'category']


class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 1
    fields = [
        'product',
        'variant',
        'quantity',
        'unit_price',
        'cost_price',
        'discount_percent',
        'discount_amount',
        'tax_amount',
        'line_total',
        'margin_percent',
        'line_risk_score',
    ]
    readonly_fields = [
        'discount_amount',
        'tax_amount',
        'line_total',
        'margin_percent',
        'line_risk_score',
    ]
    autocomplete_fields = ['product', 'variant']


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'quotation_number',
        'customer',
        'sales_rep',
        'status',
        'total_gross_amount',
        'total_discount_amount',
        'total_net_amount',
        'total_cost',
        'margin_percent',
        'blended_risk_score',
        'order_discount_percent',
        'created_at',
    ]
    list_filter = ['status', 'created_at', 'sales_rep']
    search_fields = [
        'quotation_number',
        'customer__company_name',
        'customer__user__email',
        'sales_rep__email',
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'total_net_amount',
        'margin_percent',
        'blended_risk_score',
        'created_at',
        'last_interaction_at'
    ]
    inlines = [QuotationItemInline]
    autocomplete_fields = ['customer', 'sales_rep']

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.recalculate()


@admin.register(QuotationItem)
class QuotationItemAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'quotation',
        'product',
        'variant',
        'quantity',
        'unit_price',
        'discount_percent',
        'line_total',
        'margin_percent',
        'line_risk_score',
    ]
    readonly_fields = [
        'discount_amount',
        'tax_amount',
        'line_total',
        'margin_amount',
        'margin_percent',
        'line_risk_score',
    ]
    list_filter = ['product__category']
    search_fields = [
        'quotation__quotation_number',
        'product__name',
        'product__sku',
    ]
    ordering = ['id']
    autocomplete_fields = ['quotation', 'product', 'variant']

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        obj.quotation.recalculate()

    def delete_model(self, request, obj):
        quotation = obj.quotation
        super().delete_model(request, obj)
        quotation.recalculate()


@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'quotation',
        'blended_risk_score',
        'status',
        'created_at',
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['quotation__quotation_number']
    ordering = ['-created_at']
    autocomplete_fields = ['quotation']


@admin.register(DealHealthAlert)
class DealHealthAlertAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'quotation',
        'alert_type',
        'severity',
        'is_resolved',
        'resolved_by_user',
        'created_at',
    ]
    list_filter = ['alert_type', 'severity', 'is_resolved', 'created_at']
    search_fields = ['quotation__quotation_number', 'description']
    ordering = ['-created_at']
    autocomplete_fields = ['quotation', 'resolved_by_user']
    actions = ['mark_as_resolved']

    @admin.action(description='Mark selected alerts as resolved')
    def mark_as_resolved(self, request, queryset):
        count = queryset.update(is_resolved=True, resolved_by_user=request.user)
        self.message_user(request, f"{count} alert(s) successfully marked as resolved.")
