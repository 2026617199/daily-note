import { Stack, router, useLocalSearchParams, usePreventRemove } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isValidDraft } from '@/services/note-model';
import { getNote, saveNote } from '@/services/note-store';

export default function EditorScreen() {
    const theme = useTheme();
    const params = useLocalSearchParams<{ id?: string }>();
    const id = typeof params.id === 'string' && params.id.length > 0 ? params.id : undefined;

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(!id);

    const savingRef = useRef(false);

    // 存在未保存修改时，拦截返回（返回按钮 / 手势 / 硬件返回）。
    usePreventRemove(
        dirty && !saving,
        ({ repeat }) => {
            Alert.alert('放弃修改？', '你还有未保存的内容，确定要离开吗？', [
                { text: '继续编辑', style: 'cancel' },
                {
                    text: '放弃',
                    style: 'destructive',
                    onPress: () => {
                        setDirty(false);
                        repeat();
                    },
                },
            ]);
        },
    );

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        (async () => {
            try {
                const note = await getNote(id);
                if (cancelled) return;
                if (!note) {
                    Alert.alert('记录不存在', '这条记录可能已被删除。', [
                        { text: '返回', onPress: () => router.back() },
                    ]);
                    return;
                }
                setTitle(note.title);
                setBody(note.body);
            } catch {
                if (!cancelled) {
                    Alert.alert('加载失败', '读取记录内容时出现问题。', [
                        { text: '返回', onPress: () => router.back() },
                    ]);
                }
            } finally {
                if (!cancelled) setLoaded(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const onSave = async () => {
        if (savingRef.current) return; // 防止重复提交
        if (!isValidDraft({ title, body })) {
            Alert.alert('无法保存', '标题和正文都不能为空。');
            return;
        }
        savingRef.current = true;
        setSaving(true);
        try {
            await saveNote({ title, body }, id);
            setDirty(false);
            router.back();
        } catch {
            Alert.alert('保存失败', '写入本地存储时出现问题，请重试。');
            savingRef.current = false;
            setSaving(false);
        }
    };

    const onChangeTitle = (value: string) => {
        setTitle(value);
        setDirty(true);
    };

    const onChangeBody = (value: string) => {
        setBody(value);
        setDirty(true);
    };

    const headerRight = () => (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="保存"
            disabled={saving}
            hitSlop={8}
            onPress={onSave}>
            <ThemedText themeColor={saving ? 'textSecondary' : 'primary'}>
                {saving ? '保存中…' : '保存'}
            </ThemedText>
        </Pressable>
    );

    if (!loaded) {
        return (
            <View style={[styles.loading, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ title: id ? '编辑' : '新建' }} />
                <ThemedText themeColor="textSecondary">加载中…</ThemedText>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Stack.Screen options={{ title: id ? '编辑' : '新建', headerRight }} />
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <TextInput
                    value={title}
                    onChangeText={onChangeTitle}
                    placeholder="标题"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                        styles.titleInput,
                        { color: theme.text, backgroundColor: theme.backgroundElement },
                    ]}
                    maxLength={80}
                    returnKeyType="next"
                />
                <TextInput
                    value={body}
                    onChangeText={onChangeBody}
                    placeholder="写点什么…"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                        styles.bodyInput,
                        { color: theme.text, backgroundColor: theme.backgroundElement },
                    ]}
                    multiline
                    textAlignVertical="top"
                    scrollEnabled={false}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: Spacing.three,
        gap: Spacing.three,
    },
    titleInput: {
        fontSize: 20,
        fontWeight: '600',
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.three,
        borderRadius: Radius.lg,
    },
    bodyInput: {
        fontSize: 16,
        lineHeight: 24,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.three,
        borderRadius: Radius.lg,
        minHeight: 220,
    },
});
