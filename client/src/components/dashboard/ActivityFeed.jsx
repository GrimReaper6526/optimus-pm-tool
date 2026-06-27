import { formatDistanceToNow } from 'date-fns';
import { Card } from '../ui/Card';

export default function ActivityFeed({ activities = [] }) {
  const getActivityText = (act) => {
    switch (act.type) {
      case 'card_created':
        return `created card "${act.data?.cardTitle}"`;
      case 'card_moved':
        return `moved "${act.data?.cardTitle}" from "${act.data?.fromList}" to "${act.data?.toList}"`;
      case 'card_commented':
        return `commented on "${act.data?.cardTitle}": "${act.data?.commentSnippet}"`;
      case 'list_created':
        return `created list "${act.data?.listTitle}"`;
      case 'member_added':
        return `added member "${act.data?.memberName}"`;
      default:
        return `performed action: ${act.type}`;
    }
  };

  return (
    <Card className="h-full max-h-[400px] overflow-y-auto p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-xs text-text-tertiary">No recent activity.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((act) => (
            <div key={act._id} className="flex gap-2.5 items-start text-xs border-b border-border-default pb-2.5 last:border-0 last:pb-0">
              <img
                src={act.user?.avatar}
                alt={act.user?.username}
                className="w-5 h-5 rounded-full border border-border-default mt-0.5 bg-muted"
              />
              <div className="flex-1">
                <p className="text-text-primary">
                  <span className="font-semibold">{act.user?.username}</span> {getActivityText(act)}
                </p>
                <span className="text-[10px] text-text-tertiary">
                  {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
