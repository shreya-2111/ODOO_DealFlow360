from datetime import date, timedelta
from decimal import Decimal

from django.db import transaction

from .models import Invoice
from .billing_calculation_service import calculate_billing


@transaction.atomic
def generate_invoice_from_billing(
    quotation_id,
    customer_id,
    invoice_number,
    due_date,
    lines,
):
    """
    Calculate quotation billing and create an invoice
    for the one-time portion.

    Recurring charges are returned separately and are
    handled by the subscription billing cycle.
    """

    billing = calculate_billing(lines)

    one_time = billing["one_time"]
    recurring = billing["recurring"]

    # Make sure there is something to invoice
    if one_time["total"] <= Decimal("0.00"):
        invoice = None
    else:
        invoice = Invoice.objects.create(
            quotation_id=quotation_id,
            customer_id=customer_id,
            invoice_number=invoice_number,
            subtotal=one_time["subtotal"],
            tax_total=one_time["tax"],
            grand_total=one_time["total"],
            payment_status="UNPAID",
            due_date=due_date,
        )

    return {
        "invoice": invoice,
        "recurring": recurring,
    }