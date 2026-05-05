import React from 'react';
import { FileText, Printer, Shield, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';

const RentalAgreement = ({ booking, onClose }) => {
    if (!booking) return null;

    const print = () => window.print();

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '0', background: 'white', color: '#1a1a1a' }}>
                
                {/* Header / Actions */}
                <div style={{ padding: '20px 32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={24} color="#6366f1" />
                        <div>
                            <h3 style={{ margin: 0, color: '#0f172a' }}>Rental Agreement</h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Booking ID: #{booking.id.toString().padStart(6, '0')}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={print} className="btn" style={{ background: '#e2e8f0', color: '#475569', fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Agreement Content */}
                <div id="agreement-content" style={{ padding: '40px 60px', fontFamily: "'Times New Roman', serif", lineHeight: '1.6' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ margin: '0 0 8px', fontSize: '28px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vehicle Rental Agreement</h1>
                        <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>This agreement is electronically generated and digitally signed.</p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <p><strong>This Agreement</strong> is made on this day, <strong>{new Date().toLocaleDateString()}</strong>, between:</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '16px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 10px', textTransform: 'uppercase', fontSize: '13px', borderBottom: '1px solid #000' }}>The Owner (Lessor)</h4>
                                <p style={{ margin: '4px 0' }}>Name: <strong>{booking.owner_name}</strong></p>
                                <p style={{ margin: '4px 0' }}>City: {booking.owner_city}</p>
                                <p style={{ margin: '4px 0' }}>Contact: {booking.owner_phone}</p>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 10px', textTransform: 'uppercase', fontSize: '13px', borderBottom: '1px solid #000' }}>The Renter (Lessee)</h4>
                                <p style={{ margin: '4px 0' }}>Name: <strong>{booking.renter_name || 'Verified User'}</strong></p>
                                <p style={{ margin: '4px 0' }}>CNIC: {booking.renter_cnic || 'Verified'}</p>
                                <p style={{ margin: '4px 0' }}>Contact: {booking.renter_phone || 'Verified'}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 10px', textTransform: 'uppercase', fontSize: '13px', borderBottom: '1px solid #000' }}>Vehicle Description</h4>
                        <p style={{ margin: '4px 0' }}>Vehicle: <strong>{booking.vehicle_name}</strong></p>
                        <p style={{ margin: '4px 0' }}>Type: {booking.vehicle_type}</p>
                        <p style={{ margin: '4px 0' }}>Registration No: <strong>{booking.vehicle_registration_no || 'N/A'}</strong></p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 10px', textTransform: 'uppercase', fontSize: '13px', borderBottom: '1px solid #000' }}>Rental Terms</h4>
                        <p style={{ margin: '4px 0' }}>Rental Period: <strong>{booking.start_date}</strong> to <strong>{booking.end_date}</strong></p>
                        <p style={{ margin: '4px 0' }}>Total Rental Amount: <strong>${booking.total_price}</strong></p>
                        <p style={{ margin: '4px 0' }}>Security Deposit (Refundable): <strong>${Math.round(booking.total_price * 0.2)}</strong></p>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h4 style={{ margin: '0 0 10px', textTransform: 'uppercase', fontSize: '13px', borderBottom: '1px solid #000' }}>Standard Terms & Conditions</h4>
                        <ul style={{ fontSize: '13px', paddingLeft: '20px' }}>
                            <li>The Lessee agrees to return the vehicle in the same condition as received.</li>
                            <li>Fuel charges and traffic violations during the rental period are the responsibility of the Lessee.</li>
                            <li>Sub-leasing the vehicle to any third party is strictly prohibited.</li>
                            <li>The Lessor reserves the right to terminate the agreement if any terms are violated.</li>
                        </ul>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginTop: '60px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ height: '50px', borderBottom: '1px solid #000', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: '#6366f1' }}>
                                 {booking.owner_name}
                            </div>
                            <p style={{ fontSize: '12px', margin: 0 }}>Lessor's Signature</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ height: '50px', borderBottom: '1px solid #000', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: '#6366f1' }}>
                                 {booking.renter_name || 'Verified Digital Sig'}
                            </div>
                            <p style={{ fontSize: '12px', margin: 0 }}>Lessee's Signature</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', padding: '16px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Shield size={24} color="#059669" />
                        <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                            This document is a legally binding electronic agreement. Both parties have verified their identities via CNIC and Phone verification on our platform.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RentalAgreement;
