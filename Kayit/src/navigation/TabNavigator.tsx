
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import RecordScreen from '../screens/RecordScreen';
import MeetingsScreen from '../screens/MeetingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import colors from '../theme/colors';

import MeetingsStack from './MeetingsStack';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },

        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Ana Sayfa':
              iconName = focused ? 'home' : 'home-outline';
              break;

            case 'Kayıt':
              iconName = focused ? 'mic' : 'mic-outline';
              break;

            case 'Toplantılar':
              iconName = focused ? 'folder' : 'folder-outline';
              break;

            default:
              iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Kayıt"
        component={RecordScreen}
      />

      <Tab.Screen
     name="Toplantılar"
     component={MeetingsStack}
/>

      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

