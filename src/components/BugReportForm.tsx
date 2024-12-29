import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { Card } from '@rneui/themed';
import { theme } from '../config/theme';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BugReport {
  title: string;
  description: string;
  steps_to_reproduce: string;
  device_info: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const BugReportForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BugReport>({
    title: '',
    description: '',
    steps_to_reproduce: '',
    device_info: '',
  });
  const [errors, setErrors] = useState<Partial<BugReport>>({});

  const validate = () => {
    const newErrors: Partial<BugReport> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.steps_to_reproduce.trim()) newErrors.steps_to_reproduce = 'Steps to reproduce are required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('bug_reports')
        .insert([
          {
            user_id: user?.id,
            email: user?.email,
            ...form,
            status: 'new',
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting bug report:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card containerStyle={styles.container}>
      <Card.Title>Report a Bug</Card.Title>
      <Card.Divider />
      
      <ScrollView style={styles.formContainer}>
        <Input
          placeholder="Title"
          value={form.title}
          onChangeText={(text) => setForm({ ...form, title: text })}
          errorMessage={errors.title}
          errorStyle={styles.errorText}
        />

        <Input
          placeholder="Description"
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          multiline
          numberOfLines={4}
          errorMessage={errors.description}
          errorStyle={styles.errorText}
        />

        <Input
          placeholder="Steps to Reproduce"
          value={form.steps_to_reproduce}
          onChangeText={(text) => setForm({ ...form, steps_to_reproduce: text })}
          multiline
          numberOfLines={4}
          errorMessage={errors.steps_to_reproduce}
          errorStyle={styles.errorText}
        />

        <Input
          placeholder="Device Info (optional)"
          value={form.device_info}
          onChangeText={(text) => setForm({ ...form, device_info: text })}
          multiline
          numberOfLines={2}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            type="outline"
            buttonStyle={styles.cancelButton}
            titleStyle={{ color: theme.colors.error }}
            containerStyle={styles.buttonWrapper}
          />
          <Button
            title="Submit"
            onPress={handleSubmit}
            loading={loading}
            buttonStyle={styles.submitButton}
            containerStyle={styles.buttonWrapper}
          />
        </View>
      </ScrollView>
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
  formContainer: {
    maxHeight: '80%',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  cancelButton: {
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
});

export default BugReportForm;
