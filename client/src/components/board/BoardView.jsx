import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import Column from './Column';
import TaskCard from './TaskCard';
import { Plus, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function BoardView({ boardId, onCardClick, onStatsUpdate, onActivityUpdate }) {
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState({}); // { listId: [cards] }
  const [activeCard, setActiveCard] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  useEffect(() => {
    if (boardId) {
      fetchBoardData();
    }
  }, [boardId]);

  const fetchBoardData = async () => {
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      setLists(data.lists);
      const cardMap = {};
      data.lists.forEach((list) => {
        cardMap[list._id] = list.cards || [];
      });
      setCards(cardMap);

      // Trigger stats and activities recalculation/fetching in parent
      onStatsUpdate && onStatsUpdate(calculateStats(cardMap, data.lists));
      onActivityUpdate && onActivityUpdate();
    } catch (err) {
      toast.error('Failed to load board details');
    }
  };

  const calculateStats = (cardMap, currentLists) => {
    const activeLists = currentLists || lists || [];
    const allCards = Object.values(cardMap).flat();

    const listsStats = activeLists.map(l => {
      const count = (cardMap[l._id] || []).length;
      return {
        id: l._id,
        title: l.title,
        count: count
      };
    });

    return {
      total: allCards.length,
      lists: listsStats
    };
  };

  const handleDragStart = ({ active }) => {
    const card = Object.values(cards).flat().find((c) => c._id === active.id);
    setActiveCard(card);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null);
    if (!over) return;

    const cardId = active.id;
    const targetListId = over.data.current?.listId || over.id;

    // Find source list ID
    const sourceListId = Object.entries(cards).find(
      ([, listCards]) => listCards.some((c) => c._id === cardId)
    )?.[0];

    if (!sourceListId) return;

    // Find position in target list (if dropped over another card)
    const targetListCards = cards[targetListId] || [];
    const overCardId = over.id;
    let newPosition = targetListCards.length;

    if (overCardId && overCardId !== targetListId) {
      const overIndex = targetListCards.findIndex((c) => c._id === overCardId);
      newPosition = overIndex !== -1 ? overIndex : targetListCards.length;
    }

    // If same list and same position, do nothing
    if (sourceListId === targetListId) {
      const currentIdx = targetListCards.findIndex((c) => c._id === cardId);
      if (currentIdx === newPosition) return;
    }

    // Optimistic state updates
    const cardToMove = cards[sourceListId].find((c) => c._id === cardId);
    
    // Update local card list positions optimistically
    const updatedCards = { ...cards };
    
    // Remove from source
    updatedCards[sourceListId] = updatedCards[sourceListId].filter((c) => c._id !== cardId);
    
    // Add to target
    if (!updatedCards[targetListId]) updatedCards[targetListId] = [];
    updatedCards[targetListId].splice(newPosition, 0, { ...cardToMove, list: targetListId });

    // Re-index positions
    updatedCards[sourceListId] = updatedCards[sourceListId].map((c, i) => ({ ...c, position: i }));
    updatedCards[targetListId] = updatedCards[targetListId].map((c, i) => ({ ...c, position: i }));

    setCards(updatedCards);
    onStatsUpdate && onStatsUpdate(calculateStats(updatedCards, lists));

    // Send call to API
    try {
      await api.patch(`/cards/${cardId}/move`, {
        targetListId,
        newPosition
      });
      onActivityUpdate && onActivityUpdate();
    } catch (err) {
      toast.error('Failed to update card position');
      fetchBoardData(); // Rollback to DB state
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      await api.post('/lists', {
        title: newListTitle.trim(),
        boardId
      });
      setNewListTitle('');
      setIsAddingList(false);
      fetchBoardData();
      toast.success('List created');
    } catch (err) {
      toast.error('Failed to create list');
    }
  };

  const handleCardAdded = async (listId, title) => {
    try {
      await api.post('/cards', {
        title,
        listId,
        boardId
      });
      fetchBoardData();
      toast.success('Card created');
    } catch (err) {
      toast.error('Failed to create card');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list and archive all cards inside?')) return;

    try {
      await api.delete(`/lists/${listId}`);
      fetchBoardData();
      toast.success('List deleted');
    } catch (err) {
      toast.error('Failed to delete list');
    }
  };

  const handleRenameList = async (listId, title) => {
    try {
      await api.put(`/lists/${listId}`, { title });
      fetchBoardData();
      toast.success('List renamed');
    } catch (err) {
      toast.error('Failed to rename list');
    }
  };

  return (
    <div className="flex gap-4 p-6 overflow-x-auto items-start min-h-[70vh] bg-page border border-border-default rounded-lg">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {lists.map((list) => (
          <Column
            key={list._id}
            list={list}
            cards={cards[list._id] || []}
            onCardAdded={handleCardAdded}
            onCardClick={onCardClick}
            onDeleteList={handleDeleteList}
            onRenameList={handleRenameList}
          />
        ))}

        <DragOverlay>
          {activeCard && <TaskCard card={activeCard} isDragging={true} />}
        </DragOverlay>
      </DndContext>

      {/* Add List Controls */}
      <div className="flex-shrink-0 w-72">
        {isAddingList ? (
          <form
            onSubmit={handleAddList}
            className="flex flex-col gap-2 p-3 bg-subtle border border-border-default rounded-lg"
          >
            <Input
              type="text"
              placeholder="List title..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" className="py-1 px-3 text-xs">
                Add List
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsAddingList(false)}
                className="py-1 px-2 text-xs shadow-none"
              >
                <X size={14} />
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingList(true)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-subtle border border-border-default hover:bg-emphasis text-text-secondary hover:text-text-primary rounded-lg font-medium text-sm transition-all"
          >
            <Plus size={16} />
            Add List
          </button>
        )}
      </div>
    </div>
  );
}
