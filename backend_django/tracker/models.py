from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """Custom user model for mental health tracking"""
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    profile_picture = models.URLField(max_length=500, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'


class Mood(models.Model):
    """Mood tracking model"""
    MOOD_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('neutral', 'Neutral'),
        ('bad', 'Bad'),
        ('terrible', 'Terrible'),
    ]
    
    name = models.CharField(max_length=20, choices=MOOD_CHOICES, unique=True)
    emoji = models.CharField(max_length=10)
    color = models.CharField(max_length=7)  # Hex color code
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name


class Activity(models.Model):
    """Activity tracking model"""
    ACTIVITY_CATEGORIES = [
        ('exercise', 'Exercise'),
        ('social', 'Social'),
        ('creative', 'Creative'),
        ('learning', 'Learning'),
        ('relaxation', 'Relaxation'),
        ('work', 'Work'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=ACTIVITY_CATEGORIES)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Icon identifier
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class Goal(models.Model):
    """Goal tracking model"""
    GOAL_TYPES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('long_term', 'Long Term'),
    ]
    
    GOAL_STATUS = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES)
    target_value = models.IntegerField(null=True, blank=True)
    current_value = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=GOAL_STATUS, default='active')
    start_date = models.DateField()
    target_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"


class DailyEntry(models.Model):
    """Daily mental health entry model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_entries')
    date = models.DateField()
    mood = models.ForeignKey(Mood, on_delete=models.SET_NULL, null=True, blank=True)
    sleep_hours = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    energy_level = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    stress_level = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"


class EntryActivity(models.Model):
    """Many-to-many relationship between daily entries and activities"""
    entry = models.ForeignKey(DailyEntry, on_delete=models.CASCADE, related_name='entry_activities')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    duration_minutes = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['entry', 'activity']


class MoodLog(models.Model):
    """Detailed mood logging throughout the day"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mood_logs')
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-timestamp']


class Suggestion(models.Model):
    """AI-generated suggestions based on user data"""
    SUGGESTION_TYPES = [
        ('mood', 'Mood Improvement'),
        ('activity', 'Activity Suggestion'),
        ('goal', 'Goal Setting'),
        ('general', 'General Wellness'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='suggestions')
    suggestion_type = models.CharField(max_length=20, choices=SUGGESTION_TYPES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


class MeditationSession(models.Model):
    """Meditation and breathing exercise sessions"""
    SESSION_TYPES = [
        ('breathing', 'Breathing Exercise'),
        ('mindfulness', 'Mindfulness'),
        ('guided', 'Guided Meditation'),
        ('body_scan', 'Body Scan'),
        ('loving_kindness', 'Loving Kindness'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meditation_sessions')
    name = models.CharField(max_length=200)
    duration = models.IntegerField()  # in minutes
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES)
    description = models.TextField()
    audio_url = models.URLField(max_length=500, null=True, blank=True)
    instructions = models.JSONField(default=list)
    mood_before = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    mood_after = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']


class Habit(models.Model):
    """User habits for tracking"""
    HABIT_CATEGORIES = [
        ('wellness', 'Wellness'),
        ('productivity', 'Productivity'),
        ('social', 'Social'),
        ('learning', 'Learning'),
        ('fitness', 'Fitness'),
        ('mindfulness', 'Mindfulness'),
    ]
    
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=HABIT_CATEGORIES)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    target_count = models.IntegerField(default=1)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    total_completions = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    reminder_time = models.TimeField(null=True, blank=True)
    color = models.CharField(max_length=7, default='#667eea')  # Hex color
    icon = models.CharField(max_length=50, default='star')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']


class HabitCompletion(models.Model):
    """Daily habit completions"""
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='completions')
    date = models.DateField()
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    mood = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['habit', 'date']
        ordering = ['-date']


class Insight(models.Model):
    """AI-generated insights from user data"""
    INSIGHT_TYPES = [
        ('mood_pattern', 'Mood Pattern'),
        ('habit_correlation', 'Habit Correlation'),
        ('activity_impact', 'Activity Impact'),
        ('sleep_mood', 'Sleep-Mood Correlation'),
        ('stress_trend', 'Stress Trend'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='insights')
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    data = models.JSONField(default=dict)
    confidence = models.FloatField(default=0.0)  # 0-1 scale
    actionable = models.BooleanField(default=False)
    recommendations = models.JSONField(default=list)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


# --- Assessments (PHQ-9, GAD-7) ---

class AssessmentQuestionnaire(models.Model):
    """Assessment questionnaires like PHQ-9, GAD-7"""
    ASSESSMENT_TYPES = [
        ('phq9', 'PHQ-9'),
        ('gad7', 'GAD-7'),
    ]

    key = models.CharField(max_length=20, choices=ASSESSMENT_TYPES, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class AssessmentQuestion(models.Model):
    """Questions belonging to an assessment questionnaire"""
    questionnaire = models.ForeignKey(AssessmentQuestionnaire, on_delete=models.CASCADE, related_name='questions')
    order = models.IntegerField()
    text = models.CharField(max_length=500)

    class Meta:
        unique_together = ['questionnaire', 'order']
        ordering = ['order']

    def __str__(self):
        return f"{self.questionnaire.key} Q{self.order}"


class AssessmentResponse(models.Model):
    """A user's response for one assessment submission (all questions)"""
    SCORE_SCALES = {
        'phq9': (0, 27),
        'gad7': (0, 21),
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_responses')
    questionnaire = models.ForeignKey(AssessmentQuestionnaire, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    total_score = models.IntegerField()
    result_category = models.CharField(max_length=50)

    class Meta:
        ordering = ['-submitted_at']


class AssessmentAnswer(models.Model):
    """Individual answers within a response"""
    response = models.ForeignKey(AssessmentResponse, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    value = models.IntegerField()  # 0-3 scale for both PHQ-9 and GAD-7

    class Meta:
        unique_together = ['response', 'question']