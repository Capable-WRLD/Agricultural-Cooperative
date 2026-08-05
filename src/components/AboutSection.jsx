function AboutSection() {
  return (
    <section
      id="about"
      className="container py-5"
    >
      <div className="row align-items-center">

        <div className="col-lg-6">

          <h2 className="text-success mb-4">
            Why Agricultural Cooperatives Need Digital Transformation
          </h2>

          <p>
            Agricultural cooperatives often struggle with
            manual record keeping, delayed loan processing,
            inventory mismanagement and financial transparency.
          </p>

          <p>
            Our platform digitizes every operation,
            allowing administrators and members to
            collaborate efficiently through one secure system.
          </p>

        </div>

        <div className="col-lg-6">

          <div className="glass-card p-4">

            <h4>Benefits</h4>

            <ul>
              <li>Improved Transparency</li>
              <li>Faster Loan Processing</li>
              <li>Digital Savings Tracking</li>
              <li>Inventory Visibility</li>
              <li>Automated Reports</li>

            </ul>

          </div>

        </div>

      </div>
    </section>
  );
}

export default AboutSection;