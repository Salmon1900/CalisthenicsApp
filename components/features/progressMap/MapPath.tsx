import { View } from 'react-native';
import { theme } from '../../../constants/theme';

interface MapPathProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isCompleted: boolean;
}

export function MapPath({ fromX, fromY, toX, toY, isCompleted }: MapPathProps) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  return (
    <View
      style={{
        position: 'absolute',
        width: length,
        height: 4,
        backgroundColor: isCompleted ? theme.colors.primary : '#374151',
        opacity: isCompleted ? 0.9 : 0.35,
        left: midX - length / 2,
        top: midY - 2,
        borderRadius: 2,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
}
