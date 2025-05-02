const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all locations OR search by name
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM Location';
    let params = [];

    if (req.query.search) {
      query += ' WHERE name LIKE ?';
      params.push(`%${req.query.search}%`);
    }

    const [locations] = await db.promise().query(query, params);
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top rated locations
router.get('/top-rated', async (req, res) => {
  try {
    // Query to get top 5 locations with highest average rating
    const query = `
      SELECT L.*, AVG(R.Rating) AS AvgRating
      FROM Location L
      JOIN Review R ON L.LocationID = R.LocationID
      GROUP BY L.LocationID
      ORDER BY AvgRating DESC
      LIMIT 5
    `;
    
    const [locations] = await db.promise().query(query);
    
    // Format the average rating to one decimal place
    locations.forEach(location => {
      location.AvgRating = parseFloat(location.AvgRating).toFixed(1);
    });
    
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get location by ID
router.get('/:id', async (req, res) => {
  try {
    const [locations] = await db.promise().query(
      'SELECT * FROM Location WHERE LocationID = ?',
      [req.params.id]
    );

    if (locations.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json(locations[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get safety analysis for a location
router.get('/:id/safety', async (req, res) => {
  try {
    const locationId = req.params.id;

    // Get location details
    const [locations] = await db.promise().query(
      'SELECT * FROM Location WHERE LocationID = ?',
      [locationId]
    );

    if (locations.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Get crime reports
    const [crimeReports] = await db.promise().query(
      'SELECT * FROM CrimeReport WHERE LocationID = ?',
      [locationId]
    );

    // Get reviews
    const [reviews] = await db.promise().query(
      'SELECT * FROM Review WHERE LocationID = ?',
      [locationId]
    );

    // Calculate safety score (simple implementation)
    const crimePenalty = Math.min(5, crimeReports.length * 0.5); // cap at 5
    const reviewScore = reviews.reduce((acc, review) => acc + review.Rating, 0) / reviews.length || 0;
    const safetyScore = Math.max(0, 10 - crimePenalty + (reviewScore - 3)); // shift review score to balance 
    
    // Get average rating for the location
    const [avgRatingResult] = await db.promise().query(
      'SELECT AVG(Rating) AS AvgRating FROM Review WHERE LocationID = ?',
      [locationId]
    );

    const avgRating = parseFloat(avgRatingResult[0].AvgRating) || 0;

    res.json({
      location: locations[0],
      crimeReports,
      reviews,
      safetyScore: Math.min(10, Math.max(0, safetyScore)),
      avgRating: avgRating.toFixed(1) // Format the average rating to one decimal place
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new location
router.post('/', async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    // Provide default values if not provided to avoid inserting nulls
    const safeAddress = address || 'Unknown Address';
    const safeLatitude = latitude || 0;
    const safeLongitude = longitude || 0;

    const [result] = await db.promise().query(
      'INSERT INTO Location (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, safeAddress, safeLatitude, safeLongitude]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      address,
      latitude,
      longitude
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;