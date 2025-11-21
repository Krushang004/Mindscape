import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, MonthlyStats, UserSettings, Goal, Activity, Nominee, NomineeAlert, MeditationSession, Habit, HabitCompletion } from '../types';

const db = SQLite.openDatabaseSync('mentalHealthTracker.db');

// Helper function to get current user email
export const getCurrentUserEmail = async (): Promise<string | null> => {
  try {
    const storedUser = await AsyncStorage.getItem('user_auth');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.email || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user email:', error);
    return null;
  }
};

// Create predefined user accounts
export const createPredefinedUsers = async (): Promise<void> => {
  try {
    const predefinedUsers = [
      {
        email: 'krushangrprajapati@gmail.com',
        name: 'Krushang Prajapati',
        password: '123456',
      },
      {
        email: 'admin@gmail.com',
        name: 'Admin',
        password: '123456',
      },
    ];

    for (const userData of predefinedUsers) {
      try {
        // Check if user already exists
        const existingUser = await db.getFirstAsync(
          `SELECT id FROM user_settings WHERE email = ?`,
          [userData.email]
        );

        if (!existingUser) {
          // Create new user
          const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          const now = new Date().toISOString();
          
          await db.runAsync(`
            INSERT INTO user_settings (
              id, name, email, password, reminderTime, reminderEnabled, theme,
              notificationsEnabled, dataExportEnabled, privacyMode,
              createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, '20:00', 1, 'light', 1, 1, 0, ?, ?)
          `, [
            userId,
            userData.name,
            userData.email,
            userData.password,
            now,
            now,
          ]);
          
          console.log(`Created predefined user: ${userData.email}`);
        } else {
          // Update password if user exists (in case password was changed)
          await db.runAsync(`
            UPDATE user_settings 
            SET password = ?, updatedAt = datetime('now')
            WHERE email = ?
          `, [userData.password, userData.email]);
          console.log(`Updated password for existing user: ${userData.email}`);
        }
      } catch (error) {
        console.error(`Error creating/updating user ${userData.email}:`, error);
        // Continue with next user even if one fails
      }
    }
  } catch (error) {
    console.error('Error creating predefined users:', error);
    // Don't throw - this is not critical for app startup
  }
};

