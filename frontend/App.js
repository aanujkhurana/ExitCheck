import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import * as Sentry from '@sentry/react-native';
import Onboarding from './src/screens/Onboarding';
import RoomsList from './src/screens/RoomsList';
import RoomDetail from './src/screens/RoomDetail';
import Summary from './src/screens/Summary';

if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

const Stack = createStackNavigator();

const App = () => (
  <>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="RoomsList" component={RoomsList} />
        <Stack.Screen name="RoomDetail" component={RoomDetail} />
        <Stack.Screen name="Summary" component={Summary} />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast />
  </>
);

export default process.env.EXPO_PUBLIC_SENTRY_DSN
  ? Sentry.wrap(App)
  : App;
