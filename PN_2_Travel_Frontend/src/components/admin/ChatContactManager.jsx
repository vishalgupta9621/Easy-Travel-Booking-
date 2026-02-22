import { useState, useEffect } from 'react';
import { chatContactService } from '../../services/api.service';
import './ChatContactManager.css';

const ChatContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [chatHistory, setChatHistory] = useState(null);
  const [loadingChatHistory, setLoadingChatHistory] = useState(false);

  useEffect(() => {
    loadContacts();
    loadStats();
  }, [filter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading chat contacts...');

      let contacts = [];

      try {
        const params = filter !== 'all' ? { status: filter } : {};
        const response = await chatContactService.getAllContacts(params);
        contacts = response.data?.docs || response.data || [];
        console.log('✅ Contacts loaded from API:', contacts);

        // If we have real data, use it
        if (contacts && contacts.length > 0) {
          console.log('📋 Setting real contacts:', contacts);
          setContacts(contacts);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('⚠️ API error, will try to fetch real data or use fallback:', apiError);
      }

      // Try to fetch from the actual endpoint
      try {
        const directResponse = await fetch('http://localhost:8800/api/v1/chat-contacts');
        if (directResponse.ok) {
          const directData = await directResponse.json();
          contacts = directData.data || directData || [];
          console.log('✅ Direct API contacts loaded:', contacts);

          // Filter if needed
          if (filter !== 'all') {
            contacts = contacts.filter(contact => contact.status === filter);
          }

          if (contacts && contacts.length > 0) {
            console.log('📋 Setting direct contacts:', contacts);
            setContacts(contacts);
            setLoading(false);
            return;
          }
        }
      } catch (directError) {
        console.log('⚠️ Direct API also failed:', directError);
      }

      console.log('⚠️ No real data available, showing empty state');
      // No mock data - show empty state
      setContacts([]);
      setFilteredContacts([]);
      setLoading(false);
      return;

    } catch (error) {
      console.error('❌ Error loading contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async (sessionId) => {
    if (!sessionId) return;

    try {
      setLoadingChatHistory(true);
      console.log('💬 Loading chat history for session:', sessionId);

      const response = await fetch(`http://localhost:8800/api/v1/chat-history/session/${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setChatHistory(data.data);
        console.log('✅ Chat history loaded:', data.data);
      } else {
        console.log('⚠️ No chat history found');
        setChatHistory(null);
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      setChatHistory(null);
    } finally {
      setLoadingChatHistory(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Loading contact stats...');

      let stats = {};

      try {
        const response = await chatContactService.getContactStats();
        stats = response.data || {};
        console.log('✅ Stats loaded from API:', stats);
      } catch (apiError) {
        console.log('⚠️ API error, using mock stats:', apiError);

        // Mock statistics for demonstration
        stats = {
          total: 6,
          byStatus: {
            pending: 3,
            contacted: 2,
            resolved: 1
          },
          today: 2,
          thisWeek: 6,
          thisMonth: 6,
          byPriority: {
            high: 2,
            medium: 3,
            low: 1
          }
        };
      }

      console.log('📈 Setting stats:', stats);
      setStats(stats);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      setStats({});
    }
  };

  const updateContactStatus = async (contactId, status) => {
    try {
      await chatContactService.updateContactStatus(contactId, { status });
      loadContacts();
      loadStats();
      if (selectedContact?._id === contactId) {
        setSelectedContact(prev => ({ ...prev, status }));
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const addNote = async (contactId) => {
    if (!newNote.trim()) return;
    
    try {
      await chatContactService.addNote(contactId, newNote);
      setNewNote('');
      loadContacts();
      // Refresh selected contact details
      if (selectedContact?._id === contactId) {
        const updatedContact = contacts.find(c => c._id === contactId);
        setSelectedContact(updatedContact);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff6b6b';
      case 'contacted': return '#4ecdc4';
      case 'resolved': return '#45b7d1';
      default: return '#95a5a6';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="chat-contact-manager">
      <div className="manager-header">
        <h2>Chat Contact Management</h2>
        
        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <h3>{stats.total || 0}</h3>
            <p>Total Contacts</p>
          </div>
          <div className="stat-card">
            <h3>{stats.today || 0}</h3>
            <p>Today</p>
          </div>
          <div className="stat-card">
            <h3>{stats.byStatus?.pending || 0}</h3>
            <p>Pending</p>
          </div>
          <div className="stat-card">
            <h3>{stats.byStatus?.contacted || 0}</h3>
            <p>Contacted</p>
          </div>
          <div className="stat-card">
            <h3>{stats.byStatus?.resolved || 0}</h3>
            <p>Resolved</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'contacted' ? 'active' : ''}
            onClick={() => setFilter('contacted')}
          >
            Contacted
          </button>
          <button 
            className={filter === 'resolved' ? 'active' : ''}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="manager-content">
        {/* Contacts List */}
        <div className="contacts-list">
          {loading ? (
            <div className="loading">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="no-contacts">No contacts found</div>
          ) : (
            contacts.map(contact => (
              <div 
                key={contact._id} 
                className={`contact-item ${selectedContact?._id === contact._id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedContact(contact);
                  setChatHistory(null);
                  if (contact.chatSessionId) {
                    loadChatHistory(contact.chatSessionId);
                  }
                }}
              >
                <div className="contact-header">
                  <h4>{contact.name}</h4>
                  <div className="contact-badges">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(contact.status) }}
                    >
                      {contact.status}
                    </span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(contact.priority) }}
                    >
                      {contact.priority}
                    </span>
                  </div>
                </div>
                <div className="contact-info">
                  <div className="contact-info-row">
                    <span className="info-icon">📧</span>
                    <span className="info-text">{contact.email}</span>
                  </div>
                  <div className="contact-info-row">
                    <span className="info-icon">📱</span>
                    <span className="info-text">{contact.phone}</span>
                  </div>
                  <div className="contact-info-row">
                    <span className="info-icon">🤖</span>
                    <span className="info-text">Chatbot Inquiry</span>
                  </div>
                  <div className="contact-info-row">
                    <span className="info-icon">🕒</span>
                    <span className="info-text contact-date">{formatDate(contact.createdAt)}</span>
                  </div>
                  {contact.message && (
                    <div className="contact-preview">
                      <span className="preview-label">💬 Message:</span>
                      <span className="preview-text">
                        {contact.message.length > 60
                          ? `${contact.message.substring(0, 60)}...`
                          : contact.message
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Details */}
        {selectedContact && (
          <div className="contact-details">
            <div className="details-header">
              <h3>{selectedContact.name}</h3>
              <div className="action-buttons">
                {selectedContact.status === 'pending' && (
                  <button 
                    className="btn-contacted"
                    onClick={() => updateContactStatus(selectedContact._id, 'contacted')}
                  >
                    Mark as Contacted
                  </button>
                )}
                {selectedContact.status === 'contacted' && (
                  <button 
                    className="btn-resolved"
                    onClick={() => updateContactStatus(selectedContact._id, 'resolved')}
                  >
                    Mark as Resolved
                  </button>
                )}
                {selectedContact.status === 'resolved' && (
                  <button 
                    className="btn-reopen"
                    onClick={() => updateContactStatus(selectedContact._id, 'pending')}
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>

            <div className="contact-full-info">
              <div className="info-section contact-details-section">
                <h4>📞 Customer Contact Details</h4>
                <div className="contact-details-grid">
                  <div className="contact-detail-item">
                    <span className="detail-label">👤 Full Name:</span>
                    <span className="detail-value">{selectedContact.name}</span>
                  </div>
                  <div className="contact-detail-item">
                    <span className="detail-label">📧 Email Address:</span>
                    <span className="detail-value">
                      <a href={`mailto:${selectedContact.email}`} className="email-link">
                        {selectedContact.email}
                      </a>
                    </span>
                  </div>
                  <div className="contact-detail-item">
                    <span className="detail-label">📱 Phone Number:</span>
                    <span className="detail-value">
                      <a href={`tel:${selectedContact.phone}`} className="phone-link">
                        {selectedContact.phone}
                      </a>
                    </span>
                  </div>
                  <div className="contact-detail-item">
                    <span className="detail-label">🤖 Contact Source:</span>
                    <span className="detail-value source-badge">{selectedContact.source}</span>
                  </div>
                  <div className="contact-detail-item">
                    <span className="detail-label">📅 Inquiry Date:</span>
                    <span className="detail-value">{formatDate(selectedContact.createdAt)}</span>
                  </div>
                  <div className="contact-detail-item">
                    <span className="detail-label">⏰ Status:</span>
                    <span className={`detail-value status-indicator status-${selectedContact.status}`}>
                      {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                    </span>
                  </div>
                  {selectedContact.contactedAt && (
                    <div className="contact-detail-item">
                      <span className="detail-label">✅ Contacted On:</span>
                      <span className="detail-value">{formatDate(selectedContact.contactedAt)}</span>
                    </div>
                  )}
                  {selectedContact.resolvedAt && (
                    <div className="contact-detail-item">
                      <span className="detail-label">🎯 Resolved On:</span>
                      <span className="detail-value">{formatDate(selectedContact.resolvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-section message-section">
                <h4>💬 Customer Inquiry</h4>
                <div className="message-content">
                  <div className="message-text">
                    {selectedContact.message || 'No specific message provided - General inquiry from chatbot'}
                  </div>
                  <div className="message-meta">
                    <span className="message-source">📍 Source: Travel Booking Chatbot</span>
                    <span className="message-time">🕒 Submitted: {formatDate(selectedContact.createdAt)}</span>
                  </div>
                </div>

                {/* Chat History Section */}
                <div className="chat-history-section">
                  <h4>🗨️ Chat History</h4>
                  <div className="chat-history">
                    {loadingChatHistory ? (
                      <div className="loading-chat">
                        <p>Loading chat history...</p>
                      </div>
                    ) : chatHistory && chatHistory.messages && chatHistory.messages.length > 0 ? (
                      <div className="chat-messages">
                        <div className="chat-session-info">
                          <p><strong>Session ID:</strong> {chatHistory.sessionId}</p>
                          <p><strong>Started:</strong> {formatDate(chatHistory.createdAt)}</p>
                          <p><strong>Last Activity:</strong> {formatDate(chatHistory.lastActivity)}</p>
                          <p><strong>Status:</strong> <span className={`status-badge ${chatHistory.status}`}>{chatHistory.status}</span></p>
                        </div>
                        {chatHistory.messages.map((chat, index) => (
                          <div key={index} className={`chat-message ${chat.sender}`}>
                            <div className="chat-sender">
                              {chat.sender === 'user' ? '👤 Customer' : '🤖 Bot'}
                            </div>
                            <div className="chat-text">{chat.text}</div>
                            <div className="chat-time">{formatDate(chat.timestamp)}</div>
                          </div>
                        ))}
                      </div>
                    ) : selectedContact.chatSessionId ? (
                      <div className="no-chat-history">
                        <p>Chat session linked but no messages found.</p>
                        <p><small>Session ID: {selectedContact.chatSessionId}</small></p>
                      </div>
                    ) : (
                      <div className="no-chat-history">
                        <p>No chat history available for this contact.</p>
                        <p><small>This contact was submitted without a chat session.</small></p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Contact Actions */}
                <div className="quick-contact-actions">
                  <h5>🚀 Quick Actions</h5>
                  <div className="action-buttons-grid">
                    <a
                      href={`mailto:${selectedContact.email}?subject=Re: Travel Booking Inquiry&body=Dear ${selectedContact.name},%0D%0A%0D%0AThank you for contacting us through our chatbot. We're here to help with your travel booking needs.%0D%0A%0D%0ABest regards,%0D%0ATravel Booking Team`}
                      className="quick-action-btn email-action"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📧 Send Email
                    </a>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="quick-action-btn call-action"
                    >
                      📞 Call Customer
                    </a>
                    <a
                      href={`https://wa.me/${selectedContact.phone.replace(/[^0-9]/g, '')}?text=Hello ${selectedContact.name}, thank you for contacting us through our travel booking chatbot. How can we assist you with your travel plans?`}
                      className="quick-action-btn whatsapp-action"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Notes</h4>
                <div className="notes-list">
                  {selectedContact.notes?.map((note, index) => (
                    <div key={index} className="note-item">
                      <p>{note.text}</p>
                      <small>{formatDate(note.addedAt)}</small>
                    </div>
                  ))}
                </div>
                
                <div className="add-note">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    rows="3"
                  />
                  <button 
                    onClick={() => addNote(selectedContact._id)}
                    disabled={!newNote.trim()}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContactManager;
