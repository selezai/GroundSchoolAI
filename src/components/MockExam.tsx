import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import { Card } from '@rneui/themed';
import { theme } from '../config/theme';
import { Question, questionService } from '../services/question';
import QuestionCard from './QuestionCard';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onClose: () => void;
}

const MockExam: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({});
  const [examCompleted, setExamCompleted] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const fetchedQuestions = await questionService.getQuestions(user!.id, {
        limit: 20, // Number of questions in mock exam
      });
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = async (correct: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({ ...answers, [currentQuestion.id]: correct });

    await questionService.recordAnswer(currentQuestion.id, correct);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    } else {
      setExamCompleted(true);
    }
  };

  const calculateScore = () => {
    const totalAnswered = Object.keys(answers).length;
    const correctAnswers = Object.values(answers).filter(Boolean).length;
    return {
      total: totalAnswered,
      correct: correctAnswers,
      percentage: Math.round((correctAnswers / totalAnswered) * 100),
    };
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (examCompleted) {
    const score = calculateScore();
    return (
      <Card containerStyle={styles.container}>
        <Card.Title>Exam Complete</Card.Title>
        <Card.Divider />

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Your Score:</Text>
          <Text style={styles.scorePercentage}>{score.percentage}%</Text>
          <Text style={styles.scoreDetails}>
            {score.correct} correct out of {score.total} questions
          </Text>
        </View>

        <Button
          title="Close"
          onPress={onClose}
          buttonStyle={styles.closeButton}
          containerStyle={styles.buttonContainer}
        />
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <Button
          type="clear"
          icon={
            <Icon
              name="close"
              type="material"
              size={24}
              color={theme.colors.text}
            />
          }
          onPress={onClose}
        />
      </View>

      <ScrollView style={styles.content}>
        {questions.length > 0 && (
          <QuestionCard
            question={questions[currentQuestionIndex]}
            onAnswer={handleAnswer}
            showAnswer={showAnswer}
            onShowAnswer={handleShowAnswer}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progress: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  scoreText: {
    fontSize: theme.typography.h3.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  scorePercentage: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  scoreDetails: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
});

export default MockExam;
