// Global state
let isScrolling = false;
let scrollTimeout;
let isMobile = window.innerWidth <= 768;
let lastTouchY = 0;
let touchStartTime = 0;
let currentSectionIndex = 0;
let lastScrollTimeout;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupScrollToTop();
    setupNavigation();
    handleMobileLayout();
    initSlideshow();
    if (!isMobile) {
        setupScrolling();
        setupArrowNavigation();
    }

    // Scroll reveal animation
    const listItems = document.querySelectorAll('.list-item');
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    listItems.forEach(item => {
        observer.observe(item);
    });

    // Scroll to top functionality
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopButton.classList.add('visible');
        } else {
            scrollToTopButton.classList.remove('visible');
        }
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== isMobile) {
        handleMobileLayout();
        if (!isMobile) {
            setupScrolling();
            setupArrowNavigation();
        }
    }
});

// Setup mobile-specific navigation
function setupMobileNavigation() {
    const nav = document.querySelector('.main-nav');
    let lastScroll = 0;
    
    // Hide/show nav on scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 50) {
            // Scrolling down - hide nav
            nav.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show nav
            nav.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// Setup mobile interactions
function setupMobileInteractions() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Handle smooth scrolling to sections
    function smoothScrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        const targetPosition = targetSection.offsetTop - 60; // Adjust for nav height
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // Handle navigation clicks
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href').substring(1);
            smoothScrollToSection(targetId);
        });
    });

    // Add touch feedback
    const interactiveElements = document.querySelectorAll('.category-item, .tag, button, .nav-links a');
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', () => {
            element.classList.add('active');
        }, { passive: true });
        
        ['touchend', 'touchcancel'].forEach(event => {
            element.addEventListener(event, () => {
                element.classList.remove('active');
            }, { passive: true });
        });
    });
}

// Handle mobile layout
function handleMobileLayout() {
    const sections = document.querySelectorAll('.section');
    
    if (isMobile) {
        sections.forEach(section => {
            // Ensure proper height on mobile
            section.style.minHeight = `${window.innerHeight}px`;
        });
        setupMobileInteractions();
        setupMobileNavigation();
    } else {
        sections.forEach(section => {
            section.style.minHeight = '100vh';
        });
    }
}

// Setup category groups
function setupCategoryGroups() {
    const categoryGroups = document.querySelectorAll('.category-group');
    
    categoryGroups.forEach(group => {
        const header = group.querySelector('.category-group-title');
        const content = group.querySelector('.category-wrapper');
        
        // Add expand/collapse functionality
        header.addEventListener('click', () => {
            const isExpanded = content.style.maxHeight;
            
            if (!isExpanded) {
                content.style.maxHeight = content.scrollHeight + 'px';
                header.classList.add('expanded');
            } else {
                content.style.maxHeight = null;
                header.classList.remove('expanded');
            }
        });
    });
}

// Setup scrolling (desktop only)
function setupScrolling() {
    if (isMobile) return;

    const main = document.querySelector('main');
    const sections = document.querySelectorAll('.section');
    const arrows = document.querySelectorAll('.scroll-arrow');
    const dots = document.querySelectorAll('.progress-dot');
    
    // Set initial state
    let currentSectionIndex = 0;
    let isScrolling = false;
    
    // Initialize first section as active
    updateActiveSection(currentSectionIndex);
    
    // Function to update active section
    function updateActiveSection(index) {
        if (index < 0 || index >= sections.length) return;
        
        sections.forEach((section, i) => {
            section.classList.toggle('active', i === index);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Update navigation transparency
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            if (index === 0) {
                mainNav.classList.add('transparent');
            } else {
                mainNav.classList.remove('transparent');
            }
        }

        currentSectionIndex = index;
        
        // Update arrow visibility
        arrows.forEach(arrow => {
            const direction = arrow.classList.contains('left') ? -1 : 1;
            const targetIndex = currentSectionIndex + direction;
            arrow.style.visibility = targetIndex >= 0 && targetIndex < sections.length ? 'visible' : 'hidden';
        });
    }

    // Function to handle scrolling to a section
    function scrollToSection(index) {
        if (isScrolling || index < 0 || index >= sections.length) return;
        
        isScrolling = true;
        const targetSection = sections[index];
        const scrollLeft = targetSection.offsetLeft;
        
        main.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
        
        updateActiveSection(index);
        
        // Reset scrolling flag after animation
        setTimeout(() => {
            isScrolling = false;
        }, 600);
    }

    // Handle mouse wheel scrolling with debounce
    let wheelTimeout;
    main.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        if (isScrolling) return;
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            const direction = e.deltaY > 0 ? 1 : -1;
            const nextIndex = currentSectionIndex + direction;
            
            if (nextIndex >= 0 && nextIndex < sections.length) {
                scrollToSection(nextIndex);
            }
        }, 50);
    }, { passive: false });

    // Handle arrow clicks
    arrows.forEach(arrow => {
        arrow.addEventListener('click', () => {
            if (isScrolling) return;
            
            const direction = arrow.classList.contains('left') ? -1 : 1;
            const nextIndex = currentSectionIndex + direction;
            
            if (nextIndex >= 0 && nextIndex < sections.length) {
                scrollToSection(nextIndex);
            }
        });
    });

    // Handle dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (isScrolling || currentSectionIndex === index) return;
            scrollToSection(index);
        });
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        
        let direction = 0;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            direction = 1;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            direction = -1;
        }
        
        if (direction !== 0) {
            e.preventDefault();
            const nextIndex = currentSectionIndex + direction;
            if (nextIndex >= 0 && nextIndex < sections.length) {
                scrollToSection(nextIndex);
            }
        }
    });
}

// Display error message
function displayError(message) {
    const container = document.querySelector('main');
    if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>Oops! Something went wrong</h2>
            <p>${message}</p>
            <button onclick="location.reload()">Refresh Page</button>
        `;
        container.insertBefore(errorDiv, container.firstChild);
    }
}

// Slideshow functionality
function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) {
        console.warn('No slides found for slideshow');
        return;
    }
    
    let currentSlide = 0;
    let slideshowInterval;

    // Show first slide initially
    slides[0].classList.add('active');

    function showNextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        
        // Move to next slide
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
    }

    // Clear any existing interval
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }

    // Start new interval
    slideshowInterval = setInterval(showNextSlide, 5000);

    // Clean up on page unload
    window.addEventListener('unload', () => {
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
        }
    });
}

// Setup navigation
function setupNavigation() {
    // Handle all navigation links including category tags
    document.querySelectorAll('.nav-links a, .category-tags .tag').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href') || 
                           '#' + link.textContent.toLowerCase().trim();
            
            const targetSection = document.getElementById(targetId.substring(1));
            if (!targetSection) return;

            if (isMobile) {
                // For mobile, find the corresponding mobile section
                const mobileTargetId = targetId.substring(1) + '-mobile';
                const mobileSection = document.getElementById(mobileTargetId);
                
                if (mobileSection) {
                    const mobileContent = document.querySelector('.mobile-content');
                    const allMobileSections = document.querySelectorAll('.mobile-section');
                    const sectionIndex = Array.from(allMobileSections).indexOf(mobileSection);
                    
                    if (sectionIndex !== -1) {
                        mobileContent.scrollTo({
                            left: sectionIndex * window.innerWidth,
                            behavior: 'smooth'
                        });

                        // Update mobile dots
                        document.querySelectorAll('.mobile-scroll-dot').forEach((dot, index) => {
                            dot.classList.toggle('active', index === sectionIndex);
                        });
                    }
                }
            } else {
                // For desktop, scroll to the section
                const main = document.querySelector('main');
                const allSections = document.querySelectorAll('.section');
                const sectionIndex = Array.from(allSections).indexOf(targetSection);
                
                if (sectionIndex !== -1) {
                    main.scrollTo({
                        left: targetSection.offsetLeft,
                        behavior: 'smooth'
                    });

                    // Update section states
                    allSections.forEach((section, index) => {
                        section.classList.toggle('active', index === sectionIndex);
                    });

                    // Update progress dots
                    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
                        dot.classList.toggle('active', index === sectionIndex);
                    });

                    // Update nav transparency
                    const mainNav = document.querySelector('.main-nav');
                    if (mainNav) {
                        mainNav.classList.toggle('transparent', sectionIndex === 0);
                    }
                }
            }
        });
    });
}

// Setup scroll to top functionality
function setupScrollToTop() {
    if (!isMobile) return; // Only run in mobile mode
    
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (!scrollToTopBtn) return; // Exit if button doesn't exist
    
    let lastScrollPosition = 0;
    let scrollTimeout;

    // Show/hide button based on scroll position
    function toggleScrollButton() {
        const currentScroll = window.pageYOffset;
        
        // Show button when scrolled down 100px
        if (currentScroll > 100) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }

        lastScrollPosition = currentScroll;
    }

    // Throttle scroll event
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                toggleScrollButton();
                scrollTimeout = null;
            }, 100);
        }
    });

    // Scroll to top with smooth animation
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Handle touch events for better mobile interaction
    scrollToTopBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Setup arrow navigation for desktop
function setupArrowNavigation() {
    const sections = document.querySelectorAll('.section');
    const prevArrow = document.querySelector('.nav-arrow.prev');
    const nextArrow = document.querySelector('.nav-arrow.next');
    
    // Function to scroll to a specific section
    function scrollToSection(index) {
        if (isScrolling || index < 0 || index >= sections.length) return;
        
        isScrolling = true;
        currentSectionIndex = index;
        
        // Update arrow visibility
        updateArrowVisibility();
        
        // Scroll to the section
        sections[index].scrollIntoView({ behavior: 'smooth' });
        
        // Reset scrolling flag after animation
        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }
    
    // Update arrow visibility based on current section
    function updateArrowVisibility() {
        if (prevArrow && nextArrow) {
            prevArrow.style.opacity = currentSectionIndex === 0 ? '0' : '0.7';
            prevArrow.style.pointerEvents = currentSectionIndex === 0 ? 'none' : 'auto';
            
            nextArrow.style.opacity = currentSectionIndex === sections.length - 1 ? '0' : '0.7';
            nextArrow.style.pointerEvents = currentSectionIndex === sections.length - 1 ? 'none' : 'auto';
        }
    }
    
    // Handle arrow clicks
    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            if (!isScrolling && currentSectionIndex > 0) {
                scrollToSection(currentSectionIndex - 1);
            }
        });
    }
    
    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            if (!isScrolling && currentSectionIndex < sections.length - 1) {
                scrollToSection(currentSectionIndex + 1);
            }
        });
    }
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            if (currentSectionIndex > 0) {
                scrollToSection(currentSectionIndex - 1);
            }
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            if (currentSectionIndex < sections.length - 1) {
                scrollToSection(currentSectionIndex + 1);
            }
        }
    });
    
    // Set initial arrow visibility
    updateArrowVisibility();
    
    // Update section index on scroll
    window.addEventListener('scroll', () => {
        if (isScrolling) return;
        
        const viewportMiddle = window.innerHeight / 2;
        
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionMiddle = rect.top + rect.height / 2;
            
            if (Math.abs(sectionMiddle - viewportMiddle) < rect.height / 2) {
                currentSectionIndex = index;
                updateArrowVisibility();
            }
        });
    });
}