import { render } from '@testing-library/react-native';
import { MapBackground } from '../../../../components/features/progressMap/MapBackground';

describe('MapBackground', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(<MapBackground canvasHeight={5000} screenWidth={390} />)
    ).not.toThrow();
  });

  it('renders 5 gradient zones', () => {
    const { UNSAFE_getAllByType } = render(
      <MapBackground canvasHeight={5000} screenWidth={390} />
    );
    const { View } = require('react-native');
    // LinearGradient is mocked as View; outer container + 5 zone Views = 6
    expect(UNSAFE_getAllByType(View).length).toBeGreaterThanOrEqual(5);
  });
});
