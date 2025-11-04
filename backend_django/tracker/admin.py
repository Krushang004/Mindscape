from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Mood, Activity, Goal, DailyEntry, EntryActivity, MoodLog, Suggestion


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'google_id', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'google_id']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Mental Health Tracker', {
            'fields': ('google_id', 'profile_picture', 'date_of_birth'),
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Mental Health Tracker', {
            'fields': ('google_id', 'profile_picture', 'date_of_birth'),
        }),
    )


@admin.register(Mood)
class MoodAdmin(admin.ModelAdmin):
    list_display = ['name', 'emoji', 'color', 'description']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['category', 'name']
    list_editable = ['is_active']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'goal_type', 'status', 'current_value', 'target_value', 'start_date', 'target_date']
    list_filter = ['goal_type', 'status', 'start_date', 'target_date']
    search_fields = ['title', 'description', 'user__username']
    ordering = ['-created_at']
    list_editable = ['status', 'current_value']
    date_hierarchy = 'start_date'


@admin.register(DailyEntry)
class DailyEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'mood', 'sleep_hours', 'energy_level', 'stress_level', 'created_at']
    list_filter = ['date', 'mood', 'energy_level', 'stress_level', 'created_at']
    search_fields = ['user__username', 'notes']
    ordering = ['-date']
    date_hierarchy = 'date'
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EntryActivity)
class EntryActivityAdmin(admin.ModelAdmin):
    list_display = ['entry', 'activity', 'duration_minutes', 'notes']
    list_filter = ['activity__category', 'duration_minutes']
    search_fields = ['entry__user__username', 'activity__name', 'notes']
    ordering = ['-entry__date']


@admin.register(MoodLog)
class MoodLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'mood', 'timestamp', 'location', 'notes']
    list_filter = ['mood', 'timestamp', 'location']
    search_fields = ['user__username', 'notes', 'location']
    ordering = ['-timestamp']
    date_hierarchy = 'timestamp'


@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display = ['user', 'suggestion_type', 'title', 'is_read', 'created_at']
    list_filter = ['suggestion_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title', 'content']
    ordering = ['-created_at']
    list_editable = ['is_read']
    readonly_fields = ['created_at']
