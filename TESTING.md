# Heavy Tabs — User Stories

## Cell Input

### US-1: Enter fret numbers on guitar/bass
**As a** guitarist creating tablature,
**I want to** click a cell and type a number,
**So that** I can enter fret values on each string.

**Given** a cell is selected on a guitar tab
**When** I press 0-9
**Then** the fret number appears in the cell

---

### US-2: Enter technique characters
**As a** guitarist notating techniques,
**I want to** type h, p, b, /, \ and other characters,
**So that** I can mark hammer-ons, pull-offs, bends, and slides.

**Given** a cell is selected on a guitar/bass tab
**When** I press h, p, b, /, \, x, m, or ~
**Then** the technique character appears in the cell

---

### US-3: Enter drum notation
**As a** drummer creating drum tabs,
**I want to** type x, o, f, g on drum lines,
**So that** I can notate hits, accents, flams, and ghost notes.

**Given** the instrument is set to drums and a cell is selected
**When** I press x, o, X, O, f, g, d, b, or r
**Then** the drum notation character appears in the cell

---

### US-4: Power chord auto-fill
**As a** guitarist entering power chords,
**I want** the 5th and octave to auto-fill on adjacent strings,
**So that** I don't have to enter each note of the chord manually.

**Given** power chord mode is enabled and a cell is selected
**When** I enter a fret number (e.g., 5)
**Then** the 5th (fret + 2) fills one string above, and the octave fills two strings above

---

### US-5: Power chord with drop tuning
**As a** guitarist in drop tuning,
**I want** power chords on the lowest string to use the same fret,
**So that** the voicing is correct for drop tuning.

**Given** power chord mode is on and tuning is "drop" with root on the lowest string
**When** I enter a fret number
**Then** the 5th and octave use the same fret number (not fret + 2)

---

### US-6: Toggle power chord mode
**As a** user who sometimes wants single-note input,
**I want to** toggle power chord mode on and off,
**So that** I can switch between chord and single-note entry.

**Given** the chord toolbar is visible
**When** I click the Power Chord checkbox
**Then** the mode toggles and the checkbox icon updates (checked/unchecked)

---

### US-7: Apply chord from picker
**As a** guitarist who doesn't know chord shapes,
**I want to** select a chord from a picker,
**So that** the correct fret pattern fills across all strings.

**Given** a cell is selected on a 6-string guitar tab
**When** I open the chord picker and select "A" major
**Then** the A major chord shape (0, 2, 2, 2, 0, x) fills the column at that position

---

### US-8: Search chords in picker
**As a** user looking for a specific chord,
**I want to** search by chord name,
**So that** I can find it quickly without scrolling.

**Given** the chord picker modal is open
**When** I type "G" into the search input
**Then** only chords containing "G" are shown in both major and minor sections

---

### US-9: Chord picker requires selection
**As a** user who forgot to select a cell,
**I want** chord buttons to be disabled when nothing is selected,
**So that** I don't accidentally apply a chord to nowhere.

**Given** the chord picker is open with no cell selected
**When** I view the chord buttons
**Then** all buttons are disabled

---

### US-10: Close chord picker
**As a** user done with the chord picker,
**I want** multiple ways to close it,
**So that** I can dismiss it quickly.

**Given** the chord picker modal is open
**When** I click the X button, click the overlay background, or apply a chord
**Then** the modal closes and the search input is cleared

---

### US-11: Keyboard input blocked in text fields
**As a** user typing a project name or lyrics,
**I want** cell input shortcuts to be ignored,
**So that** typing "h" in a text field doesn't enter a hammer-on.

**Given** focus is on an input, textarea, or select element
**When** I press any character key
**Then** the keystroke goes to the text field, not the tab grid

---

## Selection & Navigation

### US-12: Click selects full column
**As a** user editing tabs,
**I want** clicking a cell to select the entire column (all strings),
**So that** I can see the full vertical position I'm editing.

**Given** a bar grid with 6 strings
**When** I click any cell
**Then** all 6 cells in that column are highlighted

---

### US-13: Arrow key navigation within a bar
**As a** user entering notes quickly,
**I want to** navigate between cells with arrow keys,
**So that** I don't need to click each cell.

**Given** a cell is selected
**When** I press Arrow Left/Right
**Then** the selection moves to the adjacent cell within the same beat

**When** I press Arrow Up/Down
**Then** the selection moves to the adjacent string

---

### US-14: Arrow key navigation wraps across beats
**As a** user navigating through a bar,
**I want** left/right arrows to wrap across beat boundaries,
**So that** I can move seamlessly through the entire bar.

