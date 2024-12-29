import { supabase } from './supabase';
import { paystackService } from './paystack';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Essential features for exam preparation',
    price: 499,
    duration_months: 1,
    features: [
      'Access to study materials',
      'Basic question bank',
      'Progress tracking',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'Complete exam preparation toolkit',
    price: 999,
    duration_months: 1,
    features: [
      'All Basic Plan features',
      'Advanced question bank',
      'Mock exams',
      'Performance analytics',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    description: 'Ultimate learning experience',
    price: 1999,
    duration_months: 3,
    features: [
      'All Premium Plan features',
      'AI-powered study recommendations',
      'One-on-one instructor support',
      'Exam guarantee',
      'Offline access',
    ],
  },
];

class SubscriptionService {
  async getCurrentPlan(userId: string): Promise<any> {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return subscription;
    } catch (error) {
      console.error('Error getting current plan:', error);
      throw error;
    }
  }

  async subscribeToPlan(
    userId: string,
    email: string,
    planId: string
  ): Promise<string> {
    try {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Initialize payment with Paystack
      const authorizationUrl = await paystackService.processSubscriptionPayment(
        userId,
        email,
        planId,
        plan.price
      );

      // Create subscription record
      const { error } = await supabase.from('subscriptions').insert([
        {
          user_id: userId,
          plan_id: planId,
          status: 'pending',
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + plan.duration_months * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ]);

      if (error) throw error;

      return authorizationUrl;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  async getSubscriptionHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting subscription history:', error);
      throw error;
    }
  }

  async checkSubscriptionStatus(userId: string): Promise<boolean> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, trial_end_date')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profile.subscription_status === 'trial') {
        const trialEndDate = new Date(profile.trial_end_date);
        if (trialEndDate < new Date()) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'expired',
            })
            .eq('id', userId);
          return false;
        }
        return true;
      }

      return profile.subscription_status === 'active';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      throw error;
    }
  }

  async startTrial(userId: string): Promise<void> {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'trial',
          trial_end_date: trialEndDate.toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
