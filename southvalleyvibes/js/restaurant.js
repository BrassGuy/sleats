// Get restaurant ID from URL
const urlParams = new URLSearchParams(window.location.search);
const restaurantId = parseInt(urlParams.get('id'));

// State variables
let currentRestaurant = null;
let restaurantReviews = [];
let currentPage = 1;
const reviewsPerPage = 5;

// Initialize page
async function initializeRestaurantPage() {
    try {
        // Fetch restaurant and review data
        const [restaurantResponse, reviewResponse] = await Promise.all([
            fetch('/data/restaurants.json'),
            fetch('/data/reviews.json')
        ]);
        
        const restaurantData = await restaurantResponse.json();
        const reviewData = await reviewResponse.json();
        
        // Find current restaurant
        currentRestaurant = restaurantData.restaurants.find(r => r.id === restaurantId);
        if (!currentRestaurant) {
            throw new Error('Restaurant not found');
        }
        
        // Get reviews for this restaurant
        restaurantReviews = reviewData.reviews.filter(r => r.restaurantId === restaurantId);
        
        // Update page content
        updateRestaurantHeader();
        updateRestaurantInfo();
        updateReviews();
        setupEventListeners();
        
        // Set form restaurant ID
        document.getElementById('restaurantId').value = restaurantId;
        
        // Update page title
        document.title = `${currentRestaurant.name} - Salt Lake Valley Vibes`;
    } catch (error) {
        console.error('Error initializing restaurant page:', error);
        showError('Failed to load restaurant details. Please try again later.');
    }
}

// Update restaurant header section
function updateRestaurantHeader() {
    const header = document.getElementById('restaurant-header');
    header.innerHTML = `
        <div class="restaurant-hero">
            <img src="${currentRestaurant.image}" alt="${currentRestaurant.name}">
            <div class="restaurant-hero-content">
                <h1>${currentRestaurant.name}</h1>
                <div class="restaurant-meta">
                    <span class="cuisine">${currentRestaurant.cuisine}</span>
                    <span class="price-range">${currentRestaurant.priceRange}</span>
                    <div class="rating">
                        ${createStarRating(currentRestaurant.averageRating)}
                        <span>(${currentRestaurant.totalReviews} reviews)</span>
                    </div>
                </div>
                <p class="description">${currentRestaurant.description}</p>
            </div>
        </div>
    `;
}

// Update restaurant information sections
function updateRestaurantInfo() {
    // Update hours
    const hoursList = document.getElementById('hours-list');
    hoursList.innerHTML = Object.entries(currentRestaurant.hours)
        .map(([day, hours]) => `
            <div class="hours-row">
                <span class="day">${capitalizeFirstLetter(day)}</span>
                <span class="hours">${hours}</span>
            </div>
        `).join('');
    
    // Update contact info
    const contactInfo = document.getElementById('contact-info');
    contactInfo.innerHTML = `
        <p><strong>Phone:</strong> <a href="tel:${currentRestaurant.contact.phone}">${currentRestaurant.contact.phone}</a></p>
        <p><strong>Website:</strong> <a href="${currentRestaurant.contact.website}" target="_blank" rel="noopener noreferrer">${currentRestaurant.contact.website}</a></p>
        <p><strong>Email:</strong> <a href="mailto:${currentRestaurant.contact.email}">${currentRestaurant.contact.email}</a></p>
    `;
    
    // Update map
    const mapContainer = document.getElementById('map-container');
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(currentRestaurant.location.address)}`;
    mapContainer.innerHTML = `<iframe src="${mapUrl}" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
    
    // Update directions link
    const directionsLink = document.getElementById('directions-link');
    directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentRestaurant.location.address)}`;
    
    // Update amenities
    const amenitiesList = document.getElementById('amenities-list');
    amenitiesList.innerHTML = currentRestaurant.amenities
        .map(amenity => `<li>${amenity}</li>`)
        .join('');
}

// Update reviews section
function updateReviews() {
    const container = document.getElementById('reviews-container');
    const sortSelect = document.getElementById('review-sort');
    const sortValue = sortSelect.value;
    
    // Sort reviews
    const sortedReviews = [...restaurantReviews].sort((a, b) => {
        switch (sortValue) {
            case 'recent':
                return new Date(b.date) - new Date(a.date);
            case 'highest':
                return b.rating - a.rating;
            case 'lowest':
                return a.rating - b.rating;
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });
    
    // Get current page reviews
    const start = (currentPage - 1) * reviewsPerPage;
    const end = start + reviewsPerPage;
    const pageReviews = sortedReviews.slice(start, end);
    
    // Update reviews display
    container.innerHTML = pageReviews.map(review => createReviewCard(review)).join('');
    
    // Update load more button visibility
    const loadMoreBtn = document.getElementById('load-more-reviews');
    loadMoreBtn.style.display = end < sortedReviews.length ? 'block' : 'none';
}

// Create review card HTML
function createReviewCard(review) {
    return `
        <div class="review-card" data-id="${review.id}">
            <div class="review-header">
                <div class="reviewer-info">
                    <span class="reviewer-name">${review.reviewer}</span>
                    <span class="reviewer-location">from ${review.city}</span>
                </div>
                <div class="review-meta">
                    <div class="rating">${createStarRating(review.rating)}</div>
                    <span class="review-date">${formatDate(review.date)}</span>
                </div>
            </div>
            <div class="review-content">
                <p class="review-text">${review.reviewText}</p>
                ${review.photos.length > 0 ? createPhotoGallery(review.photos) : ''}
            </div>
            <div class="review-footer">
                <button class="helpful-btn" onclick="markHelpful(${review.id})">
                    Helpful (${review.helpful})
                </button>
                ${review.disputed ? '<span class="disputed">Under Review</span>' : ''}
                <button class="report-btn" onclick="reportReview(${review.id})">
                    Report Review
                </button>
            </div>
        </div>
    `;
}

// Create photo gallery HTML
function createPhotoGallery(photos) {
    return `
        <div class="review-photos">
            ${photos.map(photo => `
                <img src="/images/reviews/${photo}" alt="Review photo" 
                     onclick="openPhotoModal(this.src)">
            `).join('')}
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Sort reviews
    const sortSelect = document.getElementById('review-sort');
    sortSelect.addEventListener('change', () => {
        currentPage = 1;
        updateReviews();
    });
    
    // Load more reviews
    const loadMoreBtn = document.getElementById('load-more-reviews');
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        updateReviews();
    });
}

// Helper function to create star rating HTML
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return `
        ${'★'.repeat(fullStars)}
        ${hasHalfStar ? '½' : ''}
        ${'☆'.repeat(emptyStars)}
    `;
}

// Helper function to format dates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show error message
function showError(message) {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="error-message">
            <h2>Oops!</h2>
            <p>${message}</p>
            <a href="/" class="button">Return to Homepage</a>
        </div>
    `;
}

// Mark review as helpful
function markHelpful(reviewId) {
    const review = restaurantReviews.find(r => r.id === reviewId);
    if (review) {
        review.helpful++;
        updateReviews();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeRestaurantPage); 