**Given** the cursor is on the last cell of beat 1
**When** I press Arrow Right
**Then** the selection moves to the first cell of beat 2

---

### US-15: Arrow key navigation wraps across bars
**As a** user navigating through a part,
**I want** left/right arrows to wrap across bar boundaries,
**So that** I can move between bars without clicking.

**Given** the cursor is on the last cell of the last beat of bar 1
**When** I press Arrow Right
**Then** the selection moves to the first cell of bar 2

---

### US-16: Arrow key stops at boundaries
**As a** user at the edge of the grid,
**I want** navigation to stop rather than crash,
**So that** pressing arrow at the boundary does nothing harmful.

**Given** the cursor is on the first cell of the first bar
**When** I press Arrow Left
**Then** the selection stays at the current position

---

### US-17: Drag to select range of columns
**As a** user selecting a section of the tab,
**I want to** click and drag across multiple columns,
**So that** I can select a range for copy/delete operations.

**Given** a bar grid
**When** I mousedown on one cell and drag to another
**Then** all columns between start and end are highlighted

---

### US-18: Drag selection prevents text selection
**As a** user dragging across cells,
**I want** browser text selection to be suppressed,
**So that** I don't accidentally highlight page text while selecting cells.

**Given** I am dragging across cells
**When** the mouse moves
**Then** no browser text selection occurs (user-select: none)

---

### US-19: Mouseup ends drag selection
**As a** user finishing a drag,
**I want** the selection to finalize when I release the mouse,
**So that** I can then operate on the selected range.

**Given** I am mid-drag across cells
**When** I release the mouse button (anywhere on the page)
**Then** the drag ends and the selection is preserved

---

### US-20: Click away clears selection
**As a** user done editing,
**I want** clicking the background to deselect everything,
**So that** I have a clean state.

**Given** cells are selected
**When** I click the container background (not a cell)
**Then** the selection is cleared

---

### US-21: Delete clears all selected columns
**As a** user correcting mistakes,
**I want** Delete/Backspace to clear all selected columns,
**So that** I can quickly erase notes.

**Given** one or more columns are selected
**When** I press Delete or Backspace
**Then** all cells in the selected columns are reset to "-"

---

### US-22: Copy column values
**As a** user repeating patterns,
**I want to** copy a column's values,
**So that** I can paste them elsewhere.

**Given** a column is selected with notes (e.g., "3", "5", "5", "-", "-", "-")
**When** I press Ctrl+C (or Cmd+C)
**Then** all row values at that column are stored in the clipboard

---

### US-23: Paste column values
**As a** user applying copied patterns,
**I want to** paste previously copied values at the current position,
**So that** I can reuse note patterns without retyping.

**Given** the clipboard has values and a column is selected
**When** I press Ctrl+V (or Cmd+V)
**Then** the clipboard values are written to all rows at the current column

---

### US-24: Cell hover shows pointer cursor
**As a** user scanning the grid,
**I want** cells to show a pointer cursor on hover,
**So that** I know they are clickable.

**Given** the mouse is over a cell
**When** I hover
**Then** the cursor changes to pointer and the cell background subtly highlights

---

### US-25: Cell visual states
**As a** user,
**I want** cells to show distinct visual states,
**So that** I can distinguish between empty, filled, selected, and playing cells.

**Given** cells in the grid
**Then** empty cells ("-") show muted text color
**And** cells with values show bright text color
**And** selected cells show a selection background color
**And** the currently playing cell shows an accent background color

---

## Undo & Redo

### US-26: Undo last change
**As a** user making mistakes,
**I want to** undo the last change,
**So that** I can revert accidental edits.

**Given** I have entered notes or made changes
**When** I press Ctrl+Z (or Cmd+Z)
**Then** the last change is undone and the grid reverts

---

### US-27: Redo undone change
**As a** user who undid too much,
**I want to** redo a change,
**So that** I can restore what I accidentally undid.

**Given** I have undone a change
**When** I press Ctrl+Shift+Z (or Ctrl+Y or Cmd+Shift+Z)
**Then** the undone change is restored

---

### US-28: Undo works without cell selection
**As a** user who clicked away after making changes,
**I want** undo/redo to work even without a cell selected,
**So that** I don't have to select a cell just to undo.

**Given** no cell is selected
**When** I press Ctrl+Z
**Then** the last change is still undone

---

### US-29: Undo history capped at 200 entries
**As a** user making many edits,
**I want** the undo history to not consume unlimited memory,
**So that** performance stays stable over long editing sessions.

**Given** more than 200 edits have been made
**When** I undo
**Then** I can undo up to the last 200 changes

