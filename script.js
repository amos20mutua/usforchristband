import {
    getSongs,
    getGalleryImages,
    getProducts,
    getSettings,
    addAuditionRequest,
    getEvents
} from './firebase-service.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Sidebar toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const navMenu = document.getElementById('navMenu');
    const body = document.body;

    if (sidebarToggle && navMenu) {
        // Toggle sidebar
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            sidebarToggle.classList.toggle('active');
            body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                sidebarToggle.classList.remove('active');
                body.style.overflow = '';
            }
        });

        // Close sidebar when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                sidebarToggle.classList.remove('active');
                body.style.overflow = '';
            });
        });

        // Close sidebar when pressing escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                sidebarToggle.classList.remove('active');
                body.style.overflow = '';
            }
        });
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

            // Update hero video if available
            const heroVideo = document.getElementById('hero-video');
            if (heroVideo && settings.heroVideo) {
                // Update video sources
                const mp4Source = heroVideo.querySelector('source[type="video/mp4"]');
                const webmSource = heroVideo.querySelector('source[type="video/webm"]');
                
                if (mp4Source) mp4Source.src = settings.heroVideo.mp4Url || 'assets/videos/hero-background.mp4';
                if (webmSource) webmSource.src = settings.heroVideo.webmUrl || 'assets/videos/hero-background.webm';
                
                // Reload video
                heroVideo.load();
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Load Hero Content
async function loadHeroContent() {
    const heroContent = document.getElementById('heroContent');
    if (!heroContent) return;

    // Video background controls
    const heroVideo = document.getElementById('hero-video');
    const muteBtn = document.getElementById('muteBtn');
    let isMuted = true;

    if (heroVideo && muteBtn) {
        // Mute toggle
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            heroVideo.muted = isMuted;
            muteBtn.innerHTML = isMuted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
            muteBtn.setAttribute('aria-label', isMuted ? 'Unmute video' : 'Mute video');
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
    // Mute toggle
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        heroVideo.muted = isMuted;
        muteBtn.innerHTML = isMuted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
        muteBtn.setAttribute('aria-label', isMuted ? 'Unmute video' : 'Mute video');
    });

    // Quality menu
    qualityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const qualityMenu = document.querySelector('.quality-menu');
        qualityMenu.classList.toggle('active');
    });

    // Quality selection
    document.querySelector('.quality-menu').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const quality = e.target.dataset.quality;
            const currentTime = heroVideo.currentTime;
            const isPaused = heroVideo.paused;
            
            // Update video source based on quality
            const videoSources = {
                'auto': 'assets/videos/hero-background.mp4',
                '1080p': 'assets/videos/hero-background-1080p.mp4',
                '720p': 'assets/videos/hero-background-720p.mp4',
                '480p': 'assets/videos/hero-background-480p.mp4'
            };

            heroVideo.src = videoSources[quality];
            heroVideo.currentTime = currentTime;
            if (!isPaused) heroVideo.play();
            
            // Update UI
            document.querySelector('.quality-menu').classList.remove('active');
            qualityBtn.innerHTML = `<i class="fas fa-cog"></i> ${quality}`;
        }
    });

    // Close quality menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!qualityBtn.contains(e.target) && !document.querySelector('.quality-menu').contains(e.target)) {
            document.querySelector('.quality-menu').classList.remove('active');
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
}

// Load Latest Release
async function loadLatestRelease() {
    const latestReleaseContent = document.getElementById('latestReleaseContent');
    if (!latestReleaseContent) return;

    try {
        const settings = await getSettings();
        if (settings && settings.latestRelease) {
            const { title, description, streamingLinks } = settings.latestRelease;
            
            const releaseHTML = `
                <h3>${title}</h3>
                <p>${description}</p>
                <div class="streaming-links">
                    ${Object.entries(streamingLinks).map(([platform, url]) => `
                        <a href="${url}" class="stream-link" target="_blank" rel="noopener">
                            <i class="fab fa-${platform.toLowerCase()}"></i>
                            ${platform}
                        </a>
                    `).join('')}
                </div>
            `;
            
            latestReleaseContent.innerHTML = releaseHTML;
        } else {
            latestReleaseContent.innerHTML = `
                <h3>Coming Soon</h3>
                <p>Our newest worship single is coming soon</p>
            `;
        }
    } catch (error) {
        console.error('Error loading latest release:', error);
        latestReleaseContent.innerHTML = `
            <h3>Coming Soon</h3>
            <p>Our newest worship single is coming soon</p>
        `;
    }
}

// Initialize page content
document.addEventListener('DOMContentLoaded', async () => {
    await loadSiteSettings();
    await loadLatestRelease();
    await loadHeroContent();
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
        
        // Here you would typically add the item to a shopping carts
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

// File Upload Handling
function initializeFileUploads() {
    const fileContainers = document.querySelectorAll('.file-upload-container');
    
    fileContainers.forEach(container => {
        const input = container.querySelector('.file-input');
        const info = container.querySelector('.file-upload-info');
        
        // Handle file selection
        input.addEventListener('change', (e) => {
            handleFileSelect(e, container, info);
        });
        
        // Handle drag and drop
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('dragover');
        });
        
        container.addEventListener('dragleave', () => {
            container.classList.remove('dragover');
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('dragover');
            input.files = e.dataTransfer.files;
            handleFileSelect(e, container, info);
        });
    });
}

