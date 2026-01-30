// Lucide Icons (inline SVG components)
const Icon = ({ children, size = 16, strokeWidth = 2, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
    {...props}
  >
    {children}
  </svg>
);

const Icons = {
  Play: (props) => <Icon {...props}><polygon points="6 3 20 12 6 21 6 3" /></Icon>,
  Pause: (props) => <Icon {...props}><rect x="14" y="4" width="4" height="16" rx="1" /><rect x="6" y="4" width="4" height="16" rx="1" /></Icon>,
  Square: (props) => <Icon {...props}><rect x="3" y="3" width="18" height="18" rx="2" /></Icon>,
  Repeat: (props) => <Icon {...props}><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></Icon>,
  Save: (props) => <Icon {...props}><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" /><path d="M7 3v4a1 1 0 0 0 1 1h7" /></Icon>,
  Download: (props) => <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></Icon>,
  Printer: (props) => <Icon {...props}><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" /><rect x="6" y="14" width="12" height="8" rx="1" /></Icon>,
  FolderOpen: (props) => <Icon {...props}><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" /></Icon>,
  Settings: (props) => <Icon {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></Icon>,
  Moon: (props) => <Icon {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></Icon>,
  Sun: (props) => <Icon {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></Icon>,
  Maximize: (props) => <Icon {...props}><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></Icon>,
  Minimize: (props) => <Icon {...props}><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></Icon>,
  Plus: (props) => <Icon {...props}><path d="M5 12h14" /><path d="M12 5v14" /></Icon>,
  Minus: (props) => <Icon {...props}><path d="M5 12h14" /></Icon>,
  Copy: (props) => <Icon {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></Icon>,
  Clipboard: (props) => <Icon {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></Icon>,
  Trash: (props) => <Icon {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></Icon>,
  X: (props) => <Icon {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>,
  HelpCircle: (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></Icon>,
  Hand: (props) => <Icon {...props}><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" /><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></Icon>,
  Volume2: (props) => <Icon {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></Icon>,
};

// Spacegray / Base16 Ocean Dark color palette
const themes = {
  dark: {
    bg: '#2b303b',
    bgAlt: '#343d46',
    bgHighlight: '#4f5b66',
    border: '#65737e',
    text: '#c0c5ce',
    textMuted: '#a7adba',
    textBright: '#eff1f5',
    accent: '#8fa1b3',
    accentAlt: '#96b5b4',
    red: '#bf616a',
    orange: '#d08770',
    yellow: '#ebcb8b',
    green: '#a3be8c',
    purple: '#b48ead',
    selection: '#4f5b66',
  },
  light: {
    bg: '#eff1f5',
    bgAlt: '#dfe1e8',
    bgHighlight: '#c0c5ce',
    border: '#a7adba',
    text: '#343d46',
    textMuted: '#65737e',
    textBright: '#2b303b',
    accent: '#8fa1b3',
    accentAlt: '#96b5b4',
    red: '#bf616a',
    orange: '#d08770',
    yellow: '#ebcb8b',
    green: '#a3be8c',
    purple: '#b48ead',
    selection: '#c0c5ce',
  }
};

// All 12 keys for transposition
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const KEY_SEMITONES = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };

// Tuning configurations
const tuningConfigs = {
  guitar: {
    6: {
      standard: { notes: ['E', 'B', 'G', 'D', 'A', 'E'], label: 'Standard' },
      drop: { notes: ['E', 'B', 'G', 'D', 'A', 'D'], label: 'Drop D' },
    },
    7: {
      standard: { notes: ['E', 'B', 'G', 'D', 'A', 'E', 'B'], label: 'Standard' },
      drop: { notes: ['E', 'B', 'G', 'D', 'A', 'E', 'A'], label: 'Drop A' },
    },
    8: {
      standard: { notes: ['E', 'B', 'G', 'D', 'A', 'E', 'B', 'F#'], label: 'Standard' },
      drop: { notes: ['E', 'B', 'G', 'D', 'A', 'E', 'B', 'E'], label: 'Drop E' },
    },
  },
  bass: {
    4: {
      standard: { notes: ['G', 'D', 'A', 'E'], label: 'Standard' },
      drop: { notes: ['G', 'D', 'A', 'D'], label: 'Drop D' },
    },
    5: {
      standard: { notes: ['G', 'D', 'A', 'E', 'B'], label: 'Standard' },
      drop: { notes: ['G', 'D', 'A', 'E', 'A'], label: 'Drop A' },
    },
    6: {
      standard: { notes: ['C', 'G', 'D', 'A', 'E', 'B'], label: 'Standard' },
      drop: { notes: ['C', 'G', 'D', 'A', 'E', 'A'], label: 'Drop A' },
    },
  },
};

// Transpose note by semitones
const transposeNote = (note, semitones) => {
  const baseNote = note.replace(/[0-9]/g, '');
  const currentIdx = KEYS.indexOf(baseNote.toUpperCase());
  if (currentIdx === -1) return note;
  const newIdx = (currentIdx + semitones + 12) % 12;
  return KEYS[newIdx];
};

// Get tuning notes transposed to key
const getTuningNotes = (instrument, stringCount, tuning, key) => {
  const baseTuning = tuningConfigs[instrument]?.[stringCount]?.[tuning]?.notes || [];
  // Standard tuning base is E, Drop tuning base is D (the dropped root)
  const baseKey = tuning === 'drop' ? 'D' : 'E';
  const semitones = KEY_SEMITONES[key] - KEY_SEMITONES[baseKey];
  return baseTuning.map(note => transposeNote(note, semitones));
};

// Chord library - frets from high E (index 0) to low E (index 5), 'x' = muted
const CHORD_SHAPES = {
  major: {
    'A': { frets: [0, 2, 2, 2, 0, 'x'] },
    'B': { frets: [2, 4, 4, 4, 2, 'x'] },
    'C': { frets: [0, 1, 0, 2, 3, 'x'] },
    'D': { frets: [2, 3, 2, 0, 'x', 'x'] },
    'E': { frets: [0, 0, 1, 2, 2, 0] },
    'F': { frets: [1, 1, 2, 3, 3, 1] },
    'G': { frets: [3, 0, 0, 0, 2, 3] },
    'F#': { frets: [2, 2, 3, 4, 4, 2] },
    'Gb': { frets: [2, 2, 3, 4, 4, 2] },
    'C#': { frets: [4, 6, 6, 6, 4, 'x'] },
    'Db': { frets: [4, 6, 6, 6, 4, 'x'] },
    'Eb': { frets: [3, 4, 3, 1, 'x', 'x'] },
    'Ab': { frets: [4, 4, 5, 6, 6, 4] },
    'Bb': { frets: [1, 3, 3, 3, 1, 'x'] },
  },
  minor: {
    'Am': { frets: [0, 1, 2, 2, 0, 'x'] },
    'Bm': { frets: [2, 3, 4, 4, 2, 'x'] },
    'Cm': { frets: [3, 4, 5, 5, 3, 'x'] },
    'Dm': { frets: [1, 3, 2, 0, 'x', 'x'] },
    'Em': { frets: [0, 0, 0, 2, 2, 0] },
    'Fm': { frets: [1, 1, 1, 3, 3, 1] },
    'Gm': { frets: [3, 3, 3, 5, 5, 3] },
    'F#m': { frets: [2, 2, 2, 4, 4, 2] },
    'Gbm': { frets: [2, 2, 2, 4, 4, 2] },
    'C#m': { frets: [4, 5, 6, 6, 4, 'x'] },
    'Dbm': { frets: [4, 5, 6, 6, 4, 'x'] },
    'Ebm': { frets: [6, 7, 8, 8, 6, 'x'] },
    'Abm': { frets: [4, 4, 4, 6, 6, 4] },
    'Bbm': { frets: [1, 2, 3, 3, 1, 'x'] },
  },
};

// Get all chord names for display
const getAllChords = () => {
  const chords = [];
  KEYS.forEach(key => {
    chords.push({ name: `${key}`, type: 'major', key });
    chords.push({ name: `${key}m`, type: 'minor', key });
  });
  return chords;
};

// Instrument configurations (for drums only now)
const instrumentConfigs = {
  guitar: {
    6: ['e', 'B', 'G', 'D', 'A', 'E'],
    7: ['e', 'B', 'G', 'D', 'A', 'E', 'B'],
    8: ['e', 'B', 'G', 'D', 'A', 'E', 'B', 'F#'],
  },
  bass: {
    4: ['G', 'D', 'A', 'E'],
    5: ['G', 'D', 'A', 'E', 'B'],
    6: ['C', 'G', 'D', 'A', 'E', 'B'],
  },
  drums: {
    lines: [
      { id: 'china', name: 'CH', fullName: 'China' },
      { id: 'crash', name: 'CC', fullName: 'Crash' },
      { id: 'ride', name: 'RD', fullName: 'Ride' },
      { id: 'hihatOpen', name: 'HO', fullName: 'Hi-Hat Open' },
      { id: 'hihatClosed', name: 'HC', fullName: 'Hi-Hat Closed' },
      { id: 'tomHigh', name: 'TH', fullName: 'Tom High' },
      { id: 'tomMid', name: 'TM', fullName: 'Tom Mid' },
      { id: 'tomLow', name: 'TL', fullName: 'Tom Low' },
      { id: 'snare', name: 'SN', fullName: 'Snare' },
      { id: 'kick', name: 'KK', fullName: 'Kick' },
    ]
  }
};

// Valid inputs for each instrument type
const validInputs = {
  guitar: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','h','p','/','\\','b','x','m','~','-'],
  bass: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','h','p','/','\\','b','x','m','~','-'],
  drums: ['x','o','X','O','-','f','g','d','b','r'],
};

// Technique labels
const techniques = {
  'h': 'hammer-on',
  'p': 'pull-off',
  '/': 'slide up',
  '\\': 'slide down',
  'b': 'bend',
  'x': 'dead note',
  'm': 'palm mute',
  '~': 'vibrato',
};

const DEFAULT_BPM = 120;

// Time signature presets
const TIME_SIGNATURES = [
  { label: '4/4', beats: 4, noteValue: 4 },
  { label: '3/4', beats: 3, noteValue: 4 },
  { label: '2/4', beats: 2, noteValue: 4 },
  { label: '5/4', beats: 5, noteValue: 4 },
  { label: '6/8', beats: 6, noteValue: 8 },
  { label: '7/8', beats: 7, noteValue: 8 },
  { label: '12/8', beats: 12, noteValue: 8 },
];

// Note resolution presets (cells per quarter note)
const NOTE_RESOLUTIONS = [
  { label: '1/32', perQuarter: 8 },
  { label: '1/16', perQuarter: 4 },
  { label: '1/8', perQuarter: 2 },
  { label: '1/4', perQuarter: 1 },
  { label: '1/2', perQuarter: 0.5 },
  { label: '1/32T', perQuarter: 12 },
  { label: '1/16T', perQuarter: 6 },
  { label: '1/8T', perQuarter: 3 },
  { label: '1/4T', perQuarter: 1.5 },
  { label: '1/2T', perQuarter: 0.75 },
];

// Calculate cells per measure based on time signature and resolution
const getCellsPerMeasure = (timeSig, resolution) => {
  // Convert beats to quarter note equivalents
  const quartersPerMeasure = timeSig.noteValue === 4
    ? timeSig.beats
    : timeSig.beats / 2;
  return Math.round(quartersPerMeasure * resolution.perQuarter);
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Section colors for visual organization
const SECTION_COLORS = [
  { name: 'None', value: null },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Pink', value: '#ec4899' },
];

// Initial part creator
const createSection = (name = 'New Part') => ({
  id: generateId(),
  name,
  notes: '',
  measures: 1,
  repeat: 1,
  color: null,
});

// Initial measure data creator
const createEmptyMeasure = (instrument, stringCount, cellsPerMeasure = 16) => {
  if (instrument === 'drums') {
    const lines = instrumentConfigs.drums.lines.length;
    return Array(lines).fill(null).map(() => Array(cellsPerMeasure).fill('-'));
  }
  return Array(stringCount).fill(null).map(() => Array(cellsPerMeasure).fill('-'));
};

// Main App Component
function TabApp() {
  const [theme, setTheme] = useState('dark');
  const [activeInstrument, setActiveInstrument] = useState('guitar');
  const [stringCounts, setStringCounts] = useState({ guitar: 6, bass: 4 });
  const [tunings, setTunings] = useState({ guitar: 'standard', bass: 'standard' });
  const [projectKey, setProjectKey] = useState('E');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [timeSignature, setTimeSignature] = useState(TIME_SIGNATURES[0]);
  const [noteResolution, setNoteResolution] = useState(NOTE_RESOLUTIONS[1]); // Default 1/16
  const [sections, setSections] = useState([createSection('Intro')]);
  const [tabData, setTabData] = useState({});
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectionStart, setSelectionStart] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [clipboard, setClipboard] = useState(null);
  const [barClipboard, setBarClipboard] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [clickTrack, setClickTrack] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mobileInputCell, setMobileInputCell] = useState(null);
  const [powerChordMode, setPowerChordMode] = useState(true);
  const [showChordPicker, setShowChordPicker] = useState(false);
  const [chordSearch, setChordSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedo, setIsUndoRedo] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmRemoveBar, setConfirmRemoveBar] = useState(null); // { sectionId, sectionName }
  const [showSettings, setShowSettings] = useState(true);

  const mobileInputRef = useRef(null);

  const playbackRef = useRef(null);
  const playbackActiveRef = useRef(false);
  const audioContextRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const tapTimesRef = useRef([]);

  const colors = themes[theme];
  const cellsPerMeasure = getCellsPerMeasure(timeSignature, noteResolution);

  // Initialize tab data for a section/instrument combo if not exists
  const getTabData = useCallback((sectionId, instrument) => {
    const key = `${sectionId}-${instrument}`;
    if (!tabData[key]) {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return [];
      const stringCount = instrument === 'drums' ? instrumentConfigs.drums.lines.length : stringCounts[instrument];
      const measures = Array(section.measures).fill(null).map(() => createEmptyMeasure(instrument, stringCount, cellsPerMeasure));
      return measures;
    }
    return tabData[key];
  }, [tabData, sections, stringCounts]);

  // Update tab data with history tracking
  const updateTabData = useCallback((sectionId, instrument, newData) => {
    const key = `${sectionId}-${instrument}`;
    setTabData(prev => {
      const updated = { ...prev, [key]: newData };
      // Save to history (trim future states if we're not at the end)
      setHistory(h => {
        // If this is the first change, save the original state first
        if (h.length === 0) {
          setHistoryIndex(1);
          return [JSON.stringify(prev), JSON.stringify(updated)];
        }
        const newHistory = h.slice(0, historyIndex + 1);
        newHistory.push(JSON.stringify(updated));
        // Limit history size
        if (newHistory.length > 200) newHistory.shift();
        setHistoryIndex(Math.min(newHistory.length - 1, 199));
        return newHistory;
      });
      return updated;
    });
  }, [historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedo(true);
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTabData(JSON.parse(history[newIndex]));
      setTimeout(() => setIsUndoRedo(false), 0);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedo(true);
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTabData(JSON.parse(history[newIndex]));
      setTimeout(() => setIsUndoRedo(false), 0);
    }
  }, [history, historyIndex]);

  // Load saved projects list from localStorage
  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('tabEditorProjects') || '[]');
    setSavedProjects(projects);
  }, []);

  // Save current project to library
  const saveToLibrary = () => {
    const projectId = currentProjectId || generateId();
    const project = {
      id: projectId,
      projectName,
      bpm,
      timeSignature,
      noteResolution,
      projectKey,
      tunings,
      stringCounts,
      sections,
      tabData,
      updatedAt: new Date().toISOString(),
    };

    const projects = JSON.parse(localStorage.getItem('tabEditorProjects') || '[]');
    const existingIndex = projects.findIndex(p => p.id === projectId);

    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project);
    }

    localStorage.setItem('tabEditorProjects', JSON.stringify(projects));
    setSavedProjects(projects);
    setCurrentProjectId(projectId);
    setHasUnsavedChanges(false);
  };

  // Auto-save with 5 second debounce (only if project has been saved before)
  useEffect(() => {
    if (!currentProjectId) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const project = {
        id: currentProjectId,
        projectName,
        bpm,
        timeSignature,
        noteResolution,
        projectKey,
        tunings,
        stringCounts,
        sections,
        tabData,
        updatedAt: new Date().toISOString(),
      };

      const projects = JSON.parse(localStorage.getItem('tabEditorProjects') || '[]');
      const existingIndex = projects.findIndex(p => p.id === currentProjectId);

      if (existingIndex >= 0) {
        projects[existingIndex] = project;
        localStorage.setItem('tabEditorProjects', JSON.stringify(projects));
        setSavedProjects(projects);
        setHasUnsavedChanges(false);
      }
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [currentProjectId, projectName, bpm, timeSignature, noteResolution, projectKey, tunings, stringCounts, sections, tabData]);

  // Track unsaved changes (only after initial load)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (currentProjectId) {
      setHasUnsavedChanges(true);
    }
  }, [projectName, bpm, timeSignature, noteResolution, projectKey, tunings, stringCounts, sections, tabData]);

  // Load project from library
  const loadFromLibrary = (project) => {
    setProjectName(project.projectName || 'Untitled Project');
    setBpm(project.bpm || DEFAULT_BPM);
    setTimeSignature(project.timeSignature || TIME_SIGNATURES[0]);
    setNoteResolution(project.noteResolution || NOTE_RESOLUTIONS[1]);
    setProjectKey(project.projectKey || 'E');
    setTunings(project.tunings || { guitar: 'standard', bass: 'standard' });
    setStringCounts(project.stringCounts || { guitar: 6, bass: 4 });
    setSections(project.sections || [createSection('Intro')]);
    setTabData(project.tabData || {});
    setCurrentProjectId(project.id);
    setShowLibrary(false);
    setHistory([]);
    setHistoryIndex(-1);
    setHasUnsavedChanges(false);
    isInitialMount.current = true; // Reset to prevent marking as unsaved
  };

  // Delete project from library
  const deleteFromLibrary = (projectId) => {
    const projects = JSON.parse(localStorage.getItem('tabEditorProjects') || '[]');
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem('tabEditorProjects', JSON.stringify(filtered));
    setSavedProjects(filtered);
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  };

  // Create new project
  const newProject = () => {
    setProjectName('Untitled Project');
    setBpm(DEFAULT_BPM);
    setTimeSignature(TIME_SIGNATURES[0]);
    setNoteResolution(NOTE_RESOLUTIONS[1]);
    setProjectKey('E');
    setTunings({ guitar: 'standard', bass: 'standard' });
    setStringCounts({ guitar: 6, bass: 4 });
    setSections([createSection('Intro')]);
    setTabData({});
    setCurrentProjectId(null);
    setHistory([]);
    setHistoryIndex(-1);
    setShowLibrary(false);
  };

  // Initialize data when sections change
  useEffect(() => {
    const newTabData = { ...tabData };
    sections.forEach(section => {
      ['guitar', 'bass', 'drums'].forEach(instrument => {
        const key = `${section.id}-${instrument}`;
        if (!newTabData[key]) {
          const stringCount = instrument === 'drums' ? instrumentConfigs.drums.lines.length : stringCounts[instrument];
          newTabData[key] = Array(section.measures).fill(null).map(() => createEmptyMeasure(instrument, stringCount, cellsPerMeasure));
        }
      });
    });
    setTabData(newTabData);
  }, [sections]);

  // Resize measures when time signature changes
  useEffect(() => {
    const newTabData = {};
    Object.entries(tabData).forEach(([key, measures]) => {
      newTabData[key] = measures.map(measure =>
        measure.map(string => {
          const currentLength = string.length;
          if (currentLength === cellsPerMeasure) return string;
          if (currentLength < cellsPerMeasure) {
            // Expand: add empty cells
            return [...string, ...Array(cellsPerMeasure - currentLength).fill('-')];
          } else {
            // Shrink: truncate cells
            return string.slice(0, cellsPerMeasure);
          }
        })
      );
    });
    setTabData(newTabData);
  }, [cellsPerMeasure]);

  // Mobile input handler
  const handleMobileInput = (e) => {
    const value = e.target.value;
    if (mobileInputCell) {
      const { sectionId, measureIdx, stringIdx, cellIdx } = mobileInputCell;
      const data = getTabData(sectionId, activeInstrument);
      const currentValue = data[measureIdx]?.[stringIdx]?.[cellIdx] || '-';
      
      // Get the new character (what was just typed)
      const newChar = value.length > currentValue.length || currentValue === '-' 
        ? value.slice(-1) 
        : value;
      
      if (newChar) {
        const validChars = validInputs[activeInstrument];
        if (validChars.includes(newChar) || (newChar >= '0' && newChar <= '9')) {
          if (data[measureIdx]) {
            const newData = data.map((measure, mIdx) => 
              measure.map((string, sIdx) => 
                string.map((cell, cIdx) => {
                  if (mIdx === measureIdx && sIdx === stringIdx && cIdx === cellIdx) {
                    return newChar;
                  }
                  return cell;
                })
              )
            );
            updateTabData(sectionId, activeInstrument, newData);
          }
        }
      }
    }
  };

  // Get current cell value for mobile input
  const getMobileInputValue = () => {
    if (!mobileInputCell) return '';
    const { sectionId, measureIdx, stringIdx, cellIdx } = mobileInputCell;
    const data = getTabData(sectionId, activeInstrument);
    const value = data[measureIdx]?.[stringIdx]?.[cellIdx];
    return value === '-' ? '' : value || '';
  };

  const openMobileKeyboard = (sectionId, measureIdx, stringIdx, cellIdx) => {
    const cellKey = `${sectionId}-${measureIdx}-${stringIdx}-${cellIdx}`;
    setSelectionStart({ sectionId, measureIdx, stringIdx, cellIdx });
    setSelectedCells([cellKey]);
    setMobileInputCell({ sectionId, measureIdx, stringIdx, cellIdx });
  };

  const closeMobileInput = () => {
    setMobileInputCell(null);
  };

  // Focus input when mobile input cell changes
  useEffect(() => {
    if (mobileInputCell && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileInputCell]);

  // Cell click handler
  const handleCellClick = (sectionId, measureIdx, stringIdx, cellIdx, e) => {
    const cellKey = `${sectionId}-${measureIdx}-${stringIdx}-${cellIdx}`;
    
    if (e.shiftKey && selectionStart) {
      // Extend selection
      const cells = getCellsBetween(selectionStart, { sectionId, measureIdx, stringIdx, cellIdx });
      setSelectedCells(cells);
    } else {
      setSelectionStart({ sectionId, measureIdx, stringIdx, cellIdx });
      setSelectedCells([cellKey]);
    }
  };

  // Mouse down for drag selection
  const handleMouseDown = (sectionId, measureIdx, stringIdx, cellIdx, e) => {
    if (e.button !== 0) return;
    setIsSelecting(true);
    setSelectionStart({ sectionId, measureIdx, stringIdx, cellIdx });
    setSelectedCells([`${sectionId}-${measureIdx}-${stringIdx}-${cellIdx}`]);
  };

  // Mouse enter during selection
  const handleMouseEnter = (sectionId, measureIdx, stringIdx, cellIdx) => {
    if (!isSelecting || !selectionStart) return;
    const cells = getCellsBetween(selectionStart, { sectionId, measureIdx, stringIdx, cellIdx });
    setSelectedCells(cells);
  };

  // Mouse up
  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Get cells between two points
  const getCellsBetween = (start, end) => {
    if (start.sectionId !== end.sectionId) {
      return [`${end.sectionId}-${end.measureIdx}-${end.stringIdx}-${end.cellIdx}`];
    }
    
    const cells = [];
    const minMeasure = Math.min(start.measureIdx, end.measureIdx);
    const maxMeasure = Math.max(start.measureIdx, end.measureIdx);
    const minString = Math.min(start.stringIdx, end.stringIdx);
    const maxString = Math.max(start.stringIdx, end.stringIdx);
    const minCell = Math.min(start.cellIdx, end.cellIdx);
    const maxCell = Math.max(start.cellIdx, end.cellIdx);

    for (let m = minMeasure; m <= maxMeasure; m++) {
      for (let s = minString; s <= maxString; s++) {
        const startCell = m === minMeasure ? minCell : 0;
        const endCell = m === maxMeasure ? maxCell : cellsPerMeasure - 1;
        for (let c = startCell; c <= endCell; c++) {
          cells.push(`${start.sectionId}-${m}-${s}-${c}`);
        }
      }
    }
    return cells;
  };

  // Keyboard input handler
  const handleKeyDown = useCallback((e) => {
    const key = e.key;

    // Undo (works even without selection)
    if ((e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }

    // Redo (Ctrl+Shift+Z or Ctrl+Y)
    if ((e.ctrlKey || e.metaKey) && (key === 'y' || (key === 'z' && e.shiftKey) || key === 'Z')) {
      e.preventDefault();
      redo();
      return;
    }

    // Spacebar to toggle play/pause (only if not typing in an input, ignore key repeat)
    if (key === ' ' && !e.repeat && !e.target.matches('input, textarea, select')) {
      e.preventDefault();
      togglePlayback();
      return;
    }

    // ? to show keyboard shortcuts
    if (key === '?' && !e.target.matches('input, textarea, select')) {
      e.preventDefault();
      setShowShortcuts(true);
      return;
    }

    // Escape to close modals
    if (key === 'Escape') {
      if (showShortcuts) {
        setShowShortcuts(false);
        return;
      }
      closeMobileInput();
      return;
    }

    if (selectedCells.length === 0) return;
    if (editingSection) return;

    // Copy
    if ((e.ctrlKey || e.metaKey) && key === 'c') {
      e.preventDefault();
      copySelection();
      return;
    }

    // Paste
    if ((e.ctrlKey || e.metaKey) && key === 'v') {
      e.preventDefault();
      pasteSelection();
      return;
    }
    
    // Delete
    if (key === 'Delete' || key === 'Backspace') {
      e.preventDefault();
      deleteSelection();
      return;
    }

    // Close mobile input on Escape
    if (key === 'Escape') {
      closeMobileInput();
      return;
    }

    // Navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
      navigateSelection(key);
      return;
    }

    // Input value
    const validChars = validInputs[activeInstrument];
    if (validChars.includes(key) || (key >= '0' && key <= '9')) {
      e.preventDefault();
      inputValue(key);
    }
  }, [selectedCells, activeInstrument, editingSection, undo, redo]);

  // Input value to selected cells
  const inputValue = (value) => {
    if (selectedCells.length === 0) return;

    const cellKey = selectedCells[0];
    const [sectionId, measureIdx, stringIdx, cellIdx] = cellKey.split('-');
    const data = getTabData(sectionId, activeInstrument);
    const mIdx = parseInt(measureIdx);
    const sIdx = parseInt(stringIdx);
    const cIdx = parseInt(cellIdx);

    if (!data[mIdx]) return;

    const fret = parseInt(value);
    const isPowerChord = powerChordMode && !isNaN(fret) && activeInstrument !== 'drums';
    const stringCount = stringCounts[activeInstrument];
    const isDropTuning = tunings[activeInstrument] === 'drop';

    const newData = data.map((measure, measureIndex) =>
      measure.map((string, stringIndex) =>
        string.map((cell, cellIndex) => {
          if (measureIndex !== mIdx || cellIndex !== cIdx) return cell;

          // Root note
          if (stringIndex === sIdx) {
            return value;
          }

          // Power chord: add 5th and octave (going UP toward higher strings)
          if (isPowerChord) {
            const isRootOnLowest = sIdx === stringCount - 1;
            // 5th: one string up (lower index)
            if (stringIndex === sIdx - 1 && sIdx - 1 >= 0) {
              const fifthFret = (isDropTuning && isRootOnLowest) ? fret : fret + 2;
              return fifthFret <= 24 ? String(fifthFret) : cell;
            }
            // Octave: two strings up
            if (stringIndex === sIdx - 2 && sIdx - 2 >= 0) {
              const octaveFret = (isDropTuning && isRootOnLowest) ? fret : fret + 2;
              return octaveFret <= 24 ? String(octaveFret) : cell;
            }
          }

          return cell;
        })
      )
    );

    updateTabData(sectionId, activeInstrument, newData);
  };

  // Navigate selection with arrow keys
  const navigateSelection = (direction) => {
    if (selectedCells.length === 0) return;
    
    const cellKey = selectedCells[0];
    const [sectionId, measureIdx, stringIdx, cellIdx] = cellKey.split('-').map((v, i) => i === 0 ? v : parseInt(v));
    const data = getTabData(sectionId, activeInstrument);
    
    let newMeasure = measureIdx;
    let newString = stringIdx;
    let newCell = cellIdx;
    
    const stringCount = activeInstrument === 'drums' ? instrumentConfigs.drums.lines.length : stringCounts[activeInstrument];
    
    switch (direction) {
      case 'ArrowUp':
        newString = Math.max(0, stringIdx - 1);
        break;
      case 'ArrowDown':
        newString = Math.min(stringCount - 1, stringIdx + 1);
        break;
      case 'ArrowLeft':
        if (cellIdx > 0) {
          newCell = cellIdx - 1;
        } else if (measureIdx > 0) {
          newMeasure = measureIdx - 1;
          newCell = cellsPerMeasure - 1;
        }
        break;
      case 'ArrowRight':
        if (cellIdx < cellsPerMeasure - 1) {
          newCell = cellIdx + 1;
        } else if (measureIdx < data.length - 1) {
          newMeasure = measureIdx + 1;
          newCell = 0;
        }
        break;
    }
    
    const newKey = `${sectionId}-${newMeasure}-${newString}-${newCell}`;
    setSelectedCells([newKey]);
    setSelectionStart({ sectionId, measureIdx: newMeasure, stringIdx: newString, cellIdx: newCell });
  };

  // Copy selection
  const copySelection = () => {
    if (selectedCells.length === 0) return;
    
    const cellData = selectedCells.map(cellKey => {
      const [sectionId, measureIdx, stringIdx, cellIdx] = cellKey.split('-');
      const data = getTabData(sectionId, activeInstrument);
      return {
        stringIdx: parseInt(stringIdx),
        cellIdx: parseInt(cellIdx),
        measureIdx: parseInt(measureIdx),
        value: data[parseInt(measureIdx)]?.[parseInt(stringIdx)]?.[parseInt(cellIdx)] || '-'
      };
    });
    
    setClipboard({ instrument: activeInstrument, cells: cellData });
  };

  // Paste selection
  const pasteSelection = () => {
    if (!clipboard || selectedCells.length === 0) return;
    if (clipboard.instrument !== activeInstrument) return;
    
    const targetKey = selectedCells[0];
    const [targetSectionId, targetMeasureIdx, targetStringIdx, targetCellIdx] = targetKey.split('-').map((v, i) => i === 0 ? v : parseInt(v));
    
    const data = getTabData(targetSectionId, activeInstrument);
    const newData = JSON.parse(JSON.stringify(data));
    
    // Find min positions in clipboard
    const minString = Math.min(...clipboard.cells.map(c => c.stringIdx));
    const minCell = Math.min(...clipboard.cells.map(c => c.cellIdx));
    const minMeasure = Math.min(...clipboard.cells.map(c => c.measureIdx));
    
    clipboard.cells.forEach(cell => {
      const newStringIdx = targetStringIdx + (cell.stringIdx - minString);
      const newCellIdx = targetCellIdx + (cell.cellIdx - minCell);
      const newMeasureIdx = targetMeasureIdx + (cell.measureIdx - minMeasure);
      
      if (newData[newMeasureIdx]?.[newStringIdx]?.[newCellIdx] !== undefined) {
        newData[newMeasureIdx][newStringIdx][newCellIdx] = cell.value;
      }
    });
    
    updateTabData(targetSectionId, activeInstrument, newData);
  };

  // Delete selection
  const deleteSelection = () => {
    if (selectedCells.length === 0) return;
    
    const grouped = {};
    selectedCells.forEach(cellKey => {
      const [sectionId] = cellKey.split('-');
      if (!grouped[sectionId]) grouped[sectionId] = [];
      grouped[sectionId].push(cellKey);
    });
    
    Object.entries(grouped).forEach(([sectionId, cells]) => {
      const data = getTabData(sectionId, activeInstrument);
      const newData = JSON.parse(JSON.stringify(data));
      
      cells.forEach(cellKey => {
        const [, measureIdx, stringIdx, cellIdx] = cellKey.split('-').map((v, i) => i === 0 ? v : parseInt(v));
        if (newData[measureIdx]?.[stringIdx]?.[cellIdx] !== undefined) {
          newData[measureIdx][stringIdx][cellIdx] = '-';
        }
      });
      
      updateTabData(sectionId, activeInstrument, newData);
    });
  };

  // Copy entire bar
  const copyBar = (sectionId, measureIdx) => {
    const data = getTabData(sectionId, activeInstrument);
    if (data[measureIdx]) {
      setBarClipboard(JSON.parse(JSON.stringify(data[measureIdx])));
    }
  };

  // Paste bar at position
  const pasteBar = (sectionId, measureIdx) => {
    if (!barClipboard) return;
    const data = getTabData(sectionId, activeInstrument);
    if (!data[measureIdx]) return;

    // Check if bar has same number of strings
    if (barClipboard.length !== data[measureIdx].length) return;

    const newData = data.map((measure, mIdx) => {
      if (mIdx !== measureIdx) return measure;
      return JSON.parse(JSON.stringify(barClipboard));
    });

    updateTabData(sectionId, activeInstrument, newData);
  };

  // Add part
  const addSection = () => {
    const newSection = createSection(`Part ${sections.length + 1}`);
    setSections([...sections, newSection]);
  };

  // Delete section
  const deleteSection = (sectionId) => {
    if (sections.length <= 1) return;
    setSections(sections.filter(s => s.id !== sectionId));
    const newTabData = { ...tabData };
    ['guitar', 'bass', 'drums'].forEach(instrument => {
      delete newTabData[`${sectionId}-${instrument}`];
    });
    setTabData(newTabData);
  };

  // Duplicate section
  const duplicateSection = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newSection = { ...section, id: generateId(), name: `${section.name} (copy)` };
    const idx = sections.findIndex(s => s.id === sectionId);
    const newSections = [...sections];
    newSections.splice(idx + 1, 0, newSection);
    setSections(newSections);
    
    // Copy tab data
    const newTabData = { ...tabData };
    ['guitar', 'bass', 'drums'].forEach(instrument => {
      const sourceKey = `${sectionId}-${instrument}`;
      const targetKey = `${newSection.id}-${instrument}`;
      if (tabData[sourceKey]) {
        newTabData[targetKey] = JSON.parse(JSON.stringify(tabData[sourceKey]));
      }
    });
    setTabData(newTabData);
  };

  // Update section properties
  const updateSection = (sectionId, updates) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
    
    // If measures changed, update tab data
    if (updates.measures !== undefined) {
      const section = sections.find(s => s.id === sectionId);
      ['guitar', 'bass', 'drums'].forEach(instrument => {
        const key = `${sectionId}-${instrument}`;
        const currentData = tabData[key] || [];
        const stringCount = instrument === 'drums' ? instrumentConfigs.drums.lines.length : stringCounts[instrument];
        
        if (updates.measures > currentData.length) {
          const newMeasures = Array(updates.measures - currentData.length).fill(null).map(() => createEmptyMeasure(instrument, stringCount, cellsPerMeasure));
          setTabData(prev => ({ ...prev, [key]: [...currentData, ...newMeasures] }));
        } else if (updates.measures < currentData.length) {
          setTabData(prev => ({ ...prev, [key]: currentData.slice(0, updates.measures) }));
        }
      });
    }
  };

  // Check if last bar has notes and handle removal
  const handleRemoveBar = (section) => {
    if (section.measures <= 1) return;

    // Check if last bar has any notes
    const key = `${section.id}-${activeInstrument}`;
    const data = tabData[key] || [];
    const lastBar = data[data.length - 1];

    const hasNotes = lastBar && lastBar.some(string =>
      string.some(cell => cell !== '-' && cell !== '')
    );

    if (hasNotes) {
      setConfirmRemoveBar({ sectionId: section.id, sectionName: section.name });
    } else {
      updateSection(section.id, { measures: section.measures - 1 });
    }
  };

  // Apply a chord to the current selection
  const applyChord = (chordName) => {
    // Only works for 6-string guitar
    if (activeInstrument !== 'guitar' || stringCounts.guitar !== 6) return;

    // Get the cell position from mobileInputCell or selectedCells
    let sectionId, measureIdx, cellIdx;
    if (mobileInputCell) {
      sectionId = mobileInputCell.sectionId;
      measureIdx = mobileInputCell.measureIdx;
      cellIdx = mobileInputCell.cellIdx;
    } else if (selectedCells.length > 0) {
      const parts = selectedCells[0].split('-');
      sectionId = parts[0];
      measureIdx = parseInt(parts[1]);
      cellIdx = parseInt(parts[3]);
    } else {
      return;
    }

    // Find the chord
    const chord = CHORD_SHAPES.major[chordName] || CHORD_SHAPES.minor[chordName];
    if (!chord) return;

    // Use getTabData to ensure data exists
    const data = getTabData(sectionId, activeInstrument);
    if (!data || !data[measureIdx]) return;

    const newData = data.map((measure, mIdx) => {
      if (mIdx !== measureIdx) return measure;
      return measure.map((string, sIdx) => {
        return string.map((cell, cIdx) => {
          if (cIdx !== cellIdx) return cell;
          // chord.frets is [high E, B, G, D, A, low E] (index 0 = high E)
          // our strings are also [high E, B, G, D, A, low E] (index 0 = high E)
          const fretValue = chord.frets[sIdx];
          if (fretValue === 'x' || fretValue === null) return '-';
          if (fretValue === 0) return '0';
          return String(fretValue);
        });
      });
    });

    updateTabData(sectionId, activeInstrument, newData);
    setShowChordPicker(false);
    setChordSearch('');
  };

  // Audio playback
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playNote = (frequency, duration, type = 'sine', scheduleAhead = 0.03) => {
    if (isMuted) return;
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const startTime = ctx.currentTime + scheduleAhead;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  const playClick = (isDownbeat = false, scheduleAhead = 0.03) => {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const startTime = ctx.currentTime + scheduleAhead;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(isDownbeat ? 1000 : 800, startTime);

    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.05);
  };

  const playDrumSound = (drumType) => {
    if (isMuted) return;
    const ctx = initAudio();
    
    const frequencies = {
      kick: 60,
      snare: 200,
      hihatClosed: 800,
      hihatOpen: 800,
      crash: 500,
      ride: 600,
      china: 450,
      tomHigh: 300,
      tomMid: 200,
      tomLow: 150,
    };
    
    const freq = frequencies[drumType] || 200;
    playNote(freq, drumType.includes('hihat') || drumType.includes('crash') || drumType.includes('china') || drumType.includes('ride') ? 0.1 : 0.2, drumType === 'kick' ? 'sine' : 'triangle');
  };

  const fretToFrequency = (stringIdx, fret, instrument) => {
    const baseFrequencies = {
      guitar: {
        6: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41],
        7: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41, 61.74],
        8: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41, 61.74, 46.25],
      },
      bass: {
        4: [196.00, 146.83, 110.00, 82.41],
        5: [196.00, 146.83, 110.00, 82.41, 61.74],
        6: [261.63, 196.00, 146.83, 110.00, 82.41, 61.74],
      }
    };
    
    const stringCount = stringCounts[instrument];
    const baseFreq = baseFrequencies[instrument]?.[stringCount]?.[stringIdx] || 110;
    return baseFreq * Math.pow(2, fret / 12);
  };

  // Playback control
  const loopingRef = useRef(false);

  const togglePlayback = () => {
    // Use ref to avoid stale closure issues with keyboard handler
    if (playbackActiveRef.current) {
      pausePlayback();
      return;
    }
    startPlayback();
  };

  const startPlayback = () => {
    setIsPlaying(true);
    playbackActiveRef.current = true;
    loopingRef.current = isLooping;
    const msPerBeat = 60000 / bpm;
    const cellsPerBeat = noteResolution.perQuarter * (timeSignature.noteValue === 4 ? 1 : 0.5);
    const msPerCell = msPerBeat / cellsPerBeat;

    // Start from current position or beginning
    let currentSection = 0;
    let currentMeasure = 0;
    let currentCell = 0;
    let repeatCount = 0;

    // Resume from paused position if available
    if (playbackPosition) {
      const sectionIdx = sections.findIndex(s => s.id === playbackPosition.sectionId);
      if (sectionIdx >= 0) {
        currentSection = sectionIdx;
        currentMeasure = playbackPosition.measureIdx;
        currentCell = playbackPosition.cellIdx;
      }
    }

    const playStep = () => {
      // Check if playback was stopped
      if (!playbackActiveRef.current) {
        return;
      }

      if (currentSection >= sections.length) {
        if (loopingRef.current) {
          // Loop back to beginning
          currentSection = 0;
          currentMeasure = 0;
          currentCell = 0;
          repeatCount = 0;
        } else {
          stopPlayback();
          return;
        }
      }

      const section = sections[currentSection];
      const data = getTabData(section.id, activeInstrument);

      setPlaybackPosition({ sectionId: section.id, measureIdx: currentMeasure, cellIdx: currentCell });

      // Play click track
      if (clickTrack) {
        const cellsPerBeat = Math.round(noteResolution.perQuarter * (timeSignature.noteValue === 4 ? 1 : 0.5));
        if (cellsPerBeat > 0 && currentCell % cellsPerBeat === 0) {
          const isDownbeat = currentCell === 0;
          playClick(isDownbeat);
        }
      }

      // Play notes at current position
      if (data[currentMeasure]) {
        data[currentMeasure].forEach((string, stringIdx) => {
          const value = string[currentCell];
          if (value && value !== '-') {
            if (activeInstrument === 'drums') {
              const drumLine = instrumentConfigs.drums.lines[stringIdx];
              if (value === 'x' || value === 'X' || value === 'o' || value === 'O') {
                playDrumSound(drumLine.id);
              }
            } else {
              const fret = parseInt(value);
              if (!isNaN(fret)) {
                const freq = fretToFrequency(stringIdx, fret, activeInstrument);
                playNote(freq, msPerCell / 1000 * 2, 'sawtooth');
              } else if (value === 'm') {
                const freq = fretToFrequency(stringIdx, 0, activeInstrument);
                playNote(freq, msPerCell / 1000, 'square');
              }
            }
          }
        });
      }

      // Advance position
      currentCell++;
      if (currentCell >= cellsPerMeasure) {
        currentCell = 0;
        currentMeasure++;
        if (currentMeasure >= section.measures) {
          currentMeasure = 0;
          repeatCount++;
          if (repeatCount >= section.repeat) {
            repeatCount = 0;
            currentSection++;
          }
        }
      }

      playbackRef.current = setTimeout(playStep, msPerCell);
    };

    playStep();
  };

  const pausePlayback = () => {
    playbackActiveRef.current = false;
    setIsPlaying(false);
    if (playbackRef.current) {
      clearTimeout(playbackRef.current);
      playbackRef.current = null;
    }
    // Keep playbackPosition so we can resume
  };

  const stopPlayback = () => {
    playbackActiveRef.current = false;
    setIsPlaying(false);
    setPlaybackPosition(null);
    if (playbackRef.current) {
      clearTimeout(playbackRef.current);
      playbackRef.current = null;
    }
  };

  const rewindPlayback = () => {
    const wasPlaying = playbackActiveRef.current;
    if (wasPlaying) {
      pausePlayback();
    }
    setPlaybackPosition(null);
    if (wasPlaying) {
      // Small delay to allow state to update, then restart
      setTimeout(() => startPlayback(), 50);
    }
  };

  // Tap tempo - calculates BPM from tap timing
  const handleTapTempo = () => {
    const now = Date.now();
    const taps = tapTimesRef.current;

    // Reset if more than 2 seconds since last tap
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      tapTimesRef.current = [now];
      return;
    }

    taps.push(now);

    // Keep only last 8 taps
    if (taps.length > 8) {
      taps.shift();
    }

    // Need at least 2 taps to calculate
    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      // Clamp to valid range
      setBpm(Math.max(40, Math.min(300, calculatedBpm)));
    }
  };

  // Export functions
  const exportToJSON = () => {
    const data = {
      projectName,
      bpm,
      timeSignature,
      noteResolution,
      projectKey,
      tunings,
      stringCounts,
      sections,
      tabData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToText = () => {
    let text = `${projectName}\nBPM: ${bpm}\nTime: ${timeSignature.label}\nGrid: ${noteResolution.label}\nKey: ${projectKey}\n\n`;
    
    ['guitar', 'bass', 'drums'].forEach(instrument => {
      const tuningLabel = instrument !== 'drums' 
        ? ` (${tuningConfigs[instrument]?.[stringCounts[instrument]]?.[tunings[instrument]]?.label || 'Standard'} in ${projectKey})`
        : '';
      text += `=== ${instrument.toUpperCase()}${tuningLabel} ===\n\n`;
      
      sections.forEach(section => {
        text += `[${section.name}]${section.repeat > 1 ? ` x${section.repeat}` : ''}\n`;
        if (section.notes) {
          text += `"${section.notes}"\n`;
        }
        const data = getTabData(section.id, instrument);
        
        if (instrument === 'drums') {
          instrumentConfigs.drums.lines.forEach((line, idx) => {
            text += `${line.name}|`;
            data.forEach(measure => {
              text += measure[idx].join('') + '|';
            });
            text += '\n';
          });
        } else {
          const strings = getTuningNotes(instrument, stringCounts[instrument], tunings[instrument], projectKey);
          strings.forEach((string, idx) => {
            text += `${string}|`;
            data.forEach(measure => {
              text += measure[idx].map(c => c.padStart(2, '-')).join('') + '|';
            });
            text += '\n';
          });
        }
        text += '\n';
      });
      text += '\n';
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print formatted tab sheet
  const printTab = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>${projectName}</title>
  <style>
    @page { margin: 0.5in; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.4;
      color: #333;
      max-width: 100%;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #333;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
      font-family: Arial, sans-serif;
    }
    .meta {
      font-size: 12px;
      color: #666;
      font-family: Arial, sans-serif;
    }
    .part {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .part-name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
      font-family: Arial, sans-serif;
      color: #333;
      border-left: 3px solid #666;
      padding-left: 8px;
    }
    .tab-grid {
      white-space: pre;
      font-size: 11px;
      line-height: 1.3;
      background: #fafafa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    .instrument-section {
      margin-bottom: 30px;
    }
    .instrument-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ccc;
      font-family: Arial, sans-serif;
    }
    @media print {
      .tab-grid { background: white; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${projectName}</div>
    <div class="meta">${bpm} BPM • ${timeSignature.label} • Key of ${projectKey}</div>
  </div>
`;

    ['guitar', 'bass', 'drums'].forEach(instrument => {
      const data = sections.map(s => getTabData(s.id, instrument));
      const hasContent = data.some(d => d.some(m => m.some(s => s.some(c => c !== '-'))));
      if (!hasContent) return;

      const tuningLabel = instrument !== 'drums'
        ? ` (${tuningConfigs[instrument]?.[stringCounts[instrument]]?.[tunings[instrument]]?.label || 'Standard'})`
        : '';

      html += `<div class="instrument-section">`;
      html += `<div class="instrument-title">${instrument.charAt(0).toUpperCase() + instrument.slice(1)}${tuningLabel}</div>`;

      sections.forEach(section => {
        const sectionData = getTabData(section.id, instrument);
        const hasNotes = sectionData.some(m => m.some(s => s.some(c => c !== '-')));
        if (!hasNotes) return;

        html += `<div class="part">`;
        html += `<div class="part-name">${section.name}${section.repeat > 1 ? ` (×${section.repeat})` : ''}</div>`;
        if (section.notes) {
          html += `<div style="color: #666; font-style: italic; font-size: 11px; margin-bottom: 6px; font-family: Arial, sans-serif;">${section.notes}</div>`;
        }
        html += `<div class="tab-grid">`;

        if (instrument === 'drums') {
          instrumentConfigs.drums.lines.forEach((line, idx) => {
            let row = line.name.padEnd(3) + '│';
            sectionData.forEach((measure, mIdx) => {
              row += measure[idx].join('');
              row += mIdx < sectionData.length - 1 ? '│' : '│';
            });
            html += row + '\n';
          });
        } else {
          const strings = getTuningNotes(instrument, stringCounts[instrument], tunings[instrument], projectKey);
          strings.forEach((string, idx) => {
            let row = string.padEnd(3) + '│';
            sectionData.forEach((measure, mIdx) => {
              row += measure[idx].map(c => c.padStart(2, '-')).join('');
              row += mIdx < sectionData.length - 1 ? '│' : '│';
            });
            html += row + '\n';
          });
        }

        html += `</div></div>`;
      });

      html += `</div>`;
    });

    html += `</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const importFromJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setProjectName(data.projectName || 'Untitled Project');
        setBpm(data.bpm || DEFAULT_BPM);
        setTimeSignature(data.timeSignature || TIME_SIGNATURES[0]);
        setNoteResolution(data.noteResolution || NOTE_RESOLUTIONS[1]);
        setProjectKey(data.projectKey || 'E');
        setTunings(data.tunings || { guitar: 'standard', bass: 'standard' });
        setStringCounts(data.stringCounts || { guitar: 6, bass: 4 });
        setSections(data.sections || [createSection('Intro')]);
        setTabData(data.tabData || {});
      } catch (err) {
        alert('Failed to load file');
      }
    };
    reader.readAsText(file);
  };

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown]);

  // Styles
  const styles = {
    container: {
      backgroundColor: colors.bg,
      color: colors.text,
      minHeight: '100vh',
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: '12px',
    },
    header: {
      backgroundColor: colors.bgAlt,
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    projectName: {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      borderRadius: '3px',
      color: colors.textBright,
      fontSize: '12px',
      fontWeight: 'bold',
      padding: '5px 10px',
      fontFamily: 'inherit',
    },
    button: {
      backgroundColor: colors.bgHighlight,
      border: `1px solid ${colors.border}`,
      borderRadius: '3px',
      color: colors.text,
      cursor: 'pointer',
      padding: '5px 10px',
      fontSize: '12px',
      fontFamily: 'inherit',
      transition: 'background-color 0.2s',
    },
    buttonPrimary: {
      backgroundColor: colors.accent,
      color: colors.bg,
      borderColor: colors.accent,
    },
    buttonDanger: {
      backgroundColor: colors.red,
      color: colors.textBright,
      borderColor: colors.red,
    },
    toolbar: {
      backgroundColor: colors.bgAlt,
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    },
    toolbarGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    label: {
      color: colors.textMuted,
      fontSize: '11px',
      textTransform: 'lowercase',
    },
    select: {
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '3px',
      color: colors.text,
      padding: '4px 8px',
      fontSize: '12px',
      fontFamily: 'inherit',
      cursor: 'pointer',
    },
    toggleContainer: {
      display: 'flex',
      backgroundColor: colors.bg,
      borderRadius: '3px',
      overflow: 'hidden',
    },
    toggleButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.textMuted,
      cursor: 'pointer',
      padding: '4px 10px',
      fontSize: '12px',
      fontFamily: 'inherit',
      transition: 'all 0.2s',
    },
    toggleButtonActive: {
      backgroundColor: colors.accent,
      color: colors.bg,
    },
    input: {
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '3px',
      color: colors.text,
      padding: '4px 8px',
      fontSize: '12px',
      fontFamily: 'inherit',
      width: '50px',
    },
    tabs: {
      display: 'flex',
      gap: '2px',
    },
    tab: {
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: `2px solid transparent`,
      color: colors.textMuted,
      cursor: 'pointer',
      padding: '6px 12px',
      fontSize: '12px',
      fontFamily: 'inherit',
      transition: 'all 0.2s',
    },
    tabActive: {
      borderBottomColor: colors.accent,
      color: colors.textBright,
    },
    content: {
      padding: '16px',
      overflowX: 'auto',
    },
    section: {
      marginBottom: '20px',
      backgroundColor: colors.bgAlt,
      borderRadius: '3px',
      overflow: 'hidden',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      backgroundColor: colors.bgHighlight,
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    sectionName: {
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.textBright,
      fontSize: '12px',
      fontWeight: 'bold',
      padding: '3px 6px',
      fontFamily: 'inherit',
      borderRadius: '3px',
    },
    sectionNameEditing: {
      backgroundColor: colors.bg,
      border: `1px solid ${colors.accent}`,
    },
    sectionControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    smallInput: {
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '3px',
      color: colors.text,
      padding: '3px 6px',
      fontSize: '11px',
      fontFamily: 'inherit',
      width: '36px',
      textAlign: 'center',
    },
    smallButton: {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      color: colors.textMuted,
      cursor: 'pointer',
      padding: '3px 8px',
      fontSize: '11px',
      borderRadius: '3px',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
    },
    gridContainer: {
      padding: '12px',
      overflowX: 'auto',
    },
    measureContainer: {
      display: 'flex',
      gap: '4px',
    },
    stringLabels: {
      display: 'flex',
      flexDirection: 'column',
      marginRight: '6px',
    },
    stringLabel: {
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '6px',
      color: colors.textMuted,
      fontSize: '11px',
      fontWeight: 'normal',
    },
    measure: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
    measureGrid: {
      borderLeft: `2px solid ${colors.border}`,
      borderRight: `1px solid ${colors.border}`,
    },
    measureNumber: {
      textAlign: 'left',
      paddingLeft: '8px',
      color: colors.textMuted,
      fontSize: '10px',
      marginBottom: '3px',
    },
    row: {
      display: 'flex',
      borderBottom: `1px solid ${colors.border}`,
    },
    cell: {
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      cursor: 'pointer',
      borderRight: `1px solid ${colors.bg}`,
      transition: 'background-color 0.1s',
      userSelect: 'none',
    },
    cellBeat: {
      borderRightColor: colors.border,
    },
    cellSelected: {
      backgroundColor: colors.selection,
      outline: `1px solid ${colors.accent}`,
    },
    cellPlaying: {
      backgroundColor: colors.accent,
      color: colors.bg,
    },
    playbackCursor: {
      position: 'absolute',
      top: '18px',
      width: '2px',
      backgroundColor: colors.accent,
      pointerEvents: 'none',
      zIndex: 10,
      boxShadow: `0 0 8px ${colors.accent}`,
    },
    legend: {
      padding: '12px 20px',
      backgroundColor: colors.bgAlt,
      display: 'flex',
      flexWrap: 'wrap',
      gap: '24px',
    },
    legendToggleBar: {
      padding: '8px 20px',
      backgroundColor: colors.bgAlt,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    legendSection: {
      minWidth: '180px',
    },
    legendSectionTitle: {
      color: colors.textBright,
      fontSize: '11px',
      fontWeight: 'bold',
      marginBottom: '8px',
      paddingBottom: '4px',
    },
    legendGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      color: colors.textMuted,
    },
    legendKey: {
      backgroundColor: colors.bgHighlight,
      padding: '1px 5px',
      borderRadius: '2px',
      fontWeight: 'bold',
      color: colors.textBright,
      minWidth: '24px',
      textAlign: 'center',
    },
    mobileInputOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    mobileInputBox: {
      backgroundColor: colors.bgAlt,
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      padding: '16px',
      width: '100%',
      maxWidth: '320px',
      marginBottom: '20px',
    },
    mobileInputLabel: {
      color: colors.textMuted,
      fontSize: '11px',
      marginBottom: '8px',
    },
    mobileInputField: {
      width: '100%',
      backgroundColor: colors.bg,
      border: `1px solid ${colors.accent}`,
      borderRadius: '3px',
      color: colors.textBright,
      fontSize: '18px',
      padding: '12px',
      fontFamily: 'inherit',
      textAlign: 'center',
      boxSizing: 'border-box',
    },
    mobileInputHint: {
      color: colors.textMuted,
      fontSize: '10px',
      marginTop: '8px',
      textAlign: 'center',
    },
    mobileInputButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
    },
    mobileInputButton: {
      flex: 1,
      backgroundColor: colors.bgHighlight,
      border: `1px solid ${colors.border}`,
      borderRadius: '3px',
      color: colors.text,
      fontSize: '12px',
      padding: '10px',
      fontFamily: 'inherit',
      cursor: 'pointer',
    },
    mobileInputButtonPrimary: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      color: colors.bg,
    },
  };

  const renderGrid = (section) => {
    const data = getTabData(section.id, activeInstrument);
    const stringCount = activeInstrument === 'drums' ? instrumentConfigs.drums.lines.length : stringCounts[activeInstrument];
    const labels = activeInstrument === 'drums' 
      ? instrumentConfigs.drums.lines.map(l => l.name)
      : getTuningNotes(activeInstrument, stringCounts[activeInstrument], tunings[activeInstrument], projectKey);

    return (
      <div style={styles.gridContainer}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={styles.measureContainer}>
            <div style={styles.stringLabels}>
              <div style={{ height: '18px' }}></div>
              {labels.map((label, idx) => (
                <div key={idx} style={styles.stringLabel}>{label}</div>
              ))}
            </div>
          
          {data.map((measure, measureIdx) => {
            const isMeasurePlaying = playbackPosition?.sectionId === section.id &&
                                     playbackPosition?.measureIdx === measureIdx;
            const cursorPosition = isMeasurePlaying ? playbackPosition.cellIdx * 20 + 10 : 0;
            const stringCount = activeInstrument === 'drums' ? instrumentConfigs.drums.lines.length : stringCounts[activeInstrument];

            return (
            <div key={measureIdx} style={styles.measure}>
              <div style={{ ...styles.measureNumber, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Bar {measureIdx + 1}</span>
                <span style={{ display: 'flex', gap: '2px' }}>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: colors.textMuted, display: 'flex', alignItems: 'center' }}
                    onClick={() => copyBar(section.id, measureIdx)}
                    title="Copy bar"
                  >
                    <Icons.Copy size={12} />
                  </button>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0 2px',
                      color: barClipboard ? colors.textMuted : colors.border,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => pasteBar(section.id, measureIdx)}
                    title="Paste bar"
                    disabled={!barClipboard}
                  >
                    <Icons.Clipboard size={12} />
                  </button>
                </span>
              </div>
              <div style={styles.measureGrid}>
                {/* Playback cursor */}
                {isMeasurePlaying && (
                  <div style={{
                    ...styles.playbackCursor,
                    left: `${cursorPosition}px`,
                    height: `${stringCount * 20}px`,
                  }} />
                )}
                {measure.map((string, stringIdx) => (
                <div key={stringIdx} style={styles.row}>
                  {string.map((cell, cellIdx) => {
                    const cellKey = `${section.id}-${measureIdx}-${stringIdx}-${cellIdx}`;
                    const isSelected = selectedCells.includes(cellKey);
                    const isPlaying = playbackPosition?.sectionId === section.id &&
                                     playbackPosition?.measureIdx === measureIdx &&
                                     playbackPosition?.cellIdx === cellIdx;
                    const cellsPerBeat = Math.round(noteResolution.perQuarter * (timeSignature.noteValue === 4 ? 1 : 0.5));
                    const isBeat = cellsPerBeat > 0 && (cellIdx + 1) % cellsPerBeat === 0;

                    return (
                      <div
                        key={cellIdx}
                        className="tab-cell"
                        style={{
                          ...styles.cell,
                          ...(isBeat ? styles.cellBeat : {}),
                          ...(isSelected ? styles.cellSelected : {}),
                          ...(isPlaying ? styles.cellPlaying : {}),
                        }}
                        onMouseDown={(e) => handleMouseDown(section.id, measureIdx, stringIdx, cellIdx, e)}
                        onMouseEnter={() => handleMouseEnter(section.id, measureIdx, stringIdx, cellIdx)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(section.id, measureIdx, stringIdx, cellIdx, e);
                          openMobileKeyboard(section.id, measureIdx, stringIdx, cellIdx);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          openMobileKeyboard(section.id, measureIdx, stringIdx, cellIdx);
                        }}
                      >
                        {cell}
                      </div>
                    );
                  })}
                </div>
              ))}
              </div>
            </div>
            );
          })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '8px', marginTop: '18px' }}>
            <button
              style={{ ...styles.button, padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => updateSection(section.id, { measures: section.measures + 1 })}
              title="Add bar"
            >
              <Icons.Plus size={14} />
            </button>
            <button
              style={{ ...styles.button, padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => handleRemoveBar(section)}
              title="Remove bar"
              disabled={section.measures <= 1}
            >
              <Icons.Minus size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container} onClick={() => setSelectedCells([])} className="app-container">
      <style>{`
        /* Container query setup */
        .app-container {
          container-type: inline-size;
          container-name: app;
        }
        .header-container {
          container-type: inline-size;
          container-name: header;
        }
        .toolbar-container {
          container-type: inline-size;
          container-name: toolbar;
        }
        .section-header-container {
          container-type: inline-size;
          container-name: section-header;
        }

        /* Accessible focus styles */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid ${colors.accent};
          outline-offset: 2px;
        }

        /* Screen reader only class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Button label - visible by default */
        .btn-label {
          display: inline;
        }

        /* Tab cell hover */
        .tab-cell:hover {
          background-color: ${colors.bgHighlight} !important;
        }

        /* Responsive: Hide button labels on small containers */
        @container header (max-width: 700px) {
          .btn-label {
            display: none;
          }
          .header-btn {
            min-width: 44px !important;
            min-height: 44px !important;
            padding: 0 12px !important;
          }
        }

        @container toolbar (max-width: 500px) {
          .toolbar-btn .btn-label {
            display: none;
          }
        }

        @container section-header (max-width: 400px) {
          .section-btn .btn-label {
            display: none;
          }
        }

        /* WCAG 2.2 Touch target sizes for mobile */
        @media (pointer: coarse) {
          button,
          input,
          select,
          [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
          input[type="number"],
          input[type="text"] {
            min-width: 60px;
          }
          select {
            min-width: 80px;
          }
        }

        /* Responsive header layout */
        @container app (max-width: 600px) {
          .header-group {
            width: 100%;
            justify-content: space-between;
          }
          .project-input {
            flex: 1;
            min-width: 100px;
          }
        }
      `}</style>
      {/* Library modal */}
      {showLibrary && (
        <div style={styles.mobileInputOverlay} onClick={() => setShowLibrary(false)}>
          <div style={{
            ...styles.mobileInputBox,
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            marginBottom: 0,
            alignSelf: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: colors.textBright, fontSize: '14px', fontWeight: 'bold' }}>Project Library</span>
              <button style={{ ...styles.button, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowLibrary(false)}><Icons.X size={14} /></button>
            </div>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary, width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={newProject}
            >
              <Icons.Plus size={14} />New Project
            </button>
            {savedProjects.length === 0 ? (
              <div style={{ color: colors.textMuted, textAlign: 'center', padding: '20px' }}>
                No saved projects yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedProjects.map(project => (
                  <div
                    key={project.id}
                    style={{
                      backgroundColor: project.id === currentProjectId ? colors.selection : colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '3px',
                      padding: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{ cursor: 'pointer', flex: 1 }}
                      onClick={() => loadFromLibrary(project)}
                    >
                      <div style={{ color: colors.textBright, fontWeight: 'bold' }}>
                        {project.projectName}
                      </div>
                      <div style={{ color: colors.textMuted, fontSize: '10px' }}>
                        {project.timeSignature?.label || '4/4'} • {project.bpm || 120} BPM • {project.sections?.length || 0} parts
                      </div>
                    </div>
                    <button
                      style={{ ...styles.smallButton, color: colors.red, display: 'flex', alignItems: 'center', gap: '3px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this project?')) {
                          deleteFromLibrary(project.id);
                        }
                      }}
                    >
                      <Icons.Trash size={12} />Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm remove bar modal */}
      {confirmRemoveBar && (
        <div style={styles.mobileInputOverlay} onClick={() => setConfirmRemoveBar(null)}>
          <div style={{
            ...styles.mobileInputBox,
            maxWidth: '350px',
            marginBottom: 0,
            alignSelf: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ color: colors.textBright, fontSize: '14px', marginBottom: '16px' }}>
              The last bar contains notes. Remove it anyway?
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button style={{ ...styles.button, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setConfirmRemoveBar(null)}>
                <Icons.X size={14} />Cancel
              </button>
              <button
                style={{ ...styles.button, backgroundColor: colors.red, display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  const section = sections.find(s => s.id === confirmRemoveBar.sectionId);
                  if (section) {
                    updateSection(section.id, { measures: section.measures - 1 });
                  }
                  setConfirmRemoveBar(null);
                }}
              >
                <Icons.Trash size={14} />Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chord picker modal */}
      {showChordPicker && (
        <div style={styles.mobileInputOverlay} onClick={() => { setShowChordPicker(false); setChordSearch(''); }}>
          <div style={{
            ...styles.mobileInputBox,
            maxWidth: '400px',
            maxHeight: '70vh',
            marginBottom: 0,
            alignSelf: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: colors.textBright, fontSize: '14px', fontWeight: 'bold' }}>Select Chord</span>
              <button style={{ ...styles.button, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setShowChordPicker(false); setChordSearch(''); }}><Icons.X size={14} /></button>
            </div>
            <input
              type="text"
              placeholder="Search chords... (e.g. Am, G, F#m)"
              value={chordSearch}
              onChange={(e) => setChordSearch(e.target.value)}
              style={{
                ...styles.input,
                width: '100%',
                marginBottom: '12px',
              }}
              autoFocus
            />
            {selectedCells.length === 0 && (
              <div style={{ color: colors.orange, fontSize: '12px', marginBottom: '12px' }}>
                Select a cell first to place the chord
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '45vh' }}>
              <div style={{ color: colors.textMuted, fontSize: '11px', marginBottom: '4px' }}>Major</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {KEYS.filter(key => !chordSearch || key.toLowerCase().includes(chordSearch.toLowerCase())).map(key => (
                  <button
                    key={key}
                    style={{ ...styles.button, padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => applyChord(key)}
                    disabled={selectedCells.length === 0}
                  >
                    {key}
                  </button>
                ))}
              </div>
              <div style={{ color: colors.textMuted, fontSize: '11px', marginBottom: '4px' }}>Minor</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {KEYS.filter(key => !chordSearch || `${key}m`.toLowerCase().includes(chordSearch.toLowerCase())).map(key => (
                  <button
                    key={`${key}m`}
                    style={{ ...styles.button, padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => applyChord(`${key}m`)}
                    disabled={selectedCells.length === 0}
                  >
                    {key}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile input overlay */}
      {mobileInputCell && (
        <div style={styles.mobileInputOverlay} onClick={closeMobileInput}>
          <div style={{...styles.mobileInputBox, maxWidth: '350px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.mobileInputLabel}>
              Enter fret: 0-24 or h p / \ b x m ~
            </div>
            <input
              ref={mobileInputRef}
              type="tel"
              inputMode="numeric"
              style={styles.mobileInputField}
              value={getMobileInputValue()}
              onChange={handleMobileInput}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {activeInstrument === 'guitar' && (
              <>
                <div style={{ color: colors.textMuted, fontSize: '11px', marginTop: '12px', marginBottom: '6px' }}>
                  Quick chords
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {['A', 'Am', 'C', 'D', 'Dm', 'E', 'Em', 'G'].map(chord => (
                    <button
                      key={chord}
                      style={{ ...styles.button, padding: '4px 8px', fontSize: '11px' }}
                      onClick={() => applyChord(chord)}
                    >
                      {chord}
                    </button>
                  ))}
                  <button
                    style={{ ...styles.button, padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => setShowChordPicker(true)}
                  >
                    More...
                  </button>
                </div>
              </>
            )}
            <div style={styles.mobileInputButtons}>
              <button
                style={{ ...styles.mobileInputButton, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                onClick={closeMobileInput}
              >
                <Icons.X size={14} />Close
              </button>
              <button
                style={{ ...styles.mobileInputButton, ...styles.mobileInputButtonPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                onClick={() => {
                  const { sectionId, measureIdx, stringIdx, cellIdx } = mobileInputCell;
                  const nextCellIdx = cellIdx + 1;
                  if (nextCellIdx < cellsPerMeasure) {
                    setMobileInputCell({ sectionId, measureIdx, stringIdx, cellIdx: nextCellIdx });
                    setSelectedCells([`${sectionId}-${measureIdx}-${stringIdx}-${nextCellIdx}`]);
                  } else if (measureIdx + 1 < getTabData(sectionId, activeInstrument).length) {
                    setMobileInputCell({ sectionId, measureIdx: measureIdx + 1, stringIdx, cellIdx: 0 });
                    setSelectedCells([`${sectionId}-${measureIdx + 1}-${stringIdx}-0`]);
                  }
                  if (mobileInputRef.current) {
                    mobileInputRef.current.focus();
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <div style={styles.mobileInputOverlay} onClick={() => setShowShortcuts(false)}>
          <div style={{
            ...styles.mobileInputBox,
            maxWidth: '450px',
            maxHeight: '80vh',
            overflow: 'auto',
            marginBottom: 0,
            alignSelf: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: colors.textBright, fontSize: '14px', fontWeight: 'bold' }}>Keyboard Shortcuts</span>
              <button style={{ ...styles.button, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowShortcuts(false)}><Icons.X size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ color: colors.accent, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Playback</div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', fontSize: '12px' }}>
                  <span style={{ color: colors.textMuted }}>Space</span><span style={{ color: colors.text }}>Play / Pause</span>
                </div>
              </div>
              <div>
                <div style={{ color: colors.accent, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Editing</div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', fontSize: '12px' }}>
                  <span style={{ color: colors.textMuted }}>0-9</span><span style={{ color: colors.text }}>Enter fret number</span>
                  <span style={{ color: colors.textMuted }}>Arrow keys</span><span style={{ color: colors.text }}>Navigate cells</span>
                  <span style={{ color: colors.textMuted }}>Delete / ⌫</span><span style={{ color: colors.text }}>Clear selected cells</span>
                  <span style={{ color: colors.textMuted }}>Ctrl+Z</span><span style={{ color: colors.text }}>Undo</span>
                  <span style={{ color: colors.textMuted }}>Ctrl+Shift+Z</span><span style={{ color: colors.text }}>Redo</span>
                  <span style={{ color: colors.textMuted }}>Ctrl+C</span><span style={{ color: colors.text }}>Copy selection</span>
                  <span style={{ color: colors.textMuted }}>Ctrl+V</span><span style={{ color: colors.text }}>Paste</span>
                </div>
              </div>
              <div>
                <div style={{ color: colors.accent, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Special Notes</div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', fontSize: '12px' }}>
                  <span style={{ color: colors.textMuted }}>h</span><span style={{ color: colors.text }}>Hammer-on</span>
                  <span style={{ color: colors.textMuted }}>p</span><span style={{ color: colors.text }}>Pull-off</span>
                  <span style={{ color: colors.textMuted }}>b</span><span style={{ color: colors.text }}>Bend</span>
                  <span style={{ color: colors.textMuted }}>r</span><span style={{ color: colors.text }}>Release</span>
                  <span style={{ color: colors.textMuted }}>s</span><span style={{ color: colors.text }}>Slide</span>
                  <span style={{ color: colors.textMuted }}>m</span><span style={{ color: colors.text }}>Muted note</span>
                  <span style={{ color: colors.textMuted }}>x</span><span style={{ color: colors.text }}>Dead note / Ghost note</span>
                </div>
              </div>
              <div>
                <div style={{ color: colors.accent, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Other</div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', fontSize: '12px' }}>
                  <span style={{ color: colors.textMuted }}>?</span><span style={{ color: colors.text }}>Show this help</span>
                  <span style={{ color: colors.textMuted }}>Escape</span><span style={{ color: colors.text }}>Close dialogs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Header - Dieter Rams inspired */}
      <div style={{...styles.header, ...(focusMode ? { padding: '8px 20px' } : {})}} className="header-container" role="toolbar" aria-label="Main toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="header-group">
          {focusMode ? (
            <span style={{ color: colors.textBright, fontSize: '12px', fontWeight: 'bold' }}>{projectName}</span>
          ) : (
            <>
              <button className="header-btn" style={{ ...styles.button, height: '28px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setShowLibrary(true)} aria-label="Open project library"><Icons.FolderOpen size={16} /><span className="btn-label">Library</span></button>
              <input
                className="project-input"
                style={{ ...styles.projectName, height: '28px' }}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                aria-label="Project name"
              />
              <button
                className="header-btn"
                style={{ ...styles.button, ...styles.buttonPrimary, height: '28px', opacity: (currentProjectId && !hasUnsavedChanges) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={saveToLibrary}
                disabled={currentProjectId && !hasUnsavedChanges}
                aria-label="Save to library"
              >
                <Icons.Save size={16} /><span className="btn-label">Save</span>
              </button>
              <button className="header-btn" style={{ ...styles.button, height: '28px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={exportToText} aria-label="Export as text file"><Icons.Download size={16} /><span className="btn-label">Export</span></button>
              <button className="header-btn" style={{ ...styles.button, height: '28px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={printTab} aria-label="Print tab"><Icons.Printer size={16} /><span className="btn-label">Print</span></button>
            </>
          )}
        </div>

        {!focusMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} role="group" aria-label="Playback controls">
            {/* Compact Transport + Click + Tap */}
            <button
              className="header-btn"
              style={{ ...styles.button, height: '28px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={togglePlayback}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              aria-pressed={isPlaying}
            >
              {isPlaying ? <Icons.Pause size={16} /> : <Icons.Play size={16} />}
            </button>
            <button
              className="header-btn"
              style={{ ...styles.button, height: '28px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={stopPlayback}
              aria-label="Stop"
            >
              <Icons.Square size={16} />
            </button>
            <button
              className="header-btn"
              style={{
                ...styles.button,
                height: '28px',
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(isLooping ? styles.buttonPrimary : {})
              }}
              onClick={() => setIsLooping(!isLooping)}
              aria-label="Loop"
              aria-pressed={isLooping}
            >
              <Icons.Repeat size={16} />
            </button>
            <button
              className="header-btn"
              style={{
                ...styles.button,
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(clickTrack ? styles.buttonPrimary : {}),
              }}
              onClick={() => setClickTrack(!clickTrack)}
              aria-label="Metronome"
              aria-pressed={clickTrack}
            >
              <Icons.Volume2 size={16} />
            </button>
            <button
              className="header-btn"
              style={{ ...styles.button, height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleTapTempo}
              aria-label="Tap to set tempo"
            >
              <Icons.Hand size={16} />
            </button>

            {/* BPM */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <label htmlFor="bpm-input" className="sr-only">Tempo in BPM</label>
              <input
                id="bpm-input"
                type="number"
                style={{ ...styles.input, width: '55px', height: '28px', textAlign: 'center' }}
                value={bpm}
                onChange={(e) => setBpm(Math.max(40, Math.min(300, parseInt(e.target.value) || 120)))}
                min="40"
                max="300"
                aria-label="Tempo (40-300 BPM)"
              />
              <span style={{ color: colors.textMuted, fontSize: '11px', textTransform: 'uppercase' }} aria-hidden="true">bpm</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="header-group">
          <button
            className="header-btn"
            style={{ ...styles.button, height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(showSettings ? styles.buttonPrimary : {}) }}
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Toggle advanced settings"
            aria-expanded={showSettings}
            aria-pressed={showSettings}
          >
            <Icons.Settings size={16} />
          </button>
          <button
            className="header-btn"
            style={{ ...styles.button, height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(theme === 'dark' ? {} : styles.buttonPrimary) }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Icons.Moon size={16} /> : <Icons.Sun size={16} />}
          </button>
          <button
            className="header-btn"
            style={{ ...styles.button, height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(focusMode ? styles.buttonPrimary : {}) }}
            onClick={() => setFocusMode(!focusMode)}
            aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
            aria-pressed={focusMode}
          >
            {focusMode ? <Icons.Minimize size={16} /> : <Icons.Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {!focusMode && showSettings && (
        <div
          className="toolbar-container"
          style={{
            backgroundColor: colors.bg,
            padding: '12px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'flex-start',
          }}
          role="group"
          aria-label="Project settings"
        >
          {/* Instrument Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="instrument-select" style={{ ...styles.label, textTransform: 'uppercase' }}>Instrument</label>
            <select
              id="instrument-select"
              style={styles.select}
              value={activeInstrument}
              onChange={(e) => setActiveInstrument(e.target.value)}
            >
              <option value="guitar">Guitar</option>
              <option value="bass">Bass</option>
              <option value="drums">Drums</option>
            </select>
          </div>

          {/* Strings */}
          {activeInstrument !== 'drums' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="strings-select" style={{ ...styles.label, textTransform: 'uppercase' }}>Strings</label>
              <select
                id="strings-select"
                style={styles.select}
                value={stringCounts[activeInstrument]}
                onChange={(e) => setStringCounts({ ...stringCounts, [activeInstrument]: parseInt(e.target.value) })}
              >
                {Object.keys(tuningConfigs[activeInstrument]).map(count => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tuning - Radio Buttons */}
          {activeInstrument !== 'drums' && (
            <fieldset style={{ display: 'flex', flexDirection: 'column', gap: '4px', border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ ...styles.label, textTransform: 'uppercase', padding: 0 }}>Tuning</legend>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }} role="radiogroup">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: colors.text, fontSize: '12px' }}>
                  <input
                    type="radio"
                    name={`tuning-${activeInstrument}`}
                    checked={tunings[activeInstrument] === 'standard'}
                    onChange={() => setTunings({ ...tunings, [activeInstrument]: 'standard' })}
                  />
                  Standard
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: colors.text, fontSize: '12px' }}>
                  <input
                    type="radio"
                    name={`tuning-${activeInstrument}`}
                    checked={tunings[activeInstrument] === 'drop'}
                    onChange={() => setTunings({ ...tunings, [activeInstrument]: 'drop' })}
                  />
                  Drop
                </label>
              </div>
            </fieldset>
          )}

          {/* Key */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="key-select" style={{ ...styles.label, textTransform: 'uppercase' }}>Key</label>
            <select
              id="key-select"
              style={styles.select}
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
            >
              {KEYS.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          {/* Time Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="time-select" style={{ ...styles.label, textTransform: 'uppercase' }}>Time</label>
            <select
              id="time-select"
              style={styles.select}
              value={timeSignature.label}
              onChange={(e) => {
                const newTimeSig = TIME_SIGNATURES.find(t => t.label === e.target.value);
                if (newTimeSig) setTimeSignature(newTimeSig);
              }}
            >
              {TIME_SIGNATURES.map(ts => (
                <option key={ts.label} value={ts.label}>{ts.label}</option>
              ))}
            </select>
          </div>

          {/* Grid Resolution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="grid-select" style={{ ...styles.label, textTransform: 'uppercase' }}>Grid</label>
            <select
              id="grid-select"
              style={styles.select}
              value={noteResolution.label}
              onChange={(e) => {
                const newRes = NOTE_RESOLUTIONS.find(r => r.label === e.target.value);
                if (newRes) setNoteResolution(newRes);
              }}
            >
              {NOTE_RESOLUTIONS.map(res => (
                <option key={res.label} value={res.label}>{res.label}</option>
              ))}
            </select>
          </div>

          {/* Power Chord - Checkbox */}
          {activeInstrument !== 'drums' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ ...styles.label, textTransform: 'uppercase' }} aria-hidden="true">&nbsp;</span>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                color: colors.text,
                fontSize: '12px',
              }}>
                <input
                  type="checkbox"
                  checked={powerChordMode}
                  onChange={() => setPowerChordMode(!powerChordMode)}
                  aria-describedby="power-chord-desc"
                />
                <span>Power Chord</span>
                <span id="power-chord-desc" className="sr-only">Auto-fill power chords with root, 5th, and octave</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {sections.map((section, idx) => (
          <div key={section.id} style={{
            ...styles.section,
            borderLeft: section.color ? `4px solid ${section.color}` : undefined,
          }} role="region" aria-label={`Section: ${section.name}`}>
            <div
              className="section-header-container"
              style={{
                ...styles.sectionHeader,
                backgroundColor: section.color ? `${section.color}15` : undefined,
              }}
            >
              <div style={styles.sectionTitle}>
                {section.color && (
                  <span style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: section.color,
                    marginRight: '8px',
                    flexShrink: 0,
                  }} aria-hidden="true" />
                )}
                {editingSection === section.id ? (
                  <input
                    style={{ ...styles.sectionName, ...styles.sectionNameEditing }}
                    value={editingSectionName}
                    onChange={(e) => setEditingSectionName(e.target.value)}
                    onBlur={() => {
                      updateSection(section.id, { name: editingSectionName });
                      setEditingSection(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateSection(section.id, { name: editingSectionName });
                        setEditingSection(null);
                      }
                    }}
                    aria-label="Section name"
                    autoFocus
                  />
                ) : (
                  <span
                    style={styles.sectionName}
                    onDoubleClick={() => {
                      if (!focusMode) {
                        setEditingSection(section.id);
                        setEditingSectionName(section.name);
                      }
                    }}
                    role="button"
                    tabIndex={focusMode ? -1 : 0}
                    onKeyDown={(e) => {
                      if (!focusMode && (e.key === 'Enter' || e.key === ' ')) {
                        setEditingSection(section.id);
                        setEditingSectionName(section.name);
                      }
                    }}
                    aria-label={`Section name: ${section.name}. Double-click to edit.`}
                  >
                    {section.name}
                  </span>
                )}
                <span style={{ color: colors.textMuted, fontSize: '12px' }} aria-label={section.repeat > 1 ? `Repeat ${section.repeat} times` : undefined}>
                  {section.repeat > 1 && `×${section.repeat}`}
                </span>
                {/* Notes/Lyrics field */}
                <input
                  style={{
                    ...styles.sectionName,
                    color: colors.textMuted,
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                    fontSize: '11px',
                    marginLeft: '12px',
                    minWidth: '150px',
                    flex: 1,
                  }}
                  value={section.notes || ''}
                  onChange={(e) => updateSection(section.id, { notes: e.target.value })}
                  placeholder="lyrics / notes..."
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Lyrics or notes for ${section.name}`}
                />
              </div>

              {!focusMode && (
              <div style={styles.sectionControls}>
                <label htmlFor={`bars-${section.id}`} style={styles.label}>Bars</label>
                <input
                  id={`bars-${section.id}`}
                  type="number"
                  style={styles.smallInput}
                  value={section.measures}
                  onChange={(e) => updateSection(section.id, { measures: Math.max(1, parseInt(e.target.value) || 1) })}
                  min="1"
                />

                <label htmlFor={`repeat-${section.id}`} style={{ ...styles.label, marginLeft: '8px' }}>Repeat</label>
                <input
                  id={`repeat-${section.id}`}
                  type="number"
                  style={styles.smallInput}
                  value={section.repeat}
                  onChange={(e) => updateSection(section.id, { repeat: Math.max(1, parseInt(e.target.value) || 1) })}
                  min="1"
                />

                <label htmlFor={`color-${section.id}`} style={{ ...styles.label, marginLeft: '8px' }}>Color</label>
                <select
                  id={`color-${section.id}`}
                  style={{ ...styles.select, width: 'auto', padding: '2px 4px' }}
                  value={section.color || ''}
                  onChange={(e) => updateSection(section.id, { color: e.target.value || null })}
                  title="Section color"
                >
                  {SECTION_COLORS.map(c => (
                    <option key={c.name} value={c.value || ''}>{c.name}</option>
                  ))}
                </select>

                <button
                  className="section-btn"
                  style={{ ...styles.smallButton, display: 'flex', alignItems: 'center', gap: '3px' }}
                  onClick={() => duplicateSection(section.id)}
                  aria-label={`Duplicate section ${section.name}`}
                >
                  <Icons.Copy size={12} /><span className="btn-label">Duplicate</span>
                </button>

                {sections.length > 1 && (
                  <button
                    className="section-btn"
                    style={{ ...styles.smallButton, color: colors.red, display: 'flex', alignItems: 'center', gap: '3px' }}
                    onClick={() => deleteSection(section.id)}
                    aria-label={`Delete section ${section.name}`}
                  >
                    <Icons.Trash size={12} /><span className="btn-label">Delete</span>
                  </button>
                )}
              </div>
              )}
            </div>

            {renderGrid(section)}
          </div>
        ))}

        {/* Add Part Button - at bottom of content area */}
        {!focusMode && (
          <button
            style={{
              ...styles.button,
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              opacity: 0.6,
              minHeight: '44px',
              border: `1px dashed ${colors.border}`,
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onClick={addSection}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.6'}
            aria-label="Add a new part"
          >
            <Icons.Plus size={16} /><span className="btn-label">Add Part</span>
          </button>
        )}
      </div>

      {/* Legend Toggle & Panel */}
      <div style={styles.legendToggleBar}>
        <button
          style={{ ...styles.button, display: 'flex', alignItems: 'center', gap: '6px', minHeight: '44px' }}
          onClick={() => setShowLegend(!showLegend)}
          aria-expanded={showLegend}
          aria-label={showLegend ? 'Hide notation legend' : 'Show notation legend'}
        >
          <Icons.HelpCircle size={16} /><span>{showLegend ? 'Hide legend' : 'Show legend'}</span>
        </button>
        {!showLegend && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', color: colors.textMuted, fontSize: '11px' }}>
            <span>Ctrl+C copy</span>
            <span>Ctrl+V paste</span>
            <span>Del clear</span>
            <span>Arrows navigate</span>
          </div>
        )}
      </div>
      {showLegend && (
      <div style={styles.legend}>
        <div style={styles.legendSection}>
          <div style={styles.legendSectionTitle}>Guitar and bass</div>
          <div style={styles.legendGrid}>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>0-24</span>
              <span>Fret number</span>
            </div>
            {Object.entries(techniques).map(([key, desc]) => (
              <div key={key} style={styles.legendItem}>
                <span style={styles.legendKey}>{key}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={styles.legendSection}>
          <div style={styles.legendSectionTitle}>Drums</div>
          <div style={styles.legendGrid}>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>x / X</span>
              <span>Hit</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>o / O</span>
              <span>Accent hit</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>f</span>
              <span>Flam</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>g</span>
              <span>Ghost note</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>d</span>
              <span>Double stroke</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>b</span>
              <span>Buzz roll</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>r</span>
              <span>Rim shot</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>-</span>
              <span>Rest</span>
            </div>
          </div>
        </div>
        
        <div style={styles.legendSection}>
          <div style={styles.legendSectionTitle}>Drum kit lines</div>
          <div style={styles.legendGrid}>
            {instrumentConfigs.drums.lines.map(line => (
              <div key={line.id} style={styles.legendItem}>
                <span style={styles.legendKey}>{line.name}</span>
                <span>{line.fullName}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={styles.legendSection}>
          <div style={styles.legendSectionTitle}>Keyboard shortcuts</div>
          <div style={styles.legendGrid}>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>Ctrl+Z</span>
              <span>Undo</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>Ctrl+Y</span>
              <span>Redo</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>Ctrl+C</span>
              <span>Copy selection</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>Ctrl+V</span>
              <span>Paste</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>Delete</span>
              <span>Clear selection</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>Arrows</span>
              <span>Navigate cells</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>Shift+click</span>
              <span>Extend selection</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.legendKey}>Drag</span>
              <span>Select range</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(<TabApp />);
