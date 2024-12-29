import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Icon } from 'react-native-elements';
import { analyticsService } from '../services/analytics';
import { theme } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';

interface StudyProgressProps {
  onPressCategory?: (category: string) => void;
}

const StudyProgress: React.FC<StudyProgressProps> = ({ onPressCategory }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const [progressData, streakCount] = await Promise.all([
        analyticsService.getStudyProgress(user!.id),
        analyticsService.getStudyStreak(user!.id),
      ]);
      setProgress(progressData);
      setStreak(streakCount);
    } catch (error) {
      console.error('Error loading study progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAccuracy = (correct: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const getProgressColor = (accuracy: number): string => {
    if (accuracy >= 80) return theme.colors.success;
    if (accuracy >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const renderStreakBadge = () => (
    <Card containerStyle={styles.streakCard}>
      <View style={styles.streakContainer}>
        <Icon
          name="local-fire-department"
          type="material"
          color={theme.colors.accent}
          size={32}
        />
        <Text style={styles.streakText}>{streak} Day Streak!</Text>
      </View>
      <Text style={styles.streakSubtext}>
        Keep studying daily to maintain your streak
      </Text>
    </Card>
  );

  const renderCategoryProgress = (category: any) => {
    const accuracy = calculateAccuracy(
      category.correct_answers,
      category.total_questions
    );
    const progressColor = getProgressColor(accuracy);

    return (
      <Card key={category.category} containerStyle={styles.categoryCard}>
        <Card.Title>{category.category}</Card.Title>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${accuracy}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
          <Text style={[styles.accuracyText, { color: progressColor }]}>
            {accuracy}%
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {category.correct_answers}/{category.total_questions} Questions
          </Text>
          <Text style={styles.statsText}>
            {category.study_time_minutes} mins studied
          </Text>
        </View>
        <Button
          title="Practice"
          type="outline"
          onPress={() => onPressCategory?.(category.category)}
          buttonStyle={[styles.practiceButton, { borderColor: progressColor }]}
          titleStyle={{ color: progressColor }}
        />
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {streak > 0 && renderStreakBadge()}
      <View style={styles.categoriesContainer}>
        {progress.map(renderCategoryProgress)}
      </View>
      {progress.length === 0 && (
        <Card containerStyle={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Start studying to track your progress!
          </Text>
          <Button
            title="Begin Study Session"
            onPress={() => onPressCategory?.('General')}
            buttonStyle={styles.beginButton}
          />
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCard: {
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  streakText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  streakSubtext: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
  },
  categoriesContainer: {
    padding: theme.spacing.sm,
  },
  categoryCard: {
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginRight: theme.spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  accuracyText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statsText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
  },
  practiceButton: {
    borderWidth: 2,
    borderRadius: theme.borderRadius.sm,
  },
  emptyCard: {
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  beginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xl,
  },
});

export default StudyProgress;
