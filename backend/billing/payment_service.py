from decimal import Decimal

from django.db import transaction,models

from .models import Invoice,Payment

@transaction.atomic
def record_payment(
    invoice_id,
    amount,
    reference,
):
    amount = Decimal(str(amount))

    if amount <= 0:
        raise ValueError(
            "Payment amount must be greater than 0."
        )

    invoice = (
        Invoice.objects
        .select_for_update()
        .filter(id=invoice_id)
        .first()
    )

    if not invoice:
        raise ValueError(
            "Invoice not found."
        )

    if invoice.payment_status == "PAID":
        raise ValueError(
            "Invoice is already fully paid."
        )

    if invoice.payment_status == "CREDITED":
        raise ValueError(
            "Credited invoice cannot receive payment."
        )

    # Calculate how much has already been paid
    paid_amount = (
        Payment.objects
        .filter(invoice=invoice)
        .aggregate(
            total=models.Sum("amount")
        )["total"]
        or Decimal("0.00")
    )

    remaining_amount = (
        invoice.grand_total - paid_amount
    )

    if amount > remaining_amount:
        raise ValueError(
            f"Maximum payable amount is {remaining_amount}."
        )

    payment = Payment.objects.create(
        invoice=invoice,
        amount=amount,
        reference=reference,
    )

    new_paid_amount = paid_amount + amount

    if new_paid_amount == invoice.grand_total:
        invoice.payment_status = "PAID"
    else:
        invoice.payment_status = "PARTIALLY_PAID"

    invoice.save(
        update_fields=["payment_status"]
    )

    return payment, invoice, new_paid_amount
    