import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, disabled, placeholder }: Props) {
  const [text, setText] = useState('');
  const { colors } = useTheme();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text }]}
        value={text}
        onChangeText={setText}
        placeholder={placeholder ?? 'Message...'}
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={500}
        editable={!disabled}
        returnKeyType="send"
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity
        style={[styles.sendButton, { backgroundColor: disabled || !text.trim() ? colors.surfaceElevated : colors.accent }]}
        onPress={handleSend}
        disabled={disabled || !text.trim()}
      >
        <Text style={[styles.sendIcon, { color: disabled || !text.trim() ? colors.textMuted : '#fff' }]}>↑</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
});
