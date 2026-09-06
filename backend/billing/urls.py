from django.urls import path

from .views import (
    InvoiceListView,
    InvoiceCreateView,
    BillingCalculationView,
    InvoiceGenerationView,
    PaymentCreateView,
    CreditNoteCreateView
)


urlpatterns = [

    path(
        "",
        InvoiceListView.as_view(),
        name="invoice-list",
    ),

    path(
        "create/",
        InvoiceCreateView.as_view(),
        name="invoice-create",
    ),
    path(
        "calculate/",
        BillingCalculationView.as_view(),
        name="billing-calculate",
    ),
    path(
        "generate/",
        InvoiceGenerationView.as_view(),
        name="invoice-generate",
    ),
    path(
    "payments/",
    PaymentCreateView.as_view(),
    name="payment-create",
    ),

    path(
        "credit-notes/",
        CreditNoteCreateView.as_view(),
        name="credit-not    e-create",
    ),

]