---

### US-30: Undo history resets on project load
**As a** user switching between projects,
**I want** undo history to reset when loading a new project,
**So that** I don't undo into a previous project's state.

**Given** I have made edits to project A
**When** I load project B from the library
**Then** pressing Ctrl+Z does not revert to project A's state

---

### US-31: Undo history resets on new project
**As a** user starting fresh,
**I want** undo history to reset when creating a new project,
**So that** I have a clean undo stack.

**Given** I have made edits
**When** I create a new project from the library
**Then** undo history is cleared

---

### US-32: All mutations push undo history
**As a** user,
**I want** every destructive action to be undoable,
**So that** nothing is permanently lost until I save.

**Given** any of these actions: cell input, delete, paste, apply chord, add/remove/copy bar, duplicate part, add part
**When** the action is performed
**Then** a snapshot is pushed to the undo history before the change

---

## Parts & Bars

### US-33: Add a new part
**As a** user structuring a song,
**I want to** add parts (Intro, Verse, Chorus, etc.),
**So that** I can organize different sections of the tab.

**Given** the editor with at least one part
**When** I click "Add part"
**Then** a new empty part appears below with one empty bar titled "BAR 1"

---

### US-34: Edit part title
**As a** user naming sections,
**I want to** type a title for each part,
**So that** I can label them (Intro, Verse, Chorus, etc.).

**Given** a part with a title input
**When** I click the title input and type "Chorus"
**Then** the part title updates to "Chorus"

---

### US-35: Edit part lyrics/notes
**As a** user adding lyrics,
**I want to** type lyrics or notes for each part,
**So that** I can pair words with the tab notation.

**Given** a part with a lyrics input
**When** I click the lyrics input and type
**Then** the lyrics text updates

---

### US-36: Duplicate a part
**As a** user with a repeating section,
**I want to** duplicate an existing part,
**So that** I can reuse it with modifications.

**Given** a part with notes
**When** I click the duplicate button (CopyPlus icon)
**Then** a deep copy of the part (with all bar data) appears below with "(copy)" in the title

---

### US-37: Add empty bar to a part
**As a** user extending a section,
**I want to** add more bars,
**So that** the section can hold more measures.

**Given** a part with bars
**When** I click the + button
**Then** a new empty bar is appended with an auto-numbered title (e.g., "BAR 3")

---

### US-38: Remove last bar from a part
**As a** user shortening a section,
**I want to** remove the last bar,
**So that** I can trim unused measures.

**Given** a part with more than one bar
**When** I click the - button
**Then** the last bar is removed

---

### US-39: Minimum one bar per part
**As a** user who might accidentally remove all bars,
**I want** at least one bar to always remain,
**So that** I can't end up with an empty part.

**Given** a part with exactly one bar
**When** I click the - button
**Then** nothing happens — the bar remains

---

### US-40: Copy last bar
**As a** user repeating a measure,
**I want to** copy the last bar,
**So that** I can duplicate a pattern without re-entering it.

**Given** a part with bars containing notes
**When** I click the copy bar button (CopyPlus)
**Then** a deep copy of the last bar is appended

---

### US-41: Bar title labels
**As a** user tracking bar positions,
**I want** each bar to show a numbered label,
**So that** I can reference specific bars (BAR 1, BAR 2, etc.).

**Given** a part with multiple bars
**When** I view the grid
**Then** each bar shows a title like "BAR 1", "BAR 2", etc.

---

### US-42: String labels column
**As a** user reading the tab,
**I want** string/line labels on the left side,
**So that** I know which string or drum each row represents.

**Given** a guitar part with standard tuning
**When** I view the grid
**Then** the leftmost column shows E, B, G, D, A, E (or drum line abbreviations for drums)

---

## Playback

### US-43: Play/pause toggle
**As a** user reviewing my tab,
**I want to** play and pause audio playback,
**So that** I can hear what I've written.

**Given** a tab with notes
**When** I click Play or press Space
**Then** playback starts and the button icon changes to Pause

**When** I click Pause or press Space during playback
**Then** playback pauses at the current position and the icon changes back to Play

---

### US-44: Stop playback
**As a** user who wants to restart from the beginning,
**I want** a stop button,
**So that** I can reset the playback position.

**Given** playback is active or paused at a position
**When** I click Stop
**Then** playback stops and the position resets to null

---

### US-45: Playback position highlighting
**As a** user following along with playback,
**I want** the currently playing cell to be highlighted,
**So that** I can see where the playback cursor is.

**Given** playback is active
**When** a cell is being played
**Then** that cell shows a distinct "playing" background color

