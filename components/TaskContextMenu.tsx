import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface TaskContextMenuProps {
  position: { top: number; right: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskContextMenu: React.FC<TaskContextMenuProps> = ({ position, onClose, onEdit, onDelete }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Add event listener on the next tick to avoid closing immediately
    setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: position.top, right: position.right }}
      className="absolute z-20 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <ul className="p-1 text-sm text-gray-700 dark:text-gray-200">
        <li>
          <button
            onClick={() => handleAction(onEdit)}
            className="flex items-center gap-2 w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <Pencil size={16} />
            <span>تعديل</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleAction(onDelete)}
            className="flex items-center gap-2 w-full text-right px-3 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <Trash2 size={16} />
            <span>حذف</span>
          </button>
        </li>
      </ul>
    </div>
  );
};