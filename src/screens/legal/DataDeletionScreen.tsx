import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeView } from '../../components/common/SafeView';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';

export function DataDeletionScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { deleteAccount } = useAppStore();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const CONFIRM_PHRASE = 'DELETE';
  const isConfirmed = confirmText === CONFIRM_PHRASE;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    Alert.alert(
      'Final Confirmation',
      'This will permanently delete your account and all data. This CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccount();
              // Navigation resets automatically because profile becomes null
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeView>
      <View style={styles.container}>
        <View style={[styles.iconBox, { backgroundColor: `${colors.error}15` }]}>
          <Text style={styles.icon}>⚠️</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Delete Account & Data</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          This action will permanently delete:
          {'\n'}• Your profile and fitness goals
          {'\n'}• All workout history and logs
          {'\n'}• All AI chat history
          {'\n'}• Your progress data
          {'\n\n'}Your subscription will NOT be automatically cancelled. Manage it separately through the App Store/Google Play.
        </Text>

        <Text style={[styles.confirmLabel, { color: colors.text }]}>
          Type <Text style={{ color: colors.error, fontWeight: '800' }}>DELETE</Text> to confirm
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: isConfirmed ? colors.error : colors.border }]}
          value={confirmText}
          onChangeText={setConfirmText}
          placeholder="Type DELETE"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
        />

        <Button
          title="Delete My Account"
          onPress={handleDelete}
          disabled={!isConfirmed}
          loading={loading}
          style={[styles.deleteBtn, !isConfirmed && { opacity: 0.4 }]}
          textStyle={{ color: '#fff' }}
        />

        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" />
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 20 },
  iconBox: { alignSelf: 'center', padding: 20, borderRadius: 40 },
  icon: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 22 },
  confirmLabel: { fontSize: 15 },
  input: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  deleteBtn: { backgroundColor: '#DC2626' },
});
