# portal/models.py

from django.db import models


class PortalNegotiation(models.Model):

    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("SUBMITTED", "Submitted"),
        ("ACCEPTED", "Accepted"),
        ("REJECTED", "Rejected"),
        ("COUNTERED", "Countered"),
    ]

    quotation_id = models.IntegerField()
    customer_id = models.IntegerField()

    requested_discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    requested_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    customer_comment = models.TextField(
        null=True,
        blank=True
    )

    sales_comment = models.TextField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "portal_negotiations"
        verbose_name = "Portal Negotiation"
        verbose_name_plural = "Portal Negotiations"

    def __str__(self):
        return f"Negotiation {self.id}"
