import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, AlertTriangle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const priorityConfig = {
  low: { color: '#10b981', bg: 'var(--success-bg)', text: 'var(--success-text)', label: 'Low' },
  medium: { color: '#f59e0b', bg: 'var(--warning-bg)', text: 'var(--warning-text)', label: 'Medium' },
  high: { color: '#ea580c', bg: '#fff7ed', text: '#c2410c', label: 'High' },
  critical: { color: '#ef4444', bg: 'var(--error-bg)', text: 'var(--error-text)', label: 'Critical' }
};

export default function TaskCard({ card, isDragging, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: card._id,
    data: { type: 'card', listId: card.list }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.3 : 1
  };

  const priority = priorityConfig[card.priority] || priorityConfig.medium;
  const isOverdue = card.dueDate && isPast(new Date(card.dueDate)) && !isToday(new Date(card.dueDate));

  const handleCardClick = (e) => {
    // Prevent triggering click during drag end release
    if (e.defaultPrevented) return;
    onClick && onClick(card);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`group relative rounded-md p-4 cursor-grab active:cursor-grabbing transition-all duration-150 bg-surface-raised border border-border-default hover:shadow-md hover:border-border-strong select-none mb-3 ${
        isDragging ? 'ring-2 ring-accent-primary/50 border-accent-primary' : ''
      }`}
    >
      {/* Priority colored indicator bar */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-md"
        style={{ backgroundColor: priority.color }}
      />

      {/* Tags / Labels */}
      {card.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2 pl-1.5">
          {card.labels.map((label, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.5 rounded font-medium border"
              style={{
                backgroundColor: `${label.color}15`,
                color: label.color,
                borderColor: `${label.color}30`
              }}
            >
              {label.text}
            </span>
          ))}
        </div>
      )}

      {/* Card Title */}
      <p className="text-sm font-semibold text-text-primary mb-3 pl-1.5 leading-tight line-clamp-2">
        {card.title}
      </p>

      {/* Card Footer info */}
      <div className="flex items-center justify-between pl-1.5 pt-1">
        {/* Due Date Indicator */}
        {card.dueDate ? (
          <span
            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium border ${
              isOverdue
                ? 'bg-error-bg text-error-text border-error-border'
                : 'bg-muted text-text-secondary border-border-default'
            }`}
          >
            {isOverdue ? <AlertTriangle size={10} className="text-error-icon" /> : <Calendar size={10} />}
            {format(new Date(card.dueDate), 'MMM d')}
          </span>
        ) : (
          <div />
        )}

        {/* Priority Badge */}
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded border"
          style={{
            backgroundColor: priority.bg,
            color: priority.text,
            borderColor: `${priority.color}35`
          }}
        >
          {priority.label}
        </span>
      </div>

      {/* Assignees Avatars */}
      {card.assignees?.length > 0 && (
        <div className="flex -space-x-1.5 overflow-hidden pl-1.5 mt-3 pt-2 border-t border-border-default">
          {card.assignees.slice(0, 3).map((user) => (
            <img
              key={user._id}
              src={user.avatar}
              alt={user.username}
              title={user.username}
              className="inline-block h-5 w-5 rounded-full ring-2 ring-surface-raised bg-muted border border-border-default object-cover"
            />
          ))}
          {card.assignees.length > 3 && (
            <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted ring-2 ring-surface-raised text-[9px] font-bold text-text-secondary border border-border-default">
              +{card.assignees.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
