import React from 'react';
import { ScrollView, View, StyleSheet, Platform } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { theme } from '../config/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Welcome Section */}
        <View style={styles.section}>
          <Text h2 style={styles.welcomeText}>Welcome to GroundSchoolAI</Text>
          <Text style={styles.subtitle}>Your AI-powered aviation study companion</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card containerStyle={styles.statCard}>
            <Card.Title>Study Progress</Card.Title>
            <Card.FeaturedSubtitle>Coming Soon</Card.FeaturedSubtitle>
          </Card>
          
          <Card containerStyle={styles.statCard}>
            <Card.Title>Questions Answered</Card.Title>
            <Card.FeaturedSubtitle>Coming Soon</Card.FeaturedSubtitle>
          </Card>
        </View>

        {/* Recent Documents */}
        <View style={styles.section}>
          <Text h4 style={styles.sectionTitle}>Recent Documents</Text>
          <Card containerStyle={styles.documentCard}>
            <Card.Title>No Recent Documents</Card.Title>
            <Text>Upload your first document to get started</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text h4 style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Card containerStyle={styles.actionCard}>
              <Card.Title>Upload Document</Card.Title>
            </Card>
            
            <Card containerStyle={styles.actionCard}>
              <Card.Title>Start Study Session</Card.Title>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.8,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: Platform.select({ web: 1, default: undefined }),
    margin: theme.spacing.xs,
    borderRadius: 8,
    ...Platform.select({
      web: {
        minWidth: 200,
      },
    }),
  },
  documentCard: {
    margin: 0,
    borderRadius: 8,
  },
  actionsContainer: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: Platform.select({ web: 1, default: undefined }),
    margin: theme.spacing.xs,
    borderRadius: 8,
    ...Platform.select({
      web: {
        minWidth: 200,
      },
    }),
  },
});

export default HomeScreen;
