import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeView } from '../../components/common/SafeView';
import { ChatMessage } from '../../components/coach/ChatMessage';
import { MessageInput } from '../../components/coach/MessageInput';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { useChatStore } from '../../store/useChatStore';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { sendMessageToCoach } from '../../services/claudeApi';
import type { RootStackParamList } from '../../types/navigation';

const SUGGESTED_PROMPTS = ['plan', 'nutrition', 'adjust', 'noEquipment'] as const;

export function CoachScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const profile = useAppStore((s) => s.profile);
  const { messages, isGenerating, addMessage, updateMessage, setGenerating } = useChatStore();
  const { canSendMessage, incrementMessageUsage, dailyMessagesUsed, dailyMessageLimit, isPremium } = useSubscriptionStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList>(null);

  // Add initial system greeting on first load
  useEffect(() => {
    if (messages.length === 0) {
      addMessage('assistant', t('coach.systemMessage'));
    }
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async (text: string) => {
    if (!canSendMessage()) {
      navigation.navigate('Paywall', { trigger: 'message_limit' });
      return;
    }

    addMessage('user', text);
    await incrementMessageUsage();
    setGenerating(true);
    scrollToBottom();

    try {
      const allMessages = [...messages, { id: '', role: 'user' as const, content: text, timestamp: '' }];
      let streamedText = '';
      const assistantMsg = addMessage('assistant', '...');

      await sendMessageToCoach(allMessages, profile, (chunk) => {
        streamedText += chunk;
        updateMessage(assistantMsg.id, streamedText);
        scrollToBottom();
      });

      if (!streamedText) updateMessage(assistantMsg.id, 'I encountered an error. Please try again.');
    } catch (err: any) {
      const errorMsg = 'Failed to get a response. Please try again.';
      const { messages: currentMsgs } = useChatStore.getState();
      const placeholder = currentMsgs.find((m) => m.content === '...');
      if (placeholder) updateMessage(placeholder.id, errorMsg);
    } finally {
      setGenerating(false);
      scrollToBottom();
    }
  };

  const handleSuggestedPrompt = (key: typeof SUGGESTED_PROMPTS[number]) => {
    handleSend(t(`coach.suggestedPrompts.${key}`));
  };

  const atLimit = !isPremium && dailyMessagesUsed >= dailyMessageLimit;

  return (
    <SafeView edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.coachAvatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
        <View>
          <Text style={[styles.coachName, { color: colors.text }]}>{t('coach.title')}</Text>
          <Text style={[styles.disclaimer, { color: colors.textMuted }]}>{t('coach.disclaimer')}</Text>
        </View>
      </View>

      {/* Message limit bar */}
      {!isPremium && (
        <View style={[styles.limitBar, { backgroundColor: atLimit ? `${colors.error}20` : colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.limitText, { color: atLimit ? colors.error : colors.textSecondary }]}>
            {atLimit
              ? t('coach.limitReached', { used: dailyMessagesUsed, limit: dailyMessageLimit })
              : `${dailyMessagesUsed}/${dailyMessageLimit} messages today`}
          </Text>
          {atLimit && (
            <TouchableOpacity onPress={() => navigation.navigate('Paywall', { trigger: 'message_limit' })}>
              <Text style={[styles.upgradeLink, { color: colors.accent }]}>{t('coach.upgrade')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <ChatMessage message={item} />}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        ListFooterComponent={
          isGenerating ? (
            <View style={[styles.typingIndicator, { backgroundColor: colors.surface }]}>
              <Text style={[styles.typingText, { color: colors.textSecondary }]}>{t('coach.generating')}</Text>
            </View>
          ) : messages.length <= 1 ? (
            <View style={styles.suggestionsContainer}>
              {SUGGESTED_PROMPTS.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSuggestedPrompt(key)}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>
                    {t(`coach.suggestedPrompts.${key}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
      />

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        disabled={isGenerating || atLimit}
        placeholder={atLimit ? t('coach.upgradePrompt') : t('coach.placeholder')}
      />
    </SafeView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  coachAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  coachName: { fontSize: 16, fontWeight: '700' },
  disclaimer: { fontSize: 11 },
  limitBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  limitText: { fontSize: 13 },
  upgradeLink: { fontSize: 13, fontWeight: '700' },
  messageList: { paddingVertical: 12, paddingBottom: 20 },
  typingIndicator: { marginHorizontal: 16, marginTop: 4, padding: 12, borderRadius: 16, alignSelf: 'flex-start' },
  typingText: { fontSize: 14 },
  suggestionsContainer: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  suggestionChip: { padding: 12, borderRadius: 12, borderWidth: 1 },
  suggestionText: { fontSize: 14 },
});
