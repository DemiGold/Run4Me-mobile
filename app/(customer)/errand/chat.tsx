import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { api } from '@/services/api';
import type { ChatMessage } from '@/services/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';

// ─────────────────────────────────────────────────────────────
// Runner Chat — wired to the errands API
//
// Reads `errandId`, `runnerName`, and `items` from route params.
//
// Data flow:
//   1. On mount, fetch messages via api.errands.listMessages(id).
//   2. Send a message:
//        a. Optimistically append with a temp id
//        b. Await api.errands.sendMessage(id, text)
//        c. Replace the temp message with the API's canonical one
//        d. On error, remove the temp message
//   3. Paste shortcut reuses the same send path with `items`.
//   4. Pull-to-refresh re-fetches the conversation.
//
// Empty state:
//   If the API returns [], we show an empty state prompting the
//   customer to say hi. This is what a fresh errand chat looks
//   like before anyone has sent anything.
//
// Still mock:
//   - The runner's phone number (hardcoded). Real flow will pass
//     it as a param or fetch from errand details.
//   - Video calling (shows an alert — not implemented).
// ─────────────────────────────────────────────────────────────

// ─── Fallback when opened without an errandId (e.g. deep link) ───
const FALLBACK_ERRAND_ID = 'err-1';

// ─── Fallback runner details when not passed via params ───
const FALLBACK_RUNNER = {
  name: 'David',
  status: 'Online · Runner',
  phone: '+2348000000000',
  avatarUri: null as string | null,
};

// ─── Fallback items string when no `items` param is available ───
const DEFAULT_PASTE = 'Ariel 1kg ×2, Milk 500ml ×1, Bread ×2';

export default function RunnerChat() {
  const params = useLocalSearchParams<{
    errandId?: string;
    runnerName?: string;
    items?: string;
  }>();

  const errandId = params.errandId || FALLBACK_ERRAND_ID;
  const runnerName = params.runnerName ?? FALLBACK_RUNNER.name;
  const pasteText = params.items?.trim() || DEFAULT_PASTE;

  // ─── Data state ───
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Composer state ───
  const [draft, setDraft] = useState('');
  const [showPaste, setShowPaste] = useState(true);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  // ─── Fetch messages ───
  const fetchMessages = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      try {
        const list = await api.errands.listMessages(errandId);
        setMessages(list);
      } catch {
        setError('Could not load messages. Pull down to try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [errandId]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ─── Auto-scroll to bottom when message count changes ───
  useEffect(() => {
    if (messages.length) {
      // Small delay so the FlatList finishes layout before scrolling
      setTimeout(
        () => listRef.current?.scrollToEnd({ animated: true }),
        80
      );
    }
  }, [messages.length]);

  // ─── Send — optimistic + replace with API's version ───
  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // 1. Optimistic append with a temp id
    const now = new Date();
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      from: 'me',
      text: trimmed,
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      createdAt: now.toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');

    // 2. Fire the API call
    try {
      const real = await api.errands.sendMessage(errandId, trimmed);
      // 3. Swap temp for the canonical message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? real : m))
      );
    } catch {
      // 4. Remove the temp message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      // In a full app we'd show a Toast here
    }
  };

  // ─── Paste shortcut reuses send() ───
  const handlePasteItems = () => {
    send(pasteText);
    setShowPaste(false);
  };

  // ─── Call ───
  const handleCall = () => {
    Linking.openURL(`tel:${FALLBACK_RUNNER.phone}`).catch(() => {
      Alert.alert('Cannot place call', 'Your device does not support calling.');
    });
  };

  // ─── Video (stub) ───
  const handleVideo = () => {
    Alert.alert('Video call', 'Video calling will be available soon.');
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

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

          {/* Avatar + name + status */}
          <View className="flex-row items-center gap-2.5 flex-1">
            <View className="w-9 h-9 rounded-full bg-background-dark items-center justify-center overflow-hidden">
              {FALLBACK_RUNNER.avatarUri ? (
                <Image
                  source={{ uri: FALLBACK_RUNNER.avatarUri }}
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
                  {FALLBACK_RUNNER.status}
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

        {/* ═══ Loading — skeleton bubbles ═══ */}
        {loading ? (
          <View className="flex-1 px-4 pt-4 gap-3">
            {/* Two fake incoming bubbles */}
            {[0, 1].map((i) => (
              <View key={`in-${i}`} className="flex-row justify-start">
                <View className="max-w-[78%] px-3.5 py-2.5 bg-surface border border-border rounded-2xl">
                  <Skeleton width={180} height={14} />
                  <View className="mt-2">
                    <Skeleton width={60} height={10} />
                  </View>
                </View>
              </View>
            ))}
            {/* One fake outgoing bubble */}
            <View className="flex-row justify-end">
              <View className="max-w-[78%] px-3.5 py-2.5 bg-primary-light rounded-2xl">
                <Skeleton width={140} height={14} />
                <View className="mt-2 items-end">
                  <Skeleton width={40} height={10} />
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* ═══ Error ═══ */}
        {!loading && error ? (
          <View className="flex-1">
            <EmptyState
              icon="alert-circle"
              title="Couldn't load chat"
              body={error}
              actionLabel="Retry"
              onAction={() => fetchMessages()}
            />
          </View>
        ) : null}

        {/* ═══ Loaded — list of messages ═══ */}
        {!loading && !error ? (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 8,
              gap: 10,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <Bubble message={item} />}
            ListEmptyComponent={
              <View className="flex-1 justify-center">
                <EmptyState
                  icon="message-circle"
                  title="Say hi to your runner"
                  body="Ask about items, substitutions, or delivery preferences."
                />
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchMessages(true)}
                tintColor={colors.primary}
              />
            }
          />
        ) : null}

        {/* ═══ Paste shortcut — dismissible ═══ */}
        {!loading && !error && showPaste ? (
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

        {/* ═══ Input row ═══ */}
        {!loading && !error ? (
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
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Bubble — single chat message with tail
//   'me'     → teal, right-aligned, tail on right
//   'runner' → white with border, left-aligned, tail on left
// ─────────────────────────────────────────────────────────────
function Bubble({ message }: { message: ChatMessage }) {
  const isMe = message.from === 'me';

  return (
    <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`
          max-w-[78%] px-3.5 py-2.5
          ${
            isMe
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