const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
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
      city TEXT,
      phone TEXT,
      cnic TEXT,
      cnic_verified INTEGER DEFAULT 0,
      avatar TEXT,
      driving_license TEXT,
      is_active INTEGER DEFAULT 1
    )`);

    // Audit Logs table
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id INTEGER,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Ensure columns exist for existing databases
    db.run(`ALTER TABLE users ADD COLUMN city TEXT`, (err) => {});
    db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, (err) => {});
    db.run(`ALTER TABLE users ADD COLUMN cnic TEXT`, (err) => {});
    db.run(`ALTER TABLE users ADD COLUMN cnic_verified INTEGER DEFAULT 0`, (err) => {});
    db.run(`ALTER TABLE users ADD COLUMN avatar TEXT`, (err) => {});
    db.run(`ALTER TABLE users ADD COLUMN driving_license TEXT`, (err) => {});

    // Ensure vehicles have the new detailed columns
    db.run(`ALTER TABLE vehicles ADD COLUMN year INTEGER`, (err) => {});
    db.run(`ALTER TABLE vehicles ADD COLUMN transmission TEXT`, (err) => {});
    db.run(`ALTER TABLE vehicles ADD COLUMN seating_capacity INTEGER`, (err) => {});
    db.run(`ALTER TABLE vehicles ADD COLUMN features JSON`, (err) => {});
    db.run(`ALTER TABLE vehicles ADD COLUMN is_insured INTEGER DEFAULT 0`, (err) => {});

    // Create a default admin if non exists
    db.get(`SELECT id FROM users WHERE role = 'admin'`, [], async (err, row) => {
      if (!row && !err) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        db.run(`INSERT INTO users (name, email, password, role, city, phone, cnic_verified) VALUES ('Admin', 'admin@rental.com', ?, 'admin', 'System', '000-0000000', 1)`, [hashedPassword]);
      }
    });

    // Vehicles table
    db.run(`CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      engine_type TEXT,
      condition TEXT,
      city TEXT,
      location TEXT,
      registration_no TEXT,
      price_per_day REAL NOT NULL,
      images JSON,
      description TEXT,
      available_from TEXT,
      available_to TEXT,
      status TEXT DEFAULT 'available',
      FOREIGN KEY(owner_id) REFERENCES users(id)
    )`);

    // Payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      user_id INTEGER,
      amount REAL NOT NULL,
      method TEXT,
      transaction_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(booking_id) REFERENCES bookings(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Reviews table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      vehicle_id INTEGER,
      rating INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
    )`);

    // Dummy user and cars
    db.get(`SELECT count(*) as count FROM users`, [], (err, row) => {
      if (!err && row && row.count <= 1) {
          db.run(`INSERT INTO users (name, email, password, role, city, phone) VALUES ('John Walker', 'john@example.com', 'password123', 'user', 'New York', '123-456-7890')`, function(err) {
              if(!err) {
                  const owner_id = this.lastID;
                  const defaultCars = [
                      [owner_id, 'Toyota Camry Hybrid', 'Car', 'Hybrid', 'Excellent', 'New York', 45, JSON.stringify(['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80']), 'Great gas mileage and clean interior.', '2026-04-01', '2026-12-31', 'available'],
                      [owner_id, 'Ford Mustang GT', 'Car', 'Petrol', 'Good', 'New York', 120, JSON.stringify(['https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80']), 'Feel the power on the highway.', '2026-04-01', '2026-08-31', 'available'],
                      [owner_id, 'Honda CR-V', 'SUV', 'Petrol', 'Fair', 'New Jersey', 65, JSON.stringify(['https://images.unsplash.com/photo-1568844293986-8d0400bc4745?auto=format&fit=crop&w=800&q=80']), 'Spacious for families.', '2026-04-01', '2026-12-31', 'available'],
                  ];
                  const stmt = db.prepare(`INSERT INTO vehicles (owner_id, name, type, engine_type, condition, city, price_per_day, images, description, available_from, available_to, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                  defaultCars.forEach(car => stmt.run(car));
                  stmt.finalize();
              }
          });
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
      status TEXT DEFAULT 'pending',
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
    )`);
  });
}

initDb();

function fetchAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function fetchOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

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
      const countRow = await fetchOne(`SELECT count(*) as count FROM users`);
      const role = countRow.count === 0 ? 'admin' : 'user';
      const cnic_verified = role === 'admin' ? 1 : 0;
      
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const result = await execute(
        `INSERT INTO users (name, email, password, role, city, phone, cnic, cnic_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.name, user.email, hashedPassword, role, user.city, user.phone, user.cnic, cnic_verified]
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
    const user = await fetchOne(`SELECT * FROM users WHERE email = ?`, [credentials.email]);
    if (user) {
      if (!user.is_active) return { success: false, error: 'Account is blocked' };
      
      const isMatch = await bcrypt.compare(credentials.password, user.password);
      if (isMatch) {
        // Don't return password in user object
        const { password, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
      }
    }
    return { success: false, error: 'Invalid credentials' };
  },

  // Vehicles
  getVehicles: () => fetchAll(`SELECT v.*, u.name as owner_name, u.phone as owner_phone, u.city as owner_city, u.avatar as owner_avatar, u.cnic_verified as owner_verified FROM vehicles v JOIN users u ON v.owner_id = u.id ORDER BY v.id DESC`),
  getVehiclesByOwner: (ownerId) => fetchAll(`SELECT v.*, u.name as owner_name, u.cnic_verified as owner_verified FROM vehicles v JOIN users u ON v.owner_id = u.id WHERE v.owner_id = ? ORDER BY v.id DESC`, [ownerId]),
  addVehicle: async (v) => {
    const result = await execute(
      `INSERT INTO vehicles (owner_id, name, type, engine_type, condition, city, location, registration_no, price_per_day, images, description, available_from, available_to, status, year, transmission, seating_capacity, features, is_insured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.owner_id, v.name, v.type, v.engine_type, v.condition, v.city, v.location, v.registration_no, v.price_per_day, JSON.stringify(v.images || []), v.description, v.available_from, v.available_to, v.status || 'pending', v.year || null, v.transmission || null, v.seating_capacity || null, JSON.stringify(v.features || []), v.is_insured ? 1 : 0]
    );
    return { success: true, id: result.id };
  },
  updateVehicle: async (v) => {
    await execute(
      `UPDATE vehicles SET name = ?, type = ?, engine_type = ?, condition = ?, city = ?, location = ?, registration_no = ?, price_per_day = ?, images = ?, description = ?, available_from = ?, available_to = ?, status = ?, year = ?, transmission = ?, seating_capacity = ?, features = ?, is_insured = ? WHERE id = ?`,
      [v.name, v.type, v.engine_type, v.condition, v.city, v.location, v.registration_no, v.price_per_day, JSON.stringify(v.images || []), v.description, v.available_from, v.available_to, v.status, v.year || null, v.transmission || null, v.seating_capacity || null, JSON.stringify(v.features || []), v.is_insured ? 1 : 0, v.id]
    );
    return { success: true };
  },
  deleteVehicle: async (id) => {
    await execute(`DELETE FROM vehicles WHERE id = ?`, [id]);
    return { success: true };
  },
  updateVehicleStatus: async ({ id, status }) => {
    await execute(`UPDATE vehicles SET status = ? WHERE id = ?`, [status, id]);
    return { success: true };
  },

  // Bookings
  createBooking: async (b) => {
    try {
        const result = await execute(
        `INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [b.user_id, b.vehicle_id, b.start_date, b.end_date, b.total_price, b.status || 'pending']
        );
        if (b.status === 'active' || b.status === 'paid') {
            await execute(`UPDATE vehicles SET status = 'booked' WHERE id = ?`, [b.vehicle_id]);
        }
        return { success: true, id: result.id };
    } catch (err) {
        return { success: false, error: err.message };
    }
  },
  getUserBookings: (userId) => fetchAll(`
    SELECT b.*, v.name as vehicle_name, v.images as vehicle_images, v.type as vehicle_type, v.registration_no as vehicle_registration_no, u.name as owner_name, u.avatar as owner_avatar, u.phone as owner_phone, u.city as owner_city
    FROM bookings b 
    JOIN vehicles v ON b.vehicle_id = v.id 
    JOIN users u ON v.owner_id = u.id
    WHERE b.user_id = ? ORDER BY b.id DESC`, [userId]),
  getOwnerBookings: (ownerId) => fetchAll(`
    SELECT b.*, v.name as vehicle_name, v.images as vehicle_images, v.registration_no as vehicle_registration_no, u.name as renter_name, u.phone as renter_phone, u.email as renter_email, u.city as renter_city, u.avatar as renter_avatar, u.cnic as renter_cnic
    FROM bookings b 
    JOIN vehicles v ON b.vehicle_id = v.id 
    JOIN users u ON b.user_id = u.id
    WHERE v.owner_id = ? ORDER BY b.id DESC`, [ownerId]),
  getAllBookings: () => fetchAll(`
    SELECT b.*, v.name as vehicle_name, u.name as user_name, u.email as user_email
    FROM bookings b 
    JOIN vehicles v ON b.vehicle_id = v.id 
    JOIN users u ON b.user_id = u.id
    ORDER BY b.id DESC`),
  updateBookingStatus: async ({ id, status, vehicle_id }) => {
    await execute(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id]);
    if (status === 'completed' || status === 'rejected') {
        await execute(`UPDATE vehicles SET status = 'available' WHERE id = ?`, [vehicle_id]);
    }
    return { success: true };
  },

  // Users
  getAllUsers: () => fetchAll(`SELECT id, name, email, role, city, phone, avatar, is_active, cnic, cnic_verified, driving_license FROM users ORDER BY id DESC`),
  getUserPasswordById: (id) => fetchOne(`SELECT password FROM users WHERE id = ?`, [id]),
  changePassword: async (id, newHashedPassword) => {
    await execute(`UPDATE users SET password = ? WHERE id = ?`, [newHashedPassword, id]);
    return { success: true };
  },
  updateUserStatus: async ({ id, is_active }) => {
    await execute(`UPDATE users SET is_active = ? WHERE id = ?`, [is_active, id]);
    return { success: true };
  },
  updateUserVerification: async ({ id, cnic_verified }) => {
    await execute(`UPDATE users SET cnic_verified = ? WHERE id = ?`, [cnic_verified, id]);
    return { success: true };
  },
  updateUserProfile: async ({ id, name, phone, city, avatar, cnic, driving_license }) => {
    await execute(`UPDATE users SET name = ?, phone = ?, city = ?, avatar = ?, cnic = ?, driving_license = ? WHERE id = ?`, [name, phone, city, avatar, cnic, driving_license, id]);
    const updated = await fetchOne(`SELECT id, name, email, role, city, phone, avatar, is_active, cnic, driving_license FROM users WHERE id = ?`, [id]);
    return { success: true, user: updated };
  },

  // Payments
  createPayment: async (p) => {
    const result = await execute(
      `INSERT INTO payments (booking_id, user_id, amount, method, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [p.booking_id, p.user_id, p.amount, p.method, p.transaction_id, p.status || 'pending']
    );
    return { success: true, id: result.id };
  },
  getBookingPayments: (bookingId) => fetchAll(`SELECT * FROM payments WHERE booking_id = ?`, [bookingId]),

  // Reviews
  addReview: async (r) => {
    const result = await execute(
      `INSERT INTO reviews (user_id, vehicle_id, rating, comment) VALUES (?, ?, ?, ?)`,
      [r.user_id, r.vehicle_id, r.rating, r.comment]
    );
    return { success: true, id: result.id };
  },
  getVehicleReviews: (vehicleId) => fetchAll(`
    SELECT r.*, u.name as user_name, u.avatar as user_avatar 
    FROM reviews r 
    JOIN users u ON r.user_id = u.id 
    WHERE r.vehicle_id = ? ORDER BY r.id DESC`, [vehicleId]),

  // Dashboard
  getDashboardStats: async () => {
    const vehicles = await fetchOne(`SELECT count(*) as count FROM vehicles`);
    const bookings = await fetchOne(`SELECT count(*) as count FROM bookings`);
    const active = await fetchOne(`SELECT count(*) as count FROM bookings WHERE status = 'active' OR status = 'paid'`);
    const earnings = await fetchOne(`SELECT sum(amount) as total FROM payments`);
    return { 
        vehicles: vehicles.count, 
        bookings: bookings.count, 
        active: active.count,
        earnings: earnings.total || 0
    };
  },

  // Audit Logs
  addAuditLog: async ({ user_id, action, target_type, target_id, details }) => {
    try {
        await execute(
            `INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
            [user_id, action, target_type, target_id, details]
        );
        return { success: true };
    } catch (e) {
        console.error('Audit Log Error:', e);
        return { success: false };
    }
  },
  getAuditLogs: () => fetchAll(`
    SELECT a.*, u.name as user_name 
    FROM audit_logs a 
    LEFT JOIN users u ON a.user_id = u.id 
    ORDER BY a.created_at DESC LIMIT 100
  `)
};
