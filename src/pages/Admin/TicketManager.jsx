import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Filter, CheckCircle2, XCircle, Send, User, Mail, Calendar } from 'lucide-react';
import { api } from '../../api';

const TicketManager = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    try {
      const data = await api.getAllTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !reply) return;
    setSubmitting(true);
    try {
      await api.replyToTicket({ id: selectedTicket.id, reply, status: 'closed' });
      setReply('');
      setSelectedTicket(null);
      loadTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || t.status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1>Support Tickets</h1>
        <p className="text-muted">Manage and respond to user support requests.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4" style={{ marginBottom: '28px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search by subject, user or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '44px', width: '100%' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '160px' }}>
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* List */}
      <div className="flex-col gap-4">
        {loading ? (
          <div className="spinner" />
        ) : filteredTickets.length === 0 ? (
          <div className="card text-center" style={{ padding: '60px' }}>No tickets found.</div>
        ) : (
          filteredTickets.map(t => (
            <motion.div 
              key={t.id} 
              className="card" 
              whileHover={{ y: -2 }}
              style={{ borderLeft: t.status === 'open' ? '4px solid var(--accent-primary)' : '4px solid var(--success)' }}
            >
              <div className="flex justify-between items-start">
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '18px' }}>{t.subject}</span>
                    <span className={`badge ${t.status === 'open' ? 'pending' : 'active'}`}>{t.status.toUpperCase()}</span>
                  </div>
                  <div className="flex gap-4" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {t.user_name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {t.user_email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(t.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>{t.message}</p>
                  </div>

                  {t.reply ? (
                    <div style={{ padding: '16px', background: 'rgba(34,197,94,0.05)', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.1)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 700, marginBottom: '6px' }}>ADMIN RESPONSE</div>
                      <p style={{ fontSize: '14px', margin: 0 }}>{t.reply}</p>
                    </div>
                  ) : (
                    selectedTicket?.id === t.id ? (
                      <form onSubmit={handleReply} className="flex-col gap-3">
                        <textarea 
                          required 
                          placeholder="Type your response..." 
                          value={reply} 
                          onChange={e => setReply(e.target.value)}
                          style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)', color: 'white' }}
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? <div className="spinner" /> : 'Send Reply & Close'}
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button className="btn btn-primary" onClick={() => { setSelectedTicket(t); setReply(''); }}>
                        <Send size={16} /> Reply to Ticket
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketManager;
