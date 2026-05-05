import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, UserCheck, UserX, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

const UserManager = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 1 ? 'block' : 'unblock';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await api.updateUserStatus({ id, is_active: currentStatus === 1 ? 0 : 1 });
        loadUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleVerification = async (id, currentVerified) => {
    const action = currentVerified ? 'unverify' : 'verify';
    if (confirm(`Are you sure you want to ${action} this user's CNIC?`)) {
      try {
        await api.updateUserVerification({ id, cnic_verified: currentVerified ? 0 : 1 });
        loadUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Manage Users</h1>
          <p className="text-muted">View all registered users and manage their access.</p>
        </div>
        <Link to="/admin/audit-logs" className="btn btn-secondary">
          <History size={18} /> View Audit Logs
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)' }}>CNIC</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{u.name} {u.role === 'admin' && <span style={{fontSize:'10px', marginLeft:'8px', padding:'2px 6px', background:'var(--accent-primary)', borderRadius:'4px'}}>ADMIN</span>}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '16px 24px', textTransform: 'capitalize' }}>{u.role}</td>
                <td style={{ padding: '16px 24px' }}>
                  {u.is_active ? (
                    <span className="badge success">Active</span>
                  ) : (
                    <span className="badge rejected">Blocked</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {u.cnic_verified ? (
                    <span className="badge success">Verified</span>
                  ) : (
                    <span className="badge pending">Pending</span>
                  )}
                  <div style={{fontSize: '11px', marginTop: '4px'}}>{u.cnic || 'No CNIC provided'}</div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {u.role !== 'admin' && (
                    <>
                      <button 
                        onClick={() => toggleVerification(u.id, u.cnic_verified)} 
                        className={`btn ${u.cnic_verified ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {u.cnic_verified ? <><UserX size={14}/> Revoke</> : <><UserCheck size={14}/> Verify</>}
                      </button>
                      <button 
                        onClick={() => toggleStatus(u.id, u.is_active)} 
                        className={`btn ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {u.is_active ? <><ShieldAlert size={14}/> Block</> : <><ShieldCheck size={14}/> Unblock</>}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
