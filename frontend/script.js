document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://localhost:5000/api';

  // // Debug: log the crime search input element to ensure it exists
  // console.log("crime-search element:", document.getElementById('crime-search'));

  // Theme toggle logic
  const themeToggleBtn = document.querySelector('.theme-toggle');
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');

    // Optional: switch icon between sun and moon
    const icon = themeToggleBtn.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
  });

  function hideAllScreens() {
    // Hide all section elements
    document.querySelectorAll("section").forEach(section => {
      if (!section.classList.contains('features') && !section.classList.contains('top-rated-locations')) {
        section.style.display = "none";
      }
    });
  
    // ✅ ALSO hide the location list section separately
    const locationListSection = document.getElementById('location-list-section');
    if (locationListSection) {
      locationListSection.style.display = 'none';
    }

    // ✅ Hide top rated locations section
    const topRatedLocationsSection = document.getElementById('top-rated-locations-section');
    if (topRatedLocationsSection) {
      topRatedLocationsSection.style.display = 'none';
    }
  }

  const locationLink = document.getElementById('location-safety-link');
  const crimeReportsLink = document.getElementById('crime-reports-link');
  const reviewsLink = document.getElementById('user-reviews-link');
  const safeZonesLink = document.getElementById('safe-zones-link');

  const locationInputScreen = document.getElementById('location-input-screen');
  const safetyDetailsScreen = document.getElementById('safety-details-screen');
  const userReviewsScreen = document.getElementById('user-reviews-screen');
  const crimeReportsScreen = document.getElementById('crime-reports-screen');
  const safeZonesScreen = document.getElementById('safe-zones-screen');
  const featureSection = document.querySelector('.features');
  const topRatedLocationsSection = document.getElementById('top-rated-locations-section');

  const locationNameInput = document.getElementById('location-name');
  const analyzeBtn = document.getElementById('analyze-btn');
  const safetyDataDiv = document.getElementById('safety-data');
  const locationTitleSpan = document.getElementById('location-title');
  const locationImage = document.getElementById('location-image');

  const reviewLocationInput = document.getElementById('review-location');
  const reviewTextInput = document.getElementById('review-text');
  const reviewRatingInput = document.getElementById('review-rating');
  const submitReviewBtn = document.getElementById('submit-review-btn');
  const reviewList = document.getElementById('review-list');

  const crimeReportsList = document.getElementById('crime-reports-list');
  const refreshCrimeReportsBtn = document.getElementById('refresh-crime-reports');

  if (refreshCrimeReportsBtn) {
    refreshCrimeReportsBtn.addEventListener('click', loadCrimeReports);
  }

  const safeZonesList = document.getElementById('safe-zones-list');
  const refreshSafeZonesBtn = document.getElementById('refresh-safe-zones');

  hideAllScreens();
  
  // Load top rated locations when the page loads
  loadTopRatedLocations();

  locationLink.addEventListener('click', () => {
    hideAllScreens();
    locationInputScreen.style.display = 'block';
    topRatedLocationsSection.style.display = 'block';
    document.getElementById('location-list-section').style.display = 'block'; // ✅ show the grid
    // featureSection.style.display = 'none';
    // Load the list of locations below the search bar.
    loadLocationsList();
    loadTopRatedLocations();
  });

  crimeReportsLink.addEventListener('click', () => {
    hideAllScreens();
    crimeReportsScreen.style.display = 'block';
    // featureSection.style.display = 'none';
    loadCrimeReports();
  });

  reviewsLink.addEventListener('click', () => {
    hideAllScreens();
    userReviewsScreen.style.display = 'block';
    // featureSection.style.display = 'none';
    loadReviews();
  });

  safeZonesLink.addEventListener('click', () => {
    hideAllScreens();
    safeZonesScreen.style.display = 'block';
    // featureSection.style.display = 'none';
    loadSafeZones();
  });

  document.getElementById('feature-location').addEventListener('click', () => {
    hideAllScreens();
    locationInputScreen.style.display = 'block';
    topRatedLocationsSection.style.display = 'block';
    document.getElementById('location-list-section').style.display = 'block'; // ✅ Add this line
    // featureSection.style.display = 'none';
    loadLocationsList();
    loadTopRatedLocations();
  });

  document.getElementById('feature-crime').addEventListener('click', () => {
    hideAllScreens();
    crimeReportsScreen.style.display = 'block';
    // featureSection.style.display = 'none';
    loadCrimeReports();
  });

  document.getElementById('feature-reviews').addEventListener('click', () => {
    hideAllScreens();
    userReviewsScreen.style.display = 'block';
    // featureSection.style.display = 'none';
    loadReviews();
  });

  document.getElementById('feature-safe-zones').addEventListener('click', () => {
    hideAllScreens();
    safeZonesScreen.style.display = 'block';
    // featureSection.style.display = 'none';
    loadSafeZones();
  });

  analyzeBtn.addEventListener('click', async () => {
    const locationName = locationNameInput.value.trim();
    if (!locationName) {
      alert('Please enter a location.');
      return;
    }

    try {
      // Search for location
      const response = await fetch(`${BASE_URL}/locations?search=${encodeURIComponent(locationName)}`);
      const locations = await response.json();
      
      if (locations.length === 0) {
        alert('Location not found');
        return;
      }

      const location = locations[0];
      locationTitleSpan.textContent = location.name;
      
      // Get safety analysis
      const safetyResponse = await fetch(`${BASE_URL}/locations/${location.LocationID}/safety`);
      const safetyData = await safetyResponse.json();
      
      displaySafetyAnalysis(safetyData);
      // locationInputScreen.style.display = 'none';
      safetyDetailsScreen.style.display = 'block';
      document.getElementById('location-list-section').style.display = 'block';
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze location');
    }
  });

  submitReviewBtn.addEventListener('click', async () => {
    const locationName = reviewLocationInput.value.trim();
    const reviewText = reviewTextInput.value.trim();
    const rating = parseInt(reviewRatingInput.value);
    const userId = 1; // This should be replaced with actual user ID from authentication

    if (!locationName || !rating || rating < 1 || rating > 5) {
      alert('Please provide a valid location and rating (1-5 stars)');
      return;
    }

    try {
      // First, find or create the location
      const locationResponse = await fetch(`${BASE_URL}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: locationName })
      });
      const locationData = await locationResponse.json();

      // Then submit the review
      const reviewResponse = await fetch(`${BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          locationId: locationData.id,
          rating,
          reviewText
        })
      });

      if (reviewResponse.ok) {
        alert('Review submitted successfully!');
        reviewLocationInput.value = '';
        reviewTextInput.value = '';
        reviewRatingInput.value = '';
        loadReviews();
        // Reload top rated locations as the ratings might have changed
        loadTopRatedLocations();
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit review');
    }
  });

  async function loadCrimeReports() {
    try {
      const searchQuery = document.getElementById('crime-search')?.value.trim();
      const url = searchQuery
        ? `${BASE_URL}/crime-reports?search=${encodeURIComponent(searchQuery)}`
        : `${BASE_URL}/crime-reports`;

      const response = await fetch(url);
      const reports = await response.json();
      
      crimeReportsList.innerHTML = '';
      
      if (reports.length === 0) {
        crimeReportsList.innerHTML = '<p>No crime reports found.</p>';
        return;
      }

      reports.forEach(report => {
        const reportCard = document.createElement('div');
        reportCard.className = 'report-card';
        reportCard.innerHTML = `
          <h3>${report.CrimeType}</h3>
          <p>${report.Description}</p>
          <small>${new Date(report.DateTime).toLocaleString()}</small>
          <span class="source">Source: ${report.Source}</span>
        `;
        crimeReportsList.appendChild(reportCard);
      });
    } catch (error) {
      console.error('Error:', error);
      crimeReportsList.innerHTML = '<p>Failed to load crime reports</p>';
    }
  }

  async function loadSafeZones() {
    try {
      const category = document.getElementById('safe-zone-category')?.value;
      const url = category 
        ? `${BASE_URL}/safe-zones/category/${encodeURIComponent(category)}` 
        : `${BASE_URL}/safe-zones`;

      const response = await fetch(url);
      const zones = await response.json();
      
      safeZonesList.innerHTML = '';
      
      if (zones.length === 0) {
        safeZonesList.innerHTML = '<p>No safe zones found.</p>';
        return;
      }

      zones.forEach(zone => {
        const zoneCard = document.createElement('div');
        zoneCard.className = 'zone-card';
        zoneCard.innerHTML = `
          <h3>${zone.Name} <span class="category-badge">${zone.Category}</span></h3>
          <p><strong>Location:</strong> ${zone.location_name}</p>
          <p><strong>Address:</strong> ${zone.address}</p>
          ${zone.ContactInfo ? `<p><strong>Contact:</strong> ${zone.ContactInfo}</p>` : ''}
          <div class="verification-badge ${zone.VerificationStatus ? 'verified' : 'unverified'}">
            ${zone.VerificationStatus ? '✓ Verified' : 'Unverified'}
          </div>
        `;
        safeZonesList.appendChild(zoneCard);
      });
    } catch (error) {
      console.error('Error:', error);
      safeZonesList.innerHTML = '<p>Failed to load safe zones</p>';
    }
  }

  async function loadReviews() {
    try {
      const response = await fetch(`${BASE_URL}/reviews`);
      const reviews = await response.json();
      
      reviewList.innerHTML = '';
      
      if (reviews.length === 0) {
        reviewList.innerHTML = '<p>No reviews found.</p>';
        return;
      }

      reviews.forEach(review => {
        const reviewItem = document.createElement('li');
        reviewItem.innerHTML = `
        <div class="review-header">
          <span class="review-location"><strong>${review.LocationName}</strong></span>
          <span class="review-rating">${'★'.repeat(review.Rating)}${'☆'.repeat(5 - review.Rating)}</span>
        </div>
        <div class="review-text">${review.ReviewText}</div>
        <div class="review-date">${new Date(review.ReviewDate).toLocaleString()}</div>
      `;
        reviewList.appendChild(reviewItem);
      });
    } catch (error) {
      console.error('Error:', error);
      reviewList.innerHTML = '<p>Failed to load reviews</p>';
    }
  }

  // Function to load and display all locations in the location list container
  async function loadLocationsList() {
    try {
      // Fetch all locations without search parameter.
      const response = await fetch(`${BASE_URL}/locations`);
      const locations = await response.json();
      
      // Get the container div and clear any existing content.
      const locationListContainer = document.getElementById('location-list');
      locationListContainer.innerHTML = '';

      if (locations.length === 0) {
        locationListContainer.innerHTML = '<p>No locations found.</p>';
        return;
      }

      // Create and append an element for each location.
      locations.forEach(loc => {
        const locItem = document.createElement('div');
        locItem.className = 'location-item';
        // Display the name and optionally the coordinates.
        locItem.innerHTML = `
          <h3>${loc.Name}</h3>
          <p>${loc.Address}</p>
          <small>Lat: ${loc.Latitude}, Lng: ${loc.Longitude}</small>
        `;
        locationListContainer.appendChild(locItem);
      });
    } catch (error) {
      console.error('Error loading locations:', error);
      const locationListContainer = document.getElementById('location-list');
      locationListContainer.innerHTML = '<p>Failed to load locations.</p>';
    }
  }

  // Function to load and display top rated locations
  async function loadTopRatedLocations() {
    try {
      const response = await fetch(`${BASE_URL}/locations/top-rated`);
      const topLocations = await response.json();
      
      const topRatedContainer = document.getElementById('top-rated-locations');
      topRatedContainer.innerHTML = '';
      
      if (topLocations.length === 0) {
        topRatedContainer.innerHTML = '<p>No rated locations found.</p>';
        return;
      }
      
      topLocations.forEach(location => {
        const locationCard = document.createElement('div');
        locationCard.className = 'top-rated-card';
        locationCard.innerHTML = `
          <h3>${location.Name}</h3>
          <div class="rating-display">
            <span class="star-rating">${'★'.repeat(Math.round(location.AvgRating))}${'☆'.repeat(5 - Math.round(location.AvgRating))}</span>
            <span class="rating-value">${location.AvgRating}/5</span>
          </div>
          <p>${location.Address || 'No address available'}</p>
        `;
        
        // Add click event to analyze this location
        locationCard.addEventListener('click', () => {
          locationNameInput.value = location.Name;
          analyzeBtn.click();
        });
        
        topRatedContainer.appendChild(locationCard);
      });
    } catch (error) {
      console.error('Error loading top rated locations:', error);
      const topRatedContainer = document.getElementById('top-rated-locations');
      topRatedContainer.innerHTML = '<p>Failed to load top rated locations.</p>';
    }
  }

  function displaySafetyAnalysis(data) {
    safetyDataDiv.innerHTML = `
      <div class="safety-score">
        <h3>Safety Score: ${data.safetyScore.toFixed(1)}/10</h3>
        <div class="score-bar">
          <div class="score-fill" style="width: ${data.safetyScore * 10}%"></div>
        </div>
      </div>
      <div class="avg-rating">
        <h3>Average Rating: ${data.avgRating}/5</h3>
      </div>
      <div class="crime-reports">
        <h3>Recent Crime Reports (${data.crimeReports.length})</h3>
        ${data.crimeReports.map(report => `
          <div class="crime-report">
            <p><strong>${report.CrimeType}</strong> - ${report.Description}</p>
            <small>${new Date(report.DateTime).toLocaleString()}</small>
          </div>
        `).join('')}
      </div>
      <div class="reviews">
        <h3>User Reviews (${data.reviews.length})</h3>
        ${data.reviews.map(review => `
          <div class="review">
            <div class="rating">${'★'.repeat(review.Rating)}${'☆'.repeat(5 - review.Rating)}</div>
            <p>${review.ReviewText}</p>
            <small>${new Date(review.ReviewDate).toLocaleString()}</small>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Attach an event listener for changes in the safe zone category dropdown
  const safeZoneCategorySelect = document.getElementById('safe-zone-category');
  if (safeZoneCategorySelect) {
    safeZoneCategorySelect.addEventListener('change', loadSafeZones);
  }
  
  // Attach refresh button functionality if exists
  if (refreshSafeZonesBtn) {
    refreshSafeZonesBtn.addEventListener('click', loadSafeZones);
  }

  // Initialize
  hideAllScreens();
});