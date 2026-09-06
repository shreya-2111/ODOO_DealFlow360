from django.contrib import admin

from .models import Invoice, Payment,CreditNote

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "invoice_number",
        "quotation_id",
        "customer_id",
        "subtotal",
        "tax_total",
        "grand_total",
        "payment_status",
        "due_date",
        "created_at",
    )

    list_filter = (
        "payment_status",
        "due_date",
    )

    search_fields = (
        "invoice_number",
        "quotation_id",
        "customer_id",
    )

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "invoice",
        "amount",
        "reference",
        "payment_date",
    )

    list_filter = (
        "payment_date",
    )

    search_fields = (
        "reference",
    )

@admin.register(CreditNote)
class CreditNoteAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "credit_note_number",
        "invoice",
        "amount",
        "reason",
        "created_at",
    )

    search_fields = (
        "credit_note_number",
        "reason",
    )

    list_filter = (
        "created_at",
    )
