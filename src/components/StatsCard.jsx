function StatsCard({ title, value, icon }) {
  return (
    <div className="glass-card stat-card p-4 text-center">

      <i className={`bi ${icon} text-success fs-1`} />

      <h5 className="mt-3">
        {title}
      </h5>

      <h2 className="fw-bold">
        {value}
      </h2>

    </div>
  );
}

export default StatsCard;