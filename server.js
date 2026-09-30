const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('DB Error:', err.message);
    else console.log('Connected to the SQLite database.');
});

// CRITICAL REQUIREMENT: Global Variable for Opening Hours Visibility
app.locals.openingTimes = "Open Every Day: 9:00 AM – 6:00 PM";

app.get('/', (req, res) => {
    db.all('SELECT * FROM zones', [], (err, zones) => {
        if (err) return res.status(500).send("Server Error");
        res.render('index', { title: 'Home', zones });
    });
});

app.get('/zone/:slug', (req, res) => {
    const zoneSlug = req.params.slug;
    // Secure Parameterized Query
    db.get('SELECT * FROM zones WHERE slug = ?', [zoneSlug], (err, zone) => {
        if (err || !zone) return res.status(404).render('404', { title: 'Not Found' });
        
        db.all('SELECT * FROM exhibits WHERE zone_id = ?', [zone.id], (err, exhibits) => {
            res.render('zone', { title: zone.name, zone, exhibits });
        });
    });
});

app.get('/faq', (req, res) => { res.render('faq', { title: 'FAQ' }); });
app.get('/contact', (req, res) => { res.render('contact', { title: 'Contact Us', success: false }); });

app.post('/contact', (req, res) => {
    const { name, email, message, subject } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).send('All fields are required.');
    }

    // Combine subject and message cleanly into the existing database format
    const processedMessage = `[Department: ${subject ? subject.toUpperCase() : 'GENERAL'}] ${message}`;

    const stmt = db.prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)');
    stmt.run([name, email, processedMessage], function(err) {
        if (err) return res.status(500).send('Database submission error.');
        res.render('contact', { title: 'Contact Us', success: true });
    });
    stmt.finalize();
});


app.use((req, res) => { res.status(404).render('404', { title: 'Page Not Found' }); });
app.listen(PORT, () => console.log(`Aquarium World running at http://localhost:${PORT}`));

