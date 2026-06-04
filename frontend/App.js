import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import Onboarding from './src/screens/Onboarding';
import RoomsList from './src/screens/RoomsList';
import RoomDetail from './src/screens/RoomDetail';
import Summary from './src/screens/Summary';

const sentryDsn = Constants.expoConfig?.extra?.sentryDsn;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
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

export default sentryDsn ? Sentry.wrap(App) : App;
