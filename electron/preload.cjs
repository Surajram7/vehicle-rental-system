const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Auth
  register: (user) => ipcRenderer.invoke('auth:register', user),
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  
  // Vehicles
  getVehicles: () => ipcRenderer.invoke('vehicles:getAll'),
  addVehicle: (vehicle) => ipcRenderer.invoke('vehicles:add', vehicle),
  updateVehicle: (vehicle) => ipcRenderer.invoke('vehicles:update', vehicle),
  deleteVehicle: (id) => ipcRenderer.invoke('vehicles:delete', id),
  
  // Bookings
  createBooking: (booking) => ipcRenderer.invoke('bookings:create', booking),
  getUserBookings: (userId) => ipcRenderer.invoke('bookings:getUser', userId),
  getAllBookings: () => ipcRenderer.invoke('bookings:getAll'),
  updateBookingStatus: (data) => ipcRenderer.invoke('bookings:updateStatus', data),
  
  // Users
  getAllUsers: () => ipcRenderer.invoke('users:getAll'),
  updateUserStatus: (data) => ipcRenderer.invoke('users:updateStatus', data),
  
  // Dashboard Metrics
  getDashboardStats: () => ipcRenderer.invoke('dashboard:getStats'),
});
