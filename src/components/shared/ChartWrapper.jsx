import PropTypes from "prop-types";

const CHART_COLORS = [
  "#0077b6",
  "#0096c7",
  "#00b4d8",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
];

const BarChartImpl = ({ data, height }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ height }} className="flex flex-col justify-end">
      <div className="flex items-end justify-around gap-1 h-full pb-6 relative">
        {data.map((item, i) => {
          const pct = (item.value / maxValue) * 100;
          const color = CHART_COLORS[i % CHART_COLORS.length];
          return (
            <div
              key={i}
              className="flex flex-col items-center flex-1 h-full justify-end group relative"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#03045e] text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {item.value}
              </div>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${pct}%`,
                  backgroundColor: color,
                  minHeight: 4,
                }}
              />
              <div className="text-[9px] text-gray-500 mt-1.5 text-center truncate w-full leading-tight">
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PieChartImpl = ({ data, height }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  let angle = -90;
  const segments = data.map((item, i) => {
    const sweep = (item.value / total) * 360;
    const start = angle;
    angle += sweep;
    return {
      ...item,
      start,
      sweep,
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  const describeArc = (cx, cy, r, startDeg, sweepDeg) => {
    if (sweepDeg >= 360) sweepDeg = 359.99;
    const toRad = (d) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(startDeg + sweepDeg));
    const y2 = cy + r * Math.sin(toRad(startDeg + sweepDeg));
    const large = sweepDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div style={{ height }} className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 100 100" className="flex-1 w-full max-w-[200px]">
        {segments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(50, 50, 40, seg.start, seg.sweep)}
            fill={seg.color}
            stroke="white"
            strokeWidth="0.8"
          >
            <title>
              {seg.name}: {seg.value} ({((seg.value / total) * 100).toFixed(0)}
              %)
            </title>
          </path>
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex items-center gap-1 text-[10px] text-gray-600"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span>
              {seg.name} ({((seg.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartWrapper = ({
  type = "bar",
  data = [],
  height = 260,
  className = "",
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div className={className}>
      {type === "pie" ? (
        <PieChartImpl data={data} height={height} />
      ) : (
        <BarChartImpl data={data} height={height} />
      )}
    </div>
  );
};

BarChartImpl.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
};

PieChartImpl.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
};

ChartWrapper.propTypes = {
  type: PropTypes.oneOf(["bar", "pie", "line", "area"]),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ),
  height: PropTypes.number,
  className: PropTypes.string,
};

export default ChartWrapper;
