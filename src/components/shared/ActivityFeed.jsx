import PropTypes from "prop-types";
import { Clock, User, FileText, Users, GraduationCap, IndianRupee, Bell } from "lucide-react";

const ActivityFeed = ({ activities = [], maxItems = 10, className = "" }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className={`bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm ${className}`}>
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <p className="text-xs text-gray-500 font-semibold text-center py-6">
          No recent activity
        </p>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case "student":
        return Users;
      case "teacher":
        return GraduationCap;
      case "fee":
        return IndianRupee;
      case "notice":
        return Bell;
      case "exam":
        return FileText;
      default:
        return User;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={`bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm ${className}`}>
      <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {displayActivities.map((activity, index) => {
          const Icon = getIcon(activity.type);
          return (
            <div
              key={index}
              className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#caf0f8] flex items-center justify-center">
                <Icon size={14} className="text-[#0077b6]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 font-semibold leading-tight">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={10} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-medium">
                    {formatTime(activity.timestamp)}
                  </span>
                  {activity.user && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {activity.user}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ActivityFeed.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(["student", "teacher", "fee", "notice", "exam", "other"]),
      description: PropTypes.string.isRequired,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      user: PropTypes.string,
    }),
  ),
  maxItems: PropTypes.number,
  className: PropTypes.string,
};

export default ActivityFeed;
