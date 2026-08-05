import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MemberDashboard() {
  return (
    <>

      <div className="container-fluid">
        <div className="row">

          <div className="col-md-2">
            <Sidebar />
          </div>

          <div className="col-md-10 page-container">
            <h2>Member Dashboard</h2>

            <div className="glass-card p-4 mt-4">
              <h4>Welcome Member</h4>
              <p>View savings, contributions and loan history.</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default MemberDashboard;