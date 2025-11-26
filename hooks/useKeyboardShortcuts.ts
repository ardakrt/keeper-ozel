import { useEffect, useCallback } from 'react';

type ShortcutHandler = () => void;

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: ShortcutHandler;
  description?: string;
}

/**
 * Custom hook for managing keyboard shortcuts
 * Supports Ctrl/Cmd + key combinations
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;

      for (const shortcut of shortcuts) {
        const modifierMatch =
          (shortcut.ctrl ? ctrlKey : !ctrlKey) &&
          (shortcut.meta ? metaKey : !metaKey) &&
          (shortcut.shift ? shiftKey : !shiftKey) &&
          (shortcut.alt ? altKey : !altKey);

        if (key.toLowerCase() === shortcut.key.toLowerCase() && modifierMatch) {
          // Check if user is typing in an input/textarea
          const target = event.target as HTMLElement;
          const isInput =
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

          // Allow certain shortcuts even in inputs (like Cmd+K for search)
          const allowInInput = shortcut.key === 'k' && (ctrlKey || metaKey);

          if (!isInput || allowInInput) {
            event.preventDefault();
            shortcut.handler();
            break;
          }
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Format shortcut for display
 * e.g., "Ctrl+K" or "Cmd+Shift+N"
 */
export function formatShortcut(shortcut: Shortcut): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
