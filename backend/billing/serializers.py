from rest_framework import serializers

from .models import Invoice,Payment,CreditNote


class InvoiceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Invoice
        fields = [
            "id",
            "quotation_id",
            "customer_id",
            "invoice_number",
            "subtotal",
            "tax_total",
            "grand_total",
            "payment_status",
            "due_date",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "grand_total",
            "created_at",
        ]

class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = [
            "id",
            "invoice",
            "amount",
            "reference",
            "payment_date",
        ]

        read_only_fields = [
            "id",
            "payment_date",
        ]

class CreditNoteSerializer(serializers.ModelSerializer):

    class Meta:
        model = CreditNote
        fields = [
            "id",
            "invoice",
            "credit_note_number",
            "amount",
            "reason",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]