---

### US-46: Loop mode toggle
**As a** user practicing a section,
**I want to** toggle loop mode,
**So that** playback automatically restarts.

**Given** loop mode is off
**When** I click the loop (Repeat) button
**Then** loop mode is enabled and the button shows a selected/active visual state

**Given** loop mode is on and playback reaches the end
**When** the last cell finishes playing
**Then** playback restarts from the beginning

---

### US-47: Click track toggle
**As a** user who needs a metronome,
**I want to** toggle a click track,
**So that** I can keep time during playback.

**Given** click track is off
**When** I click the volume (Volume2) button
**Then** click track is enabled and the button shows a selected/active visual state

**Given** click track is on during playback
**When** each beat plays
**Then** a metronome click sounds (higher pitch 1000Hz on downbeat, 800Hz on other beats)

---

### US-48: Space bar play/pause without selection
**As a** user who hasn't selected a cell,
**I want** Space to still toggle playback,
**So that** I can control playback without interacting with the grid.

**Given** no cell is selected
**When** I press Space (not in an input/textarea/select)
**Then** playback toggles

---

### US-49: Playback uses BPM for timing
**As a** user who set a specific tempo,
**I want** playback speed to match my BPM,
**So that** the tab plays at the correct speed.

**Given** BPM is set to 140
**When** playback starts
**Then** the timing between cells reflects 140 BPM relative to the time signature and note resolution

---

### US-50: Guitar/bass note synthesis
**As a** user playing back a guitar tab,
**I want** notes to sound at the correct pitch,
**So that** I can hear the actual melody.

**Given** a cell contains a fret number (e.g., 5 on the A string)
**When** that cell plays
**Then** a synthesized note sounds at the correct frequency for that string and fret

---

### US-51: Drum sound synthesis
**As a** user playing back a drum tab,
**I want** drum hits to sound distinct by drum piece,
**So that** I can hear the rhythm pattern.

**Given** a cell contains a drum notation (e.g., "x" on the snare line)
**When** that cell plays
**Then** a synthesized drum sound plays at the frequency for that drum piece

---

### US-52: Playback stops on component unmount
**As a** user navigating away from the editor,
**I want** playback to stop automatically,
**So that** audio doesn't keep playing on other pages.

**Given** playback is active
**When** I navigate away or the component unmounts
**Then** playback stops and the timeout is cleared

---

## Project Management

### US-53: Save project to localStorage
**As a** user who wants to keep my work,
**I want** the save button to persist my project,
**So that** it's available when I return.

**Given** a tab with a name and notes
**When** I click the Save button
**Then** the project is saved to localStorage under `tabEditorProjects`

---

### US-54: Save syncs to cloud when authenticated
**As an** authenticated user,
**I want** saves to also sync to Supabase,
**So that** my projects are backed up and accessible on other devices.

**Given** I am signed in
**When** I click Save
**Then** the project saves to both localStorage and Supabase

---

### US-55: Auto-save after inactivity (old editor)
**As a** user who forgets to save,
**I want** the editor to auto-save after 5 seconds of inactivity,
**So that** I don't lose work.

**Given** I have made changes and stopped editing
**When** 5 seconds pass without further edits
**Then** the project auto-saves to localStorage and cloud

---

### US-56: Save status indicator (old editor)
**As a** user,
**I want** visual feedback when saving,
**So that** I know my work was saved.

**Given** I click Save
**Then** the save button shows a spinner while saving
**And** a checkmark icon for 3 seconds on success
**And** returns to the default disk icon

---

### US-57: Load project from library
**As a** returning user,
**I want to** open a previously saved project,
**So that** I can continue editing.

**Given** I have saved projects in the Library
**When** I click a project card
**Then** the editor loads that project's name, BPM, settings, instrument, parts, and tab data
**And** the Library drawer closes

---

### US-58: Create new project from library
**As a** user starting fresh,
**I want to** create a new blank project,
**So that** I can start a new tab from scratch.

**Given** the Library is open
**When** I click "New Project"
**Then** the editor resets to defaults (guitar, 6 strings, standard tuning, 120 BPM, 4/4 time, 1/16 grid, empty Intro part)
**And** the Library closes

---

### US-59: Delete project with confirmation
**As a** user cleaning up,
**I want** a confirmation step before deleting,
**So that** I don't accidentally lose work.

**Given** the Library shows a project
**When** I click the trash icon
**Then** inline "Delete?" confirmation appears with Yes/No buttons

**When** I click "Yes"
**Then** the project is deleted from localStorage and cloud

