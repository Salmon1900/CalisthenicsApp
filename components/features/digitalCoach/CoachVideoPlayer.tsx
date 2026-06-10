import { StyleSheet, View } from 'react-native';
import { VideoView, type VideoPlayer } from 'expo-video';
import { theme } from '../../../constants/theme';

interface Props {
  player: VideoPlayer;
}

/** Compact 16:9 player for reviewing the trimmed clip on the results screen. */
export function CoachVideoPlayer({ player }: Props) {
  return (
    <View style={styles.frame}>
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: theme.colors.card,
  },
  video: {
    flex: 1,
  },
});
