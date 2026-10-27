import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
    APP_DISPLAY_NAME,
    APP_ENGLISH_NAME,
    FEEDBACK_EMAIL,
} from '@/constants/app-config';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function getVersion(): string {
    // 从真实构建配置中读取版本号，避免多处硬编码。
    return Constants.expoConfig?.version ?? '1.0.0';
}

export default function AboutScreen() {
    const theme = useTheme();

    const openFeedback = async () => {
        const url = `mailto:${FEEDBACK_EMAIL}`;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('无法打开邮箱', `请通过 ${FEEDBACK_EMAIL} 与我们联系。`);
            }
        } catch {
            Alert.alert('无法打开邮箱', `请通过 ${FEEDBACK_EMAIL} 与我们联系。`);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Image
                    source={require('@/assets/images/icon.png')}
                    style={styles.icon}
                    contentFit="cover"
                />
                <ThemedText type="subtitle">{APP_DISPLAY_NAME}</ThemedText>
                <ThemedText themeColor="textSecondary">{APP_ENGLISH_NAME}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                    版本 {getVersion()}
                </ThemedText>
            </View>

            <ThemedView type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold">关于</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.intro}>
                    今日一记是一款极简个人文字记录工具。所有内容仅保存在你的设备本地，无需注册登录，
                    也不依赖网络。记录你的想法、灵感与日常，简单而可靠。
                </ThemedText>
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.card}>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/privacy')}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                    <ThemedText>隐私政策</ThemedText>
                    <ThemedText themeColor="textSecondary">›</ThemedText>
                </Pressable>
                <ThemedView type="backgroundSelected" style={styles.divider} />
                <Pressable
                    accessibilityRole="button"
                    onPress={openFeedback}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                    <ThemedText>意见反馈</ThemedText>
                    <ThemedText themeColor="textSecondary" type="small">
                        {FEEDBACK_EMAIL}
                    </ThemedText>
                </Pressable>
            </ThemedView>

            <ThemedText themeColor="textSecondary" type="small" style={styles.copyright}>
                © 2026 {APP_DISPLAY_NAME}
            </ThemedText>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: Spacing.four,
        gap: Spacing.three,
    },
    header: {
        alignItems: 'center',
        gap: Spacing.one,
        paddingVertical: Spacing.four,
    },
    icon: {
        width: 88,
        height: 88,
        borderRadius: Radius.lg,
        marginBottom: Spacing.two,
    },
    card: {
        borderRadius: Radius.lg,
        padding: Spacing.three,
        gap: Spacing.two,
    },
    intro: {
        lineHeight: 22,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.two,
        gap: Spacing.two,
    },
    pressed: {
        opacity: 0.7,
    },
    divider: {
        height: 1,
    },
    copyright: {
        textAlign: 'center',
        marginTop: Spacing.four,
    },
});
