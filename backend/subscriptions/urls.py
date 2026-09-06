from django.urls import path

from .views import (
    SubscriptionPlanListCreateView,
    SubscriptionListView,
    SubscriptionCreateView,
    GenerateRecurringInvoiceView,
    ProcessDueSubscriptionsView,
    PauseSubscriptionView,
    ResumeSubscriptionView,
    ModifySubscriptionView,
    CancelSubscriptionView,
    ApplyProrationView,
)


urlpatterns = [

    path(
        "plans/",
        SubscriptionPlanListCreateView.as_view(),
        name="subscription-plan-list-create",
    ),

    path(
        "",
        SubscriptionListView.as_view(),
        name="subscription-list",
    ),

    path(
        "create/",
        SubscriptionCreateView.as_view(),
        name="subscription-create",
    ),

    path(
        "recurring-invoice/<int:subscription_id>/",
        GenerateRecurringInvoiceView.as_view(),
        name="generate-recurring-invoice",
    ),

    path(
        "process-due/",
        ProcessDueSubscriptionsView.as_view(),
        name="process-due-subscriptions",
    ),

    path(
        "pause/<int:subscription_id>/",
        PauseSubscriptionView.as_view(),
        name="pause-subscription",
    ),

    path(
        "resume/<int:subscription_id>/",
        ResumeSubscriptionView.as_view(),
        name="resume-subscription",
    ),

    path(
        "modify/<int:subscription_id>/",
        ModifySubscriptionView.as_view(),
        name="modify-subscription",
    ),

    path(
        "cancel/<int:subscription_id>/",
        CancelSubscriptionView.as_view(),
        name="cancel-subscription",
    ),

    path(
        "proration/<int:subscription_id>/",
        ApplyProrationView.as_view(),
        name="apply-proration",
    ),
]