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
    display_name VARCHAR(100) NOT NULL,
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
-- 7. RESULT QUESTIONS (Per-Question Attempt Breakdown)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS result_questions (
    id INT NOT NULL AUTO_INCREMENT,
    result_id INT NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    attempts INT NOT NULL DEFAULT 1,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    score INT NOT NULL DEFAULT 0,
    user_answer TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (result_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- SEED DATA: CATEGORIES
-- ----------------------------------------------------------
INSERT IGNORE INTO categories (id, name, slug, description, icon, display_order) VALUES
(1, 'Essential Windows Navigation', 'essential-navigation', 'Core Windows shortcuts for navigating files, desktop, and locking the system.', 'navigation', 1),
(2, 'System & Troubleshooting', 'system-troubleshooting', 'Task Manager, system interrupts, diagnostics and recovery commands.', 'activity', 2),
(3, 'File Explorer & Windows Tools', 'file-explorer', 'Fast keyboard operations for managing directories, renaming, and properties.', 'folder', 3),
(4, 'Multitasking & Window Management', 'multitasking', 'App switching, Task View, and window focus management.', 'layers', 4),
(5, 'Window Snapping & Layout', 'window-snapping', 'Snap Assist, multi-monitor controls, and screen quadrant arrangements.', 'grid', 5),
(6, 'Virtual Desktops', 'virtual-desktops', 'Creating, switching, and organizing virtual workspaces in Windows 10/11.', 'monitor', 6),
(7, 'Windows Power Keys', 'power-keys', 'Clipboard history, emoji picker, Settings, and quick links.', 'zap', 7),
(8, 'Interactive Keyboard Practice', 'keyboard-practice', 'Live typing exercises testing muscle memory on common commands.', 'terminal', 8),
(9, 'Text Editing & Formatting', 'text-editing', 'Cut, copy, paste, cursor navigation, text selection, and word styling.', 'edit', 9),
(10, 'Taskbar & System Tray', 'taskbar', 'App launching, cycling pinned apps, jump lists, and system notification controls.', 'layout', 10),
(11, 'Dialog Boxes & Settings', 'dialogs-settings', 'Navigating dialog buttons, option tabs, checkboxes, and Windows Settings.', 'settings', 11);

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
(16, 'Power User Menu', 'Win + X', 'Opens context menu with Device Manager, Disk Mgmt, Terminal, etc.', 7, 'Intermediate'),
(18, 'Delete characters to the left of the cursor', 'Backspace', 'Delete characters to the left of the cursor.', 9, 'Beginner'),
(19, 'Select all text', 'Ctrl + A', 'Select all text.', 9, 'Beginner'),
(20, 'Apply the bold format to the selected text', 'Ctrl + B', 'Apply the bold format to the selected text.', 9, 'Beginner'),
(21, 'Delete words to the left of the cursor', 'Ctrl + Backspace', 'Delete words to the left of the cursor.', 9, 'Beginner'),
(22, 'Copy the selected text', 'Ctrl + C or Ctrl + Insert', 'Copy the selected text.', 9, 'Intermediate'),
(23, 'Delete words to the right of the cursor', 'Ctrl + Del', 'Delete words to the right of the cursor.', 9, 'Beginner'),
(24, 'Move the cursor forward to the beginning of the next...', 'Ctrl + Down Arrow', 'Move the cursor forward to the beginning of the next paragraph.', 9, 'Intermediate'),
(25, 'Move the cursor forward to the end of the document', 'Ctrl + End', 'Move the cursor forward to the end of the document.', 9, 'Beginner'),
(26, 'Find text', 'Ctrl + F', 'Find text.', 9, 'Beginner'),
(27, 'Find and replace text', 'Ctrl + H', 'Find and replace text.', 9, 'Beginner'),
(28, 'Move the cursor backward to the beginning of the doc...', 'Ctrl + Home', 'Move the cursor backward to the beginning of the document.', 9, 'Beginner'),
(29, 'Apply the italic format to the selected text', 'Ctrl + I', 'Apply the italic format to the selected text.', 9, 'Beginner'),
(30, 'Move the cursor backward to the beginning of the pre...', 'Ctrl + Left Arrow', 'Move the cursor backward to the beginning of the previous word.', 9, 'Intermediate'),
(31, 'Move the cursor forward to the beginning of the next...', 'Ctrl + Right Arrow', 'Move the cursor forward to the beginning of the next word.', 9, 'Intermediate'),
(32, 'Paste as plain text', 'Ctrl + Shift + V', 'Paste as plain text.', 9, 'Intermediate'),
(33, 'Apply the underline format to the selected text', 'Ctrl + U', 'Apply the underline format to the selected text.', 9, 'Beginner'),
(34, 'Move the cursor backward to the beginning of the pre...', 'Ctrl + Up Arrow', 'Move the cursor backward to the beginning of the previous paragraph.', 9, 'Intermediate'),
(35, 'Paste the last item from the clipboard', 'Ctrl + V or Shift + Insert', 'Paste the last item from the clipboard.', 9, 'Intermediate'),
(36, 'Cut the selected text', 'Ctrl + X', 'Cut the selected text.', 9, 'Beginner'),
(37, 'Redo typing that was undone with Ctrl+Z', 'Ctrl + Y', 'Redo typing that was undone with Ctrl+Z.', 9, 'Beginner'),
(38, 'Undo the last typing', 'Ctrl + Z', 'Undo the last typing.', 9, 'Beginner'),
(39, 'Delete characters to the right of the cursor', 'Del or Del', 'Delete characters to the right of the cursor.', 9, 'Beginner'),
(40, 'Move the cursor forward to the next line', 'Down Arrow', 'Move the cursor forward to the next line.', 9, 'Beginner'),
(41, 'Move the cursor forward to the end of the line', 'End', 'Move the cursor forward to the end of the line.', 9, 'Beginner'),
(42, 'Move the cursor backward to the beginning of the line', 'Home', 'Move the cursor backward to the beginning of the line.', 9, 'Beginner'),
(43, 'Move the cursor backward to the previous character', 'Left Arrow', 'Move the cursor backward to the previous character.', 9, 'Beginner'),
(44, 'Move the cursor forward by one page', 'Page Down or PgDn', 'Move the cursor forward by one page.', 9, 'Beginner'),
(45, 'Move the cursor backward by one page', 'Page Up or PgUp', 'Move the cursor backward by one page.', 9, 'Beginner'),
(46, 'Move the cursor forward to the next character', 'Right Arrow', 'Move the cursor forward to the next character.', 9, 'Beginner'),
(47, 'Select paragraphs forward from the current cursor po...', 'Shift + Ctrl + Down Arrow', 'Select paragraphs forward from the current cursor position.', 9, 'Intermediate'),
(48, 'Select text between the current cursor position and...', 'Shift + Ctrl + End', 'Select text between the current cursor position and the end of the document.', 9, 'Intermediate'),
(49, 'Select text between the current cursor position and...', 'Shift + Ctrl + Home', 'Select text between the current cursor position and the beginning of the document.', 9, 'Intermediate'),
(50, 'Select words backward from the current cursor position', 'Shift + Ctrl + Left', 'Select words backward from the current cursor position.', 9, 'Intermediate'),
(51, 'Select words forward from the current cursor position', 'Shift + Ctrl + Right', 'Select words forward from the current cursor position.', 9, 'Intermediate'),
(52, 'Select paragraphs backward the current cursor position', 'Shift + Ctrl + Up', 'Select paragraphs backward the current cursor position.', 9, 'Intermediate'),
(53, 'Select lines forward from the current cursor position', 'Shift + Down Arrow', 'Select lines forward from the current cursor position.', 9, 'Intermediate'),
(54, 'Select text from the current cursor position to the...', 'Shift + End', 'Select text from the current cursor position to the end of the current line.', 9, 'Intermediate'),
(55, 'Select text from the current cursor position to the...', 'Shift + Home', 'Select text from the current cursor position to the beginning of the current line.', 9, 'Intermediate'),
(56, 'Select characters backward from the current cursor p...', 'Shift + Left Arrow', 'Select characters backward from the current cursor position.', 9, 'Intermediate'),
(57, 'Select one page of text forward from the current cur...', 'Shift + Page Down', 'Select one page of text forward from the current cursor position.', 9, 'Intermediate'),
(58, 'Select one page of text backward from the current cu...', 'Shift + Page Up', 'Select one page of text backward from the current cursor position.', 9, 'Intermediate'),
(59, 'Select characters forward from the current cursor po...', 'Shift + Right Arrow', 'Select characters forward from the current cursor position.', 9, 'Intermediate'),
(60, 'Select lines backward from the current cursor position', 'Shift + Up Arrow', 'Select lines backward from the current cursor position.', 9, 'Intermediate'),
(61, 'Indent the cursor one tab stop', 'Tab', 'Indent the cursor one tab stop.', 9, 'Beginner'),
(62, 'Move the cursor backward to the previous line', 'Up Arrow', 'Move the cursor backward to the previous line.', 9, 'Beginner'),
(63, 'Set focus to the first icon in the Suggested actions...', 'Alt + A', 'Set focus to the first icon in the Suggested actions menu.', 7, 'Beginner'),
(64, 'Cycle through windows in the order in which they wer...', 'Alt + Esc', 'Cycle through windows in the order in which they were opened.', 4, 'Intermediate'),
(65, 'Close the active window', 'Alt + F4', 'Close the active window. If no windows are open, prompt to shutdown.', 7, 'Beginner'),
(66, 'Show your password on the sign-in screen', 'Alt + F8', 'Show your password on the sign-in screen.', 7, 'Beginner'),
(67, 'Go back', 'Alt + Left Arrow', 'Go back.', 7, 'Intermediate'),
(68, 'Move down one screen', 'Alt + Page Down', 'Move down one screen.', 7, 'Beginner'),
(69, 'Move up one screen', 'Alt + Page Up', 'Move up one screen.', 7, 'Beginner'),
(70, 'Capture a screenshot of the active window and copy i...', 'Alt + PrtScn', 'Capture a screenshot of the active window and copy it to the clipboard.', 7, 'Beginner'),
(71, 'Go forward', 'Alt + Right Arrow', 'Go forward.', 7, 'Intermediate'),
(72, 'When a group or tile is in focus on the Start menu,...', 'Alt + Shift + Arrow keys', 'When a group or tile is in focus on the Start menu, move it in the specified direction.', 7, 'Intermediate'),
(73, 'Switch focus back to the host machine from Windows S...', 'Alt + Ctrl + Insert', 'Switch focus back to the host machine from Windows Sandbox.', 7, 'Intermediate'),
(74, 'Open the context menu for the active window', 'Alt + Space', 'Open the context menu for the active window.', 7, 'Beginner'),
(75, 'For actions in command or context menus', 'Alt + underlined letter', 'For actions in command or context menus, some windows and apps specify keyboard shortcuts by underlining a character in the action name. Press Alt and then the letter to do that action.', 7, 'Beginner'),
(76, 'Select all items in a window', 'Ctrl + A', 'Select all items in a window.', 7, 'Beginner'),
(77, 'Switch to the security screen where you can lock the...', 'Ctrl + Alt + Del', 'Switch to the security screen where you can lock the desktop, switch user, sign out, change a password, or open Task Manager.', 2, 'Intermediate'),
(78, 'View a thumbnail of all open apps', 'Ctrl + Alt + Tab', 'View a thumbnail of all open apps. Use the arrow keys to switch between open apps.', 4, 'Intermediate'),
(79, 'Open the Start menu', 'Ctrl + Esc', 'Open the Start menu.', 7, 'Intermediate'),
(80, 'In apps that are full-screen and let you have multip...', 'Ctrl + F4', 'In apps that are full-screen and let you have multiple documents open at the same time, close the active document but not the entire app.', 7, 'Beginner'),
(81, 'Refresh the current window', 'Ctrl + F5 or Ctrl + R', 'Refresh the current window.', 7, 'Intermediate'),
(82, 'When multiple keyboard layouts are available', 'Ctrl + Shift', 'When multiple keyboard layouts are available, switch the keyboard layout.', 7, 'Intermediate'),
(83, 'When a tile is in focus on the Start menu', 'Ctrl + Shift + Arrow keys', 'When a tile is in focus on the Start menu, move it into another tile to create a folder.', 7, 'Intermediate'),
(84, 'Enable or disable the Chinese input method editor (IME)', 'Ctrl + Space', 'Enable or disable the Chinese input method editor (IME). For more information, see Microsoft Simplified Chinese IME and Microsoft Traditional Chinese IME.', 7, 'Beginner'),
(85, 'Redo an action that was previously undone with Ctrl+Z', 'Ctrl + Y', 'Redo an action that was previously undone with Ctrl+Z.', 7, 'Beginner'),
(86, 'Undo the previous action', 'Ctrl + Z', 'Undo the previous action.', 7, 'Beginner'),
(87, 'Stop or leave the current task, or dismiss a dialog box', 'Esc or Esc', 'Stop or leave the current task, or dismiss a dialog box.', 11, 'Beginner'),
(88, 'Refresh the active window', 'F5', 'Refresh the active window.', 7, 'Beginner'),
(89, 'Cycle through elements in a window or on the desktop', 'F6', 'Cycle through elements in a window or on the desktop.', 7, 'Beginner'),
(90, 'Activate the menu bar in the active window', 'F10', 'Activate the menu bar in the active window.', 7, 'Beginner'),
(91, 'Select a region of the screen to capture a screensho...', 'PrtScn or PrtScn', 'Select a region of the screen to capture a screenshot to the clipboard. You can then open the Snipping Tool to share or markup the image. Note: You can turn off this default behavior. Select Start > Settings > Accessibility > Keyboard , and set Use the Print Screen button to open screen snipping to Off. Open the Settings app', 11, 'Beginner'),
(92, 'Open the Windows 11 action center', 'Win + A', 'Open the Windows 11 action center.', 7, 'Beginner'),
(93, 'Set focus to a Windows tip when one is available', 'Win + Shift + A', 'Set focus to a Windows tip when one is available. When a Windows tip appears, bring focus to the tip. Press the keys again to bring focus to the element on the screen to which the Windows tip is anchored.', 7, 'Intermediate'),
(94, 'Turn high dynamic range (HDR) on or off', 'Win + Alt + B', 'Turn high dynamic range (HDR) on or off. For more information, see What is HDR in Windows?.', 7, 'Intermediate'),
(97, 'Display and hide the date and time on the desktop', 'Win + Alt + D', 'Display and hide the date and time on the desktop.', 7, 'Intermediate'),
(98, 'Snap the active window to the bottom half of the screen', 'Win + Alt + Down Arrow', 'Snap the active window to the bottom half of the screen.', 5, 'Intermediate'),
(99, 'When voice typing is open', 'Win + Alt + H', 'When voice typing is open, set the focus to the keyboard.', 7, 'Intermediate'),
(100, 'Mute or unmute the microphone in supported apps', 'Win + Alt + K', 'Mute or unmute the microphone in supported apps.', 7, 'Intermediate'),
(101, 'Snap the active window to the top half of the screen', 'Win + Alt + Up Arrow', 'Snap the active window to the top half of the screen.', 5, 'Intermediate'),
(102, 'Temporarily peek at the desktop', 'Win + comma (,)', 'Temporarily peek at the desktop.', 7, 'Beginner'),
(103, 'If turned on in settings', 'Win + Ctrl + C', 'If turned on in settings, enable or disable color filters. Open the Settings app', 11, 'Intermediate'),
(104, 'Open Narrator', 'Win + Ctrl + Enter', 'Open Narrator.', 7, 'Intermediate'),
(105, 'Search for devices on a network', 'Win + Ctrl + F', 'Search for devices on a network.', 7, 'Intermediate'),
(106, 'Open Quick Assist', 'Win + Ctrl + Q', 'Open Quick Assist.', 7, 'Intermediate'),
(107, 'Wake up the device when the screen is blank or black', 'Win + Ctrl + Shift + B', 'Wake up the device when the screen is blank or black.', 7, 'Advanced'),
(108, 'Change to a previously selected input option', 'Win + Ctrl + Space', 'Change to a previously selected input option.', 7, 'Intermediate'),
(109, 'Open the sound output page of quick settings', 'Win + Ctrl + V', 'Open the sound output page of quick settings, which includes settings for the output device, spatial sound, and the volume mixer.', 7, 'Intermediate'),
(110, 'Minimize the active window', 'Win + Down Arrow', 'Minimize the active window.', 5, 'Intermediate'),
(111, 'Close Magnifier', 'Win + Esc', 'Close Magnifier.', 7, 'Intermediate'),
(112, 'Open Feedback Hub', 'Win + F', 'Open Feedback Hub.', 7, 'Beginner'),
(113, 'Start input method editor (IME) reconversion', 'Win + forward slash ( or )', 'Start input method editor (IME) reconversion.', 7, 'Beginner'),
(114, 'Open the Game Bar', 'Win + G', 'Open the Game Bar. For more information, see Keyboard shortcuts for Game Bar.', 7, 'Beginner'),
(115, 'Open voice dictation', 'Win + H', 'Open voice dictation.', 7, 'Beginner'),
(116, 'Minimize or restore all windows except the active wi...', 'Win + Home', 'Minimize or restore all windows except the active window.', 7, 'Beginner'),
(117, 'Open Settings', 'Win + I', 'Open Settings.', 7, 'Beginner'),
(118, 'Open Recall', 'Win + J', 'Open Recall. (Available on devices that meet the minimum system requirements)', 7, 'Beginner'),
(119, 'Open Cast from Quick Settings to connect to a display', 'Win + K', 'Open Cast from Quick Settings to connect to a display. For more information, see Screen mirroring and projecting to your PC or wireless display.', 7, 'Beginner'),
(120, 'Snap the window to the left side of the screen', 'Win + Left Arrow', 'Snap the window to the left side of the screen.', 5, 'Intermediate'),
(121, 'Minimize all windows', 'Win + M', 'Minimize all windows.', 7, 'Beginner'),
(122, 'Zoom out in Magnifier', 'Win + Minus (-)', 'Zoom out in Magnifier.', 7, 'Beginner'),
(123, 'Open notification center and calendar', 'Win + N', 'Open notification center and calendar.', 7, 'Beginner'),
(124, 'Lock the device orientation', 'Win + O', 'Lock the device orientation.', 7, 'Beginner'),
(125, 'Open project settings to choose a presentation displ...', 'Win + P', 'Open project settings to choose a presentation display mode.', 7, 'Beginner'),
(126, 'Opens the Settings app to the System > About page', 'Win + Pause', 'Opens the Settings app to the System > About page.', 11, 'Beginner'),
(127, 'Open the emoji panel', 'Win + Period (.) or Win + Semicolon (;)', 'Open the emoji panel.', 7, 'Intermediate'),
(128, 'Zoom in with the Magnifier', 'Win + Plus ( + )', 'Zoom in with the Magnifier.', 7, 'Intermediate'),
(129, 'Capture a full screen screenshot and save it to a fi...', 'Win + PrtScn', 'Capture a full screen screenshot and save it to a file in the Screenshots subfolder of the Pictures folder.', 7, 'Beginner'),
(130, 'Open search', 'Win + Q', 'Open search.', 7, 'Beginner'),
(131, 'Snap the window to the right side of the screen', 'Win + Right Arrow', 'Snap the window to the right side of the screen.', 5, 'Intermediate'),
(132, 'Open search', 'Win + S', 'Open search.', 7, 'Beginner'),
(133, 'If a window is snapped or maximized, restore it', 'Win + Shift + Down Arrow', 'If a window is snapped or maximized, restore it.', 5, 'Intermediate'),
(134, 'If the active window is a Universal Windows Platform...', 'Win + Shift + Enter', 'If the active window is a Universal Windows Platform (UWP) app, make it full screen.', 7, 'Intermediate'),
(135, 'Move the active window to the monitor on the left', 'Win + Shift + Left Arrow', 'Move the active window to the monitor on the left.', 5, 'Intermediate'),
(136, 'Restore minimized windows', 'Win + Shift + M', 'Restore minimized windows.', 7, 'Intermediate'),
(137, 'Select a region of the screen to record a video', 'Win + Shift + R', 'Select a region of the screen to record a video. It then opens the screen recording in the Snipping Tool. By default, this screen recording is automatically saved as an MP4 file in the Screen Recordings subfolder of your Videos folder.', 7, 'Intermediate'),
(138, 'Move the active window to the monitor on the right', 'Win + Shift + Right Arrow', 'Move the active window to the monitor on the right.', 5, 'Intermediate'),
(139, 'Switch backward through input languages and keyboard...', 'Win + Shift + Space', 'Switch backward through input languages and keyboard layouts.', 7, 'Intermediate'),
(140, 'Stretch the desktop window to the top and bottom of...', 'Win + Shift + Up Arrow', 'Stretch the desktop window to the top and bottom of the screen.', 5, 'Intermediate'),
(141, 'Cycle through notifications', 'Win + Shift + V', 'Cycle through notifications.', 7, 'Intermediate'),
(142, 'Switch forward through input languages and keyboard...', 'Win + Space', 'Switch forward through input languages and keyboard layouts.', 7, 'Beginner'),
(143, 'Open the Settings app to the Accessibility section', 'Win + U', 'Open the Settings app to the Accessibility section.', 11, 'Beginner'),
(144, 'Open Widgets', 'Win + W', 'Open Widgets.', 7, 'Beginner'),
(145, 'Switch input between Windows Mixed Reality and your...', 'Win + Y', 'Switch input between Windows Mixed Reality and your desktop.', 7, 'Beginner'),
(146, 'Open the snap layouts', 'Win + Z', 'Open the snap layouts.', 5, 'Beginner'),
(147, 'Paste the selected text', 'Ctrl + V or Shift + Insert', 'Paste the selected text.', 9, 'Intermediate'),
(148, 'Enter Mark mode', 'Ctrl + M', 'Enter Mark mode.', 2, 'Beginner'),
(149, 'Begin selection in block mode', 'Alt + selection key', 'Begin selection in block mode.', 2, 'Beginner'),
(150, 'Move the cursor in the direction specified', 'Arrow keys', 'Move the cursor in the direction specified.', 9, 'Beginner'),
(151, 'Move the cursor by one page up', 'Page Up', 'Move the cursor by one page up.', 9, 'Beginner'),
(152, 'Move the cursor by one page down', 'Page Down', 'Move the cursor by one page down.', 9, 'Beginner'),
(153, 'Move the cursor to the beginning of the buffer', 'Ctrl + Home (Mark mode)', 'Move the cursor to the beginning of the buffer.', 9, 'Beginner'),
(154, 'Move the cursor to the end of the buffer', 'Ctrl + End (Mark mode)', 'Move the cursor to the end of the buffer.', 9, 'Beginner'),
(155, 'Move up one line in the output history', 'Ctrl + Up Arrow', 'Move up one line in the output history.', 2, 'Intermediate'),
(156, 'Move down one line in the output history', 'Ctrl + Down Arrow', 'Move down one line in the output history.', 2, 'Intermediate'),
(157, 'If the command line is empty', 'Ctrl + Home (History navigation)', 'If the command line is empty, move the viewport to the top of the buffer. Otherwise, delete all the characters to the left of the cursor in the command line.', 9, 'Beginner'),
(158, 'If the command line is empty', 'Ctrl + End (History navigation)', 'If the command line is empty, move the viewport to the command line. Otherwise, delete all the characters to the right of the cursor in the command line.', 9, 'Beginner'),
(159, 'Display the items in the active list', 'F4', 'Display the items in the active list.', 11, 'Beginner'),
(160, 'Move forward through tabs', 'Ctrl + Tab', 'Move forward through tabs.', 11, 'Intermediate'),
(161, 'Move back through tabs', 'Ctrl + Shift + Tab', 'Move back through tabs.', 11, 'Intermediate'),
(162, 'Move to that tab number', 'Ctrl + 1, 2, 3,...', 'Move to that tab number.', 11, 'Beginner'),
(163, 'Move forward through options', 'Tab', 'Move forward through options.', 11, 'Beginner'),
(164, 'Move back through options', 'Shift + Tab', 'Move back through options.', 11, 'Intermediate'),
(165, 'Perform the command (or select the option) that is u...', 'Alt + underlined letter', 'Perform the command (or select the option) that is used with that letter.', 11, 'Beginner'),
(166, 'Select or clear the check box if the active option i...', 'Space', 'Select or clear the check box if the active option is a check box.', 11, 'Beginner'),
(167, 'Open a folder one level up if a folder is selected i...', 'Backspace', 'Open a folder one level up if a folder is selected in the Save As or Open dialog box.', 11, 'Beginner'),
(168, 'Select a button if the active option is a group of o...', 'Arrow keys', 'Select a button if the active option is a group of option buttons.', 11, 'Beginner'),
(169, 'Select the address bar', 'Alt + D', 'Select the address bar.', 3, 'Beginner'),
(170, 'Display properties for the selected item', 'Alt + Enter', 'Display properties for the selected item.', 3, 'Beginner'),
(171, 'Navigate to the previous folder', 'Alt + Left Arrow or Backspace', 'Navigate to the previous folder.', 3, 'Intermediate'),
(172, 'When you drop the file', 'Alt + mouse drag a file', 'When you drop the file, create a shortcut to the original file in that location.', 3, 'Beginner'),
(173, 'Show or hide the preview pane', 'Alt + P', 'Show or hide the preview pane.', 3, 'Beginner'),
(174, 'View the next folder', 'Alt + Right Arrow', 'View the next folder.', 3, 'Intermediate'),
(175, 'Show or hide the details pane', 'Alt + Shift + P', 'Show or hide the details pane.', 3, 'Intermediate'),
(176, 'Move up a level in the folder path', 'Alt + Up Arrow', 'Move up a level in the folder path.', 3, 'Intermediate'),
(177, 'Select multiple individual items', 'Ctrl + Arrow key (to move to an item) + Space', 'Select multiple individual items.', 3, 'Intermediate'),
(178, 'Delete the selected item and move it to the Recycle Bin', 'Ctrl + D or Del', 'Delete the selected item and move it to the Recycle Bin.', 3, 'Beginner'),
(179, 'Select the search box', 'Ctrl + E or Ctrl + F', 'Select the search box.', 3, 'Intermediate'),
(180, 'Focus on the address bar', 'Ctrl + L', 'Focus on the address bar.', 3, 'Beginner'),
(181, 'When you drop the file, create a copy in that location', 'Ctrl + mouse drag a file', 'When you drop the file, create a copy in that location.', 3, 'Beginner'),
(182, 'Change the size and appearance of file and folder icons', 'Ctrl + mouse scroll wheel', 'Change the size and appearance of file and folder icons.', 3, 'Beginner'),
(183, 'Open a new window', 'Ctrl + N', 'Open a new window.', 3, 'Beginner'),
(184, 'Move to that tab number', 'Ctrl + Number (1-9)', 'Move to that tab number.', 3, 'Beginner'),
(185, 'Resize all columns to fit text', 'Ctrl + Plus ( + )', 'Resize all columns to fit text. Note: This shortcut requires using a numeric keypad.', 3, 'Intermediate'),
(186, 'Expands all folders from the tree in the navigation...', 'Ctrl + Shift + E', 'Expands all folders from the tree in the navigation pane.', 3, 'Intermediate'),
(187, 'Create a new folder', 'Ctrl + Shift + N', 'Create a new folder.', 3, 'Intermediate'),
(188, 'Change the view style', 'Ctrl + Shift + Number (1-9)', 'Change the view style. For example, 2 is Large icons and 6 is Details.', 3, 'Intermediate'),
(189, 'Move to the previous tab', 'Ctrl + Shift + Tab', 'Move to the previous tab.', 3, 'Intermediate'),
(190, 'Open a new tab and switch to it', 'Ctrl + T', 'Open a new tab and switch to it.', 3, 'Beginner'),
(191, 'Closes the active tab', 'Ctrl + W', 'Closes the active tab. Closes the window if there''s only one tab open.', 3, 'Beginner'),
(192, 'Move to the next tab', 'Ctrl + Tab', 'Move to the next tab.', 3, 'Intermediate'),
(193, 'Scroll to the bottom of the active window', 'End', 'Scroll to the bottom of the active window.', 3, 'Beginner'),
(194, 'Rename the selected item', 'F2', 'Rename the selected item.', 3, 'Beginner'),
(195, 'Search for a file or folder', 'F3', 'Search for a file or folder.', 3, 'Beginner'),
(196, 'Select the address bar to change the current path', 'F4', 'Select the address bar to change the current path.', 3, 'Beginner'),
(197, 'Refresh the window', 'F5', 'Refresh the window.', 3, 'Beginner'),
(198, 'Cycle through elements in the window', 'F6', 'Cycle through elements in the window.', 3, 'Beginner'),
(199, 'Maximize or minimize the active window', 'F11', 'Maximize or minimize the active window.', 3, 'Beginner'),
(200, 'Scroll to the top of the active window', 'Home', 'Scroll to the top of the active window.', 3, 'Beginner'),
(201, 'Collapse the current selection (if it''s expanded)', 'Left Arrow', 'Collapse the current selection (if it''s expanded), or select the folder that the folder was in.', 3, 'Beginner'),
(202, 'Display the current selection (if it''s collapsed)', 'Right Arrow', 'Display the current selection (if it''s collapsed), or select the first subfolder.', 3, 'Beginner'),
(203, 'Select multiple items', 'Shift + Arrow keys', 'Select multiple items.', 3, 'Intermediate'),
(204, 'Permanently delete the selected item without moving...', 'Shift + Del', 'Permanently delete the selected item without moving it to the Recycle Bin.', 3, 'Intermediate'),
(205, 'Display the context menu for the selected item', 'Shift + F10', 'Display the context menu for the selected item.', 3, 'Intermediate'),
(206, 'When you drop the file, move it to that location', 'Shift + mouse drag a file', 'When you drop the file, move it to that location.', 3, 'Intermediate'),
(207, 'Display the Show more options context menu for the s...', 'Shift + mouse right-click', 'Display the Show more options context menu for the selected item.', 3, 'Intermediate'),
(208, 'Switch between other desktops you''ve created on the...', 'Win + Ctrl + Right Arrow', 'Switch between other desktops you''ve created on the right.', 6, 'Intermediate'),
(209, 'Switch between other desktops you''ve created on the...', 'Win + Ctrl + Left Arrow', 'Switch between other desktops you''ve created on the left.', 6, 'Intermediate'),
(210, 'When an app icon is in focus', 'Alt + Shift + Arrow', 'When an app icon is in focus, move it''s position in the direction of the arrow.', 10, 'Intermediate'),
(211, 'When multiple windows for the same app are grouped o...', 'Ctrl + select a grouped app icon on the taskbar', 'When multiple windows for the same app are grouped on the taskbar, press Ctrl as you select the taskbar icon to shift focus through the windows in the app group.', 10, 'Beginner'),
(212, 'Open the app as an administrator', 'Ctrl + Shift + select an app icon on the taskbar', 'Open the app as an administrator.', 10, 'Intermediate'),
(213, 'Show the window menu for the app', 'Shift + right-click an app icon on the taskbar', 'Show the window menu for the app.', 10, 'Intermediate'),
(214, 'Show the window menu for the group', 'Shift + right-click a grouped taskbar button', 'Show the window menu for the group.', 10, 'Intermediate'),
(215, 'Open another instance of the app', 'Shift + select an app icon on the taskbar', 'Open another instance of the app.', 10, 'Intermediate'),
(216, 'Open taskbar settings', 'Win + Alt + Enter (on taskbar item focus)', 'Open taskbar settings.', 10, 'Intermediate'),
(217, 'Open the jump list for the app pinned to the taskbar...', 'Win + Alt + number (0-9)', 'Open the jump list for the app pinned to the taskbar in the position indicated by the number.', 10, 'Intermediate'),
(218, 'Set the focus to the first icon in the notification...', 'Win + B', 'Set the focus to the first icon in the notification area of the taskbar.', 10, 'Beginner'),
(219, 'Switch to the last active window of the app pinned t...', 'Win + Ctrl + number (0-9)', 'Switch to the last active window of the app pinned to the taskbar in the position indicated by the number.', 10, 'Intermediate'),
(220, 'Open as an administrator a new instance of the app l...', 'Win + Ctrl + Shift + number (0-9)', 'Open as an administrator a new instance of the app located at the given position on the taskbar.', 10, 'Advanced'),
(221, 'Open the app pinned to the taskbar in the position i...', 'Win + number (0-9)', 'Open the app pinned to the taskbar in the position indicated by the number. If the app is already running, switch to that app.', 10, 'Beginner'),
(222, 'Start a new instance of the app pinned to the taskba...', 'Win + Shift + Number (0-9)', 'Start a new instance of the app pinned to the taskbar in the position indicated by the number.', 10, 'Intermediate'),
(223, 'Cycle through apps in the taskbar', 'Win + T', 'Cycle through apps in the taskbar. When connected to multiple monitors, continued use will cycle through apps on all available displays.', 10, 'Beginner'),
(224, 'Move to the previous app in the taskbar', 'Win + Shift + T', 'Move to the previous app in the taskbar. When connected to multiple monitors, continued use will cycle through apps on all available displays.', 10, 'Intermediate'),
(225, 'Move focus through the currently selected region', 'Arrow keys', 'Move focus through the currently selected region. Scroll the page.', 11, 'Beginner'),
(226, 'Navigate backwards', 'Backspace', 'Navigate backwards.', 11, 'Beginner'),
(227, 'Select the current item in focus', 'Enter or Space', 'Select the current item in focus.', 11, 'Beginner'),
(228, 'Cycle backward through regions', 'Shift + Tab', 'Cycle backward through regions.', 11, 'Intermediate'),
(229, 'Cycle forward through regions', 'Tab', 'Cycle forward through regions.', 11, 'Beginner'),
(230, 'Open the Settings app', 'Win + I', 'Open the Settings app.', 11, 'Beginner'),
(231, 'Cut the selected item', 'Ctrl + X', 'Cut the selected item.', 1, 'Beginner'),
(232, 'Copy the selected item', 'Ctrl + C or Ctrl + Insert', 'Copy the selected item.', 1, 'Intermediate'),
(233, 'Paste the selected item', 'Ctrl + V or Shift + Insert', 'Paste the selected item.', 1, 'Intermediate'),
(234, 'Undo an action', 'Ctrl + Z', 'Undo an action.', 1, 'Beginner'),
(235, 'Close the active item, or exit the active app', 'Alt + F4', 'Close the active item, or exit the active app.', 1, 'Beginner'),
(236, 'Search for a file or folder in File Explorer', 'F3', 'Search for a file or folder in File Explorer.', 3, 'Beginner'),
(237, 'Display the address bar list in File Explorer', 'F4', 'Display the address bar list in File Explorer.', 3, 'Beginner'),
(238, 'Cycle through screen elements in a window or on the...', 'F6', 'Cycle through screen elements in a window or on the desktop.', 1, 'Beginner'),
(239, 'Cycle through items in the order in which they were...', 'Alt + Esc', 'Cycle through items in the order in which they were opened.', 4, 'Intermediate'),
(240, 'Perform the command for that letter', 'Alt + underlined letter', 'Perform the command for that letter.', 1, 'Beginner'),
(241, 'Open the shortcut menu for the active window', 'Alt + Space', 'Open the shortcut menu for the active window.', 1, 'Beginner'),
(242, 'Close the active document (in apps that are full-scr...', 'Ctrl + F4', 'Close the active document (in apps that are full-screen and let you have multiple documents open at the same time).', 1, 'Beginner'),
(243, 'Select all items in a document or window', 'Ctrl + A', 'Select all items in a document or window.', 1, 'Beginner'),
(244, 'Refresh the active window', 'Ctrl + R or F5', 'Refresh the active window.', 1, 'Beginner'),
(245, 'Redo an action', 'Ctrl + Y', 'Redo an action.', 1, 'Beginner'),
(246, 'Move the cursor to the beginning of the next word', 'Ctrl + Right Arrow', 'Move the cursor to the beginning of the next word.', 9, 'Intermediate'),
(247, 'Move the cursor to the beginning of the previous word', 'Ctrl + Left Arrow', 'Move the cursor to the beginning of the previous word.', 9, 'Intermediate'),
(248, 'Move the cursor to the beginning of the next paragraph', 'Ctrl + Down Arrow', 'Move the cursor to the beginning of the next paragraph.', 9, 'Intermediate'),
(249, 'Move the cursor to the beginning of the previous par...', 'Ctrl + Up Arrow', 'Move the cursor to the beginning of the previous paragraph.', 9, 'Intermediate'),
(250, 'Use the arrow keys to switch between all open apps', 'Ctrl + Alt + Tab', 'Use the arrow keys to switch between all open apps.', 4, 'Intermediate'),
(251, 'Resize the Start menu when it''s open', 'Ctrl + Arrow keys', 'Resize the Start menu when it''s open.', 1, 'Intermediate'),
(252, 'Select a block of text', 'Ctrl + Shift with an arrow key', 'Select a block of text.', 1, 'Intermediate'),
(253, 'Open Start', 'Ctrl + Esc', 'Open Start.', 1, 'Intermediate'),
(254, 'Switch the keyboard layout when multiple keyboard la...', 'Ctrl + Shift', 'Switch the keyboard layout when multiple keyboard layouts are available.', 1, 'Intermediate'),
(255, 'Turn the Chinese input method editor (IME) on or off', 'Ctrl + Space', 'Turn the Chinese input method editor (IME) on or off.', 1, 'Beginner'),
(256, 'Display the shortcut menu for the selected item', 'Shift + F10', 'Display the shortcut menu for the selected item.', 1, 'Intermediate'),
(257, 'Select more than one item in a window or on the desk...', 'Shift with any arrow key', 'Select more than one item in a window or on the desktop, or select text in a document.', 1, 'Beginner'),
(258, 'Delete the selected item without moving it to the Re...', 'Shift + Del', 'Delete the selected item without moving it to the Recycle Bin first.', 1, 'Intermediate'),
(259, 'Open the next menu to the right, or open a submenu', 'Right Arrow', 'Open the next menu to the right, or open a submenu.', 1, 'Beginner'),
(260, 'Open the next menu to the left, or close a submenu', 'Left Arrow', 'Open the next menu to the left, or close a submenu.', 1, 'Beginner'),
(261, 'Stop or leave the current task', 'Esc', 'Stop or leave the current task.', 1, 'Beginner'),
(262, 'Take a screenshot of your whole screen and copy it t...', 'PrtScn', 'Take a screenshot of your whole screen and copy it to the clipboard. Note: You can change this shortcut so it also opens screen snipping, which lets you edit your screenshot. Select Start ** > Settings > Ease of Access > Keyboard, and turn on the toggle under Print Screen shortcut. Use PrtScn key to open screen snipping', 7, 'Beginner'),
(263, 'Open Action center', 'Win + A', 'Open Action center.', 7, 'Beginner'),
(264, 'Set focus in the notification area', 'Win + B', 'Set focus in the notification area.', 10, 'Beginner'),
(265, 'Open Cortana in listening mode', 'Win + C', 'Open Cortana in listening mode. Notes: This shortcut is turned off by default. To turn it on, select Start > Settings > Cortana, and turn on the toggle under Let Cortana listen for my commands when I press the Windows key+C.Cortana is available only in certain countries regions, and some Cortana features might not be available everywhere. If Cortana isn''t available or is turned off, you can still use search.', 7, 'Beginner'),
(266, 'Open the charms menu', 'Win + Shift + C', 'Open the charms menu.', 7, 'Intermediate'),
(267, 'Open Feedback Hub and take a screenshot', 'Win + F', 'Open Feedback Hub and take a screenshot.', 7, 'Beginner'),
(268, 'Open Game bar when a game is open', 'Win + G', 'Open Game bar when a game is open.', 7, 'Beginner'),
(269, 'Turn HDR on or off', 'Win + Alt + B', 'Turn HDR on or off. Note: Applies to the Game Bar app version 5.721.7292.0 or newer. To update your Game Bar, go to the Microsoft Store app and check for updates.', 7, 'Intermediate'),
(270, 'Start dictation', 'Win + H', 'Start dictation.', 7, 'Beginner'),
(271, 'Open the Connect quick action', 'Win + K', 'Open the Connect quick action.', 7, 'Beginner'),
(272, 'Lock device orientation', 'Win + O', 'Lock device orientation.', 7, 'Beginner'),
(273, 'Choose a presentation display mode', 'Win + P', 'Choose a presentation display mode.', 7, 'Beginner'),
(274, 'Cycle through apps on the taskbar', 'Win + T', 'Cycle through apps on the taskbar.', 10, 'Beginner'),
(275, 'Open Ease of Access Center', 'Win + U', 'Open Ease of Access Center.', 7, 'Beginner'),
(276, 'Show the commands available in an app in full-screen...', 'Win + Z', 'Show the commands available in an app in full-screen mode.', 7, 'Beginner'),
(277, 'Open emoji panel', 'Win + period (.) or semicolon (;)', 'Open emoji panel.', 7, 'Beginner'),
(278, 'Display the System Properties dialog box', 'Win + Pause', 'Display the System Properties dialog box.', 11, 'Beginner'),
(279, 'Search for PCs (if you''re on a network)', 'Win + Ctrl + F', 'Search for PCs (if you''re on a network).', 7, 'Intermediate'),
(280, 'Restore minimized windows on the desktop', 'Win + Shift + M', 'Restore minimized windows on the desktop.', 7, 'Intermediate'),
(281, 'Open the desktop and start the app pinned to the tas...', 'Win + number', 'Open the desktop and start the app pinned to the taskbar in the position indicated by the number. If the app is already running, switch to that app.', 10, 'Beginner'),
(282, 'Open the desktop and start a new instance of the app...', 'Win + Shift + number', 'Open the desktop and start a new instance of the app pinned to the taskbar in the position indicated by the number.', 10, 'Intermediate'),
(283, 'Open the desktop and switch to the last active windo...', 'Win + Ctrl + number', 'Open the desktop and switch to the last active window of the app pinned to the taskbar in the position indicated by the number.', 10, 'Intermediate'),
(284, 'Open the desktop and open the Jump List for the app...', 'Win + Alt + number', 'Open the desktop and open the Jump List for the app pinned to the taskbar in the position indicated by the number.', 10, 'Intermediate'),
(285, 'Open the desktop and open a new instance of the app...', 'Win + Ctrl + Shift + number', 'Open the desktop and open a new instance of the app located at the given position on the taskbar as an administrator.', 10, 'Advanced'),
(286, 'Remove current app from screen or minimize the deskt...', 'Win + Down Arrow', 'Remove current app from screen or minimize the desktop window.', 5, 'Intermediate'),
(287, 'Maximize the app or desktop window to the left side...', 'Win + Left Arrow', 'Maximize the app or desktop window to the left side of the screen.', 5, 'Intermediate'),
(288, 'Maximize the app or desktop window to the right side...', 'Win + Right Arrow', 'Maximize the app or desktop window to the right side of the screen.', 5, 'Intermediate'),
(289, 'Minimize all except the active desktop window (resto...', 'Win + Home', 'Minimize all except the active desktop window (restores all windows on second stroke).', 7, 'Beginner'),
(290, 'Restore or minimize active desktop windows verticall...', 'Win + Shift + Down Arrow', 'Restore or minimize active desktop windows vertically, maintaining width.', 5, 'Intermediate'),
(291, 'Move an app or window in the desktop from one monito...', 'Win + Shift + Left Arrow or Right Arrow', 'Move an app or window in the desktop from one monitor to another.', 5, 'Intermediate'),
(292, 'Switch input language and keyboard layout', 'Win + Space', 'Switch input language and keyboard layout.', 7, 'Beginner'),
(293, 'Turn on Narrator', 'Win + Ctrl + Enter', 'Turn on Narrator.', 7, 'Intermediate'),
(294, 'Open Magnifier', 'Win + Plus ( + )', 'Open Magnifier.', 7, 'Intermediate'),
(295, 'Begin IME reconversion', 'Win + forward slash ( or )', 'Begin IME reconversion.', 7, 'Beginner'),
(296, 'Open shoulder taps', 'Win + Ctrl + V', 'Open shoulder taps.', 7, 'Intermediate'),
(297, 'Wake PC from blank or black screen', 'Win + Ctrl + Shift + B', 'Wake PC from blank or black screen.', 7, 'Advanced'),
(298, 'Move to nth tab', 'Ctrl + number (number 1–9)', 'Move to nth tab.', 11, 'Beginner'),
(299, 'Select the search box', 'Ctrl + E', 'Select the search box.', 3, 'Beginner'),
(300, 'Select the search box', 'Ctrl + F', 'Select the search box.', 3, 'Beginner'),
(301, 'Close the active window', 'Ctrl + W', 'Close the active window.', 3, 'Beginner'),
(302, 'Display all folders above the selected folder', 'Ctrl + Shift + E', 'Display all folders above the selected folder.', 3, 'Intermediate'),
(303, 'Display all subfolders under the selected folder', 'Num Lock + asterisk (*)', 'Display all subfolders under the selected folder.', 3, 'Beginner'),
(304, 'Display the contents of the selected folder', 'Num Lock + plus ( + )', 'Display the contents of the selected folder.', 3, 'Intermediate'),
(305, 'Collapse the selected folder', 'Num Lock + minus (-)', 'Collapse the selected folder.', 3, 'Beginner'),
(306, 'Display the preview panel', 'Alt + P', 'Display the preview panel.', 3, 'Beginner'),
(307, 'Open the Properties dialog box for the selected item', 'Alt + Enter', 'Open the Properties dialog box for the selected item.', 3, 'Beginner'),
(308, 'View the folder that the folder was in', 'Alt + Up Arrow', 'View the folder that the folder was in.', 3, 'Intermediate'),
(309, 'View the previous folder', 'Alt + Left Arrow', 'View the previous folder.', 3, 'Intermediate'),
(310, 'View the previous folder', 'Backspace', 'View the previous folder.', 3, 'Beginner'),
(311, 'Display the bottom of the active window', 'End', 'Display the bottom of the active window.', 3, 'Beginner'),
(312, 'Display the top of the active window', 'Home', 'Display the top of the active window.', 3, 'Beginner'),
(313, 'Switch between virtual desktops you''ve created on th...', 'Win + Ctrl + Right Arrow', 'Switch between virtual desktops you''ve created on the right.', 6, 'Intermediate'),
(314, 'Switch between virtual desktops you''ve created on th...', 'Win + Ctrl + Left Arrow', 'Switch between virtual desktops you''ve created on the left.', 6, 'Intermediate'),
(315, 'Open an app or quickly open another instance of an app', 'Shift + click a taskbar button', 'Open an app or quickly open another instance of an app.', 10, 'Intermediate'),
(316, 'Open an app as an administrator', 'Ctrl + Shift + click a taskbar button', 'Open an app as an administrator.', 10, 'Intermediate'),
(317, 'Show the window menu for the app', 'Shift + right-click a taskbar button', 'Show the window menu for the app.', 10, 'Intermediate'),
(318, 'Cycle through the windows of the group', 'Ctrl + click a grouped taskbar button', 'Cycle through the windows of the group.', 10, 'Beginner'),
(319, 'Go back to the settings home page', 'Backspace', 'Go back to the settings home page.', 11, 'Beginner'),
(320, 'Search settings', 'Type on any page with search box', 'Search settings.', 11, 'Beginner');

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

-- ----------------------------------------------------------
-- SEED DATA: RESULT QUESTIONS (Per-Question Attempt Breakdown)
-- ----------------------------------------------------------
INSERT IGNORE INTO result_questions (id, result_id, question_id, attempts, is_correct, score, user_answer) VALUES
(1, 1, 'sc-2', 1, TRUE, 1, 'opt-2'),
(2, 1, 'sc-3', 1, TRUE, 1, 'opt-2'),
(3, 1, 'fb-1', 1, TRUE, 1, 'Win + L'),
(4, 3, 'sc-1', 2, FALSE, 0, 'opt-2'),
(5, 3, 'fb-3', 1, TRUE, 1, 'regedit');
