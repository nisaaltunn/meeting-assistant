
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MeetingsScreen from '../screens/MeetingsScreen';
import MeetingDetailScreen from '../screens/MeetingDetailScreen';

export type MeetingsStackParamList = {
  MeetingsList: undefined;
  MeetingDetail: {
    meetingId: number;
  };
};

const Stack = createNativeStackNavigator<MeetingsStackParamList>();

export default function MeetingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MeetingsList"
        component={MeetingsScreen}
      />

      <Stack.Screen
        name="MeetingDetail"
        component={MeetingDetailScreen}
      />
    </Stack.Navigator>
  );
}