**When** I click "No"
**Then** the confirmation dismisses and the project remains

---

### US-60: Search projects in library
**As a** user with many saved projects,
**I want to** search by name,
**So that** I can quickly find a specific tab.

**Given** the Library is open with multiple projects
**When** I type in the search box
**Then** the list filters to projects matching the query (case-insensitive)

---

### US-61: Library shows project metadata
**As a** user browsing projects,
**I want to** see key details at a glance,
**So that** I can identify the right project.

**Given** the Library is open with projects
**When** I view a project card
**Then** it shows: project name, time signature, BPM, section count, and last updated date

---

### US-62: Active project highlighted in library
**As a** user who has a project loaded,
**I want** the current project highlighted in the list,
**So that** I know which one I'm editing.

**Given** the Library is open and a project is loaded in the editor
**When** I view the project list
**Then** the active project card has a distinct visual highlight

---

### US-63: Library loading state
**As a** user waiting for projects to load,
**I want** a loading indicator,
**So that** I know the app is working.

**Given** the Library is open and projects are loading
**When** I view the Library
**Then** a spinner and "Loading projects..." text appear

---

### US-64: Library empty state
**As a** new user with no projects,
**I want** a helpful empty state,
**So that** I know how to get started.

**Given** the Library is open with no projects
**When** I view the Library
**Then** a folder icon, "No projects yet" message, and "Create your first project" button appear

---

### US-65: Library empty search state
**As a** user whose search found nothing,
**I want** a clear message,
**So that** I know no projects matched.

**Given** the Library is open and I searched for "xyz"
**When** no projects match
**Then** a message shows: 'No projects match "xyz"'

---

### US-66: Open library drawer
**As a** user accessing my projects,
**I want** the library to open as a slide-in drawer,
**So that** I can browse without leaving the editor.

**Given** the editor is open
**When** I click the menu (hamburger) button
**Then** the Library drawer slides in from the left with an overlay backdrop

---

### US-67: Close library drawer
**As a** user done browsing projects,
**I want** multiple ways to close the drawer,
**So that** I can dismiss it quickly.

**Given** the Library drawer is open
**When** I click the X button or click the overlay background
**Then** the drawer slides out with a closing animation (200ms)

---

### US-68: Last project loaded on startup (old editor)
**As a** returning user,
**I want** my last project to auto-load when I open the app,
**So that** I can continue where I left off.

**Given** I previously worked on a project
**When** I open the app
**Then** the last-opened project is loaded from localStorage via `lastProjectId`

---

## Settings

### US-69: Change instrument
**As a** multi-instrumentalist,
**I want to** switch between guitar, bass, and drums,
**So that** I can create tabs for different instruments.

**Given** the settings panel is open
**When** I change the instrument dropdown
**Then** the grid updates with the correct number of strings/lines

---

### US-70: String count options change by instrument
**As a** user,
**I want** string count options to match the instrument,
**So that** I only see valid configurations.

**Given** the settings panel is open
**When** I select guitar
**Then** string options are 6, 7, 8

**When** I select bass
**Then** string options are 4, 5, 6

**When** I select drums
**Then** the string count dropdown is hidden (fixed 10 drum lines)

---

### US-71: Change tuning
**As a** guitarist using non-standard tuning,
**I want to** change between standard and drop tuning,
**So that** the string labels reflect my setup.

**Given** the settings panel is open
**When** I change tuning to "Drop"
**Then** the string labels update and power chord voicing adjusts for drop tuning

---

### US-72: Change key signature
**As a** user transposing a tab,
**I want to** change the key signature,
**So that** string labels and note references update.

**Given** the settings panel is open
**When** I change the key from E to A
**Then** the key signature updates

---

### US-73: Change time signature
**As a** user writing in a non-4/4 time,
**I want to** change the time signature,
**So that** the beat structure matches the song.

**Given** the settings panel is open
**When** I change time signature to 3/4
**Then** the time signature updates (affects playback timing and grid structure)

---

### US-74: Change note resolution/grid
**As a** user wanting finer or coarser note divisions,
**I want to** change the note resolution,
**So that** I have the right number of cells per beat.

**Given** the settings panel is open
**When** I change grid to 1/8
**Then** the note resolution updates (affects cells per beat and playback timing)

---

### US-75: Change BPM
**As a** user setting the tempo,
**I want to** type a BPM value in the header,
**So that** playback speed matches the song.

**Given** the BPM input in the header
**When** I change the value to 140
**Then** the BPM updates and playback uses the new timing

---

### US-76: Toggle settings panel visibility
**As a** user who wants more screen space,
**I want** the settings panel to toggle on and off,
**So that** it only shows when I need it.

