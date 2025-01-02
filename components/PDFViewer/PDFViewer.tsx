import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import WebView from 'react-native-webview';

interface PDFViewerProps {
  source: string;
  style?: StyleProp<ViewStyle>;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ source, style }) => {
  return (
    <WebView
      source={{ uri: source }}
      style={style}
      javaScriptEnabled={true}
    />
  );
};

export default PDFViewer;
