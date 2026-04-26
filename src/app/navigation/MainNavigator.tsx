import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import BirthChartScreen from '../screens/BirthChartScreen';
import DailyInsightScreen from '../screens/DailyInsightScreen';
import CompatibilityScreen from '../screens/CompatibilityScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EditBirthDetailsScreen from '../screens/EditBirthDetailsScreen';
import EditAstrologerScreen from '../screens/EditAstrologerScreen';
import EditPartnerScreen from '../screens/EditPartnerScreen';
import PartnersListScreen from '../screens/PartnersListScreen';
import FullReportScreen from '../screens/FullReportScreen';
import SavedInsightsScreen from '../screens/SavedInsightsScreen';
import SavedInsightDetailScreen from '../screens/SavedInsightDetailScreen';
import DailyInsightHistoryScreen from '../screens/DailyInsightHistoryScreen';
import PushPermissionPrePromptScreen from '../screens/PushPermissionPrePromptScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

import BottomNav from '../components/ui/BottomNav';
import { MainStackParamList, TabParamList } from './routes';

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false } as any}
      sceneContainerStyle={{ backgroundColor: '#080817' }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="BirthChart" component={BirthChartScreen} />
      <Tab.Screen name="DailyInsight" component={DailyInsightScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#080817' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="VideoCall" component={VideoCallScreen} />
      <Stack.Screen name="Compatibility" component={CompatibilityScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="EditBirthDetails" component={EditBirthDetailsScreen} />
      <Stack.Screen name="EditAstrologer" component={EditAstrologerScreen} />
      <Stack.Screen name="EditPartner" component={EditPartnerScreen} />
      <Stack.Screen name="Partners" component={PartnersListScreen} />
      <Stack.Screen name="FullReport" component={FullReportScreen} />
      <Stack.Screen name="SavedInsights" component={SavedInsightsScreen} />
      <Stack.Screen name="SavedInsightDetail" component={SavedInsightDetailScreen} />
      <Stack.Screen name="DailyInsightHistory" component={DailyInsightHistoryScreen} />
      <Stack.Screen name="PushPermissionPrePrompt" component={PushPermissionPrePromptScreen} />
      <Stack.Screen name="Placeholder" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}
