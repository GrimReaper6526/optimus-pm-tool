import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Layout, 
  Shield, 
  Users, 
  ArrowRight, 
  Kanban, 
  Clock, 
  Calendar, 
  AlertTriangle,
  List,
  BarChart2,
  CheckSquare,
  Activity,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');

  const faqs = [
    {
      q: 'How secure is my project data?',
      a: 'Very secure. We store passwords hashed with bcrypt (12 rounds) and enforce cookie-based refresh token rotation. This ensures sessions are safely signed and refreshed, protecting you against CSRF and credentials theft.'
    },
    {
      q: 'Is there a limit on how many boards or cards I can create?',
      a: 'No. The system does not enforce arbitrary limits on workspaces, lists, or cards. You are free to structure your projects as needed.'
    },
    {
      q: 'Does it support real-time team updates?',
      a: 'Yes. Collaborative actions like assigning members, writing card comments, and moving tasks are instantly stored on the server and logged in the board activity feed for transparency.'
    }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="bg-page min-h-[90vh] flex flex-col justify-between">
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center flex flex-col items-center gap-6">
        <Badge variant="accent" className="px-3 py-1 text-xs">
          Introducing Modus 1.0
        </Badge>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight max-w-2xl">
          Project management, refined for speed and security.
        </h1>
        
        <p className="text-sm md:text-base text-text-secondary max-w-xl leading-relaxed">
          Track issues, reorder tasks on drag-and-drop boards, invite teammates, and monitor activity feeds. All protected by security-hardened token rotation.
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Link to="/auth">
            <Button variant="primary" className="py-2.5 px-6 font-semibold flex items-center gap-1.5 shadow-md">
              Get Started for Free <ArrowRight size={15} />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="ghost" className="py-2.5 px-5 text-text-secondary hover:text-text-primary">
              Learn more
            </Button>
          </a>
        </div>
      </section>

      {/* Tabbed Browser Mockup Section */}
      <section className="max-w-5xl mx-auto px-6 pb-16 w-full">
        <div className="rounded-lg border border-border-strong bg-surface-raised shadow-lg overflow-hidden">
          {/* Browser Window Chrome */}
          <div className="h-9 bg-muted border-b border-border-default flex items-center px-4 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            <div className="flex-1 bg-page border border-border-default rounded mx-12 h-5 text-[10px] text-text-tertiary flex items-center justify-center">
              https://modus-app-rust.vercel.app/active-sprint-q3
            </div>
          </div>

          {/* Tab Selector */}
          <div className="bg-subtle border-b border-border-default flex items-center px-4 overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${activeTab === 'kanban' ? 'border-accent-primary text-accent-primary bg-page' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-page/40'}`}
            >
              <Kanban size={13} />
              Kanban Board
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${activeTab === 'list' ? 'border-accent-primary text-accent-primary bg-page' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-page/40'}`}
            >
              <List size={13} />
              Detailed List
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${activeTab === 'timeline' ? 'border-accent-primary text-accent-primary bg-page' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-page/40'}`}
            >
              <Calendar size={13} />
              Gantt Timeline
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${activeTab === 'analytics' ? 'border-accent-primary text-accent-primary bg-page' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-page/40'}`}
            >
              <BarChart2 size={13} />
              Team Analytics
            </button>
          </div>
          
          {/* Active Mock Window Content */}
          <div className="bg-page min-h-[300px]">
            {activeTab === 'kanban' && (
              <div className="p-5 grid grid-cols-3 gap-4 pointer-events-none select-none">
                {/* Column 1: To Do */}
                <div className="rounded bg-subtle border border-border-default p-3 flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border-default">
                    <span className="text-xs font-bold text-text-primary">To Do</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-text-secondary font-semibold">2</span>
                  </div>
                  
                  <div className="bg-surface-raised border border-border-default rounded p-3 relative shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full rounded-l bg-accent-primary" />
                    <p className="text-xs font-semibold text-text-primary mb-2">Configure environment variables</p>
                    <div className="flex items-center justify-between text-[9px] text-text-secondary">
                      <span className="flex items-center gap-0.5"><Clock size={8} /> Jun 28</span>
                      <span className="px-1.5 py-0.5 rounded bg-accent-subtle text-accent-text border border-accent-primary/20 font-semibold text-[8px]">Medium</span>
                    </div>
                  </div>

                  <div className="bg-surface-raised border border-border-default rounded p-3 relative shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full rounded-l bg-error-icon" />
                    <p className="text-xs font-semibold text-text-primary mb-2">Audit dependencies for CVEs</p>
                    <div className="flex items-center justify-between text-[9px] text-text-secondary">
                      <span className="flex items-center gap-0.5 text-error-text bg-error-bg px-1 rounded"><AlertTriangle size={8} /> Jun 26</span>
                      <span className="px-1.5 py-0.5 rounded bg-error-bg text-error-text border border-error-border font-semibold text-[8px]">Critical</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: In Progress */}
                <div className="rounded bg-subtle border border-border-default p-3 flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border-default">
                    <span className="text-xs font-bold text-text-primary">In Progress</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-text-secondary font-semibold">1</span>
                  </div>

                  <div className="bg-surface-raised border border-border-default rounded p-3 relative shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full rounded-l bg-[#ea580c]" />
                    <p className="text-xs font-semibold text-text-primary mb-2">Implement JWT refresh rotation</p>
                    <div className="flex items-center justify-between text-[9px] text-text-secondary">
                      <span className="flex items-center gap-0.5"><Clock size={8} /> Jul 2</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#fff7ed] text-[#c2410c] border border-orange-200 font-semibold text-[8px]">High</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Done */}
                <div className="rounded bg-subtle border border-border-default p-3 flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border-default">
                    <span className="text-xs font-bold text-text-primary">Done</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-text-secondary font-semibold">1</span>
                  </div>

                  <div className="bg-surface-raised border border-border-default rounded p-3 relative shadow-sm opacity-70">
                    <div className="absolute top-0 left-0 w-1 h-full rounded-l bg-success-icon" />
                    <p className="text-xs font-semibold text-text-primary mb-2 line-through">Scaffold Express backend</p>
                    <div className="flex items-center justify-between text-[9px] text-text-secondary">
                      <span className="flex items-center gap-0.5"><Clock size={8} /> Completed</span>
                      <span className="px-1.5 py-0.5 rounded bg-success-bg text-success-text border border-success-border font-semibold text-[8px]">Low</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'list' && (
              <div className="p-4 overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="border-b border-border-default text-text-secondary font-semibold text-[10px] uppercase">
                      <th className="py-2.5 px-3 font-mono">ID</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3 text-center">Estimate</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Assignee</th>
                      <th className="py-2.5 px-3">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-default hover:bg-subtle/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-text-tertiary">PM-101</td>
                      <td className="py-2.5 px-3 font-bold text-text-primary">Integrate JWT rotating refresh token cookies</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-warning-bg text-warning-text border border-warning-border">In Progress</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-error-bg text-error-text border border-error-border font-semibold">High</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium">5 pts</td>
                      <td className="py-2.5 px-3 text-text-secondary">Jun 27, 2026</td>
                      <td className="py-2.5 px-3">
                        <div className="w-5 h-5 rounded-full bg-accent-primary text-white flex items-center justify-center font-bold text-[9px]" title="Grim Reaper">GR</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-muted text-text-secondary text-[9px] font-semibold">Security</span>
                          <span className="px-1.5 py-0.2 rounded bg-muted text-text-secondary text-[9px] font-semibold">Backend</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-border-default hover:bg-subtle/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-text-tertiary">PM-102</td>
                      <td className="py-2.5 px-3 font-bold text-text-primary">Implement drag-and-drop column sorting</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-info-bg text-info-text border border-info-border">To Do</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent-subtle text-accent-text border border-accent-primary/10">Medium</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium">3 pts</td>
                      <td className="py-2.5 px-3 text-text-secondary">Jul 02, 2026</td>
                      <td className="py-2.5 px-3">
                        <div className="w-5 h-5 rounded-full bg-success-text text-white flex items-center justify-center font-bold text-[9px]" title="Alice Developer">AD</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-muted text-text-secondary text-[9px] font-semibold">Frontend</span>
                          <span className="px-1.5 py-0.2 rounded bg-muted text-text-secondary text-[9px] font-semibold">UX</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-border-default hover:bg-subtle/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-text-tertiary">PM-103</td>
                      <td className="py-2.5 px-3 font-bold text-text-primary font-medium text-text-primary line-through opacity-60">Scaffold Express backend</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-success-bg text-success-text border border-success-border opacity-70">Done</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-text-secondary opacity-70">Low</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium opacity-60">1 pt</td>
                      <td className="py-2.5 px-3 text-success-text flex items-center gap-1 font-semibold text-[10px]"><Clock size={10} /> Completed</td>
                      <td className="py-2.5 px-3 opacity-60">
                        <div className="w-5 h-5 rounded-full bg-warning-icon text-white flex items-center justify-center font-bold text-[9px]" title="Bob Architect">BA</div>
                      </td>
                      <td className="py-2.5 px-3 opacity-60">
                        <div className="flex gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-muted text-text-secondary text-[9px] font-semibold">Database</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="p-6 flex flex-col gap-6 min-h-[300px] text-xs justify-center select-none">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="font-semibold text-text-primary col-span-1">Database & Auth API</span>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="flex-1 h-6 bg-muted rounded border border-border-default relative overflow-hidden">
                        <div className="h-full bg-success-icon/20 border-r border-success-icon flex items-center px-2" style={{ width: '100%' }}>
                          <span className="text-[10px] text-success-text font-semibold">100% Complete</span>
                        </div>
                      </div>
                      <span className="text-text-secondary text-[10px] w-20 font-mono text-right">Jul 01 - Jul 05</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="font-semibold text-text-primary col-span-1">Kanban & Reordering</span>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="flex-1 h-6 bg-muted rounded border border-border-default relative overflow-hidden">
                        <div className="h-full bg-accent-primary/20 border-r border-accent-primary flex items-center px-2" style={{ width: '75%' }}>
                          <span className="text-[10px] text-accent-text font-semibold">75% Complete</span>
                        </div>
                      </div>
                      <span className="text-text-secondary text-[10px] w-20 font-mono text-right">Jul 06 - Jul 12</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="font-semibold text-text-primary col-span-1">Teammates & Roles</span>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="flex-1 h-6 bg-muted rounded border border-border-default relative overflow-hidden">
                        <div className="h-full bg-warning-icon/20 border-r border-warning-icon flex items-center px-2" style={{ width: '30%' }}>
                          <span className="text-[10px] text-warning-text font-semibold">30% In Progress</span>
                        </div>
                      </div>
                      <span className="text-text-secondary text-[10px] w-20 font-mono text-right">Jul 13 - Jul 20</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="font-semibold text-text-primary col-span-1">Notification Logs</span>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="flex-1 h-6 bg-muted rounded border border-border-default relative overflow-hidden">
                        <div className="h-full bg-text-tertiary/10 flex items-center px-2" style={{ width: '0%' }}>
                          <span className="text-[10px] text-text-tertiary font-semibold">0% Pending</span>
                        </div>
                      </div>
                      <span className="text-text-secondary text-[10px] w-20 font-mono text-right">Jul 21 - Jul 28</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px] text-xs select-none">
                {/* Burndown Chart */}
                <div className="border border-border-default rounded p-4 bg-subtle">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-text-primary">Sprint Burndown (Story Points)</span>
                    <span className="text-[10px] font-mono bg-error-bg text-error-text border border-error-border px-1.5 rounded">Active Sprint</span>
                  </div>
                  <svg className="w-full h-36" viewBox="0 0 300 120">
                    <line x1="20" y1="10" x2="280" y2="10" stroke="var(--border-default)" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="20" y1="40" x2="280" y2="40" stroke="var(--border-default)" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="20" y1="70" x2="280" y2="70" stroke="var(--border-default)" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="20" y1="100" x2="280" y2="100" stroke="var(--border-default)" strokeWidth="0.5" />

                    <line x1="20" y1="10" x2="280" y2="100" stroke="var(--text-tertiary)" strokeWidth="1" strokeDasharray="5,5" />
                    
                    <path d="M20,10 L72,15 L124,35 L176,55 L228,80 L280,100" fill="none" stroke="var(--accent-primary)" strokeWidth="2" />
                    
                    <circle cx="20" cy="10" r="3" fill="var(--accent-primary)" />
                    <circle cx="72" cy="15" r="3" fill="var(--accent-primary)" />
                    <circle cx="124" cy="35" r="3" fill="var(--accent-primary)" />
                    <circle cx="176" cy="55" r="3" fill="var(--accent-primary)" />
                    <circle cx="228" cy="80" r="3" fill="var(--accent-primary)" />
                    <circle cx="280" cy="100" r="3" fill="var(--accent-primary)" />

                    <text x="5" y="14" fill="var(--text-secondary)" fontSize="7">40</text>
                    <text x="5" y="44" fill="var(--text-secondary)" fontSize="7">30</text>
                    <text x="5" y="74" fill="var(--text-secondary)" fontSize="7">20</text>
                    <text x="5" y="104" fill="var(--text-secondary)" fontSize="7">0</text>

                    <text x="20" y="112" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Day 1</text>
                    <text x="85" y="112" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Day 4</text>
                    <text x="150" y="112" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Day 8</text>
                    <text x="215" y="112" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Day 12</text>
                    <text x="280" y="112" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Day 14</text>
                  </svg>
                  <div className="flex justify-between items-center text-[9px] text-text-secondary mt-1 font-mono">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-accent-primary rounded-full inline-block"></span> Actual Remaining</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-text-tertiary border border-dashed rounded-full inline-block"></span> Ideal Burn</span>
                  </div>
                </div>

                {/* Velocity Bar Chart */}
                <div className="border border-border-default rounded p-4 bg-subtle">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-text-primary">Sprint Velocity (Completed Points)</span>
                    <span className="text-[10px] font-mono text-success-text bg-success-bg border border-success-border px-1.5 rounded">Avg: 31.5 pts</span>
                  </div>
                  <svg className="w-full h-36" viewBox="0 0 300 120">
                    <line x1="20" y1="10" x2="280" y2="10" stroke="var(--border-default)" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="20" y1="40" x2="280" y2="40" stroke="var(--border-default)" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="20" y1="70" x2="280" y2="70" stroke="var(--border-default)" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="20" y1="100" x2="280" y2="100" stroke="var(--border-default)" strokeWidth="0.5" />

                    <rect x="50" y="37" width="28" height="63" fill="var(--text-tertiary)" rx="2" />
                    <text x="64" y="30" fill="var(--text-primary)" fontSize="8" fontWeight="bold" textAnchor="middle">28</text>
                    
                    <rect x="110" y="28" width="28" height="72" fill="var(--text-tertiary)" rx="2" />
                    <text x="124" y="21" fill="var(--text-primary)" fontSize="8" fontWeight="bold" textAnchor="middle">32</text>

                    <rect x="170" y="21" width="28" height="79" fill="var(--accent-primary)" rx="2" />
                    <text x="184" y="14" fill="var(--text-primary)" fontSize="8" fontWeight="bold" textAnchor="middle">35</text>

                    <rect x="230" y="14" width="28" height="86" fill="var(--accent-subtle)" stroke="var(--accent-primary)" strokeWidth="1" strokeDasharray="2,2" rx="2" />
                    <text x="244" y="9" fill="var(--accent-text)" fontSize="8" fontWeight="bold" textAnchor="middle">38</text>

                    <text x="64" y="112" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Sprint 1</text>
                    <text x="124" y="112" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Sprint 2</text>
                    <text x="184" y="112" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Sprint 3</text>
                    <text x="244" y="112" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Sprint 4 (Est)</text>
                  </svg>
                  <div className="flex justify-between items-center text-[9px] text-text-secondary mt-1 font-mono">
                    <span>Efficiency grew consistently at 15%+ per cycle.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Workflow Timeline Section */}
      <section className="py-16 max-w-5xl mx-auto px-6 w-full border-t border-border-default">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">A streamlined workflow</h2>
          <p className="text-xs text-text-secondary mt-1">Get up and running in minutes with these simple stages.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-accent-primary font-mono">01</span>
            <h4 className="text-sm font-bold text-text-primary">Create Workspace</h4>
            <p className="text-xs text-text-secondary leading-relaxed">Create dedicated boards for projects, specify descriptions, and pick visual themes.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-accent-primary font-mono">02</span>
            <h4 className="text-sm font-bold text-text-primary">Organize Backlogs</h4>
            <p className="text-xs text-text-secondary leading-relaxed">Add lists for sprint backlogs, in-progress tasks, and completed reviews.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-accent-primary font-mono">03</span>
            <h4 className="text-sm font-bold text-text-primary">Assign & Schedule</h4>
            <p className="text-xs text-text-secondary leading-relaxed">Invite members by email, attach collaborators to cards, set priorities, and log due dates.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-accent-primary font-mono">04</span>
            <h4 className="text-sm font-bold text-text-primary">Track Progress</h4>
            <p className="text-xs text-text-secondary leading-relaxed">Move cards interactively, write updates in comments, and track the audit log feed.</p>
          </div>
        </div>
      </section>

      {/* Task Fields & Attributes Details Section (NEW) */}
      <section className="py-16 bg-subtle border-t border-b border-border-default w-full">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-2">Advanced Project Metadata</Badge>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Granular fields for accurate tracking</h2>
            <p className="text-xs text-text-secondary mt-1">Every attribute is optimized to support sprint planning, resource allocation, and team analytics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-accent-primary font-mono uppercase tracking-wider">Complexity Estimates</span>
              <h4 className="text-sm font-bold text-text-primary">Story Point Fibonacci Scale</h4>
              <p className="text-xs text-text-secondary leading-relaxed">Assign weight using the Fibonacci scale (1, 2, 3, 5, 8, 13) to accurately estimate task complexity instead of just hours.</p>
              <div className="flex items-center gap-1.5 mt-2">
                {['1', '2', '3', '5', '8', '13'].map((pt) => (
                  <span key={pt} className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-semibold ${pt === '5' ? 'bg-accent-subtle text-accent-text border-accent-primary/20' : 'bg-muted text-text-secondary border-border-default'}`}>{pt}</span>
                ))}
              </div>
            </Card>

            <Card className="p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-error-text font-mono uppercase tracking-wider">Risk Levels</span>
              <h4 className="text-sm font-bold text-text-primary">Task Priorities</h4>
              <p className="text-xs text-text-secondary leading-relaxed">Mark critical paths using structured priorities. Get alerted on due dates for high-risk items automatically.</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-error-bg text-error-text border border-error-border">Urgent</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-warning-bg text-warning-text border border-warning-border">High</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-info-bg text-info-text border border-info-border">Medium</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-muted text-text-secondary border-border-default">Low</span>
              </div>
            </Card>

            <Card className="p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-success-text font-mono uppercase tracking-wider">Resource Allocation</span>
              <h4 className="text-sm font-bold text-text-primary">Teammate Workload</h4>
              <p className="text-xs text-text-secondary leading-relaxed">Track active allocations in real-time. Distribute complexity scores evenly across team members to prevent burnout.</p>
              <div className="space-y-2.5 mt-2">
                <div>
                  <div className="flex justify-between items-center text-[9px] mb-0.5 text-text-secondary">
                    <span>Grim R. (Lead)</span>
                    <span className="font-semibold text-text-primary">8 / 10 pts</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-accent-primary w-[80%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[9px] mb-0.5 text-text-secondary">
                    <span>Alice D. (Developer)</span>
                    <span className="font-semibold text-success-text">12 / 12 pts (Cap)</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-success-text w-full" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-warning-text font-mono uppercase tracking-wider">Granular Deliverables</span>
              <h4 className="text-sm font-bold text-text-primary">Subtasks Checklists</h4>
              <p className="text-xs text-text-secondary leading-relaxed">Break down complex epic tasks into single-responsibility checklist items with interactive progress trackers.</p>
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-3.5 h-3.5 rounded border border-accent-primary bg-accent-subtle text-accent-text flex items-center justify-center text-[8px] font-bold">✓</span>
                  <span className="text-text-secondary line-through">Configure cookies flags</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-3.5 h-3.5 rounded border border-border-default flex items-center justify-center" />
                  <span className="text-text-primary">Sanitize request payload</span>
                </div>
                <div className="w-full bg-muted h-1 rounded overflow-hidden mt-1">
                  <div className="w-[50%] bg-accent-primary h-full" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 w-full border-b border-border-default">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Engineered for product teams</h2>
            <p className="text-xs text-text-secondary mt-1">A simple tool equipped with enterprise-grade parameters.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex flex-col gap-3 p-5">
              <div className="p-2 rounded bg-accent-subtle text-accent-primary self-start">
                <Kanban size={18} />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Kanban Boards</h3>
              <p className="text-xs leading-relaxed text-text-secondary">
                Drag cards horizontally between lists. Track position values on backend automatically with instant optimistic UI reorders.
              </p>
            </Card>

            <Card className="flex flex-col gap-3 p-5">
              <div className="p-2 rounded bg-success-bg text-success-text self-start">
                <Shield size={18} />
              </div>
              <h3 className="text-sm font-bold text-text-primary">OWASP Security</h3>
              <p className="text-xs leading-relaxed text-text-secondary">
                Password bcrypt hashing, cookie-based refresh token rotation, authentication rate-limiters, and centralized exception logs.
              </p>
            </Card>

            <Card className="flex flex-col gap-3 p-5">
              <div className="p-2 rounded bg-warning-bg text-warning-text self-start">
                <Users size={18} />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Team Invites</h3>
              <p className="text-xs leading-relaxed text-text-secondary">
                Add team members to project boards by username/email. Assign board collaborators to individual task cards.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack & Integration Section */}
      <section className="py-16 bg-subtle border-b border-border-default w-full">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <Badge variant="accent" className="mb-3">Tech Ecosystem</Badge>
            <h2 className="text-xl font-bold tracking-tight text-text-primary leading-tight">
              Built on a modern, secure technology stack.
            </h2>
            <p className="text-xs text-text-secondary mt-3 leading-relaxed">
              We leverage highly reliable libraries on both the client and server layers. The system runs fully containerized or on standard cloud providers with zero dependencies bloat.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              <span className="text-[10px] px-2.5 py-1 rounded bg-page border border-border-default font-mono font-medium text-text-secondary">React 19</span>
              <span className="text-[10px] px-2.5 py-1 rounded bg-page border border-border-default font-mono font-medium text-text-secondary">Node Express</span>
              <span className="text-[10px] px-2.5 py-1 rounded bg-page border border-border-default font-mono font-medium text-text-secondary">MongoDB / Mongoose</span>
              <span className="text-[10px] px-2.5 py-1 rounded bg-page border border-border-default font-mono font-medium text-text-secondary">Zod Schemas</span>
              <span className="text-[10px] px-2.5 py-1 rounded bg-page border border-border-default font-mono font-medium text-text-secondary">JWT Secrets</span>
              <span className="text-[10px] px-2.5 py-1 rounded bg-page border border-border-default font-mono font-medium text-text-secondary">Tailwind CSS</span>
            </div>
          </div>
          
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Simulated Server Metrics</h3>
            <div className="space-y-3.5 mt-2">
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-text-secondary font-medium">Bcrypt Hashing Iterations:</span>
                  <span className="font-bold text-text-primary">12 Salt Rounds</span>
                </div>
                <div className="h-1 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-accent-primary w-[90%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-text-secondary font-medium">Session Token Rotation Security:</span>
                  <span className="font-bold text-text-primary">Strict Revocations Active</span>
                </div>
                <div className="h-1 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-success-text w-[100%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-text-secondary font-medium">Rate Limiting Auth Gateways:</span>
                  <span className="font-bold text-text-primary">Max 5 reqs/15m Lock</span>
                </div>
                <div className="h-1 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-error-text w-[95%]" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 max-w-5xl mx-auto px-6 w-full">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">What developers say</h2>
          <p className="text-xs text-text-secondary mt-1">Feedback from users building projects with Modus.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 flex flex-col justify-between h-36">
            <p className="text-xs italic text-text-secondary leading-relaxed">
              "The Linear-like UI is remarkably fast. Moving cards feels completely natural, there is no visual clutter, and pages load instantly."
            </p>
            <div className="text-[10px] text-text-primary font-bold mt-4">— Software Engineer, SaaS Dev</div>
          </Card>
          <Card className="p-5 flex flex-col justify-between h-36">
            <p className="text-xs italic text-text-secondary leading-relaxed">
              "Security compliance was checked against rigorous standards. Token rotation and password bcrypt hashing are fully verified."
            </p>
            <div className="text-[10px] text-text-primary font-bold mt-4">— Security Auditor, SecOps</div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-subtle border-t border-border-default w-full">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xl font-bold tracking-tight text-text-primary text-center mb-8">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-border-default rounded-md bg-page overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-4 text-xs font-semibold text-text-primary hover:bg-subtle transition-all text-left focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-text-tertiary text-lg leading-none">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 border-t border-border-default text-xs text-text-secondary leading-relaxed bg-subtle">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-border-default bg-page py-6 w-full">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} Modus. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hover:text-text-primary transition-colors font-semibold">Sign In</Link>
            <span className="text-text-tertiary">|</span>
            <span className="text-text-tertiary">Built for OptimusAutomate Track</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
