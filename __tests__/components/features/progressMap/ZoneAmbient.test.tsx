import { render } from '@testing-library/react-native';
import { ZoneAmbient } from '../../../../components/features/progressMap/ZoneAmbient';
import type { ZoneId } from '../../../../components/features/progressMap/ZoneAmbient';

const ZONE_IDS: ZoneId[] = ['cave', 'forest', 'mountain', 'sky', 'space'];

const defaultProps = { yOffset: 0, zoneHeight: 300, screenWidth: 390 };

describe('ZoneAmbient', () => {
  ZONE_IDS.forEach((zone) => {
    it(`renders ${zone} zone without crashing`, () => {
      expect(() =>
        render(<ZoneAmbient zone={zone} {...defaultProps} />)
      ).not.toThrow();
    });
  });
});
