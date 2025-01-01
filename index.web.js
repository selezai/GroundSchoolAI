import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';

// Register the app
AppRegistry.registerComponent(appName, () => App);

// Initialize web app
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication(appName, { rootTag });
}
