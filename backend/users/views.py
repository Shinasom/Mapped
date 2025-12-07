# ============================================
# 3. backend/users/views.py (UPDATE)
# ============================================
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .serializers import SignupSerializer

class SignupView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # TODO: Send verification email here
            # send_verification_email(user)
            
            return Response({
                'message': 'Account created successfully',
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        
        # Return specific error messages
        errors = serializer.errors
        
        # Format error response
        if 'email' in errors:
            return Response({'error': 'email', 'message': str(errors['email'][0])}, status=400)
        elif 'phone' in errors:
            return Response({'error': 'phone', 'message': str(errors['phone'][0])}, status=400)
        elif 'username' in errors:
            return Response({'error': 'username', 'message': str(errors['username'][0])}, status=400)
        elif 'non_field_errors' in errors:
            return Response({'error': 'password', 'message': str(errors['non_field_errors'][0])}, status=400)
        
        return Response({'error': 'general', 'message': 'Signup failed'}, status=400)
