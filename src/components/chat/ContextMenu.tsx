import { useEffect, useRef } from 'react';
import { Pin } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onPin?: () => void;
  isPinned?: boolean;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onPin,
  isPinned = false,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menu.style.left = `${x - rect.width}px`;
      }

      if (rect.bottom > viewportHeight) {
        menu.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed rounded-lg shadow-lg py-1 min-w-[200px] z-50"
      style={{ left: x, top: y, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      <button
        onClick={() => {
          onPin?.();
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:brightness-110 transition-colors"
        style={{ color: 'var(--text-primary)' }}
      >
        <Pin className="w-4 h-4" />
        <span className="text-sm">{isPinned ? 'Unpin' : 'Pin'}</span>
      </button>
    </div>
  );
}


