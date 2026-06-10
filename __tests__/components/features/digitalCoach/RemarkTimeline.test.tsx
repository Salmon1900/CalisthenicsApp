import { fireEvent, render } from '@testing-library/react-native';
import { RemarkTimeline } from '../../../../components/features/digitalCoach/RemarkTimeline';
import type { Remark } from '../../../../types/digitalCoach';

const remarks: Remark[] = [
  { timestamp_seconds: 5, severity: 'critical', area: 'hips', message: 'remark-5' },
  { timestamp_seconds: 1, severity: 'info', area: 'depth', message: 'remark-1' },
  { timestamp_seconds: 3, severity: 'warning', area: 'elbows', message: 'remark-3' },
];

describe('RemarkTimeline', () => {
  it('renders remarks sorted by timestamp', () => {
    const { getAllByText } = render(<RemarkTimeline remarks={remarks} onSeek={jest.fn()} />);
    const order = getAllByText(/^remark-/).map((node) => node.props.children);
    expect(order).toEqual(['remark-1', 'remark-3', 'remark-5']);
  });

  it('seeks to the remark timestamp when a row is pressed', () => {
    const onSeek = jest.fn();
    const { getByText } = render(<RemarkTimeline remarks={remarks} onSeek={onSeek} />);
    fireEvent.press(getByText('remark-3'));
    expect(onSeek).toHaveBeenCalledWith(3);
  });

  it('shows an empty state when there are no remarks', () => {
    const { getByText } = render(<RemarkTimeline remarks={[]} onSeek={jest.fn()} />);
    expect(getByText(/nice and clean/i)).toBeTruthy();
  });
});
