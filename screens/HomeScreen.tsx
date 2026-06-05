import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';

const backgroundImage = {
  uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.background}>
      <View style={styles.overlay} />
      <SafeAreaView style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.badge}>Mighty</Text>
        <Text style={styles.title}>Welcome to your Mighty journey!</Text>
        <Text style={styles.subtitle}>
          Explore exercises, track your progress, and build a stronger body using smart movement patterns.
        </Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Exercises')}>
          <Text style={styles.buttonText}>See Exercises</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Plans')}>
          <Text style={styles.buttonText}>Workout Plans</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.mapButton]} onPress={() => navigation.navigate('ProgressMap')}>
          <Text style={styles.buttonText}>Progress Map</Text>
        </Pressable>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.overlay,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 28,
  },
  badge: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    color: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 18,
  },
  title: {
    color: theme.colors.text,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 44,
    marginBottom: 18,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 36,
    maxWidth: 380,
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 12,
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  mapButton: {
    backgroundColor: '#1e3a5f',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
});
