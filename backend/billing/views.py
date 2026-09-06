from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Invoice
from .serializers import InvoiceSerializer,PaymentSerializer,CreditNoteSerializer
from .invoice_service import create_invoice
from .billing_calculation_service import calculate_billing
from .invoice_generation_service import generate_invoice_from_billing
from .payment_service import record_payment
from .credit_note_service import create_credit_note

class InvoiceListView(generics.ListAPIView):

    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer


class InvoiceCreateView(APIView):

    def post(self, request):

        try:

            invoice = create_invoice(
                quotation_id=int(
                    request.data.get("quotation_id")
                ),
                customer_id=int(
                    request.data.get("customer_id")
                ),
                invoice_number=request.data.get(
                    "invoice_number"
                ),
                subtotal=request.data.get(
                    "subtotal"
                ),
                tax_total=request.data.get(
                    "tax_total"
                ),
                due_date=request.data.get(
                    "due_date"
                ),
            )

            serializer = InvoiceSerializer(
                invoice
            )

            return Response(
                {
                    "message": "Invoice created successfully.",
                    "invoice": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        except (TypeError, ValueError) as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

class BillingCalculationView(APIView):

    def post(self, request):

        try:

            lines = request.data.get("lines", [])

            if not lines:
                return Response(
                    {
                        "error": "At least one billing line is required."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            result = calculate_billing(lines)

            return Response(
                {
                    "message": "Billing calculated successfully.",
                    "billing": result,
                },
                status=status.HTTP_200_OK,
            )

        except (KeyError, ValueError) as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

class InvoiceGenerationView(APIView):

    def post(self, request):

        try:

            lines = request.data.get("lines", [])

            if not lines:
                return Response(
                    {
                        "error": "At least one billing line is required."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            result = generate_invoice_from_billing(
                quotation_id=int(
                    request.data.get("quotation_id")
                ),
                customer_id=int(
                    request.data.get("customer_id")
                ),
                invoice_number=request.data.get(
                    "invoice_number"
                ),
                due_date=request.data.get(
                    "due_date"
                ),
                lines=lines,
            )

            invoice = result["invoice"]

            invoice_data = None

            if invoice:
                invoice_data = InvoiceSerializer(
                    invoice
                ).data

            recurring = result["recurring"]

            return Response(
                {
                    "message": "Billing processed successfully.",
                    "invoice": invoice_data,
                    "recurring": recurring,
                },
                status=status.HTTP_201_CREATED,
            )

        except (TypeError, ValueError, KeyError) as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

class PaymentCreateView(APIView):

    def post(self, request):

        try:

            payment, invoice, paid_amount = record_payment(
                invoice_id=int(
                    request.data.get("invoice_id")
                ),
                amount=request.data.get("amount"),
                reference=request.data.get(
                    "reference"
                ),
            )

            payment_serializer = PaymentSerializer(
                payment
            )

            return Response(
                {
                    "message": "Payment recorded successfully.",
                    "payment": payment_serializer.data,
                    "invoice": {
                        "id": invoice.id,
                        "invoice_number": invoice.invoice_number,
                        "grand_total": invoice.grand_total,
                        "paid_amount": paid_amount,
                        "payment_status": invoice.payment_status,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except (TypeError, ValueError) as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class CreditNoteCreateView(APIView):

    def post(self, request):

        try:

            credit_note, invoice, credited_amount = (
                create_credit_note(
                    invoice_id=int(
                        request.data.get("invoice_id")
                    ),
                    credit_note_number=request.data.get(
                        "credit_note_number"
                    ),
                    amount=request.data.get(
                        "amount"
                    ),
                    reason=request.data.get(
                        "reason"
                    ),
                )
            )

            serializer = CreditNoteSerializer(
                credit_note
            )

            return Response(
                {
                    "message": "Credit note created successfully.",
                    "credit_note": serializer.data,
                    "invoice": {
                        "id": invoice.id,
                        "invoice_number": invoice.invoice_number,
                        "grand_total": invoice.grand_total,
                        "credited_amount": credited_amount,
                        "payment_status": invoice.payment_status,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except (TypeError, ValueError) as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

