import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, Icon } from '@rneui/themed';
import { Card as RNECard } from '@rneui/base';
import { theme } from '../config/theme';
import { Question, questionService } from '../services/question';
import { useAuth } from '../contexts/AuthContext';
import QuestionCard from '../components/QuestionCard';

const QuestionBankScreen = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnswered: 0,
    correctAnswers: 0,
  });

  useEffect(() => {
    if (user) {
      loadQuestions();
    }
  }, [user]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const loadedQuestions = await questionService.getQuestions(user!.id, {
        limit: 20, // Load 20 questions at a time
      });
      setQuestions(loadedQuestions);
      
      // Calculate stats
      const answered = loadedQuestions.filter(q => q.times_shown && q.times_shown > 0);
      const correct = answered.reduce((sum, q) => sum + (q.times_correct || 0), 0);
      setStats({
        totalAnswered: answered.length,
        correctAnswers: correct,
      });
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (correct: boolean) => {
    if (!questions[currentQuestionIndex]) return;

    try {
      await questionService.recordAnswer(questions[currentQuestionIndex].id, correct);
      
      // Update stats
      setStats(prev => ({
        totalAnswered: prev.totalAnswered + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      }));

      // Move to next question after a brief delay
      setTimeout(() => {
        setShowAnswer(false);
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // Reload questions when we reach the end
          loadQuestions();
          setCurrentQuestionIndex(0);
        }
      }, 1500);
    } catch (error) {
      console.error('Error recording answer:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const successRate = stats.totalAnswered > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100)
    : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Performance Overview */}
      <RNECard containerStyle={styles.overviewCard}>
        <RNECard.Title>Performance Overview</RNECard.Title>
        <RNECard.Divider />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalAnswered}</Text>
            <Text style={styles.statLabel}>Questions Answered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{successRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>
      </RNECard>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      ) : questions.length === 0 ? (
        <RNECard containerStyle={styles.emptyStateCard}>
          <RNECard.Title>No questions available</RNECard.Title>
          <RNECard.Divider />
          <Text style={styles.emptyStateText}>
            Upload and analyze study materials to generate questions
          </Text>
          <Icon
            name="book"
            type="feather"
            size={48}
            color={theme.colors.grey3}
            style={styles.emptyStateIcon}
          />
        </RNECard>
      ) : (
        <View style={styles.questionContainer}>
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            showAnswer={showAnswer}
            onShowAnswer={() => setShowAnswer(true)}
          />
        </View>
      )}
    </ScrollView>
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
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
  emptyStateCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    color: theme.colors.grey3,
    marginVertical: theme.spacing.md,
  },
  emptyStateIcon: {
    marginTop: theme.spacing.md,
  },
  questionContainer: {
    margin: theme.spacing.md,
  },
});

export default QuestionBankScreen;
