const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// Store db in userData so it persists across updates and works in packaged mode
const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function initDb() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_active INTEGER DEFAULT 1
    )`);

    // Create a default admin if non exists
    db.get(`SELECT id FROM users WHERE role = 'admin'`, [], (err, row) => {
      if (!row && !err) {
        db.run(`INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@rental.com', 'admin123', 'admin')`);
      }
    });

    // Vehicles table
    db.run(`CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price_per_day REAL NOT NULL,
      image_url TEXT,
      description TEXT,
      status TEXT DEFAULT 'available'
    )`);

    // Insert some default vehicles if empty
    db.get(`SELECT count(*) as count FROM vehicles`, [], (err, row) => {
        if (!err && row && row.count === 0) {
            const defaultCars = [
                ['Toyota Camry', 'Car', 45, '', 'Comfortable mid-size sedan, perfect for city and highway.', 'available'],
                ['Honda CR-V', 'SUV', 65, '', 'Reliable and spacious SUV for family trips.', 'available'],
                ['Ford Mustang', 'Car', 120, '', 'Sporty and fun to drive. Feel the power.', 'available'],
                ['Yamaha MT-07', 'Bike', 35, '', 'Lightweight, torque-rich bike for thrilling rides.', 'available'],
            ];
            const stmt = db.prepare(`INSERT INTO vehicles (name, type, price_per_day, image_url, description, status) VALUES (?, ?, ?, ?, ?, ?)`);
            defaultCars.forEach(car => stmt.run(car));
            stmt.finalize();
        }
    });

    // Bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      vehicle_id INTEGER,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
    )`);
  });
}

initDb();

// Generic wrapper for db.all
function fetchAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Generic wrapper for db.get
function fetchOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Generic wrapper for db.run
function execute(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  // Auth
  registerUser: async (user) => {
    try {
      // Check if first user
      const countRow = await fetchOne(`SELECT count(*) as count FROM users`);
      const role = countRow.count === 0 ? 'admin' : 'user';

      const result = await execute(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        [user.name, user.email, user.password, role]
      );
      return { success: true, id: result.id, role };
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
         return { success: false, error: 'Email already exists' };
      }
      return { success: false, error: err.message };
    }
  },
  loginUser: async (credentials) => {
    const user = await fetchOne(`SELECT id, name, email, role, is_active FROM users WHERE email = ? AND password = ?`, [credentials.email, credentials.password]);
    if (user) {
      if (!user.is_active) return { success: false, error: 'Account is blocked' };
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  // Vehicles
  getVehicles: () => fetchAll(`SELECT * FROM vehicles ORDER BY id DESC`),
  addVehicle: async (v) => {
    const result = await execute(
      `INSERT INTO vehicles (name, type, price_per_day, image_url, description, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [v.name, v.type, v.price_per_day, v.image_url, v.description, v.status || 'available']
    );
    return { success: true, id: result.id };
  },
  updateVehicle: async (v) => {
    await execute(
      `UPDATE vehicles SET name = ?, type = ?, price_per_day = ?, image_url = ?, description = ?, status = ? WHERE id = ?`,
      [v.name, v.type, v.price_per_day, v.image_url, v.description, v.status, v.id]
    );
    return { success: true };
  },
  deleteVehicle: async (id) => {
    await execute(`DELETE FROM vehicles WHERE id = ?`, [id]);
    return { success: true };
  },

  // Bookings
  createBooking: async (b) => {
    try {
        const result = await execute(
        `INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_price, status) VALUES (?, ?, ?, ?, ?, 'active')`,
        [b.user_id, b.vehicle_id, b.start_date, b.end_date, b.total_price]
        );
        // Mark vehicle as 'booked'
        await execute(`UPDATE vehicles SET status = 'booked' WHERE id = ?`, [b.vehicle_id]);
        return { success: true, id: result.id };
    } catch (err) {
        return { success: false, error: err.message };
    }
  },
  getUserBookings: (userId) => fetchAll(`
    SELECT b.*, v.name as vehicle_name, v.type as vehicle_type 
    FROM bookings b 
    JOIN vehicles v ON b.vehicle_id = v.id 
    WHERE b.user_id = ? ORDER BY b.id DESC`, [userId]),
  getAllBookings: () => fetchAll(`
    SELECT b.*, v.name as vehicle_name, u.name as user_name, u.email as user_email
    FROM bookings b 
    JOIN vehicles v ON b.vehicle_id = v.id 
    JOIN users u ON b.user_id = u.id
    ORDER BY b.id DESC`),
  updateBookingStatus: async ({ id, status, vehicle_id }) => {
    await execute(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id]);
    if (status === 'completed' || status === 'rejected') {
        // Free up the vehicle
        await execute(`UPDATE vehicles SET status = 'available' WHERE id = ?`, [vehicle_id]);
    }
    return { success: true };
  },

  // Users
  getAllUsers: () => fetchAll(`SELECT id, name, email, role, is_active FROM users ORDER BY id DESC`),
  updateUserStatus: async ({ id, is_active }) => {
    await execute(`UPDATE users SET is_active = ? WHERE id = ?`, [is_active, id]);
    return { success: true };
  },

  // Dashboard
  getDashboardStats: async () => {
    const totalVehicles = await fetchOne(`SELECT count(*) as count FROM vehicles`);
    const totalBookings = await fetchOne(`SELECT count(*) as count FROM bookings`);
    const activeRentals = await fetchOne(`SELECT count(*) as count FROM bookings WHERE status = 'active'`);
    return {
      vehicles: totalVehicles?.count || 0,
      bookings: totalBookings?.count || 0,
      active: activeRentals?.count || 0
    };
  }
};
