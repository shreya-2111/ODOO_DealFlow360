from django.db import models

# Create your models here.
class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    shipping_cost_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.00
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Inventory(models.Model):
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        db_column="warehouse_id",
        related_name="inventory"
    )

    product_id = models.IntegerField()

    variant_id = models.IntegerField(
        null=True,
        blank=True
    )

    stock_on_hand = models.IntegerField(default=0)

    stock_reserved = models.IntegerField(default=0)

    reorder_threshold = models.IntegerField(default=10)

    class Meta:
        db_table = "warehouse_inventory"
        constraints = [
            models.UniqueConstraint(
                fields=["warehouse", "product_id", "variant_id"],
                name="uq_wh_product_variant"
            )
        ]

    @property
    def available_quantity(self):
        return self.stock_on_hand - self.stock_reserved

    def __str__(self):
        return f"Product {self.product_id} - {self.warehouse.name}"


class FulfillmentSplit(models.Model):

    SPLIT_STRATEGY_CHOICES = [
        ("AUTO_SPLIT", "Auto Split"),
        ("MANUAL_OVERRIDE", "Manual Override"),
    ]
    SHIPPING_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("RESERVED", "Reserved"),
        ("SHIPPED", "Shipped"),
        ("BACKORDERED", "Backordered"),
        ("CONSOLIDATED", "Consolidated"),
    ]

    quotation_id = models.IntegerField()
    quotation_item_id = models.IntegerField()
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        db_column="warehouse_id",
    )

    quantity_fulfilled = models.IntegerField(default=0)

    quantity_backordered = models.IntegerField(default=0)

    split_strategy = models.CharField(
        max_length=16,
        choices=SPLIT_STRATEGY_CHOICES,
        default="AUTO_SPLIT",
    )

    shipping_status = models.CharField(
        max_length=15,
        choices=SHIPPING_STATUS_CHOICES,
        default="PENDING",
    )

    estimated_shipping_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "fulfillment_splits"

    def __str__(self):
        return f"Fulfillment Split {self.id}"