import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import { Card } from '@rneui/themed';
import { theme } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionService, subscriptionPlans } from '../services/subscription';
import { WebView } from 'react-native-webview';

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'expired';
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

const SubscriptionScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    try {
      const subscription = await subscriptionService.getCurrentSubscription(user!.id);
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }
      const transaction = await subscriptionService.createPaystackTransaction(
        user!.email,
        plan.price,
        planId
      );
      
      setPaymentUrl(transaction.authorization_url);
      setShowPaymentWebView(true);
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCallback = async (url: string) => {
    try {
      const reference = url.split('reference=')[1];
      if (!reference) {
        Alert.alert('Error', 'Invalid payment reference');
        return;
      }
      await handlePaymentSuccess(reference);
    } catch (error) {
      console.error('Error verifying payment:', error);
      Alert.alert('Error', 'Failed to verify payment');
    }
    setShowPaymentWebView(false);
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      setVerifying(true);
      const response = await subscriptionService.verifyPayment(reference);
      if (response.status === 'success') {
        Alert.alert('Success', 'Payment verified successfully');
        await fetchCurrentSubscription();
      } else {
        Alert.alert('Error', response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      Alert.alert('Error', 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  if (showPaymentWebView) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={(navState) => {
          handlePaymentCallback(navState.url);
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {currentSubscription && (
        <Card containerStyle={styles.currentPlanCard}>
          <Card.Title>Current Plan</Card.Title>
          <Card.Divider />
          <View style={styles.currentPlanInfo}>
            <Text style={styles.planName}>
              {subscriptionPlans.find(p => p.id === currentSubscription.planId)?.name}
            </Text>
            <Text style={styles.planStatus}>
              Status: {currentSubscription.status}
            </Text>
            <Text style={styles.planExpiry}>
              Expires: {new Date(currentSubscription.expiryDate).toLocaleDateString()}
            </Text>
          </View>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Available Plans</Text>

      {subscriptionPlans.map((plan) => (
        <Card key={plan.id} containerStyle={styles.planCard}>
          <Card.Title>{plan.name}</Card.Title>
          <Card.Divider />
          
          <Text style={styles.price}>R{plan.price}</Text>
          <Text style={styles.duration}>{plan.duration} days</Text>
          
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Icon
                name="check-circle"
                type="material"
                color={theme.colors.success}
                size={16}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}

          <Button
            title={currentSubscription?.planId === plan.id ? 'Current Plan' : 'Subscribe'}
            onPress={() => handleSubscribe(plan.id)}
            disabled={currentSubscription?.planId === plan.id || loading}
            loading={loading}
            buttonStyle={[
              styles.subscribeButton,
              currentSubscription?.planId === plan.id && styles.currentPlanButton
            ]}
            containerStyle={styles.buttonContainer}
          />
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  currentPlanCard: {
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  currentPlanInfo: {
    alignItems: 'center',
  },
  planName: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  planStatus: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  planExpiry: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.primary,
    margin: theme.spacing.md,
  },
  planCard: {
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  price: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  duration: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureIcon: {
    marginRight: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    flex: 1,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  subscribeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  currentPlanButton: {
    backgroundColor: theme.colors.disabled,
  },
});

export default SubscriptionScreen;
