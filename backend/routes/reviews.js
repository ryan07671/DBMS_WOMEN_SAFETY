const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all reviews
router.get('/', (req, res) => {
  const query = `
    SELECT R.*, L.Name AS LocationName, U.Name AS UserName
    FROM Review R
    JOIN Location L ON R.LocationID = L.LocationID
    JOIN User U ON R.UserID = U.UserID
    ORDER BY R.ReviewDate DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Submit a new review
router.post('/', (req, res) => {
  const { userId, locationId, rating, reviewText } = req.body;
  
  const query = `
    INSERT INTO Review (UserID, LocationID, Rating, ReviewText, ReviewDate)
    VALUES (?, ?, ?, ?, NOW())
  `;
  
  db.query(query, [userId, locationId, rating, reviewText], (err, result) => {
    if (err) {
      console.error('Error submitting review:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ id: result.insertId });
  });
});

// Get reviews for a specific location
router.get('/location/:locationId', (req, res) => {
  const locationId = req.params.locationId;
  const query = `
    SELECT R.*, U.Name AS UserName
    FROM Review R
    JOIN User U ON R.UserID = U.UserID
    WHERE R.LocationID = ?
    ORDER BY R.ReviewDate DESC
  `;
  
  db.query(query, [locationId], (err, results) => {
    if (err) {
      console.error('Error fetching location reviews:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Moderate review
router.patch('/:id/moderate', async (req, res) => {
  try {
    const { moderated } = req.body;

    await db.promise().query(
      'UPDATE Review SET Moderated = ? WHERE ReviewID = ?',
      [moderated, req.params.id]
    );

    res.json({ message: 'Review moderation status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review
router.delete('/:id', async (req, res) => {
  try {
    await db.promise().query(
      'DELETE FROM Review WHERE ReviewID = ?',
      [req.params.id]
    );

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 