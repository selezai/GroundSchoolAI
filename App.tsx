import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from '@rneui/themed';
import { Icon } from '@rneui/themed';
import { theme } from './src/config/theme';
import { AuthProvider } from './src/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

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
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Study Materials" 
        component={StudyMaterialsScreen}
        options={{
          title: 'Study',
        }}
      />
      <Tab.Screen 
        name="Question Bank" 
        component={QuestionBankScreen}
        options={{
          title: 'Questions',
        }}
      />
      <Tab.Screen 
        name="Instructor AI" 
        component={InstructorAIScreen}
        options={{
          title: 'AI Tutor',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
};

export default App;
