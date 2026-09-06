from django.db import models


class SubscriptionPlan(models.Model):

    BILLING_FREQUENCY_CHOICES = [
        ("MONTHLY", "Monthly"),
        ("QUARTERLY", "Quarterly"),
        ("YEARLY", "Yearly"),
    ]

    PRORATION_STRATEGY_CHOICES = [
        ("DAILY_PRORATED", "Daily Prorated"),
        ("FULL_PERIOD", "Full Period"),
        ("NO_PRORATION", "No Proration"),
    ]

    plan_name = models.CharField(max_length=150)

    billing_frequency = models.CharField(
        max_length=10,
        choices=BILLING_FREQUENCY_CHOICES
    )

    proration_strategy = models.CharField(
        max_length=20,
        choices=PRORATION_STRATEGY_CHOICES
    )

    cancellation_terms = models.TextField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.plan_name

    class Meta:
        db_table = "subscription_plans"
    
class Subscription(models.Model):

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("PAUSED", "Paused"),
        ("MODIFIED", "Modified"),
        ("CANCELLED", "Cancelled"),
    ]

    quotation_id = models.IntegerField()
    quotation_item_id = models.IntegerField()
    customer_id = models.IntegerField()

    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        db_column="plan_id",
        related_name="subscriptions",
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="ACTIVE",
    )

    billing_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    start_date = models.DateField()

    next_billing_date = models.DateField()

    end_date = models.DateField(
        null=True,
        blank=True,
    )

    proration_credit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
    )

    class Meta:
        db_table = "subscriptions"

    def __str__(self):
        return f"Subscription {self.id}"