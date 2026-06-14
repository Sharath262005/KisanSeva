const StatsCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-xl shadow ${color} flex flex-col`}>
    <span className="text-sm font-medium">{title}</span>
    <span className="text-3xl font-bold mt-1">{value || 0}</span>
  </div>
);
export default StatsCard;