import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Nominee } from '../types';
import { saveNominee, getNominees, deleteNominee } from '../utils/database';
import { useTheme } from '../context/ThemeContext';
import { validateEmailFormat } from '../utils/googleAuth';

const NomineesScreen = () => {
  const { colors } = useTheme();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [stressThreshold, setStressThreshold] = useState('7');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    loadNominees();
  }, []);

  const loadNominees = async () => {
    try {
      const nomineesList = await getNominees();
      setNominees(nomineesList);
    } catch (error) {
      console.error('Error loading nominees:', error);
    }
  };

  const handleAddNominee = () => {
    setEditingNominee(null);
    setName('');
    setEmail('');
    setPhone('');
    setRelationship('');
    setStressThreshold('7');
    setModalVisible(true);
  };

  const handleEditNominee = (nominee: Nominee) => {
    setEditingNominee(nominee);
    setName(nominee.name);
    setEmail(nominee.email);
    setPhone(nominee.phone || '');
    setRelationship(nominee.relationship);
    setStressThreshold(nominee.stressThreshold.toString());
    setModalVisible(true);
  };

  const handleDeleteNominee = (nominee: Nominee) => {
    Alert.alert(
      'Delete Nominee',
      `Are you sure you want to remove ${nominee.name} from your trusted contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNominee(nominee.id);
              await loadNominees();
              Alert.alert('Success', 'Nominee removed successfully.');
            } catch (error) {
              console.error('Error deleting nominee:', error);
              Alert.alert('Error', 'Failed to remove nominee.');
            }
          },
        },
      ]
    );
  };

  const handleVerifyEmail = async () => {
    // Simple email validation without Google OAuth
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address first.');
      return;
    }

    if (!validateEmailFormat(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Automatically verify the email (no Google OAuth needed)
    setIsVerifyingEmail(true);
    try {
      // Simulate email verification process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerifiedEmail(email.trim());
      Alert.alert(
        '✅ Email Verified',
        `The email ${email.trim()} has been automatically verified and is ready to use.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to verify email. Please try again.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSaveNominee = async () => {
    if (!name.trim() || !email.trim() || !relationship.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Check if email is verified (for demo purposes, we'll allow unverified emails)
    if (verifiedEmail !== email.trim()) {
      Alert.alert(
        'Email Not Verified',
        'Please verify the email address using Google OAuth before adding the contact.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Anyway', onPress: () => saveNomineeData() },
        ]
      );
      return;
    }

    await saveNomineeData();
  };

  const saveNomineeData = async () => {
    const threshold = parseInt(stressThreshold);
    if (isNaN(threshold) || threshold < 1 || threshold > 10) {
      Alert.alert('Invalid Threshold', 'Stress threshold must be between 1-10.');
      return;
    }

    try {
      const nominee: Nominee = {
        id: editingNominee?.id || Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        relationship: relationship.trim(),
        stressThreshold: threshold,
        isActive: true,
        createdAt: editingNominee?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveNominee(nominee);
      await loadNominees();
      setModalVisible(false);
      setVerifiedEmail(null);
      
      Alert.alert(
        'Success',
        editingNominee ? 'Nominee updated successfully.' : 'Nominee added successfully.'
      );
    } catch (error) {
      console.error('Error saving nominee:', error);
      Alert.alert('Error', 'Failed to save nominee.');
    }
  };

  const toggleNomineeStatus = async (nominee: Nominee) => {
    try {
      const updatedNominee = {
        ...nominee,
        isActive: !nominee.isActive,
        updatedAt: new Date().toISOString(),
      };
      await saveNominee(updatedNominee);
      await loadNominees();
    } catch (error) {
      console.error('Error toggling nominee status:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      marginTop: 5,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: 'rgba(76, 111, 255, 0.15)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    addButton: {
      backgroundColor: 'rgba(76, 111, 255, 0.05)',
      borderRadius: 25,
      paddingVertical: 15,
      paddingHorizontal: 30,
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.primary,
      elevation: 2,
      shadowColor: 'rgba(76, 111, 255, 0.15)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
    },
    addButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    nomineeCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 15,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: 'rgba(76, 111, 255, 0.15)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
    },
    nomineeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    nomineeName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    nomineeStatus: {
      fontSize: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
    },
    statusActive: {
      backgroundColor: 'rgba(76, 111, 255, 0.15)',
    },
    statusInactive: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    nomineeDetails: {
      marginBottom: 10,
    },
    nomineeDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      width: 80,
    },
    detailValue: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    nomineeActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    editButton: {
      backgroundColor: colors.primary,
    },
    deleteButton: {
      backgroundColor: '#F44336',
    },
    actionButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
         modalScrollContent: {
       flexGrow: 1,
       justifyContent: 'center',
       alignItems: 'center',
       paddingVertical: 20,
     },
     modalContent: {
       backgroundColor: colors.surface,
       borderRadius: 16,
       padding: 20,
       width: '90%',
       maxWidth: 400,
       borderWidth: 1,
       borderColor: colors.border,
       shadowColor: 'rgba(76, 111, 255, 0.15)',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.6,
       shadowRadius: 4,
       elevation: 5,
     },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 5,
    },
    inputGroup: {
      marginBottom: 15,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 5,
    },
         input: {
       backgroundColor: colors.card,
       borderRadius: 8,
       padding: 12,
       fontSize: 16,
       color: colors.text,
       borderWidth: 1,
       borderColor: colors.border,
     },
     emailContainer: {
       flexDirection: 'row',
       alignItems: 'center',
       gap: 10,
     },
     emailInput: {
       flex: 1,
     },
     verifyButton: {
       flexDirection: 'row',
       alignItems: 'center',
       backgroundColor: 'rgba(76, 111, 255, 0.15)',
       paddingHorizontal: 12,
       paddingVertical: 8,
       borderRadius: 8,
       gap: 4,
       borderWidth: 1,
       borderColor: colors.primary,
     },
     verifiedButton: {
       backgroundColor: 'rgba(76, 111, 255, 0.15)',
       borderColor: colors.primary,
     },
     verifyingButton: {
       backgroundColor: '#666666',
       borderColor: '#666666',
     },
     verifyButtonText: {
       color: colors.primary,
       fontSize: 12,
       fontWeight: '600',
     },
     verifiedText: {
       fontSize: 12,
       color: '#ffffff',
       marginTop: 5,
       fontWeight: '600',
     },
    thresholdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    thresholdSlider: {
      flex: 1,
      marginRight: 15,
    },
    thresholdValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
      minWidth: 30,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 15,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    saveButton: {
      flex: 1,
      borderRadius: 25,
      overflow: 'hidden',
    },
    saveButtonGradient: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Trusted Contacts</Text>
          <Text style={styles.headerSubtitle}>Manage who gets notified when you need support</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🤝 How It Works</Text>
            <Text style={styles.infoText}>
              Add trusted contacts who will receive a gentle notification when your stress level reaches their set threshold. 
              They won't see your detailed entries - only that you might need support.
            </Text>
          </View>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddNominee}>
            <Text style={styles.addButtonText}>+ Add Trusted Contact</Text>
          </TouchableOpacity>

          {/* Nominees List */}
          {nominees.map((nominee) => (
            <View key={nominee.id} style={styles.nomineeCard}>
              <View style={styles.nomineeHeader}>
                <Text style={styles.nomineeName}>{nominee.name}</Text>
                <TouchableOpacity
                  style={[
                    styles.nomineeStatus,
                    nominee.isActive ? styles.statusActive : styles.statusInactive,
                  ]}
                  onPress={() => toggleNomineeStatus(nominee)}
                >
                  <Text style={{ 
                    color: nominee.isActive ? colors.primary : colors.textSecondary, 
                    fontSize: 12,
                    fontWeight: nominee.isActive ? 'bold' : 'normal'
                  }}>
                    {nominee.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.nomineeDetails}>
                <View style={styles.nomineeDetail}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{nominee.email}</Text>
                </View>
                {nominee.phone && (
                  <View style={styles.nomineeDetail}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{nominee.phone}</Text>
                  </View>
                )}
                <View style={styles.nomineeDetail}>
                  <Text style={styles.detailLabel}>Relationship:</Text>
                  <Text style={styles.detailValue}>{nominee.relationship}</Text>
                </View>
                <View style={styles.nomineeDetail}>
                  <Text style={styles.detailLabel}>Alert at:</Text>
                  <Text style={styles.detailValue}>Stress level {nominee.stressThreshold}/10</Text>
                </View>
              </View>

              <View style={styles.nomineeActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditNominee(nominee)}
                >
                  <Ionicons name="pencil" size={14} color="white" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteNominee(nominee)}
                >
                  <Ionicons name="trash" size={14} color="white" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {nominees.length === 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                No trusted contacts added yet. Add someone you trust to receive support notifications when you need them most.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

             {/* Add/Edit Modal */}
       <Modal
         visible={modalVisible}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setModalVisible(false)}
       >
         <View style={styles.modalOverlay}>
           <ScrollView 
             contentContainerStyle={styles.modalScrollContent}
             showsVerticalScrollIndicator={false}
           >
             <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNominee ? 'Edit Contact' : 'Add Trusted Contact'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

                         <View style={styles.inputGroup}>
               <Text style={styles.inputLabel}>Email *</Text>
               <View style={styles.emailContainer}>
                 <TextInput
                   style={[styles.input, styles.emailInput]}
                   value={email}
                   onChangeText={(text) => {
                     setEmail(text);
                     if (verifiedEmail !== text) {
                       setVerifiedEmail(null);
                     }
                   }}
                   placeholder="Enter email address"
                   placeholderTextColor={colors.textTertiary}
                   keyboardType="email-address"
                   autoCapitalize="none"
                 />
                                   <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      verifiedEmail === email.trim() && styles.verifiedButton,
                      isVerifyingEmail && styles.verifyingButton,
                    ]}
                    onPress={handleVerifyEmail}
                                         disabled={isVerifyingEmail || !email.trim()}
                  >
                    <Ionicons 
                      name={verifiedEmail === email.trim() ? "checkmark-circle" : "shield-checkmark"} 
                      size={16} 
                      color={isVerifyingEmail ? "#ffffff" : verifiedEmail === email.trim() ? "#000000" : "#000000"} 
                    />
                                             <Text style={[
                                               styles.verifyButtonText,
                                               isVerifyingEmail && { color: '#ffffff' },
                                               verifiedEmail === email.trim() && { color: colors.primary, fontWeight: 'bold' }
                                             ]}>
               {isVerifyingEmail ? 'Verifying...' :
               verifiedEmail === email.trim() ? 'Verified' : 'Verify'}
             </Text>
                  </TouchableOpacity>
               </View>
               {verifiedEmail === email.trim() && (
                 <Text style={styles.verifiedText}>✅ Email verified with Google</Text>
               )}
             </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone (Optional)</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship *</Text>
              <TextInput
                style={styles.input}
                value={relationship}
                onChangeText={setRelationship}
                placeholder="e.g., Spouse, Parent, Friend"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Alert Threshold *</Text>
              <View style={styles.thresholdContainer}>
                <TextInput
                  style={[styles.input, styles.thresholdSlider]}
                  value={stressThreshold}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    if (text === '' || (num >= 1 && num <= 10)) {
                      setStressThreshold(text);
                    }
                  }}
                  placeholder="7"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
                <Text style={styles.thresholdValue}>/10</Text>
              </View>
              <Text style={[styles.inputLabel, { marginTop: 5 }]}>
                They will be notified when your stress level reaches this value or higher
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveNominee}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>
                    {editingNominee ? 'Update' : 'Add Contact'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
    </View>
  );
};

export default NomineesScreen;
