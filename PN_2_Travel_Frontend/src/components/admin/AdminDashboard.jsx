import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatContactManager from './ChatContactManager';
import { chatContactService } from '../../services/api.service';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin access
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin-access');
      return;
    }
  }, [navigate]);



  const handleAdminLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const menuItems = [
    {
      id: 'chatbot',
      title: 'Chatbot Contacts',
      icon: '🤖',
      description: 'Manage customer inquiries from chatbot'
    },
    {
      id: 'bookings',
      title: 'Bookings Management',
      icon: '📋',
      description: 'View and manage all bookings'
    },
    {
      id: 'users',
      title: 'User Management',
      icon: '👥',
      description: 'Manage user accounts'
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: '📈',
      description: 'Business reports and analytics'
    }
  ];



  const renderPlaceholder = (title, description) => (
    <div className="placeholder-content">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="placeholder-box">
        <div className="placeholder-icon">🚧</div>
        <h3>Coming Soon</h3>
        <p>This feature is under development and will be available soon.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'chatbot':
        return <ChatContactManager />;
      case 'bookings':
        return renderPlaceholder('Bookings Management', 'View and manage all travel bookings');
      case 'users':
        return renderPlaceholder('User Management', 'Manage user accounts and permissions');
      case 'reports':
        return renderPlaceholder('Reports & Analytics', 'Business intelligence and reporting');
      default:
        return <ChatContactManager />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <button onClick={handleAdminLogout} className="admin-logout">
              🚪 Logout Admin
            </button>
            <Link to="/" className="back-to-site">
              🏠 Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-sidebar">
          <div className="sidebar-menu">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <div className="menu-text">
                  <span className="menu-title">{item.title}</span>
                  <span className="menu-desc">{item.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
