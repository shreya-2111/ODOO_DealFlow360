from rest_framework import generics
from .models import PortalNegotiation

from .serializers import PortalNegotiationSerializer
from .review_service import review_negotiation

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .review_service import review_negotiation


class NegotiationReviewView(APIView):

    def post(self, request, negotiation_id):

        review_status = request.data.get("status")
        sales_comment = request.data.get("sales_comment")

        try:
            negotiation = review_negotiation(
                negotiation_id=negotiation_id,
                status=review_status,
                sales_comment=sales_comment,
            )

            serializer = PortalNegotiationSerializer(negotiation)

            return Response(
                {
                    "message": "Negotiation reviewed successfully.",
                    "negotiation": serializer.data,
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
class NegotiationListCreateView(generics.ListCreateAPIView):
    queryset = PortalNegotiation.objects.all()
    serializer_class = PortalNegotiationSerializer

    def perform_create(self, serializer):
        serializer.save(status="SUBMITTED")

class NegotiationReviewView(APIView):

    def post(self, request, negotiation_id):

        review_status = request.data.get("status")
        sales_comment = request.data.get("sales_comment")

        try:
            negotiation = review_negotiation(
                negotiation_id=negotiation_id,
                status=review_status,
                sales_comment=sales_comment,
            )

            serializer = PortalNegotiationSerializer(negotiation)

            return Response(
                {
                    "message": "Negotiation reviewed successfully.",
                    "negotiation": serializer.data,
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