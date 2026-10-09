-- ==========================================================
-- inCTRL Database Initialization Script
-- Website for Windows Shortcut Commands, Quizzes & Users
-- ==========================================================

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,3
    role ENUM('user', 'admin') DEFAULT 'user',
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    xp INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'keyboard',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. WINDOWS SHORTCUTS REFERENCE TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS windows_shortcuts (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    key_combo VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. QUIZZES TABLE (Curated Quizzes & Practice Sets)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. QUIZ QUESTIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(50) NOT NULL,
    quiz_id INT NULL,
    type VARCHAR(50) NOT NULL,
    category_id INT NULL,
    category_name VARCHAR(100) NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    prompt TEXT NOT NULL,
    key_combination VARCHAR(100) NULL,
    hint TEXT NULL,
    explanation TEXT NULL,
    payload_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. QUIZ ATTEMPTS (SCORES & LEADERBOARD)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT NOT NULL AUTO_INCREMENT,
    quiz_id INT NULL,
    user_id INT NULL,
    guest_name VARCHAR(100) NULL,
    format_filter VARCHAR(50) DEFAULT 'all',
    score INT NOT NULL DEFAULT 0,
    max_score INT NOT NULL DEFAULT 0,
    total_answered INT NOT NULL DEFAULT 0,
    time_spent_seconds INT DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- SEED DATA: CATEGORIES
-- ----------------------------------------------------------
INSERT IGNORE INTO categories (id, name, slug, description, icon, display_order) VALUES
(1, 'Essential Windows Navigation', 'essential-navigation', 'Core Windows shortcuts for navigating files, desktop, and locking the system.', 'navigation', 1),
(2, 'System & Troubleshooting', 'system-troubleshooting', 'Task Manager, system interrupts, diagnostics and recovery commands.', 'activity', 2),
(3, 'File Explorer & Windows Tools', 'file-explorer', 'Fast keyboard operations for managing directories, renaming, and properties.', 'folder', 3),
(4, 'Multitasking & Window Management', 'multitasking', 'App switching, Task View, and virtual desktop navigation.', 'layers', 4),
(5, 'Window Snapping & Layout', 'window-snapping', 'Snap Assist, multi-monitor controls, and screen quadrant arrangements.', 'grid', 5),
(6, 'Virtual Desktops', 'virtual-desktops', 'Creating, switching, and organizing virtual workspaces in Windows 10/11.', 'monitor', 6),
(7, 'Windows Power Keys', 'power-keys', 'Clipboard history, emoji picker, Settings, and quick links.', 'zap', 7),
(8, 'Interactive Keyboard Practice', 'keyboard-practice', 'Live typing exercises testing muscle memory on common commands.', 'terminal', 8);

-- ----------------------------------------------------------
-- SEED DATA: DEMO USERS
-- Admin accounts must be provisioned separately with unique credentials.
-- ----------------------------------------------------------
INSERT IGNORE INTO users (id, username, email, password_hash, display_name, role, xp) VALUES
(2, 'shortcut_ninja', 'ninja@inctrl.dev', '$2b$10$w091pP3qf1.f4n1M5mH7sOi5P05fRkFhUuM9fQ4n08M9J8bKq3/6a', 'Shortcut Ninja', 'user', 1850),
(3, 'demo_user', 'user@inctrl.dev', '$2b$10$w091pP3qf1.f4n1M5mH7sOi5P05fRkFhUuM9fQ4n08M9J8bKq3/6a', 'Alex Dev', 'user', 920);

-- ----------------------------------------------------------
-- SEED DATA: QUIZZES
-- ----------------------------------------------------------
INSERT IGNORE INTO quizzes (id, title, description, category_id, difficulty) VALUES
(1, 'Essential Navigation Mastery', 'Core Windows shortcuts for navigating files, desktop, and locking the system.', 1, 'Beginner'),
(2, 'System & Troubleshooting Diagnostics', 'Task Manager, system interrupts, diagnostics and recovery commands.', 2, 'Intermediate'),
(3, 'Power User & Virtual Desktops', 'Clipboard history, virtual desktops, and power menu commands.', 6, 'Advanced');

-- ----------------------------------------------------------
-- SEED DATA: WINDOWS SHORTCUTS
-- ----------------------------------------------------------
INSERT IGNORE INTO windows_shortcuts (id, title, key_combo, description, category_id, difficulty) VALUES
(1, 'Direct Task Manager', 'Ctrl + Shift + Esc', 'Launches Task Manager directly without going through the Ctrl+Alt+Del security screen.', 2, 'Intermediate'),
(2, 'Show Desktop', 'Win + D', 'Minimizes all windows to show the desktop. Pressing it again restores all windows.', 1, 'Beginner'),
(3, 'File Explorer', 'Win + E', 'Directly opens a new File Explorer window.', 3, 'Beginner'),
(4, 'Lock PC', 'Win + L', 'Instantly locks Windows session requiring PIN or password.', 1, 'Beginner'),
(5, 'Clipboard History', 'Win + V', 'Opens popup menu of recently copied text and screenshots.', 7, 'Beginner'),
(6, 'Emoji & Symbol Picker', 'Win + .', 'Opens the Windows emoji, kaomoji, and special character palette.', 7, 'Beginner'),
(7, 'Snipping Tool Overlay', 'Win + Shift + S', 'Takes rectangular, freeform, window, or fullscreen screenshots.', 7, 'Intermediate'),
(8, 'New Virtual Desktop', 'Win + Ctrl + D', 'Creates and immediately switches to a new virtual desktop.', 6, 'Intermediate'),
(9, 'Switch Virtual Desktops', 'Win + Ctrl + Left/Right', 'Smoothly slides between active virtual desktops.', 6, 'Intermediate'),
(10, 'Close Virtual Desktop', 'Win + Ctrl + F4', 'Closes the current active virtual desktop.', 6, 'Advanced'),
(11, 'Quick App Switcher', 'Alt + Tab', 'Toggles between open application windows.', 4, 'Beginner'),
(12, 'Task View', 'Win + Tab', 'Opens timeline view of all open windows and virtual desktops.', 4, 'Beginner'),
(13, 'Snap Window Left/Right', 'Win + Left/Right Arrow', 'Snaps active window to left or right half of the monitor.', 5, 'Intermediate'),
(14, 'Maximize / Snap Top', 'Win + Up Arrow', 'Maximizes active window or snaps to top half.', 5, 'Beginner'),
(15, 'Run Dialog', 'Win + R', 'Opens Run command box for executing tools, scripts, or apps.', 2, 'Beginner'),
(16, 'Power User Menu', 'Win + X', 'Opens context menu with Device Manager, Disk Mgmt, Terminal, etc.', 7, 'Intermediate');

-- ----------------------------------------------------------
-- SEED DATA: QUIZ QUESTIONS (All 9 Question Formats)
-- ----------------------------------------------------------
INSERT IGNORE INTO quiz_questions (id, type, category_id, category_name, difficulty, prompt, hint, explanation, payload_json) VALUES
('sc-1', 'single_choice', 2, 'System & Troubleshooting', 'Intermediate',
 'Which keyboard shortcut opens the Windows Task Manager directly, bypassing the security options screen?',
 'It uses the top-left escape key together with two modifier keys.',
 'Ctrl + Shift + Esc directly launches Task Manager with zero intermediate menus. In contrast, Ctrl + Alt + Del sends a system interrupt that opens the security screen (Lock, Switch User, Sign Out, Task Manager).',
 '{"options": [{"id": "opt-1", "label": "Ctrl + Shift + Esc", "text": "Ctrl + Shift + Esc", "isCorrect": true}, {"id": "opt-2", "label": "Ctrl + Alt + Del", "text": "Ctrl + Alt + Del", "isCorrect": false}, {"id": "opt-3", "label": "Win + X", "text": "Win + X", "isCorrect": false}, {"id": "opt-4", "label": "Alt + F4", "text": "Alt + F4", "isCorrect": false}]}'
),

('sc-2', 'single_choice', 1, 'Essential Windows Navigation', 'Beginner',
 'You have multiple chaotic windows open and need to instantly peek at or reveal your clean desktop. What shortcut do you press?',
 'Think "D" for Desktop.',
 'Win + D toggles "Show Desktop". Pressing it once minimizes all open windows to reveal the desktop; pressing it again restores them back to their exact positions.',
 '{"options": [{"id": "opt-1", "label": "Win + E", "text": "Win + E", "isCorrect": false}, {"id": "opt-2", "label": "Win + D", "text": "Win + D", "isCorrect": true}, {"id": "opt-3", "label": "Win + L", "text": "Win + L", "isCorrect": false}, {"id": "opt-4", "label": "Alt + Space", "text": "Alt + Space", "isCorrect": false}]}'
),

('sc-3', 'single_choice', 3, 'File Explorer & Windows Tools', 'Beginner',
 'Which shortcut immediately opens the Windows File Explorer from anywhere in Windows?',
 'Think "E" for Explorer.',
 'Win + E launches File Explorer directly. (Win + F opens the Windows Feedback Hub).',
 '{"options": [{"id": "opt-1", "label": "Win + F", "text": "Win + F", "isCorrect": false}, {"id": "opt-2", "label": "Win + E", "text": "Win + E", "isCorrect": true}, {"id": "opt-3", "label": "Ctrl + E", "text": "Ctrl + E", "isCorrect": false}, {"id": "opt-4", "label": "Alt + E", "text": "Alt + E", "isCorrect": false}]}'
),

('mc-1', 'multiple_choice', 4, 'Multitasking & Window Management', 'Intermediate',
 'Which of the following shortcuts switch between active windows, open apps, or virtual desktops? (Select all that apply)',
 'Look for shortcuts utilizing Tab or the Arrow keys.',
 'Alt + Tab switches open applications; Win + Tab displays Task View; Win + Ctrl + Left/Right slides between virtual desktops. Win + P is for projector/display sharing, and Win + I opens Settings.',
 '{"instruction": "Select all correct shortcuts. Partial credit is awarded for partial matches.", "options": [{"id": "opt-1", "label": "Alt + Tab", "text": "Alt + Tab (Quick app switcher)", "isCorrect": true}, {"id": "opt-2", "label": "Win + Tab", "text": "Win + Tab (Task View & Virtual Desktop timeline)", "isCorrect": true}, {"id": "opt-3", "label": "Win + Ctrl + Left / Right", "text": "Win + Ctrl + Left/Right Arrow (Switch virtual desktops)", "isCorrect": true}, {"id": "opt-4", "label": "Win + P", "text": "Win + P (Presentation & Project display menu)", "isCorrect": false}, {"id": "opt-5", "label": "Win + I", "text": "Win + I (Open Settings app)", "isCorrect": false}]}'
),

('mc-2', 'multiple_choice', 5, 'Window Snapping & Layout', 'Intermediate',
 'Windows Snap allows you to organize windows side-by-side. Which of the following keys can be combined with the Windows key (Win + [Key]) to snap or manipulate window sizes?',
 'Directional arrows are the core of Windows Snap.',
 'Win + Arrow keys (Up, Down, Left, Right) control Windows Snap positioning and window resizing (maximize, minimize, split left/right, and 2x2 corner quadrants in Windows 11).',
 '{"instruction": "Select all that apply.", "options": [{"id": "opt-1", "label": "Up Arrow", "text": "Up Arrow (Maximize or snap top-half)", "isCorrect": true}, {"id": "opt-2", "label": "Down Arrow", "text": "Down Arrow (Restore down or minimize)", "isCorrect": true}, {"id": "opt-3", "label": "Left Arrow", "text": "Left Arrow (Snap window to left half/quadrant)", "isCorrect": true}, {"id": "opt-4", "label": "Right Arrow", "text": "Right Arrow (Snap window to right half/quadrant)", "isCorrect": true}, {"id": "opt-5", "label": "Spacebar", "text": "Spacebar", "isCorrect": false}]}'
),

('fb-1', 'fill_blank', 1, 'Essential Windows Navigation', 'Beginner',
 'What keyboard shortcut is used to instantly lock your Windows computer when walking away from your desk?',
 'Windows key plus the first letter of "Lock".',
 'Win + L instantly locks Windows, requiring your password, PIN, or biometric sign-in to unlock.',
 '{"placeholder": "e.g. Win + L", "canonicalAnswer": "Win + L", "acceptedAnswers": ["Win + L", "Win+L", "Windows + L", "Windows+L", "Win L", "Windows L"]}'
),

('fb-2', 'fill_blank', 3, 'File Explorer & Windows Tools', 'Beginner',
 'In Windows File Explorer or on the Desktop, which single function key instantly lets you rename the currently selected file or folder?',
 'It is one of the top row function keys (F1 to F12).',
 'F2 enters rename mode on the highlighted item in File Explorer and on desktop icons.',
 '{"placeholder": "e.g. F2", "canonicalAnswer": "F2", "acceptedAnswers": ["F2", "f2"]}'
),

('fb-3', 'fill_blank', 2, 'System & Troubleshooting', 'Intermediate',
 'What executable name do you type into the Run dialog (Win + R) to open the Windows Registry Editor?',
 'A 7-letter abbreviation of "Registry Edit".',
 'Typing "regedit" in the Run box or terminal opens the Windows Registry Editor utility.',
 '{"placeholder": "e.g. regedit", "canonicalAnswer": "regedit", "acceptedAnswers": ["regedit", "regedit.exe"]}'
),

('fb-4', 'fill_blank', 3, 'File Explorer & Windows Tools', 'Intermediate',
 'What 3-key shortcut instantly creates a new folder in File Explorer without using the right-click context menu?',
 'Ctrl and Shift combined with the first letter of "New".',
 'Ctrl + Shift + N instantly creates a new empty folder in the active File Explorer directory.',
 '{"placeholder": "e.g. Ctrl + Shift + N", "canonicalAnswer": "Ctrl + Shift + N", "acceptedAnswers": ["Ctrl + Shift + N", "Ctrl+Shift+N", "Control + Shift + N", "Control+Shift+N", "Ctrl Shift N"]}'
),

('kb-1', 'key_builder', 7, 'Windows Power Keys', 'Intermediate',
 'Build the shortcut combination to summon the Windows Snipping Tool overlay for taking a custom rectangular or window screenshot:',
 'Combines the Windows key, Shift key, and the letter S (for Snip/Screenshot).',
 'Win + Shift + S opens the Snipping Tool screenshot utility at the top of your screen, letting you capture rect, freeform, window, or full-screen snips directly to the clipboard.',
 '{"targetCombo": ["Win", "Shift", "S"], "keyBank": ["Win", "Ctrl", "Alt", "Shift", "S", "PrtScn", "Esc", "Tab"], "orderMatters": false}'
),

('kb-2', 'key_builder', 6, 'Virtual Desktops', 'Advanced',
 'Assemble the shortcut keys required to create a brand new Virtual Desktop in Windows 10 & 11:',
 'Win + Ctrl + the first letter of Desktop.',
 'Win + Ctrl + D instantly adds and switches to a new clean virtual desktop. (To close the active virtual desktop later, press Win + Ctrl + F4).',
 '{"targetCombo": ["Win", "Ctrl", "D"], "keyBank": ["Win", "Ctrl", "Alt", "Shift", "D", "N", "F4", "Tab"], "orderMatters": false}'
),

('mp-1', 'matching', 7, 'Windows Power Keys', 'Intermediate',
 'Match each Windows shortcut on the left with its corresponding function on the right:',
 'Win + V is for clipboard history, Win + . is for emojis.',
 'Win + V: Clipboard history. Win + . : Emoji & Symbol picker. Win + I: Settings app. Win + X: Power User menu with shortcuts to Device Manager, Terminal, Disk Management, and Shutdown.',
 '{"pairs": [{"id": 1, "left": "Win + V", "right": "Open Clipboard History (past copy-paste items)"}, {"id": 2, "left": "Win + . (Period)", "right": "Open Emoji, Kaomoji & Symbol Picker"}, {"id": 3, "left": "Win + I", "right": "Open the main Windows Settings application"}, {"id": 4, "left": "Win + X", "right": "Open Power User / Quick Link system menu"}]}'
),

('mp-2', 'matching', 3, 'File Explorer & Windows Tools', 'Intermediate',
 'Match each shortcut to its file or window action:',
 'Alt + Enter inspects a file.',
 'Alt + Enter opens Properties. Alt + F4 closes active app or triggers shutdown. Alt + Left Arrow navigates back. Ctrl + W closes current tab/document.',
 '{"pairs": [{"id": 1, "left": "Alt + Enter", "right": "Open Properties window for selected item"}, {"id": 2, "left": "Alt + F4", "right": "Close active window or open Windows Shut Down dialog"}, {"id": 3, "left": "Alt + Left Arrow", "right": "Go back to previous folder or web page"}, {"id": 4, "left": "Ctrl + W", "right": "Close currently active tab or window"}]}'
),

('ord-1', 'ordering', 2, 'System & Troubleshooting', 'Advanced',
 'Arrange the sequence of steps to open Windows Terminal or Command Prompt as Administrator using only your keyboard:',
 'Start with the Run dialog shortcut.',
 'The quickest keyboard sequence for admin shell: Win + R -> type wt/cmd -> Ctrl + Shift + Enter (runs as admin) -> Alt + Y / Enter to accept User Account Control.',
 '{"items": [{"id": "s1", "text": "Press Win + R to open the Run dialog box"}, {"id": "s2", "text": "Type \\"wt\\" (Windows Terminal) or \\"cmd\\" into the Open field"}, {"id": "s3", "text": "Press Ctrl + Shift + Enter to run with elevated Administrator privileges"}, {"id": "s4", "text": "Press Left Arrow and Enter (or Alt + Y) to confirm the UAC prompt"}], "correctOrder": ["s1", "s2", "s3", "s4"]}'
),

('ord-2', 'ordering', 2, 'System & Troubleshooting', 'Intermediate',
 'You have a frozen app and want to terminate it cleanly using Task Manager without touching the mouse. Order the steps:',
 'Open Task Manager first with its direct 3-key shortcut.',
 'Task Manager keyboard workflow: Ctrl + Shift + Esc -> navigate with arrow keys -> Delete or Alt + E terminates the highlighted task.',
 '{"items": [{"id": "t1", "text": "Press Ctrl + Shift + Esc to summon Task Manager"}, {"id": "t2", "text": "Use Down/Up Arrow keys to highlight the frozen application"}, {"id": "t3", "text": "Press the Delete key (or Alt + E) to trigger End Task"}, {"id": "t4", "text": "Press Enter or Spacebar to confirm process termination if prompted"}], "correctOrder": ["t1", "t2", "t3", "t4"]}'
),

('tf-1', 'true_false', 7, 'Windows Power Keys', 'Beginner',
 'True or False:',
 'Think about what happens the first time you press Win + V on a fresh Windows install.',
 'True! Windows requires you to enable Clipboard History (which you can do right from the Win + V popup overlay the first time you use it) before it begins caching multiple clips.',
 '{"statement": "Pressing Win + V allows you to access a history of multiple copied items (text and screenshots), but only after you have enabled Clipboard History in Windows settings.", "correctAnswer": true}'
),

('tf-2', 'true_false', 1, 'Essential Windows Navigation', 'Intermediate',
 'True or False:',
 'What closes individual tabs vs what terminates an application window?',
 'False! Alt + F4 closes the entire active application window (not just a tab, which is Ctrl + W). If your desktop has focus with no windows open, Alt + F4 brings up the Windows Shut Down menu.',
 '{"statement": "Pressing Alt + F4 will ONLY close browser tabs and will never close an entire application or prompt to shut down your PC.", "correctAnswer": false}'
),

('tf-3', 'true_false', 7, 'Windows Power Keys', 'Intermediate',
 'True or False:',
 'The Game Bar is usable on any desktop window.',
 'True! Win + G opens the Xbox Game Bar overlay on any Windows 10/11 PC, allowing quick screen recording and system performance monitoring.',
 '{"statement": "Win + G opens the Xbox Game Bar overlay, which includes built-in screen recording, audio mixer, and performance widgets even for non-gaming apps.", "correctAnswer": true}'
),

('lp-1', 'live_press', 8, 'Interactive Keyboard Practice', 'Beginner',
 'Hands on keyboard! Press the shortcut to summon the Windows Run dialog box:',
 'Hold the Windows key and tap the letter R.',
 'Win + R summons the Run dialog, the fastest gateway to commands, settings shortcuts, and executables.',
 '{"displayCombo": "Win + R", "targetKeys": ["Win", "R"], "description": "Press the physical keys on your keyboard, or click the virtual keys below if your browser or OS intercepts this key.", "virtualKeys": ["Win", "Ctrl", "Alt", "Shift", "R", "E", "D", "L", "V"]}'
),

('lp-2', 'live_press', 8, 'Interactive Keyboard Practice', 'Beginner',
 'Hands on keyboard! Press the universal shortcut to Copy highlighted content to the clipboard:',
 'Hold Ctrl and tap C.',
 'Ctrl + C copies the selection to the clipboard. (Pair with Ctrl + V to paste or Win + V for clipboard history).',
 '{"displayCombo": "Ctrl + C", "targetKeys": ["Ctrl", "C"], "description": "Press the physical keys on your keyboard, or click the virtual keys below.", "virtualKeys": ["Ctrl", "Win", "Shift", "Alt", "C", "V", "X", "Z"]}'
),

('ooo-1', 'odd_one_out', 5, 'Window Snapping & Layout', 'Intermediate',
 'Three of these shortcuts control Windows Snap (moving and snapping windows). One is an IMPOSTER that does something else. Spot the imposter:',
 'Look for the shortcut that relates to external displays rather than window position.',
 'Win + P opens the Project / Display flyout menu (Duplicate, Extend, Second screen only), whereas Win + Left, Up, and Down are all core Windows Snap window layout controls.',
 '{"theme": "Windows Snap Controls", "imposterId": "opt-4", "imposterReason": "Win + P opens the Project / Display flyout menu (Duplicate, Extend, Second screen only), whereas Win + Left, Up, and Down are all core Windows Snap window layout controls.", "options": [{"id": "opt-1", "text": "Win + Left Arrow", "description": "Snaps window to the left half of screen"}, {"id": "opt-2", "text": "Win + Up Arrow", "description": "Maximizes the window or snaps top half"}, {"id": "opt-3", "text": "Win + Down Arrow", "description": "Restores window down or minimizes"}, {"id": "opt-4", "text": "Win + P", "description": "Opens Project / Multiple Display projection sidebar"}]}'
),

('ooo-2', 'odd_one_out', 6, 'Virtual Desktops', 'Advanced',
 'Three of these shortcuts manage Virtual Desktops in Windows. Which one is the IMPOSTER that does NOT belong to virtual desktops?',
 'One of them is a common File Explorer shortcut.',
 'Win + E opens File Explorer. Win + Ctrl + D, Win + Ctrl + F4, and Win + Ctrl + Right Arrow are all Virtual Desktop management shortcuts.',
 '{"theme": "Virtual Desktop Commands", "imposterId": "opt-4", "imposterReason": "Win + E opens File Explorer. Win + Ctrl + D, Win + Ctrl + F4, and Win + Ctrl + Right Arrow are all Virtual Desktop management shortcuts.", "options": [{"id": "opt-1", "text": "Win + Ctrl + D", "description": "Creates a new virtual desktop"}, {"id": "opt-2", "text": "Win + Ctrl + F4", "description": "Closes the current virtual desktop"}, {"id": "opt-3", "text": "Win + Ctrl + Right Arrow", "description": "Switches to next virtual desktop on right"}, {"id": "opt-4", "text": "Win + E", "description": "Opens File Explorer"}]}'
);

-- ----------------------------------------------------------
-- SEED DATA: SAMPLE ATTEMPTS (For Leaderboard)
-- ----------------------------------------------------------
INSERT IGNORE INTO quiz_attempts (id, quiz_id, user_id, format_filter, score, max_score, total_answered, time_spent_seconds) VALUES
(1, 1, 2, 'all', 19, 20, 18, 142),
(3, 2, 3, 'all', 15, 20, 18, 210);