**Given** the settings panel is hidden
**When** I click the gear icon
**Then** the settings panel appears

**When** I click the gear icon again
**Then** the settings panel hides

---

## Authentication

### US-77: Open auth modal
**As a** user who wants to sign in,
**I want** a sign-in modal,
**So that** I can authenticate to enable cloud sync.

**Given** I am not signed in
**When** I click "Sign In" in the Library footer
**Then** the auth modal opens with an email input

---

### US-78: Enter email for magic link
**As a** user signing in,
**I want to** enter my email,
**So that** I receive a magic link.

**Given** the auth modal is open
**When** I type my email and submit the form
**Then** a magic link is sent and the modal shows a "check your email" confirmation

---

### US-79: Magic link sent success state
**As a** user who submitted their email,
**I want** confirmation that the email was sent,
**So that** I know to check my inbox.

**Given** I submitted my email for a magic link
**When** the send succeeds
**Then** the modal shows "Check your email" with my email address and a "try again" link

---

### US-80: Auth error state
**As a** user whose sign-in failed,
**I want** a clear error message,
**So that** I know what went wrong and can retry.

**Given** magic link sending failed
**When** the error occurs
**Then** the modal shows the error message with a "Try again" button

---

### US-81: Close auth modal
**As a** user who changed their mind,
**I want** to close the auth modal,
**So that** I can return to the editor.

**Given** the auth modal is open
**When** I click the X button or click the overlay background
**Then** the modal closes

---

### US-82: Auth callback redirect
**As a** user clicking the magic link,
**I want** to be redirected to the app after authentication,
**So that** I'm signed in and ready to use it.

**Given** I clicked the magic link in my email
**When** the `/auth/callback` route loads
**Then** "Signing in..." is displayed and I'm redirected to `/` after 1 second

---

### US-83: Sign out
**As an** authenticated user,
**I want to** sign out,
**So that** I can secure my account on shared devices.

**Given** I am signed in
**When** I click "Sign Out" in the Library footer or User Menu
**Then** I am signed out and the UI reverts to unauthenticated state

---

### US-84: User menu (old editor)
**As an** authenticated user,
**I want** a menu showing my account info,
**So that** I can access account actions.

**Given** I am signed in
**When** I click the cloud icon button
**Then** a dropdown shows my email, "Synced" badge, Project Library, Share Tab, and Sign Out options

---

### US-85: User menu closes on outside click
**As a** user done with the menu,
**I want** clicking elsewhere to close it,
**So that** it doesn't stay open.

**Given** the user menu dropdown is open
**When** I click anywhere outside the menu
**Then** the dropdown closes

---

### US-86: Library auth footer states
**As a** user viewing the Library,
**I want** the footer to reflect my auth state,
**So that** I can sign in or see my account info.

**Given** I am not authenticated
**When** I view the Library footer
**Then** it shows "Sign in to sync across devices" and a Sign In button

**Given** I am authenticated
**When** I view the Library footer
**Then** it shows a cloud icon, my email, and a Sign Out button

---

## Sharing

### US-87: Create share link
**As a** user who wants to share my tab,
**I want to** generate a public URL,
**So that** others can view my tab without signing in.

**Given** the share modal is open
**When** I click "Create share link"
**Then** an 8-character slug URL is generated and displayed

---

### US-88: Copy share link to clipboard
**As a** user sharing a link,
**I want to** copy the URL with one click,
**So that** I can paste it in a message.

**Given** a share link exists
**When** I click "Copy"
**Then** the URL is copied to clipboard and the button shows "Copied!" for 2 seconds

---

### US-89: Open share link in new tab
**As a** user previewing the shared view,
**I want** to open the link,
**So that** I can see what others will see.

**Given** a share link exists
**When** I click the external link icon
**Then** the URL opens in a new browser tab

---

### US-90: Revoke share link
**As a** user who no longer wants to share,
**I want** to deactivate a link,
**So that** it stops working.

**Given** an active share link
**When** I click the trash icon
**Then** the link is deactivated and moves to the "Revoked" section

---

### US-91: Share link view count
**As a** user tracking engagement,
**I want** to see how many times my shared tab was viewed,
**So that** I know if people are using it.

**Given** a share link
**When** I view the share modal
**Then** each link shows its view count

---

### US-92: View shared tab (public viewer)
**As a** visitor with a share link,
**I want to** view the tab in read-only mode,
**So that** I can see the notation without needing an account.

**Given** a valid share link slug
**When** I navigate to `/tab/:slug`
**Then** the tab renders in read-only mode with a "Viewing shared tab" banner

