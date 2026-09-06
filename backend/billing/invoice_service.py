from decimal import Decimal

from django.db import transaction

from .models import Invoice


@transaction.atomic
def create_invoice(
    quotation_id,
    customer_id,
    invoice_number,
    subtotal,
    tax_total,
    due_date,
):

    subtotal = Decimal(str(subtotal))
    tax_total = Decimal(str(tax_total))

    if subtotal < 0:
        raise ValueError(
            "Subtotal cannot be negative."
        )

    if tax_total < 0:
        raise ValueError(
            "Tax cannot be negative."
        )

    grand_total = subtotal + tax_total

    invoice = Invoice.objects.create(
        quotation_id=quotation_id,
        customer_id=customer_id,
        invoice_number=invoice_number,
        subtotal=subtotal,
        tax_total=tax_total,
        grand_total=grand_total,
        payment_status="UNPAID",
        due_date=due_date,
    )

    return invoice