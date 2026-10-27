import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
};

/** 空状态：首次启动或删除全部记录后展示。 */
export function EmptyState({ title, description, actionLabel, onAction }: Props) {
    const theme = useTheme();

    return (
        <ThemedView style={styles.container}>
            <ThemedView type="backgroundElement" style={styles.iconCircle}>
                <ThemedText type="title" themeColor="primary" style={styles.icon}>
                    ✎
                </ThemedText>
            </ThemedView>
            <ThemedText type="subtitle" style={styles.title}>
                {title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.description}>
                {description}
            </ThemedText>
            {actionLabel && onAction ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={onAction}
                    style={({ pressed }) => [styles.action, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
                    <ThemedText style={styles.actionText}>{actionLabel}</ThemedText>
                </Pressable>
            ) : null}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.five,
        gap: Spacing.three,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 34,
        lineHeight: 40,
    },
    title: {
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        lineHeight: 22,
    },
    action: {
        marginTop: Spacing.two,
        paddingHorizontal: Spacing.five,
        height: 44,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        opacity: 0.85,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
