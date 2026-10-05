/**
 * Comprehensive question bank for Windows short commands.
 * Covers 9 distinct question formats to demonstrate quiz-side variety.
 */

export const quizQuestions = [
  // ==========================================
  // FORMAT 1: SINGLE CHOICE
  // ==========================================
  {
    id: 'sc-1',
    type: 'single_choice',
    category: 'System & Troubleshooting',
    difficulty: 'Intermediate',
    prompt: 'Which keyboard shortcut opens the Windows Task Manager directly, bypassing the security options screen?',
    hint: 'It uses the top-left escape key together with two modifier keys.',
    options: [
      { id: 'opt-1', label: 'Ctrl + Shift + Esc', text: 'Ctrl + Shift + Esc', isCorrect: true },
      { id: 'opt-2', label: 'Ctrl + Alt + Del', text: 'Ctrl + Alt + Del', isCorrect: false },
      { id: 'opt-3', label: 'Win + X', text: 'Win + X', isCorrect: false },
      { id: 'opt-4', label: 'Alt + F4', text: 'Alt + F4', isCorrect: false }
    ],
    explanation:
      'Ctrl + Shift + Esc directly launches Task Manager with zero intermediate menus. In contrast, Ctrl + Alt + Del sends a system interrupt that opens the security screen (Lock, Switch User, Sign Out, Task Manager).'
  },
  {
    id: 'sc-2',
    type: 'single_choice',
    category: 'Essential Windows Navigation',
    difficulty: 'Beginner',
    prompt: 'You have multiple chaotic windows open and need to instantly peek at or reveal your clean desktop. What shortcut do you press?',
    hint: 'Think "D" for Desktop.',
    options: [
      { id: 'opt-1', label: 'Win + E', text: 'Win + E', isCorrect: false },
      { id: 'opt-2', label: 'Win + D', text: 'Win + D', isCorrect: true },
      { id: 'opt-3', label: 'Win + L', text: 'Win + L', isCorrect: false },
      { id: 'opt-4', label: 'Alt + Space', text: 'Alt + Space', isCorrect: false }
    ],
    explanation:
      'Win + D toggles "Show Desktop". Pressing it once minimizes all open windows to reveal the desktop; pressing it again restores them back to their exact positions.'
  },
  {
    id: 'sc-3',
    type: 'single_choice',
    category: 'File Explorer & Windows Tools',
    difficulty: 'Beginner',
    prompt: 'Which shortcut immediately opens the Windows File Explorer from anywhere in Windows?',
    hint: 'Think "E" for Explorer.',
    options: [
      { id: 'opt-1', label: 'Win + F', text: 'Win + F', isCorrect: false },
      { id: 'opt-2', label: 'Win + E', text: 'Win + E', isCorrect: true },
      { id: 'opt-3', label: 'Ctrl + E', text: 'Ctrl + E', isCorrect: false },
      { id: 'opt-4', label: 'Alt + E', text: 'Alt + E', isCorrect: false }
    ],
    explanation:
      'Win + E launches File Explorer directly. (Win + F opens the Windows Feedback Hub).'
  },

  // ==========================================
  // FORMAT 2: MULTIPLE CHOICE (Multi-Select)
  // ==========================================
  {
    id: 'mc-1',
    type: 'multiple_choice',
    category: 'Multitasking & Window Management',
    difficulty: 'Intermediate',
    prompt: 'Which of the following shortcuts switch between active windows, open apps, or virtual desktops? (Select all that apply)',
    hint: 'Look for shortcuts utilizing Tab or the Arrow keys.',
    instruction: 'Select all correct shortcuts. Partial credit is awarded for partial matches.',
    options: [
      { id: 'opt-1', label: 'Alt + Tab', text: 'Alt + Tab (Quick app switcher)', isCorrect: true },
      { id: 'opt-2', label: 'Win + Tab', text: 'Win + Tab (Task View & Virtual Desktop timeline)', isCorrect: true },
      { id: 'opt-3', label: 'Win + Ctrl + Left / Right', text: 'Win + Ctrl + Left/Right Arrow (Switch virtual desktops)', isCorrect: true },
      { id: 'opt-4', label: 'Win + P', text: 'Win + P (Presentation & Project display menu)', isCorrect: false },
      { id: 'opt-5', label: 'Win + I', text: 'Win + I (Open Settings app)', isCorrect: false }
    ],
    explanation:
      'Alt + Tab switches open applications; Win + Tab displays Task View; Win + Ctrl + Left/Right slides between virtual desktops. Win + P is for projector/display sharing, and Win + I opens Settings.'
  },
  {
    id: 'mc-2',
    type: 'multiple_choice',
    category: 'Window Snapping & Layout',
    difficulty: 'Intermediate',
    prompt: 'Windows Snap allows you to organize windows side-by-side. Which of the following keys can be combined with the Windows key (Win + [Key]) to snap or manipulate window sizes?',
    hint: 'Directional arrows are the core of Windows Snap.',
    instruction: 'Select all that apply.',
    options: [
      { id: 'opt-1', label: 'Up Arrow', text: 'Up Arrow (Maximize or snap top-half)', isCorrect: true },
      { id: 'opt-2', label: 'Down Arrow', text: 'Down Arrow (Restore down or minimize)', isCorrect: true },
      { id: 'opt-3', label: 'Left Arrow', text: 'Left Arrow (Snap window to left half/quadrant)', isCorrect: true },
      { id: 'opt-4', label: 'Right Arrow', text: 'Right Arrow (Snap window to right half/quadrant)', isCorrect: true },
      { id: 'opt-5', label: 'Spacebar', text: 'Spacebar', isCorrect: false }
    ],
    explanation:
      'Win + Arrow keys (Up, Down, Left, Right) control Windows Snap positioning and window resizing (maximize, minimize, split left/right, and 2x2 corner quadrants in Windows 11).'
  },

  // ==========================================
  // FORMAT 3: FILL IN THE BLANK
  // ==========================================
  {
    id: 'fb-1',
    type: 'fill_blank',
    category: 'Essential Windows Navigation',
    difficulty: 'Beginner',
    prompt: 'What keyboard shortcut is used to instantly lock your Windows computer when walking away from your desk?',
    hint: 'Windows key plus the first letter of "Lock".',
    placeholder: 'e.g. Win + L',
    canonicalAnswer: 'Win + L',
    acceptedAnswers: ['Win + L', 'Win+L', 'Windows + L', 'Windows+L', 'Win L', 'Windows L'],
    explanation:
      'Win + L instantly locks Windows, requiring your password, PIN, or biometric sign-in to unlock.'
  },
  {
    id: 'fb-2',
    type: 'fill_blank',
    category: 'File Explorer',
    difficulty: 'Beginner',
    prompt: 'In Windows File Explorer or on the Desktop, which single function key instantly lets you rename the currently selected file or folder?',
    hint: 'It is one of the top row function keys (F1 to F12).',
    placeholder: 'e.g. F2',
    canonicalAnswer: 'F2',
    acceptedAnswers: ['F2', 'f2'],
    explanation:
      'F2 enters rename mode on the highlighted item in File Explorer and on desktop icons.'
  },
  {
    id: 'fb-3',
    type: 'fill_blank',
    category: 'System & Admin Tools',
    difficulty: 'Intermediate',
    prompt: 'What executable name do you type into the Run dialog (Win + R) to open the Windows Registry Editor?',
    hint: 'A 7-letter abbreviation of "Registry Edit".',
    placeholder: 'e.g. regedit',
    canonicalAnswer: 'regedit',
    acceptedAnswers: ['regedit', 'regedit.exe'],
    explanation:
      'Typing "regedit" in the Run box or terminal opens the Windows Registry Editor utility.'
  },
  {
    id: 'fb-4',
    type: 'fill_blank',
    category: 'File Explorer',
    difficulty: 'Intermediate',
    prompt: 'What 3-key shortcut instantly creates a new folder in File Explorer without using the right-click context menu?',
    hint: 'Ctrl and Shift combined with the first letter of "New".',
    placeholder: 'e.g. Ctrl + Shift + N',
    canonicalAnswer: 'Ctrl + Shift + N',
    acceptedAnswers: [
      'Ctrl + Shift + N',
      'Ctrl+Shift+N',
      'Control + Shift + N',
      'Control+Shift+N',
      'Ctrl Shift N'
    ],
    explanation:
      'Ctrl + Shift + N instantly creates a new empty folder in the active File Explorer directory.'
  },

  // ==========================================
  // FORMAT 4: KEY COMBINATION BUILDER
  // ==========================================
  {
    id: 'kb-1',
    type: 'key_builder',
    category: 'Productivity & Screen Capture',
    difficulty: 'Intermediate',
    prompt: 'Build the shortcut combination to summon the Windows Snipping Tool overlay for taking a custom rectangular or window screenshot:',
    hint: 'Combines the Windows key, Shift key, and the letter S (for Snip/Screenshot).',
    targetCombo: ['Win', 'Shift', 'S'],
    keyBank: ['Win', 'Ctrl', 'Alt', 'Shift', 'S', 'PrtScn', 'Esc', 'Tab'],
    orderMatters: false,
    explanation:
      'Win + Shift + S opens the Snipping Tool screenshot utility at the top of your screen, letting you capture rect, freeform, window, or full-screen snips directly to the clipboard.'
  },
  {
    id: 'kb-2',
    type: 'key_builder',
    category: 'Virtual Desktops',
    difficulty: 'Advanced',
    prompt: 'Assemble the shortcut keys required to create a brand new Virtual Desktop in Windows 10 & 11:',
    hint: 'Win + Ctrl + the first letter of Desktop.',
    targetCombo: ['Win', 'Ctrl', 'D'],
    keyBank: ['Win', 'Ctrl', 'Alt', 'Shift', 'D', 'N', 'F4', 'Tab'],
    orderMatters: false,
    explanation:
      'Win + Ctrl + D instantly adds and switches to a new clean virtual desktop. (To close the active virtual desktop later, press Win + Ctrl + F4).'
  },

  // ==========================================
  // FORMAT 5: MATCHING PAIRS
  // ==========================================
  {
    id: 'mp-1',
    type: 'matching',
    category: 'Windows Power Keys',
    difficulty: 'Intermediate',
    prompt: 'Match each Windows shortcut on the left with its corresponding function on the right:',
    hint: 'Win + V is for clipboard history, Win + . is for emojis.',
    pairs: [
      { id: 1, left: 'Win + V', right: 'Open Clipboard History (past copy-paste items)' },
      { id: 2, left: 'Win + . (Period)', right: 'Open Emoji, Kaomoji & Symbol Picker' },
      { id: 3, left: 'Win + I', right: 'Open the main Windows Settings application' },
      { id: 4, left: 'Win + X', right: 'Open Power User / Quick Link system menu' }
    ],
    explanation:
      'Win + V: Clipboard history. Win + . : Emoji & Symbol picker. Win + I: Settings app. Win + X: Power User menu with shortcuts to Device Manager, Terminal, Disk Management, and Shutdown.'
  },
  {
    id: 'mp-2',
    type: 'matching',
    category: 'File & App Management',
    difficulty: 'Intermediate',
    prompt: 'Match each shortcut to its file or window action:',
    hint: 'Alt + Enter inspects a file.',
    pairs: [
      { id: 1, left: 'Alt + Enter', right: 'Open Properties window for selected item' },
      { id: 2, left: 'Alt + F4', right: 'Close active window or open Windows Shut Down dialog' },
      { id: 3, left: 'Alt + Left Arrow', right: 'Go back to previous folder or web page' },
      { id: 4, left: 'Ctrl + W', right: 'Close currently active tab or window' }
    ],
    explanation:
      'Alt + Enter opens Properties. Alt + F4 closes active app or triggers shutdown. Alt + Left Arrow navigates back. Ctrl + W closes current tab/document.'
  },

  // ==========================================
  // FORMAT 6: ORDERING / SEQUENCE
  // ==========================================
  {
    id: 'ord-1',
    type: 'ordering',
    category: 'Power User & Admin Workflow',
    difficulty: 'Advanced',
    prompt: 'Arrange the sequence of steps to open Windows Terminal or Command Prompt as Administrator using only your keyboard:',
    hint: 'Start with the Run dialog shortcut.',
    items: [
      { id: 's1', text: 'Press Win + R to open the Run dialog box' },
      { id: 's2', text: 'Type "wt" (Windows Terminal) or "cmd" into the Open field' },
      { id: 's3', text: 'Press Ctrl + Shift + Enter to run with elevated Administrator privileges' },
      { id: 's4', text: 'Press Left Arrow and Enter (or Alt + Y) to confirm the UAC prompt' }
    ],
    // The items will be shuffled for the user; correct order is:
    correctOrder: ['s1', 's2', 's3', 's4'],
    explanation:
      'The quickest keyboard sequence for admin shell: Win + R -> type wt/cmd -> Ctrl + Shift + Enter (runs as admin) -> Alt + Y / Enter to accept User Account Control.'
  },
  {
    id: 'ord-2',
    type: 'ordering',
    category: 'Troubleshooting & Recovery',
    difficulty: 'Intermediate',
    prompt: 'You have a frozen app and want to terminate it cleanly using Task Manager without touching the mouse. Order the steps:',
    hint: 'Open Task Manager first with its direct 3-key shortcut.',
    items: [
      { id: 't1', text: 'Press Ctrl + Shift + Esc to summon Task Manager' },
      { id: 't2', text: 'Use Down/Up Arrow keys to highlight the frozen application' },
      { id: 't3', text: 'Press the Delete key (or Alt + E) to trigger End Task' },
      { id: 't4', text: 'Press Enter or Spacebar to confirm process termination if prompted' }
    ],
    correctOrder: ['t1', 't2', 't3', 't4'],
    explanation:
      'Task Manager keyboard workflow: Ctrl + Shift + Esc -> navigate with arrow keys -> Delete or Alt + E terminates the highlighted task.'
  },

  // ==========================================
  // FORMAT 7: TRUE / FALSE
  // ==========================================
  {
    id: 'tf-1',
    type: 'true_false',
    category: 'Windows Features',
    difficulty: 'Beginner',
    prompt: 'True or False:',
    statement: 'Pressing Win + V allows you to access a history of multiple copied items (text and screenshots), but only after you have enabled Clipboard History in Windows settings.',
    correctAnswer: true,
    hint: 'Think about what happens the first time you press Win + V on a fresh Windows install.',
    explanation:
      'True! Windows requires you to enable Clipboard History (which you can do right from the Win + V popup overlay the first time you use it) before it begins caching multiple clips.'
  },
  {
    id: 'tf-2',
    type: 'true_false',
    category: 'Shortcuts & System',
    difficulty: 'Intermediate',
    prompt: 'True or False:',
    statement: 'Pressing Alt + F4 will ONLY close browser tabs and will never close an entire application or prompt to shut down your PC.',
    correctAnswer: false,
    hint: 'What closes individual tabs vs what terminates an application window?',
    explanation:
      'False! Alt + F4 closes the entire active application window (not just a tab, which is Ctrl + W). If your desktop has focus with no windows open, Alt + F4 brings up the Windows Shut Down menu.'
  },
  {
    id: 'tf-3',
    type: 'true_false',
    category: 'Screen Recording & Gaming',
    difficulty: 'Intermediate',
    prompt: 'True or False:',
    statement: 'Win + G opens the Xbox Game Bar overlay, which includes built-in screen recording, audio mixer, and performance widgets even for non-gaming apps.',
    correctAnswer: true,
    hint: 'The Game Bar is usable on any desktop window.',
    explanation:
      'True! Win + G opens the Xbox Game Bar overlay on any Windows 10/11 PC, allowing quick screen recording and system performance monitoring.'
  },

  // ==========================================
  // FORMAT 8: LIVE KEYBOARD PRESS CAPTURE
  // ==========================================
  {
    id: 'lp-1',
    type: 'live_press',
    category: 'Interactive Keyboard Practice',
    difficulty: 'Beginner',
    prompt: 'Hands on keyboard! Press the shortcut to summon the Windows Run dialog box:',
    hint: 'Hold the Windows key and tap the letter R.',
    displayCombo: 'Win + R',
    targetKeys: ['Win', 'R'],
    description: 'Press the physical keys on your keyboard, or click the virtual keys below if your browser or OS intercepts this key.',
    virtualKeys: ['Win', 'Ctrl', 'Alt', 'Shift', 'R', 'E', 'D', 'L', 'V'],
    explanation:
      'Win + R summons the Run dialog, the fastest gateway to commands, settings shortcuts, and executables.'
  },
  {
    id: 'lp-2',
    type: 'live_press',
    category: 'Interactive Keyboard Practice',
    difficulty: 'Beginner',
    prompt: 'Hands on keyboard! Press the universal shortcut to Copy highlighted content to the clipboard:',
    hint: 'Hold Ctrl and tap C.',
    displayCombo: 'Ctrl + C',
    targetKeys: ['Ctrl', 'C'],
    description: 'Press the physical keys on your keyboard, or click the virtual keys below.',
    virtualKeys: ['Ctrl', 'Win', 'Shift', 'Alt', 'C', 'V', 'X', 'Z'],
    explanation:
      'Ctrl + C copies the selection to the clipboard. (Pair with Ctrl + V to paste or Win + V for clipboard history).'
  },

  // ==========================================
  // FORMAT 9: ODD ONE OUT / SPOT THE IMPOSTER
  // ==========================================
  {
    id: 'ooo-1',
    type: 'odd_one_out',
    category: 'Window Snapping & Layout',
    difficulty: 'Intermediate',
    prompt: 'Three of these shortcuts control Windows Snap (moving and snapping windows). One is an IMPOSTER that does something else. Spot the imposter:',
    hint: 'Look for the shortcut that relates to external displays rather than window position.',
    theme: 'Windows Snap Controls',
    options: [
      { id: 'opt-1', text: 'Win + Left Arrow', description: 'Snaps window to the left half of screen' },
      { id: 'opt-2', text: 'Win + Up Arrow', description: 'Maximizes the window or snaps top half' },
      { id: 'opt-3', text: 'Win + Down Arrow', description: 'Restores window down or minimizes' },
      { id: 'opt-4', text: 'Win + P', description: 'Opens Project / Multiple Display projection sidebar' }
    ],
    imposterId: 'opt-4',
    imposterReason:
      'Win + P opens the Project / Display flyout menu (Duplicate, Extend, Second screen only), whereas Win + Left, Up, and Down are all core Windows Snap window layout controls.'
  },
  {
    id: 'ooo-2',
    type: 'odd_one_out',
    category: 'Virtual Desktops',
    difficulty: 'Advanced',
    prompt: 'Three of these shortcuts manage Virtual Desktops in Windows. Which one is the IMPOSTER that does NOT belong to virtual desktops?',
    hint: 'One of them is a common File Explorer shortcut.',
    theme: 'Virtual Desktop Commands',
    options: [
      { id: 'opt-1', text: 'Win + Ctrl + D', description: 'Creates a new virtual desktop' },
      { id: 'opt-2', text: 'Win + Ctrl + F4', description: 'Closes the current virtual desktop' },
      { id: 'opt-3', text: 'Win + Ctrl + Right Arrow', description: 'Switches to next virtual desktop on right' },
      { id: 'opt-4', text: 'Win + E', description: 'Opens File Explorer' }
    ],
    imposterId: 'opt-4',
    imposterReason:
      'Win + E opens File Explorer. Win + Ctrl + D, Win + Ctrl + F4, and Win + Ctrl + Right Arrow are all Virtual Desktop management shortcuts.'
  }
]
