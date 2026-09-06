from decimal import Decimal
import random
from django.db import models


class CustomerTier(models.Model):
    """
    Customer tiers table (e.g. Bronze, Silver, Gold, Platinum).
    Referenced by customers(tier_id) and discount_tier_rules(tier_id).
    """
    name = models.CharField(max_length=50, unique=True, verbose_name='Tier Name')
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name='Default Discount (%)'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')

    class Meta:
        db_table = 'customer_tiers'
        verbose_name = 'Customer Tier'
        verbose_name_plural = 'Customer Tiers'
        ordering = ['id']

    def __str__(self):
        return self.name


class SubscriptionPlan(models.Model):
    """
    Subscription plans table.
    Referenced by products(subscription_plan_id) and quotation_items(subscription_plan_id).
    """
    class BillingFrequency(models.TextChoices):
        MONTHLY = 'MONTHLY', 'Monthly'
        QUARTERLY = 'QUARTERLY', 'Quarterly'
        ANNUAL = 'ANNUAL', 'Annual'

    name = models.CharField(max_length=100, unique=True, verbose_name='Plan Name')
    billing_frequency = models.CharField(
        max_length=20,
        choices=BillingFrequency.choices,
        default=BillingFrequency.MONTHLY,
        verbose_name='Billing Frequency'
    )
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Price')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')

    class Meta:
        db_table = 'subscription_plans'
        verbose_name = 'Subscription Plan'
        verbose_name_plural = 'Subscription Plans'
        ordering = ['id']

    def __str__(self):
        return f"{self.name} ({self.get_billing_frequency_display()})"


class Customer(models.Model):
    """
    Matches SQL:
        CREATE TABLE customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            tier_id INT NOT NULL,
            assigned_sales_rep_id INT NULL,
            company_name VARCHAR(100) NOT NULL,
            billing_address TEXT NOT NULL,
            shipping_address TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_customers_tier FOREIGN KEY (tier_id) REFERENCES customer_tiers(id),
            CONSTRAINT fk_customers_rep FOREIGN KEY (assigned_sales_rep_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    user = models.OneToOneField(
        'authentication.User',
        on_delete=models.CASCADE,
        db_column='user_id',
        related_name='customer_profile',
        verbose_name='User Account'
    )
    tier = models.ForeignKey(
        CustomerTier,
        on_delete=models.PROTECT,
        db_column='tier_id',
        related_name='customers',
        verbose_name='Customer Tier'
    )
    assigned_sales_rep = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='assigned_sales_rep_id',
        related_name='assigned_customers',
        verbose_name='Assigned Sales Rep'
    )
    company_name = models.CharField(max_length=100, verbose_name='Company Name')
    billing_address = models.TextField(verbose_name='Billing Address')
    shipping_address = models.TextField(verbose_name='Shipping Address')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')

    class Meta:
        db_table = 'customers'
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company_name} ({self.user.email})"


class ProductCategory(models.Model):
    """
    Matches SQL:
        CREATE TABLE product_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            max_discretionary_discount DECIMAL(5,2) NOT NULL DEFAULT 0.00
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    name = models.CharField(max_length=100, unique=True, verbose_name='Category Name')
    max_discretionary_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name='Max Discretionary Discount (%)'
    )

    class Meta:
        db_table = 'product_categories'
        verbose_name = 'Product Category'
        verbose_name_plural = 'Product Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Matches SQL:
        CREATE TABLE products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT NOT NULL,
            subscription_plan_id INT NULL,
            sku VARCHAR(50) NOT NULL UNIQUE,
            name VARCHAR(150) NOT NULL,
            description TEXT NULL,
            product_type ENUM('ONE_TIME', 'SUBSCRIPTION') NOT NULL DEFAULT 'ONE_TIME',
            unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'unit',
            cost_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            list_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES product_categories(id),
            CONSTRAINT fk_products_sub_plan FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    class ProductType(models.TextChoices):
        ONE_TIME = 'ONE_TIME', 'One Time'
        SUBSCRIPTION = 'SUBSCRIPTION', 'Subscription'

    category = models.ForeignKey(
        ProductCategory,
        on_delete=models.PROTECT,
        db_column='category_id',
        related_name='products',
        verbose_name='Category'
    )
    subscription_plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='subscription_plan_id',
        related_name='products',
        verbose_name='Subscription Plan'
    )
    sku = models.CharField(max_length=50, unique=True, verbose_name='SKU')
    name = models.CharField(max_length=150, verbose_name='Product Name')
    description = models.TextField(null=True, blank=True, verbose_name='Description')
    product_type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        default=ProductType.ONE_TIME,
        verbose_name='Product Type'
    )
    unit_of_measure = models.CharField(max_length=20, default='unit', verbose_name='Unit of Measure')
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Cost Price')
    list_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='List Price')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name='Tax Rate (%)')
    is_active = models.BooleanField(default=True, verbose_name='Is Active')

    class Meta:
        db_table = 'products'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['sku']

    def __str__(self):
        return f"{self.sku} - {self.name}"


