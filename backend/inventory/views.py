# Create your views here.
from rest_framework import generics
from .models import Warehouse, Inventory, FulfillmentSplit
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .fulfillmentService import auto_split_fulfillment
from .manual_override_service import manual_override_fulfillment
from .backorder_service import consolidate_backorder

from .serializers import (
    WarehouseSerializer,
    InventorySerializer,
    FulfillmentSplitSerializer,
)


class WarehouseListCreateView(generics.ListCreateAPIView):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer


class InventoryListCreateView(generics.ListCreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer


class FulfillmentSplitListCreateView(generics.ListCreateAPIView):
    queryset = FulfillmentSplit.objects.all()
    serializer_class = FulfillmentSplitSerializer

class AutoFulfillmentView(APIView):

    def post(self, request):

        quotation_id = request.data.get("quotation_id")
        quotation_item_id = request.data.get("quotation_item_id")
        product_id = request.data.get("product_id")
        variant_id = request.data.get("variant_id")
        requested_quantity = request.data.get("requested_quantity")

        if not all([
            quotation_id,
            quotation_item_id,
            product_id,
            requested_quantity
        ]):
            return Response(
                {"error": "Required fields are missing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            splits = auto_split_fulfillment(
                quotation_id=quotation_id,
                quotation_item_id=quotation_item_id,
                product_id=product_id,
                variant_id=variant_id,
                requested_quantity=int(requested_quantity),
            )

            result = []

            for split in splits:
                result.append({
                    "id": split.id,
                    "warehouse_id": split.warehouse.id,
                    "warehouse_name": split.warehouse.name,
                    "quantity_fulfilled": split.quantity_fulfilled,
                    "quantity_backordered": split.quantity_backordered,
                    "shipping_status": split.shipping_status,
                    "estimated_shipping_cost": str(
                        split.estimated_shipping_cost
                    ),
                })

            return Response(
                {
                    "message": "Auto fulfillment completed.",
                    "splits": result
                },
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ManualOverrideFulfillmentView(APIView):

    def post(self, request):

        quotation_id = request.data.get("quotation_id")
        quotation_item_id = request.data.get("quotation_item_id")
        product_id = request.data.get("product_id")
        variant_id = request.data.get("variant_id")
        warehouse_allocations = request.data.get(
            "warehouse_allocations"
        )

        if not all([
            quotation_id,
            quotation_item_id,
            product_id,
            warehouse_allocations
        ]):
            return Response(
                {"error": "Required fields are missing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            splits = manual_override_fulfillment(
                quotation_id=quotation_id,
                quotation_item_id=quotation_item_id,
                product_id=product_id,
                variant_id=variant_id,
                warehouse_allocations=warehouse_allocations,
            )

            result = []

            for split in splits:

                result.append({
                    "id": split.id,
                    "warehouse_id": split.warehouse.id,
                    "warehouse_name": split.warehouse.name,
                    "quantity_fulfilled": split.quantity_fulfilled,
                    "quantity_backordered": split.quantity_backordered,
                    "split_strategy": split.split_strategy,
                    "shipping_status": split.shipping_status,
                    "estimated_shipping_cost": str(
                        split.estimated_shipping_cost
                    ),
                })

            return Response(
                {
                    "message": "Manual warehouse override completed.",
                    "splits": result
                },
                status=status.HTTP_200_OK
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class BackorderConsolidationView(APIView):

    def post(self, request):

        fulfillment_split_id = request.data.get(
            "fulfillment_split_id"
        )
        product_id = request.data.get("product_id")
        variant_id = request.data.get("variant_id")
        quantity = request.data.get("quantity")

        if not all([
            fulfillment_split_id,
            product_id,
            quantity
        ]):
            return Response(
                {"error": "Required fields are missing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            split = consolidate_backorder(
                fulfillment_split_id=int(
                    fulfillment_split_id
                ),
                product_id=int(product_id),
                variant_id=(
                    int(variant_id)
                    if variant_id is not None
                    else None
                ),
                quantity=int(quantity),
            )

            return Response(
                {
                    "message": "Backorder consolidated successfully.",
                    "split": {
                        "id": split.id,
                        "warehouse_id": split.warehouse.id,
                        "warehouse_name": split.warehouse.name,
                        "quantity_fulfilled": split.quantity_fulfilled,
                        "quantity_backordered": split.quantity_backordered,
                        "shipping_status": split.shipping_status,
                    }
                },
                status=status.HTTP_200_OK
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )