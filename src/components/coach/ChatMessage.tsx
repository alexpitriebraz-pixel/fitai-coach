import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { ChatMessage as ChatMessageType } from '../../types';

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.accent }
            : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
          { maxWidth: '80%' },
        ]}
      >
        <Text style={[styles.text, { color: isUser ? '#fff' : colors.text }]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  avatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
});
