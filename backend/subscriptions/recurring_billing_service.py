from decimal import Decimal
from django.db import transaction
from datetime import date

from .models import Subscription
from billing.models import Invoice
from billing.invoice_service import create_invoice


@transaction.atomic
def generate_recurring_invoice(subscription_id, due_date=None):

    subscription = (
        Subscription.objects
        .select_for_update()
        .select_related("plan")
        .filter(id=subscription_id)
        .first()
    )

    if not subscription:
        raise ValueError("Subscription not found.")

    if subscription.status != "ACTIVE":
        raise ValueError(
            "Only active subscriptions can generate recurring invoices."
        )
    
    if date.today() < subscription.next_billing_date:
        raise ValueError(f"Next billing date is {subscription.next_billing_date}."
        "Recurring invoice cannot be generated yet")

    # Generate a unique invoice number
    invoice_number = (
        f"SUB-{subscription.id}-{subscription.next_billing_date.strftime('%Y%m%d')}"
    )

    # Prevent duplicate invoice for the same billing cycle
    if Invoice.objects.filter(invoice_number=invoice_number).exists():
        raise ValueError(
            "Invoice already generated for this billing cycle."
        )

    billing_amount = Decimal(str(subscription.billing_amount))

    if billing_amount <= 0:
        raise ValueError(
            "Subscription billing amount must be greater than 0."
        )

    if due_date is None:
        due_date = subscription.next_billing_date

    invoice = create_invoice(
        quotation_id=subscription.quotation_id,
        customer_id=subscription.customer_id,
        invoice_number=invoice_number,
        subtotal=billing_amount,
        tax_total=Decimal("0.00"),
        due_date=due_date,
    )

    # Move to the next billing cycle
    if subscription.plan.billing_frequency == "MONTHLY":
        from dateutil.relativedelta import relativedelta
        subscription.next_billing_date += relativedelta(months=1)

    elif subscription.plan.billing_frequency == "QUARTERLY":
        from dateutil.relativedelta import relativedelta
        subscription.next_billing_date += relativedelta(months=3)

    elif subscription.plan.billing_frequency == "YEARLY":
        from dateutil.relativedelta import relativedelta
        subscription.next_billing_date += relativedelta(years=1)

    else:
        raise ValueError("Invalid billing frequency.")

    subscription.save(
        update_fields=["next_billing_date"]
    )

    return invoice, subscription