function handleFileSelect(event, container, info) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size
    const maxSize = parseInt(container.dataset.maxSize);
    if (file.size > maxSize) {
        showError(container, `File size exceeds ${formatFileSize(maxSize)}`);
        return;
    }
    
    // Validate file type
    const allowedTypes = container.dataset.allowedTypes.split(',');
    if (!allowedTypes.includes(file.type)) {
        showError(container, 'Invalid file type');
        return;
    }
    
    // Update UI
    container.classList.add('has-file');
    container.classList.remove('error');
    
    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = file.name;
    
    // Remove existing file name if any
    const existingFileName = container.querySelector('.file-name');
    if (existingFileName) {
        existingFileName.remove();
    }
    
    container.appendChild(fileName);
}

function showError(container, message) {
    container.classList.add('error');
    container.classList.remove('has-file');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    // Remove existing error message if any
    const existingError = container.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    container.appendChild(errorMessage);
    
    // Clear the file input
    const input = container.querySelector('.file-input');
    input.value = '';
    
    // Remove error message after 3 seconds
    setTimeout(() => {
        errorMessage.remove();
        container.classList.remove('error');
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Form Submission
function handleAuditionFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const files = {
        video: form.querySelector('#videoUpload').files[0],
        audio: form.querySelector('#audioUpload').files[0],
        sheetMusic: form.querySelector('#sheetMusicUpload').files[0]
    };
    
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    
    // Upload files to Firebase Storage
    uploadFiles(files)
        .then(fileUrls => {
            // Add file URLs to form data
            const formData = new FormData(form);
            Object.entries(fileUrls).forEach(([key, url]) => {
                formData.append(key + 'Url', url);
            });
            
            // Submit form data to Firebase
            return submitAuditionForm(formData);
        })
        .then(() => {
            showSuccess('Your audition has been submitted successfully!');
            form.reset();
            // Reset file upload containers
            document.querySelectorAll('.file-upload-container').forEach(container => {
                container.classList.remove('has-file');
                const fileName = container.querySelector('.file-name');
                if (fileName) fileName.remove();
            });
        })
        .catch(error => {
            showError(form, 'Failed to submit audition. Please try again.');
            console.error('Error submitting audition:', error);
        })
        .finally(() => {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        });
}

async function uploadFiles(files) {
    const fileUrls = {};
    
    for (const [key, file] of Object.entries(files)) {
        if (file) {
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`auditions/${Date.now()}_${file.name}`);
            
            try {
                const snapshot = await fileRef.put(file);
                fileUrls[key] = await snapshot.ref.getDownloadURL();
            } catch (error) {
                console.error(`Error uploading ${key}:`, error);
                throw new Error(`Failed to upload ${key}`);
            }
        }
    }
    
    return fileUrls;
}

async function submitAuditionForm(formData) {
    const auditionData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        instrument: formData.get('instrument'),
        experience: formData.get('experience'),
        availability: formData.get('availability'),
        videoUrl: formData.get('videoUrl'),
        audioUrl: formData.get('audioUrl'),
        sheetMusicUrl: formData.get('sheetMusicUrl'),
        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await firebase.firestore().collection('auditions').add(auditionData);
    } catch (error) {
        console.error('Error submitting audition data:', error);
        throw new Error('Failed to submit audition data');
    }
}

// Initialize file uploads when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeFileUploads();
    
    const auditionForm = document.querySelector('#auditionForm');
    if (auditionForm) {
        auditionForm.addEventListener('submit', handleAuditionFormSubmit);
    }
});

// Load events if on events page
const eventGrid = document.getElementById("eventGrid");
if (eventGrid) {
    loadEvents();
}

async function loadEvents() {
    try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const events = [];
        
        eventsSnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });

        // Sort events by date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (events.length === 0) {
            eventGrid.innerHTML = '<div class="no-events">No upcoming events at this time.</div>';
            return;
        }

        eventGrid.innerHTML = events.map(event => {
            const date = new Date(event.date);
            const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
            const day = date.getDate();
            
            return `
                <div class="event-card">
                    <div class="event-date">
                        <span class="month">${month}</span>
                        <span class="day">${day}</span>
                    </div>
                    <div class="event-details">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <p class="location">
                            <i class="fas fa-map-marker-alt"></i> ${event.location}
                            <br>
                            <i class="fas fa-clock"></i> ${event.time}
                        </p>
                        ${event.type ? `<span class="event-type">${event.type}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error("Error loading events:", error);
        eventGrid.innerHTML = '<div class="error">Error loading events. Please try again later.</div>';
    }
}

