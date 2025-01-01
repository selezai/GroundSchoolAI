import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card as RNECard } from '@rneui/themed';
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
        <RNECard containerStyle={styles.statCard}>
          <RNECard.Title>Study Progress</RNECard.Title>
          <RNECard.FeaturedSubtitle>Coming Soon</RNECard.FeaturedSubtitle>
        </RNECard>
        
        <RNECard containerStyle={styles.statCard}>
          <RNECard.Title>Questions Answered</RNECard.Title>
          <RNECard.FeaturedSubtitle>Coming Soon</RNECard.FeaturedSubtitle>
        </RNECard>
      </View>

      {/* Recent Documents */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>Recent Documents</Text>
        <RNECard containerStyle={styles.documentCard}>
          <RNECard.Title>No Recent Documents</RNECard.Title>
          <RNECard.FeaturedSubtitle>Upload your first document to get started</RNECard.FeaturedSubtitle>
        </RNECard>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <RNECard containerStyle={styles.actionCard}>
            <RNECard.Title>Upload Document</RNECard.Title>
          </RNECard>
          
          <RNECard containerStyle={styles.actionCard}>
            <RNECard.Title>Start Study Session</RNECard.Title>
          </RNECard>
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
