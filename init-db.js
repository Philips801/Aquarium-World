const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    // 1. Zones Table
    db.run(`CREATE TABLE IF NOT EXISTS zones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        description TEXT,
        conservation_focus TEXT,
        image_url TEXT
    )`);

    // 2. Exhibits Table
    db.run(`CREATE TABLE IF NOT EXISTS exhibits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zone_id INTEGER,
        title TEXT,
        description TEXT,
        interactive_element TEXT,
        FOREIGN KEY (zone_id) REFERENCES zones(id)
    )`);

    // 3. Contact Form Table
    db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run('DELETE FROM exhibits');
    db.run('DELETE FROM zones');

    const insertZone = db.prepare('INSERT INTO zones (name, slug, description, conservation_focus, image_url) VALUES (?, ?, ?, ?, ?)');
        insertZone.run(
        'Coral Reef Zone', 
        'coral-reef', 
        'A vibrant underwater metropolis teeming with multi-colored corals and exotic fish.', 
        'We support global coral reef restoration and reef protection projects.', 
        '/images/Coral.jpg'

    );
    insertZone.run(
        'Deep Sea Trench', 
        'deep-sea', 
        'Descend into the eternal darkness of the deep oceans and meet creatures adapted to extreme pressure.', 
        'We study the impact of microplastics drifting to the ocean floor.', 
        '/images/Deepsea.jpg'
    );
    insertZone.run(
        'Coastal Rockpools', 
        'coastal-rockpools', 
        'An interactive shoreline area where you can observe coastal life closer than ever.', 
        'We educate visitors on beach ecosystem preservation.', 
        '/images/Rockpool.jpg'
    );
    insertZone.run(
        'Freshwater Rivers', 
        'freshwater-rivers', 
        'Journey through rainforested rivers home to predatory piranhas and ancient giant river fish.', 
        'We actively fight against river systems pollution.', 
        '/images/Freshwater.jpg'
    );

    insertZone.finalize((err) => {
        if (err) console.error(err);
        
        const insertExhibit = db.prepare('INSERT INTO exhibits (zone_id, title, description, interactive_element) VALUES (?, ?, ?, ?)');
        insertExhibit.run(1, '360° Ocean Tunnel', 'Walk inside a fully transparent glass tunnel underneath sharks and manta rays.', 'Visual experience - close proximity tracking.');
        insertExhibit.run(2, 'The Bioluminescent Lab', 'See a real-time dark simulation of deep ocean creatures producing their own light.', 'Touch panel allowing visitors to alter pulse frequency simulators.');
        insertExhibit.run(3, 'Touch & Discover Pool', 'An encounter with starfish, crabs, and anemones overseen by marine biologists.', 'Safe hands-on touching guided by expert guidelines.');
        insertExhibit.run(4, 'Amazonian Monsoon Rain', 'Experience a simulated tropical rainstorm over the giant freshwater basin.', 'Atmospheric auditory and climate simulation elements.');
        insertExhibit.finalize();
        console.log('Database successfully initialized and seeded with data!');
    });
});
