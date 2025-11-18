# 🧠 Mental Health Tracker

A beautiful, offline-first desktop application for tracking your mental health and emotional well-being. Built with Electron and React, this app keeps all your data local and private.

## ✨ Features

### Core Features

-   **Mood Tracking**: 
    -   Daily mood check-in (emojis, sliders, or custom icons)
    -   Option to add notes, journal entries, or triggers
    -   Graphs showing weekly/monthly mood trends
-   **Journal / Diary**: 
    -   Text or voice journaling
    -   Mood tagging (e.g., “anxious,” “grateful,” “tired”)
    -   Optional AI summarization or sentiment analysis
-   **Habit & Routine Tracker**: 
    -   Track mental health-related habits (e.g., sleep, exercise, water, meditation)
    -   Streaks and progress visualization
-   **Mental Health Assessments**: 
    -   Scientifically backed questionnaires (PHQ-9, GAD-7, etc.)
    -   Automated scoring with recommendations

### Engagement & Motivation

-   **Daily Reminders**: 
    -   Custom notifications for journaling, meditation, or check-ins
    -   Smart reminders based on user’s patterns
-   **Motivational Quotes / Affirmations**: 
    -   Personalized daily inspiration
    -   Option to save or favorite quotes
-   **Gamification**: 
    -   Streaks, badges, milestones for consistency
    -   Progress visualization and gentle nudges

### Support & Social Connection

-   **Emergency / SOS Feature**: 
    -   Button to contact nominee / therapist / hotline
    -   Quick geolocation-based help (optional)
-   **Nominee Alert System**: 
    -   Sends alert to trusted contact if stress levels exceed threshold
    -   Maintains privacy (doesn’t show journal content)
-   **Community Support (Optional)**: 
    -   Anonymous discussion boards
    -   Peer encouragement or moderated groups

### Therapeutic Tools

-   **Guided Meditation & Breathing Exercises**: 
    -   Built-in sessions for stress, anxiety, focus, or sleep
    -   Animated breathing visuals
-   **Cognitive Behavioral Therapy (CBT) Tools**: 
    -   Thought diary
    -   Reframing negative thoughts
-   **Mindfulness Timer / Relaxation Sounds**: 
    -   Ambient music or sleep stories

### AI & Smart Insights

-   **AI Mood Prediction**: 
    -   Detect mood trends using past data
    -   Suggest activities (e.g., walk, rest, talk to a friend)
-   **AI Chat Support (Optional)**: 
    -   Empathetic chatbot trained for positive reinforcement
    -   Integrate GPT-based journaling suggestions
-   **Smart Reports**: 
    -   Weekly summaries & stress level graphs
    -   Export data as PDF for therapists

### Privacy & Security

-   **End-to-End Encryption**: 
    -   Secure journals & user data
-   **Anonymous Mode**: 
    -   No personal info required to use app
-   **PIN / Biometric Lock**: 
    -   Face ID or fingerprint protection

### Technical & UX Enhancements

-   **Offline Mode**: 
    -   Save entries locally (sync when online)
-   **Custom Themes**: 
    -   Light/Dark mode, calming color palettes
-   **Voice Input**: 
    -   Record emotional logs hands-free
-   **Cloud Backup**: 
    -   Option to restore on reinstall / multiple devices

### Advanced / Unique Ideas

-   **AR-Based Relaxation**: 
    -   Visual breathing guides using AR filters
-   **Wearable Integration**: 
    -   Sync data from smartwatch (heart rate, sleep, stress)
-   **Therapist Portal**: 
    -   Allow optional sharing of progress with professionals
-   **AI Sentiment Journal Analysis**: 
    -   Detect patterns like burnout, insomnia, or anxiety spikes
-   **Crisis Detection**: 
    -   Trigger alert if user enters worrying text patterns (“I can’t do this anymore”) — with ethical and optional consent
-   **Personalized Wellness Plan**: 
    -   AI-generated daily plan based on stress and habits
