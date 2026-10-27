import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

function subscribe(callback: () => void) {
  const subscription = Appearance.addChangeListener(callback);
  return () => subscription.remove();
}

/**
 * Web 端使用 useSyncExternalStore，保证服务端渲染与客户端水合期间
 * 颜色方案一致（服务端默认返回 light），避免水合不一致。
 */
export function useColorScheme() {
  return useSyncExternalStore(
    subscribe,
    () => Appearance.getColorScheme() ?? 'light',
    () => 'light',
  );
}
