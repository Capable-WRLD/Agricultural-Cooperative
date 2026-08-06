import AdminLayout from "../components/AdminLayout";
import "../styles/SavingsPage.css";

function SavingsPage() {

  const savings = [
    {
      id: 1,
      member: "John Farmer",
      amount: "₦150,000",
      date: "15 Aug 2026",
      status: "Completed",
    },
    {
      id: 2,
      member: "Mary Agro",
      amount: "₦90,000",
      date: "18 Aug 2026",
      status: "Completed",
    },
  ];

  return (

    <AdminLayout>

      <div className="savings-page">

        {/* Header */}

        <div className="savings-header">

          <div>

            <h2>💰 Savings Management</h2>

            <p>
              Monitor members' savings contributions across the cooperative.
            </p>

          </div>

        </div>

        {/* Statistics */}

        <div className="row g-4 savings-stats">

          <div className="col-lg-4 col-md-6">

            <div className="savings-card">

              <h6>Total Savings</h6>

              <h2>₦240,000</h2>

            </div>

          </div>

          <div className="col-lg-4 col-md-6">

            <div className="savings-card">

              <h6>Total Contributors</h6>

              <h2>2</h2>

            </div>

          </div>

          <div className="col-lg-4 col-md-12">

            <div className="savings-card">

              <h6>This Month</h6>

              <h2>₦240,000</h2>

            </div>

          </div>

        </div>

        {/* Savings Table */}

        <div className="glass-card savings-table mt-4">

          <h4 className="mb-4">Savings Records</h4>

          <div className="table-responsive">

            <table className="table align-middle">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Member</th>

                  <th>Amount</th>

                  <th>Date</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {savings.map((item) => (

                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>{item.member}</td>

                    <td className="text-success fw-bold">
                      {item.amount}
                    </td>

                    <td>{item.date}</td>

                    <td>

                      <span className="savings-badge">

                        {item.status}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </AdminLayout>

  );
}

export default SavingsPage;