import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Onboarding from './src/screens/Onboarding';
import RoomsList from './src/screens/RoomsList';
import RoomDetail from './src/screens/RoomDetail';
import Summary from './src/screens/Summary';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="RoomsList" component={RoomsList} />
        <Stack.Screen name="RoomDetail" component={RoomDetail} />
        <Stack.Screen name="Summary" component={Summary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
