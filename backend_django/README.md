# Mental Health Tracker - Django Backend

A comprehensive Django REST API backend for mental health tracking applications.

## 🚀 Features

- **User Management**: Custom user model with Google OAuth support
- **Mood Tracking**: 5-level mood system with emojis and colors
- **Activity Tracking**: Categorized activities (exercise, social, creative, etc.)
- **Goal Management**: Daily, weekly, monthly, and long-term goals
- **Daily Entries**: Comprehensive daily mental health logging
- **Mood Logging**: Detailed mood tracking throughout the day
- **AI Suggestions**: Personalized wellness recommendations
- **RESTful API**: Full CRUD operations with proper authentication

## 🏗️ Architecture

- **Django 4.2.14**: Modern Django framework
- **Django REST Framework**: Powerful API framework
- **SQLite Database**: Lightweight database (can be upgraded to PostgreSQL)
- **Custom User Model**: Extended user functionality
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing enabled

## 📋 Requirements

- Python 3.8+
- Django 4.2.14
- Django REST Framework 3.15.2
- Other dependencies in `requirements.txt`

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend_django
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Populate initial data**
   ```bash
   python manage.py populate_initial_data
   ```

7. **Run the server**
   ```bash
   python manage.py runserver
   ```

## 🌐 API Endpoints

### Base URL: `http://localhost:8000/api/`

#### Users
- `GET /users/` - List users (admin only)
- `GET /users/profile/` - Get current user profile
- `PUT /users/update_profile/` - Update current user profile

#### Moods (Read-only)
- `GET /moods/` - List all moods
- `GET /moods/{id}/` - Get specific mood

#### Activities (Read-only)
- `GET /activities/` - List all activities
- `GET /activities/by_category/?category={category}` - Filter by category

#### Goals
- `GET /goals/` - List user's goals
- `POST /goals/` - Create new goal
- `GET /goals/{id}/` - Get specific goal
- `PUT /goals/{id}/` - Update goal
- `DELETE /goals/{id}/` - Delete goal
- `POST /goals/{id}/update_progress/` - Update goal progress

#### Daily Entries
- `GET /daily-entries/` - List user's daily entries
- `POST /daily-entries/` - Create new daily entry
- `GET /daily-entries/today/` - Get today's entry
- `GET /daily-entries/by_date/?date=YYYY-MM-DD` - Get entry by date
- `GET /daily-entries/recent/?days=7` - Get recent entries

#### Mood Logs
- `GET /mood-logs/` - List user's mood logs
- `POST /mood-logs/` - Create new mood log
- `GET /mood-logs/today/` - Get today's mood logs
- `GET /mood-logs/by_date_range/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Get logs by date range

#### Suggestions
- `GET /suggestions/` - List user's suggestions
- `POST /suggestions/{id}/mark_as_read/` - Mark suggestion as read
- `GET /suggestions/unread/` - Get unread suggestions

#### Assessments
- `GET /assessments/` - List available questionnaires (PHQ-9, GAD-7)
- `GET /assessments/{id}/` - Get questionnaire with questions
- `GET /assessment-responses/` - List current user's past assessment submissions
- `POST /assessment-responses/` - Submit assessment answers and receive score and category

## 🔐 Authentication

The API uses JWT tokens for authentication. To authenticate:

1. **Google OAuth**: POST to `/auth/google` with Google ID token
2. **Session Authentication**: For admin interface and testing
3. **Token Authentication**: For API requests

## 📊 Data Models

### User
- Extended Django user model
- Google OAuth integration
- Profile picture and additional fields

### Mood
- 5 levels: excellent, good, neutral, bad, terrible
- Emoji and color representation
- Description for each level

### Activity
- 7 categories: exercise, social, creative, learning, relaxation, work, other
- Icon and description
- Active/inactive status

### Goal
- Multiple types: daily, weekly, monthly, long-term
- Progress tracking
- Status management

### DailyEntry
- Daily mental health snapshot
- Mood, sleep, energy, stress levels
- Notes and activity tracking

## 🧪 Testing

Run the comprehensive API test:
```bash
python test_full_api.py
```

Test specific endpoints:
```bash
python test_api.py
```

## 🔧 Development

### Adding New Models
1. Create model in `tracker/models.py`
2. Add serializer in `tracker/serializers.py`
3. Create ViewSet in `tracker/views.py`
4. Add URL routing in `tracker/urls.py`
5. Register in admin in `tracker/admin.py`
6. Create and run migrations

### Custom Management Commands
- `populate_initial_data`: Populates moods and activities
- Add new commands in `tracker/management/commands/`

## 🚀 Production Deployment

1. **Environment Variables**: Set all required environment variables
2. **Database**: Consider PostgreSQL for production
3. **Static Files**: Configure static file serving
4. **Security**: Enable HTTPS and security headers
5. **Monitoring**: Set up logging and monitoring
6. **Backup**: Implement database backup strategy

## 📚 Documentation

- **API Documentation**: Available at `/api/` (DRF browsable API)
- **Admin Interface**: Available at `/admin/`
- **Code Documentation**: Inline docstrings and comments

## 🤝 Contributing

1. Follow Django coding standards
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## 📄 License

This project is part of the Mental Health Tracker application.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Happy Coding! 🧠💚**
