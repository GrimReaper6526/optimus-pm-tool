import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import BoardView from '../components/board/BoardView';
import StatsBar from '../components/dashboard/StatsBar';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import TaskModal from '../components/board/TaskModal';
import { ArrowLeft, UserPlus, Users, Settings, Plus, Info } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [boardData, setBoardData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ total: 0, lists: [] });
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Invite Modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Task Details Modal state
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Settings Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetchBoardDetails();
  }, [boardId]);

  const fetchBoardDetails = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      setBoardData(data.board);
      setEditTitle(data.board.title);
      setEditDesc(data.board.description || '');
      setIsLoading(false);
      fetchActivities();
    } catch (err) {
      toast.error('Board not found or access denied');
      navigate('/');
    }
  };

  const fetchActivities = async () => {
    try {
      const { data } = await api.get(`/boards/${boardId}/activities`);
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities', err);
    }
  };

  // Search users for invite
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const { data } = await api.get(`/boards/search?query=${searchQuery}`);
      // Filter out users already in board members list
      const memberIds = boardData?.members?.map((m) => m.user?._id || m.user) || [];
      const ownerId = boardData?.owner?._id || boardData?.owner;
      const filtered = data.filter((u) => u._id !== ownerId && !memberIds.includes(u._id));
      setSearchResults(filtered);
      setIsSearching(false);
    } catch (err) {
      setIsSearching(false);
    }
  };

  const handleInviteMember = async (username) => {
    if (isInviting) return;
    setIsInviting(true);
    try {
      await api.post(`/boards/${boardId}/members`, {
        usernameOrEmail: username
      });
      toast.success(`${username} added to board`);
      fetchBoardDetails();
      setSearchQuery('');
      setSearchResults([]);
      setIsInviteOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateBoardSettings = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      await api.put(`/boards/${boardId}`, {
        title: editTitle.trim(),
        description: editDesc.trim()
      });
      toast.success('Board updated successfully');
      setBoardData((prev) => ({ ...prev, title: editTitle, description: editDesc }));
      setIsSettingsOpen(false);
    } catch (err) {
      toast.error('Failed to update board');
    }
  };

  const handleArchiveBoard = async () => {
    if (!window.confirm('Are you sure you want to archive this board? This action is permanent.')) return;

    try {
      await api.delete(`/boards/${boardId}`);
      toast.success('Board archived successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to archive board');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Board Header Navigation & Metadata */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-md border border-border-default text-text-secondary hover:text-text-primary hover:bg-subtle transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-text-primary tracking-tight">{boardData.title}</h1>
              <Badge variant="accent">
                {boardData.owner?._id === user?.id || boardData.owner === user?.id ? 'Owner' : 'Collaborator'}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{boardData.description || 'No description.'}</p>
          </div>
        </div>

        {/* Member list and action controls */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Stacked avatars */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
              <Users size={14} /> Team ({boardData.members?.length}):
            </span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {boardData.members?.slice(0, 5).map((member) => (
                <img
                  key={member.user?._id}
                  src={member.user?.avatar}
                  alt={member.user?.username}
                  title={`${member.user?.username} (${member.role})`}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-page bg-muted border border-border-default object-cover"
                />
              ))}
            </div>
            <Button
              onClick={() => setIsInviteOpen(true)}
              variant="ghost"
              className="p-1 rounded-full h-7 w-7 flex items-center justify-center text-accent-primary hover:bg-accent-subtle"
            >
              <UserPlus size={14} />
            </Button>
          </div>

          {/* Board settings */}
          <Button
            onClick={() => setIsSettingsOpen(true)}
            variant="secondary"
            className="p-2 h-9 w-9 flex items-center justify-center"
          >
            <Settings size={16} />
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar stats={stats} />

      {/* Main board content split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kanban Board View (Left 3 cols) */}
        <div className="lg:col-span-3">
          <BoardView
            key={`${boardId}-${boardRefreshKey}`}
            boardId={boardId}
            onCardClick={(card) => setSelectedCardId(card._id)}
            onStatsUpdate={setStats}
            onActivityUpdate={fetchActivities}
          />
        </div>

        {/* Activity feed / log (Right 1 col) */}
        <div className="hidden lg:block lg:col-span-1">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Task detail card modal popup */}
      <TaskModal
        isOpen={!!selectedCardId}
        onClose={() => setSelectedCardId(null)}
        cardId={selectedCardId}
        boardMembers={boardData.members}
        onCardUpdated={() => {
          setBoardRefreshKey((prev) => prev + 1);
          fetchActivities();
        }}
      />

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Team Member">
        <div className="space-y-4">
          <Input
            id="member-search"
            label="Search user by username or email"
            type="text"
            placeholder="Type username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-text-secondary">Search Results</h4>
            <div className="border border-border-default rounded-md max-h-[180px] overflow-y-auto bg-page p-1">
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-xs text-text-tertiary p-3 text-center italic">
                  {searchQuery.trim().length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
                </p>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 rounded hover:bg-subtle border-b border-border-default last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-5 h-5 rounded-full border border-border-default"
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-text-primary">{user.username}</p>
                        <p className="text-[10px] text-text-secondary">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleInviteMember(user.username)}
                      variant="primary"
                      className="py-1 px-2.5 text-[10px]"
                      disabled={isInviting}
                    >
                      {isInviting ? 'Inviting...' : 'Invite'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Board Settings">
        <form onSubmit={handleUpdateBoardSettings} className="space-y-4">
          <Input
            id="edit-board-title"
            label="Board Title"
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-board-desc" className="text-sm font-medium text-text-primary">
              Description
            </label>
            <textarea
              id="edit-board-desc"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm text-text-primary bg-page border border-border-default rounded-md shadow-sm focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-primary/20 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-border-default">
            <h4 className="text-xs font-bold text-error-text uppercase tracking-wider">Danger Zone</h4>
            <p className="text-[11px] text-text-secondary">Archiving the board will hide it from everyone. There is no undo.</p>
            <Button
              type="button"
              variant="destructive"
              onClick={handleArchiveBoard}
              className="mt-1 py-1.5 text-xs self-start"
            >
              Archive Board
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
            <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
