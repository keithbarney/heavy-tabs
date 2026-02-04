import { useState } from 'react'
import {
  Play, Pause, Square, Settings, Download, Plus, Minus, CopyPlus,
  ChevronUp, ChevronDown, Info, Repeat, Volume2, Save, RotateCcw,
  X, Check, Music, Edit2, Trash2, Share2, Eye, EyeOff
} from 'lucide-react'
import styles from './StyleGuide.module.scss'
import UiButton from './UiButton'
import UiInput from './UiInput'
import UiSelect from './UiSelect'
import UiCheckbox from './UiCheckbox'

const colors = [
  { name: '$color-bg', value: '#2b303b' },
  { name: '$color-bg-alt', value: '#343d46' },
  { name: '$color-bg-highlight', value: '#4f5b66' },
  { name: '$color-border', value: '#65737e' },
  { name: '$color-text', value: '#c0c5ce' },
  { name: '$color-text-muted', value: '#a7adba' },
  { name: '$color-text-bright', value: '#eff1f5' },
  { name: '$color-accent', value: '#8fa1b3' },
  { name: '$color-accent-alt', value: '#96b5b4' },
  { name: '$color-red', value: '#bf616a' },
  { name: '$color-orange', value: '#d08770' },
  { name: '$color-yellow', value: '#ebcb8b' },
  { name: '$color-green', value: '#a3be8c' },
  { name: '$color-purple', value: '#b48ead' },
  { name: '$color-selection', value: '#4f5b66' },
]

const typography = [
  { name: '$font-size-xs', value: '10px' },
  { name: '$font-size-sm', value: '11px' },
  { name: '$font-size-base', value: '13px' },
  { name: '$font-size-md', value: '14px' },
  { name: '$font-size-lg', value: '16px' },
  { name: '$font-size-xl', value: '20px' },
  { name: '$font-size-2xl', value: '24px' },
]

const spacing = [
  { name: '$space-xs', value: '4px' },
  { name: '$space-sm', value: '8px' },
  { name: '$space-md', value: '12px' },
  { name: '$space-lg', value: '16px' },
  { name: '$space-xl', value: '20px' },
  { name: '$space-2xl', value: '24px' },
  { name: '$space-3xl', value: '32px' },
]

const radii = [
  { name: '$radius-sm', value: '3px' },
  { name: '$radius-md', value: '6px' },
  { name: '$radius-lg', value: '8px' },
  { name: '$radius-full', value: '9999px' },
]

const shadows = [
  { name: '$shadow-sm', value: '0 1px 2px rgba(0, 0, 0, 0.1)' },
  { name: '$shadow-md', value: '0 4px 6px rgba(0, 0, 0, 0.15)' },
  { name: '$shadow-lg', value: '0 10px 15px rgba(0, 0, 0, 0.2)' },
]

const icons = [
  { name: 'Play', Icon: Play },
  { name: 'Pause', Icon: Pause },
  { name: 'Square', Icon: Square },
  { name: 'Settings', Icon: Settings },
  { name: 'Download', Icon: Download },
  { name: 'Plus', Icon: Plus },
  { name: 'Minus', Icon: Minus },
  { name: 'CopyPlus', Icon: CopyPlus },
  { name: 'ChevronUp', Icon: ChevronUp },
  { name: 'ChevronDown', Icon: ChevronDown },
  { name: 'Info', Icon: Info },
  { name: 'Repeat', Icon: Repeat },
  { name: 'Volume2', Icon: Volume2 },
  { name: 'Save', Icon: Save },
  { name: 'RotateCcw', Icon: RotateCcw },
  { name: 'X', Icon: X },
  { name: 'Check', Icon: Check },
  { name: 'Music', Icon: Music },
  { name: 'Edit2', Icon: Edit2 },
  { name: 'Trash2', Icon: Trash2 },
  { name: 'Share2', Icon: Share2 },
  { name: 'Eye', Icon: Eye },
  { name: 'EyeOff', Icon: EyeOff },
]

const SelectOptions = () => (
  <>
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
    <option value="option3">Option 3</option>
  </>
)

