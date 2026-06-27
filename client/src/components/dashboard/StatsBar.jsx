import { ClipboardList, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';

export default function StatsBar({ stats = { total: 0, lists: [] } }) {
  const lists = stats.lists || [];

  const items = [
    { label: 'Total Tasks', value: stats.total || 0, colorClass: 'text-accent-primary', icon: <ClipboardList size={20} /> },
    ...lists.map(list => {
      const titleLower = list.title.toLowerCase();
      let colorClass = 'text-accent-primary';
      let icon = <ClipboardList size={20} />;

      if (titleLower === 'to do' || titleLower === 'todo') {
        colorClass = 'text-accent-primary';
        icon = <ClipboardList size={20} />;
      } else if (titleLower === 'in progress' || titleLower === 'inprogress') {
        colorClass = 'text-warning-text';
        icon = <Clock size={20} />;
      } else if (titleLower === 'done' || titleLower === 'completed') {
        colorClass = 'text-success-text';
        icon = <CheckCircle2 size={20} />;
      } else if (titleLower === 'overdue') {
        colorClass = 'text-error-text';
        icon = <AlertTriangle size={20} />;
      } else if (titleLower === 'qa' || titleLower === 'testing') {
        colorClass = 'text-info-text';
        icon = <ClipboardList size={20} />;
      } else {
        colorClass = 'text-text-secondary';
        icon = <ClipboardList size={20} />;
      }

      return {
        label: list.title,
        value: list.count,
        colorClass,
        icon
      };
    })
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
      {items.map(item => (
        <Card key={item.label} className="flex items-center justify-between p-4 bg-surface-raised border border-border-default">
          <div>
            <div className="text-2xl font-bold tracking-tight mb-0.5">
              <span className={item.colorClass}>{item.value}</span>
            </div>
            <div className="text-xs text-text-secondary font-semibold">{item.label}</div>
          </div>
          <div className={`p-2 rounded bg-muted ${item.colorClass}`}>
            {item.icon}
          </div>
        </Card>
      ))}
    </div>
  );
}
