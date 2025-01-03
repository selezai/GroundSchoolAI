import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface PDFViewerProps {
  source: { uri: string };
  style?: object;
}

interface Styles {
  container: ViewStyle;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ source, style }) => {
  return (
    <View style={[styles.container, style]}>
      <iframe
        src={source.uri}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="PDF Viewer"
      />
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default PDFViewer;
