from django.http import request
from django.shortcuts import render
from datetime import date
# Create your views here.
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SubscriptionPlan, Subscription
from .serializers import (
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
)
from .subscription_service import create_subscription
from .recurring_billing_service import generate_recurring_invoice
from billing.models import Invoice
from .automatic_billing_service import process_due_subscriptions
from .subscription_lifecycle_service import pause_subscription,resume_subscription,modify_subscription,cancel_subscription
from .proration_service import apply_proration_credit

class SubscriptionPlanListCreateView(
    generics.ListCreateAPIView
):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer


class SubscriptionListView(
    generics.ListAPIView
):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer


class SubscriptionCreateView(APIView):

    def post(self, request):

        try:

            plan_id = request.data.get("plan")

            plan = SubscriptionPlan.objects.get(
                id=plan_id
            )

            subscription = create_subscription(
                quotation_id=int(
                    request.data.get("quotation_id")
                ),
                quotation_item_id=int(
                    request.data.get("quotation_item_id")
                ),
                customer_id=int(
                    request.data.get("customer_id")
                ),
                plan=plan,
                billing_amount=request.data.get(
                    "billing_amount"
                ),
                start_date=request.data.get(
                    "start_date"
                ),
            )

            serializer = SubscriptionSerializer(
                subscription
            )

            return Response(
                {
                    "message": "Subscription created successfully.",
                    "subscription": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        except SubscriptionPlan.DoesNotExist:

            return Response(
                {
                    "error": "Subscription plan not found."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except (TypeError, ValueError) as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

class GenerateRecurringInvoiceView(APIView):

    def post(self, request, subscription_id):

        try:
            invoice, subscription = generate_recurring_invoice(
                subscription_id=subscription_id
            )

            return Response(
                {
                    "message": "Recurring invoice generated successfully.",
                    "invoice": {
                        "id": invoice.id,
                        "invoice_number": invoice.invoice_number,
                        "quotation_id": invoice.quotation_id,
                        "customer_id": invoice.customer_id,
                        "subtotal": str(invoice.subtotal),
                        "tax_total": str(invoice.tax_total),
                        "grand_total": str(invoice.grand_total),
                        "payment_status": invoice.payment_status,
                        "due_date": str(invoice.due_date),
                    },
                    "subscription": {
                        "id": subscription.id,
                        "next_billing_date": str(
                            subscription.next_billing_date
                        ),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except ValueError as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

class ProcessDueSubscriptionsView(APIView):

    def post(self, request):

        try:
            results = process_due_subscriptions()

            return Response(
                {
                    "message": "Due subscriptions processed successfully.",
                    "results": results,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class PauseSubscriptionView(APIView):

    def post(self, request, subscription_id):

        try:
            subscription = pause_subscription(
                subscription_id=subscription_id
            )

            return Response(
                {
                    "message": "Subscription paused successfully.",
                    "subscription": {
                        "id": subscription.id,
                        "status": subscription.status,
                        "next_billing_date": str(
                            subscription.next_billing_date
                        ),
                    },
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

class ResumeSubscriptionView(APIView):

    def post(self, request, subscription_id):

        try:
            subscription = resume_subscription(
                subscription_id=subscription_id
            )

            return Response(
                {
                    "message": "Subscription resumed successfully.",
                    "subscription": {
                        "id": subscription.id,
                        "status": subscription.status,
                        "next_billing_date": str(
                            subscription.next_billing_date
                        ),
                    },
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        

class ModifySubscriptionView(APIView):

    def post(self, request, subscription_id):

        try:
            new_plan_id = request.data.get("new_plan_id")
            new_billing_amount = request.data.get("new_billing_amount")

            period_start = request.data.get("period_start")
            period_end = request.data.get("period_end")
            change_date = request.data.get("change_date")

            # Convert strings to date objects
            if period_start:
                period_start = date.fromisoformat(period_start)

            if period_end:
                period_end = date.fromisoformat(period_end)

            if change_date:
                change_date = date.fromisoformat(change_date)

            subscription = modify_subscription(
                subscription_id=subscription_id,
                new_plan_id=new_plan_id,
                new_billing_amount=new_billing_amount,
                period_start=period_start,
                period_end=period_end,
                change_date=change_date,
            )

            return Response(
                {
                    "message": "Subscription modified successfully.",
                    "subscription": {
                        "id": subscription.id,
                        "plan": subscription.plan_id,
                        "status": subscription.status,
                        "billing_amount": str(
                            subscription.billing_amount
                        ),
                        "next_billing_date": str(
                            subscription.next_billing_date
                        ),
                        "proration_credit": str(
                            subscription.proration_credit
                        ),
                    },
                },
                status=status.HTTP_200_OK,
            )

        except (ValueError, TypeError) as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

class CancelSubscriptionView(APIView):

    def post(self, request, subscription_id):

        try:
            period_start = request.data.get("period_start")
            period_end = request.data.get("period_end")
            change_date = request.data.get("change_date")

            # Convert strings to date objects
            if period_start:
                period_start = date.fromisoformat(period_start)

            if period_end:
                period_end = date.fromisoformat(period_end)

            if change_date:
                change_date = date.fromisoformat(change_date)

            subscription = cancel_subscription(
                subscription_id=subscription_id,
                period_start=period_start,
                period_end=period_end,
                change_date=change_date,
            )

            return Response(
                {
                    "message": "Subscription cancelled successfully.",
                    "subscription": {
                        "id": subscription.id,
                        "status": subscription.status,
                        "end_date": str(subscription.end_date),
                        "next_billing_date": str(
                            subscription.next_billing_date
                        ),
                        "proration_credit": str(
                            subscription.proration_credit
                        ),
                    },
                },
                status=status.HTTP_200_OK,
            )

        except (ValueError, TypeError) as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
class ApplyProrationView(APIView):

    def post(self, request, subscription_id):

        try:
            period_start = date.fromisoformat(
                request.data.get("period_start")
            )

            period_end = date.fromisoformat(
                request.data.get("period_end")
            )

            change_date = date.fromisoformat(
                request.data.get("change_date")
            )

            subscription, result = apply_proration_credit(
                subscription_id=subscription_id,
                period_start=period_start,
                period_end=period_end,
                change_date=change_date,
            )

            return Response(
                {
                    "message": "Proration credit calculated successfully.",
                    "subscription": {
                        "id": subscription.id,
                        "billing_amount": str(
                            subscription.billing_amount
                        ),
                        "proration_credit": str(
                            subscription.proration_credit
                        ),
                    },
                    "proration": {
                        "total_days": result["total_days"],
                        "remaining_days": result["remaining_days"],
                        "credit": str(
                            result["proration_credit"]
                        ),
                    },
                },
                status=status.HTTP_200_OK,
            )

        except (ValueError, TypeError) as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )