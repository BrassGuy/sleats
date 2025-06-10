// Array of all available images
const images = [
    'images/featured/BeerSample.jpg',
    'images/featured/FoodSample.jpg',
    'images/featured/FoodSample1.jpg',
    'images/featured/FoodSample3.jpg',
    'images/featured/FoodSample4.jpg',
    'images/featured/HikingSample1.jpeg',
    'images/featured/HikingSample2.jpg',
    'images/featured/HikingSample3.jpg',
    'images/featured/HikingSample4.jpg',
    'images/featured/SpiritsSample1.jpg',
    'images/featured/SpiritsSample2.jpg'
];

// Keep track of currently displayed images
let currentImages = {
    slot1: 'images/featured/BeerSample.jpg',
    slot2: 'images/featured/FoodSample.jpg',
    slot3: 'images/featured/FoodSample1.jpg'
};

// Track which slot is next to change
let currentSlotIndex = 1; // Start with slot1
let slideshowInterval = null;

// Function to get a random image that's not currently displayed
function getRandomNewImage() {
    const availableImages = images.filter(img => !Object.values(currentImages).includes(img));
    if (availableImages.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    return availableImages[randomIndex];
}

// Function to update an image with transition
function updateImage(slotId, newImage) {
    const slot = document.getElementById(slotId);
    if (!slot) return false;
    
    // Add fade-out class
    slot.classList.add('fade-out');
    
    // After fade out, update image and fade back in
    setTimeout(() => {
        slot.style.backgroundImage = `url('${newImage}')`;
        currentImages[slotId] = newImage;
        
        // Small delay before fading back in for smoother transition
        setTimeout(() => {
            slot.classList.remove('fade-out');
        }, 50);
    }, 1000);

    return true;
}

// Function to rotate images in sequence
function rotateSequentialImage() {
    const slotId = `slot${currentSlotIndex}`;
    const newImage = getRandomNewImage();
    
    if (newImage) {
        const success = updateImage(slotId, newImage);
        if (!success) {
            stopSlideshow();
            return;
        }
    }
    
    // Move to next slot, or back to first slot if we're at the end
    currentSlotIndex = currentSlotIndex === 3 ? 1 : currentSlotIndex + 1;
}

// Function to start slideshow
function startSlideshow() {
    // Check if elements exist before starting
    if (!document.getElementById('slot1') || 
        !document.getElementById('slot2') || 
        !document.getElementById('slot3')) {
        return;
    }

    // Clear any existing interval
    stopSlideshow();
    
    // Start new interval
    slideshowInterval = setInterval(rotateSequentialImage, 8000);
}

// Function to stop slideshow
function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
}

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only start slideshow if we're on desktop
    if (window.innerWidth > 768) {
        startSlideshow();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        startSlideshow();
    } else {
        stopSlideshow();
    }
}); 