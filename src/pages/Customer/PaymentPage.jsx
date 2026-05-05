import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Smartphone, ShieldCheck, ArrowRight, CheckCircle2, ChevronLeft, Info, Calendar, MapPin, Car } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { vehicle, startDate, endDate, totalPrice } = location.state || {};

    const [method, setMethod] = useState('card');
    const [transactionId, setTransactionId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!vehicle) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <Info size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <h3>No booking data found</h3>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>Go Back</button>
            </div>
        );
    }

    const securityDeposit = Math.round(totalPrice * 0.2); // 20% security deposit
    const grandTotal = totalPrice + securityDeposit;

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!transactionId && method !== 'card') {
            setError('Please enter the Transaction ID');
            return;
        }
        
        setProcessing(true);
        setError('');

        try {
            // 1. Create Booking
            const bookingResult = await api.createBooking({
                user_id: user.id,
                vehicle_id: vehicle.id,
                start_date: startDate,
                end_date: endDate,
                total_price: totalPrice,
                status: 'paid' // Set to paid immediately for simulation
            });

            if (bookingResult.success) {
                // 2. Create Payment Record
                await api.createPayment({
                    booking_id: bookingResult.id,
                    user_id: user.id,
                    amount: grandTotal,
                    method: method,
                    transaction_id: transactionId || 'CC-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    status: 'completed'
                });

                setSuccess(true);
                setTimeout(() => {
                    navigate('/my-bookings');
                }, 3000);
            } else {
                setError(bookingResult.error || 'Booking failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ textAlign: 'center', padding: '48px', maxWidth: '400px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--success-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--success)' }}>
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 style={{ marginBottom: '12px' }}>Payment Successful!</h2>
                    <p className="text-muted" style={{ marginBottom: '24px' }}>Your booking for <strong>{vehicle.name}</strong> is now confirmed. Redirecting to your bookings...</p>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                </motion.div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px' }}>
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1>Checkout</h1>
                    <p className="text-muted">Complete your payment to secure your booking.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
                
                {/* Left: Payment Methods */}
                <div className="flex-col gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
                        <h3 style={{ marginBottom: '20px' }}>Select Payment Method</h3>
                        
                        <div className="flex-col gap-3">
                            <div 
                                onClick={() => setMethod('card')}
                                style={{ 
                                    padding: '16px', 
                                    borderRadius: '12px', 
                                    border: '2px solid ' + (method === 'card' ? 'var(--accent-primary)' : 'var(--border)'),
                                    background: method === 'card' ? 'var(--accent-bg)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: method === 'card' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                                    <CreditCard size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>Credit / Debit Card</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Visa, Mastercard, PayPak</div>
                                </div>
                                {method === 'card' && <CheckCircle2 size={20} color="var(--accent-primary)" />}
                            </div>

                            <div 
                                onClick={() => setMethod('jazzcash')}
                                style={{ 
                                    padding: '16px', 
                                    borderRadius: '12px', 
                                    border: '2px solid ' + (method === 'jazzcash' ? 'var(--accent-primary)' : 'var(--border)'),
                                    background: method === 'jazzcash' ? 'var(--accent-bg)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: method === 'jazzcash' ? '#d41111' : 'var(--text-secondary)' }}>
                                    <Smartphone size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>JazzCash</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pay via JazzCash Mobile Wallet</div>
                                </div>
                                {method === 'jazzcash' && <CheckCircle2 size={20} color="var(--accent-primary)" />}
                            </div>

                            <div 
                                onClick={() => setMethod('easypaisa')}
                                style={{ 
                                    padding: '16px', 
                                    borderRadius: '12px', 
                                    border: '2px solid ' + (method === 'easypaisa' ? 'var(--accent-primary)' : 'var(--border)'),
                                    background: method === 'easypaisa' ? 'var(--accent-bg)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: method === 'easypaisa' ? '#00b55b' : 'var(--text-secondary)' }}>
                                    <Wallet size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>Easypaisa</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pay via Easypaisa Wallet</div>
                                </div>
                                {method === 'easypaisa' && <CheckCircle2 size={20} color="var(--accent-primary)" />}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
                        <h3 style={{ marginBottom: '20px' }}>Payment Details</h3>
                        
                        {method === 'card' ? (
                            <form className="flex-col gap-4">
                                <div className="flex-col gap-2">
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Card Number</label>
                                    <input type="text" placeholder="xxxx xxxx xxxx xxxx" maxLength={19} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="flex-col gap-2">
                                        <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Expiry Date</label>
                                        <input type="text" placeholder="MM/YY" maxLength={5} />
                                    </div>
                                    <div className="flex-col gap-2">
                                        <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>CVV</label>
                                        <input type="password" placeholder="***" maxLength={3} />
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="flex-col gap-4">
                                <div style={{ padding: '16px', background: 'var(--bg-gray)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Instructions:</div>
                                    <ol style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.6' }}>
                                        <li>Open your {method} App.</li>
                                        <li>Send **${grandTotal}** to our business number: **0300-1234567**.</li>
                                        <li>Copy the **Transaction ID** from the confirmation screen.</li>
                                        <li>Paste it below to verify your payment.</li>
                                    </ol>
                                </div>
                                <div className="flex-col gap-2">
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Transaction ID *</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter the 10-12 digit ID" 
                                        value={transactionId} 
                                        onChange={(e) => setTransactionId(e.target.value)} 
                                    />
                                </div>
                            </div>
                        )}

                        {error && <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px', fontSize: '13px' }}>⚠️ {error}</div>}

                        <button 
                            className="btn btn-primary w-full" 
                            style={{ marginTop: '24px', padding: '14px' }}
                            onClick={handlePayment}
                            disabled={processing}
                        >
                            {processing ? <div className="spinner" /> : <>Complete Payment <ArrowRight size={18} /></>}
                        </button>
                    </motion.div>
                </div>

                {/* Right: Booking Summary */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ position: 'sticky', top: '24px' }}>
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ height: '140px', position: 'relative' }}>
                            <img src={vehicle.images?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))' }} />
                            <div style={{ position: 'absolute', bottom: '16px', left: '20px' }}>
                                <h3 style={{ color: 'white', margin: 0 }}>{vehicle.name}</h3>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {vehicle.city}</div>
                            </div>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <div className="flex-col gap-4" style={{ marginBottom: '24px' }}>
                                <div className="flex justify-between items-center">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <Calendar size={14} /> Dates
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{startDate} → {endDate}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <ShieldCheck size={14} /> Registration
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{vehicle.registration_no || 'N/A'}</div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Rental Amount</div>
                                    <div style={{ fontWeight: 600 }}>${totalPrice}</div>
                                </div>
                                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        Security Deposit 
                                        <div title="Refundable after return" style={{ cursor: 'help' }}><Info size={12} /></div>
                                    </div>
                                    <div style={{ fontWeight: 600 }}>${securityDeposit}</div>
                                </div>
                                <div className="flex justify-between items-center" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--border)' }}>
                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>Total Payable</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)' }}>${grandTotal}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-gray)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '10px' }}>
                                <ShieldCheck size={24} style={{ flexShrink: 0, color: 'var(--success)' }} />
                                <div>
                                    Your payment is secure. Security deposit is 100% refundable after the vehicle is returned in original condition.
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default PaymentPage;