export default function StyleGuide() {
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('option1')
  const [checkbox1, setCheckbox1] = useState(false)
  const [checkbox2, setCheckbox2] = useState(true)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Heavy Tabs Style Guide</h1>
        <p>Design tokens, components, and icons used throughout the application</p>
      </header>

      {/* Colors */}
      <section className={styles.section}>
        <h2>Colors</h2>
        <div className={styles.grid}>
          {colors.map(({ name, value }) => (
            <div key={name} className={styles.colorSwatch}>
              <div className={styles.swatchColor} style={{ backgroundColor: value }} />
              <div className={styles.swatchInfo}>
                <div className={styles.swatchName}>{name}</div>
                <div className={styles.swatchValue}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className={styles.section}>
        <h2>Typography</h2>

        <h3>Font Families</h3>
        <div className={styles.fontDemo}>
          <div className={styles.fontName}>$font-sans: 'Inter', system-ui, sans-serif</div>
          <div className={styles.fontSample} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
        <div className={styles.fontDemo}>
          <div className={styles.fontName}>$font-mono: 'JetBrains Mono', monospace</div>
          <div className={styles.fontSample} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            The quick brown fox jumps over the lazy dog
          </div>
        </div>

        <h3>Font Sizes</h3>
        {typography.map(({ name, value }) => (
          <div key={name} className={styles.typographyRow}>
            <span className={styles.typeName}>{name}</span>
            <span className={styles.typeValue}>{value}</span>
            <span className={styles.typeSample} style={{ fontSize: value }}>
              The quick brown fox jumps over the lazy dog
            </span>
          </div>
        ))}
      </section>

      {/* Spacing */}
      <section className={styles.section}>
        <h2>Spacing</h2>
        {spacing.map(({ name, value }) => (
          <div key={name} className={styles.spacingRow}>
            <span className={styles.spaceName}>{name}</span>
            <span className={styles.spaceValue}>{value}</span>
            <div className={styles.spaceBar} style={{ width: value }} />
          </div>
        ))}
      </section>

      {/* Radii */}
      <section className={styles.section}>
        <h2>Border Radii</h2>
        {radii.map(({ name, value }) => (
          <div key={name} className={styles.radiusRow}>
            <span className={styles.radiusName}>{name}</span>
            <span className={styles.radiusValue}>{value}</span>
            <div className={styles.radiusBox} style={{ borderRadius: value }} />
          </div>
        ))}
      </section>

      {/* Shadows */}
      <section className={styles.section}>
        <h2>Shadows</h2>
        {shadows.map(({ name, value }) => (
          <div key={name} className={styles.shadowRow}>
            <span className={styles.shadowName}>{name}</span>
            <div className={styles.shadowBox} style={{ boxShadow: value }} />
          </div>
        ))}
      </section>

      {/* Buttons */}
      <section className={styles.section}>
        <h2>Buttons</h2>

        <h3>Variants</h3>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Secondary (default)</span>
          <UiButton>Button</UiButton>
          <UiButton><Settings size={16} /></UiButton>
          <UiButton><Plus size={16} /> Add</UiButton>
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Primary</span>
          <UiButton variant="primary">Button</UiButton>
          <UiButton variant="primary"><Save size={16} /></UiButton>
          <UiButton variant="primary"><Save size={16} /> Save</UiButton>
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Action</span>
          <UiButton variant="action">Button</UiButton>
          <UiButton variant="action"><Plus size={16} /></UiButton>
          <UiButton variant="action"><Plus size={16} /> Add Bar</UiButton>
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Danger</span>
          <UiButton variant="danger">Button</UiButton>
          <UiButton variant="danger"><Trash2 size={16} /></UiButton>
          <UiButton variant="danger"><Minus size={16} /> Remove</UiButton>
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Ghost</span>
          <UiButton variant="ghost">Button</UiButton>
          <UiButton variant="ghost"><X size={16} /></UiButton>
        </div>

        <h3>Sizes</h3>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Default</span>
          <UiButton><Plus size={16} /></UiButton>
          <UiButton><Plus size={16} /> Add</UiButton>
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Small</span>
          <UiButton size="small"><Plus size={12} /></UiButton>
          <UiButton size="small"><Plus size={12} /> Add</UiButton>
        </div>

        <h3>States</h3>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Default</span>
          <UiButton>Button</UiButton>
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Selected</span>
          <UiButton selected>Button</UiButton>
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Disabled</span>
          <UiButton disabled>Button</UiButton>
        </div>
      </section>

      {/* Inputs */}
      <section className={styles.section}>
        <h2>Inputs</h2>

        <h3>Text Input</h3>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Default</span>
          <UiInput
            placeholder="Enter text..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Disabled</span>
          <UiInput placeholder="Disabled" disabled />
        </div>

        <h3>Select</h3>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Default</span>
          <UiSelect
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
          >
            <SelectOptions />
          </UiSelect>
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>With Label</span>
          <UiSelect
            label="Instrument"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
          >
            <SelectOptions />
          </UiSelect>
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Disabled</span>
          <UiSelect disabled>
            <SelectOptions />
          </UiSelect>
        </div>
      </section>

      {/* Checkbox */}
      <section className={styles.section}>
        <h2>Checkbox</h2>

        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Icon Only</span>
          <UiCheckbox checked={checkbox1} onChange={setCheckbox1} />
          <UiCheckbox checked={checkbox2} onChange={setCheckbox2} />
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>With Label</span>
          <UiCheckbox label="Power Chord" checked={checkbox1} onChange={setCheckbox1} />
          <UiCheckbox label="Mute All" checked={checkbox2} onChange={setCheckbox2} />
        </div>
        <div className={styles.componentRow}>
          <span className={styles.componentLabel}>Disabled</span>
          <UiCheckbox disabled />
          <UiCheckbox checked disabled />
        </div>
      </section>

      {/* Icons */}
      <section className={styles.section}>
        <h2>Icons</h2>
        <p style={{ marginBottom: '16px', color: '#a7adba', fontSize: '13px' }}>
          Icons from lucide-react (size: 16px default, 12px small)
        </p>
        <div className={styles.iconGrid}>
          {icons.map(({ name, Icon }) => (
            <div key={name} className={styles.iconItem}>
              <Icon size={20} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
