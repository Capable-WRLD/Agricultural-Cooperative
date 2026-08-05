function TimelineSection() {
  return (
    <section className="container py-5">

      <h2 className="text-center text-success mb-5">
        How It Works
      </h2>

      <div className="row text-center">

        <div className="col-md-4">
          <div className="glass-card p-4">
            <h3 className="text-success">1</h3>
            <h5>Secure Registration</h5>
            <p>
              Register as an Admin or Member.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4">
            <h3 className="text-success">2</h3>
            <h5>Admin Approval</h5>
            <p>
              Members are verified before access.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4">
            <h3 className="text-success">3</h3>
            <h5>Cooperative Growth</h5>
            <p>
              Access loans, savings and inventory tools.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
}

export default TimelineSection;