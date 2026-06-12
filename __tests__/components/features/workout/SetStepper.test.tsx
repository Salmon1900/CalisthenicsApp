import { render } from '@testing-library/react-native';
import { SetStepper } from '../../../../components/features/workout/SetStepper';

describe('SetStepper', () => {
  it('renders one segment per set', () => {
    const { toJSON } = render(
      <SetStepper totalSets={4} completedSets={1} currentSetIndex={1} />,
    );
    const tree = toJSON();
    // Root row view with N child segments.
    const root = Array.isArray(tree) ? tree[0] : tree;
    expect(root?.children).toHaveLength(4);
  });

  it('renders nothing extra for a single set', () => {
    const { toJSON } = render(
      <SetStepper totalSets={1} completedSets={0} currentSetIndex={0} />,
    );
    const tree = toJSON();
    const root = Array.isArray(tree) ? tree[0] : tree;
    expect(root?.children).toHaveLength(1);
  });
});
