// __tests__/components/features/progressMap/LevelNode.test.tsx
import { render } from '@testing-library/react-native';
import { LevelNode } from '../../../../components/features/progressMap/LevelNode';

describe('LevelNode', () => {
  const baseProps = { x: 100, y: 100, onPress: jest.fn() };

  it('renders level number when unlocked', () => {
    const { getByText } = render(
      <LevelNode {...baseProps} level={1} state="unlocked" isBoss={false} />
    );
    expect(getByText('1')).toBeTruthy();
  });

  it('renders bouncing emojis only when unlocked', () => {
    const { getByText: getUnlocked } = render(
      <LevelNode {...baseProps} level={5} state="unlocked" isBoss={false} />
    );
    // level 5 % 5 === 0 → EMOJI_SETS[0] = ['💪','🔥','⚡']
    expect(getUnlocked('💪')).toBeTruthy();
    expect(getUnlocked('🔥')).toBeTruthy();
    expect(getUnlocked('⚡')).toBeTruthy();
  });

  it('does not render bouncing emojis when locked', () => {
    const { queryByText } = render(
      <LevelNode {...baseProps} level={5} state="locked" isBoss={false} />
    );
    expect(queryByText('💪')).toBeNull();
  });

  it('does not render bouncing emojis when completed', () => {
    const { queryByText } = render(
      <LevelNode {...baseProps} level={5} state="completed" isBoss={false} />
    );
    expect(queryByText('💪')).toBeNull();
  });

  it('uses correct emoji set per level modulo', () => {
    // level 2 % 5 === 2 → ['🏃','⚡','💪']
    const { getByText } = render(
      <LevelNode {...baseProps} level={2} state="unlocked" isBoss={false} />
    );
    expect(getByText('🏃')).toBeTruthy();
  });

  it('renders boss node without crashing', () => {
    expect(() =>
      render(<LevelNode {...baseProps} level={10} state="unlocked" isBoss={true} />)
    ).not.toThrow();
  });
});
