from django.core.management.base import BaseCommand

from subscriptions.automatic_billing_service import (
    process_due_subscriptions,
)


class Command(BaseCommand):

    help = "Process all subscriptions that are due for billing."

    def handle(self, *args, **options):

        results = process_due_subscriptions()

        if not results:
            self.stdout.write(
                self.style.SUCCESS(
                    "No subscriptions are due for billing."
                )
            )
            return

        for result in results:

            if result["status"] == "SUCCESS":

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Subscription {result['subscription_id']} "
                        f"billed successfully. "
                        f"Invoice: {result['invoice_number']}"
                    )
                )

            else:

                self.stdout.write(
                    self.style.ERROR(
                        f"Subscription {result['subscription_id']} "
                        f"failed: {result['error']}"
                    )
                )
