const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbHandlers = require('./db.cjs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Vehicle Rental System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Start Vite dev server in development, otherwise load the built dist files.
  // We use process.env to check but a simpler way is checking if we're running from app bundle.
  const isDev = !app.isPackaged;
  if (isDev) {
    // Adding a slight delay or depending on 'wait-on' avoids white screen.
    mainWindow.loadURL('http://localhost:5173');
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Hide the default menu
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers mapping to db queries
ipcMain.handle('auth:register', async (event, args) => dbHandlers.registerUser(args));
ipcMain.handle('auth:login', async (event, args) => dbHandlers.loginUser(args));
ipcMain.handle('vehicles:getAll', async () => dbHandlers.getVehicles());
ipcMain.handle('vehicles:add', async (event, args) => dbHandlers.addVehicle(args));
ipcMain.handle('vehicles:update', async (event, args) => dbHandlers.updateVehicle(args));
ipcMain.handle('vehicles:delete', async (event, id) => dbHandlers.deleteVehicle(id));
ipcMain.handle('bookings:create', async (event, args) => dbHandlers.createBooking(args));
ipcMain.handle('bookings:getUser', async (event, userId) => dbHandlers.getUserBookings(userId));
ipcMain.handle('bookings:getAll', async () => dbHandlers.getAllBookings());
ipcMain.handle('bookings:updateStatus', async (event, args) => dbHandlers.updateBookingStatus(args));
ipcMain.handle('users:getAll', async () => dbHandlers.getAllUsers());
ipcMain.handle('users:updateStatus', async (event, args) => dbHandlers.updateUserStatus(args));
ipcMain.handle('dashboard:getStats', async () => dbHandlers.getDashboardStats());
