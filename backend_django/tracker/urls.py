from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'moods', views.MoodViewSet)
router.register(r'activities', views.ActivityViewSet)
router.register(r'goals', views.GoalViewSet, basename='goal')
router.register(r'daily-entries', views.DailyEntryViewSet, basename='dailyentry')
router.register(r'entry-activities', views.EntryActivityViewSet, basename='entryactivity')
router.register(r'mood-logs', views.MoodLogViewSet, basename='moodlog')
router.register(r'suggestions', views.SuggestionViewSet, basename='suggestion')
router.register(r'meditation-sessions', views.MeditationSessionViewSet, basename='meditationsession')
router.register(r'habits', views.HabitViewSet, basename='habit')
router.register(r'habit-completions', views.HabitCompletionViewSet, basename='habitcompletion')
router.register(r'insights', views.InsightViewSet, basename='insight')
router.register(r'assessments', views.AssessmentQuestionnaireViewSet, basename='assessment')
router.register(r'assessment-responses', views.AssessmentResponseViewSet, basename='assessmentresponse')

urlpatterns = [
    path('', include(router.urls)),
]
