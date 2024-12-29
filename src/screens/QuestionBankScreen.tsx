import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card, Icon } from 'react-native-elements';
import { theme } from '../config/theme';

const QuestionBankScreen = () => {
  const handleStartMockExam = () => {
    // TODO: Implement mock exam
  };

  return (
    <View style={styles.container}>
      {/* Performance Overview */}
      <Card containerStyle={styles.overviewCard}>
        <Card.Title>Performance Overview</Card.Title>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Questions Answered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>
      </Card>

      {/* Mock Exam Button */}
      <Button
        title="Start Mock Exam"
        icon={
          <Icon
            name="file-text-o"
            type="font-awesome"
            color="white"
            size={15}
            style={{ marginRight: 10 }}
          />
        }
        onPress={handleStartMockExam}
        buttonStyle={styles.mockExamButton}
        containerStyle={styles.mockExamButtonContainer}
      />

      {/* Question Categories */}
      <ScrollView style={styles.categoriesList}>
        <Text style={styles.sectionTitle}>Question Categories</Text>
        
        {/* Empty state */}
        <Card containerStyle={styles.emptyStateCard}>
          <Icon
            name="question-circle-o"
            type="font-awesome"
            size={40}
            color={theme.colors.disabled}
          />
          <Text style={styles.emptyStateText}>
            No questions available
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Upload study materials to generate questions
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overviewCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  mockExamButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  mockExamButtonContainer: {
    margin: theme.spacing.md,
  },
  categoriesList: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  emptyStateText: {
    ...theme.typography.h3,
    color: theme.colors.disabled,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...theme.typography.body,
    color: theme.colors.disabled,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default QuestionBankScreen;
