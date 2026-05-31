import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import { AddExerciseModal } from '../components/features/AddExerciseModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Admin'>;

export default function AdminScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSuccess = () => {
    setModalVisible(false);
    navigation.navigate('Exercises');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 18 }]}>
      <Text style={styles.heading}>Admin</Text>
      <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Exercise</Text>
      </Pressable>

      <AddExerciseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  heading: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 28,
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
