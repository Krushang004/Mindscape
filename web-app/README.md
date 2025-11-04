# Mental Health Tracker - Web Application

A modern, responsive web application for tracking mental health and mood. Built with React, TypeScript, Tailwind CSS, and Electron for desktop support.

## Features

- 📊 **Dashboard** - Visual overview of mood trends and statistics
- 📝 **Daily Entries** - Track mood, activities, and health metrics
- 📅 **History** - View past entries and progress
- 🎯 **Goals** - Set and track mental health goals (coming soon)
- 🏃 **Activities** - Manage and track activities (coming soon)
- ⚙️ **Settings** - Customize theme, notifications, and preferences
- 🌙 **Dark Mode** - Light and dark theme support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 💾 **Local Storage** - Data persists locally using Zustand
- 🖥️ **Desktop App** - Electron-based desktop application

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Charts**: Chart.js with react-chartjs-2
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Desktop**: Electron
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Desktop Application

#### Development Mode
```bash
npm run electron-dev
```

#### Build Desktop App
```bash
npm run build-electron
```

## Project Structure

```
web-app/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable components
│   │   └── Layout.tsx     # Main layout with sidebar
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx  # Dashboard with charts
│   │   ├── DailyEntry.tsx # Mood entry form
│   │   ├── History.tsx    # Entry history
│   │   ├── Settings.tsx   # App settings
│   │   └── ...
│   ├── store/             # State management
│   │   └── index.ts       # Zustand store
│   ├── types/             # TypeScript types
│   │   └── index.ts       # App interfaces
│   ├── App.tsx            # Main app component
│   └── index.tsx          # App entry point
├── electron.js            # Electron main process
├── preload.js             # Electron preload script
└── package.json           # Dependencies and scripts
```

## Usage

### Web Application

1. **Login**: Use any email and password for demo purposes
2. **Dashboard**: View your mood trends and statistics
3. **Daily Entry**: Log your mood, activities, and health metrics
4. **History**: Review past entries
5. **Settings**: Customize your experience

### Desktop Application

The desktop app provides the same functionality as the web app with additional features:

- Native desktop integration
- System tray support
- Keyboard shortcuts
- Menu bar integration

## Data Storage

All data is stored locally using:
- **Browser**: LocalStorage (web app)
- **Desktop**: Local file system (Electron app)

No data is sent to external servers - your privacy is protected.

## Customization

### Themes
- Light mode
- Dark mode  
- Auto (follows system preference)

### Colors
The app uses a customizable color palette defined in `tailwind.config.js`:

```javascript
colors: {
  primary: { /* Blue shades */ },
  secondary: { /* Purple shades */ },
  success: { /* Green shades */ },
  warning: { /* Yellow shades */ },
  error: { /* Red shades */ }
}
```

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run electron` - Start Electron app
- `npm run electron-dev` - Start Electron in development mode
- `npm run build-electron` - Build desktop application

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

## Roadmap

- [ ] Goals and achievements tracking
- [ ] Activity management
- [ ] Data export functionality
- [ ] Push notifications
- [ ] Cloud sync (optional)
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Community features

---

**Note**: This is a demo application. For production use, consider adding proper authentication, data validation, and security measures. 