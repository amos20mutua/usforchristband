// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Cache for storing fetched data
const dataCache = {
    settings: null,
    songs: null,
    gallery: null,
    products: null,
    events: null
};

// Settings
async function fetchSettings() {
    if (dataCache.settings) return dataCache.settings;
    
    try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        dataCache.settings = await response.json();
        return dataCache.settings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return {
            heroTitle: 'Welcome to U4C Band',
            heroSubtitle: 'Experience the Music',
            missionTitle: 'Our Mission',
            missionText: 'To create and share music that inspires and connects people.',
            latestRelease: {
                title: 'Latest Release',
                artist: 'U4C Band',
                coverImage: 'path/to/default-cover.jpg',
                spotifyLink: '',
                youtubeLink: ''
            }
        };
    }
}

// Songs
async function fetchSongs() {
    if (dataCache.songs) return dataCache.songs;
    
    try {
        const response = await fetch(`${API_BASE_URL}/songs`);
        if (!response.ok) throw new Error('Failed to fetch songs');
        dataCache.songs = await response.json();
        return dataCache.songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
}

// Gallery Images
async function fetchGalleryImages() {
    if (dataCache.gallery) return dataCache.gallery;
    
    try {
        const response = await fetch(`${API_BASE_URL}/gallery`);
        if (!response.ok) throw new Error('Failed to fetch gallery images');
        dataCache.gallery = await response.json();
        return dataCache.gallery;
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        return [];
    }
}

// Products
async function fetchProducts() {
    if (dataCache.products) return dataCache.products;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        dataCache.products = await response.json();
        return dataCache.products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Events
async function fetchEvents() {
    if (dataCache.events) return dataCache.events;
    
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        dataCache.events = await response.json();
        return dataCache.events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Update frontend content
async function updateHomePage() {
    const settings = await fetchSettings();
    
    // Update hero section
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroVideo = document.querySelector('.hero-video source');
    
    if (heroTitle) heroTitle.textContent = settings.heroTitle;
    if (heroSubtitle) heroSubtitle.textContent = settings.heroSubtitle;
    if (heroVideo && settings.heroVideo) {
        heroVideo.src = settings.heroVideo;
        heroVideo.parentElement.load();
    }
    
    // Update latest release
    const releaseTitle = document.querySelector('.release-title');
    const releaseArtist = document.querySelector('.release-artist');
    const releaseCover = document.querySelector('.release-cover');
    const spotifyLink = document.querySelector('.spotify-link');
    const youtubeLink = document.querySelector('.youtube-link');
    
    if (releaseTitle) releaseTitle.textContent = settings.latestRelease.title;
    if (releaseArtist) releaseArtist.textContent = settings.latestRelease.artist;
    if (releaseCover) releaseCover.src = settings.latestRelease.coverImage;
    if (spotifyLink) spotifyLink.href = settings.latestRelease.spotifyLink;
    if (youtubeLink) youtubeLink.href = settings.latestRelease.youtubeLink;
    
    // Update mission section
    const missionTitle = document.querySelector('.mission-title');
    const missionText = document.querySelector('.mission-text');
    
    if (missionTitle) missionTitle.textContent = settings.missionTitle;
    if (missionText) missionText.textContent = settings.missionText;
}

async function updateMediaPage() {
    const songs = await fetchSongs();
    const songsContainer = document.querySelector('.songs-container');
    
    if (songsContainer) {
        songsContainer.innerHTML = songs.map(song => `
            <div class="song-card">
                <img src="${song.coverImage}" alt="${song.title}" class="song-cover">
                <div class="song-info">
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                </div>
                <audio controls>
                    <source src="${song.audioUrl}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
        `).join('');
    }
}

async function updateGalleryPage() {
    const images = await fetchGalleryImages();
    const galleryContainer = document.querySelector('.gallery-grid');
    
    if (galleryContainer) {
        galleryContainer.innerHTML = images.map(image => `
            <div class="gallery-item">
                <img src="${image.url}" alt="${image.title}" class="gallery-image">
                <div class="gallery-caption">
                    <h3>${image.title}</h3>
                    <p>${image.description}</p>
                </div>
            </div>
        `).join('');
    }
}

async function updateMerchandisePage() {
    const products = await fetchProducts();
    const productsContainer = document.querySelector('.products-grid');
    
    if (productsContainer) {
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">$${product.price}</p>
                    <p class="product-description">${product.description}</p>
                    <button class="buy-button">Add to Cart</button>
                </div>
            </div>
        `).join('');
    }
}

async function updateEventsPage() {
    const events = await fetchEvents();
    const eventsContainer = document.querySelector('.events-list');
    
    if (eventsContainer) {
        eventsContainer.innerHTML = events.map(event => `
            <div class="event-card">
                <div class="event-date">
                    <span class="day">${new Date(event.date).getDate()}</span>
                    <span class="month">${new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <p class="event-location">${event.location}</p>
                    <p class="event-description">${event.description}</p>
                </div>
            </div>
        `).join('');
    }
}

// Initialize page content
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'index.html':
        case '':
            updateHomePage();
            break;
        case 'media.html':
            updateMediaPage();
            break;
        case 'gallery.html':
            updateGalleryPage();
            break;
        case 'merch.html':
            updateMerchandisePage();
            break;
        case 'events.html':
            updateEventsPage();
            break;
    }
}); 