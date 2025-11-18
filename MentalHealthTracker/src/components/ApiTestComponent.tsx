import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useMoods, useActivities, useActivitiesByCategory } from '../hooks/useApi';

export default function ApiTestComponent() {
  const { data: moods, isLoading: moodsLoading, error: moodsError } = useMoods();
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useActivities();
  const { 
    data: exerciseActivities, 
    isLoading: exerciseLoading, 
    error: exerciseError,
    refetch: refetchExercise 
  } = useActivitiesByCategory('exercise');

  const handleTestConnection = async () => {
    try {
      const response = await fetch('http://192.168.0.106:3000/api/moods/');
      const data = await response.json();
      
      Alert.alert(
        'Connection Test',
        `✅ Success! Connected to Django backend.\n\nMoods found: ${data.results?.length || 0}\n\nFirst mood: ${data.results?.[0]?.name || 'None'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Connection Test',
        `❌ Failed to connect to Django backend.\n\nError: ${error.message}\n\nMake sure:\n1. Django server is running\n2. Both devices are on same WiFi\n3. IP address is correct: 192.168.0.106`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderMoods = () => {
    if (moodsLoading) return <Text style={styles.loadingText}>Loading moods...</Text>;
    if (moodsError) return <Text style={styles.errorText}>Error loading moods: {moodsError.message}</Text>;
    if (!moods?.results) return <Text style={styles.noDataText}>No moods data</Text>;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>😊 Moods ({moods.results.length})</Text>
        {moods.results.map((mood: any) => (
          <View key={mood.id} style={styles.itemContainer}>
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{mood.name}</Text>
              <Text style={styles.itemDescription}>{mood.description}</Text>
            </View>
            <View style={[styles.colorIndicator, { backgroundColor: mood.color }]} />
          </View>
        ))}
      </View>
    );
  };

  const renderActivities = () => {
    if (activitiesLoading) return <Text style={styles.loadingText}>Loading activities...</Text>;
    if (activitiesError) return <Text style={styles.errorText}>Error loading activities: {activitiesError.message}</Text>;
    if (!activities?.results) return <Text style={styles.noDataText}>No activities data</Text>;

    // Group activities by category
    const categories: { [key: string]: any[] } = {};
    activities.results.forEach((activity: any) => {
      if (!categories[activity.category]) {
        categories[activity.category] = [];
      }
      categories[activity.category].push(activity);
    });

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏃 Activities ({activities.results.length})</Text>
        {Object.entries(categories).map(([category, categoryActivities]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
            {categoryActivities.map((activity: any) => (
              <View key={activity.id} style={styles.itemContainer}>
                <Text style={styles.emoji}>{activity.icon}</Text>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{activity.name}</Text>
                  <Text style={styles.itemDescription}>{activity.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderExerciseActivities = () => {
    if (exerciseLoading) return <Text style={styles.loadingText}>Loading exercise activities...</Text>;
    if (exerciseError) return <Text style={styles.errorText}>Error loading exercise activities: {exerciseError.message}</Text>;
    if (!exerciseActivities) return <Text style={styles.noDataText}>No exercise activities data</Text>;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💪 Exercise Activities ({exerciseActivities.length})</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetchExercise()}>
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
        {exerciseActivities.map((activity: any) => (
          <View key={activity.id} style={styles.itemContainer}>
            <Text style={styles.emoji}>{activity.icon}</Text>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{activity.name}</Text>
              <Text style={styles.itemDescription}>{activity.description}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧠 API Integration Test</Text>
        <Text style={styles.subtitle}>Testing Django Backend Connection</Text>
        <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
          <Text style={styles.testButtonText}>Test Connection</Text>
        </TouchableOpacity>
      </View>

      {renderMoods()}
      {renderActivities()}
      {renderExerciseActivities()}

      <View style={styles.statusSection}>
        <Text style={styles.statusTitle}>📊 API Status</Text>
        <Text style={styles.statusText}>
          ✅ Backend URL: http://192.168.0.106:3000
        </Text>
        <Text style={styles.statusText}>
          ✅ API Base: /api
        </Text>
        <Text style={styles.statusText}>
          ✅ React Query: Active
        </Text>
        <Text style={styles.statusText}>
          ✅ Axios: Configured
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
    width: 30,
    textAlign: 'center',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statusSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});
