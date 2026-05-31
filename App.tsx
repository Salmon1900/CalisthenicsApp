import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

const theme = {
  colors: {
    background: '#020617',
    surface: '#0f172a',
    card: '#111827',
    primary: '#38bdf8',
    accent: '#7c3aed',
    success: '#22c55e',
    text: '#f8fafc',
    muted: '#94a3b8',
    overlay: 'rgba(2, 6, 23, 0.55)',
  },
  font: {
    heading: 'System',
    body: 'System',
  },
};

const backgroundImage = {
  uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
};

export default function App() {
  const [isHomeVisible, setIsHomeVisible] = useState(false);

  if (isHomeVisible) {
    return (
      <View style={styles.homeContainer}>
        <Text style={styles.homeHeading}>Home</Text>
        <Text style={styles.homeText}>Under construction</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.pill}>Calisthenics App</Text>
        <Text style={styles.title}>Welcome to your calisthenics journey!</Text>
        <Text style={styles.subtitle}>
          Prepare for stronger movement, better form, and a growth-minded training habit.
        </Text>
        <Pressable style={styles.button} onPress={() => setIsHomeVisible(true)}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'flex-end',
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    color: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 18,
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 44,
    marginBottom: 16,
    fontFamily: theme.font.heading,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 36,
    maxWidth: 360,
    fontFamily: theme.font.body,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  homeHeading: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  homeText: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    maxWidth: 320,
  },
});
