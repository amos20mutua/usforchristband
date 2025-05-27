import {
    getSongs,
    getGalleryImages,
    getProducts,
    getSettings,
    addAuditionRequest
} from './firebase-service.js';

// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenu.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        const icon = mobileMenu.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Load Site Settings
async function loadSiteSettings() {
    try {
        const settings = await getSettings();
        if (settings) {
            // Update site title
            if (settings.siteTitle) {
                document.title = settings.siteTitle;
            }
            
            // Update contact information
            const contactEmail = document.querySelector('.footer-section p:nth-child(1)');
            const phoneNumber = document.querySelector('.footer-section p:nth-child(2)');
            
            if (contactEmail) contactEmail.innerHTML = `<i class="fas fa-envelope"></i> ${settings.contactEmail || 'contact@u4cband.com'}`;
            if (phoneNumber) phoneNumber.innerHTML = `<i class="fas fa-phone"></i> ${settings.phoneNumber || '(555) 123-4567'}`;
            
            // Update social media links
            const socialLinks = document.querySelectorAll('.social-links a');
            if (socialLinks.length >= 4) {
                socialLinks[0].href = settings.facebookUrl || '#';
                socialLinks[1].href = settings.instagramUrl || '#';
                socialLinks[2].href = settings.youtubeUrl || '#';
                socialLinks[3].href = settings.spotifyUrl || '#';
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Load Music Content
async function loadMusicContent() {
    const musicGrid = document.getElementById('musicGrid');
    if (!musicGrid) return;

    try {
        const songs = await getSongs();
        if (songs.length === 0) {
            musicGrid.innerHTML = '<p class="no-content">No music available at the moment. Check back soon!</p>';
            return;
        }

        musicGrid.innerHTML = songs.map(song => `
            <div class="music-card">
                <div class="music-image">
                    <img src="${song.coverImage || 'assets/images/placeholder.jpg'}" alt="${song.title}">
                    <div class="music-overlay">
                        <button class="play-btn"><i class="fas fa-play"></i></button>
                    </div>
                </div>
                <h3>${song.title}</h3>
                <p>${song.description}</p>
                <div class="streaming-links">
                    ${song.spotifyLink ? `<a href="${song.spotifyLink}" target="_blank"><i class="fab fa-spotify"></i></a>` : ''}
                    ${song.appleLink ? `<a href="${song.appleLink}" target="_blank"><i class="fab fa-apple"></i></a>` : ''}
                    ${song.youtubeLink ? `<a href="${song.youtubeLink}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading music:', error);
        musicGrid.innerHTML = '<p class="error">Error loading music. Please try again later.</p>';
    }
}

// Load Gallery Content
async function loadGalleryContent() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    try {
        const images = await getGalleryImages();
        if (images.length === 0) {
            galleryGrid.innerHTML = '<p class="no-content">No images available at the moment. Check back soon!</p>';
            return;
        }

        galleryGrid.innerHTML = images.map(image => `
            <div class="gallery-item">
                <img src="${image.url}" alt="${image.title}">
                <div class="gallery-caption">
                    <h3>${image.title}</h3>
                    <p>${image.description || ''}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading gallery:', error);
        galleryGrid.innerHTML = '<p class="error">Error loading gallery. Please try again later.</p>';
    }
}

// Load Merchandise Content
async function loadMerchandiseContent() {
    const merchGrid = document.getElementById('merchGrid');
    if (!merchGrid) return;

    try {
        const products = await getProducts();
        if (products.length === 0) {
            merchGrid.innerHTML = '<p class="no-content">No merchandise available at the moment. Check back soon!</p>';
            return;
        }

        merchGrid.innerHTML = products.map(product => `
            <div class="merch-item" data-category="${product.category}">
                <div class="merch-image">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <div class="merch-overlay">
                        <button class="quick-view-btn">Quick View</button>
                    </div>
                </div>
                <div class="merch-info">
                    <h3>${product.name}</h3>
                    <p class="merch-price">$${product.price.toFixed(2)}</p>
                    ${product.colors && product.colors.length > 0 ? `
                        <div class="merch-colors">
                            ${product.colors.map(color => `
                                <span class="color-option" style="background-color: ${color};"></span>
                            `).join('')}
                        </div>
                    ` : ''}
                    <button class="add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading merchandise:', error);
        merchGrid.innerHTML = '<p class="error">Error loading merchandise. Please try again later.</p>';
    }
}

// Handle Auditions Visibility
function handleAuditionsVisibility() {
    const auditionsLink = document.querySelector('.auditions-link');
    if (auditionsLink) {
        const isEnabled = localStorage.getItem('auditionsEnabled') === 'true';
        auditionsLink.style.display = isEnabled ? 'inline-block' : 'none';
    }
}

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        // Here you would typically send this to your backend
        alert('Thank you for subscribing!');
        newsletterForm.reset();
    });
}

// Audition form submission
const auditionForm = document.querySelector('.audition-form');
if (auditionForm) {
    auditionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(auditionForm);
        const auditionData = {
            name: formData.get('name'),
            email: formData.get('email'),
            instrument: formData.get('instrument'),
            experience: formData.get('experience'),
            message: formData.get('message'),
            status: 'pending'
        };

        try {
            await addAuditionRequest(auditionData);
            auditionForm.reset();
            alert('Your audition request has been submitted successfully!');
        } catch (error) {
            console.error('Error submitting audition:', error);
            alert('Error submitting audition request. Please try again.');
        }
    });
}

