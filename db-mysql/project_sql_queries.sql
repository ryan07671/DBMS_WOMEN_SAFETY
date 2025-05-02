use project;

-- Simple Queries:


-- 1. List all the crime reports.
SELECT * FROM CrimeReport;

-- 2. List all the locations with name and coordinates.
SELECT Name, Latitude, Longitude FROM Location;

-- 3. Get all reviews with rating 5.
SELECT * FROM Review WHERE Rating = 5;

-- 4. Get crime reports in a specifc location
-- (Choosing locationID to be 2)
SELECT CrimeType, Description, DateTime FROM CrimeReport WHERE LocationID = 2;

-- Intermediate Queries:

-- 5. Get average rating for each location.
SELECT LocationID, AVG(Rating) AS AvgRating
FROM Review
GROUP BY LocationID;

-- 6. Find users who have posted more than 3 reviews.
SELECT UserID, COUNT(*) AS TotalReviews
FROM Review
GROUP BY UserID
HAVING COUNT(*) > 3;

-- 7. List verified listing along with their category and location name.
SELECT L.Name AS ListingName, L.Category, Loc.Name AS LocationName
FROM Listing L
JOIN Location Loc ON L.LocationID = Loc.LocationID
WHERE L.VerificationStatus = TRUE;

-- 8. Get all unread notifications for a user.
SELECT Message, Timestamp 
FROM Notification 
WHERE UserID = 8 AND ReadStatus = FALSE;

-- 9. List locations saved by a particular user.
SELECT Loc.Name, Loc.Address 
FROM Saves S
JOIN Location Loc ON S.LocationID = Loc.LocationID
WHERE S.UserID = 3;

-- 10. Get number of crime reports per location.
SELECT LocationID, COUNT(*) AS CrimeCount
FROM CrimeReport
GROUP BY LocationID;

-- 11. Get users who have never posted a review.
SELECT Name, Email
FROM User
WHERE UserID NOT IN (
    SELECT DISTINCT UserID
    FROM Review
);

-- Complex Queries:

-- 12. List users along with the number of locations they have reviewed.
SELECT U.Name, COUNT(DISTINCT R.LocationID) AS LocationsReviewed
FROM User U
JOIN Review R ON U.UserID = R.UserID
GROUP BY U.UserID;

-- 13. Find top 5 highest rated locations based on average review.
SELECT L.Name, AVG(R.Rating) AS AvgRating
FROM Location L
JOIN Review R ON L.LocationID = R.LocationID
GROUP BY L.LocationID
ORDER BY AvgRating DESC
LIMIT 5;

-- 14. Show top 3 users who saved the most locations.
SELECT U.Name, COUNT(S.LocationID) AS SavedCount
FROM User U
JOIN Saves S ON U.UserID = S.UserID
GROUP BY U.UserID
ORDER BY SavedCount DESC
LIMIT 3;

-- 15. List locations with more than 1 crime report but also reviews rated 4 or above.
SELECT DISTINCT L.Name
FROM Location L
JOIN CrimeReport CR ON L.LocationID = CR.LocationID
JOIN Review R ON L.LocationID = R.LocationID
WHERE R.Rating >= 4
GROUP BY L.LocationID
HAVING COUNT(CR.ReportID) > 1;

-- 16. Get all listings with their location and number of crime reports at that location.
SELECT L.Name AS ListingName, Loc.Name AS LocationName, COUNT(CR.ReportID) AS CrimeCount
FROM Listing L
JOIN Location Loc ON L.LocationID = Loc.LocationID
LEFT JOIN CrimeReport CR ON CR.LocationID = Loc.LocationID
GROUP BY L.ListingID;

-- 17. Get recent 3 reviews for each location.
SELECT *
FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY LocationID ORDER BY ReviewDate DESC) AS rn
    FROM Review
) AS sub
WHERE rn <= 3;

-- 18. For each location, show average rating, number of reviews, and the number of crime reports
SELECT L.Name AS LocationName, 
       IFNULL(AVG(R.Rating), 0) AS AvgRating,
       COUNT(DISTINCT R.ReviewID) AS ReviewCount,
       COUNT(DISTINCT CR.ReportID) AS CrimeCount
FROM Location L
LEFT JOIN Review R ON L.LocationID = R.LocationID
LEFT JOIN CrimeReport CR ON L.LocationID = CR.LocationID
GROUP BY L.LocationID;

-- 19. List locations that have a higher average rating than the global average.
SELECT L.Name, AVG(R.Rating) AS LocationAvg
FROM Location L
JOIN Review R ON L.LocationID = R.LocationID
GROUP BY L.LocationID
HAVING AVG(R.Rating) > (
    SELECT AVG(Rating) FROM Review
);

-- 20. Find the most recently reviewed location by each user
SELECT R.UserID, L.Name AS LocationName, R.ReviewDate
FROM Review R
JOIN Location L ON R.LocationID = L.LocationID
WHERE R.ReviewDate = (
    SELECT MAX(R2.ReviewDate)
    FROM Review R2
    WHERE R2.UserID = R.UserID
);
