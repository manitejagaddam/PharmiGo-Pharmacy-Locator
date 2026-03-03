from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import render
from .models import Medicine
from .serializers import MedicineSerializer
from .permissions import IsAdminUserOnly


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    # Search, filter, and ordering support
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    # ?search=amox   → searches name, brand, formula, description
    search_fields = ['name', 'brand', 'formula', 'description']
    # ?brand=Pfizer  → exact filter
    filterset_fields = ['brand']
    # ?ordering=name or ?ordering=-created_at
    ordering_fields = ['name', 'brand', 'created_at']
    ordering = ['name']  # default ordering

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [IsAdminUserOnly()]
        return [AllowAny()]


# Legacy template views (no longer used by React frontend)
def search_page(request):
    query = request.GET.get('search', '')
    medicines = Medicine.objects.filter(name__icontains=query)
    return render(request, 'medicines/search.html', {'medicines': medicines})


def get_list(request):
    medicines = Medicine.objects.all()
    return render(request, 'medicines/admin_crud.html', {'medicines': medicines})