---

### US-93: Copy shared tab to library
**As a** visitor who likes a shared tab,
**I want to** copy it to my own library,
**So that** I can edit and save my own version.

**Given** a shared tab with allow_copy enabled and I am authenticated
**When** I click "Copy to my library"
**Then** a copy of the project (with "(copy)" suffix) is added to my library

---

### US-94: Copy to library requires auth
**As an** unauthenticated visitor,
**I want** to be prompted to sign in when copying,
**So that** the copy has somewhere to go.

**Given** a shared tab and I am not signed in
**When** I click "Copy to my library"
**Then** the auth modal opens

---

### US-95: Shared tab not found
**As a** visitor with an invalid link,
**I want** a clear error page,
**So that** I know the tab doesn't exist or was revoked.

**Given** an invalid or revoked slug
**When** I navigate to `/tab/:slug`
**Then** an error page shows "Tab Not Found" with a link to the home page

---

### US-96: Shared tab loading state
**As a** visitor waiting for a tab to load,
**I want** a loading indicator,
**So that** I know the page is working.

**Given** I navigate to a valid share link
**When** the data is loading
**Then** a full-screen spinner with "Loading tab..." appears

---

### US-97: Share view increments view count
**As a** tab author,
**I want** view count to increment when someone opens my link,
**So that** I can track interest.

**Given** a valid share link
**When** a visitor loads the public viewer
**Then** the view count is incremented in Supabase

---

## Migration

### US-98: Migration prompt after first sign-in
**As a** user who signed in for the first time with existing local projects,
**I want to** be prompted to import them to the cloud,
**So that** my work is synced.

**Given** I just signed in and have local projects and haven't seen the migration prompt
**When** the app detects this condition
**Then** a migration dialog appears showing the project count and benefits

---

### US-99: Import projects to cloud
**As a** user accepting migration,
**I want** my local projects to be copied to Supabase,
**So that** they're accessible everywhere.

**Given** the migration prompt is shown
**When** I click "Import to cloud"
**Then** a spinner shows while migrating, then a success message with the count of migrated projects

---

### US-100: Skip migration
**As a** user who doesn't want to migrate yet,
**I want** to skip the prompt,
**So that** I can continue without migrating.

**Given** the migration prompt is shown
**When** I click "Skip for now"
**Then** the dialog closes

---

### US-101: Migration error with retry
**As a** user whose migration failed,
**I want** an error message with a retry option,
**So that** I can try again.

**Given** migration fails
**When** the error occurs
**Then** an error message appears with "Try again" and "Close" buttons

---

### US-102: Migration only shown once per user
**As a** returning user,
**I want** the migration prompt to not reappear,
**So that** I'm not nagged.

**Given** I have already seen or completed the migration
**When** I sign in again
**Then** the migration dialog does not appear (tracked via `migration_seen_${userId}` in localStorage)

---

## Text Export (Old Editor)

### US-103: Export tab as text file
**As a** user who wants to share outside the app,
**I want** to export my tab as a formatted text file,
**So that** I can post it on forums or send it to bandmates.

**Given** a tab with notes
**When** I click the export button
**Then** a `.txt` file downloads containing: project name, BPM, time signature, grid, key, tuning labels, section names, repeat counts, lyrics, and tab notation

---

## Print

### US-104: Print tab from browser
**As a** user who wants a physical copy,
**I want to** print my tab,
**So that** I can use it away from the computer.

**Given** a tab with notes
**When** I click the print button
**Then** the browser print dialog opens

---

## UI Components

### US-105: UiInput no layout shift on focus
**As a** user clicking into inputs,
**I want** the UI to not jump when inputs gain focus,
**So that** the layout stays stable.

**Given** a UiInput with no visible border
**When** I click to focus it
**Then** a border appears without layout shift (transparent 1px border always present)

---

### US-106: UiInput placeholder behavior
**As a** user viewing an empty input,
**I want** placeholder text shown until I type,
**So that** I know what the field is for.

**Given** an empty UiInput
**When** I view it
**Then** muted placeholder text is shown

**When** I hover
**Then** the placeholder text brightens

---

### US-107: UiButton variants
**As a** designer,
**I want** distinct button styles for different actions,
**So that** primary, secondary, action, and danger buttons are visually distinguishable.

**Given** buttons with different variant props
**When** I view them
**Then** primary shows light background, secondary shows dark, action shows green, danger shows red

---

### US-108: UiButton selected state
**As a** user toggling a feature,
**I want** the button to show a selected/active state,
**So that** I know the feature is on.