// Video background controls
const heroVideo = document.getElementById('hero-video');
const muteBtn = document.getElementById('muteBtn');
const qualityBtn = document.getElementById('qualityBtn');
let isMuted = true;

if (heroVideo && muteBtn) {
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        heroVideo.muted = isMuted;
        muteBtn.innerHTML = isMuted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadSiteSettings();
    await loadMusicContent();
    await loadGalleryContent();
    await loadMerchandiseContent();
    handleAuditionsVisibility();
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements with animation classes
document.querySelectorAll('.featured-item, .value-item, .release-content, .mission-values').forEach(el => {
    observer.observe(el);
});

// Video background fallback
const videoBackground = document.querySelector('.video-background video');
if (videoBackground) {
    videoBackground.addEventListener('error', () => {
        videoBackground.style.display = 'none';
        document.querySelector('.overlay').style.background = 'var(--gradient-overlay)';
    });
}

// Add loading animation to buttons
document.querySelectorAll('.cta-button, .submit-button').forEach(button => {
    button.addEventListener('click', function(e) {
        if (!this.classList.contains('loading')) {
            this.classList.add('loading');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            // Simulate loading (remove in production)
            setTimeout(() => {
                this.classList.remove('loading');
                this.innerHTML = this.getAttribute('data-original-text') || this.textContent;
            }, 1000);
        }
    });
});

// Video Placeholder Click Handler
document.querySelectorAll('.video-placeholder').forEach(placeholder => {
    placeholder.addEventListener('click', () => {
        // In a real application, this would open the video
        alert('Video player will be implemented here');
    });
});

// Gallery Image Click Handler
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        // In a real application, this would open a lightbox
        alert('Image viewer will be implemented here');
    });
});

// Quality menu toggle
qualityBtn.addEventListener('click', () => {
    const qualityMenu = document.querySelector('.quality-menu');
    qualityMenu.classList.toggle('active');
});

// Quality selection
document.querySelector('.quality-menu').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const quality = e.target.dataset.quality;
        // In a real implementation, you would switch video sources here
        const qualityMenu = document.querySelector('.quality-menu');
        qualityMenu.classList.remove('active');
    }
});

// Close quality menu when clicking outside
document.addEventListener('click', (e) => {
    const qualityBtn = document.getElementById('qualityBtn');
    if (!qualityBtn.contains(e.target) && !document.querySelector('.quality-menu').contains(e.target)) {
        const qualityMenu = document.querySelector('.quality-menu');
        qualityMenu.classList.remove('active');
    }
});

// Video loading optimization
heroVideo.addEventListener('loadeddata', () => {
    heroVideo.style.opacity = '1';
});

// Fallback for video loading
heroVideo.addEventListener('error', () => {
    console.error('Error loading video');
    heroVideo.style.display = 'none';
    document.querySelector('.overlay').style.background = 'var(--gradient-overlay)';
});

// Merchandise Category Filtering
const categoryBtns = document.querySelectorAll('.category-btn');
const merchItems = document.querySelectorAll('.merch-item');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const category = btn.dataset.category;

        merchItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Quick View Functionality
const quickViewBtns = document.querySelectorAll('.quick-view-btn');
quickViewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const merchItem = btn.closest('.merch-item');
        const productName = merchItem.querySelector('h3').textContent;
        const productPrice = merchItem.querySelector('.merch-price').textContent;
        
        // Here you would typically show a modal with more product details
        alert(`Quick View: ${productName} - ${productPrice}`);
    });
});

// Add to Cart Functionality
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const merchItem = btn.closest('.merch-item');
        const productName = merchItem.querySelector('h3').textContent;
        
        // Here you would typically add the item to a shopping cart
        btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
        setTimeout(() => {
            btn.innerHTML = 'Add to Cart';
        }, 2000);
    });
});

// Color Selection
const colorOptions = document.querySelectorAll('.color-option');
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        const merchItem = option.closest('.merch-item');
        const allOptions = merchItem.querySelectorAll('.color-option');
        allOptions.forEach(opt => opt.style.border = '2px solid var(--border-color)');
        option.style.border = '2px solid var(--accent-color)';
    });
}); 