// Check auth state for auditions link
onAuthStateChanged(auth, (user) => {
    const auditionsLink = document.querySelector('.auditions-link');
    if (auditionsLink) {
        auditionsLink.classList.toggle('hidden', !user);
    }
});

// Video Management
function initializeVideo() {
    if (!heroVideo) return;

    // Set initial state
    heroVideo.muted = true;
    updateMuteButton();

    // Add event listeners
    heroVideo.addEventListener('loadeddata', () => {
        heroVideo.style.opacity = '1';
    });

    heroVideo.addEventListener('error', (e) => {
        console.error('Error loading video:', e);
        // Fallback to static background
        document.querySelector('.video-background').style.background = 'var(--primary-color)';
    });

    // Handle video loading
    const videoSources = heroVideo.querySelectorAll('source');
    videoSources.forEach(source => {
        source.addEventListener('error', () => {
            console.warn(`Failed to load video source: ${source.src}`);
        });
    });
}

// Mute Button Management
function updateMuteButton() {
    if (!muteBtn || !heroVideo) return;
    
    const icon = muteBtn.querySelector('i');
    if (heroVideo.muted) {
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
    } else {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
    }
}

// Event Listeners
function setupEventListeners() {
    // Mute button click
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (heroVideo) {
                heroVideo.muted = !heroVideo.muted;
                updateMuteButton();
            }
        });
    }

    // Scroll indicator click
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const latestRelease = document.querySelector('.latest-release');
            if (latestRelease) {
                latestRelease.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    // Observe elements for animation
    document.querySelectorAll('.featured-item, .value-item, .release-content').forEach(el => {
        observer.observe(el);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeVideo();
    setupEventListeners();
    loadLatestRelease();
    loadSiteSettings();
});

// Load website content
async function loadWebsiteContent() {
    try {
        // Load settings
        const settings = await getSettings();
        updateWebsiteSettings(settings);

        // Load latest release
        const latestRelease = document.getElementById('latestReleaseContent');
        if (latestRelease) {
            const songs = await getSongs();
            if (songs.length > 0) {
                const latest = songs[0];
                latestRelease.innerHTML = `
                    <h3>${latest.title}</h3>
                    <p>${latest.artist}</p>
                    <div class="release-actions">
                        <a href="${latest.streamingLinks?.spotify || '#'}" class="streaming-link" target="_blank">
                            <i class="fab fa-spotify"></i> Spotify
                        </a>
                        <a href="${latest.streamingLinks?.youtube || '#'}" class="streaming-link" target="_blank">
                            <i class="fab fa-youtube"></i> YouTube
                        </a>
                    </div>
                `;
            }
        }

        // Load gallery images
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid) {
            const images = await getGalleryImages();
            galleryGrid.innerHTML = images.map(image => `
                <div class="gallery-item">
                    <img src="${image.imageUrl}" alt="${image.title}" loading="lazy">
                    <div class="image-overlay">
                        <h3>${image.title}</h3>
                        <p>${image.description || ''}</p>
                    </div>
                </div>
            `).join('');
        }

        // Load products
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            const products = await getProducts();
            productGrid.innerHTML = products.map(product => `
                <div class="product-card">
                    <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">$${product.price}</div>
                    <button class="buy-btn">Add to Cart</button>
                </div>
            `).join('');
        }

        // Load events
        const eventGrid = document.getElementById('eventGrid');
        if (eventGrid) {
            const events = await getEvents();
            eventGrid.innerHTML = events.map(event => `
                <div class="event-card">
                    <div class="event-date">
                        <span class="day">${new Date(event.date).getDate()}</span>
                        <span class="month">${new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div class="event-details">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <div class="event-meta">
                            <i class="fas fa-map-marker-alt"></i> ${event.location}
                            <i class="fas fa-clock"></i> ${new Date(event.date).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Error loading website content:', error);
    }
}

// Update website settings
function updateWebsiteSettings(settings) {
    // Update site title
    document.title = settings.siteTitle || 'Us For Christ Band';

    // Update contact information
    const contactLinks = document.querySelectorAll('.contact-info a');
    contactLinks.forEach(link => {
        if (link.href.includes('mailto:')) {
            link.href = `mailto:${settings.contactEmail}`;
            link.querySelector('span').textContent = settings.contactEmail;
        } else if (link.href.includes('tel:')) {
            link.href = `tel:${settings.phoneNumber}`;
            link.querySelector('span').textContent = settings.phoneNumber;
        }
    });

    // Update social media links
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        const platform = link.getAttribute('aria-label').toLowerCase();
        if (settings[`${platform}Url`]) {
            link.href = settings[`${platform}Url`];
        }
    });

    // Update hero video
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo && settings.heroVideo) {
        heroVideo.querySelector('source[type="video/mp4"]').src = settings.heroVideo.mp4Url;
        heroVideo.querySelector('source[type="video/webm"]').src = settings.heroVideo.webmUrl;
        heroVideo.load();
    }
}

// Initialize website
document.addEventListener('DOMContentLoaded', () => {
    loadWebsiteContent();
}); 