from django.db import transaction
from .models import PortalNegotiation


@transaction.atomic
def review_negotiation(
    negotiation_id,
    status,
    sales_comment=None
):
    negotiation = (
        PortalNegotiation.objects
        .select_for_update()
        .filter(id=negotiation_id)
        .first()
    )

    if not negotiation:
        raise ValueError("Negotiation not found.")

    allowed_statuses = [
        "ACCEPTED",
        "REJECTED",
        "COUNTERED",
    ]

    if status not in allowed_statuses:
        raise ValueError(
            "Invalid review status."
        )

    if negotiation.status != "SUBMITTED":
        raise ValueError(
            "Only submitted negotiations can be reviewed."
        )

    negotiation.status = status
    negotiation.sales_comment = sales_comment

    negotiation.save(
        update_fields=[
            "status",
            "sales_comment",
            "updated_at",
        ]
    )

    return negotiation