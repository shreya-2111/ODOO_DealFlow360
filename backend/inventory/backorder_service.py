from django.db import transaction

from .models import Inventory, FulfillmentSplit


@transaction.atomic
def consolidate_backorder(
    fulfillment_split_id,
    product_id,
    variant_id,
    quantity,
):
    """
    Fulfill a previously backordered quantity
    when new warehouse stock becomes available.
    """

    if quantity <= 0:
        raise ValueError(
            "Quantity must be greater than 0."
        )

    # Lock the fulfillment split
    split = (
        FulfillmentSplit.objects
        .select_for_update()
        .select_related("warehouse")
        .filter(id=fulfillment_split_id)
        .first()
    )

    if not split:
        raise ValueError(
            "Fulfillment split not found."
        )

    # Make sure there is actually a backorder
    if split.quantity_backordered <= 0:
        raise ValueError(
            "This fulfillment split has no backordered quantity."
        )

    # Don't allow fulfilling more than the backorder
    if quantity > split.quantity_backordered:
        raise ValueError(
            f"Only {split.quantity_backordered} units are backordered."
        )

    # Find matching inventory
    inventory = (
        Inventory.objects
        .select_for_update()
        .filter(
            warehouse=split.warehouse,
            product_id=product_id,
            variant_id=variant_id,
        )
        .first()
    )

    if not inventory:
        raise ValueError(
            "Matching inventory record not found."
        )

    # Check available stock
    available_quantity = (
        inventory.stock_on_hand -
        inventory.stock_reserved
    )

    if quantity > available_quantity:
        raise ValueError(
            f"Only {available_quantity} units are currently available."
        )

    # Reserve the newly available stock
    inventory.stock_reserved += quantity

    inventory.save(
        update_fields=["stock_reserved"]
    )

    # Move quantity from backorder → fulfilled
    split.quantity_backordered -= quantity
    split.quantity_fulfilled += quantity

    if split.quantity_backordered == 0:
        split.shipping_status = "RESERVED"

    split.save(
        update_fields=[
            "quantity_backordered",
            "quantity_fulfilled",
            "shipping_status",
        ]
    )

    return split