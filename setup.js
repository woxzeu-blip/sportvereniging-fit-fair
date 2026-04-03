const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Database connection
const dbPath = path.join(__dirname, 'database', 'sportvereniging.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Get all activities
app.get('/api/activities', (req, res) => {
    db.all("SELECT * FROM activities ORDER BY date ASC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get activity by ID
app.get('/api/activities/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM activities WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Activity not found' });
            return;
        }
        res.json(row);
    });
});

// Get registrations for an activity
app.get('/api/activities/:id/registrations', (req, res) => {
    const id = req.params.id;
    db.all("SELECT * FROM registrations WHERE activity_id = ? ORDER BY registration_date ASC", [id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new activity
app.post('/api/activities', (req, res) => {
    const { title, description, date, time, location, max_participants, type } = req.body;
    
    db.run(
        "INSERT INTO activities (title, description, date, time, location, max_participants, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, description, date, time, location, max_participants, type],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Activity created successfully' });
        }
    );
});

// Register for activity
app.post('/api/activities/:id/register', (req, res) => {
    const activityId = req.params.id;
    const { name, email, phone } = req.body;
    
    // Check if activity exists and has space
    db.get("SELECT max_participants FROM activities WHERE id = ?", [activityId], (err, activity) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!activity) {
            res.status(404).json({ error: 'Activity not found' });
            return;
        }
        
        // Check current registrations
        db.get("SELECT COUNT(*) as count FROM registrations WHERE activity_id = ?", [activityId], (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (activity.max_participants && result.count >= activity.max_participants) {
                res.status(400).json({ error: 'Activity is full' });
                return;
            }
            
            // Add registration
            db.run(
                "INSERT INTO registrations (activity_id, name, email, phone) VALUES (?, ?, ?, ?)",
                [activityId, name, email, phone],
                function(err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.json({ id: this.lastID, message: 'Registration successful' });
                }
            );
        });
    });
});

// Delete activity
app.delete('/api/activities/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM activities WHERE id = ?", [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Activity not found' });
            return;
        }
        res.json({ message: 'Activity deleted successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
