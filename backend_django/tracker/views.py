from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from datetime import datetime, timedelta
from .models import (
    User, Mood, Activity, Goal, DailyEntry, EntryActivity, MoodLog, Suggestion,
    MeditationSession, Habit, HabitCompletion, Insight,
    AssessmentQuestionnaire, AssessmentResponse
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
