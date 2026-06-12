import { StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../../../constants/theme';

interface Props {
  warmup: boolean;
  cooldown: boolean;
  onChangeWarmup: (value: boolean) => void;
  onChangeCooldown: (value: boolean) => void;
}

interface ToggleRowProps {
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ label, hint, value, onChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelBlock}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
        thumbColor={theme.colors.text}
      />
    </View>
  );
}

/** Pre-workout options letting the user include/skip the auto warmup & cooldown. */
export function SessionOptionsToggles({
  warmup,
  cooldown,
  onChangeWarmup,
  onChangeCooldown,
}: Props) {
  return (
    <View style={styles.container}>
      <ToggleRow
        label="Warm-up"
        hint="Quick mobility routine before you start"
        value={warmup}
        onChange={onChangeWarmup}
      />
      <View style={styles.divider} />
      <ToggleRow
        label="Cooldown"
        hint="Static stretches after the workout"
        value={cooldown}
        onChange={onChangeCooldown}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  labelBlock: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
