from django.contrib import admin
from .models import Inventory,Warehouse,FulfillmentSplit

# Register your models here.
@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ("id","name","location","shipping_cost_weight","is_active",)
    list_filter = ("is_active",)
    search_fields = ("name", "location")

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "warehouse",
        "product_id",
        "variant_id",
        "stock_on_hand",
        "stock_reserved",
        "available_quantity",
        "reorder_threshold",
    )

    list_filter = ("warehouse",)
@admin.register(FulfillmentSplit)
class FulfillmentSplitAdmin(admin.ModelAdmin):
    list_display = (
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
    )
    list_filter = ("warehouse", "shipping_status", "split_strategy")
    search_fields = ("quotation_id","quotation_item_id")