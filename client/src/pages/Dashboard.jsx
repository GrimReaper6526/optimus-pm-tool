import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { 
  Plus, 
  Layout, 
  ArrowRight, 
  List, 
  Calendar, 
  BarChart2, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  Users,
  Search,
  CheckCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const coverColors = [
  { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-600', border: 'border-indigo-700', text: 'text-indigo-600', fill: '#4f46e5' },
  { value: 'cyan', label: 'Cyan', bg: 'bg-cyan-600', border: 'border-cyan-700', text: 'text-cyan-600', fill: '#0891b2' },
  { value: 'violet', label: 'Violet', bg: 'bg-violet-600', border: 'border-violet-700', text: 'text-violet-600', fill: '#7c3aed' },
  { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-600', border: 'border-emerald-700', text: 'text-emerald-600', fill: '#059669' },
  { value: 'rose', label: 'Rose', bg: 'bg-rose-600', border: 'border-rose-700', text: 'text-rose-600', fill: '#e11d48' },
  { value: 'amber', label: 'Amber', bg: 'bg-amber-600', border: 'border-amber-700', text: 'text-amber-600', fill: '#d97706' }
];

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'list' | 'timeline' | 'analytics'

  // Task List Filters
  const [listSearch, setListSearch] = useState('');
  const [listPriorityFilter, setListPriorityFilter] = useState('all');
  const [listStatusFilter, setListStatusFilter] = useState('all');
  const [listBoardFilter, setListBoardFilter] = useState('all');

  // Create Board form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverColor, setCoverColor] = useState('indigo');

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [invitationsRes, boardsRes, tasksRes, activitiesRes] = await Promise.all([
        api.get('/boards/invitations'),
        api.get('/boards'),
        api.get('/boards/tasks/all'),
        api.get('/boards/activities/all')
      ]);
      setInvitations(invitationsRes.data);
      setBoards(boardsRes.data);
      setTasks(tasksRes.data);
      setActivities(activitiesRes.data);
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (boardId) => {
    try {
      await api.post(`/boards/${boardId}/accept`);
      toast.success('Invitation accepted!');
      fetchDashboardData(true);
    } catch (err) {
      toast.error('Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (boardId) => {
    if (!window.confirm('Are you sure you want to decline this board invitation?')) return;
    try {
      await api.post(`/boards/${boardId}/decline`);
      toast.success('Invitation declined.');
      fetchDashboardData(true);
    } catch (err) {
      toast.error('Failed to decline invitation');
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const { data } = await api.post('/boards', {
        title: title.trim(),
        description: description.trim(),
        coverColor
      });
      toast.success('Board created successfully');
      setIsModalOpen(false);
      navigate(`/board/${data._id}`);
    } catch (err) {
      toast.error('Failed to create board');
    }
  };

  // Helper stats
  const ownedBoards = boards.filter((b) => b.owner?._id === user?.id || b.owner === user?.id);
  const sharedBoards = boards.filter((b) => b.owner?._id !== user?.id && b.owner !== user?.id);
  const completedTasks = tasks.filter((t) => t.list?.title === 'Done');
  const activeTasks = tasks.filter((t) => t.list?.title !== 'Done');

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'info';
      case 'high': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'To Do': return 'default';
      case 'In Progress': return 'warning';
      case 'Done': return 'success';
      default: return 'info';
    }
  };

  // Render content based on active tab
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welcome, {user?.username}</h1>
            <Badge variant="accent" className="font-semibold text-[10px]">Real-time Sync Active</Badge>
          </div>
          <p className="text-sm text-text-secondary mt-0.5">Control your roadmap, analyze sprint metrics, and coordinate team tasks from one unified console.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchDashboardData(true)} variant="secondary" className="p-2.5 h-9 w-9 flex items-center justify-center border border-border-default bg-subtle hover:bg-emphasis">
            <RefreshCw size={14} className="text-text-secondary" />
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 shadow-sm">
            <Plus size={16} /> Create Board
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-l-4 border-l-indigo-600 bg-surface-raised relative overflow-hidden group hover:border-l-indigo-500 transition-all duration-150">
          <div className="text-2xl font-bold text-text-primary">{boards.length}</div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mt-0.5">Total Boards</div>
          <Layout size={32} className="absolute right-4 bottom-2 text-border-default/40 pointer-events-none group-hover:scale-110 transition-transform" />
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600 bg-surface-raised relative overflow-hidden group hover:border-l-emerald-500 transition-all duration-150">
          <div className="text-2xl font-bold text-text-primary">{tasks.length}</div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mt-0.5">Total Tasks</div>
          <CheckSquare size={32} className="absolute right-4 bottom-2 text-border-default/40 pointer-events-none group-hover:scale-110 transition-transform" />
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-600 bg-surface-raised relative overflow-hidden group hover:border-l-amber-500 transition-all duration-150">
          <div className="text-2xl font-bold text-warning-text">{activeTasks.length}</div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mt-0.5">Active / In Progress</div>
          <Clock size={32} className="absolute right-4 bottom-2 text-border-default/40 pointer-events-none group-hover:scale-110 transition-transform" />
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-600 bg-surface-raised relative overflow-hidden group hover:border-l-rose-500 transition-all duration-150">
          <div className="text-2xl font-bold text-success-text">{completedTasks.length}</div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mt-0.5">Completed Tasks</div>
          <CheckCircle size={32} className="absolute right-4 bottom-2 text-border-default/40 pointer-events-none group-hover:scale-110 transition-transform" />
        </Card>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-border-default flex items-center gap-1 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'kanban' 
              ? 'border-accent-primary text-accent-primary bg-subtle/30' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-subtle/10'
          }`}
        >
          <Layout size={14} /> Kanban Boards
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'list' 
              ? 'border-accent-primary text-accent-primary bg-subtle/30' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-subtle/10'
          }`}
        >
          <List size={14} /> Detailed Tasks List
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'timeline' 
              ? 'border-accent-primary text-accent-primary bg-subtle/30' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-subtle/10'
          }`}
        >
          <Calendar size={14} /> Gantt Timeline
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'analytics' 
              ? 'border-accent-primary text-accent-primary bg-subtle/30' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-subtle/10'
          }`}
        >
          <BarChart2 size={14} /> Team Analytics
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
        </div>
      ) : (
        <div>
          {/* TAB 1: KANBAN BOARDS GRID */}
          {activeTab === 'kanban' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Boards main section (Left 3 columns) */}
              <div className="lg:col-span-3 space-y-6">
                {/* Pending Invitations Section */}
                {invitations.length > 0 && (
                  <div className="bg-surface-raised border border-accent-primary/20 rounded-lg p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-full blur-xl pointer-events-none" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-accent-primary flex items-center gap-1.5 mb-3">
                      <Users size={13} /> Pending Board Invitations ({invitations.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {invitations.map((inv) => (
                        <div key={inv._id} className="flex flex-col justify-between p-4 bg-subtle border border-border-default rounded-md hover:border-accent-primary/30 transition-all">
                          <div>
                            <h3 className="text-sm font-semibold text-text-primary truncate">{inv.title}</h3>
                            <p className="text-xs text-text-secondary mt-1">
                              Invited by <span className="font-bold">{inv.owner?.username}</span>
                            </p>
                            <p className="text-[11px] text-text-tertiary line-clamp-1 mt-0.5 italic">{inv.description || 'No description.'}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <Button 
                              onClick={() => handleAcceptInvitation(inv._id)} 
                              variant="primary" 
                              className="py-1 px-3 text-[11px] font-semibold flex-1 justify-center"
                            >
                              Accept
                            </Button>
                            <Button 
                              onClick={() => handleDeclineInvitation(inv._id)} 
                              variant="secondary" 
                              className="py-1 px-3 text-[11px] font-semibold flex-1 justify-center border border-border-default bg-page hover:bg-subtle text-text-secondary"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {boards.length === 0 ? (
                  <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
                    <div className="p-3 bg-muted rounded-full text-text-secondary mb-4">
                      <Layout size={24} />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">No boards created yet</h3>
                    <p className="text-xs text-text-secondary max-w-xs mt-1">Get started by creating your first board and setting up lists and cards.</p>
                    <Button onClick={() => setIsModalOpen(true)} className="mt-4 flex items-center gap-1">
                      <Plus size={14} /> Create Board
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* My Boards */}
                    {ownedBoards.length > 0 && (
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">My Boards ({ownedBoards.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {ownedBoards.map((board) => {
                            const boardTasks = tasks.filter(t => t.board?._id === board._id || t.board === board._id);
                            const doneTasks = boardTasks.filter(t => t.list?.title === 'Done');
                            const progressPercent = boardTasks.length ? Math.round((doneTasks.length / boardTasks.length) * 100) : 0;
                            const cover = coverColors.find(c => c.value === board.coverColor) || coverColors[0];
                            
                            return (
                              <Card key={board._id} hoverable className="flex flex-col p-0 overflow-hidden relative border border-border-default bg-surface-raised group" onClick={() => navigate(`/board/${board._id}`)}>
                                <div className={`h-2.5 w-full ${cover.bg}`} />
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start gap-2">
                                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors truncate">{board.title}</h3>
                                      <span className="text-[10px] text-text-tertiary font-mono">Owner</span>
                                    </div>
                                    <p className="text-xs text-text-secondary line-clamp-2 mt-1 min-h-[2rem]">{board.description || 'No description provided.'}</p>
                                  </div>
                                  
                                  {/* Progress bar and task metrics */}
                                  <div className="mt-4 space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-medium">
                                      <span>Progress: {doneTasks.length}/{boardTasks.length} Tasks</span>
                                      <span>{progressPercent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded overflow-hidden">
                                      <div className={`h-full ${cover.bg} transition-all duration-300`} style={{ width: `${progressPercent}%` }} />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-default text-[10px] text-text-secondary font-medium">
                                    <span className="flex items-center gap-1"><Users size={12} /> {board.members?.length || 1} Members</span>
                                    <span className="flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                                      Open Board <ArrowRight size={10} />
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Shared Boards */}
                    {sharedBoards.length > 0 && (
                      <div className="pt-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Shared Boards ({sharedBoards.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sharedBoards.map((board) => {
                            const boardTasks = tasks.filter(t => t.board?._id === board._id || t.board === board._id);
                            const doneTasks = boardTasks.filter(t => t.list?.title === 'Done');
                            const progressPercent = boardTasks.length ? Math.round((doneTasks.length / boardTasks.length) * 100) : 0;

                            return (
                              <Card key={board._id} hoverable className="flex flex-col p-0 overflow-hidden relative border border-border-default bg-surface-raised group" onClick={() => navigate(`/board/${board._id}`)}>
                                <div className="h-2.5 w-full bg-slate-500" />
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                  <div>
                                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors truncate">{board.title}</h3>
                                    <p className="text-xs text-text-secondary mt-1">Owned by <span className="font-bold">{board.owner?.username}</span></p>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="mt-4 space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-medium">
                                      <span>Progress: {doneTasks.length}/{boardTasks.length} Tasks</span>
                                      <span>{progressPercent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded overflow-hidden">
                                      <div className="h-full bg-slate-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-default text-[10px] text-text-secondary font-medium">
                                    <span>{board.members?.length || 1} Collaborators</span>
                                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                      Open Board <ArrowRight size={10} />
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar (Right 1 column) */}
              <div className="lg:col-span-1 space-y-6">
                {/* Recent Activities feed widget */}
                <Card className="p-4 border border-border-default bg-surface-raised flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                      <TrendingUp size={13} /> Activity Feed
                    </h3>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
                    {activities.length === 0 ? (
                      <p className="text-xs text-text-tertiary italic text-center py-6">No recent actions logged</p>
                    ) : (
                      activities.slice(0, 10).map((act) => {
                        let actText = `performed action: ${act.type}`;
                        if (act.type === 'card_created') actText = `created card "${act.data?.cardTitle}"`;
                        if (act.type === 'card_moved') actText = `moved "${act.data?.cardTitle}" to "${act.data?.toList}"`;
                        if (act.type === 'list_created') actText = `created list "${act.data?.listTitle}"`;
                        if (act.type === 'member_added') actText = `added "${act.data?.memberName}"`;
                        if (act.type === 'member_invited') actText = `invited "${act.data?.memberName}"`;

                        return (
                          <div key={act._id} className="flex gap-2 items-start border-b border-border-default pb-2.5 last:border-0 last:pb-0">
                            <img
                              src={act.user?.avatar}
                              alt={act.user?.username}
                              className="w-5 h-5 rounded-full border border-border-default bg-muted flex-shrink-0"
                            />
                            <div className="text-[11px] leading-snug">
                              <p className="text-text-primary">
                                <span className="font-bold">{act.user?.username}</span> {actText}
                              </p>
                              <span className="text-[9px] text-text-tertiary block mt-0.5 font-medium">
                                in <span className="underline font-semibold">{act.board?.title}</span> • {new Date(act.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED TASKS LIST */}
          {activeTab === 'list' && (
            <Card className="p-4 border border-border-default bg-surface-raised space-y-4">
              {/* Filters Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-border-default">
                <div className="flex items-center gap-2 max-w-sm w-full relative">
                  <Search size={14} className="absolute left-3 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={listSearch}
                    onChange={(e) => setListSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs text-text-primary bg-page border border-border-strong rounded placeholder:text-text-tertiary focus:outline-none focus:border-border-focus"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-text-secondary flex items-center gap-1 font-semibold"><Filter size={12} /> Filters:</span>
                  
                  {/* Board Filter */}
                  <select
                    value={listBoardFilter}
                    onChange={(e) => setListBoardFilter(e.target.value)}
                    className="py-1 px-2 border border-border-default rounded bg-page text-text-primary"
                  >
                    <option value="all">All Boards</option>
                    {boards.map(b => (
                      <option key={b._id} value={b._id}>{b.title}</option>
                    ))}
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={listPriorityFilter}
                    onChange={(e) => setListPriorityFilter(e.target.value)}
                    className="py-1 px-2 border border-border-default rounded bg-page text-text-primary"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={listStatusFilter}
                    onChange={(e) => setListStatusFilter(e.target.value)}
                    className="py-1 px-2 border border-border-default rounded bg-page text-text-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="border-b border-border-default text-text-secondary font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Task Details</th>
                      <th className="py-2.5 px-3">Board</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Tags</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks
                      .filter(t => {
                        const matchSearch = t.title.toLowerCase().includes(listSearch.toLowerCase()) || (t.description || '').toLowerCase().includes(listSearch.toLowerCase());
                        const matchPriority = listPriorityFilter === 'all' || t.priority === listPriorityFilter;
                        const matchStatus = listStatusFilter === 'all' || t.list?.title === listStatusFilter;
                        const matchBoard = listBoardFilter === 'all' || t.board?._id === listBoardFilter || t.board === listBoardFilter;
                        return matchSearch && matchPriority && matchStatus && matchBoard;
                      })
                      .map((task) => {
                        const board = boards.find(b => b._id === (task.board?._id || task.board));
                        const cover = coverColors.find(c => c.value === board?.coverColor) || coverColors[0];
                        return (
                          <tr key={task._id} className="border-b border-border-default hover:bg-subtle/50 transition-colors">
                            <td className="py-3 px-3">
                              <div>
                                <p className="font-bold text-text-primary text-xs leading-snug">{task.title}</p>
                                <p className="text-[10px] text-text-secondary line-clamp-1 mt-0.5">{task.description || 'No description added.'}</p>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1.5 font-bold ${cover.text}`}>
                                <span className={`w-2 h-2 rounded-full ${cover.bg}`} />
                                {board?.title || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <Badge variant={getStatusBadgeColor(task.list?.title)} className="font-bold text-[9px] uppercase">{task.list?.title || 'To Do'}</Badge>
                            </td>
                            <td className="py-3 px-3">
                              <Badge variant={getPriorityBadgeColor(task.priority)} className="font-bold text-[9px] uppercase">{task.priority}</Badge>
                            </td>
                            <td className="py-3 px-3 text-text-secondary font-mono">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                {task.labels?.map((label, idx) => (
                                  <span key={idx} className="px-1.5 py-0.2 rounded text-[8px] font-bold" style={{ backgroundColor: `${label.color}15`, color: label.color, border: `1px solid ${label.color}30` }}>
                                    {label.text}
                                  </span>
                                ))}
                                {(!task.labels || task.labels.length === 0) && <span className="text-text-tertiary italic text-[10px]">None</span>}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button onClick={() => navigate(`/board/${board?._id}`)} variant="ghost" className="py-1 px-2.5 text-[10px] border border-border-default hover:bg-subtle font-semibold flex items-center gap-1 inline-flex">
                                View Board <ArrowRight size={10} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: GANTT TIMELINE PATTERN */}
          {activeTab === 'timeline' && (
            <Card className="p-5 border border-border-default bg-surface-raised space-y-6">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Gantt Roadmap</h3>
                <p className="text-xs text-text-secondary mt-0.5">Timeline layout of active sprints and boards plotted by due dates.</p>
              </div>

              <div className="space-y-6">
                {boards.map((board) => {
                  const boardTasks = tasks.filter(t => t.board?._id === board._id || t.board === board._id);
                  const doneTasks = boardTasks.filter(t => t.list?.title === 'Done');
                  const progressPercent = boardTasks.length ? Math.round((doneTasks.length / boardTasks.length) * 100) : 0;
                  const cover = coverColors.find(c => c.value === board.coverColor) || coverColors[0];

                  return (
                    <div key={board._id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 border-b border-border-default pb-5 last:border-0 last:pb-0">
                      {/* Left: Board Name */}
                      <div className="col-span-1" onClick={() => navigate(`/board/${board._id}`)}>
                        <h4 className="font-bold text-xs text-text-primary hover:text-accent-primary cursor-pointer flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${cover.bg}`} />
                          {board.title}
                        </h4>
                        <p className="text-[10px] text-text-secondary mt-0.5">Tasks: {doneTasks.length} completed / {boardTasks.length} total</p>
                      </div>

                      {/* Right: Gantt Bar */}
                      <div className="col-span-3 flex items-center gap-4">
                        <div className="flex-1 h-7 bg-muted rounded-md border border-border-default relative overflow-hidden flex items-center select-none">
                          <div className={`h-full ${cover.bg} opacity-20 absolute left-0 top-0`} style={{ width: `${progressPercent}%` }} />
                          <div className="z-10 px-3 flex items-center justify-between w-full text-[10px] font-bold">
                            <span className={cover.text}>{progressPercent}% Progress</span>
                            <span className="text-text-secondary font-mono">
                              Created {new Date(board.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <Button onClick={() => navigate(`/board/${board._id}`)} variant="ghost" className="py-1.5 px-3 text-[10px] border border-border-default hover:bg-subtle">
                          Manage
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* TAB 4: TEAM ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority Breakdown SVG Chart */}
              <Card className="p-4 border border-border-default bg-surface-raised flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 mb-3">
                    <TrendingUp size={13} /> Priority Distribution
                  </h3>
                  <p className="text-[11px] text-text-secondary mb-4 leading-relaxed">Live proportion of task criticalities inside all workspaces.</p>
                </div>
                {tasks.length === 0 ? (
                  <p className="text-xs text-text-tertiary py-8 text-center italic">No task data available</p>
                ) : (
                  <div className="flex items-center justify-between gap-6 py-2">
                    {/* SVG Progress Bar Ring or Bar chart */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Circular ring sections */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                        {(() => {
                          const criticalCount = tasks.filter(t => t.priority === 'critical').length;
                          const highCount = tasks.filter(t => t.priority === 'high').length;
                          const mediumCount = tasks.filter(t => t.priority === 'medium').length;
                          const lowCount = tasks.filter(t => t.priority === 'low').length;
                          const total = tasks.length;

                          const criticalPct = (criticalCount / total) * 100;
                          const highPct = (highCount / total) * 100;
                          const mediumPct = (mediumCount / total) * 100;
                          const lowPct = (lowCount / total) * 100;

                          let offset = 0;
                          const elements = [];
                          
                          if (criticalPct > 0) {
                            elements.push(<circle key="crit" cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray={`${criticalPct} ${100 - criticalPct}`} strokeDashoffset={-offset} />);
                            offset += criticalPct;
                          }
                          if (highPct > 0) {
                            elements.push(<circle key="high" cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray={`${highPct} ${100 - highPct}`} strokeDashoffset={-offset} />);
                            offset += highPct;
                          }
                          if (mediumPct > 0) {
                            elements.push(<circle key="med" cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${mediumPct} ${100 - mediumPct}`} strokeDashoffset={-offset} />);
                            offset += mediumPct;
                          }
                          if (lowPct > 0) {
                            elements.push(<circle key="low" cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${lowPct} ${100 - lowPct}`} strokeDashoffset={-offset} />);
                          }

                          return elements;
                        })()}
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-base font-extrabold text-text-primary">{tasks.length}</span>
                        <span className="text-[8px] uppercase tracking-wider text-text-tertiary font-bold">Total Tasks</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-xs text-text-secondary">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Critical</span>
                        <span className="font-bold text-text-primary">{tasks.filter(t => t.priority === 'critical').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> High</span>
                        <span className="font-bold text-text-primary">{tasks.filter(t => t.priority === 'high').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Medium</span>
                        <span className="font-bold text-text-primary">{tasks.filter(t => t.priority === 'medium').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Low</span>
                        <span className="font-bold text-text-primary">{tasks.filter(t => t.priority === 'low').length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Board Comparison Productivity Chart */}
              <Card className="p-4 border border-border-default bg-surface-raised flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 mb-3">
                    <BarChart2 size={13} /> Board Productivity
                  </h3>
                  <p className="text-[11px] text-text-secondary mb-4 leading-relaxed">Comparison of completed tasks against total tasks per workspace.</p>
                </div>
                {boards.length === 0 ? (
                  <p className="text-xs text-text-tertiary py-8 text-center italic">No boards available</p>
                ) : (
                  <div className="space-y-3.5 py-1 text-xs">
                    {boards.slice(0, 4).map((board) => {
                      const boardTasks = tasks.filter(t => t.board?._id === board._id || t.board === board._id);
                      const doneTasks = boardTasks.filter(t => t.list?.title === 'Done');
                      const donePct = boardTasks.length ? (doneTasks.length / boardTasks.length) * 100 : 0;
                      const cover = coverColors.find(c => c.value === board.coverColor) || coverColors[0];

                      return (
                        <div key={board._id} className="space-y-1">
                          <div className="flex justify-between items-center font-semibold text-text-primary text-[11px]">
                            <span>{board.title}</span>
                            <span className="text-text-secondary font-mono">{doneTasks.length} / {boardTasks.length} Done</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded overflow-hidden relative">
                            <div className={`h-full ${cover.bg} transition-all duration-300`} style={{ width: `${donePct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Create Board Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Board">
        <form onSubmit={handleCreateBoard} className="space-y-4">
          <Input
            id="board-title"
            label="Board Title"
            type="text"
            placeholder="e.g. Q3 Launch Campaign"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="board-desc" className="text-sm font-medium text-text-primary">
              Description
            </label>
            <textarea
              id="board-desc"
              placeholder="e.g. Tasks and milestones for the launch of the new dashboard."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm text-text-primary bg-page border border-border-default rounded-md shadow-sm placeholder:text-text-tertiary hover:border-strong focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-primary/20 transition-colors duration-150 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">Cover Theme</label>
            <div className="flex flex-wrap gap-2">
              {coverColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setCoverColor(color.value)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    color.bg
                  } ${
                    coverColor === color.value ? 'border-text-primary scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Board
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
