from rest_framework import serializers

from .models import SubscriptionPlan, Subscription


class SubscriptionPlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "plan_name",
            "billing_frequency",
            "proration_strategy",
            "cancellation_terms",
        ]


class SubscriptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subscription
        fields = [
            "id",
            "quotation_id",
            "quotation_item_id",
            "customer_id",
            "plan",
            "status",
            "billing_amount",
            "start_date",
            "next_billing_date",
            "end_date",
            "proration_credit",
        ]

        read_only_fields = [
            "id",
            "next_billing_date",
        ]