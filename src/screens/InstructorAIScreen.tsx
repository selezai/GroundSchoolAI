import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { Card, Text, Input } from '@rneui/themed';
import { theme } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { instructorService, Message } from '../services/instructor';

const InstructorAIScreen = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      if (!user) return;
      const history = await instructorService.getMessageHistory(user.id);
      setMessages(history);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    try {
      setLoading(true);
      const response = await instructorService.sendMessage(user.id, message);
      setMessages(prev => [...prev, response]);
      setMessage('');
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg: Message) => {
    const isAI = msg.role === 'assistant';

    return (
      <Card 
        key={msg.id} 
        containerStyle={[
          styles.messageCard,
          isAI ? styles.aiMessage : styles.userMessage,
        ]}
      >
        <Icon
          name={isAI ? 'android' : 'user'}
          type="font-awesome"
          size={24}
          color={isAI ? theme.colors.primary : theme.colors.surface}
          containerStyle={[
            styles.avatarContainer,
            isAI ? styles.aiAvatar : styles.userAvatar,
          ]}
        />
        <View style={styles.messageContent}>
          <Text style={[
            styles.messageTitle,
            !isAI && { color: theme.colors.surface }
          ]}>
            {isAI ? 'AI Instructor' : 'You'}
          </Text>
          <Card.Divider />
          <Text style={[
            styles.messageText,
            !isAI && { color: theme.colors.surface }
          ]}>
            {msg.content}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && (
          <Card containerStyle={styles.welcomeCard}>
            <Icon
              name="android"
              type="font-awesome"
              size={40}
              color={theme.colors.primary}
              containerStyle={styles.welcomeIcon}
            />
            <Text h3 style={styles.welcomeTitle}>
              Welcome to AI Instructor
            </Text>
            <Text style={styles.welcomeText}>
              I'm your personal aviation study assistant. Ask me anything about:
            </Text>
            <View style={styles.topicsList}>
              <Text style={styles.topicItem}>• SACAA exam preparation</Text>
              <Text style={styles.topicItem}>• Aviation concepts and regulations</Text>
              <Text style={styles.topicItem}>• Study strategies and tips</Text>
              <Text style={styles.topicItem}>• Practice questions and explanations</Text>
            </View>
          </Card>
        )}
        
        {messages.map(renderMessage)}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Input
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          containerStyle={styles.textInput}
          disabled={loading}
          rightIcon={
            <Button
              icon={
                <Icon
                  name="send"
                  type="material"
                  size={24}
                  color={theme.colors.surface}
                />
              }
              onPress={handleSend}
              buttonStyle={styles.sendButton}
              disabled={loading || !message.trim()}
              loading={loading}
            />
          }
          onSubmitEditing={handleSend}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  messageCard: {
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    maxWidth: '85%',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    } : {
      elevation: 5,
    }),
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  avatarContainer: {
    position: 'absolute',
    top: -12,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    } : {
      elevation: 5,
    }),
  },
  aiAvatar: {
    left: -12,
  },
  userAvatar: {
    right: -12,
  },
  messageContent: {
    marginHorizontal: theme.spacing.lg,
  },
  messageTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  messageText: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: 20,
  },
  inputContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  textInput: {
    paddingHorizontal: 0,
    marginBottom: -10,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  loadingContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  welcomeCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    } : {
      elevation: 5,
    }),
  },
  welcomeIcon: {
    marginBottom: theme.spacing.lg,
  },
  welcomeTitle: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  topicsList: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
  topicItem: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
});

export default InstructorAIScreen;
