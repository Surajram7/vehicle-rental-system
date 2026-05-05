import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Send, MessageCircle, Clock, CheckCircle2, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { api } from '../../api';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadTickets = async () => {
    try {
      const data = await api.getUserTickets();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createTicket({ subject, message });
      setSuccess(true);
      setSubject('');
      setMessage('');
      loadTickets();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    { q: 'How do I book a vehicle?', a: 'Browse the vehicles, click "View Details", select your dates, and proceed to payment.' },
    { q: 'What is the security deposit?', a: 'A 20% security deposit is collected to cover potential damages and is fully refundable after a safe return.' },
    { q: 'Can I cancel my booking?', a: 'Yes, you can cancel up to 24 hours before the rental starts for a full refund.' }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1>Support Center</h1>
        <p className="text-muted">How can we help you today?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
        
        <div className="flex-col gap-8">
          {/* New Ticket Form */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Send size={20} color="var(--accent-primary)" /> Open a New Ticket</h3>
            <form onSubmit={handleSubmit} className="flex-col gap-4">
              <div className="flex-col gap-2">
                <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Subject</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Issue with booking payment" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                />
              </div>
              <div className="flex-col gap-2">
                <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Message</label>
                <textarea 
                  required 
                  placeholder="Describe your issue in detail..." 
                  rows="5" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <div className="spinner" /> : 'Submit Ticket'}
              </button>
              <AnimatePresence>
                {success && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: 'var(--success)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} /> Ticket submitted successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Previous Tickets */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>My Tickets</h3>
            {loading ? (
              <div className="spinner" />
            ) : tickets.length === 0 ? (
              <p className="text-muted">You haven't opened any tickets yet.</p>
            ) : (
              <div className="flex-col gap-4">
                {tickets.map(t => (
                  <div key={t.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{t.subject}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>#{t.id} • {new Date(t.created_at).toLocaleString()}</div>
                      </div>
                      <span className={`badge ${t.status === 'open' ? 'pending' : 'active'}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        {t.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{t.message}</p>
                    
                    {t.reply && (
                      <div style={{ padding: '16px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', borderLeft: '4px solid var(--accent-primary)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MessageCircle size={14} /> SUPPORT RESPONSE
                        </div>
                        <p style={{ fontSize: '14px', margin: 0 }}>{t.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex-col gap-6">
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={20} /> FAQ</h3>
            <div className="flex-col gap-4">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{faq.q}</div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '24px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Emergency?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>If you are on the road and need immediate assistance, call our 24/7 hotline:</p>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)', textAlign: 'center' }}>0800-RENTAL</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Support;
