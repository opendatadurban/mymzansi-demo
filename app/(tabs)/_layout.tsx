import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../src/ui/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.wallet'),
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="apply"
        options={{
          title: t('tabs.apply'),
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="verify"
        options={{
          title: t('tabs.verify'),
          tabBarIcon: ({ color, size }) => <Ionicons name="scan-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
