let currentPage = 1;
const reviewsPerPage = 10;

// Initialize reviews page
async function initializeReviewsPage() {
    const sortSelect = document.getElementById('review-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }

    const loadMoreBtn = document.getElementById('load-more-reviews');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreReviews);
    }

    await displayReviews();
}

// Display reviews based on current sort and page
async function displayReviews() {
    const sortSelect = document.getElementById('review-sort');
    const sortValue = sortSelect ? sortSelect.value : 'recent';
    
    // Sort reviews
    const sortedReviews = [...reviews].sort((a, b) => {
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
    const start = 0;
    const end = currentPage * reviewsPerPage;
    const pageReviews = sortedReviews.slice(start, end);
    
    // Update reviews display
    const container = document.querySelector('.recent-reviews');
    if (container) {
        container.innerHTML = pageReviews.map(review => {
            const restaurant = restaurants.find(r => r.id === review.restaurantId);
            return createReviewCard(review, restaurant);
        }).join('');
    }
    
    // Update load more button visibility
    const loadMoreBtn = document.getElementById('load-more-reviews');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = end < sortedReviews.length ? 'block' : 'none';
    }
}

// Handle sort change
function handleSortChange() {
    currentPage = 1;
    displayReviews();
}

// Load more reviews
function loadMoreReviews() {
    currentPage++;
    displayReviews();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeReviewsPage); 