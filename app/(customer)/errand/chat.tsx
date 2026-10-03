import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Runner Chat
//
// Chat between the customer and the assigned runner during an
// active errand. Header compacts avatar + status + call actions
// into a single row. Messages use proper tails for direction.
//
// Reads `errandId`, `runnerName`, and `items` from route params.
// The paste shortcut uses the real `items` string if available.
//
// MOCK: messages seeded below, phone number is a placeholder.
// Replace with websocket or polled GET /errands/:id/chat.
// ─────────────────────────────────────────────────────────────

type Message = {
  id: string;
  from: 'me' | 'runner';
  text: string;
  time: string;
};

// ─── MOCK runner — replace with real data from errand detail ───
const MOCK_RUNNER = {
  name: 'David',
  status: 'Online · Runner',
  phone: '+2348000000000',
  avatarUri: null as string | null, // set when API provides
};

// 'me' = customer. 'runner' = the other party.
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    from: 'runner',
    text: "Hi Chioma, I'm heading to Shoprite now. Anything else to add?",
    time: '9:41',
  },
  {
    id: '2',
    from: 'me',
    text: "Please check the expiry dates. I'll share the full list below.",
    time: '9:42',
  },
];

// Fallback when no `items` param is passed
const DEFAULT_PASTE = 'Ariel 1kg ×2, Milk 500ml ×1, Bread ×2';

export default function RunnerChat() {
  const params = useLocalSearchParams<{
    errandId?: string;
    runnerName?: string;
    items?: string;
  }>();

  const runnerName = params.runnerName ?? MOCK_RUNNER.name;
  const pasteText = params.items?.trim() || DEFAULT_PASTE;

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [showPaste, setShowPaste] = useState(true);

  const listRef = useRef<FlatList<Message>>(null);

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    if (messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 60);
    }
  }, [messages.length]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), from: 'me', text: trimmed, time },
    ]);
    setDraft('');

    // ─── MOCK: replace with POST /errands/:id/chat ───
  };

  const handlePasteItems = () => {
    send(pasteText);
    setShowPaste(false);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${MOCK_RUNNER.phone}`).catch(() => {
      Alert.alert('Cannot place call', 'Your device does not support calling.');
    });
  };

  const handleVideo = () => {
    // ─── MOCK: video calling not yet implemented ───
    Alert.alert('Video call', 'Video calling will be available soon.');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >

        {/* ─── Header — compact, single row ─── */}
        <View className="flex-row items-center gap-3 px-4 pt-3 pb-3 border-b border-border">

          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={22} color={colors.ink} />
          </TouchableOpacity>

          {/* Avatar + name + status — one compact block */}
          <View className="flex-row items-center gap-2.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-background-dark items-center justify-center overflow-hidden">
              {MOCK_RUNNER.avatarUri ? (
                <Image
                  source={{ uri: MOCK_RUNNER.avatarUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Feather name="user" size={18} color={colors.subtle} />
              )}
            </View>

            <View className="flex-1">
              <Text
                className="text-body-sm font-gabarito-bold text-ink"
                numberOfLines={1}
              >
                {runnerName}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-status-success" />
                <Text className="text-caption-sm font-figtree text-muted">
                  {MOCK_RUNNER.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Call */}
          <TouchableOpacity
            onPress={handleCall}
            className="w-9 h-9 items-center justify-center rounded-full bg-primary-light"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Feather name="phone" size={16} color={colors.primary} />
          </TouchableOpacity>

          {/* Video */}
          <TouchableOpacity
            onPress={handleVideo}
            className="w-9 h-9 items-center justify-center rounded-full bg-primary-light"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Feather name="video" size={16} color={colors.primary} />
          </TouchableOpacity>

        </View>

        {/* ─── Messages ─── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <Bubble message={item} />}
        />

        {/* ─── Paste shortcut — small, dismissible ─── */}
        {showPaste ? (
          <View className="mx-4 mb-2 flex-row items-center gap-2 bg-accent-light rounded-2xl px-3 py-2.5">
            <Feather name="clipboard" size={14} color={colors.accent} />
            <Text
              className="flex-1 text-caption font-figtree text-muted"
              numberOfLines={1}
            >
              Paste errand items &amp; instructions
            </Text>
            <TouchableOpacity onPress={handlePasteItems} hitSlop={6}>
              <Text className="text-caption font-figtree-bold text-accent">
                PASTE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPaste(false)} hitSlop={6}>
              <Feather name="x" size={14} color={colors.muted} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ─── Input row ─── */}
        <View className="flex-row items-end gap-2 px-4 pb-4 pt-1">
          <View className="flex-1 min-h-12 max-h-32 rounded-2xl border border-border bg-surface px-4 py-3">
            <TextInput
              className="text-body font-figtree text-ink"
              placeholder="Type a message..."
              placeholderTextColor={colors.subtle}
              value={draft}
              onChangeText={setDraft}
              multiline
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          <TouchableOpacity
            onPress={() => send(draft)}
            disabled={!draft.trim()}
            activeOpacity={0.85}
            className={`
              w-12 h-12 rounded-full items-center justify-center
              ${draft.trim() ? 'bg-primary' : 'bg-border-light'}
            `}
          >
            <Feather
              name="arrow-up"
              size={20}
              color={draft.trim() ? colors.white : colors.subtle}
            />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Bubble — single chat message with tail
//   'me'     → teal, right-aligned, tail on right
//   'runner' → white with border, left-aligned, tail on left
// ─────────────────────────────────────────────────────────────
function Bubble({ message }: { message: Message }) {
  const isMe = message.from === 'me';

  return (
    <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`
          max-w-[78%] px-3.5 py-2.5
          ${isMe
            ? 'bg-primary rounded-2xl rounded-br-md'
            : 'bg-surface border border-border rounded-2xl rounded-bl-md'
          }
        `}
      >
        <Text
          className={`
            text-body-sm font-figtree leading-5
            ${isMe ? 'text-white' : 'text-ink'}
          `}
        >
          {message.text}
        </Text>
        <Text
          className={`
            text-caption-sm font-figtree mt-1
            ${isMe ? 'text-white/70' : 'text-muted'}
          `}
          style={{ alignSelf: isMe ? 'flex-end' : 'flex-start' }}
        >
          {message.time}
        </Text>
      </View>
    </View>
  );
}