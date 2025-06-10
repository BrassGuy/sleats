// Initialize submit review page
async function initializeSubmitReviewPage() {
    // Populate restaurant select
    const restaurantSelect = document.getElementById('restaurantSelect');
    if (restaurantSelect) {
        const options = restaurants
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(restaurant => `
                <option value="${restaurant.id}">${restaurant.name}</option>
            `).join('');
        
        restaurantSelect.innerHTML += options;
    }

    // Setup rating display
    const ratingInput = document.getElementById('rating');
    const ratingDisplay = document.querySelector('.rating-display');
    if (ratingInput && ratingDisplay) {
        const updateRatingDisplay = () => {
            ratingDisplay.innerHTML = createStarRating(parseInt(ratingInput.value));
        };
        
        ratingInput.addEventListener('input', updateRatingDisplay);
        updateRatingDisplay();
    }

    // Setup form submission
    const reviewForm = document.getElementById('submitReviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmission);
    }
}

// Handle review submission
async function handleReviewSubmission(e) {
    e.preventDefault();
    
    // Get selected restaurant
    const restaurantId = document.getElementById('restaurantSelect').value;
    if (!restaurantId) {
        alert('Please select a restaurant');
        return;
    }

    // Anti-spam check
    const antiSpamAnswer = e.target.antiSpam.value;
    if (antiSpamAnswer !== '5') {
        alert('Please correctly answer the anti-spam question.');
        return;
    }
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const statusDiv = document.getElementById('submitStatus');
    const originalBtnText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        await emailjs.send('service_nlgag72', 'template_lm6lh24', {
            reply_to: e.target.email.value,
            restaurant_name: restaurants.find(r => r.id === parseInt(restaurantId)).name,
            rating: parseInt(e.target.rating.value),
            review_text: e.target.reviewText.value,
            reviewer_name: e.target.reviewerName.value || 'Anonymous',
            city: e.target.city.value
        });
        
        statusDiv.textContent = 'Thank you! Your review has been submitted for moderation.';
        statusDiv.className = 'submit-status success';
        e.target.reset();
        
        // Reset rating display
        const ratingDisplay = document.querySelector('.rating-display');
        if (ratingDisplay) {
            ratingDisplay.innerHTML = createStarRating(5);
        }
    } catch (error) {
        console.error('EmailJS error:', error);
        statusDiv.textContent = 'Error submitting review. Please try again.';
        statusDiv.className = 'submit-status error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSubmitReviewPage); 