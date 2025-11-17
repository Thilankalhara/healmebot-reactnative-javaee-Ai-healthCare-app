import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import InputScreen from './screens/InputScreen'; 
import ReportScreen from './screens/ReportScreen';


export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Input: undefined;
  Report: { reportData?: any } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: true }}>
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Heal Me Bot' }} 
        />
        <Stack.Screen 
          name="Input" 
          component={InputScreen} 
          options={{ title: 'Input Details' }} 
        />
        <Stack.Screen 
          name="Report" 
          component={ReportScreen} 
          options={{ title: 'Your Report' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
