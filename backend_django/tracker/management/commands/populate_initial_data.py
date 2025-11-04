from django.core.management.base import BaseCommand
from tracker.models import Mood, Activity, AssessmentQuestionnaire, AssessmentQuestion


class Command(BaseCommand):
    help = 'Populate database with initial moods and activities'

    def handle(self, *args, **options):
        self.stdout.write('Populating initial data...')
        
        # Create moods
        moods_data = [
            {
                'name': 'excellent',
                'emoji': '😄',
                'color': '#4CAF50',
                'description': 'Feeling great and positive'
            },
            {
                'name': 'good',
                'emoji': '🙂',
                'color': '#8BC34A',
                'description': 'Feeling good and content'
            },
            {
                'name': 'neutral',
                'emoji': '😐',
                'color': '#FFC107',
                'description': 'Feeling okay, neither good nor bad'
            },
            {
                'name': 'bad',
                'emoji': '😔',
                'color': '#FF9800',
                'description': 'Feeling down or sad'
            },
            {
                'name': 'terrible',
                'emoji': '😢',
                'color': '#F44336',
                'description': 'Feeling very low or depressed'
            }
        ]
        
        for mood_data in moods_data:
            mood, created = Mood.objects.get_or_create(
                name=mood_data['name'],
                defaults=mood_data
            )
            if created:
                self.stdout.write(f'Created mood: {mood.name}')
            else:
                self.stdout.write(f'Mood already exists: {mood.name}')
        
        # Create activities
        activities_data = [
            # Exercise
            {'name': 'Walking', 'category': 'exercise', 'description': 'Going for a walk', 'icon': '🚶'},
            {'name': 'Running', 'category': 'exercise', 'description': 'Going for a run', 'icon': '🏃'},
            {'name': 'Yoga', 'category': 'exercise', 'description': 'Practicing yoga', 'icon': '🧘'},
            {'name': 'Gym Workout', 'category': 'exercise', 'description': 'Working out at the gym', 'icon': '💪'},
            {'name': 'Swimming', 'category': 'exercise', 'description': 'Swimming', 'icon': '🏊'},
            
            # Social
            {'name': 'Meeting Friends', 'category': 'social', 'description': 'Spending time with friends', 'icon': '👥'},
            {'name': 'Family Time', 'category': 'social', 'description': 'Spending time with family', 'icon': '👨‍👩‍👧‍👦'},
            {'name': 'Phone Call', 'category': 'social', 'description': 'Talking on the phone', 'icon': '📞'},
            {'name': 'Video Chat', 'category': 'social', 'description': 'Video calling someone', 'icon': '📹'},
            
            # Creative
            {'name': 'Drawing', 'category': 'creative', 'description': 'Drawing or sketching', 'icon': '✏️'},
            {'name': 'Painting', 'category': 'creative', 'description': 'Painting', 'icon': '🎨'},
            {'name': 'Writing', 'category': 'creative', 'description': 'Writing or journaling', 'icon': '✍️'},
            {'name': 'Music', 'category': 'creative', 'description': 'Playing or listening to music', 'icon': '🎵'},
            {'name': 'Cooking', 'category': 'creative', 'description': 'Cooking or baking', 'icon': '👨‍🍳'},
            
            # Learning
            {'name': 'Reading', 'category': 'learning', 'description': 'Reading a book or article', 'icon': '📚'},
            {'name': 'Online Course', 'category': 'learning', 'description': 'Taking an online course', 'icon': '💻'},
            {'name': 'Language Learning', 'category': 'learning', 'description': 'Learning a new language', 'icon': '🗣️'},
            {'name': 'Puzzle', 'category': 'learning', 'description': 'Solving puzzles or brain games', 'icon': '🧩'},
            
            # Relaxation
            {'name': 'Meditation', 'category': 'relaxation', 'description': 'Meditating', 'icon': '🧘‍♀️'},
            {'name': 'Deep Breathing', 'category': 'relaxation', 'description': 'Deep breathing exercises', 'icon': '🫁'},
            {'name': 'Bath', 'category': 'relaxation', 'description': 'Taking a relaxing bath', 'icon': '🛁'},
            {'name': 'Nature Walk', 'category': 'relaxation', 'description': 'Walking in nature', 'icon': '🌳'},
            {'name': 'Tea Time', 'category': 'relaxation', 'description': 'Having a cup of tea', 'icon': '☕'},
            
            # Work
            {'name': 'Work Project', 'category': 'work', 'description': 'Working on a project', 'icon': '💼'},
            {'name': 'Meeting', 'category': 'work', 'description': 'Attending a meeting', 'icon': '🤝'},
            {'name': 'Email', 'category': 'work', 'description': 'Checking emails', 'icon': '📧'},
            {'name': 'Planning', 'category': 'work', 'description': 'Planning and organizing', 'icon': '📋'},
            
            # Other
            {'name': 'Shopping', 'category': 'other', 'description': 'Going shopping', 'icon': '🛒'},
            {'name': 'Cleaning', 'category': 'other', 'description': 'Cleaning or organizing', 'icon': '🧹'},
            {'name': 'Gaming', 'category': 'other', 'description': 'Playing video games', 'icon': '🎮'},
            {'name': 'Watching TV', 'category': 'other', 'description': 'Watching television', 'icon': '📺'},
        ]
        
        for activity_data in activities_data:
            activity, created = Activity.objects.get_or_create(
                name=activity_data['name'],
                defaults=activity_data
            )
            if created:
                self.stdout.write(f'Created activity: {activity.name}')
            else:
                self.stdout.write(f'Activity already exists: {activity.name}')

        # Create assessments (PHQ-9 & GAD-7)
        phq9, _ = AssessmentQuestionnaire.objects.get_or_create(
            key='phq9',
            defaults={'title': 'PHQ-9', 'description': 'Patient Health Questionnaire-9 for depression screening'}
        )
        gad7, _ = AssessmentQuestionnaire.objects.get_or_create(
            key='gad7',
            defaults={'title': 'GAD-7', 'description': 'Generalized Anxiety Disorder-7 assessment'}
        )

        phq9_questions = [
            'Little interest or pleasure in doing things',
            'Feeling down, depressed, or hopeless',
            'Trouble falling or staying asleep, or sleeping too much',
            'Feeling tired or having little energy',
            'Poor appetite or overeating',
            'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
            'Trouble concentrating on things, such as reading the newspaper or watching television',
            'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
            'Thoughts that you would be better off dead or of hurting yourself in some way',
        ]
        for idx, text in enumerate(phq9_questions, start=1):
            AssessmentQuestion.objects.get_or_create(
                questionnaire=phq9, order=idx, defaults={'text': text}
            )

        gad7_questions = [
            'Feeling nervous, anxious, or on edge',
            'Not being able to stop or control worrying',
            'Worrying too much about different things',
            'Trouble relaxing',
            'Being so restless that it is hard to sit still',
            'Becoming easily annoyed or irritable',
            'Feeling afraid as if something awful might happen',
        ]
        for idx, text in enumerate(gad7_questions, start=1):
            AssessmentQuestion.objects.get_or_create(
                questionnaire=gad7, order=idx, defaults={'text': text}
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully populated initial data!'))
