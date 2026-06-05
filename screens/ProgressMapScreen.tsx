import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import { useDeviceUserId } from '../hooks/useDeviceUserId';
import { useProgressMap } from '../hooks/useProgressMap';
import { LevelNode } from '../components/features/progressMap/LevelNode';
import { MapPath } from '../components/features/progressMap/MapPath';
import { MapDecorations } from '../components/features/progressMap/MapDecorations';

type Props = NativeStackScreenProps<RootStackParamList, 'ProgressMap'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NODE_SIZE_NORMAL = 56;
const NODE_SIZE_BOSS = 80;
const VERTICAL_SPACING = 110;
const BOTTOM_PADDING = 80;
const TOP_PADDING = 100;
const CANVAS_HEIGHT = 70 * VERTICAL_SPACING + BOTTOM_PADDING + TOP_PADDING;

const X_PATTERN = [0, 80, 120, 80, 0, -80, -120, -80];

function getLevelPosition(levelNumber: number) {
  const xOffset = X_PATTERN[(levelNumber - 1) % 8];
  const x = SCREEN_WIDTH / 2 + xOffset;
  const y = CANVAS_HEIGHT - BOTTOM_PADDING - (levelNumber - 1) * VERTICAL_SPACING;
  return { x, y };
}

export default function ProgressMapScreen({ navigation }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const userId = useDeviceUserId();
  const { levels, loading, error } = useProgressMap(userId);

  useEffect(() => {
    if (levels.length === 0) return;
    const highestUnlocked = [...levels].reverse().find((l) => l.isUnlocked);
    if (!highestUnlocked) return;
    const { y } = getLevelPosition(highestUnlocked.levelNumber);
    const scrollY = y - SCREEN_HEIGHT / 2;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, scrollY), animated: false });
    }, 50);
  }, [levels.length]);

  const handleLevelPress = (levelNumber: number) => {
    const level = levels.find((l) => l.levelNumber === levelNumber);
    if (!level) return;
    navigation.navigate('PlanDetail', { plan: level.plan, locked: !level.isUnlocked });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.statusText}>Loading map…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.statusText}>Failed to load map.</Text>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (levels.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.statusText}>No levels found. Run the seed script first.</Text>
      </SafeAreaView>
    );
  }

  const completedCount = levels.filter((l) => l.isCompleted).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress Map</Text>
        <Text style={styles.headerSub}>{completedCount} / {levels.length} completed</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ height: CANVAS_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        <MapDecorations canvasHeight={CANVAS_HEIGHT} screenWidth={SCREEN_WIDTH} />

        {/* Path connectors rendered first (behind nodes) */}
        {levels.slice(0, -1).map((level, index) => {
          const next = levels[index + 1];
          const from = getLevelPosition(level.levelNumber);
          const to = getLevelPosition(next.levelNumber);
          return (
            <MapPath
              key={`path-${level.levelNumber}`}
              fromX={from.x}
              fromY={from.y}
              toX={to.x}
              toY={to.y}
              isCompleted={level.isCompleted}
            />
          );
        })}

        {/* Level nodes rendered on top of paths */}
        {levels.map((level) => {
          const { x, y } = getLevelPosition(level.levelNumber);
          const state = level.isCompleted ? 'completed' : level.isUnlocked ? 'unlocked' : 'locked';
          return (
            <LevelNode
              key={level.levelNumber}
              level={level.levelNumber}
              state={state}
              isBoss={level.isBoss}
              x={x}
              y={y}
              onPress={() => handleLevelPress(level.levelNumber)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  center: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusText: {
    color: theme.colors.muted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
});
