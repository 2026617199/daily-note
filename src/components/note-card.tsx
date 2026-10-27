import { Pressable, StyleSheet, Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Note } from '@/types/note';
import { formatDateTime } from '@/utils/format-date';

type Props = {
    note: Note;
    onPress: () => void;
};

/** 首页列表中的单条记录卡片。 */
export function NoteCard({ note, onPress }: Props) {
    const theme = useTheme();

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
            <ThemedView type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
                    {note.title}
                </ThemedText>
                <ThemedText
                    themeColor="textSecondary"
                    numberOfLines={2}
                    style={styles.preview}>
                    {note.body}
                </ThemedText>
                <Text style={[styles.date, { color: theme.textSecondary }]}>
                    {formatDateTime(note.updatedAt)}
                </Text>
            </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        borderRadius: Radius.lg,
    },
    pressed: {
        opacity: 0.85,
    },
    card: {
        borderRadius: Radius.lg,
        padding: Spacing.three,
        gap: Spacing.two,
    },
    title: {
        fontSize: 17,
    },
    preview: {
        lineHeight: 22,
    },
    date: {
        fontSize: 12,
        marginTop: Spacing.half,
    },
});
