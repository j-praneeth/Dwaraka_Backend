import { BrowserRouter as Router, Route, Switch, Navigate } from "react-router-dom";
import Login from "./pages/Login"; // Ensure this path is correct
import AdminDashboard from "./pages/admin-view/banners"; // Ensure this path is correct
import AdminReturnsView from "./components/admin-view/AdminReturnsView"; // Import the Returns component
import RefundsPage from "./pages/admin-view/refunds"; // Updated import
// Import other components/pages as needed

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/admin/banners" component={AdminDashboard} />
        <Route path="/admin/returns" component={AdminReturnsView} />
        <Route path="/admin/refunds" component={RefundsPage} /> {/* Updated component */}
        {/* Redirect /admin/dashboard to /admin/banners */}
        <Route path="/admin/dashboard">
          <Navigate to="/admin/banners" />
        </Route>
        {/* Add other routes here */}
        <Route path="/" exact>
          <Navigate to="/admin/banners" />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;