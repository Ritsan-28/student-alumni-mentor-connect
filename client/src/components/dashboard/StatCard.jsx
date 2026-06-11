const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-emerald-600 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default StatCard;