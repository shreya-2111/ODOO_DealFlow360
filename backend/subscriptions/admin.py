from django.contrib import admin

# Register your models here.
from .models import SubscriptionPlan,Subscription


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "plan_name",
        "billing_frequency",
        "proration_strategy",
    )

    list_filter = (
        "billing_frequency",
        "proration_strategy",
    )

    search_fields = (
        "plan_name",
    )

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "quotation_id",
        "quotation_item_id",
        "customer_id",
        "plan",
        "status",
        "billing_amount",
        "start_date",
        "next_billing_date",
    )

    list_filter = (
        "status",
        "plan",
    )

    search_fields = (
        "quotation_id",
        "quotation_item_id",
        "customer_id",
    )