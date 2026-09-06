from django.db import transaction

from .models import Inventory, FulfillmentSplit


@transaction.atomic
def manual_override_fulfillment(
    quotation_id,
    quotation_item_id,
    product_id,
    variant_id,
    warehouse_allocations,
):
    """
    warehouse_allocations example:

    [
        {
            "warehouse_id": 1,
            "quantity": 80
        },
        {
            "warehouse_id": 2,
            "quantity": 40
        }
    ]
    """

    if not warehouse_allocations:
        raise ValueError("Warehouse allocations are required.")

    total_requested = 0
    splits = []

    for allocation in warehouse_allocations:

        warehouse_id = allocation.get("warehouse_id")
        quantity = allocation.get("quantity")

        if not warehouse_id or quantity is None:
            raise ValueError(
                "Each allocation must contain warehouse_id and quantity."
            )

        quantity = int(quantity)

        if quantity <= 0:
            raise ValueError(
                "Warehouse quantity must be greater than 0."
            )

        inventory = (
            Inventory.objects
            .select_for_update()
            .filter(
                warehouse_id=warehouse_id,
                product_id=product_id,
                variant_id=variant_id,
                warehouse__is_active=True,
            )
            .first()
        )

        if not inventory:
            raise ValueError(
                f"No inventory found for warehouse {warehouse_id}."
            )

        available_quantity = (
            inventory.stock_on_hand -
            inventory.stock_reserved
        )

        if quantity > available_quantity:
            raise ValueError(
                f"Warehouse {warehouse_id} has only "
                f"{available_quantity} units available."
            )

        inventory.stock_reserved += quantity

        inventory.save(
            update_fields=["stock_reserved"]
        )

        shipping_cost = (
            inventory.warehouse.shipping_cost_weight
            * quantity
        )

        split = FulfillmentSplit.objects.create(
            quotation_id=quotation_id,
            quotation_item_id=quotation_item_id,
            warehouse=inventory.warehouse,
            quantity_fulfilled=quantity,
            quantity_backordered=0,
            split_strategy="MANUAL_OVERRIDE",
            shipping_status="RESERVED",
            estimated_shipping_cost=shipping_cost,
        )

        splits.append(split)
        total_requested += quantity

    return splits