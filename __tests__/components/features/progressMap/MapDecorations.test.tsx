import { render } from '@testing-library/react-native';
import { MapDecorations } from '../../../../components/features/progressMap/MapDecorations';

describe('MapDecorations', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(<MapDecorations canvasHeight={7880} screenWidth={390} />)
    ).not.toThrow();
  });

  it('renders with minimal canvas height', () => {
    expect(() =>
      render(<MapDecorations canvasHeight={100} screenWidth={390} />)
    ).not.toThrow();
  });
});
