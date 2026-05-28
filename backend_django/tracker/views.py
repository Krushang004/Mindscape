from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from datetime import datetime, timedelta
import random
import string
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .throttles import AuthRateThrottle
from .models import (
    User, Mood, Activity, Goal, DailyEntry, EntryActivity, MoodLog, Suggestion,
    MeditationSession, Habit, HabitCompletion, Insight,
    AssessmentQuestionnaire, AssessmentResponse, PasswordResetOTP
)
from .serializers import (
    UserSerializer, MoodSerializer, ActivitySerializer, GoalSerializer,
    DailyEntrySerializer, DailyEntryCreateSerializer, EntryActivitySerializer,
    MoodLogSerializer, SuggestionSerializer, GoalCreateSerializer,
    MeditationSessionSerializer, HabitSerializer, HabitCompletionSerializer, InsightSerializer,
    AssessmentQuestionnaireSerializer, AssessmentResponseSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners of an object to edit it."""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny],
            throttle_classes=[AuthRateThrottle])
    def request_password_reset_otp(self, request):
        """Request OTP for password reset - works for any email"""
        email = request.data.get('email', '').strip().lower()
        
        print(f"=== OTP Request Received ===")
        print(f"Email: {email}")
        print(f"Request data: {request.data}")
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate email format
        from django.core.validators import validate_email
        from django.core.exceptions import ValidationError
        try:
            validate_email(email)
        except ValidationError:
            return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists (for logging only)
        user_exists = User.objects.filter(email=email).exists()
        print(f"User exists: {user_exists}")
        
        # Generate 6-digit OTP
        otp = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Invalidate previous OTPs for this email
        PasswordResetOTP.objects.filter(email=email, is_used=False).update(is_used=True)
        
        # Create new OTP
        otp_obj = PasswordResetOTP.objects.create(
            email=email,
            otp=otp,
            expires_at=expires_at
        )
        print(f"OTP created for {email}: {otp} (expires at {expires_at})")
        
        # Send email
        try:
            result = send_mail(
                subject='Password Reset OTP - Mental Health Tracker',
                message=f'''Hello,

You have requested to reset your password for Mental Health Tracker.

Your OTP is: {otp}

This OTP will expire in 10 minutes.

If you did not request this password reset, please ignore this email.

Best regards,
Mental Health Tracker Team''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            print(f"Email sent successfully to {email}. Result: {result}")
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error sending email: {e}")
            print(f"Full traceback: {error_details}")
            return Response({
                'error': f'Failed to send OTP email: {str(e)}. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # For debugging: Also return OTP in development (remove in production)
        response_data = {
            'message': 'An OTP has been sent to your email address.'
        }
        if settings.DEBUG:
            response_data['debug_otp'] = otp  # Only in DEBUG mode
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny],
            throttle_classes=[AuthRateThrottle])
    def verify_password_reset_otp(self, request):
        """Verify OTP for password reset"""
        email = request.data.get('email', '').strip().lower()
        otp = request.data.get('otp', '').strip()
        
        if not email or not otp:
            return Response({
                'error': 'Email and OTP are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find valid OTP
        try:
            otp_obj = PasswordResetOTP.objects.filter(
                email=email,
                otp=otp,
                is_used=False,
                expires_at__gt=timezone.now()
            ).latest('created_at')
        except PasswordResetOTP.DoesNotExist:
            return Response({
                'error': 'Invalid or expired OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save()
        
        return Response({
            'message': 'OTP verified successfully',
            'verified': True
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny],
            throttle_classes=[AuthRateThrottle])
    def reset_password(self, request):
        """Reset password using verified OTP - creates user if doesn't exist"""
        email = request.data.get('email', '').strip().lower()
        otp = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '')
        
        if not email or not otp or not new_password:
            return Response({
                'error': 'Email, OTP, and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 6:
            return Response({
                'error': 'Password must be at least 6 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP was used (from verify step)
        try:
            otp_obj = PasswordResetOTP.objects.filter(
                email=email,
                otp=otp,
                is_used=True,
                expires_at__gt=timezone.now() - timedelta(minutes=5)  # Allow 5 min window after verification
            ).latest('created_at')
        except PasswordResetOTP.DoesNotExist:
            return Response({
                'error': 'Invalid or expired OTP. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user
        try:
            user = User.objects.get(email=email)
            # User exists, just update password
            user.set_password(new_password)
            user.save()
            print(f"Password reset for existing user: {email}")
        except User.DoesNotExist:
            # User doesn't exist, create new account
            # Generate username from email
            username = email.split('@')[0]
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            # Create new user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=new_password,
                first_name='',
                last_name=''
            )
            print(f"New user created during password reset: {email} (username: {username})")
        
        return Response({
            'message': 'Password set successfully. You can now login with your email and password.'
        }, status=status.HTTP_200_OK)


class MoodViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for mood data (read-only)"""
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer
    permission_classes = [permissions.AllowAny]


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for activity data (read-only)"""
    queryset = Activity.objects.filter(is_active=True)
    serializer_class = ActivitySerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get activities by category"""
        category = request.query_params.get('category', '')
        if category:
            activities = self.queryset.filter(category=category)
        else:
            activities = self.queryset
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)


class GoalViewSet(viewsets.ModelViewSet):
    """ViewSet for goal management"""
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GoalCreateSerializer
        return GoalSerializer
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update goal progress"""
        goal = self.get_object()
        new_value = request.data.get('current_value')
        
        if new_value is not None:
            goal.current_value = new_value
            if goal.target_value and goal.current_value >= goal.target_value:
                goal.status = 'completed'
            goal.save()
            serializer = self.get_serializer(goal)
            return Response(serializer.data)
        
        return Response({'error': 'current_value is required'}, status=status.HTTP_400_BAD_REQUEST)


class DailyEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for daily entry management"""
    serializer_class = DailyEntrySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return DailyEntry.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DailyEntryCreateSerializer
        return DailyEntrySerializer
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's entry"""
        today = datetime.now().date()
        entry = self.get_queryset().filter(date=today).first()
        if entry:
            serializer = self.get_serializer(entry)
            return Response(serializer.data)
        return Response({'message': 'No entry for today'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """Get entry by specific date"""
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            entry = self.get_queryset().filter(date=date).first()
            if entry:
                serializer = self.get_serializer(entry)
                return Response(serializer.data)
            return Response({'message': 'No entry for this date'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent entries"""
        days = int(request.query_params.get('days', 7))
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        entries = self.get_queryset().filter(date__range=[start_date, end_date])
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)


class EntryActivityViewSet(viewsets.ModelViewSet):
    """ViewSet for entry activity management"""
    serializer_class = EntryActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EntryActivity.objects.filter(entry__user=self.request.user)


class MoodLogViewSet(viewsets.ModelViewSet):
    """ViewSet for mood logging"""
    serializer_class = MoodLogSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return MoodLog.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's mood logs"""
        today = datetime.now().date()
        logs = self.get_queryset().filter(timestamp__date=today)
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_date_range(self, request):
        """Get mood logs by date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            logs = self.get_queryset().filter(timestamp__date__range=[start, end])
            serializer = self.get_serializer(logs, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)


class SuggestionViewSet(viewsets.ModelViewSet):
    """ViewSet for AI suggestions"""
    serializer_class = SuggestionSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Suggestion.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark suggestion as read"""
        suggestion = self.get_object()
        suggestion.is_read = True
        suggestion.save()
        serializer = self.get_serializer(suggestion)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread suggestions"""
        suggestions = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(suggestions, many=True)
        return Response(serializer.data)


class MeditationSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for meditation sessions"""
    serializer_class = MeditationSessionSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return MeditationSession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark meditation session as completed"""
        session = self.get_object()
        session.completed_at = datetime.now()
        session.mood_before = request.data.get('mood_before')
        session.mood_after = request.data.get('mood_after')
        session.save()
        serializer = self.get_serializer(session)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get completed meditation sessions"""
        sessions = self.get_queryset().filter(completed_at__isnull=False)
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)


class HabitViewSet(viewsets.ModelViewSet):
    """ViewSet for habits"""
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_completion(self, request, pk=None):
        """Toggle habit completion for today"""
        habit = self.get_object()
        today = datetime.now().date()
        
        completion, created = HabitCompletion.objects.get_or_create(
            habit=habit,
            date=today,
            defaults={'completed': True}
        )
        
        if not created:
            completion.completed = not completion.completed
            completion.save()
        
        # Update habit stats
        if completion.completed:
            habit.current_streak += 1
            habit.total_completions += 1
            habit.longest_streak = max(habit.longest_streak, habit.current_streak)
        else:
            habit.current_streak = 0
        
        habit.save()
        
        serializer = self.get_serializer(habit)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active habits"""
        habits = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(habits, many=True)
        return Response(serializer.data)


class HabitCompletionViewSet(viewsets.ModelViewSet):
    """ViewSet for habit completions"""
    serializer_class = HabitCompletionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return HabitCompletion.objects.filter(habit__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's habit completions"""
        today = datetime.now().date()
        completions = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(completions, many=True)
        return Response(serializer.data)


class InsightViewSet(viewsets.ModelViewSet):
    """ViewSet for insights"""
    serializer_class = InsightSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Insight.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark insight as read"""
        insight = self.get_object()
        insight.is_read = True
        insight.save()
        serializer = self.get_serializer(insight)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread insights"""
        insights = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(insights, many=True)
        return Response(serializer.data)


class AssessmentQuestionnaireViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to assessment questionnaires and questions"""
    queryset = AssessmentQuestionnaire.objects.prefetch_related('questions').all()
    serializer_class = AssessmentQuestionnaireSerializer
    permission_classes = [permissions.AllowAny]


class AssessmentResponseViewSet(viewsets.ModelViewSet):
    """Create and view user's assessment responses"""
    serializer_class = AssessmentResponseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssessmentResponse.objects.filter(user=self.request.user).select_related('questionnaire')
    
    @action(detail=False, methods=['get'])
    def actionable(self, request):
        """Get actionable insights"""
        insights = self.get_queryset().filter(actionable=True)
        serializer = self.get_serializer(insights, many=True)
        return Response(serializer.data)
