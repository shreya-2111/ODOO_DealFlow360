from datetime import date
from django.db import transaction

from .models import Subscription
from .recurring_billing_service import generate_recurring_invoice


@transaction.atomic
def process_due_subscriptions():
    today = date.today()

    subscriptions = (
        Subscription.objects
        .select_for_update()
        .select_related("plan")
        .filter(
            status="ACTIVE",
            next_billing_date__lte=today,
        )
    )

    results = []

    for subscription in subscriptions:

        try:
            invoice, updated_subscription = generate_recurring_invoice(
                subscription_id=subscription.id
            )

            results.append({
                "subscription_id": subscription.id,
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "amount": str(invoice.grand_total),
                "next_billing_date": str(
                    updated_subscription.next_billing_date
                ),
                "status": "SUCCESS",
            })

        except ValueError as e:

            results.append({
                "subscription_id": subscription.id,
                "status": "FAILED",
                "error": str(e),
            })

    return results