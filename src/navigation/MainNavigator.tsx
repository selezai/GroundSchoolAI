import React from 'react';
import { TextStyle } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { theme } from '../config/theme';
import HomeScreen from '../screens/HomeScreen';
import QuestionBankScreen from '../screens/QuestionBankScreen';
import StudyMaterialsScreen from '../screens/StudyMaterialsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GroundSchoolScreen from '../screens/GroundSchoolScreen';

export type TabParamList = {
  Home: undefined;
  'Question Bank': undefined;
  'Study Materials': undefined;
  'Ground School': undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const MainNavigator = () => {
  const screenOptions = ({ 
    route 
  }: { 
    route: RouteProp<TabParamList, keyof TabParamList>; 
  }) => ({
    tabBarIcon: ({ 
      focused, 
      color, 
      size 
    }: { 
      focused: boolean; 
      color: string; 
      size: number; 
    }) => {
      let iconName: string;

      switch (route.name) {
        case 'Home':
          iconName = 'home';
          break;
        case 'Question Bank':
          iconName = 'book';
          break;
        case 'Study Materials':
          iconName = 'library-books';
          break;
        case 'Ground School':
          iconName = 'school';
          break;
        case 'Profile':
          iconName = 'person';
          break;
        default:
          iconName = 'help';
      }

      return <Icon name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.disabled,
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTintColor: theme.colors.text,
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Question Bank" component={QuestionBankScreen} />
      <Tab.Screen name="Study Materials" component={StudyMaterialsScreen} />
      <Tab.Screen name="Ground School" component={GroundSchoolScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