**Given** a UiButton with `selected={true}` (e.g., loop or click track)
**When** I view it
**Then** it shows a visually distinct active state

---

### US-109: UiCheckbox toggle
**As a** user toggling a boolean option,
**I want** a checkbox that visually toggles,
**So that** I can see the current state.

**Given** a UiCheckbox (e.g., Power Chord)
**When** I click it
**Then** the icon toggles between Square (unchecked) and CheckSquare (checked)
**And** `aria-checked` updates accordingly

---

### US-110: UiSelect dropdown
**As a** user choosing from options,
**I want** a styled select dropdown,
**So that** settings are easy to change.

**Given** a UiSelect (e.g., instrument, tuning)
**When** I click and select an option
**Then** the value changes and the parent callback fires

---

## Legend & Help

### US-111: Toggle legend panel
**As a** new user learning the notation,
**I want** a reference panel,
**So that** I know what characters I can use.

**Given** the footer bar
**When** I click "Legend"
**Then** a panel opens upward showing guitar/bass techniques and drum notation reference

**When** I click "Legend" again
**Then** the panel closes

---

### US-112: Keyboard shortcuts modal (old editor)
**As a** user wanting to learn shortcuts,
**I want** a shortcuts reference,
**So that** I can use the keyboard efficiently.

**Given** the editor is active
**When** I press "?"
**Then** a modal opens listing all keyboard shortcuts by category

**When** I press Escape
**Then** the modal closes

---

## Offline & Data

### US-113: App works fully offline
**As a** user without internet,
**I want** the app to work using localStorage,
**So that** I can create and edit tabs offline.

**Given** no internet connection (or Supabase not configured)
**When** I use the app
**Then** all features work with localStorage as the data store

---

### US-114: Cloud operations fail silently
**As a** user whose internet drops mid-session,
**I want** the app to continue working,
**So that** I don't lose my work.

**Given** a cloud sync operation fails
**When** the error occurs
**Then** the app falls back to localStorage without showing an error

---

## Error Handling

### US-115: Error boundary catches crashes
**As a** user who encounters a bug,
**I want** a friendly error page instead of a blank screen,
**So that** I know what happened and can recover.

**Given** a React rendering error occurs
**When** the error boundary catches it
**Then** an error page shows "Something went wrong", the error message, and a "Reload page" button

---

### US-116: Reload page from error boundary
**As a** user on the error page,
**I want** a reload button,
**So that** I can recover.

**Given** the error boundary is showing
**When** I click "Reload page"
**Then** the page reloads via `window.location.reload()`

---

## Accessibility

### US-117: Checkbox accessibility
**As a** user with a screen reader,
**I want** checkboxes to have proper ARIA attributes,
**So that** assistive technology can convey the state.

**Given** a UiCheckbox
**When** it renders
**Then** it has `role="checkbox"` and `aria-checked` matching the checked state

---

### US-118: Keyboard-only focus styles
**As a** keyboard user,
**I want** visible focus indicators when tabbing,
**So that** I can see which element is focused.

**Given** I am navigating with keyboard
**When** an element receives focus via Tab
**Then** a visible focus ring appears (`:focus-visible`)

**When** an element receives focus via mouse click
**Then** no focus ring appears (`:focus:not(:focus-visible)`)

---

### US-119: Form labels and required fields
**As a** user with assistive technology,
**I want** form inputs to have associated labels,
**So that** I know what each field is for.

**Given** the auth modal email input
**When** it renders
**Then** it has an associated `<label htmlFor="email">` and `required` attribute

---

## Routes

### US-120: Main editor route
**As a** user opening the app,
**I want** the main editor to load at the root URL,
**So that** I can start editing immediately.

**Given** I navigate to `/`
**When** the page loads
**Then** the main editor view renders

---

### US-121: New editor preview route
**As a** developer testing the new UI,
**I want** the redesigned editor at a separate route,
**So that** it doesn't break the existing app.

**Given** I navigate to `/new`
**When** the page loads
**Then** the TabEditorNew component renders

---

### US-122: Public viewer route
**As a** visitor with a share link,
**I want** the shared tab to render at its slug URL,
**So that** I can view it without signing in.

**Given** I navigate to `/tab/abc123xy`
**When** the page loads
**Then** the PublicViewer renders the shared tab in read-only mode

---

### US-123: Style guide route
**As a** developer reviewing the design system,
**I want** a style guide page,
**So that** I can see all tokens and components.

**Given** I navigate to `/styleguide`
**When** the page loads
**Then** the StyleGuide renders showing colors, typography, spacing, buttons, inputs, and checkboxes
