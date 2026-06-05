import { render } from '@testing-library/react-native';
import { MapDecorations } from '../../../../components/features/progressMap/MapDecorations';

it('renders without crashing', () => {
  expect(() =>
    render(<MapDecorations canvasHeight={7880} screenWidth={390} />)
  ).not.toThrow();
});
