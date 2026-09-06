from django.contrib import admin
from .models import PortalNegotiation


@admin.register(PortalNegotiation)
class PortalNegotiationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'quotation_id',
        'customer_id',
        'requested_discount_percent',
        'requested_total',
        'status',
        'created_at',
    )
    list_filter = ('status', 'created_at')
    search_fields = ('quotation_id', 'customer_id')
    ordering = ('-created_at',)
