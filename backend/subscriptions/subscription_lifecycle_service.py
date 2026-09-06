from decimal import Decimal
from django.db import transaction

from .models import Subscription
from datetime import date
from .proration_service import calculate_proration

@transaction.atomic
def pause_subscription(subscription_id):

    subscription = (
        Subscription.objects
        .select_for_update()
        .filter(id=subscription_id)
        .first()
    )

    if not subscription:
        raise ValueError("Subscription not found.")

    if subscription.status == "PAUSED":
        raise ValueError("Subscription is already paused.")

    if subscription.status != "ACTIVE":
        raise ValueError(
            "Only active subscriptions can be paused."
        )

    subscription.status = "PAUSED"

    subscription.save(
        update_fields=["status"]
    )

    return subscription

@transaction.atomic
def resume_subscription(subscription_id):

    subscription = (
        Subscription.objects
        .select_for_update()
        .filter(id=subscription_id)
        .first()
    )

    if not subscription:
        raise ValueError("Subscription not found.")

    if subscription.status != "PAUSED":
        raise ValueError(
            "Only paused subscriptions can be resumed."
        )

    subscription.status = "ACTIVE"

    subscription.save(
        update_fields=["status"]
    )

    return subscription

@transaction.atomic
def modify_subscription(
    subscription_id,
    new_plan_id=None,
    new_billing_amount=None,
    period_start=None,
    period_end=None,
    change_date=None,
):
    subscription = (
        Subscription.objects
        .select_for_update()
        .select_related("plan")
        .filter(id=subscription_id)
        .first()
    )

    if not subscription:
        raise ValueError("Subscription not found.")

    if subscription.status not in ["ACTIVE", "PAUSED", "MODIFIED"]:
        raise ValueError(
            "Only active, paused, or modified subscriptions can be modified."
        )

    if new_plan_id is None and new_billing_amount is None:
        raise ValueError("At least one change is required.")

    # Calculate proration using the CURRENT plan's strategy
    if period_start and period_end and change_date:
        proration_result = calculate_proration(
            billing_amount=subscription.billing_amount,
            proration_strategy=subscription.plan.proration_strategy,
            period_start=period_start,
            period_end=period_end,
            change_date=change_date,
    )

    subscription.proration_credit = proration_result["proration_credit"]

    # Change plan
    if new_plan_id is not None:
        from .models import SubscriptionPlan
        from .subscription_service import calculate_next_billing_date

        new_plan = SubscriptionPlan.objects.filter(id=new_plan_id).first()

        if not new_plan:
            raise ValueError("New subscription plan not found.")

        subscription.plan = new_plan

        # Recalculate next billing date according to new plan
        subscription.next_billing_date = calculate_next_billing_date(
            subscription.start_date,
            new_plan.billing_frequency,
        )

    # Change billing amount
    if new_billing_amount is not None:
        new_billing_amount = Decimal(str(new_billing_amount))

        if new_billing_amount <= 0:
            raise ValueError(
                "New billing amount must be greater than 0."
            )

        subscription.billing_amount = new_billing_amount

    subscription.status = "MODIFIED"

    subscription.save(
        update_fields=[
            "plan",
            "billing_amount",
            "status",
            "proration_credit",
            "next_billing_date",
        ]
    )

    return subscription

@transaction.atomic
def cancel_subscription(
    subscription_id,
    period_start=None,
    period_end=None,
    change_date=None,
):
    subscription = (
        Subscription.objects
        .select_for_update()
        .select_related("plan")
        .filter(id=subscription_id)
        .first()
    )

    if not subscription:
        raise ValueError("Subscription not found.")

    if subscription.status == "CANCELLED":
        raise ValueError("Subscription is already cancelled.")

    # Calculate proration credit before cancellation
    if period_start and period_end and change_date:
        proration_result = calculate_proration(
            billing_amount=subscription.billing_amount,
            proration_strategy=subscription.plan.proration_strategy,
            period_start=period_start,
            period_end=period_end,
            change_date=change_date,
        )

        subscription.proration_credit = (
            proration_result["proration_credit"]
        )

    subscription.status = "CANCELLED"
    subscription.end_date = change_date or date.today()

    subscription.save(
        update_fields=[
            "status",
            "end_date",
            "proration_credit",
        ]
    )

    return subscription