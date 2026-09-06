from rest_framework import serializers

from .models import Warehouse, Inventory, FulfillmentSplit


class WarehouseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Warehouse
        fields = [
            "id",
            "name",
            "location",
            "shipping_cost_weight",
            "is_active",
        ]


class InventorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Inventory
        fields = [
            "id",
            "warehouse",
            "product_id",
            "variant_id",
            "stock_on_hand",
            "stock_reserved",
            "reorder_threshold",
            "available_quantity",
        ]

        read_only_fields = ["available_quantity"]


class FulfillmentSplitSerializer(serializers.ModelSerializer):

    class Meta:
        model = FulfillmentSplit
        fields = [
            "id",
            "quotation_id",
            "quotation_item_id",
            "warehouse",
            "quantity_fulfilled",
            "quantity_backordered",
            "split_strategy",
            "shipping_status",
            "estimated_shipping_cost",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]
    