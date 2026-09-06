from django.db import transaction
from .models import Warehouse,Inventory,FulfillmentSplit

@transaction.atomic
def auto_split_fulfillment(
    quotation_id,
    quotation_item_id,
    product_id,
    variant_id,
    requested_quantity,
):
    """
    Automatically split a quotation item's quantity
    across available warehouses.
    """

    if requested_quantity <= 0:
        raise ValueError("Requested quantity must be greater than 0.")

    # Find active warehouses with inventory for this product
    inventory_records = Inventory.objects.select_for_update().filter(
        product_id=product_id,
        variant_id=variant_id,
        warehouse__is_active=True,
    ).select_related("warehouse").order_by(
        "warehouse__shipping_cost_weight"
    )

    remaining_quantity = requested_quantity
    splits = []

    for inventory in inventory_records:

        if remaining_quantity <= 0:
            break

        available_quantity = (
            inventory.stock_on_hand - inventory.stock_reserved
        )

        if available_quantity <= 0:
            continue

        quantity_to_fulfill = min(
            available_quantity,
            remaining_quantity
        )

        inventory.stock_reserved += quantity_to_fulfill
        inventory.save(update_fields=["stock_reserved"])

        split = FulfillmentSplit.objects.create(
            quotation_id=quotation_id,
            quotation_item_id=quotation_item_id,
            warehouse=inventory.warehouse,
            quantity_fulfilled=quantity_to_fulfill,
            quantity_backordered=0,
            split_strategy="AUTO_SPLIT",
            shipping_status="RESERVED",
            estimated_shipping_cost=(
                inventory.warehouse.shipping_cost_weight
                * quantity_to_fulfill
            ),
        )

        splits.append(split)

        remaining_quantity -= quantity_to_fulfill

    # If there is not enough stock,
    # record the remaining quantity as backordered.
    if remaining_quantity > 0:

        if splits:
            # Add the backorder to the last split.
            last_split = splits[-1]

            last_split.quantity_backordered = remaining_quantity
            last_split.shipping_status = "BACKORDERED"
            last_split.save(
                update_fields=[
                    "quantity_backordered",
                    "shipping_status",
                ]
            )

        else:
            # No warehouse has stock.
            # Create a backorder record against the first
            # suitable warehouse if one exists.
            first_inventory = inventory_records.first()

            if first_inventory:
                split = FulfillmentSplit.objects.create(
                    quotation_id=quotation_id,
                    quotation_item_id=quotation_item_id,
                    warehouse=first_inventory.warehouse,
                    quantity_fulfilled=0,
                    quantity_backordered=remaining_quantity,
                    split_strategy="AUTO_SPLIT",
                    shipping_status="BACKORDERED",
                    estimated_shipping_cost=0,
                )

                splits.append(split)

    return splits