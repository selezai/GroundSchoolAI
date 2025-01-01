import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PDFViewerProps {
  source: { uri: string };
  style?: object;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ source, style }) => {
  return (
    <View style={[styles.container, style]}>
      <iframe
        src={source.uri}
        style={styles.iframe}
        title="PDF Viewer"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

export default PDFViewer;