class ProductVariant(models.Model):
    """
    Matches SQL:
        CREATE TABLE product_variants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            variant_sku VARCHAR(50) NOT NULL UNIQUE,
            attribute_name VARCHAR(50) NOT NULL,
            attribute_value VARCHAR(50) NOT NULL,
            extra_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            extra_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        db_column='product_id',
        related_name='variants',
        verbose_name='Parent Product'
    )
    variant_sku = models.CharField(max_length=50, unique=True, verbose_name='Variant SKU')
    attribute_name = models.CharField(max_length=50, verbose_name='Attribute Name')
    attribute_value = models.CharField(max_length=50, verbose_name='Attribute Value')
    extra_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Extra Cost')
    extra_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Extra Price')

    class Meta:
        db_table = 'product_variants'
        verbose_name = 'Product Variant'
        verbose_name_plural = 'Product Variants'
        ordering = ['variant_sku']

    def __str__(self):
        return f"{self.variant_sku} ({self.attribute_name}: {self.attribute_value})"


class RecommendationRule(models.Model):
    """
    Matches SQL:
        CREATE TABLE recommendation_rules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            source_product_id INT NOT NULL,
            suggested_product_id INT NOT NULL,
            recommendation_type ENUM('UPSELL', 'CROSS_SELL') NOT NULL,
            priority INT NOT NULL DEFAULT 0,
            is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
            min_margin_threshold DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            CONSTRAINT fk_recom_source FOREIGN KEY (source_product_id) REFERENCES products(id) ON DELETE CASCADE,
            CONSTRAINT fk_recom_target FOREIGN KEY (suggested_product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    class RecommendationType(models.TextChoices):
        UPSELL = 'UPSELL', 'Upsell'
        CROSS_SELL = 'CROSS_SELL', 'Cross-sell'

    source_product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        db_column='source_product_id',
        related_name='recommendations_as_source',
        verbose_name='Source Product'
    )
    suggested_product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        db_column='suggested_product_id',
        related_name='recommendations_as_target',
        verbose_name='Suggested Product'
    )
    recommendation_type = models.CharField(
        max_length=20,
        choices=RecommendationType.choices,
        verbose_name='Recommendation Type'
    )
    priority = models.IntegerField(default=0, verbose_name='Priority')
    is_promoted = models.BooleanField(default=False, verbose_name='Is Promoted')
    min_margin_threshold = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name='Min Margin Threshold (%)'
    )

    class Meta:
        db_table = 'recommendation_rules'
        verbose_name = 'Recommendation Rule'
        verbose_name_plural = 'Recommendation Rules'
        ordering = ['-priority', 'id']

    def __str__(self):
        return f"[{self.get_recommendation_type_display()}] {self.source_product.sku} -> {self.suggested_product.sku}"


