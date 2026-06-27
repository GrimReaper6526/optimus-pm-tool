import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function Column({
  list,
  cards = [],
  onCardAdded,
  onCardClick,
  onDeleteList,
  onRenameList
}) {
  const { setNodeRef } = useDroppable({
    id: list._id,
    data: { listId: list._id }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onCardAdded(list._id, newTitle.trim());
    setNewTitle('');
    setIsAdding(false);
  };

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (!listTitle.trim() || listTitle === list.title) {
      setListTitle(list.title);
      return;
    }
    await onRenameList(list._id, listTitle.trim());
  };

  return (
    <div className="flex-shrink-0 w-72 flex flex-col max-h-[85vh] bg-subtle border border-border-default rounded-lg">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-border-default">
        <div className="flex items-center gap-2 max-w-[80%]">
          {isEditingTitle ? (
            <input
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="bg-page border border-border-focus text-sm font-semibold px-2 py-0.5 rounded focus:outline-none w-full text-text-primary"
            />
          ) : (
            <h3
              onDoubleClick={() => setIsEditingTitle(true)}
              className="text-sm font-semibold text-text-primary truncate cursor-pointer hover:bg-emphasis px-1.5 py-0.5 rounded transition-all"
            >
              {list.title}
            </h3>
          )}
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-text-secondary">
            {cards.length}
          </span>
        </div>
        <button
          onClick={() => onDeleteList(list._id)}
          className="p-1 rounded text-text-secondary hover:text-error-text hover:bg-error-bg/30 transition-colors"
          title="Delete list"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Cards Area */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 min-h-[150px]"
      >
        <SortableContext
          items={cards.map((c) => c._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="min-h-full">
            {cards.map((card) => (
              <TaskCard
                key={card._id}
                card={card}
                onClick={onCardClick}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Column Footer - Add Card */}
      <div className="p-3 border-t border-border-default">
        {isAdding ? (
          <form onSubmit={handleAddCard} className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Enter card title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" className="py-1 px-3 text-xs">
                Add Card
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsAdding(false)}
                className="py-1 px-2 text-xs shadow-none"
              >
                <X size={14} />
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-emphasis border border-dashed border-border-default transition-all"
          >
            <Plus size={14} />
            Add card
          </button>
        )}
      </div>
    </div>
  );
}