export const initDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database...');
    
    // Create mood entries table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id TEXT PRIMARY KEY,
        userEmail TEXT NOT NULL,
        date TEXT NOT NULL,
        emoji TEXT NOT NULL,
        mood TEXT NOT NULL,
        moodLevel INTEGER NOT NULL,
        summary TEXT NOT NULL,
        journal TEXT,
        activities TEXT,
        sleepHours REAL,
        exerciseMinutes INTEGER,
        waterIntake REAL,
        stressLevel INTEGER,
        energyLevel INTEGER,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
    
    // Add userEmail column if it doesn't exist (for existing databases)
    try {
      await db.execAsync(`ALTER TABLE mood_entries ADD COLUMN userEmail TEXT`);
    } catch (error) {
      // Column already exists, ignore
    }

    // Create user settings table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        password TEXT NOT NULL,
        reminderTime TEXT NOT NULL,
        reminderEnabled INTEGER NOT NULL,
        theme TEXT NOT NULL,
        notificationsEnabled INTEGER NOT NULL,
        dataExportEnabled INTEGER NOT NULL,
        privacyMode INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Check if password column exists, if not add it
    try {
      // First check if the column exists
      const columns = await db.getAllAsync("PRAGMA table_info(user_settings)");
      const hasPasswordColumn = columns.some((col: any) => col.name === 'password');
      
      if (!hasPasswordColumn) {
        await db.execAsync(`
          ALTER TABLE user_settings ADD COLUMN password TEXT NOT NULL DEFAULT ''
        `);
        console.log('Added password column to existing user_settings table');
      } else {
        console.log('Password column already exists');
      }
    } catch (error) {
      console.error('Error checking/adding password column:', error);
      // Continue anyway, the app should still work
    }

    // Create goals table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        deadline TEXT NOT NULL,
        completed INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Create activities table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL,
        moodBoost INTEGER NOT NULL
      );
    `);

    // Insert default activities
    await db.execAsync(`
      INSERT OR IGNORE INTO activities (id, name, category, description, duration, moodBoost) VALUES
        ('1', 'Walking', 'exercise', 'Take a 30-minute walk outside', 30, 7),
        ('2', 'Meditation', 'mindfulness', 'Practice mindfulness meditation', 15, 8),
        ('3', 'Reading', 'creative', 'Read a book you enjoy', 30, 6),
        ('4', 'Call a friend', 'social', 'Reach out to someone you care about', 20, 8),
        ('5', 'Journaling', 'self-care', 'Write about your thoughts and feelings', 15, 7),
        ('6', 'Yoga', 'exercise', 'Practice gentle yoga stretches', 20, 7),
        ('7', 'Deep breathing', 'mindfulness', 'Practice deep breathing exercises', 10, 6),
        ('8', 'Drawing', 'creative', 'Express yourself through art', 30, 7),
        ('9', 'Gratitude practice', 'mindfulness', 'Write down 3 things you are grateful for', 10, 8),
        ('10', 'Warm bath', 'self-care', 'Take a relaxing warm bath', 30, 8);
    `);

    // Create nominees table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS nominees (
        id TEXT PRIMARY KEY,
        userEmail TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        relationship TEXT NOT NULL,
        stressThreshold INTEGER NOT NULL,
        isActive INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
    
    // Add userEmail column if it doesn't exist (for existing databases)
    try {
      await db.execAsync(`ALTER TABLE nominees ADD COLUMN userEmail TEXT`);
    } catch (error) {
      // Column already exists, ignore
    }

    // Create nominee alerts table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS nominee_alerts (
        id TEXT PRIMARY KEY,
        nomineeId TEXT NOT NULL,
        userId TEXT NOT NULL,
        stressLevel INTEGER NOT NULL,
        date TEXT NOT NULL,
        message TEXT NOT NULL,
        isRead INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (nomineeId) REFERENCES nominees (id)
      );
    `);

    // Create meditation sessions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meditation_sessions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        duration INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        audioUrl TEXT,
        instructions TEXT NOT NULL,
        moodBefore INTEGER,
        moodAfter INTEGER,
        completedAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Create habits table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        frequency TEXT NOT NULL,
        targetCount INTEGER NOT NULL,
        currentStreak INTEGER NOT NULL DEFAULT 0,
        longestStreak INTEGER NOT NULL DEFAULT 0,
        totalCompletions INTEGER NOT NULL DEFAULT 0,
        isActive INTEGER NOT NULL DEFAULT 1,
        reminderTime TEXT,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Create habit completions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habit_completions (
        id TEXT PRIMARY KEY,
        habitId TEXT NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER NOT NULL,
        notes TEXT,
        mood INTEGER,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (habitId) REFERENCES habits (id)
      );
    `);

    // Insert default user settings (only if no users exist)
    try {
      const userCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM user_settings`);
      if (!userCount || (userCount as any).count === 0) {
        await db.execAsync(`
          INSERT OR IGNORE INTO user_settings (id, name, email, password, reminderTime, reminderEnabled, theme, notificationsEnabled, dataExportEnabled, privacyMode, createdAt, updatedAt) VALUES
            ('1', 'User', '', '', '20:00', 1, 'light', 1, 1, 0, datetime('now'), datetime('now'));
        `);
      }
    } catch (error) {
      // Table might not exist yet, continue
      console.log('Could not check user count:', error);
    }

    // Create predefined user accounts
    await createPredefinedUsers();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const saveMoodEntry = async (entry: MoodEntry): Promise<void> => {
  try {
    const userEmail = await getCurrentUserEmail();
    if (!userEmail) {
      throw new Error('User not logged in. Please log in to save entries.');
    }
    
    console.log('Attempting to save mood entry for user:', userEmail);
    const query = `
      INSERT OR REPLACE INTO mood_entries (
        id, userEmail, date, emoji, mood, moodLevel, summary, journal, activities,
        sleepHours, exerciseMinutes, waterIntake, stressLevel, energyLevel,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.runAsync(query, [
      entry.id,
      userEmail,
      entry.date,
      entry.emoji,
      entry.mood,
      entry.moodLevel,
      entry.summary,
      entry.journal,
      JSON.stringify(entry.activities || []),
      entry.sleepHours ?? null,
      entry.exerciseMinutes ?? null,
      entry.waterIntake ?? null,
      entry.stressLevel ?? null,
      entry.energyLevel ?? null,
      entry.createdAt,
      entry.updatedAt,
    ]);
    console.log('Mood entry saved successfully');
  } catch (error) {
    console.error('Error saving mood entry:', error);
    throw error;
  }
};

export const getMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    const userEmail = await getCurrentUserEmail();
    if (!userEmail) {
      console.log('No user logged in, returning empty entries');
      return [];
    }
    
    const result = await db.getAllAsync(
      `SELECT * FROM mood_entries WHERE userEmail = ? ORDER BY date DESC, createdAt DESC`,
      [userEmail]
    );
    
    return result.map((row: any) => ({
      ...row,
      activities: row.activities ? JSON.parse(row.activities) : []
    }));
  } catch (error) {
    console.error('Error getting mood entries:', error);
    return [];
  }
};

export const getMoodEntryByDate = async (date: string): Promise<MoodEntry | null> => {
  try {
    const userEmail = await getCurrentUserEmail();
    if (!userEmail) {
      return null;
    }
    
    const result = await db.getFirstAsync(
      `SELECT * FROM mood_entries WHERE date = ? AND userEmail = ?`,
      [date, userEmail]
    );
    
    if (result) {
      return {
        ...result,
        activities: result.activities ? JSON.parse(result.activities) : []
      } as MoodEntry;
    }
    return null;
  } catch (error) {
    console.error('Error getting mood entry by date:', error);
    return null;
  }
};

export const deleteMoodEntry = async (id: string): Promise<void> => {
  try {
    await db.runAsync(`
      DELETE FROM mood_entries WHERE id = ?
    `, [id]);
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    throw error;
  }
};

export const saveUserSettings = async (settings: UserSettings): Promise<void> => {
  try {
    console.log('Attempting to save user settings:', settings);
    
    // Check if user already exists
    const existingUser = await db.getFirstAsync(`
      SELECT id FROM user_settings WHERE id = ?
    `, [settings.id]);

    if (existingUser) {
      // Update existing user settings (preserve password)
      const updateQuery = `
        UPDATE user_settings SET 
          name = ?, email = ?, reminderTime = ?, reminderEnabled = ?, theme = ?,
          notificationsEnabled = ?, dataExportEnabled = ?, privacyMode = ?, updatedAt = ?
        WHERE id = ?
      `;
      await db.runAsync(updateQuery, [
        settings.name,
        settings.email || '',
        settings.reminderTime,
        settings.reminderEnabled ? 1 : 0,
        settings.theme,
        settings.notificationsEnabled ? 1 : 0,
        settings.dataExportEnabled ? 1 : 0,
        settings.privacyMode ? 1 : 0,
        settings.updatedAt,
        settings.id
      ]);
    } else {
      // Insert new user settings
      const insertQuery = `
        INSERT INTO user_settings (
          id, name, email, password, reminderTime, reminderEnabled, theme,
          notificationsEnabled, dataExportEnabled, privacyMode,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.runAsync(insertQuery, [
        settings.id,
        settings.name,
        settings.email || '',
        settings.password || '',
        settings.reminderTime,
        settings.reminderEnabled ? 1 : 0,
        settings.theme,
        settings.notificationsEnabled ? 1 : 0,
        settings.dataExportEnabled ? 1 : 0,
        settings.privacyMode ? 1 : 0,
        settings.createdAt,
        settings.updatedAt
      ]);
    }
    console.log('User settings saved successfully');
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

// Add new functions for user authentication
export const createUser = async (name: string, email: string, password: string): Promise<UserSettings> => {
  try {
    console.log('Creating new user:', { name, email });
    
    const userId = Date.now().toString();
    const now = new Date().toISOString();
    
    const userSettings: UserSettings = {
      id: userId,
      name,
      email,
      password,
      reminderTime: '20:00',
      reminderEnabled: true,
      theme: 'light',
      notificationsEnabled: true,
      dataExportEnabled: true,
      privacyMode: false,
      createdAt: now,
      updatedAt: now,
    };
    
    await saveUserSettings(userSettings);
    console.log('User created successfully:', userSettings);
    return userSettings;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const validateUserCredentials = async (email: string, password: string): Promise<{ isValid: boolean; user: UserSettings | null }> => {
  try {
    console.log('Validating credentials for email:', email);
    
    const result = await db.getFirstAsync(`
      SELECT id, name, email, password, reminderTime, reminderEnabled, theme,
             notificationsEnabled, dataExportEnabled, privacyMode,
             createdAt, updatedAt
      FROM user_settings WHERE email = ?
    `, [email]);
    
    if (!result) {
      console.log('No user found with email:', email);
      return { isValid: false, user: null };
    }
    
    // Check password - accept exact match, google_oauth_ prefix, or google_idtoken_verified
    if (result.password === password || 
        password.startsWith('google_oauth_') || 
        password === 'google_idtoken_verified') {
      const userSettings: UserSettings = {
        ...result,
        reminderEnabled: Boolean(result.reminderEnabled),
        notificationsEnabled: Boolean(result.notificationsEnabled),
        dataExportEnabled: Boolean(result.dataExportEnabled),
        privacyMode: Boolean(result.privacyMode)
      };
      console.log('Credentials valid for user:', userSettings.name);
      return { isValid: true, user: userSettings };
    }
    
    console.log('Invalid password for user:', email);
    return { isValid: false, user: null };
  } catch (error) {
    console.error('Error validating credentials:', error);
    return { isValid: false, user: null };
  }
};

export const getUserByEmail = async (email: string): Promise<UserSettings | null> => {
  try {
    const result = await db.getFirstAsync(`
      SELECT id, name, email, password, reminderTime, reminderEnabled, theme,
             notificationsEnabled, dataExportEnabled, privacyMode,
             createdAt, updatedAt
      FROM user_settings WHERE email = ?
    `, [email]);
    
    if (result) {
      return {
        ...result,
        reminderEnabled: Boolean(result.reminderEnabled),
        notificationsEnabled: Boolean(result.notificationsEnabled),
        dataExportEnabled: Boolean(result.dataExportEnabled),
        privacyMode: Boolean(result.privacyMode)
      } as UserSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserSettings>): Promise<void> => {
  try {
    console.log('Updating user profile:', { userId, updates });
    
    const currentUser = await db.getFirstAsync(`
      SELECT * FROM user_settings WHERE id = ?
    `, [userId]);
    
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    const updatedSettings: UserSettings = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
      reminderEnabled: Boolean(currentUser.reminderEnabled),
      notificationsEnabled: Boolean(currentUser.notificationsEnabled),
      dataExportEnabled: Boolean(currentUser.dataExportEnabled),
      privacyMode: Boolean(currentUser.privacyMode)
    };
    
    await saveUserSettings(updatedSettings);
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const userEmail = await getCurrentUserEmail();
    if (!userEmail) {
      console.log('No user logged in, cannot get user settings');
      return null;
    }
    
    const result = await db.getFirstAsync(`
      SELECT id, name, email, password, reminderTime, reminderEnabled, theme,
             notificationsEnabled, dataExportEnabled, privacyMode,
             createdAt, updatedAt
      FROM user_settings WHERE email = ?
    `, [userEmail]);
    
    if (result) {
      return {
        ...result,
        reminderEnabled: Boolean(result.reminderEnabled),
        notificationsEnabled: Boolean(result.notificationsEnabled),
        dataExportEnabled: Boolean(result.dataExportEnabled),
        privacyMode: Boolean(result.privacyMode)
      } as UserSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

export const saveGoal = async (goal: Goal): Promise<void> => {
  try {
    const query = `
      INSERT OR REPLACE INTO goals (
        id, title, description, deadline, completed, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.runAsync(query, [
      goal.id,
      goal.title,
      goal.description,
      goal.deadline,
      goal.completed ? 1 : 0,
      goal.createdAt,
      goal.updatedAt
    ]);
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};

export const updateGoal = async (goal: Goal): Promise<void> => {
  try {
    const query = `
      UPDATE goals SET 
        title = ?, description = ?, deadline = ?, 
        completed = ?, updatedAt = ?
      WHERE id = ?
    `;
    await db.runAsync(query, [
      goal.title,
      goal.description,
      goal.deadline,
      goal.completed ? 1 : 0,
      goal.updatedAt,
      goal.id
    ]);
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (id: string): Promise<void> => {
  try {
    await db.runAsync(`
      DELETE FROM goals WHERE id = ?
    `, [id]);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

export const getGoals = async (): Promise<Goal[]> => {
  try {
    const result = await db.getAllAsync(`
      SELECT * FROM goals ORDER BY createdAt DESC
    `);
    
    return result.map((row: any) => ({
      ...row,
      completed: Boolean(row.completed)
    }));
  } catch (error) {
    console.error('Error getting goals:', error);
    return [];
  }
};

export const getActivities = async (): Promise<Activity[]> => {
  try {
    const result = await db.getAllAsync(`
      SELECT * FROM activities ORDER BY name
    `);
    return result;
  } catch (error) {
    console.error('Error getting activities:', error);
    return [];
  }
};

export const saveActivity = async (activity: Activity): Promise<void> => {
  try {
    const query = `
      INSERT OR REPLACE INTO activities (
        id, name, category, description, duration, moodBoost
      ) VALUES ('${activity.id}', '${activity.name}', '${activity.category}', '${activity.description}', ${activity.duration}, ${activity.moodBoost})
    `;
    await db.execAsync(query);
  } catch (error) {
    console.error('Error saving activity:', error);
    throw error;
  }
};

export const updateActivity = async (activity: Activity): Promise<void> => {
  try {
    const query = `
      UPDATE activities SET 
        name = '${activity.name}', category = '${activity.category}', description = '${activity.description}', 
        duration = ${activity.duration}, moodBoost = ${activity.moodBoost}
      WHERE id = '${activity.id}'
    `;
    await db.execAsync(query);
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

export const deleteActivity = async (id: string): Promise<void> => {
  try {
    await db.execAsync(`
      DELETE FROM activities WHERE id = '${id}'
    `);
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

export const getMonthlyStats = async (month: string): Promise<MonthlyStats> => {
  try {
    const result = await db.getAllAsync(`
      SELECT * FROM mood_entries 
      WHERE date LIKE '${month}%'
      ORDER BY date DESC
    `);
    
    if (result.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        mostFrequentMood: 'neutral',
        moodDistribution: {},
        topActivities: [],
        averageSleep: 0,
        averageExercise: 0,
        averageWater: 0,
        averageStress: 0,
        averageEnergy: 0
      };
    }

    const moodLevels = result.map((entry: any) => entry.moodLevel);
    const averageMood = moodLevels.reduce((a: number, b: number) => a + b, 0) / moodLevels.length;
    
    const moodCounts: { [key: string]: number } = {};
    result.forEach((entry: any) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const mostFrequentMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    const allActivities: string[] = [];
    result.forEach((entry: any) => {
      if (entry.activities) {
        const activities = JSON.parse(entry.activities);
        allActivities.push(...activities);
      }
    });

    const activityCounts: { [key: string]: number } = {};
    allActivities.forEach(activity => {
      activityCounts[activity] = (activityCounts[activity] || 0) + 1;
    });

    const topActivities = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([activity]) => activity);

    const sleepHours = result.filter((entry: any) => entry.sleepHours).map((entry: any) => entry.sleepHours);
    const averageSleep = sleepHours.length > 0 ? sleepHours.reduce((a: number, b: number) => a + b, 0) / sleepHours.length : 0;

    const exerciseMinutes = result.filter((entry: any) => entry.exerciseMinutes).map((entry: any) => entry.exerciseMinutes);
    const averageExercise = exerciseMinutes.length > 0 ? exerciseMinutes.reduce((a: number, b: number) => a + b, 0) / exerciseMinutes.length : 0;

    const waterIntake = result.filter((entry: any) => entry.waterIntake).map((entry: any) => entry.waterIntake);
    const averageWater = waterIntake.length > 0 ? waterIntake.reduce((a: number, b: number) => a + b, 0) / waterIntake.length : 0;

    const stressLevels = result.filter((entry: any) => entry.stressLevel).map((entry: any) => entry.stressLevel);
    const averageStress = stressLevels.length > 0 ? stressLevels.reduce((a: number, b: number) => a + b, 0) / stressLevels.length : 0;

    const energyLevels = result.filter((entry: any) => entry.energyLevel).map((entry: any) => entry.energyLevel);
    const averageEnergy = energyLevels.length > 0 ? energyLevels.reduce((a: number, b: number) => a + b, 0) / energyLevels.length : 0;

    return {
      totalEntries: result.length,
      averageMood,
      mostFrequentMood,
      moodDistribution: moodCounts,
      topActivities,
      averageSleep,
      averageExercise,
      averageWater,
      averageStress,
      averageEnergy
    };
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    return {
      totalEntries: 0,
      averageMood: 0,
      mostFrequentMood: 'neutral',
      moodDistribution: {},
      topActivities: [],
      averageSleep: 0,
      averageExercise: 0,
      averageWater: 0,
      averageStress: 0,
      averageEnergy: 0
    };
  }
};

export const getCurrentStreak = async (): Promise<number> => {
  try {
    const result = await db.getAllAsync(`
      SELECT date FROM mood_entries 
      ORDER BY date DESC
    `);
    
    if (result.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    for (const entry of result) {
      const entryDate = new Date(entry.date);
      const diffTime = Math.abs(currentDate.getTime() - entryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error getting current streak:', error);
    return 0;
  }
};

export const exportAllData = async (): Promise<any> => {
  try {
    const moodEntries = await getMoodEntries();
    const userSettings = await getUserSettings();
    const goals = await getGoals();
    const activities = await getActivities();

    return {
      exportDate: new Date().toISOString(),
      moodEntries,
      userSettings,
      goals,
      activities
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importAllData = async (payload: any): Promise<void> => {
  try {
    // Basic validation
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid import payload');
    }

    const now = new Date().toISOString();

    // Restore user settings (preserve local password if missing in import)
    if (payload.userSettings) {
      const existing = await getUserSettings();
      const incoming = payload.userSettings;
      await saveUserSettings({
        id: incoming.id || existing?.id || '1',
        name: incoming.name || existing?.name || 'User',
        email: incoming.email || existing?.email || '',
        password: incoming.password || existing?.password || '',
        reminderTime: incoming.reminderTime || existing?.reminderTime || '20:00',
        reminderEnabled: Boolean(incoming.reminderEnabled ?? existing?.reminderEnabled ?? true),
        theme: incoming.theme || existing?.theme || 'light',
        notificationsEnabled: Boolean(incoming.notificationsEnabled ?? existing?.notificationsEnabled ?? true),
        dataExportEnabled: Boolean(incoming.dataExportEnabled ?? existing?.dataExportEnabled ?? true),
        privacyMode: Boolean(incoming.privacyMode ?? existing?.privacyMode ?? false),
        createdAt: incoming.createdAt || existing?.createdAt || now,
        updatedAt: now,
      });
    }

    // Restore activities
    if (Array.isArray(payload.activities)) {
      for (const activity of payload.activities) {
        await saveActivity(activity);
      }
    }

    // Restore goals
    if (Array.isArray(payload.goals)) {
      for (const goal of payload.goals) {
        await saveGoal(goal);
      }
    }

    // Restore mood entries
    if (Array.isArray(payload.moodEntries)) {
      for (const entry of payload.moodEntries) {
        await saveMoodEntry(entry);
      }
    }
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

// Authentication functions
export const clearOldDemoData = async (): Promise<void> => {
  try {
    console.log('Clearing old demo user data...');
    
    // Clear old demo user settings
    await db.runAsync(`
      DELETE FROM user_settings WHERE email = 'demo@gmail.com'
    `);
    
    // Clear old demo mood entries
    await db.runAsync(`
      DELETE FROM mood_entries WHERE id IN (
        SELECT id FROM mood_entries LIMIT 10
      )
    `);
    
    console.log('Old demo data cleared successfully');
  } catch (error) {
    console.error('Error clearing old demo data:', error);
    // Don't throw error, continue with user creation
  }
};

export const saveUserCredentials = async (email: string, password: string, name: string): Promise<void> => {
  try {
    console.log('Saving credentials for email:', email, 'name:', name, 'password length:', password.length);
    
    // Check if user already exists
    const existingUser = await db.getFirstAsync(`
      SELECT id FROM user_settings 
      WHERE email = ?
    `, [email]);

    if (existingUser) {
      console.log('Updating existing user with new password');
      // Update existing user's password and name
      await db.runAsync(`
        UPDATE user_settings 
        SET password = ?, name = ?, updatedAt = datetime('now')
        WHERE email = ?
      `, [password, name, email]);
    } else {
      console.log('Creating new user');
      
      // Clear any old demo user data first
      await clearOldDemoData();
      
      // Create new user
      const userId = Date.now().toString();
      await db.runAsync(`
        INSERT INTO user_settings (id, name, email, password, reminderTime, reminderEnabled, theme, notificationsEnabled, dataExportEnabled, privacyMode, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, '20:00', 1, 'light', 1, 1, 0, datetime('now'), datetime('now'))
      `, [userId, name, email, password]);
    }
    
    console.log('Credentials saved successfully');
  } catch (error) {
    console.error('Error saving user credentials:', error);
    throw error;
  }
};



// Testing function - clear database
export const clearDatabase = async (): Promise<void> => {
  try {
    await db.execAsync('DELETE FROM user_settings');
    await db.execAsync('DELETE FROM mood_entries');
    await db.execAsync('DELETE FROM goals');
    await db.execAsync('DELETE FROM activities');
    console.log('Database cleared for testing');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

// Clear all user data (keeps user settings/account)
export const clearAllUserData = async (): Promise<void> => {
  try {
    console.log('Clearing all user data...');
    
    // Clear mood entries
    await db.execAsync('DELETE FROM mood_entries');
    
    // Clear goals
    await db.execAsync('DELETE FROM goals');
    
    // Clear activities (keep default activities, only clear user-added ones if any)
    // Note: We keep default activities as they're seeded on init
    // If you want to clear user-created activities only, you'd need to track that
    
    // Clear nominees and alerts
    await db.execAsync('DELETE FROM nominee_alerts');
    await db.execAsync('DELETE FROM nominees');
    
    // Clear meditation sessions
    await db.execAsync('DELETE FROM meditation_sessions');
    
    // Clear habits and habit completions
    await db.execAsync('DELETE FROM habit_completions');
    await db.execAsync('DELETE FROM habits');
    
    console.log('All user data cleared successfully');
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

// Nominee-related functions
export const saveNominee = async (nominee: Nominee): Promise<void> => {
  try {
    const userEmail = await getCurrentUserEmail();
    if (!userEmail) {
      throw new Error('User not logged in. Please log in to save contacts.');
    }
    
    const query = `
      INSERT OR REPLACE INTO nominees (
        id, userEmail, name, email, phone, relationship, stressThreshold, isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.runAsync(query, [
      nominee.id,
      userEmail,
      nominee.name,
      nominee.email,
      nominee.phone || null,
      nominee.relationship,
      nominee.stressThreshold,
      nominee.isActive ? 1 : 0,
      nominee.createdAt,
      nominee.updatedAt,
    ]);
    console.log('Nominee saved successfully');
  } catch (error) {
    console.error('Error saving nominee:', error);
    throw error;
  }
};

export const getNominees = async (): Promise<Nominee[]> => {
  try {
    const userEmail = await getCurrentUserEmail();
    if (!userEmail) {
      console.log('No user logged in, returning empty nominees');
      return [];
    }
    
    const result = await db.getAllAsync(
      `SELECT * FROM nominees WHERE userEmail = ? ORDER BY createdAt DESC`,
      [userEmail]
    );
    
    return result.map((row: any) => ({
      ...row,
      isActive: Boolean(row.isActive),
      phone: row.phone || undefined,
    }));
  } catch (error) {
    console.error('Error getting nominees:', error);
    return [];
  }
};

export const deleteNominee = async (id: string): Promise<void> => {
  try {
    const userEmail = await getCurrentUserEmail();
    if (!userEmail) {
      throw new Error('User not logged in.');
    }
    
    await db.runAsync(`DELETE FROM nominees WHERE id = ? AND userEmail = ?`, [id, userEmail]);
    console.log('Nominee deleted successfully');
  } catch (error) {
    console.error('Error deleting nominee:', error);
    throw error;
  }
};

export const saveNomineeAlert = async (alert: NomineeAlert): Promise<void> => {
  try {
    const query = `
      INSERT INTO nominee_alerts (
        id, nomineeId, userId, stressLevel, date, message, isRead, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.runAsync(query, [
      alert.id,
      alert.nomineeId,
      alert.userId,
      alert.stressLevel,
      alert.date,
      alert.message,
      alert.isRead ? 1 : 0,
      alert.createdAt,
    ]);
    console.log('Nominee alert saved successfully');
  } catch (error) {
    console.error('Error saving nominee alert:', error);
    throw error;
  }
};

export const getNomineeAlerts = async (nomineeId: string): Promise<NomineeAlert[]> => {
  try {
    const result = await db.getAllAsync(
      `SELECT * FROM nominee_alerts WHERE nomineeId = ? ORDER BY createdAt DESC`,
      [nomineeId]
    );
    
    return result.map((row: any) => ({
      ...row,
      isRead: Boolean(row.isRead),
    }));
  } catch (error) {
    console.error('Error getting nominee alerts:', error);
    return [];
  }
};

export const markAlertAsRead = async (alertId: string): Promise<void> => {
  try {
    await db.runAsync(
      `UPDATE nominee_alerts SET isRead = 1 WHERE id = ?`,
      [alertId]
    );
    console.log('Alert marked as read');
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
};

export const checkStressThreshold = async (stressLevel: number): Promise<Nominee[]> => {
  try {
    const result = await db.getAllAsync(
      `SELECT * FROM nominees WHERE stressThreshold <= ? AND isActive = 1`,
      [stressLevel]
    );
    
    return result.map((row: any) => ({
      ...row,
      isActive: Boolean(row.isActive),
      phone: row.phone || undefined,
    }));
  } catch (error) {
    console.error('Error checking stress threshold:', error);
    return [];
  }
};

// Meditation Session Functions
export const saveMeditationSession = async (session: MeditationSession): Promise<void> => {
  try {
    await db.runAsync(`
      INSERT OR REPLACE INTO meditation_sessions 
      (id, name, duration, type, description, audioUrl, instructions, moodBefore, moodAfter, completedAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      session.id,
      session.name,
      session.duration,
      session.type,
      session.description,
      session.audioUrl || null,
      JSON.stringify(session.instructions),
      session.moodBefore || null,
      session.moodAfter || null,
      session.completedAt || null,
      session.createdAt,
      session.updatedAt
    ]);
  } catch (error) {
    console.error('Error saving meditation session:', error);
    throw error;
  }
};

export const getMeditationSessions = async (): Promise<MeditationSession[]> => {
  try {
    const result = await db.getAllAsync('SELECT * FROM meditation_sessions ORDER BY createdAt DESC');
    return result.map((row: any) => ({
      ...row,
      instructions: JSON.parse(row.instructions),
      audioUrl: row.audioUrl || undefined,
      moodBefore: row.moodBefore || undefined,
      moodAfter: row.moodAfter || undefined,
      completedAt: row.completedAt || undefined,
    }));
  } catch (error) {
    console.error('Error getting meditation sessions:', error);
    return [];
  }
};

// Habit Functions
export const saveHabit = async (habit: Habit): Promise<void> => {
  try {
    await db.runAsync(`
      INSERT OR REPLACE INTO habits 
      (id, name, description, category, frequency, targetCount, currentStreak, longestStreak, totalCompletions, isActive, reminderTime, color, icon, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      habit.id,
      habit.name,
      habit.description,
      habit.category,
      habit.frequency,
      habit.targetCount,
      habit.currentStreak,
      habit.longestStreak,
      habit.totalCompletions,
      habit.isActive ? 1 : 0,
      habit.reminderTime || null,
      habit.color,
      habit.icon,
      habit.createdAt,
      habit.updatedAt
    ]);
  } catch (error) {
    console.error('Error saving habit:', error);
    throw error;
  }
};

export const getHabits = async (): Promise<Habit[]> => {
  try {
    const result = await db.getAllAsync('SELECT * FROM habits WHERE isActive = 1 ORDER BY createdAt DESC');
    return result.map((row: any) => ({
      ...row,
      isActive: Boolean(row.isActive),
      reminderTime: row.reminderTime || undefined,
    }));
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
};

export const updateHabit = async (habit: Habit): Promise<void> => {
  try {
    await db.runAsync(`
      UPDATE habits SET 
        name = ?, description = ?, category = ?, frequency = ?, targetCount = ?, 
        currentStreak = ?, longestStreak = ?, totalCompletions = ?, isActive = ?, 
        reminderTime = ?, color = ?, icon = ?, updatedAt = ?
      WHERE id = ?
    `, [
      habit.name,
      habit.description,
      habit.category,
      habit.frequency,
      habit.targetCount,
      habit.currentStreak,
      habit.longestStreak,
      habit.totalCompletions,
      habit.isActive ? 1 : 0,
      habit.reminderTime || null,
      habit.color,
      habit.icon,
      habit.updatedAt,
      habit.id
    ]);
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

export const deleteHabit = async (habitId: string): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM habits WHERE id = ?', [habitId]);
    await db.runAsync('DELETE FROM habit_completions WHERE habitId = ?', [habitId]);
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

// Habit Completion Functions
export const completeHabit = async (habitId: string, date: string, completed: boolean, notes?: string, mood?: number): Promise<void> => {
  try {
    const completionId = `${habitId}_${date}`;
    await db.runAsync(`
      INSERT OR REPLACE INTO habit_completions 
      (id, habitId, date, completed, notes, mood, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      completionId,
      habitId,
      date,
      completed ? 1 : 0,
      notes || null,
      mood || null,
      new Date().toISOString()
    ]);
  } catch (error) {
    console.error('Error completing habit:', error);
    throw error;
  }
};

export const getHabitCompletions = async (): Promise<HabitCompletion[]> => {
  try {
    const result = await db.getAllAsync('SELECT * FROM habit_completions ORDER BY date DESC');
    return result.map((row: any) => ({
      ...row,
      completed: Boolean(row.completed),
      notes: row.notes || undefined,
      mood: row.mood || undefined,
    }));
  } catch (error) {
    console.error('Error getting habit completions:', error);
    return [];
  }
};

// Testing function - reset database completely
export const resetDatabase = async (): Promise<void> => {
  try {
    await db.execAsync('DROP TABLE IF EXISTS user_settings');
    await db.execAsync('DROP TABLE IF EXISTS mood_entries');
    await db.execAsync('DROP TABLE IF EXISTS goals');
    await db.execAsync('DROP TABLE IF EXISTS activities');
    await db.execAsync('DROP TABLE IF EXISTS nominees');
    await db.execAsync('DROP TABLE IF EXISTS nominee_alerts');
    await db.execAsync('DROP TABLE IF EXISTS meditation_sessions');
    await db.execAsync('DROP TABLE IF EXISTS habits');
    await db.execAsync('DROP TABLE IF EXISTS habit_completions');
    console.log('Database tables dropped');
    
    // Reinitialize the database
    await initDatabase();
    console.log('Database reset and reinitialized');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};