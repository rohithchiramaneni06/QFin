import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CreatePortfolio from './pages/CreatePortfolio';
import Comparison from './pages/Comparison';
import PortfolioAllocation from './pages/PortfolioAllocation';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ProtectedRoute from './components/ProtectedRoute';
import AuthTest from './components/AuthTest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/create-portfolio" element={<ProtectedRoute><CreatePortfolio /></ProtectedRoute>} />
        <Route path="/portfolio-allocation" element={<ProtectedRoute><PortfolioAllocation /></ProtectedRoute>} />
        <Route path="/comparison" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/dashboard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/auth-test" element={<ProtectedRoute><AuthTest /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
