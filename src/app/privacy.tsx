import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { APP_DISPLAY_NAME, FEEDBACK_EMAIL } from '@/constants/app-config';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const sections: { title: string; body: string }[] = [
    {
        title: '数据收集',
        body: `${APP_DISPLAY_NAME} 是一款本地记录工具，不收集、不上传你的任何个人信息。你无需注册或登录即可使用全部功能。`,
    },
    {
        title: '数据存储',
        body: '你创建的所有记录仅保存在你自己的设备本地存储中。卸载应用会同时删除这些本地数据。',
    },
    {
        title: '网络使用',
        body: '本应用的核心功能（新建、编辑、查看、删除记录）完全离线可用，不主动向任何服务器上传你的记录内容。',
    },
    {
        title: '系统权限',
        body: '本应用仅使用系统提供的基础显示能力，不申请相机、麦克风、通讯录、定位等与核心功能无关的权限。',
    },
    {
        title: '第三方服务',
        body: '本应用不接入任何用于收集个人信息的第三方 SDK。',
    },
    {
        title: '联系我们',
        body: `如对本隐私政策有任何疑问，请通过 ${FEEDBACK_EMAIL} 与我们联系。`,
    },
];

export default function PrivacyScreen() {
    const theme = useTheme();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <ThemedText type="subtitle">隐私政策</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
                更新日期：2026 年 10 月
            </ThemedText>
            {sections.map((section) => (
                <ThemedView type="backgroundElement" key={section.title} style={styles.card}>
                    <ThemedText type="smallBold">{section.title}</ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.body}>
                        {section.body}
                    </ThemedText>
                </ThemedView>
            ))}
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
    card: {
        borderRadius: Radius.lg,
        padding: Spacing.three,
        gap: Spacing.two,
    },
    body: {
        lineHeight: 22,
    },
});
