const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all safe zones
router.get('/', (req, res) => {
  const query = `
    SELECT L.*, Loc.Name AS location_name, Loc.Address
    FROM Listing L
    JOIN Location Loc ON L.LocationID = Loc.LocationID
    WHERE L.VerificationStatus = TRUE
    ORDER BY L.Category
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching safe zones:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get safe zones by category
router.get('/category/:category', (req, res) => {
  const category = req.params.category;
  const query = `
    SELECT L.*, Loc.Name AS location_name, Loc.Address
    FROM Listing L
    JOIN Location Loc ON L.LocationID = Loc.LocationID
    WHERE L.VerificationStatus = TRUE AND L.Category = ?
    ORDER BY L.Name
  `;
  
  db.query(query, [category], (err, results) => {
    if (err) {
      console.error('Error fetching safe zones by category:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get safe zones with high ratings
router.get('/top-rated', (req, res) => {
  const query = `
    SELECT L.*, Loc.Name AS location_name, Loc.Address,
           AVG(R.Rating) AS avg_rating,
           COUNT(R.ReviewID) AS review_count
    FROM Listing L
    JOIN Location Loc ON L.LocationID = Loc.LocationID
    LEFT JOIN Review R ON L.LocationID = R.LocationID
    WHERE L.VerificationStatus = TRUE
    GROUP BY L.ListingID
    HAVING avg_rating >= 4
    ORDER BY avg_rating DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching top rated safe zones:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Add new safe zone
router.post('/', async (req, res) => {
  try {
    const { name, category, contactInfo, locationId } = req.body;

    const [result] = await db.promise().query(
      'INSERT INTO Listing (Name, Category, ContactInfo, LocationID) VALUES (?, ?, ?, ?)',
      [name, category, contactInfo, locationId]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      category,
      contactInfo,
      locationId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify safe zone
router.patch('/:id/verify', async (req, res) => {
  try {
    const { verificationStatus } = req.body;

    await db.promise().query(
      'UPDATE Listing SET VerificationStatus = ? WHERE ListingID = ?',
      [verificationStatus, req.params.id]
    );

    res.json({ message: 'Safe zone verification status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get safe zones near a location
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    const [listings] = await db.promise().query(
      'SELECT l.*, loc.name as location_name, loc.address, loc.latitude, loc.longitude, ' +
      '(6371 * acos(cos(radians(?)) * cos(radians(loc.latitude)) * ' +
      'cos(radians(loc.longitude) - radians(?)) + ' +
      'sin(radians(?)) * sin(radians(loc.latitude)))) AS distance ' +
      'FROM Listing l JOIN Location loc ON l.LocationID = loc.LocationID ' +
      'HAVING distance < ? ORDER BY distance',
      [latitude, longitude, latitude, radius]
    );

    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 