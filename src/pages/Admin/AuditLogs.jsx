import React, { useState, useEffect } from 'react';
import { History, User, Activity, Calendar } from 'lucide-react';
import { api } from '../../api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('BLOCK') || action.includes('DELETE') || action.includes('REJECT')) return 'badge rejected';
    if (action.includes('VERIFY') || action.includes('CREATE') || action.includes('REGISTER')) return 'badge success';
    return 'badge pending';
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <History size={32} color="var(--accent-primary)" />
          System Audit Logs
        </h1>
        <p className="text-muted">Track all critical system activities and administrative actions.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading logs...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Timestamp</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>User</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Target</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No logs found.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} />
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                        <User size={14} color="var(--accent-primary)" />
                        {log.user_name || 'System'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={getActionBadgeClass(log.action)} style={{fontSize: '11px'}}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {log.target_type && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Activity size={14} />
                          <span style={{ textTransform: 'capitalize' }}>{log.target_type}</span> #{log.target_id}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
