import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-elements';
import { theme } from '../config/theme';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.section}>
        <Text h2 style={styles.welcomeText}>Welcome to GroundSchoolAI</Text>
        <Text style={styles.subtitle}>Your AI-powered aviation study companion</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card containerStyle={styles.statCard}>
          <Card.Title>Study Progress</Card.Title>
          <Text>Coming Soon</Text>
        </Card>
        
        <Card containerStyle={styles.statCard}>
          <Card.Title>Questions Answered</Card.Title>
          <Text>Coming Soon</Text>
        </Card>
      </View>

      {/* Recent Documents */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>Recent Documents</Text>
        <Card containerStyle={styles.documentCard}>
          <Text>No documents yet</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: theme.spacing.md,
  },
  welcomeText: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
  sectionTitle: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    margin: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  documentCard: {
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    margin: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
});

export default HomeScreen;
