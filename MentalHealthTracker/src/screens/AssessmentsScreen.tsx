import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAssessments, useSubmitAssessment } from '../hooks/useApi';

const SCALE_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

const OFFLINE_ASSESSMENTS = [
  {
    id: -1,
    key: 'phq9',
    name: 'PHQ-9 Depression Questionnaire',
    questions: [
      { id: -101, order: 1, text: 'Little interest or pleasure in doing things.' },
      { id: -102, order: 2, text: 'Feeling down, depressed, or hopeless.' },
      { id: -103, order: 3, text: 'Trouble falling or staying asleep, or sleeping too much.' },
      { id: -104, order: 4, text: 'Feeling tired or having little energy.' },
      { id: -105, order: 5, text: 'Poor appetite or overeating.' },
      { id: -106, order: 6, text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down.' },
      { id: -107, order: 7, text: 'Trouble concentrating on things, such as reading the newspaper or watching television.' },
      { id: -108, order: 8, text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual.' },
      { id: -109, order: 9, text: 'Thoughts that you would be better off dead, or of hurting yourself in some way.' },
    ],
  },
  {
    id: -2,
    key: 'gad7',
    name: 'GAD-7 Anxiety Questionnaire',
    questions: [
      { id: -201, order: 1, text: 'Feeling nervous, anxious, or on edge.' },
      { id: -202, order: 2, text: 'Not being able to stop or control worrying.' },
      { id: -203, order: 3, text: 'Worrying too much about different things.' },
      { id: -204, order: 4, text: 'Trouble relaxing.' },
      { id: -205, order: 5, text: 'Being so restless that it is hard to sit still.' },
      { id: -206, order: 6, text: 'Becoming easily annoyed or irritable.' },
      { id: -207, order: 7, text: 'Feeling afraid as if something awful might happen.' },
    ],
  },
];

export default function AssessmentsScreen() {
  const { colors } = useTheme();
  const { data: assessments, isLoading } = useAssessments();
  const submitMutation = useSubmitAssessment();
  const [selectedKey, setSelectedKey] = useState<'phq9' | 'gad7'>('phq9');
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const questionnaires = useMemo(() => {
    if (assessments?.results?.length) {
      return assessments.results;
    }
    return OFFLINE_ASSESSMENTS;
  }, [assessments]);

  const usingOfflineData = !assessments?.results?.length;

  const questionnaire = useMemo(() => {
    return questionnaires.find((a: any) => a.key === selectedKey) || null;
  }, [questionnaires, selectedKey]);

  React.useEffect(() => {
    setAnswers({});
  }, [selectedKey, questionnaire?.id]);

  const onSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const onSubmit = async () => {
    if (!questionnaire) return;
    const missing = (questionnaire.questions || []).filter((q: any) => answers[q.id] === undefined);
    if (missing.length > 0) {
      Alert.alert('Incomplete', 'Please answer all questions.');
      return;
    }
    try {
      if (usingOfflineData) {
        const totalScore = Object.values(answers).reduce((sum, val) => sum + Number(val || 0), 0);
        Alert.alert(
          'Assessment Recorded',
          `Offline score for ${questionnaire.name || selectedKey.toUpperCase()}: ${totalScore}. Record this score for your own analysis and sync when you are back online.`
        );
      } else {
        await submitMutation.mutateAsync({
          questionnaire_id: questionnaire.id,
          answers: Object.entries(answers).map(([question_id, value]) => ({ question_id: Number(question_id), value: Number(value) })),
        });
        Alert.alert('Submitted', 'Assessment submitted successfully.');
      }
      setAnswers({});
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to submit');
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 20 },
    title: { fontSize: 24, fontWeight: '700', color: colors.text },
    selector: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8 },
    pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, marginRight: 8, borderColor: colors.border },
    pillActive: { backgroundColor: '#ffffff' },
    pillText: { color: colors.text },
    pillTextActive: { color: '#000000', fontWeight: 'bold' },
    card: { backgroundColor: colors.card, margin: 16, borderRadius: 12, padding: 16 },
    qText: { fontSize: 16, color: colors.text, marginBottom: 10 },
    row: { flexDirection: 'row', flexWrap: 'wrap' },
    choice: { paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginRight: 8, marginBottom: 8 },
    choiceActive: { backgroundColor: '#ffffff', borderColor: '#ffffff' },
    choiceText: { color: colors.text },
    choiceTextActive: { color: '#000000', fontWeight: 'bold' },
    submitBtn: { backgroundColor: colors.primary, margin: 20, borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
    submitText: { color: '#fff', fontWeight: '700' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mental Health Assessments</Text>
      </View>

      <View style={styles.selector}>
        {(['phq9', 'gad7'] as const).map((k) => (
          <TouchableOpacity key={k} style={[styles.pill, selectedKey === k && styles.pillActive]} onPress={() => setSelectedKey(k)}>
            <Text style={[styles.pillText, selectedKey === k && styles.pillTextActive]}>{k.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        {usingOfflineData && !isLoading && (
          <Text style={{ paddingHorizontal: 20, color: colors.textSecondary, marginBottom: 10 }}>
            Offline questionnaires loaded. Connect to the internet to sync the latest assessments.
          </Text>
        )}
        {isLoading && <Text style={{ paddingHorizontal: 20, color: colors.text }}>Loading...</Text>}
        {questionnaire && questionnaire.questions?.map((q: any) => (
          <View key={q.id} style={styles.card}>
            <Text style={styles.qText}>{q.order}. {q.text}</Text>
            <View style={styles.row}>
              {SCALE_OPTIONS.map(opt => {
                const active = answers[q.id] === opt.value;
                return (
                  <TouchableOpacity key={opt.value} style={[styles.choice, active && styles.choiceActive]} onPress={() => onSelect(q.id, opt.value)}>
                    <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {questionnaire && questionnaire.questions?.length > 0 && (
          <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={submitMutation.isPending}>
            <Text style={styles.submitText}>{submitMutation.isPending ? 'Submitting...' : 'Submit Assessment'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}


