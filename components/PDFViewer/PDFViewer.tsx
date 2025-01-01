import React from 'react';
import { StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';

interface PDFViewerProps {
  source: { uri: string };
  style?: object;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ source, style }) => {
  return (
    <Pdf
      source={source}
      style={[styles.container, style]}
      trustAllCerts={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default PDFViewer;
