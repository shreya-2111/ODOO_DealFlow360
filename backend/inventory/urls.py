#from backend.config.urls import urlpatterns
from django.urls import path

from .views import (WarehouseListCreateView,InventoryListCreateView,FulfillmentSplitListCreateView,
AutoFulfillmentView,ManualOverrideFulfillmentView,BackorderConsolidationView)

urlpatterns=[
    path("warehouses/", WarehouseListCreateView.as_view(), name="warehouse-list-create"),
    path("inventory/", InventoryListCreateView.as_view(), name="inventory-list-create"),
    path("fulfillment-splits/", FulfillmentSplitListCreateView.as_view(), name="fulfillment-split-list-create"),
    path("fulfillment/auto/",AutoFulfillmentView.as_view(), name="fulfillment-auto"),
    path("fulfillment/manual/",ManualOverrideFulfillmentView.as_view(), name="fulfillment-manual"),
    path("fulfillment/backorders/consolidate/",BackorderConsolidationView.as_view(),name="backorder-consolidate"),
]