from django.urls import path
from .views import NegotiationListCreateView,NegotiationReviewView


urlpatterns = [
    path(
        "negotiations/",
        NegotiationListCreateView.as_view(),
        name="negotiation-list-create"
    ),
     path(
        "negotiations/<int:negotiation_id>/review/",
        NegotiationReviewView.as_view(),
        name="negotiation-review",
    ),
]