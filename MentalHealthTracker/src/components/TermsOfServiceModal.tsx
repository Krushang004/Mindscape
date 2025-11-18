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

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ visible, onClose }) => {
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Terms of Service</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Acceptance of Terms</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              By downloading, installing, or using the Mental Health Tracker app, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>App Purpose and Use</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • The Mental Health Tracker app is designed to help users track their mental health and mood{'\n'}
              • The app is for informational and self-monitoring purposes only{'\n'}
              • It is not a substitute for professional medical advice, diagnosis, or treatment{'\n'}
              • Users should consult healthcare professionals for medical concerns
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>User Responsibilities</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • You are responsible for the accuracy of the information you enter{'\n'}
              • You should not rely solely on this app for medical decisions{'\n'}
              • You should consult healthcare professionals for medical concerns{'\n'}
              • You are responsible for maintaining the security of your device{'\n'}
              • You must be at least 13 years old to use this app
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data and Privacy</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • All your data is stored locally on your device{'\n'}
              • We do not collect, store, or transmit your personal health information{'\n'}
              • You are responsible for backing up your data{'\n'}
              • You have complete control over your data and can export or delete it
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>App Features and Limitations</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • The app includes mood tracking, goal setting, and activity logging{'\n'}
              • Features are provided "as is" and may be updated over time{'\n'}
              • The app is not intended for emergency situations{'\n'}
              • If you experience a mental health crisis, contact emergency services immediately
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Prohibited Uses</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • Using the app for illegal or unauthorized purposes{'\n'}
              • Attempting to reverse engineer or modify the app{'\n'}
              • Sharing the app with others in violation of licensing terms{'\n'}
              • Using the app to harm yourself or others
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Intellectual Property</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • The app and its content are protected by copyright and other intellectual property laws{'\n'}
              • You retain ownership of your personal data and content{'\n'}
              • You grant us a license to use feedback you provide to improve the app{'\n'}
              • You may not copy, distribute, or modify the app without permission
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Disclaimers and Limitations</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • The app is provided without warranties of any kind{'\n'}
              • We are not liable for any damages arising from your use of the app{'\n'}
              • We do not guarantee the app will be error-free or uninterrupted{'\n'}
              • Your use of the app is at your own risk
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Updates and Changes</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • We may update these terms from time to time{'\n'}
              • We will notify you of significant changes in the app{'\n'}
              • Continued use of the app after changes constitutes acceptance{'\n'}
              • You can review the current terms at any time in the app
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Termination</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • You may stop using the app at any time{'\n'}
              • We may terminate or suspend access for violations of these terms{'\n'}
              • Upon termination, your data remains on your device{'\n'}
              • You are responsible for backing up your data before uninstalling
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Governing Law</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • These terms are governed by applicable laws{'\n'}
              • Any disputes will be resolved through appropriate legal channels{'\n'}
              • If any provision is found unenforceable, the remainder remains in effect{'\n'}
              • These terms constitute the entire agreement between you and us
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Third Party Licenses</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              This app uses the following third-party libraries and components:
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              • React Native (MIT License) - Mobile app framework{'\n'}
              • Expo (MIT License) - Development platform and tools{'\n'}
              • React Navigation (MIT License) - Navigation library{'\n'}
              • Expo SQLite (MIT License) - Local database storage{'\n'}
              • Expo Linear Gradient (MIT License) - Gradient components{'\n'}
              • React Native Vector Icons (MIT License) - Icon library{'\n'}
              • React Native SVG (MIT License) - SVG rendering{'\n'}
              • React Native Gesture Handler (MIT License) - Touch handling{'\n'}
              • React Native Safe Area Context (MIT License) - Safe area management{'\n'}
              • React Native Screens (MIT License) - Screen management
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              Full license texts for these libraries can be found in their respective repositories. All third-party libraries are used in accordance with their MIT licenses.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              If you have questions about these terms, please contact us through the app's feedback feature.
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

export default TermsOfServiceModal; 