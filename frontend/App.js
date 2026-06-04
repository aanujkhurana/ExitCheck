import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import Onboarding from './src/screens/Onboarding';
import RoomsList from './src/screens/RoomsList';
import RoomDetail from './src/screens/RoomDetail';
import Summary from './src/screens/Summary';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const sentryDsn = Constants.expoConfig?.extra?.sentryDsn;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
  });
}

const Stack = createStackNavigator();

function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={token ? 'Onboarding' : 'Login'}>
        {token ? (
          <>
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="RoomsList" component={RoomsList} />
            <Stack.Screen name="RoomDetail" component={RoomDetail} />
            <Stack.Screen name="Summary" component={Summary} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const App = () => (
  <AuthProvider>
    <AppNavigator />
    <Toast />
  </AuthProvider>
);

export default sentryDsn ? Sentry.wrap(App) : App;
