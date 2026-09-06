from datetime import date
from dateutil.relativedelta import relativedelta

from .models import Subscription


def calculate_next_billing_date(start_date, billing_frequency):

    if billing_frequency == "MONTHLY":
        return start_date + relativedelta(months=1)

    if billing_frequency == "QUARTERLY":
        return start_date + relativedelta(months=3)

    if billing_frequency == "YEARLY":
        return start_date + relativedelta(years=1)

    raise ValueError(
        "Invalid billing frequency."
    )


def create_subscription(
    quotation_id,
    quotation_item_id,
    customer_id,
    plan,
    billing_amount,
    start_date,
):

    # Convert API string to Python date
    if isinstance(start_date, str):
        start_date = date.fromisoformat(start_date)

    next_billing_date = calculate_next_billing_date(
        start_date,
        plan.billing_frequency,
    )

    subscription = Subscription.objects.create(
        quotation_id=quotation_id,
        quotation_item_id=quotation_item_id,
        customer_id=customer_id,
        plan=plan,
        status="ACTIVE",
        billing_amount=billing_amount,
        start_date=start_date,
        next_billing_date=next_billing_date,
        proration_credit=0,
    )

    return subscription