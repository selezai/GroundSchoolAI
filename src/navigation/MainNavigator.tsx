import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TabParamList } from '../types/navigation';
import { theme } from '../config/theme';

// Import screens (to be created)
import HomeScreen from '../screens/HomeScreen';
import StudyMaterialsScreen from '../screens/StudyMaterialsScreen';
import QuestionBankScreen from '../screens/QuestionBankScreen';
import InstructorAIScreen from '../screens/InstructorAIScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'StudyMaterials':
                iconName = focused ? 'book' : 'book-outline';
                break;
              case 'QuestionBank':
                iconName = focused ? 'help-circle' : 'help-circle-outline';
                break;
              case 'InstructorAI':
                iconName = focused ? 'robot' : 'robot-outline';
                break;
              case 'Profile':
                iconName = focused ? 'account' : 'account-outline';
                break;
              default:
                iconName = 'circle';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.disabled,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.surface,
          headerTitleStyle: theme.typography.h2,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Dashboard' }}
        />
        <Tab.Screen 
          name="StudyMaterials" 
          component={StudyMaterialsScreen}
          options={{ title: 'Study Materials' }}
        />
        <Tab.Screen 
          name="QuestionBank" 
          component={QuestionBankScreen}
          options={{ title: 'Question Bank' }}
        />
        <Tab.Screen 
          name="InstructorAI" 
          component={InstructorAIScreen}
          options={{ title: 'Instructor AI' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