class DiscountTierRule(models.Model):
    """
    Matches SQL:
        CREATE TABLE discount_tier_rules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tier_id INT NOT NULL,
            category_id INT NOT NULL,
            max_allowed_discount DECIMAL(5,2) NOT NULL,
            CONSTRAINT fk_discount_rules_tier FOREIGN KEY (tier_id) REFERENCES customer_tiers(id) ON DELETE CASCADE,
            CONSTRAINT fk_discount_rules_cat FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE,
            UNIQUE KEY uq_tier_category (tier_id, category_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    tier = models.ForeignKey(
        CustomerTier,
        on_delete=models.CASCADE,
        db_column='tier_id',
        related_name='discount_tier_rules',
        verbose_name='Customer Tier'
    )
    category = models.ForeignKey(
        ProductCategory,
        on_delete=models.CASCADE,
        db_column='category_id',
        related_name='discount_tier_rules',
        verbose_name='Product Category'
    )
    max_allowed_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name='Max Allowed Discount (%)'
    )

    class Meta:
        db_table = 'discount_tier_rules'
        verbose_name = 'Discount Tier Rule'
        verbose_name_plural = 'Discount Tier Rules'
        constraints = [
            models.UniqueConstraint(fields=['tier', 'category'], name='uq_tier_category')
        ]
        ordering = ['tier', 'category']

    def __str__(self):
        return f"{self.tier.name} - {self.category.name} (Max {self.max_allowed_discount}%)"


class Quotation(models.Model):
    """
    Matches SQL:
        CREATE TABLE quotations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            sales_rep_id INT NOT NULL,
            quotation_number VARCHAR(50) NOT NULL UNIQUE,
            status ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'UNDER_NEGOTIATION', 'CONFIRMED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
            total_gross_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            total_discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            total_net_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            total_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            margin_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            blended_risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            order_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            last_interaction_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_quotations_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
            CONSTRAINT fk_quotations_rep FOREIGN KEY (sales_rep_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Approval'
        APPROVED = 'APPROVED', 'Approved'
        SENT = 'SENT', 'Sent'
        UNDER_NEGOTIATION = 'UNDER_NEGOTIATION', 'Under Negotiation'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        REJECTED = 'REJECTED', 'Rejected'
        EXPIRED = 'EXPIRED', 'Expired'

    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        db_column='customer_id',
        related_name='quotations',
        verbose_name='Customer'
    )
    sales_rep = models.ForeignKey(
        'authentication.User',
        on_delete=models.PROTECT,
        db_column='sales_rep_id',
        related_name='quotations',
        verbose_name='Sales Representative'
    )
    quotation_number = models.CharField(max_length=50, unique=True, verbose_name='Quotation Number')
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name='Status'
    )
    total_gross_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name='Total Gross Amount'
    )
    total_discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name='Total Discount Amount'
    )
    total_net_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name='Total Net Amount'
    )
    total_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name='Total Cost'
    )
    margin_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name='Margin (%)'
    )
    blended_risk_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name='Blended Risk Score'
    )
    order_discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name='Order Discount (%)'
    )
    last_interaction_at = models.DateTimeField(auto_now=True, verbose_name='Last Interaction')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')

    class Meta:
        db_table = 'quotations'
        verbose_name = 'Quotation'
        verbose_name_plural = 'Quotations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quotation_number} - {self.customer.company_name} [{self.get_status_display()}]"

    def recalculate(self):
        """
        Recalculates totals, line discounts, order discount, costs,
        margins and blended risk score from all linked quotation items.
        """
        items = self.items.select_related('product', 'product__category').all()
        gross = Decimal('0.00')
        line_discount = Decimal('0.00')
        cost = Decimal('0.00')
        tax = Decimal('0.00')
        risk_sum = Decimal('0.00')
        count = 0

        for it in items:
            gross += Decimal(str(it.unit_price)) * Decimal(str(it.quantity))
            line_discount += Decimal(str(it.discount_amount))
            cost += Decimal(str(it.cost_price)) * Decimal(str(it.quantity))
            tax += Decimal(str(it.tax_amount))
            risk_sum += Decimal(str(it.line_risk_score))
            count += 1

        subtotal_after_lines = gross - line_discount
        order_disc_pct = Decimal(str(self.order_discount_percent or '0.00'))
        order_discount = (subtotal_after_lines * (order_disc_pct / Decimal('100'))).quantize(Decimal('0.01'))
        total_discount = line_discount + order_discount
        net_before_tax = subtotal_after_lines - order_discount

        if subtotal_after_lines > Decimal('0.00') and order_discount > Decimal('0.00'):
            effective_tax = (tax * (net_before_tax / subtotal_after_lines)).quantize(Decimal('0.01'))
        else:
            effective_tax = tax.quantize(Decimal('0.01'))

        total_net = net_before_tax + effective_tax

        self.total_gross_amount = gross.quantize(Decimal('0.01'))
        self.total_discount_amount = total_discount.quantize(Decimal('0.01'))
        self.total_net_amount = total_net.quantize(Decimal('0.01'))
        self.total_cost = cost.quantize(Decimal('0.01'))

        if net_before_tax > Decimal('0.00'):
            margin = ((net_before_tax - cost) / net_before_tax) * Decimal('100')
            self.margin_percent = margin.quantize(Decimal('0.01'))
        else:
            self.margin_percent = Decimal('0.00')

        # Blended risk calculation
        risk_score = (risk_sum / Decimal(str(count))) if count > 0 else Decimal('10.00')
        if order_disc_pct > Decimal('5.00'):
            risk_score += Decimal('15.00')
        if self.margin_percent < Decimal('25.00'):
            risk_score += Decimal('25.00')
        if total_net > Decimal('1000000.00'):
            risk_score += Decimal('20.00')

        self.blended_risk_score = min(Decimal('100.00'), max(Decimal('10.00'), risk_score.quantize(Decimal('0.01'))))
        Quotation.objects.filter(pk=self.pk).update(
            total_gross_amount=self.total_gross_amount,
            total_discount_amount=self.total_discount_amount,
            total_net_amount=self.total_net_amount,
            total_cost=self.total_cost,
            margin_percent=self.margin_percent,
            blended_risk_score=self.blended_risk_score,
        )

    def save(self, *args, **kwargs):
        if not self.quotation_number:
            self.quotation_number = f"QT-2026-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)


