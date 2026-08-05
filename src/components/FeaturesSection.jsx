import {
  FaUsers,
  FaSeedling,
  FaWarehouse,
  FaMoneyBillWave,
  FaChartBar,
  FaShieldAlt
} from "react-icons/fa";

function FeaturesSection() {
  return (
    <section
      id="features"
      className="container py-5"
    >

      <h2 className="text-center text-success mb-5">
        Core Features
      </h2>

      <div className="row g-4">

        <div className="col-md-4">
          <div className="feature-box">
            <FaMoneyBillWave size={45} />
            <h4 className="mt-3">Loan Management</h4>
            <p>
              Configure and manage cooperative loans.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-box">
            <FaSeedling size={45} />
            <h4 className="mt-3">Savings Tracking</h4>
            <p>
              Monitor member contributions and savings.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-box">
            <FaWarehouse size={45} />
            <h4 className="mt-3">Inventory Control</h4>
            <p>
              Manage seeds, fertilizers and farm equipment.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-box">
            <FaUsers size={45} />
            <h4 className="mt-3">Member Management</h4>
            <p>
              Maintain cooperative member records.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-box">
            <FaChartBar size={45} />
            <h4 className="mt-3">Financial Reports</h4>
            <p>
              Generate reports and monitor performance.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-box">
            <FaShieldAlt size={45} />
            <h4 className="mt-3">Enterprise Security</h4>
            <p>
              Secure cooperative data and transactions.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
}

export default FeaturesSection;