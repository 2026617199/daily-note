import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { NoteCard } from '@/components/note-card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  clearAllNotes,
  listNotes,
  StorageCorruptedError,
} from '@/services/note-store';
import type { Note } from '@/types/note';

type LoadError = 'corrupted' | 'error';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState<LoadError | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listNotes();
      setNotes(data);
      setError(null);
    } catch (e) {
      setError(e instanceof StorageCorruptedError ? 'corrupted' : 'error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openEditor = useCallback(() => {
    router.push('/editor');
  }, []);

  const confirmReset = useCallback(() => {
    Alert.alert('重置数据', '确定要清空全部记录吗？此操作无法撤销。', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: async () => {
          await clearAllNotes();
          load();
        },
      },
    ]);
  }, [load]);

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.center}>
          <ThemedText type="subtitle" style={styles.errorTitle}>
            {error === 'corrupted' ? '数据无法读取' : '加载失败'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.errorText}>
            {error === 'corrupted'
              ? '本地存储内容已损坏。为保护你的数据，应用不会自动覆盖，请先重试；若持续失败，可手动清空后重新开始。'
              : '读取本地记录时出现问题，请重试。'}
          </ThemedText>
          <PrimaryButton title="重试" onPress={load} style={styles.retryButton} />
          {error === 'corrupted' ? (
            <PrimaryButton
              title="清空并重新开始"
              variant="danger"
              onPress={confirmReset}
              style={styles.retryButton}
            />
          ) : null}
        </View>
      );
    }

    if (notes === null) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      );
    }

    if (notes.length === 0) {
      return (
        <EmptyState
          title="还没有记录"
          description="点击右下角的按钮，写下你的第一条记录。"
          actionLabel="新建记录"
          onAction={openEditor}
        />
      );
    }

    return (
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="subtitle">今日一记</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              简单、可靠、只属于你的文字记录。
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => router.push({ pathname: '/note/[id]', params: { id: item.id } })}
          />
        )}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="关于"
              hitSlop={8}
              onPress={() => router.push('/about')}>
              <ThemedText themeColor="primary">关于</ThemedText>
            </Pressable>
          ),
        }}
      />
      {renderContent()}
      {!error && notes !== null && notes.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="新建记录"
          onPress={openEditor}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: theme.primary, bottom: insets.bottom + Spacing.three },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={styles.fabIcon}>＋</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
    gap: Spacing.three,
  },
  listContent: {
    padding: Spacing.three,
    paddingBottom: 112,
    gap: Spacing.two,
  },
  header: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    gap: Spacing.one,
  },
  subtitle: {
    lineHeight: 22,
  },
  errorTitle: {
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    alignSelf: 'stretch',
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  pressed: {
    opacity: 0.85,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '600',
  },
});

