CREATE DATABASE project;
use project;

-- Table for storing user information
CREATE TABLE User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL CHECK (LENGTH(Name) >= 3),
    Email VARCHAR(100) UNIQUE NOT NULL CHECK (Email LIKE '%@%.%'),
    Password VARCHAR(255) NOT NULL, 
    Role ENUM('Regular', 'Admin') NOT NULL DEFAULT 'Regular'
);

-- Table for locations that users review or check safety for
CREATE TABLE Location (
    LocationID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL CHECK (LENGTH(Name) >= 3),
    Address TEXT NOT NULL,
    Latitude DECIMAL(9,6) NOT NULL CHECK (Latitude BETWEEN -90 AND 90),
    Longitude DECIMAL(9,6) NOT NULL CHECK (Longitude BETWEEN -180 AND 180)
);

-- Table to store user reviews on different locations
CREATE TABLE Review (
    ReviewID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    LocationID INT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    ReviewText TEXT,
    ReviewDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Moderated BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table for crime reports linked to locations
CREATE TABLE CrimeReport (
    ReportID INT PRIMARY KEY AUTO_INCREMENT,
    LocationID INT NOT NULL,
    CrimeType VARCHAR(100) NOT NULL CHECK (LENGTH(CrimeType) >= 3),
    Description TEXT,
    DateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Source VARCHAR(100),
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table for listing verified safe zones like cafés, hostels, etc.
CREATE TABLE Listing (
    ListingID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL CHECK (LENGTH(Name) >= 3),
    Category ENUM('Café', 'Hostel', 'Police Station', 'Public Restroom', 'Others') NOT NULL,
    ContactInfo VARCHAR(255),
    VerificationStatus BOOLEAN DEFAULT FALSE,
    LocationID INT NOT NULL,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table for user notifications
CREATE TABLE Notification (
    NotificationID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Message TEXT NOT NULL CHECK (LENGTH(Message) > 0),
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReadStatus BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Saves (
    UserID INT NOT NULL,
    LocationID INT NOT NULL,
    PRIMARY KEY (UserID, LocationID),
    FOREIGN KEY (UserID) REFERENCES User(UserID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table for users saving locations for quick acce