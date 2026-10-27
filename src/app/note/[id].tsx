import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deleteNote, getNote } from '@/services/note-store';
import type { Note } from '@/types/note';
import { formatFullDateTime } from '@/utils/format-date';

export default function NoteDetailScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ id: string }>();
    const id = typeof params.id === 'string' ? params.id : '';

    const [note, setNote] = useState<Note | null>(null);
    const [notFound, setNotFound] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            const data = await getNote(id);
            if (!data) {
                setNotFound(true);
                return;
            }
            setNote(data);
            setNotFound(false);
        } catch {
            setNotFound(true);
        }
    }, [id]);

    // 编辑保存后返回本页时重新读取最新数据。
    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    const confirmDelete = useCallback(() => {
        Alert.alert('删除记录', '确定要删除这条记录吗？此操作无法撤销。', [
            { text: '取消', style: 'cancel' },
            {
                text: '删除',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteNote(id);
                        router.back();
                    } catch {
                        Alert.alert('删除失败', '删除记录时出现问题，请重试。');
                    }
                },
            },
        ]);
    }, [id]);

    const headerRight = () => (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="编辑"
            hitSlop={8}
            onPress={() => router.push({ pathname: '/editor', params: { id } })}>
            <ThemedText themeColor="primary">编辑</ThemedText>
        </Pressable>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerRight }} />

            {notFound ? (
                <View style={styles.center}>
                    <ThemedText type="subtitle">记录不存在</ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.centerText}>
                        这条记录可能已被删除。
                    </ThemedText>
                    <PrimaryButton title="返回" onPress={() => router.back()} style={styles.backButton} />
                </View>
            ) : note === null ? (
                <View style={styles.center}>
                    <ActivityIndicator color={theme.primary} />
                </View>
            ) : (
                <>
                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}>
                        <ThemedText type="subtitle" style={styles.title}>
                            {note.title}
                        </ThemedText>
                        <ThemedText style={styles.body}>{note.body}</ThemedText>
                        <ThemedText themeColor="textSecondary" type="small" style={styles.meta}>
                            {`创建时间：${formatFullDateTime(note.createdAt)}`}
                        </ThemedText>
                        <ThemedText themeColor="textSecondary" type="small">
                            {`更新时间：${formatFullDateTime(note.updatedAt)}`}
                        </ThemedText>
                    </ScrollView>
                    <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
                        <PrimaryButton title="删除" variant="danger" onPress={confirmDelete} />
                    </View>
                </>
            )}
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
    centerText: {
        textAlign: 'center',
        lineHeight: 22,
    },
    backButton: {
        alignSelf: 'stretch',
    },
    content: {
        padding: Spacing.four,
        gap: Spacing.three,
    },
    title: {
        lineHeight: 40,
    },
    body: {
        lineHeight: 26,
    },
    meta: {
        marginTop: Spacing.three,
    },
    footer: {
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.three,
    },
});
