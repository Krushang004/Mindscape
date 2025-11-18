# Mental Health Tracker

A comprehensive mobile application designed to help users monitor and improve their mental health through daily mood tracking, goal setting, activity logging, and progress visualization.

## 🚀 Features

- **🔐 Secure Authentication**: Google OAuth 2.0 integration
- **📊 Mood Tracking**: Daily mood logging with visual analytics
- **🎯 Goal Setting**: Personal mental health goals and progress tracking
- **📝 Activity Logging**: Track daily activities and their impact
- **📈 Progress Visualization**: Charts and insights for mental health trends
- **🌙 Dark/Light Mode**: Customizable theme system
- **📱 Cross-Platform**: Works on iOS, Android, and Web
- **🔒 Privacy-First**: Local data storage with optional cloud sync

## 🛠️ Technology Stack

### Frontend
- **React Native** (v0.79.5) - Cross-platform mobile development
- **TypeScript** (v5.x) - Type-safe JavaScript
- **Expo SDK** (v52) - Development platform and tools
- **React Navigation** - Screen navigation management
- **Context API** - State management

### Backend
- **Django** (Python) - RESTful API backend
- **SQLite** - Local database storage
- **JWT** - Authentication tokens

### Authentication
- **Google OAuth 2.0** - Third-party authentication
- **JWT Tokens** - Secure session management

### UI/UX
- **React Native Styling** - Component styling
- **Linear Gradients** - Visual enhancement
- **Custom Theme System** - Dark/Light mode support
- **Ionicons** - Icon library

## 📱 Screenshots

[Add screenshots here]

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd mental-health-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Install Expo Go on your phone
   - Scan the QR code from the terminal
   - Or press 'a' for Android emulator or 'i' for iOS simulator

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://<your-domain>/auth/google/callback` (replace `<your-domain>` with your HTTPS backend URL)

### Environment Variables
Create a `.env` file in the root directory:
```env
GOOGLE_CLIENT_ID=your_google_client_id
API_BASE_URL=your_backend_api_url
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Mood Entries Table
```sql
CREATE TABLE mood_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  mood_score INTEGER,
  notes TEXT,
  activities TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🔒 Security Features

- **Encrypted Storage**: Sensitive data protection
- **Secure Communication**: HTTPS API calls
- **Token Management**: Secure authentication tokens
- **Input Validation**: XSS and injection prevention
- **Local Data Storage**: User privacy protection

## 📈 Performance Optimizations

- **Lazy Loading**: Component loading optimization
- **Memoization**: React.memo and useMemo
- **Bundle Splitting**: Code splitting strategies
- **Image Optimization**: Efficient image handling
- **Memory Management**: Proper cleanup and garbage collection

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 📱 Building for Production

### Android APK
```bash
# Development build
eas build --platform android --profile development

# Preview build (for testing)
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

### iOS Builds

#### Prerequisites for iOS
1. **Apple Developer Account**: You need an active Apple Developer account ($99/year)
2. **Xcode**: Install Xcode from the Mac App Store (macOS only)
3. **EAS CLI**: Make sure you have EAS CLI installed and configured
   ```bash
   npm install -g eas-cli
   eas login
   ```

#### iOS Build Commands

**Development Build (Simulator)**
```bash
eas build --platform ios --profile development
```

**Preview Build (Device)**
```bash
eas build --platform ios --profile preview
```

**Production Build (App Store)**
```bash
eas build --platform ios --profile production
```

**iOS Simulator Build**
```bash
eas build --platform ios --profile ios-simulator
```

**iOS Device Build**
```bash
eas build --platform ios --profile ios-device
```

#### iOS Build Configuration
- **Bundle Identifier**: `com.mentalhealthtracker.app`
- **Build Number**: Auto-incremented in production
- **Minimum iOS Version**: iOS 13.0+ (default)
- **Encryption**: Non-exempt encryption (no export compliance needed)

#### Submitting to App Store
```bash
# Build and submit to App Store
eas build --platform ios --profile production --auto-submit

# Or submit an existing build
eas submit --platform ios --profile production
```

**Note**: Make sure to update the `submit.production.ios` section in `eas.json` with your Apple ID, App Store Connect App ID, and Team ID before submitting.

### Web Build
```bash
npx expo export:web
```

## 📚 Documentation

For detailed technical documentation, see:
- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Component Library](./COMPONENT_LIBRARY.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Krushang Prajapati**
- Email: krushangrprajapati@gmail.com
- GitHub: [@krushang_04](https://github.com/krushang_04)

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community for the excellent documentation
- Google for OAuth 2.0 authentication
- All contributors and testers

---

## 📋 How to Convert Documentation to PDF

### Option 1: Using Online Tools
1. Copy the content from `TECHNICAL_DOCUMENTATION.md`
2. Go to [MD to PDF](https://md-to-pdf.fly.dev/) or [Pandoc Online](https://pandoc.org/try/)
3. Paste the markdown content
4. Download the generated PDF

### Option 2: Using VS Code
1. Install the "Markdown PDF" extension
2. Open `TECHNICAL_DOCUMENTATION.md`
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Markdown PDF: Export (pdf)"
5. Select the option to generate PDF

### Option 3: Using Pandoc (Command Line)
```bash
# Install Pandoc first
npm install -g pandoc

# Convert markdown to PDF
pandoc TECHNICAL_DOCUMENTATION.md -o MentalHealthTracker_Technical_Documentation.pdf
```

### Option 4: Using Browser Print
1. Open `TECHNICAL_DOCUMENTATION.md` in a markdown viewer
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Select "Save as PDF"
4. Choose your desired settings and save

---

*This README provides a comprehensive overview of the Mental Health Tracker application. For detailed technical information, refer to the technical documentation.* 