class QuotationItem(models.Model):
    """
    Matches SQL:
        CREATE TABLE quotation_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            quotation_id INT NOT NULL,
            product_id INT NOT NULL,
            variant_id INT NULL,
            subscription_plan_id INT NULL,
            quantity INT NOT NULL DEFAULT 1,
            unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            cost_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            line_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            margin_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            margin_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            line_risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            CONSTRAINT fk_items_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
            CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id),
            CONSTRAINT fk_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
            CONSTRAINT fk_items_sub_plan FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        db_column='quotation_id',
        related_name='items',
        verbose_name='Quotation'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        db_column='product_id',
        related_name='quotation_items',
        verbose_name='Product'
    )
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='variant_id',
        related_name='quotation_items',
        verbose_name='Variant'
    )
    subscription_plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='subscription_plan_id',
        related_name='quotation_items',
        verbose_name='Subscription Plan'
    )
    quantity = models.IntegerField(default=1, verbose_name='Quantity')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Unit Price')
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Cost Price')
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name='Discount (%)')
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Discount Amount')
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Tax Amount')
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Line Total')
    margin_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name='Margin Amount')
    margin_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name='Margin (%)')
    line_risk_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name='Line Risk Score')

    class Meta:
        db_table = 'quotation_items'
        verbose_name = 'Quotation Item'
        verbose_name_plural = 'Quotation Items'
        ordering = ['id']

    def __str__(self):
        return f"{self.quotation.quotation_number} - {self.product.name} (Qty: {self.quantity})"

    def save(self, *args, **kwargs):
        if self.product:
            if not self.unit_price:
                self.unit_price = self.product.list_price
            if not self.cost_price:
                self.cost_price = self.product.cost_price
            tax_rate = Decimal(str(self.product.tax_rate or '0.00'))
        else:
            tax_rate = Decimal('0.00')

        qty = Decimal(str(self.quantity or 1))
        u_price = Decimal(str(self.unit_price or '0.00'))
        c_price = Decimal(str(self.cost_price or '0.00'))
        disc_pct = Decimal(str(self.discount_percent or '0.00'))

        gross = u_price * qty
        disc_amt = gross * (disc_pct / Decimal('100'))
        net_after_disc = gross - disc_amt
        tax_amt = net_after_disc * (tax_rate / Decimal('100'))
        l_tot = net_after_disc + tax_amt

        cost_tot = c_price * qty
        m_amt = net_after_disc - cost_tot
        m_pct = ((m_amt / net_after_disc) * Decimal('100')) if net_after_disc > Decimal('0.00') else Decimal('0.00')

        self.discount_amount = disc_amt.quantize(Decimal('0.01'))
        self.tax_amount = tax_amt.quantize(Decimal('0.01'))
        self.line_total = l_tot.quantize(Decimal('0.01'))
        self.margin_amount = m_amt.quantize(Decimal('0.01'))
        self.margin_percent = m_pct.quantize(Decimal('0.01'))

        # Governance & Line Risk calculation
        ceiling = Decimal('10.00')
        try:
            if self.product and self.product.category:
                ceiling = Decimal(str(self.product.category.max_discretionary_discount or '10.00'))
            if self.quotation and self.quotation.customer and self.quotation.customer.tier:
                tier = self.quotation.customer.tier
                if self.product and self.product.category:
                    rule = DiscountTierRule.objects.filter(tier=tier, category=self.product.category).first()
                    if rule:
                        ceiling = Decimal(str(rule.max_allowed_discount))
                    else:
                        ceiling = max(ceiling, Decimal(str(tier.discount_percentage or '10.00')))
                else:
                    ceiling = Decimal(str(tier.discount_percentage or '10.00'))
        except Exception:
            pass

        if disc_pct > ceiling:
            diff = disc_pct - ceiling
            risk = Decimal('15.00') + (diff * Decimal('4.00'))
            self.line_risk_score = min(Decimal('100.00'), risk.quantize(Decimal('0.01')))
        else:
            self.line_risk_score = Decimal('10.00')

        super().save(*args, **kwargs)


class ApprovalRequest(models.Model):
    """
    Matches SQL:
        CREATE TABLE approval_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            quotation_id INT NOT NULL,
            blended_risk_score DECIMAL(5,2) NOT NULL,
            status ENUM('PENDING', 'APPROVED', 'REJECTED', 'RETURNED') NOT NULL DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_approvals_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        RETURNED = 'RETURNED', 'Returned'

    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        db_column='quotation_id',
        related_name='approval_requests',
        verbose_name='Quotation'
    )
    blended_risk_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name='Blended Risk Score'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='Status'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')

    class Meta:
        db_table = 'approval_requests'
        verbose_name = 'Approval Request'
        verbose_name_plural = 'Approval Requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"Approval for {self.quotation.quotation_number} [{self.get_status_display()}]"


