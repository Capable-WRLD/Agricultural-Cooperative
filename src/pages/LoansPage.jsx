function LoansPage() {
  return (
    <div className="container mt-4">
      <h2>Loan Management</h2>

      <div className="glass-card p-4 mt-3">
        <h4>Loan Applications</h4>

        <table className="table table-dark mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>John Farmer</td>
              <td>₦200,000</td>
              <td>Pending</td>
            </tr>

            <tr>
              <td>Mary Agro</td>
              <td>₦150,000</td>
              <td>Approved</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LoansPage;