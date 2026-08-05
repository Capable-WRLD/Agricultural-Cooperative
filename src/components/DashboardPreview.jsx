function DashboardPreview() {
  return (
    <section className="container py-5">

      <h2 className="text-center text-success mb-5">
        Platform Preview
      </h2>

      <div className="glass-card p-5">

        <div className="row text-center">

          <div className="col-md-3">
            <h2 className="text-success">250</h2>
            <p>Members</p>
          </div>

          <div className="col-md-3">
            <h2 className="text-success">₦5M</h2>
            <p>Savings</p>
          </div>

          <div className="col-md-3">
            <h2 className="text-success">120</h2>
            <p>Loans</p>
          </div>

          <div className="col-md-3">
            <h2 className="text-success">85</h2>
            <p>Inventory Items</p>
          </div>

        </div>

      </div>

    </section>
  );
}

export default DashboardPreview;