from rest_framework import serializers
from .models import (
    User, Mood, Activity, Goal, DailyEntry, EntryActivity, MoodLog,
    Suggestion, MeditationSession, Habit, HabitCompletion, Insight,
    AssessmentQuestionnaire, AssessmentQuestion, AssessmentResponse, AssessmentAnswer
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile_picture', 
                 'date_of_birth', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class MoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mood
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'


class GoalSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class EntryActivitySerializer(serializers.ModelSerializer):
    activity = ActivitySerializer(read_only=True)
    activity_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = EntryActivity
        fields = ['id', 'activity', 'activity_id', 'duration_minutes', 'notes']
        read_only_fields = ['id']


class DailyEntrySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    mood = MoodSerializer(read_only=True)
    mood_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    entry_activities = EntryActivitySerializer(many=True, read_only=True)
    
    class Meta:
        model = DailyEntry
        fields = ['id', 'user', 'date', 'mood', 'mood_id', 'sleep_hours', 'energy_level', 
                 'stress_level', 'notes', 'entry_activities', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class MoodLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    mood = MoodSerializer(read_only=True)
    mood_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MoodLog
        fields = ['id', 'user', 'mood', 'mood_id', 'timestamp', 'notes', 'location']
        read_only_fields = ['id', 'user', 'timestamp']


class SuggestionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Suggestion
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class DailyEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating daily entries with activities"""
    activities = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    
    class Meta:
        model = DailyEntry
        fields = ['date', 'mood_id', 'sleep_hours', 'energy_level', 'stress_level', 'notes', 'activities']
    
    def create(self, validated_data):
        activities_data = validated_data.pop('activities', [])
        user = self.context['request'].user
        
        # Create the daily entry
        daily_entry = DailyEntry.objects.create(user=user, **validated_data)
        
        # Create associated activities
        for activity_data in activities_data:
            EntryActivity.objects.create(
                entry=daily_entry,
                activity_id=activity_data.get('activity_id'),
                duration_minutes=activity_data.get('duration_minutes'),
                notes=activity_data.get('notes', '')
            )
        
        return daily_entry


class GoalCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating goals"""
    class Meta:
        model = Goal
        fields = ['title', 'description', 'goal_type', 'target_value', 'start_date', 'target_date']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class MeditationSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = MeditationSession
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class HabitSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Habit
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class HabitCompletionSerializer(serializers.ModelSerializer):
    habit = HabitSerializer(read_only=True)
    habit_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = HabitCompletion
        fields = ['id', 'habit', 'habit_id', 'date', 'completed', 'notes', 'mood', 'created_at']
        read_only_fields = ['id', 'created_at']


class InsightSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Insight
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


# --- Assessments ---

class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = ['id', 'order', 'text']


class AssessmentQuestionnaireSerializer(serializers.ModelSerializer):
    questions = AssessmentQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = AssessmentQuestionnaire
        fields = ['id', 'key', 'title', 'description', 'questions']


class AssessmentAnswerSerializer(serializers.ModelSerializer):
    question = AssessmentQuestionSerializer(read_only=True)
    question_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AssessmentAnswer
        fields = ['id', 'question', 'question_id', 'value']


class AssessmentResponseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    questionnaire = AssessmentQuestionnaireSerializer(read_only=True)
    questionnaire_id = serializers.IntegerField(write_only=True)
    answers = AssessmentAnswerSerializer(many=True)

    class Meta:
        model = AssessmentResponse
        fields = ['id', 'user', 'questionnaire', 'questionnaire_id', 'submitted_at', 'total_score', 'result_category', 'answers']
        read_only_fields = ['id', 'user', 'submitted_at', 'total_score', 'result_category']

    def create(self, validated_data):
        answers_data = validated_data.pop('answers', [])
        questionnaire_id = validated_data.pop('questionnaire_id')
        user = self.context['request'].user

        questionnaire = AssessmentQuestionnaire.objects.get(id=questionnaire_id)
        # Compute total score
        total_score = sum(int(a.get('value', 0)) for a in answers_data)

        # Determine category by questionnaire key
        def categorize_phq9(score: int) -> str:
            if score <= 4: return 'Minimal'
            if score <= 9: return 'Mild'
            if score <= 14: return 'Moderate'
            if score <= 19: return 'Moderately Severe'
            return 'Severe'

        def categorize_gad7(score: int) -> str:
            if score <= 4: return 'Minimal'
            if score <= 9: return 'Mild'
            if score <= 14: return 'Moderate'
            return 'Severe'

        if questionnaire.key == 'phq9':
            result_category = categorize_phq9(total_score)
        elif questionnaire.key == 'gad7':
            result_category = categorize_gad7(total_score)
        else:
            result_category = 'Unknown'

        response = AssessmentResponse.objects.create(
            user=user,
            questionnaire=questionnaire,
            total_score=total_score,
            result_category=result_category,
        )

        # Persist answers
        for ans in answers_data:
            AssessmentAnswer.objects.create(
                response=response,
                question_id=ans['question_id'],
                value=ans['value'],
            )

        return response
