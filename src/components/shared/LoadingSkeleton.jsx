import PropTypes from "prop-types";

const LoadingSkeleton = ({ variant = "card", count = 1, className = "" }) => {
  const baseClass = "animate-pulse bg-slate-200 rounded";

  if (variant === "table-row") {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3 border-b border-slate-100"
          >
            <div className={`${baseClass} h-4 w-12 rounded-full`} />
            <div className={`${baseClass} h-4 w-32`} />
            <div className={`${baseClass} h-4 w-24`} />
            <div className={`${baseClass} h-4 w-20`} />
            <div className={`${baseClass} h-4 w-16 ml-auto`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return <div className={`${baseClass} h-32 ${className}`} />;
  }

  if (variant === "stat-card") {
    return (
      <div
        className={`bg-white border-2 border-slate-100 rounded-2xl p-4 ${className}`}
      >
        <div className={`${baseClass} h-4 w-24 mb-2`} />
        <div className={`${baseClass} h-8 w-16`} />
      </div>
    );
  }

  if (variant === "form-field") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className={`${baseClass} h-3 w-24`} />
        <div className={`${baseClass} h-10 w-full`} />
      </div>
    );
  }

  return <div className={`${baseClass} ${className}`} />;
};

LoadingSkeleton.propTypes = {
  variant: PropTypes.oneOf(["card", "table-row", "stat-card", "form-field"]),
  count: PropTypes.number,
  className: PropTypes.string,
};

export default LoadingSkeleton;
