from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from django.db import transaction
from .models import Subscription

def calculate_daily_proration(
    billing_amount,
    period_start,
    period_end,
    change_date,
):
    billing_amount = Decimal(str(billing_amount))

    if billing_amount <= 0:
        raise ValueError("Billing amount must be greater than 0.")

    if change_date < period_start:
        raise ValueError(
            "Change date cannot be before the billing period."
        )

    if change_date > period_end:
        raise ValueError(
            "Change date cannot be after the billing period."
        )

    total_days = (period_end - period_start).days
    remaining_days = (period_end - change_date).days

    if total_days <= 0:
        raise ValueError(
            "Billing period must contain at least one day."
        )

    credit = (
        billing_amount
        * Decimal(remaining_days)
        / Decimal(total_days)
    )

    credit = credit.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP
    )

    return {
        "billing_amount": billing_amount,
        "total_days": total_days,
        "remaining_days": remaining_days,
        "proration_credit": credit,
    }

@transaction.atomic
def apply_proration_credit(
    subscription_id,
    period_start,
    period_end,
    change_date,
):
    subscription = (
        Subscription.objects
        .select_for_update()
        .filter(id=subscription_id)
        .first()
    )

    if not subscription:
        raise ValueError("Subscription not found.")

    result = calculate_daily_proration(
        billing_amount=subscription.billing_amount,
        period_start=period_start,
        period_end=period_end,
        change_date=change_date,
    )

    subscription.proration_credit = result["proration_credit"]

    subscription.save(
        update_fields=["proration_credit"]
    )

    return subscription, result

def calculate_full_period_proration(billing_amount):
    billing_amount = Decimal(str(billing_amount))

    if billing_amount <= 0:
        raise ValueError(
            "Billing amount must be greater than 0."
        )

    return {
        "billing_amount": billing_amount,
        "total_days": None,
        "remaining_days": None,
        "proration_credit": Decimal("0.00"),
    }

def calculate_no_proration(billing_amount):
    billing_amount = Decimal(str(billing_amount))

    if billing_amount <= 0:
        raise ValueError(
            "Billing amount must be greater than 0."
        )

    return {
        "billing_amount": billing_amount,
        "total_days": None,
        "remaining_days": None,
        "proration_credit": Decimal("0.00"),
    }

def calculate_proration(
    billing_amount,
    proration_strategy,
    period_start=None,
    period_end=None,
    change_date=None,
):
    if proration_strategy == "DAILY_PRORATED":
        if not all([period_start, period_end, change_date]):
            raise ValueError(
                "Period start, period end, and change date are required "
                "for daily proration."
            )

        return calculate_daily_proration(
            billing_amount=billing_amount,
            period_start=period_start,
            period_end=period_end,
            change_date=change_date,
        )

    elif proration_strategy == "FULL_PERIOD":
        return calculate_full_period_proration(
            billing_amount=billing_amount
        )

    elif proration_strategy == "NO_PRORATION":
        return calculate_no_proration(
            billing_amount=billing_amount
        )

    else:
        raise ValueError("Invalid proration strategy.")