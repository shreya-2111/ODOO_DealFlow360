from decimal import Decimal

from django.db import models, transaction

from .models import Invoice, CreditNote


@transaction.atomic
def create_credit_note(
    invoice_id,
    credit_note_number,
    amount,
    reason,
):
    amount = Decimal(str(amount))

    if amount <= 0:
        raise ValueError(
            "Credit amount must be greater than 0."
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

    credited_amount = (
        CreditNote.objects
        .filter(invoice=invoice)
        .aggregate(
            total=models.Sum("amount")
        )["total"]
        or Decimal("0.00")
    )

    remaining_creditable = (
        invoice.grand_total - credited_amount
    )

    if amount > remaining_creditable:
        raise ValueError(
            f"Maximum creditable amount is "
            f"{remaining_creditable}."
        )

    credit_note = CreditNote.objects.create(
        invoice=invoice,
        credit_note_number=credit_note_number,
        amount=amount,
        reason=reason,
    )

    new_credited_amount = (
        credited_amount + amount
    )

    if new_credited_amount == invoice.grand_total:
        invoice.payment_status = "CREDITED"

        invoice.save(
            update_fields=["payment_status"]
        )

    return credit_note, invoice, new_credited_amount