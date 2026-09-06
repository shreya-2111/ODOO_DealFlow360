from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import Role, User
from deals.models import (
    ApprovalRequest,
    Customer,
    CustomerTier,
    DealHealthAlert,
    Product,
    ProductCategory,
    ProductVariant,
    Quotation,
    QuotationItem,
    SubscriptionPlan,
)


class DealFlow360ApiTests(APITestCase):
    """
    Automated test suite validating the DealFlow360 REST APIs:
    - Customers & Tiers
    - Products & Variants
    - Quotations & Quotation Items (with automated financial calculations)
    - Workflow: Submit for Approval -> Sales Manager Approval
    - Deal Health Alerts & Resolution
    - Permission checks
    """

    def setUp(self):
        self.password = 'password123'

        # Roles
        self.role_admin, _ = Role.objects.get_or_create(role_name=Role.ADMIN)
        self.role_sales_manager, _ = Role.objects.get_or_create(role_name=Role.SALES_MANAGER)
        self.role_sales_rep, _ = Role.objects.get_or_create(role_name=Role.SALES_REPRESENTATIVE)

        # Users
        self.sales_rep = User.objects.create_user(
            email='rep.test@dealflow360.in',
            password=self.password,
            first_name='Rahul',
            last_name='Sharma',
            role=self.role_sales_rep,
        )

        self.sales_manager = User.objects.create_user(
            email='mgr.test@dealflow360.in',
            password=self.password,
            first_name='Sunita',
            last_name='Deshmukh',
            role=self.role_sales_manager,
            is_staff=True,
        )

        self.customer_user = User.objects.create_user(
            email='client.corp@gmail.com',
            password=self.password,
            first_name='Anil',
            last_name='Ambani',
            role=self.role_sales_rep,
        )

        # Auth credentials helper
        self.rep_token = str(RefreshToken.for_user(self.sales_rep).access_token)
        self.mgr_token = str(RefreshToken.for_user(self.sales_manager).access_token)

    def test_01_customer_tier_and_category_apis(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.rep_token}')

        # Create Tier
        res = self.client.post('/api/customer-tiers/', {
            'name': 'Gold Partner',
            'discount_percentage': '15.00'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'Gold Partner')

        # Create Category
        res = self.client.post('/api/categories/', {
            'name': 'Cloud Subscriptions',
            'max_discretionary_discount': '20.00'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'Cloud Subscriptions')

    def test_02_product_and_variant_apis(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.rep_token}')

        category = ProductCategory.objects.create(name='Hardware Servers', max_discretionary_discount=10.00)

        # Create Product
        prod_payload = {
            'category': category.id,
            'sku': 'SRV-DL380',
            'name': 'ProLiant DL380 Gen10',
            'product_type': 'ONE_TIME',
            'cost_price': '2000.00',
            'list_price': '3500.00',
            'tax_rate': '18.00',
            'is_active': True
        }
        res = self.client.post('/api/products/', prod_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        product_id = res.data['id']

        # Create Variant
        var_payload = {
            'product': product_id,
            'variant_sku': 'SRV-DL380-64GB',
            'attribute_name': 'RAM',
            'attribute_value': '64GB DDR4',
            'extra_cost': '300.00',
            'extra_price': '600.00'
        }
        res = self.client.post('/api/variants/', var_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['variant_sku'], 'SRV-DL380-64GB')

    def test_03_customer_creation(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.rep_token}')

        tier = CustomerTier.objects.create(name='Enterprise Tier', discount_percentage=10.00)

        customer_payload = {
            'user': self.customer_user.id,
            'tier': tier.id,
            'assigned_sales_rep': self.sales_rep.id,
            'company_name': 'Acme Global Pvt Ltd',
            'billing_address': 'Tower A, Tech Park, Bangalore',
            'shipping_address': 'Tower A, Tech Park, Bangalore'
        }
        res = self.client.post('/api/customers/', customer_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['company_name'], 'Acme Global Pvt Ltd')

    def test_04_quotation_and_item_calculations(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.rep_token}')

        tier = CustomerTier.objects.create(name='Standard Tier', discount_percentage=5.00)
        customer = Customer.objects.create(
            user=self.customer_user,
            tier=tier,
            assigned_sales_rep=self.sales_rep,
            company_name='Reliance Logistics',
            billing_address='Mumbai, India',
            shipping_address='Mumbai, India'
        )

        category = ProductCategory.objects.create(name='Networking', max_discretionary_discount=15.00)
        product = Product.objects.create(
            category=category,
            sku='RTR-CISCO-8000',
            name='Cisco 8000 Series Router',
            cost_price=Decimal('1000.00'),
            list_price=Decimal('1500.00'),
            tax_rate=Decimal('10.00'),
            is_active=True
        )

        # Create Quotation
        quotation_res = self.client.post('/api/quotations/', {
            'customer': customer.id,
            'quotation_number': 'QT-2026-001',
            'status': 'DRAFT',
        }, format='json')
        self.assertEqual(quotation_res.status_code, status.HTTP_201_CREATED)
        quotation_id = quotation_res.data['id']

        # Add Quotation Item: Qty 2, list_price 1500, discount 10%
        # Gross = 3000. Discount = 300. Net after disc = 2700. Tax (10%) = 270. Line total = 2970.
        item_res = self.client.post('/api/quotation-items/', {
            'quotation': quotation_id,
            'product': product.id,
            'quantity': 2,
            'unit_price': '1500.00',
            'cost_price': '1000.00',
            'discount_percent': '10.00',
            'line_risk_score': '2.50',
        }, format='json')
        self.assertEqual(item_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(item_res.data['discount_amount']), Decimal('300.00'))
        self.assertEqual(Decimal(item_res.data['tax_amount']), Decimal('270.00'))
        self.assertEqual(Decimal(item_res.data['line_total']), Decimal('2970.00'))

        # Check Quotation recalculated totals
        q_get = self.client.get(f'/api/quotations/{quotation_id}/')
        self.assertEqual(Decimal(q_get.data['total_gross_amount']), Decimal('3000.00'))
        self.assertEqual(Decimal(q_get.data['total_discount_amount']), Decimal('300.00'))
        self.assertEqual(Decimal(q_get.data['total_net_amount']), Decimal('2970.00'))
        self.assertEqual(Decimal(q_get.data['total_cost']), Decimal('2000.00'))

    def test_05_quotation_workflow_and_approval(self):
        # 1. Rep creates and submits quotation for approval
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.rep_token}')

        tier = CustomerTier.objects.create(name='Gold Tier', discount_percentage=10.00)
        customer = Customer.objects.create(
            user=self.customer_user,
            tier=tier,
            assigned_sales_rep=self.sales_rep,
            company_name='Tata Consultancy',
            billing_address='Pune, India',
            shipping_address='Pune, India'
        )
        quotation = Quotation.objects.create(
            customer=customer,
            sales_rep=self.sales_rep,
            quotation_number='QT-2026-APPROV',
            status=Quotation.Status.DRAFT,
            blended_risk_score=Decimal('4.50')
        )

        submit_res = self.client.post(f'/api/quotations/{quotation.id}/submit-approval/')
        self.assertEqual(submit_res.status_code, status.HTTP_200_OK)
        self.assertEqual(submit_res.data['quotation_status'], Quotation.Status.PENDING_APPROVAL)

        approval_id = submit_res.data['approval_request_id']
        self.assertTrue(ApprovalRequest.objects.filter(id=approval_id, status='PENDING').exists())

        # 2. Sales rep cannot approve (403 forbidden)
        rep_approve = self.client.post(f'/api/approval-requests/{approval_id}/approve/')
        self.assertEqual(rep_approve.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Sales Manager approves
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.mgr_token}')
        mgr_approve = self.client.post(f'/api/approval-requests/{approval_id}/approve/')
        self.assertEqual(mgr_approve.status_code, status.HTTP_200_OK)
        self.assertEqual(mgr_approve.data['status'], 'APPROVED')

        quotation.refresh_from_db()
        self.assertEqual(quotation.status, Quotation.Status.APPROVED)

    def test_06_deal_health_alert_and_resolution(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.rep_token}')

        tier = CustomerTier.objects.create(name='Silver Tier', discount_percentage=5.00)
        customer = Customer.objects.create(
            user=self.customer_user,
            tier=tier,
            assigned_sales_rep=self.sales_rep,
            company_name='Infosys',
            billing_address='Bangalore, India',
            shipping_address='Bangalore, India'
        )
        quotation = Quotation.objects.create(
            customer=customer,
            sales_rep=self.sales_rep,
            quotation_number='QT-2026-ALERT',
            status=Quotation.Status.DRAFT
        )

        alert_res = self.client.post('/api/deal-health-alerts/', {
            'quotation': quotation.id,
            'alert_type': 'MARGIN_RISK',
            'severity': 'HIGH',
            'description': 'Margin is under 15% threshold for enterprise deal.',
        }, format='json')
        self.assertEqual(alert_res.status_code, status.HTTP_201_CREATED)
        alert_id = alert_res.data['id']

        # Resolve alert
        resolve_res = self.client.post(f'/api/deal-health-alerts/{alert_id}/resolve/')
        self.assertEqual(resolve_res.status_code, status.HTTP_200_OK)
        self.assertTrue(resolve_res.data['is_resolved'])

    def test_07_unauthenticated_blocked(self):
        self.client.credentials()  # Clear credentials
        res = self.client.get('/api/quotations/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
