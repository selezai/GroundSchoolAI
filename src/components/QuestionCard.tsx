import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import { Card } from '@rneui/themed';
import { theme } from '../config/theme';
import { Question } from '../services/question';

interface Props {
  question: Question;
  onAnswer: (correct: boolean) => void;
  showAnswer: boolean;
  onShowAnswer: () => void;
}

const QuestionCard: React.FC<Props> = ({
  question,
  onAnswer,
  showAnswer,
  onShowAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswerSelect = (answer: string) => {
    if (showAnswer) return;
    setSelectedAnswer(answer);
    onShowAnswer();
  };

  const getAnswerStyle = (answer: string) => {
    if (!showAnswer || !selectedAnswer) return styles.answerButton;

    if (answer === question.correct_answer) {
      return [styles.answerButton, styles.correctAnswer];
    }

    if (answer === selectedAnswer && answer !== question.correct_answer) {
      return [styles.answerButton, styles.incorrectAnswer];
    }

    return styles.answerButton;
  };

  const renderAnswerButton = (answer: string) => (
    <TouchableOpacity
      key={answer}
      style={getAnswerStyle(answer)}
      onPress={() => handleAnswerSelect(answer)}
      disabled={showAnswer}
    >
      <Text style={styles.answerText}>{answer}</Text>
    </TouchableOpacity>
  );

  const allAnswers = [
    question.correct_answer,
    ...question.incorrect_answers,
  ].sort(() => Math.random() - 0.5);

  return (
    <Card containerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{question.difficulty}</Text>
        </View>
        <Text style={styles.category}>{question.category}</Text>
      </View>

      <Text style={styles.question}>{question.content}</Text>

      <View style={styles.answersContainer}>
        {allAnswers.map(renderAnswerButton)}
      </View>

      {showAnswer && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Got it wrong"
              icon={
                <Icon
                  name="close"
                  type="material"
                  color="white"
                  size={20}
                  style={{ marginRight: 10 }}
                />
              }
              onPress={() => onAnswer(false)}
              buttonStyle={[styles.actionButton, styles.wrongButton]}
              containerStyle={styles.actionButtonContainer}
            />
            <Button
              title="Got it right"
              icon={
                <Icon
                  name="check"
                  type="material"
                  color="white"
                  size={20}
                  style={{ marginRight: 10 }}
                />
              }
              onPress={() => onAnswer(true)}
              buttonStyle={[styles.actionButton, styles.rightButton]}
              containerStyle={styles.actionButtonContainer}
            />
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  difficultyBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  difficultyText: {
    color: 'white',
    fontSize: theme.typography.caption.fontSize,
    textTransform: 'capitalize',
  },
  category: {
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
  },
  question: {
    fontSize: theme.typography.h3.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  answersContainer: {
    marginBottom: theme.spacing.md,
  },
  answerButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  correctAnswer: {
    backgroundColor: theme.colors.success + '20',
    borderColor: theme.colors.success,
  },
  incorrectAnswer: {
    backgroundColor: theme.colors.error + '20',
    borderColor: theme.colors.error,
  },
  answerText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  explanationContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  explanationTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  explanationText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtonContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  actionButton: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  wrongButton: {
    backgroundColor: theme.colors.error,
  },
  rightButton: {
    backgroundColor: theme.colors.success,
  },
});

export default QuestionCard;
