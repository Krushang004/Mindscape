import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Privacy Policy</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Privacy Matters</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              At Mental Health Tracker, we believe your mental health data is deeply personal and should remain private. This privacy policy explains how we handle your information.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Collection</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • All your mood entries, journal entries, and personal data are stored locally on your device{'\n'}
              • We do not collect, transmit, or store any of your personal data on our servers{'\n'}
              • No analytics, tracking, or data collection occurs{'\n'}
              • Your data never leaves your device unless you explicitly choose to export it
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Storage</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • Your data is stored in a local SQLite database on your device{'\n'}
              • Data is encrypted and protected by your device's security{'\n'}
              • You have complete control over your data at all times{'\n'}
              • You can export, delete, or modify your data whenever you want
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Sharing</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • We never share your data with third parties{'\n'}
              • We never sell your data{'\n'}
              • We never use your data for advertising{'\n'}
              • The only exception is if you explicitly choose to share your data export file
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Optional Features</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • Feedback and bug reports: Only sent if you choose to submit them{'\n'}
              • App ratings: Only if you choose to rate the app{'\n'}
              • Data export: Only if you explicitly choose to export your data
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rights</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • Access your data: All your data is stored locally and accessible{'\n'}
              • Delete your data: You can clear all data at any time{'\n'}
              • Export your data: You can export your data in JSON format{'\n'}
              • Control your data: You have complete control over all your information
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • Your data is protected by your device's security{'\n'}
              • We use industry-standard encryption for data storage{'\n'}
              • No network transmission of personal data{'\n'}
              • Regular security updates and improvements
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              If you have any questions about this privacy policy or how we handle your data, please contact us through the feedback feature in the app.
            </Text>

            <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 15,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  lastUpdated: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default PrivacyPolicyModal; 