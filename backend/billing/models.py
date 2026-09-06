from django.db import models


class Invoice(models.Model):

    PAYMENT_STATUS_CHOICES = [
        ("UNPAID", "Unpaid"),
        ("PARTIALLY_PAID", "Partially Paid"),
        ("PAID", "Paid"),
        ("CREDITED", "Credited"),
    ]

    quotation_id = models.IntegerField()

    customer_id = models.IntegerField()

    invoice_number = models.CharField(
        max_length=100,
        unique=True
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    tax_total = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    grand_total = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="UNPAID"
    )

    due_date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "invoices"
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"

    def __str__(self):
        return self.invoice_number

class Payment(models.Model):

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments",
        db_column="invoice_id",
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_date = models.DateTimeField(
        auto_now_add=True
    )

    reference = models.CharField(
        max_length=100,
        unique=True,
    )

    def __str__(self):
        return self.reference

    class Meta:
        db_table = "payments"
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
    
class CreditNote(models.Model):

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="credit_notes",
        db_column="invoice_id",
    )

    credit_note_number = models.CharField(
        max_length=100,
        unique=True,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    reason = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.credit_note_number

    class Meta:
        db_table = "credit_notes"
        verbose_name = "Credit Note"
        verbose_name_plural = "Credit Notes"