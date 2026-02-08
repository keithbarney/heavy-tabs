import UiSelect from './UiSelect'
import { trackEvent } from '@/lib/analytics'
import styles from './PageAdvancedSettings.module.scss'

export interface SettingOption {
  value: string
  label: string
}

export interface PageAdvancedSettingsProps {
  instrument?: string
  strings?: string
  tuning?: string
  keySignature?: string
  time?: string
  grid?: string
  instrumentOptions?: SettingOption[]
  stringsOptions?: SettingOption[]
  tuningOptions?: SettingOption[]
  keyOptions?: SettingOption[]
  timeOptions?: SettingOption[]
  gridOptions?: SettingOption[]
  onInstrumentChange?: (value: string) => void
  onStringsChange?: (value: string) => void
  onTuningChange?: (value: string) => void
  onKeyChange?: (value: string) => void
  onTimeChange?: (value: string) => void
  onGridChange?: (value: string) => void
  projectId?: string | null
  className?: string
}

const DEFAULT_INSTRUMENTS: SettingOption[] = [
  { value: 'guitar', label: 'Guitar' },
  // { value: 'bass', label: 'Bass' },
  // { value: 'drums', label: 'Drums' },
]

const DEFAULT_STRINGS: SettingOption[] = [
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
]

const DEFAULT_TUNINGS: SettingOption[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'drop', label: 'Drop' },
]

const DEFAULT_KEYS: SettingOption[] = [
  { value: 'c', label: 'C' },
  { value: 'd', label: 'D' },
  { value: 'e', label: 'E' },
  { value: 'f', label: 'F' },
  { value: 'g', label: 'G' },
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
]

const DEFAULT_TIMES: SettingOption[] = [
  { value: '4/4', label: '4/4' },
  { value: '3/4', label: '3/4' },
  { value: '6/8', label: '6/8' },
]

const DEFAULT_GRIDS: SettingOption[] = [
  { value: '1/4', label: '1/4' },
  { value: '1/8', label: '1/8' },
  { value: '1/16', label: '1/16' },
]

export default function PageAdvancedSettings({
  instrument = 'guitar',
  strings = '6',
  tuning = 'standard',
  keySignature = 'e',
  time = '4/4',
  grid = '1/16',
  instrumentOptions = DEFAULT_INSTRUMENTS,
  stringsOptions = DEFAULT_STRINGS,
  tuningOptions = DEFAULT_TUNINGS,
  keyOptions = DEFAULT_KEYS,
  timeOptions = DEFAULT_TIMES,
  gridOptions = DEFAULT_GRIDS,
  onInstrumentChange,
  onStringsChange,
  onTuningChange,
  onKeyChange,
  onTimeChange,
  onGridChange,
  projectId,
  className
}: PageAdvancedSettingsProps) {
  return (
    <div className={`${styles.advancedSettings} ${className || ''}`}>
      <div className={styles.divider} />
      <div className={styles.list}>
        <UiSelect
          label="Instrument"
          className={styles.select}
          value={instrument}
          hasValue={!!instrument}
          onChange={(e) => { trackEvent('instrument_change', { value: e.target.value }, projectId); onInstrumentChange?.(e.target.value) }}
        >
          {instrumentOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </UiSelect>

        {instrument !== 'drums' && (
          <UiSelect
            label="Strings"
            className={styles.select}
            value={strings}
            hasValue={!!strings}
            onChange={(e) => { trackEvent('string_count_change', { value: e.target.value }, projectId); onStringsChange?.(e.target.value) }}
          >
            {stringsOptions
              .filter(opt => {
                const v = parseInt(opt.value)
                if (instrument === 'guitar') return v >= 6 && v <= 8
                if (instrument === 'bass') return v >= 4 && v <= 6
                return true
              })
              .map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
          </UiSelect>
        )}

        {instrument !== 'drums' && <UiSelect
          label="Tuning"
          className={styles.select}
          value={tuning}
          hasValue={!!tuning}
          onChange={(e) => { trackEvent('tuning_change', { value: e.target.value }, projectId); onTuningChange?.(e.target.value) }}
        >
          {tuningOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </UiSelect>}

        {instrument !== 'drums' && <UiSelect
          label="Key"
          className={styles.select}
          value={keySignature}
          hasValue={!!keySignature}
          onChange={(e) => { trackEvent('key_change', { value: e.target.value }, projectId); onKeyChange?.(e.target.value) }}
        >
          {keyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </UiSelect>}

        <UiSelect
          label="Time"
          className={styles.select}
          value={time}
          hasValue={!!time}
          onChange={(e) => { trackEvent('time_signature_change', { value: e.target.value }, projectId); onTimeChange?.(e.target.value) }}
        >
          {timeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </UiSelect>

        <UiSelect
          label="Grid"
          className={styles.select}
          value={grid}
          hasValue={!!grid}
          onChange={(e) => { trackEvent('grid_change', { value: e.target.value }, projectId); onGridChange?.(e.target.value) }}
        >
          {gridOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </UiSelect>
      </div>
    </div>
  )
}