class DealHealthAlert(models.Model):
    """
    Matches SQL:
        CREATE TABLE deal_health_alerts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            quotation_id INT NOT NULL,
            resolved_by_user_id INT NULL,
            alert_type ENUM('STALLED_DEAL', 'DISCOUNT_ANOMALY', 'DELIVERY_SLIPPAGE', 'MARGIN_RISK') NOT NULL,
            severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'LOW',
            description TEXT NOT NULL,
            is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_alerts_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
            CONSTRAINT fk_alerts_user FOREIGN KEY (resolved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    class AlertType(models.TextChoices):
        STALLED_DEAL = 'STALLED_DEAL', 'Stalled Deal'
        DISCOUNT_ANOMALY = 'DISCOUNT_ANOMALY', 'Discount Anomaly'
        DELIVERY_SLIPPAGE = 'DELIVERY_SLIPPAGE', 'Delivery Slippage'
        MARGIN_RISK = 'MARGIN_RISK', 'Margin Risk'

    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        db_column='quotation_id',
        related_name='health_alerts',
        verbose_name='Quotation'
    )
    resolved_by_user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='resolved_by_user_id',
        related_name='resolved_deal_alerts',
        verbose_name='Resolved By'
    )
    alert_type = models.CharField(
        max_length=30,
        choices=AlertType.choices,
        verbose_name='Alert Type'
    )
    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.LOW,
        verbose_name='Severity'
    )
    description = models.TextField(verbose_name='Description')
    is_resolved = models.BooleanField(default=False, verbose_name='Is Resolved')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')

    class Meta:
        db_table = 'deal_health_alerts'
        verbose_name = 'Deal Health Alert'
        verbose_name_plural = 'Deal Health Alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_severity_display()}] {self.get_alert_type_display()} - {self.quotation.quotation_number}"
