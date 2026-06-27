import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Calendar, User, Trash2, Tag, AlertTriangle, Send } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const priorityOptions = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ea580c' },
  { value: 'critical', label: 'Critical', color: '#ef4444' }
];

export default function TaskModal({
  isOpen,
  onClose,
  cardId,
  boardMembers = [],
  onCardUpdated
}) {
  const [card, setCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

  // Edit states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState([]);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Labels state
  const [labels, setLabels] = useState([]);
  const [newLabelText, setNewLabelText] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#6366f1');
  const [isAddingLabel, setIsAddingLabel] = useState(false);

  useEffect(() => {
    if (isOpen && cardId) {
      fetchCardDetails();
    }
  }, [isOpen, cardId]);

  const fetchCardDetails = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/cards/${cardId}`);
      setCard(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setPriority(data.priority);
      setDueDate(data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '');
      setAssignees(data.assignees || []);
      setComments(data.comments || []);
      setLabels(data.labels || []);
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to load card details');
      onClose();
    }
  };

  const handleSaveField = async (updatedFields) => {
    setSaveStatus('saving');
    try {
      const { data } = await api.put(`/cards/${cardId}`, updatedFields);
      setCard(data);
      setSaveStatus('saved');
      onCardUpdated && onCardUpdated();
    } catch (err) {
      setSaveStatus('error');
      toast.error('Failed to save changes');
    }
  };

  const handleClose = async () => {
    if (card) {
      const updates = {};
      if (title.trim() !== card.title) updates.title = title.trim();
      if (description.trim() !== (card.description || '')) updates.description = description.trim();

      if (Object.keys(updates).length > 0) {
        await handleSaveField(updates);
      }
    }
    onClose();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data } = await api.post(`/cards/${cardId}/comments`, {
        content: newComment.trim()
      });
      setComments(data.comments || []);
      setNewComment('');
      toast.success('Comment added');
      onCardUpdated && onCardUpdated();
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleToggleAssignee = async (memberId) => {
    const isAssigned = assignees.some(u => u._id === memberId);
    let newAssigneeList;
    if (isAssigned) {
      newAssigneeList = assignees.filter(u => u._id !== memberId).map(u => u._id);
    } else {
      newAssigneeList = [...assignees.map(u => u._id), memberId];
    }
    
    await handleSaveField({ assignees: newAssigneeList });
    // Refetch card to get populated user details
    const { data } = await api.get(`/cards/${cardId}`);
    setAssignees(data.assignees || []);
  };

  const handleAddLabel = async (e) => {
    e.preventDefault();
    if (!newLabelText.trim()) return;
    
    const updatedLabels = [...labels, { text: newLabelText.trim(), color: newLabelColor }];
    setLabels(updatedLabels);
    await handleSaveField({ labels: updatedLabels });
    setNewLabelText('');
    setIsAddingLabel(false);
  };

  const handleRemoveLabel = async (labelIdx) => {
    const updatedLabels = labels.filter((_, idx) => idx !== labelIdx);
    setLabels(updatedLabels);
    await handleSaveField({ labels: updatedLabels });
  };

  const handleArchiveCard = async () => {
    if (!window.confirm('Are you sure you want to archive this card?')) return;
    try {
      await api.delete(`/cards/${cardId}`);
      toast.success('Card archived');
      onCardUpdated && onCardUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to archive card');
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content Area (2 Cols) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Card Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleSaveField({ title })}
            className="w-full bg-transparent border-b border-transparent hover:border-border-default focus:border-border-focus text-lg font-bold text-text-primary focus:outline-none py-1"
          />

          {/* Labels list */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {labels.map((label, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 rounded font-medium border flex items-center gap-1"
                style={{
                  backgroundColor: `${label.color}15`,
                  color: label.color,
                  borderColor: `${label.color}30`
                }}
              >
                {label.text}
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(idx)}
                  className="hover:text-text-primary text-[10px]"
                >
                  ×
                </button>
              </span>
            ))}
            
            {isAddingLabel ? (
              <form onSubmit={handleAddLabel} className="flex items-center gap-1.5 border border-border-default rounded p-1 bg-page">
                <input
                  type="text"
                  placeholder="Label..."
                  value={newLabelText}
                  onChange={(e) => setNewLabelText(e.target.value)}
                  className="bg-transparent text-xs text-text-primary focus:outline-none w-20 px-1"
                  autoFocus
                />
                <input
                  type="color"
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="w-5 h-5 p-0 border-0 rounded cursor-pointer"
                />
                <Button type="submit" variant="primary" className="py-0.5 px-1.5 text-[10px]">Add</Button>
                <Button variant="ghost" onClick={() => setIsAddingLabel(false)} className="py-0.5 px-1 text-[10px] shadow-none">Cancel</Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingLabel(true)}
                className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 hover:bg-subtle px-2 py-0.5 rounded border border-dashed border-border-default"
              >
                <Tag size={12} /> Add Label
              </button>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-semibold text-text-secondary">Description</h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleSaveField({ description })}
              placeholder="Add a detailed description for this task..."
              rows={4}
              className="w-full text-sm text-text-primary bg-page border border-border-default rounded-md p-3 focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-primary/20 transition-all placeholder:text-text-tertiary resize-none"
            />
          </div>

          {/* Comments Section */}
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border-default">
            <h4 className="text-xs font-semibold text-text-secondary">Comments</h4>
            
            {/* Comments List */}
            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-text-tertiary italic">No comments yet. Write something below!</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="flex gap-2.5 items-start text-xs border-b border-border-default pb-2">
                    <img
                      src={c.author?.avatar}
                      alt={c.author?.username}
                      className="w-6 h-6 rounded-full border border-border-default bg-muted"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-text-primary">{c.author?.username}</span>
                        <span className="text-[10px] text-text-tertiary">
                          {format(new Date(c.createdAt || Date.now()), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-text-secondary whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 items-start mt-2">
              <Input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" variant="primary" className="py-2 px-3 self-stretch shadow-sm">
                <Send size={12} />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar Controls (1 Col) */}
        <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-border-default pt-4 md:pt-0 md:pl-4">
          {/* Priority Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Priority</label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                handleSaveField({ priority: e.target.value });
              }}
              className="w-full text-xs text-text-primary bg-page border border-border-default rounded p-2 focus:outline-none focus:border-border-focus"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                handleSaveField({ dueDate: e.target.value || null });
              }}
              className="w-full text-xs text-text-primary bg-page border border-border-default rounded p-2 focus:outline-none focus:border-border-focus"
            />
          </div>

          {/* Assignees List */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <User size={12} /> Assignees
            </label>
            <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto border border-border-default rounded p-1.5 bg-page">
              {boardMembers.length === 0 ? (
                <p className="text-[10px] text-text-tertiary italic">No board members.</p>
              ) : (
                boardMembers.map((member) => {
                  const isAssigned = assignees.some(u => u._id === member.user?._id);
                  return (
                    <label
                      key={member.user?._id}
                      className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-subtle cursor-pointer select-none text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={() => handleToggleAssignee(member.user?._id)}
                        className="rounded border-border-default text-accent-primary focus:ring-accent-primary/20 h-3 w-3"
                      />
                      <img
                        src={member.user?.avatar}
                        alt={member.user?.username}
                        className="w-4 h-4 rounded-full border border-border-default"
                      />
                      <span className="truncate text-text-primary">{member.user?.username}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-4 border-t border-border-default flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
              <span className="font-medium">Status:</span>
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-accent-primary animate-pulse font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-ping" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-success-text font-semibold">
                  ✓ Autosaved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1 text-error-text font-semibold">
                  ⚠ Save Failed
                </span>
              )}
            </div>

            <Button
              variant="primary"
              onClick={handleClose}
              className="w-full py-1.5 text-xs font-semibold"
            >
              Close & Save
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleArchiveCard}
              className="w-full py-1.5 text-xs flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 border border-red-500/20 shadow-none font-medium"
            >
              <Trash2 size={13} />
              Archive Card
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
