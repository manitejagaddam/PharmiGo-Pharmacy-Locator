from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicineViewSet, search_page, get_list

router = DefaultRouter()
router.register(r'medicines', MedicineViewSet, basename='medicine')

urlpatterns = [
    path('api/', include(router.urls)),
    path('', search_page, name='search-page'),
    path('list-of-items-in-store/', get_list, name='list-of-items-in-store'),
]