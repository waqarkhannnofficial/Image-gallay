// ========== Gallery State Management ==========
let currentImageIndex = 0;
let currentFilter = 'all';
let visibleImages = [];

// ========== DOM Elements ==========
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCategory = document.getElementById('lightboxCategory');
const imageCounter = document.getElementById('imageCounter');
const closeBtn = document.getElementById('closeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// ========== Initialize Gallery ==========
function initGallery() {
    updateVisibleImages();
    attachGalleryItemListeners();
    attachFilterListeners();
    attachLightboxListeners();
    attachKeyboardListeners();
}

// ========== Update Visible Images ==========
function updateVisibleImages() {
    visibleImages = [];
    galleryItems.forEach((item, index) => {
        const category = item.getAttribute('data-category');
        if (currentFilter === 'all' || category === currentFilter) {
            item.classList.remove('hide');
            item.classList.add('show');
            item.style.display = 'block';
            visibleImages.push(item);
        } else {
            item.classList.add('hide');
            item.classList.remove('show');
            // Hide after animation
            setTimeout(() => {
                if (item.classList.contains('hide')) {
                    item.style.display = 'none';
                }
            }, 500);
        }
    });
}

// ========== Gallery Item Click Handlers ==========
function attachGalleryItemListeners() {
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const visibleIndex = visibleImages.indexOf(item);
            if (visibleIndex !== -1) {
                openLightbox(visibleIndex);
            }
        });
    });
}

// ========== Filter Button Handlers ==========
function attachFilterListeners() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter and gallery
            currentFilter = btn.getAttribute('data-filter');
            updateVisibleImages();
            
            // Add ripple effect
            createRipple(btn, event);
        });
    });
}

// ========== Ripple Effect for Buttons ==========
function createRipple(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ========== Lightbox Functions ==========
function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

function updateLightboxContent() {
    if (visibleImages.length === 0) return;
    
    const currentItem = visibleImages[currentImageIndex];
    const img = currentItem.querySelector('img');
    const title = currentItem.querySelector('.overlay-content h3').textContent;
    const category = currentItem.querySelector('.overlay-content p').textContent;
    
    // Update image with fade effect
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = title;
        lightboxCategory.textContent = category;
        imageCounter.textContent = `${currentImageIndex + 1} / ${visibleImages.length}`;
        lightboxImg.style.opacity = '1';
    }, 150);
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
    updateLightboxContent();
    animateNavigation('next');
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
    updateLightboxContent();
    animateNavigation('prev');
}

function animateNavigation(direction) {
    const content = document.querySelector('.lightbox-content');
    content.style.animation = 'none';
    setTimeout(() => {
        content.style.animation = 'zoomIn 0.3s ease';
    }, 10);
}

// ========== Lightbox Event Listeners ==========
function attachLightboxListeners() {
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNextImage);
    prevBtn.addEventListener('click', showPrevImage);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Prevent closing when clicking on image
    const lightboxContent = document.querySelector('.lightbox-content');
    lightboxContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// ========== Keyboard Navigation ==========
function attachKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
        }
    });
}

// ========== Touch/Swipe Support ==========
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        showNextImage();
    }
    if (touchEndX > touchStartX + 50) {
        showPrevImage();
    }
}

lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

// ========== Image Lazy Loading ==========
function lazyLoadImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src; // Trigger loading
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    const images = document.querySelectorAll('.gallery-item img');
    images.forEach(img => imageObserver.observe(img));
}

// ========== Smooth Scroll Animation ==========
function addScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.5s ease forwards';
            }
        });
    }, {
        threshold: 0.1
    });
    
    galleryItems.forEach(item => {
        observer.observe(item);
    });
}

// ========== Preload Adjacent Images ==========
function preloadAdjacentImages() {
    if (visibleImages.length === 0) return;
    
    const nextIndex = (currentImageIndex + 1) % visibleImages.length;
    const prevIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
    
    const nextImg = new Image();
    const prevImg = new Image();
    
    nextImg.src = visibleImages[nextIndex].querySelector('img').src;
    prevImg.src = visibleImages[prevIndex].querySelector('img').src;
}

// ========== Initialize Everything ==========
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    lazyLoadImages();
    addScrollAnimation();
    
    // Add smooth entrance animation
    setTimeout(() => {
        document.querySelector('.container').style.animation = 'fadeIn 0.5s ease';
    }, 100);
});

// ========== Performance Optimization ==========
// Debounce resize events
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        updateVisibleImages();
    }, 250);
});

// ========== Console Welcome Message ==========
console.log('%c🎨 Modern Image Gallery', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%c✨ Features: Lightbox, Filtering, Responsive Design, Keyboard Navigation', 'font-size: 12px; color: #8b5cf6;');
console.log('%c⌨️ Keyboard shortcuts: Arrow keys (navigate), Escape (close)', 'font-size: 12px; color: #6b7280;');

