from django.contrib import admin
from django.urls import include,path


urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/',include('inventory.urls')),
    path("api/subscriptions/",include("subscriptions.urls")),
    path("api/billing/",include("billing.urls")),
    path("api/portal/", include("portal.urls")),
]