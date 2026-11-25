
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../screens/ProfileScreen';
import AccountInfoScreen from '../screens/AccountInfoScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  AccountInfo: undefined;
  PrivacySecurity: undefined;
  HelpSupport: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
      />
    </Stack.Navigator>
  );
}
