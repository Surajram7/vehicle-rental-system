// API Wrapper substituting the old window.api IPC bridge

const BASE_URL = '/api';

async function fetchWrapper(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'API Request failed');
    }
    return data;
}

export const api = {
    // Auth
    register: (user) => fetchWrapper('/auth/register', {
        method: 'POST',
        body: JSON.stringify(user)
    }),
    login: (credentials) => fetchWrapper('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    changePassword: (data) => fetchWrapper('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Vehicles
    getVehicles: () => fetchWrapper('/vehicles'),
    getVehiclesByOwner: (userId) => fetchWrapper(`/vehicles/owner/${userId}`),
    addVehicle: (vehicle) => fetchWrapper('/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicle)
    }),
    updateVehicle: (vehicle) => fetchWrapper(`/vehicles/${vehicle.id}`, {
        method: 'PUT',
        body: JSON.stringify(vehicle)
    }),
    deleteVehicle: (id) => fetchWrapper(`/vehicles/${id}`, {
        method: 'DELETE'
    }),
    updateVehicleStatus: (data) => fetchWrapper(`/vehicles/${data.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: data.status })
    }),

    // Bookings
    createBooking: (booking) => fetchWrapper('/bookings', {
        method: 'POST',
        body: JSON.stringify(booking)
    }),
    getUserBookings: (userId) => fetchWrapper(`/bookings/user/${userId}`),
    getOwnerBookings: (userId) => fetchWrapper(`/bookings/owner/${userId}`),
    getAllBookings: () => fetchWrapper('/bookings'),
    updateBookingStatus: (data) => fetchWrapper(`/bookings/${data.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: data.status, vehicle_id: data.vehicle_id })
    }),

    // Users
    getAllUsers: () => fetchWrapper('/users'),
    updateUserStatus: (data) => fetchWrapper(`/users/${data.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: data.is_active })
    }),
    updateUserVerification: (data) => fetchWrapper(`/users/${data.id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ cnic_verified: data.cnic_verified })
    }),
    updateProfile: (data) => fetchWrapper(`/users/${data.id}/profile`, {
        method: 'PUT',
        body: JSON.stringify({ name: data.name, phone: data.phone, city: data.city, avatar: data.avatar, cnic: data.cnic })
    }),

    // Payments
    createPayment: (payment) => fetchWrapper('/payments', {
        method: 'POST',
        body: JSON.stringify(payment)
    }),
    getBookingPayments: (bookingId) => fetchWrapper(`/payments/booking/${bookingId}`),

    // Reviews
    addReview: (review) => fetchWrapper('/reviews', {
        method: 'POST',
        body: JSON.stringify(review)
    }),
    getVehicleReviews: (vehicleId) => fetchWrapper(`/reviews/vehicle/${vehicleId}`),

    // Dashboard Metrics & Logs
    getDashboardStats: () => fetchWrapper('/dashboard/stats'),
    getAuditLogs: () => fetchWrapper('/audit-logs')
};
