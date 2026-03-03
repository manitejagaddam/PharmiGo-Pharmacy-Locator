from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.shortcuts import render
from .models import Medicine
from .serializers import MedicineSerializer
from .permissions import IsAdminUserOnly

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [IsAdminUserOnly()]
        return [AllowAny()]


# Temporary Frontend Views

def search_page(request):
    query = request.GET.get('search', '')
    medicines = Medicine.objects.filter(name__icontains=query)
    return render(request, 'medicines/search.html', {
        'medicines': medicines
    })

def get_list(request):
    medicines = Medicine.objects.all()
    return render(request, 'medicines/admin_crud.html', {
        'medicines': medicines
    })