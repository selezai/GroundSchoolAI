import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from '@rneui/themed';
import { Icon } from 'react-native-elements';
import { theme } from './src/config/theme';
import { AuthProvider } from './src/contexts/AuthContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import StudyMaterialsScreen from './src/screens/StudyMaterialsScreen';
import QuestionBankScreen from './src/screens/QuestionBankScreen';
import InstructorAIScreen from './src/screens/InstructorAIScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Study Materials':
              iconName = 'book';
              break;
            case 'Question Bank':
              iconName = 'help';
              break;
            case 'Instructor AI':
              iconName = 'school';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <Icon
              name={iconName}
              type="material"
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Study Materials" component={StudyMaterialsScreen} />
      <Tab.Screen name="Question Bank" component={QuestionBankScreen} />
      <Tab.Screen name="Instructor AI" component={InstructorAIScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="Subscription"
              component={SubscriptionScreen}
              options={{
                headerShown: true,
                headerTitle: 'Subscription Plans',
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.surface,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
