import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'danger' | 'ghost';
    style?: object;
};

/** 统一的主操作按钮：支持禁用与加载状态，防止重复提交。 */
export function PrimaryButton({
    title,
    onPress,
    disabled = false,
    loading = false,
    variant = 'primary',
    style,
}: Props) {
    const theme = useTheme();
    const isDisabled = disabled || loading;

    const background = isDisabled
        ? theme.backgroundSelected
        : variant === 'primary'
            ? theme.primary
            : variant === 'danger'
                ? theme.danger
                : theme.backgroundElement;

    const textColor = isDisabled
        ? theme.textSecondary
        : variant === 'ghost'
            ? theme.text
            : '#FFFFFF';

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled }}
            disabled={isDisabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: background },
                pressed && !isDisabled && styles.pressed,
                style,
            ]}>
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <Text style={[styles.text, { color: textColor }]}>{title}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 48,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.four,
    },
    pressed: {
        opacity: 0.85,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});
