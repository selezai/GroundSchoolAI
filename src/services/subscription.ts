import { supabase } from './supabase';
import { env } from '../config/env';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  duration: number;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 1000,
    features: ['Access to basic questions', 'Progress tracking'],
    duration: 30,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2500,
    features: ['All basic features', 'Advanced questions', 'Mock exams', 'AI tutor assistance'],
    duration: 30,
  },
];

export class SubscriptionService {
  async getCurrentSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async createPaystackTransaction(email: string, amount: number, planId: string) {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.paystack.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        metadata: {
          plan_id: planId,
        },
      }),
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  }

  async verifyPaystackTransaction(reference: string) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${env.paystack.secretKey}`,
      },
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  }

  async updateSubscription(userId: string, planId: string, expiryDate: Date) {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        expiry_date: expiryDate.toISOString(),
      });

    if (error) throw error;
  }

  async verifyPayment(reference: string): Promise<{
    status: string;
    message?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('payment_verifications')
        .insert([
          {
            reference,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Trigger serverless function to verify payment
      const { data: verificationData, error: verificationError } = await supabase
        .functions.invoke('verify-payment', {
          body: { reference },
        });

      if (verificationError) throw verificationError;

      return {
        status: verificationData.status,
        message: verificationData.message,
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        status: 'error',
        message: 'Failed to verify payment',
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