-   **Voice Emotion Recognition**: 
    -   Detect stress from tone during journaling (advanced)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Vercel OAuth Redirect API
This repo now includes a lightweight serverless function under `api/auth/google/callback` which Vercel deploys automatically. It exchanges Google authorization codes for tokens and redirects back to the mobile app (`mentalhealthtracker://auth`). To configure it:

1. In the Vercel project settings add the following Environment Variables:
   - `GOOGLE_CLIENT_ID` – your web OAuth client ID
   - `GOOGLE_CLIENT_SECRET` – client secret for the same OAuth client
   - `APP_DEEP_LINK` – defaults to `mentalhealthtracker://auth`, override if you change the scheme
   - `PUBLIC_BASE_URL` – optional override if the deployment URL differs from Vercel’s default
2. Ensure the OAuth redirect URI `https://mental-health-tracker-xi.vercel.app/auth/google/callback` (or your custom Vercel domain) is added in Google Cloud Console.
3. Update `MentalHealthTracker/src/config.ts` to set `OAUTH_REDIRECT_BASE` to this Vercel URL so the mobile app requests the correct redirect target.

The rest of the API (`API_BASE`) can continue pointing at your Django backend; only the OAuth hop is handled by Vercel.

### Installation

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the app**:
   ```bash
   npm run dev
   ```

4. **Run the app**:
   ```bash
   npm start
   ```

## 📱 How to Use

### Daily Entry
1. **Select Your Mood**: Click on an emoji that represents how you're feeling
2. **Write a Summary**: Describe your day in one sentence
3. **Optional Journaling**: Add more details if you want
4. **Get Suggestions**: The app will show helpful suggestions based on your mood
5. **Save**: Click "Save Today's Entry" to store your entry

### Viewing History
- Switch to the "History" tab to see all your past entries
- Click on any entry to view full details
- Entries are sorted by date (newest first)

## 🎨 Mood Options

- 😊 **Happy** - Feeling joyful and content
- 😔 **Sad** - Feeling down or blue
- 😡 **Angry** - Feeling frustrated or upset
- 😰 **Anxious** - Feeling worried or nervous
- 😴 **Tired** - Feeling exhausted or sleepy
- 😌 **Calm** - Feeling peaceful and relaxed
- 🤔 **Confused** - Feeling uncertain or unclear
- 😤 **Frustrated** - Feeling stuck or annoyed
- 🥰 **Loved** - Feeling cared for and appreciated
- 😎 **Confident** - Feeling strong and capable

## 🔧 Development

### Project Structure
```
mental-health-tracker/
├── src/
│   ├── components/     # React components
│   ├── types.ts        # TypeScript definitions
│   ├── App.tsx         # Main app component
│   ├── index.tsx       # React entry point
│   └── styles.css      # App styles
├── public/
│   └── index.html      # HTML template
├── main.js             # Electron main process
├── webpack.config.js   # Webpack configuration
└── package.json        # Project dependencies
```

### Available Scripts
- `npm run dev` - Build and start the app in development mode
- `npm start` - Start the app (requires build first)
- `npm run build` - Build for production
- `npm run watch` - Watch for changes and rebuild

## 🔒 Privacy & Data

- **100% Offline**: No data is ever sent to external servers
- **Local Storage**: All entries are stored locally on your device
- **No Tracking**: No analytics, tracking, or data collection
- **Your Data**: You have complete control over your mental health data

## 🛠️ Built With

- **Electron** - Cross-platform desktop app framework
- **React** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundler
- **CSS3** - Modern styling with gradients and animations

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Tips for Mental Health

- **Be Consistent**: Try to make an entry every day
- **Be Honest**: Your entries are private - be truthful about your feelings
- **Use the Suggestions**: The app's suggestions are designed to help
- **Review Regularly**: Check your history to spot patterns
- **Seek Help**: If you're struggling, don't hesitate to reach out to professionals

---

**Remember**: This app is a tool to help you track your mental health, but it's not a substitute for professional mental health care. If you're experiencing severe distress, please reach out to a mental health professional or crisis hotline. 
