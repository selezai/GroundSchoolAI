import React from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import { Card } from '@rneui/themed';
import { theme } from '../config/theme';
import { config } from '../config/env';

const ProfileScreen = () => {
  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${config.email.email}`);
  };

  const handleReportBug = () => {
    // TODO: Implement bug report form
  };

  const handleLogout = () => {
    // TODO: Implement logout
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Icon
          name="account-circle"
          type="material"
          size={80}
          color={theme.colors.primary}
        />
        <Text h3 style={styles.userName}>User Name</Text>
        <Text style={styles.email}>user@example.com</Text>
      </View>

      {/* Subscription Status */}
      <Card containerStyle={styles.sectionCard}>
        <Card.Title>Subscription Status</Card.Title>
        <Card.Divider />
        <View style={styles.subscriptionInfo}>
          <Text style={styles.subscriptionStatus}>Active</Text>
          <Text style={styles.subscriptionDate}>Renews on: DD/MM/YYYY</Text>
        </View>
      </Card>

      {/* Support Section */}
      <Card containerStyle={styles.sectionCard}>
        <Card.Title>Support</Card.Title>
        <Card.Divider />
        <Button
          title="Email Support"
          icon={
            <Icon
              name="mail"
              type="material"
              color="white"
              size={20}
              style={{ marginRight: 10 }}
            />
          }
          onPress={handleEmailSupport}
          buttonStyle={styles.supportButton}
          containerStyle={styles.buttonContainer}
        />
        <Button
          title="Report a Bug"
          icon={
            <Icon
              name="bug-report"
              type="material"
              color="white"
              size={20}
              style={{ marginRight: 10 }}
            />
          }
          onPress={handleReportBug}
          buttonStyle={[styles.supportButton, styles.bugButton]}
          containerStyle={styles.buttonContainer}
        />
      </Card>

      {/* Account Settings */}
      <Card containerStyle={styles.sectionCard}>
        <Card.Title>Account Settings</Card.Title>
        <Card.Divider />
        <Button
          title="Logout"
          icon={
            <Icon
              name="logout"
              type="material"
              color={theme.colors.error}
              size={20}
              style={{ marginRight: 10 }}
            />
          }
          onPress={handleLogout}
          type="outline"
          buttonStyle={styles.logoutButton}
          titleStyle={{ color: theme.colors.error }}
          containerStyle={styles.buttonContainer}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  userName: {
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
  },
  email: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    marginTop: theme.spacing.xs,
  },
  sectionCard: {
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  subscriptionInfo: {
    alignItems: 'center',
  },
  subscriptionStatus: {
    fontSize: theme.typography.h3.fontSize,
    color: theme.colors.success,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  subscriptionDate: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
  buttonContainer: {
    marginVertical: theme.spacing.xs,
  },
  supportButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  bugButton: {
    backgroundColor: theme.colors.warning,
  },
  logoutButton: {
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
});

export default ProfileScreen;
