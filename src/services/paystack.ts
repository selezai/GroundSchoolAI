import { config } from '../config/env';
import { supabase } from './supabase';

interface PaystackTransaction {
  reference: string;
  amount: number;
  email: string;
  metadata?: Record<string, any>;
}

interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    metadata: Record<string, any>;
  };
}

class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly headers = {
    Authorization: `Bearer ${config.paystack.secretKey}`,
    'Content-Type': 'application/json',
  };

  async initializeTransaction(
    email: string,
    amount: number,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo/cents
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize transaction');
      }

      const data = await response.json();
      return data.data.authorization_url;
    } catch (error) {
      console.error('Error initializing transaction:', error);
      throw error;
    }
  }

  async verifyTransaction(reference: string): Promise<PaystackVerificationResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying transaction:', error);
      throw error;
    }
  }

  async recordTransaction(
    userId: string,
    transaction: PaystackTransaction
  ): Promise<void> {
    try {
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: userId,
          reference: transaction.reference,
          amount: transaction.amount,
          email: transaction.email,
          metadata: transaction.metadata,
          status: 'pending',
          provider: 'paystack',
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }
  }

  async updateTransactionStatus(
    reference: string,
    status: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('reference', reference);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  async getTransactionHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  // Subscription-specific methods
  async processSubscriptionPayment(
    userId: string,
    email: string,
    planId: string,
    amount: number
  ): Promise<string> {
    try {
      const metadata = {
        type: 'subscription',
        plan_id: planId,
      };

      const authorizationUrl = await this.initializeTransaction(
        email,
        amount,
        metadata
      );

      await this.recordTransaction(userId, {
        reference: Math.random().toString(36).substring(2),
        amount,
        email,
        metadata,
      });

      return authorizationUrl;
    } catch (error) {
      console.error('Error processing subscription payment:', error);
      throw error;
    }
  }

  async handleSubscriptionWebhook(
    event: any
  ): Promise<void> {
    try {
      if (event.event !== 'charge.success') return;

      const { reference, metadata } = event.data;
      const verification = await this.verifyTransaction(reference);

      if (verification.data.status === 'success') {
        await this.updateTransactionStatus(reference, 'completed');

        if (metadata.type === 'subscription') {
          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('transaction_reference', reference)
            .single();

          if (!error && subscription) {
            await supabase
              .from('subscriptions')
              .update({
                status: 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('id', subscription.id);

            await supabase
              .from('profiles')
              .update({
                subscription_status: 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('id', subscription.user_id);
          }
        }
      }
    } catch (error) {
      console.error('Error handling subscription webhook:', error);
      throw error;
    }
  }
}

export const paystackService = new PaystackService();
