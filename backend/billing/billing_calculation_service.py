from decimal import Decimal


def calculate_billing(lines):
    """
    Separate quotation lines into one-time and recurring billing.

    Each line should contain:
        product_type
        quantity
        unit_price
        discount_percent
        tax_rate
    """

    one_time_lines = []
    recurring_lines = []

    one_time_subtotal = Decimal("0.00")
    recurring_subtotal = Decimal("0.00")

    one_time_tax = Decimal("0.00")
    recurring_tax = Decimal("0.00")

    for line in lines:

        product_type = line["product_type"]

        quantity = Decimal(str(line["quantity"]))
        unit_price = Decimal(str(line["unit_price"]))
        discount_percent = Decimal(
            str(line.get("discount_percent", 0))
        )
        tax_rate = Decimal(
            str(line.get("tax_rate", 0))
        )

        # Gross amount
        gross_amount = quantity * unit_price

        # Discount
        discount_amount = (
            gross_amount * discount_percent / Decimal("100")
        )

        # Net amount before tax
        net_amount = gross_amount - discount_amount

        # Tax
        tax_amount = (
            net_amount * tax_rate / Decimal("100")
        )

        line_total = net_amount + tax_amount

        calculated_line = {
            **line,
            "gross_amount": gross_amount,
            "discount_amount": discount_amount,
            "net_amount": net_amount,
            "tax_amount": tax_amount,
            "line_total": line_total,
        }

        if product_type == "ONE_TIME":

            one_time_lines.append(calculated_line)

            one_time_subtotal += net_amount
            one_time_tax += tax_amount

        elif product_type == "SUBSCRIPTION":

            recurring_lines.append(calculated_line)

            recurring_subtotal += net_amount
            recurring_tax += tax_amount

        else:

            raise ValueError(
                f"Invalid product type: {product_type}"
            )

    return {
        "one_time": {
            "lines": one_time_lines,
            "subtotal": one_time_subtotal,
            "tax": one_time_tax,
            "total": one_time_subtotal + one_time_tax,
        },

        "recurring": {
            "lines": recurring_lines,
            "subtotal": recurring_subtotal,
            "tax": recurring_tax,
            "total": recurring_subtotal + recurring_tax,
        },
    }