from rest_framework import serializers
from .models import PortalNegotiation


class PortalNegotiationSerializer(serializers.ModelSerializer):

    class Meta:
        model = PortalNegotiation
        fields = [
            "id",
            "quotation_id",
            "customer_id",
            "requested_discount_percent",
            "requested_total",
            "customer_comment",
            "sales_comment",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "sales_comment",
            "created_at",
            "updated_at",
        ]