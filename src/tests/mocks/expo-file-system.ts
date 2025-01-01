// Mock implementation of expo-file-system for testing
export const documentDirectory = '/mock/documents/';

export const getInfoAsync = async (fileUri: string) => {
  return {
    exists: true,
    isDirectory: fileUri.endsWith('/'),
    size: 0,
    uri: fileUri,
  };
};

export const makeDirectoryAsync = async (dirPath: string, options?: { intermediates: boolean }) => {
  // Mock implementation - do nothing
  return;
};

export const readAsStringAsync = async (fileUri: string) => {
  // Mock implementation - return empty string
  return '';
};
