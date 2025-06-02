// Import Firebase configuration and functions
import { db, auth, storage } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp,
    onSnapshot,
    doc,
    getDoc,
    deleteDoc,
    updateDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL,
    uploadBytesResumable,
    deleteObject
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { 
    onAuthStateChanged, 
    signOut,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalTitle = document.getElementById('modalTitle');
const closeBtn = document.querySelector('.close-btn');

// Initialize Dashboard
async function initDashboard() {
    try {
        console.log('Initializing dashboard...');
        
        // Check authentication
        onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', !!user);
            
            if (!user) {
                console.log('No user found, redirecting to login...');
                window.location.href = 'login.html';
                return;
            }
            
            try {
                // Check if user is admin
                const idTokenResult = await user.getIdTokenResult();
                if (!idTokenResult.claims.admin) {
                    await auth.signOut();
                    throw new Error('Access denied. Admin privileges required.');
                }
                
                // Update admin profile
                updateAdminProfile(user);
                
                // Load initial dashboard data
                await loadDashboardData();
                
                // Load website content
                await loadWebsiteContent();
                
                // Setup event listeners
                setupEventListeners();
                
                // Setup real-time listeners
                setupRealtimeListeners();
                
                console.log('Dashboard initialized successfully');
            } catch (error) {
                console.error('Error during dashboard initialization:', error);
                showNotification('Error initializing dashboard', 'error');
            }
        });
    } catch (error) {
        console.error('Critical error during dashboard initialization:', error);
        showNotification('Critical error initializing dashboard', 'error');
    }
}

// Update Admin Profile
function updateAdminProfile(user) {
    try {
        console.log('Updating admin profile...');
        const adminName = document.querySelector('.admin-name');
        const adminAvatar = document.querySelector('.admin-avatar');
        
        if (adminName) {
            adminName.textContent = user.displayName || 'Admin';
            console.log('Admin name updated:', user.displayName || 'Admin');
        }
        
        if (adminAvatar) {
            adminAvatar.src = user.photoURL || '../assets/images/default-avatar.jpg';
            console.log('Admin avatar updated');
        }
    } catch (error) {
        console.error('Error updating admin profile:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    try {
        console.log('Setting up event listeners...');
        
        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    console.log('Logging out...');
                    await signOut(auth);
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Error logging out:', error);
                    showNotification('Error logging out', 'error');
                }
            });
        }

        // Refresh button
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                try {
                    console.log('Refreshing dashboard data...');
                    await loadDashboardData();
                } catch (error) {
                    console.error('Error refreshing data:', error);
                    showNotification('Error refreshing data', 'error');
                }
            });
        }

        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                console.log('Modal closed');
            });
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                console.log('Modal closed (outside click)');
            }
        });

        // Add buttons
        const addButtons = {
            'addMusicBtn': showAddMusicModal,
            'addEventBtn': showAddEventModal,
            'addProductBtn': showAddProductModal,
            'addGalleryBtn': showAddGalleryModal,
            'addMemberBtn': showAddMemberModal
        };

        Object.entries(addButtons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    console.log(`Add button clicked: ${id}`);
                    handler();
                });
            } else {
                console.warn(`Add button not found: ${id}`);
            }
        });

        // Form submissions
        document.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formId = event.target.id;
            console.log('Form submitted:', formId);
            
            try {
                switch (formId) {
                    case 'addMusicForm':
                        await handleAddMusic(event);
                        break;
                    case 'addEventForm':
                        await handleAddEvent(event);
                        break;
                    case 'addProductForm':
                        await handleAddProduct(event);
                        break;
                    case 'addGalleryForm':
                        await handleAddGallery(event);
                        break;
                    case 'profileForm':
                        await handleProfileUpdate(event);
                        break;
                    case 'passwordForm':
                        await handlePasswordUpdate(event);
                        break;
                    default:
                        console.warn('Unknown form submitted:', formId);
                }
            } catch (error) {
                console.error(`Error handling form submission ${formId}:`, error);
                showNotification(error.message || 'Error processing form', 'error');
            }
        });

        // Search functionality
        document.querySelectorAll('.search-box input').forEach(input => {
            input.addEventListener('input', debounce(async (e) => {
                const sectionId = e.target.closest('.section').id;
                const searchTerm = e.target.value.toLowerCase();
                console.log(`Searching ${sectionId} for:`, searchTerm);
                
                try {
                    switch (sectionId) {
                        case 'music':
                            await searchMusic(searchTerm);
                            break;
                        case 'events':
                            await searchEvents(searchTerm);
                            break;
                        case 'gallery':
                            await searchGallery(searchTerm);
                            break;
                        case 'store':
                            await searchProducts(searchTerm);
                            break;
                        case 'members':
                            await searchMembers(searchTerm);
                            break;
                    }
                } catch (error) {
                    console.error(`Error searching ${sectionId}:`, error);
                    showNotification('Error performing search', 'error');
                }
            }, 300));
        });

        // Save website content button
        const saveWebsiteBtn = document.getElementById('saveWebsiteBtn');
        if (saveWebsiteBtn) {
            saveWebsiteBtn.addEventListener('click', async () => {
                try {
                    await saveWebsiteContent();
                } catch (error) {
                    console.error('Error saving website content:', error);
                    showNotification('Error saving website content', 'error');
                }
            });
        }

        console.log('Event listeners setup complete');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Helper function for debouncing search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search Functions
async function searchMusic(term) {
    const musicList = document.getElementById('musicList');
    if (!musicList) return;
    
    const items = musicList.querySelectorAll('.list-item');
    items.forEach(item => {
        const title = item.querySelector('.list-item-title').textContent.toLowerCase();
        const subtitle = item.querySelector('.list-item-subtitle').textContent.toLowerCase();
        const isVisible = title.includes(term) || subtitle.includes(term);
        item.style.display = isVisible ? 'flex' : 'none';
    });
}

async function searchEvents(term) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    const items = eventsList.querySelectorAll('.list-item');
    items.forEach(item => {
        const title = item.querySelector('.list-item-title').textContent.toLowerCase();
        const subtitle = item.querySelector('.list-item-subtitle').textContent.toLowerCase();
        const isVisible = title.includes(term) || subtitle.includes(term);
        item.style.display = isVisible ? 'flex' : 'none';
    });
}

async function searchGallery(term) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    const items = galleryGrid.querySelectorAll('.grid-item');
    items.forEach(item => {
        const title = item.querySelector('.grid-item-title').textContent.toLowerCase();
        const subtitle = item.querySelector('.grid-item-subtitle').textContent.toLowerCase();
        const isVisible = title.includes(term) || subtitle.includes(term);
        item.style.display = isVisible ? 'block' : 'none';
    });
}

async function searchProducts(term) {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    const items = productsList.querySelectorAll('.list-item');
    items.forEach(item => {
        const title = item.querySelector('.list-item-title').textContent.toLowerCase();
        const subtitle = item.querySelector('.list-item-subtitle').textContent.toLowerCase();
        const isVisible = title.includes(term) || subtitle.includes(term);
        item.style.display = isVisible ? 'flex' : 'none';
    });
}

async function searchMembers(term) {
    const membersList = document.getElementById('membersList');
    if (!membersList) return;
    
    const items = membersList.querySelectorAll('.list-item');
    items.forEach(item => {
        const title = item.querySelector('.list-item-title').textContent.toLowerCase();
        const subtitle = item.querySelector('.list-item-subtitle').textContent.toLowerCase();
        const isVisible = title.includes(term) || subtitle.includes(term);
        item.style.display = isVisible ? 'flex' : 'none';
    });
}

// Settings Form Handlers
async function handleProfileUpdate(event) {
    try {
        const form = event.target;
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        const displayName = form.querySelector('#displayName').value;
        const profileImage = form.querySelector('#profileImage').files[0];

        if (profileImage) {
            const storageRef = ref(storage, `profile_images/${user.uid}`);
            await uploadBytes(storageRef, profileImage);
            const photoURL = await getDownloadURL(storageRef);
            await updateProfile(user, { photoURL });
        }

        if (displayName) {
            await updateProfile(user, { displayName });
        }

        showNotification('Profile updated successfully', 'success');
        await loadSettingsData();
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

async function handlePasswordUpdate(event) {
    try {
        const form = event.target;
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        const currentPassword = form.querySelector('#currentPassword').value;
        const newPassword = form.querySelector('#newPassword').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;

        if (newPassword !== confirmPassword) {
            throw new Error('New passwords do not match');
        }

        // Reauthenticate user before changing password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPassword);
        
        showNotification('Password updated successfully', 'success');
        form.reset();
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
}

// Add Member Modal
function showAddMemberModal() {
    try {
        console.log('Showing add member modal...');
        
        modalTitle.textContent = 'Add New Member';
        modalContent.innerHTML = `
            <form id="addMemberForm" onsubmit="handleAddMember(event)">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="role">Role</label>
                    <input type="text" id="role" name="role" required>
                </div>
                <div class="form-group">
                    <label for="instrument">Instrument</label>
                    <input type="text" id="instrument" name="instrument" required>
                </div>
                <div class="form-group">
                    <label for="memberPhoto">Profile Photo</label>
                    <input type="file" id="memberPhoto" name="memberPhoto" accept="image/*" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Member</button>
            </form>
        `;
        
        modal.classList.add('active');
        console.log('Add member modal displayed successfully');
    } catch (error) {
        console.error('Error showing add member modal:', error);
        showNotification('Error showing add member form', 'error');
    }
}

// Add Member Handler
async function handleAddMember(event) {
    event.preventDefault();
    try {
        console.log('Handling member submission...');
        
        const form = event.target;
        const photoFile = form.querySelector('#memberPhoto').files[0];
        
        if (!photoFile) {
            throw new Error('Please select a profile photo');
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Member...';
        
        // Upload photo
        const storageRef = ref(storage, `members/${Date.now()}_${photoFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, photoFile);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload progress:', progress);
            },
            (error) => {
                throw error;
            },
            async () => {
                try {
                    // Get download URL
                    const photoURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    // Add to Firestore
                    const memberData = {
                        name: form.querySelector('#name').value,
                        role: form.querySelector('#role').value,
                        instrument: form.querySelector('#instrument').value,
                        photoURL: photoURL,
                        joinDate: Timestamp.now()
                    };
                    
                    await addDoc(collection(db, 'members'), memberData);
                    
                    // Add to activity
                    await addDoc(collection(db, 'activity'), {
                        type: 'member',
                        description: `New member "${memberData.name}" added`,
                        timestamp: Timestamp.now()
                    });
                    
                    // Reset form and close modal
                    form.reset();
                    modal.classList.remove('active');
                    showNotification('Member added successfully', 'success');
                    
                    // Refresh members data
                    await loadMembersData();
                } catch (error) {
                    throw error;
                }
            }
        );
    } catch (error) {
        console.error('Error adding member:', error);
        showNotification(error.message || 'Error adding member', 'error');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Member';
    }
}

// Setup Real-time Listeners
function setupRealtimeListeners() {
    try {
        console.log('Setting up real-time listeners...');
        
        // Listen for activity changes
        const activityQuery = query(
            collection(db, 'activity'),
            orderBy('timestamp', 'desc'),
            limit(5)
        );
        
        onSnapshot(activityQuery, (snapshot) => {
            const activities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            updateActivityFeed(activities);
        });
        
        // Listen for upcoming events
        const now = Timestamp.now();
        const eventsQuery = query(
            collection(db, 'events'),
            where('date', '>=', now),
            orderBy('date', 'asc'),
            limit(5)
        );
        
        onSnapshot(eventsQuery, (snapshot) => {
            const events = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            updateUpcomingEvents(events);
        });
        
        console.log('Real-time listeners setup complete');
    } catch (error) {
        console.error('Error setting up real-time listeners:', error);
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Load statistics
        const stats = await getStatistics();
        console.log('Statistics loaded:', stats);
        updateDashboardStats(stats);
        
        // Load recent activity
        const activities = await getRecentActivity();
        console.log('Recent activities loaded:', activities.length);
        updateActivityFeed(activities);
        
        // Load upcoming events
        const events = await getUpcomingEvents();
        console.log('Upcoming events loaded:', events.length);
        updateUpcomingEvents(events);
        
        console.log('Dashboard data loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

// Get Statistics
async function getStatistics() {
    try {
        console.log('Fetching statistics...');
        
        const [songsSnapshot, eventsSnapshot, ordersSnapshot, auditionsSnapshot] = await Promise.all([
            getDocs(collection(db, 'music')),
            getDocs(collection(db, 'events')),
            getDocs(collection(db, 'orders')),
            getDocs(collection(db, 'auditions'))
        ]);
        
        const stats = {
            totalSongs: songsSnapshot.size,
            upcomingEvents: eventsSnapshot.size,
            totalOrders: ordersSnapshot.size,
            pendingAuditions: auditionsSnapshot.size
        };
        
        console.log('Statistics fetched successfully:', stats);
        return stats;
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return {
            totalSongs: 0,
            upcomingEvents: 0,
            totalOrders: 0,
            pendingAuditions: 0
        };
    }
}

// Get Recent Activity
async function getRecentActivity(limit = 5) {
    try {
        console.log('Fetching recent activity...');
        
        const activitiesRef = collection(db, 'activity');
        const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(limit));
        const snapshot = await getDocs(q);
        
        const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('Recent activity fetched successfully:', activities.length);
        return activities;
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
    }
}

// Get Upcoming Events
async function getUpcomingEvents(limit = 5) {
    try {
        console.log('Fetching upcoming events...');
        
        const now = Timestamp.now();
        const eventsRef = collection(db, 'events');
        const q = query(
            eventsRef,
            where('date', '>=', now),
            orderBy('date', 'asc'),
            limit(limit)
        );
        
        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('Upcoming events fetched successfully:', events.length);
        return events;
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        return [];
    }
}

// Update Dashboard Statistics
function updateDashboardStats(stats) {
    try {
        console.log('Updating dashboard statistics...');
        
        const statsElements = {
            totalSongs: document.getElementById('totalSongs'),
            upcomingEvents: document.getElementById('upcomingEvents'),
            totalOrders: document.getElementById('totalOrders'),
            pendingAuditions: document.getElementById('pendingAuditions')
        };
        
        Object.entries(stats).forEach(([key, value]) => {
            const element = statsElements[key];
            if (element) {
                element.textContent = value;
                console.log(`Updated ${key}:`, value);
            } else {
                console.warn(`Element not found for ${key}`);
            }
        });
        
        console.log('Dashboard statistics updated successfully');
    } catch (error) {
        console.error('Error updating dashboard statistics:', error);
    }
}

// Update Activity Feed
function updateActivityFeed(activities) {
    try {
        console.log('Updating activity feed...');
        
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) {
            console.warn('Activity feed element not found');
            return;
        }
        
        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.description}</p>
                    <small>${formatTimestamp(activity.timestamp)}</small>
                </div>
            </div>
        `).join('');
        
        console.log('Activity feed updated successfully');
    } catch (error) {
        console.error('Error updating activity feed:', error);
    }
}

// Update Upcoming Events
function updateUpcomingEvents(events) {
    try {
        console.log('Updating upcoming events...');
        
        const eventsList = document.getElementById('upcomingEventsList');
        if (!eventsList) {
            console.warn('Upcoming events list element not found');
            return;
        }
        
        eventsList.innerHTML = events.map(event => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-calendar"></i>
                </div>
                <div class="activity-details">
                    <p>${event.title}</p>
                    <small>${formatEventDate(event.date)} - ${event.location}</small>
                </div>
            </div>
        `).join('');
        
        console.log('Upcoming events updated successfully');
    } catch (error) {
        console.error('Error updating upcoming events:', error);
    }
}

// Helper Functions
function getActivityIcon(type) {
    const icons = {
        'music': 'fa-music',
        'event': 'fa-calendar',
        'gallery': 'fa-image',
        'store': 'fa-shopping-cart',
        'member': 'fa-user',
        'default': 'fa-info-circle'
    };
    return icons[type] || icons.default;
}

function formatTimestamp(timestamp) {
    try {
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }).format(date);
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return 'Invalid date';
    }
}

function formatEventDate(timestamp) {
    try {
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    } catch (error) {
        console.error('Error formatting event date:', error);
        return 'Invalid date';
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    try {
        console.log(`Showing ${type} notification:`, message);
        
        const notification = document.getElementById('notification');
        if (!notification) {
            console.warn('Notification element not found');
            return;
        }
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
        
        console.log('Notification displayed successfully');
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Form Submission Handlers
async function handleAddMusic(event) {
    event.preventDefault();
    try {
        console.log('Handling music submission...');
        
        const form = event.target;
        const audioFile = form.querySelector('#audioFile').files[0];
        
        if (!audioFile) {
            throw new Error('Please select an audio file');
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        // Upload audio file
        const storageRef = ref(storage, `music/${Date.now()}_${audioFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, audioFile);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload progress:', progress);
            },
            (error) => {
                throw error;
            },
            async () => {
                try {
                    // Get download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    // Add to Firestore
                    const musicData = {
                        title: form.querySelector('#title').value,
                        artist: form.querySelector('#artist').value,
                        genre: form.querySelector('#genre').value,
                        audioUrl: downloadURL,
                        uploadDate: Timestamp.now()
                    };
                    
                    await addDoc(collection(db, 'music'), musicData);
                    
                    // Add to activity
                    await addDoc(collection(db, 'activity'), {
                        type: 'music',
                        description: `New song "${musicData.title}" added`,
                        timestamp: Timestamp.now()
                    });
                    
                    // Reset form and close modal
                    form.reset();
                    modal.classList.remove('active');
                    showNotification('Song added successfully', 'success');
                    
                    // Refresh music data
                    await loadMusicData();
                } catch (error) {
                    throw error;
                }
            }
        );
    } catch (error) {
        console.error('Error adding music:', error);
        showNotification(error.message || 'Error adding song', 'error');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Song';
    }
}

async function handleAddEvent(event) {
    event.preventDefault();
    try {
        console.log('Handling event submission...');
        
        const form = event.target;
        const eventData = {
            title: form.querySelector('input[name="title"]').value,
            date: Timestamp.fromDate(new Date(form.querySelector('input[name="date"]').value)),
            location: form.querySelector('input[name="location"]').value,
            description: form.querySelector('textarea[name="description"]').value,
            ticketPrice: parseFloat(form.querySelector('input[name="ticketPrice"]').value) || 0,
            ticketUrl: form.querySelector('input[name="ticketUrl"]').value,
            createdAt: Timestamp.now()
        };
        
        // Add to Firestore
        await addDoc(collection(db, 'events'), eventData);
        
        // Add to activity
        await addDoc(collection(db, 'activity'), {
            type: 'event',
            description: `New event "${eventData.title}" added`,
            timestamp: Timestamp.now()
        });
        
        // Reset form and close modal
        form.reset();
        modal.classList.remove('active');
        showNotification('Event added successfully', 'success');
        
        // Refresh dashboard data
        await loadDashboardData();
    } catch (error) {
        console.error('Error adding event:', error);
        showNotification(error.message || 'Error adding event', 'error');
    }
}

async function handleAddProduct(event) {
    event.preventDefault();
    try {
        console.log('Handling product submission...');
        
        const form = event.target;
        const imageFile = form.querySelector('input[type="file"]').files[0];
        
        if (!imageFile) {
            throw new Error('Please select a product image');
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        // Upload image
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload progress:', progress);
            },
            (error) => {
                throw error;
            },
            async () => {
                try {
                    // Get download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    // Add to Firestore
                    const productData = {
                        name: form.querySelector('input[name="name"]').value,
                        description: form.querySelector('textarea[name="description"]').value,
                        price: parseFloat(form.querySelector('input[name="price"]').value),
                        imageUrl: downloadURL,
                        stock: parseInt(form.querySelector('input[name="stock"]').value) || 0,
                        createdAt: Timestamp.now()
                    };
                    
                    await addDoc(collection(db, 'products'), productData);
                    
                    // Add to activity
                    await addDoc(collection(db, 'activity'), {
                        type: 'store',
                        description: `New product "${productData.name}" added`,
                        timestamp: Timestamp.now()
                    });
                    
                    // Reset form and close modal
                    form.reset();
                    modal.classList.remove('active');
                    showNotification('Product added successfully', 'success');
                    
                    // Refresh dashboard data
                    await loadDashboardData();
                } catch (error) {
                    throw error;
                }
            }
        );
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification(error.message || 'Error adding product', 'error');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Product';
    }
}

async function handleAddGallery(event) {
    event.preventDefault();
    try {
        console.log('Handling gallery submission...');
        
        const form = event.target;
        const mediaFiles = form.querySelector('input[type="file"]').files;
        
        if (mediaFiles.length === 0) {
            throw new Error('Please select at least one media file');
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        const uploadPromises = Array.from(mediaFiles).map(async (file) => {
            // Upload file
            const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload progress:', progress);
                    },
                    (error) => reject(error),
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve({
                                url: downloadURL,
                                type: file.type.startsWith('image/') ? 'image' : 'video',
                                name: file.name
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        });
        
        // Wait for all uploads to complete
        const mediaItems = await Promise.all(uploadPromises);
        
        // Add to Firestore
        const galleryData = {
            title: form.querySelector('input[name="title"]').value,
            description: form.querySelector('textarea[name="description"]').value,
            media: mediaItems,
            createdAt: Timestamp.now()
        };
        
        await addDoc(collection(db, 'gallery'), galleryData);
        
        // Add to activity
        await addDoc(collection(db, 'activity'), {
            type: 'gallery',
            description: `New gallery "${galleryData.title}" added with ${mediaItems.length} items`,
            timestamp: Timestamp.now()
        });
        
        // Reset form and close modal
        form.reset();
        modal.classList.remove('active');
        showNotification('Gallery items added successfully', 'success');
        
        // Refresh dashboard data
        await loadDashboardData();
    } catch (error) {
        console.error('Error adding gallery items:', error);
        showNotification(error.message || 'Error adding gallery items', 'error');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Gallery Items';
    }
}

// Modal Functions
function showAddMusicModal() {
    try {
        console.log('Showing add music modal...');
        
        modalTitle.textContent = 'Add New Song';
        modalContent.innerHTML = `
            <form id="addMusicForm">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="artist">Artist</label>
                    <input type="text" id="artist" name="artist" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="genre">Genre</label>
                    <input type="text" id="genre" name="genre" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="audioFile">Audio File</label>
                    <input type="file" id="audioFile" name="audioFile" class="form-control" accept="audio/*" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Song</button>
            </form>
        `;
        
        // Add form submit handler
        const form = modalContent.querySelector('#addMusicForm');
        form.addEventListener('submit', handleAddMusic);
        
        modal.classList.add('active');
        console.log('Add music modal displayed successfully');
    } catch (error) {
        console.error('Error showing add music modal:', error);
        showNotification('Error showing add music form', 'error');
    }
}

function showAddEventModal() {
    try {
        console.log('Showing add event modal...');
        
        modalTitle.textContent = 'Add New Event';
        modalContent.innerHTML = `
            <form id="addEventForm" onsubmit="handleAddEvent(event)">
                <div class="form-group">
                    <label for="title">Event Title</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="date">Date & Time</label>
                    <input type="datetime-local" id="date" name="date" required>
                </div>
                <div class="form-group">
                    <label for="location">Location</label>
                    <input type="text" id="location" name="location" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="ticketPrice">Ticket Price</label>
                    <input type="number" id="ticketPrice" name="ticketPrice" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="ticketUrl">Ticket URL</label>
                    <input type="url" id="ticketUrl" name="ticketUrl">
                </div>
                <button type="submit" class="btn btn-primary">Add Event</button>
            </form>
        `;
        
        modal.classList.add('active');
        console.log('Add event modal displayed successfully');
    } catch (error) {
        console.error('Error showing add event modal:', error);
        showNotification('Error showing add event form', 'error');
    }
}

function showAddProductModal() {
    try {
        console.log('Showing add product modal...');
        
        modalTitle.textContent = 'Add New Product';
        modalContent.innerHTML = `
            <form id="addProductForm" onsubmit="handleAddProduct(event)">
                <div class="form-group">
                    <label for="name">Product Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="price">Price</label>
                    <input type="number" id="price" name="price" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="stock">Stock</label>
                    <input type="number" id="stock" name="stock" min="0" required>
                </div>
                <div class="form-group">
                    <label for="imageFile">Product Image</label>
                    <input type="file" id="imageFile" name="imageFile" accept="image/*" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Product</button>
            </form>
        `;
        
        modal.classList.add('active');
        console.log('Add product modal displayed successfully');
    } catch (error) {
        console.error('Error showing add product modal:', error);
        showNotification('Error showing add product form', 'error');
    }
}

function showAddGalleryModal() {
    try {
        console.log('Showing add gallery modal...');
        
        modalTitle.textContent = 'Add Gallery Items';
        modalContent.innerHTML = `
            <form id="addGalleryForm" onsubmit="handleAddGallery(event)">
                <div class="form-group">
                    <label for="title">Gallery Title</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="mediaFiles">Media Files</label>
                    <input type="file" id="mediaFiles" name="mediaFiles" accept="image/*,video/*" multiple required>
                    <small>You can select multiple files. Supported formats: Images (JPG, PNG, GIF) and Videos (MP4, WebM)</small>
                </div>
                <button type="submit" class="btn btn-primary">Add Gallery Items</button>
            </form>
        `;
        
        modal.classList.add('active');
        console.log('Add gallery modal displayed successfully');
    } catch (error) {
        console.error('Error showing add gallery modal:', error);
        showNotification('Error showing add gallery form', 'error');
    }
}

// Load Section Data
async function loadSectionData(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    try {
        // Show loading state
        section.innerHTML = '<div class="loading">Loading...</div>';
        section.classList.add('active');

        switch (sectionId) {
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'music':
                await loadMusicData();
                break;
            case 'events':
                await loadEventsData();
                break;
            case 'gallery':
                await loadGalleryData();
                break;
            case 'store':
                await loadStoreData();
                break;
            case 'members':
                await loadMembersData();
                break;
            case 'settings':
                loadSettingsData();
                break;
            default:
                console.error('Unknown section:', sectionId);
                showNotification('Unknown section', 'error');
        }
    } catch (error) {
        console.error(`Error loading ${sectionId} data:`, error);
        showNotification(`Error loading ${sectionId} data`, 'error');
        section.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load content. Please try again.</p>
                <button class="btn btn-primary" onclick="loadSectionData('${sectionId}')">
                    <i class="fas fa-sync-alt"></i>
                    Retry
                </button>
            </div>
        `;
    }
}

// Music Section Functions
async function loadMusicData() {
    try {
        console.log('Loading music data...');
        const musicRef = collection(db, 'music');
        const q = query(musicRef, orderBy('uploadDate', 'desc'));
        const snapshot = await getDocs(q);
        
        const musicList = document.getElementById('musicList');
        if (!musicList) return;
        
        if (snapshot.empty) {
            musicList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <p>No songs added yet</p>
                    <button class="btn btn-primary" onclick="showAddMusicModal()">
                        <i class="fas fa-plus"></i>
                        Add Your First Song
                    </button>
                </div>
            `;
            return;
        }
        
        musicList.innerHTML = snapshot.docs.map(doc => {
            const data = doc.data();
            return `
                <div class="list-item" data-id="${doc.id}">
                    <div class="list-item-image">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="list-item-content">
                        <h4 class="list-item-title">${data.title}</h4>
                        <p class="list-item-subtitle">${data.artist} • ${data.genre}</p>
                        <small class="list-item-meta">Added ${formatTimestamp(data.uploadDate)}</small>
                    </div>
                    <div class="list-item-actions">
                        <button class="action-btn" onclick="playMusic('${doc.id}')" title="Play">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="action-btn" onclick="editMusic('${doc.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteMusic('${doc.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('Music data loaded successfully');
    } catch (error) {
        console.error('Error loading music data:', error);
        throw error;
    }
}

// Music Control Functions
async function playMusic(musicId) {
    try {
        const musicRef = doc(db, 'music', musicId);
        const musicDoc = await getDoc(musicRef);
        
        if (!musicDoc.exists()) {
            throw new Error('Music not found');
        }
        
        const musicData = musicDoc.data();
        
        // Show modal with audio player
        modalTitle.textContent = `Playing: ${musicData.title}`;
        modalContent.innerHTML = `
            <div class="audio-player">
                <div class="player-info">
                    <h3>${musicData.title}</h3>
                    <p>${musicData.artist} • ${musicData.genre}</p>
                </div>
                <audio controls autoplay>
                    <source src="${musicData.audioUrl}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
        `;
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error playing music:', error);
        showNotification('Error playing music', 'error');
    }
}

async function editMusic(musicId) {
    try {
        const musicRef = doc(db, 'music', musicId);
        const musicDoc = await getDoc(musicRef);
        
        if (!musicDoc.exists()) {
            throw new Error('Music not found');
        }
        
        const musicData = musicDoc.data();
        
        modalTitle.textContent = 'Edit Song';
        modalContent.innerHTML = `
            <form id="editMusicForm" onsubmit="handleEditMusic(event, '${musicId}')">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" value="${musicData.title}" required>
                </div>
                <div class="form-group">
                    <label for="artist">Artist</label>
                    <input type="text" id="artist" name="artist" value="${musicData.artist}" required>
                </div>
                <div class="form-group">
                    <label for="genre">Genre</label>
                    <input type="text" id="genre" name="genre" value="${musicData.genre}" required>
                </div>
                <div class="form-group">
                    <label for="audioFile">New Audio File (Optional)</label>
                    <input type="file" id="audioFile" name="audioFile" accept="audio/*">
                    <small>Leave empty to keep current audio file</small>
                </div>
                <button type="submit" class="btn btn-primary">Update Song</button>
            </form>
        `;
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error editing music:', error);
        showNotification('Error editing music', 'error');
    }
}

async function deleteMusic(musicId) {
    try {
        if (!confirm('Are you sure you want to delete this song?')) {
            return;
        }
        
        const musicRef = doc(db, 'music', musicId);
        const musicDoc = await getDoc(musicRef);
        
        if (!musicDoc.exists()) {
            throw new Error('Music not found');
        }
        
        const musicData = musicDoc.data();
        
        // Delete audio file from storage
        if (musicData.audioUrl) {
            const audioRef = ref(storage, musicData.audioUrl);
            await deleteObject(audioRef);
        }
        
        // Delete document from Firestore
        await deleteDoc(musicRef);
        
        // Add to activity
        await addDoc(collection(db, 'activity'), {
            type: 'music',
            description: `Song "${musicData.title}" deleted`,
            timestamp: Timestamp.now()
        });
        
        showNotification('Song deleted successfully', 'success');
        await loadMusicData();
    } catch (error) {
        console.error('Error deleting music:', error);
        showNotification('Error deleting music', 'error');
    }
}

async function handleEditMusic(event, musicId) {
    event.preventDefault();
    try {
        const form = event.target;
        const audioFile = form.querySelector('#audioFile').files[0];
        
        let audioUrl = null;
        if (audioFile) {
            // Upload new audio file
            const storageRef = ref(storage, `music/${Date.now()}_${audioFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, audioFile);
            
            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload progress:', progress);
                    },
                    (error) => reject(error),
                    async () => {
                        try {
                            audioUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        }
        
        // Update Firestore document
        const musicRef = doc(db, 'music', musicId);
        const updateData = {
            title: form.querySelector('#title').value,
            artist: form.querySelector('#artist').value,
            genre: form.querySelector('#genre').value,
            updatedAt: Timestamp.now()
        };
        
        if (audioUrl) {
            updateData.audioUrl = audioUrl;
        }
        
        await updateDoc(musicRef, updateData);
        
        // Add to activity
        await addDoc(collection(db, 'activity'), {
            type: 'music',
            description: `Song "${updateData.title}" updated`,
            timestamp: Timestamp.now()
        });
        
        modal.classList.remove('active');
        showNotification('Song updated successfully', 'success');
        await loadMusicData();
    } catch (error) {
        console.error('Error updating music:', error);
        showNotification('Error updating music', 'error');
    }
}

// Events Section Functions
async function loadEventsData() {
    try {
        console.log('Loading events data...');
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, orderBy('date', 'asc'));
        const snapshot = await getDocs(q);
        
        const eventsList = document.getElementById('eventsList');
        if (!eventsList) return;
        
        eventsList.innerHTML = snapshot.docs.map(doc => {
            const data = doc.data();
            return `
                <div class="list-item">
                    <div class="list-item-content">
                        <h4 class="list-item-title">${data.title}</h4>
                        <p class="list-item-subtitle">${formatEventDate(data.date)} • ${data.location}</p>
                    </div>
                    <div class="list-item-actions">
                        <button class="action-btn" onclick="editEvent('${doc.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteEvent('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('Events data loaded successfully');
    } catch (error) {
        console.error('Error loading events data:', error);
        throw error;
    }
}

// Gallery Section Functions
async function loadGalleryData() {
    try {
        console.log('Loading gallery data...');
        const galleryRef = collection(db, 'gallery');
        const q = query(galleryRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;
        
        galleryGrid.innerHTML = snapshot.docs.map(doc => {
            const data = doc.data();
            const firstMedia = data.media[0];
            return `
                <div class="grid-item">
                    <img src="${firstMedia.url}" alt="${data.title}" class="grid-item-image">
                    <div class="grid-item-content">
                        <h4 class="grid-item-title">${data.title}</h4>
                        <p class="grid-item-subtitle">${data.media.length} items</p>
                    </div>
                    <div class="list-item-actions">
                        <button class="action-btn" onclick="viewGallery('${doc.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="editGallery('${doc.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteGallery('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('Gallery data loaded successfully');
    } catch (error) {
        console.error('Error loading gallery data:', error);
        throw error;
    }
}

// Store Section Functions
async function loadStoreData() {
    try {
        console.log('Loading store data...');
        const [productsSnapshot, ordersSnapshot] = await Promise.all([
            getDocs(collection(db, 'products')),
            getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5)))
        ]);
        
        // Load products
        const productsList = document.getElementById('productsList');
        if (productsList) {
            productsList.innerHTML = productsSnapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="list-item">
                        <img src="${data.imageUrl}" alt="${data.name}" class="list-item-image">
                        <div class="list-item-content">
                            <h4 class="list-item-title">${data.name}</h4>
                            <p class="list-item-subtitle">$${data.price.toFixed(2)} • ${data.stock} in stock</p>
                        </div>
                        <div class="list-item-actions">
                            <button class="action-btn" onclick="editProduct('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn" onclick="deleteProduct('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Load orders
        const ordersList = document.getElementById('ordersList');
        if (ordersList) {
            ordersList.innerHTML = ordersSnapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="list-item">
                        <div class="list-item-content">
                            <h4 class="list-item-title">Order #${doc.id.slice(-6)}</h4>
                            <p class="list-item-subtitle">${formatTimestamp(data.createdAt)} • $${data.total.toFixed(2)}</p>
                        </div>
                        <div class="list-item-actions">
                            <button class="action-btn" onclick="viewOrder('${doc.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn" onclick="updateOrderStatus('${doc.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        console.log('Store data loaded successfully');
    } catch (error) {
        console.error('Error loading store data:', error);
        throw error;
    }
}

// Members Section Functions
async function loadMembersData() {
    try {
        console.log('Loading members data...');
        const [membersSnapshot, auditionsSnapshot] = await Promise.all([
            getDocs(collection(db, 'members')),
            getDocs(query(collection(db, 'auditions'), where('status', '==', 'pending')))
        ]);
        
        // Load members
        const membersList = document.getElementById('membersList');
        if (membersList) {
            membersList.innerHTML = membersSnapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="list-item">
                        <img src="${data.photoURL || '../assets/images/default-avatar.jpg'}" alt="${data.name}" class="list-item-image">
                        <div class="list-item-content">
                            <h4 class="list-item-title">${data.name}</h4>
                            <p class="list-item-subtitle">${data.role} • Joined ${formatTimestamp(data.joinDate)}</p>
                        </div>
                        <div class="list-item-actions">
                            <button class="action-btn" onclick="editMember('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn" onclick="removeMember('${doc.id}')">
                                <i class="fas fa-user-minus"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Load auditions
        const auditionsList = document.getElementById('auditionsList');
        if (auditionsList) {
            auditionsList.innerHTML = auditionsSnapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="list-item">
                        <div class="list-item-content">
                            <h4 class="list-item-title">${data.name}</h4>
                            <p class="list-item-subtitle">${data.instrument} • Applied ${formatTimestamp(data.appliedAt)}</p>
                        </div>
                        <div class="list-item-actions">
                            <button class="action-btn" onclick="viewAudition('${doc.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn" onclick="approveAudition('${doc.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="action-btn" onclick="rejectAudition('${doc.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        console.log('Members data loaded successfully');
    } catch (error) {
        console.error('Error loading members data:', error);
        throw error;
    }
}

// Settings Section Functions
function loadSettingsData() {
    try {
        console.log('Loading settings data...');
        const user = auth.currentUser;
        if (!user) return;
        
        // Load profile data
        const displayNameInput = document.getElementById('displayName');
        const emailInput = document.getElementById('email');
        
        if (displayNameInput) displayNameInput.value = user.displayName || '';
        if (emailInput) emailInput.value = user.email || '';
        
        console.log('Settings data loaded successfully');
    } catch (error) {
        console.error('Error loading settings data:', error);
        throw error;
    }
}

// Website Management Functions
async function loadWebsiteContent() {
    try {
        console.log('Loading website content...');
        const websiteRef = doc(db, 'website', 'content');
        const websiteDoc = await getDoc(websiteRef);
        
        if (websiteDoc.exists()) {
            const data = websiteDoc.data();
            
            // Load hero section content
            if (data.hero) {
                document.getElementById('heroTitle').value = data.hero.title || '';
                document.getElementById('heroSubtitle').value = data.hero.subtitle || '';
                document.getElementById('heroButtonText').value = data.hero.buttonText || '';
                document.getElementById('heroButtonLink').value = data.hero.buttonLink || '';
            }
            
            // Load music section content
            if (data.music) {
                document.getElementById('musicSectionTitle').value = data.music.title || '';
                document.getElementById('musicSectionDescription').value = data.music.description || '';
            }
            
            // Load gallery section content
            if (data.gallery) {
                document.getElementById('gallerySectionTitle').value = data.gallery.title || '';
                document.getElementById('gallerySectionDescription').value = data.gallery.description || '';
            }
            
            // Load merchandise section content
            if (data.merchandise) {
                document.getElementById('merchandiseSectionTitle').value = data.merchandise.title || '';
                document.getElementById('merchandiseSectionDescription').value = data.merchandise.description || '';
                document.getElementById('storeLink').value = data.merchandise.storeLink || '';
            }
            
            // Load members section content
            if (data.members) {
                document.getElementById('membersSectionTitle').value = data.members.title || '';
                document.getElementById('membersSectionDescription').value = data.members.description || '';
            }
            
            // Load events section content
            if (data.events) {
                document.getElementById('eventsSectionTitle').value = data.events.title || '';
                document.getElementById('eventsSectionDescription').value = data.events.description || '';
            }
            
            // Load contact section content
            if (data.contact) {
                document.getElementById('contactSectionTitle').value = data.contact.title || '';
                document.getElementById('contactEmail').value = data.contact.email || '';
                document.getElementById('contactPhone').value = data.contact.phone || '';
                document.getElementById('contactAddress').value = data.contact.address || '';
                
                // Load social media links
                const socialInputs = document.querySelectorAll('.social-links input');
                socialInputs.forEach(input => {
                    const platform = input.name;
                    if (data.contact.social && data.contact.social[platform]) {
                        input.value = data.contact.social[platform];
                    }
                });
            }
            
            // Load footer content
            if (data.footer) {
                document.getElementById('footerText').value = data.footer.text || '';
                
                // Load footer links
                const footerInputs = document.querySelectorAll('.footer-links input');
                if (data.footer.links) {
                    data.footer.links.forEach((link, index) => {
                        const textInput = footerInputs[index * 2];
                        const urlInput = footerInputs[index * 2 + 1];
                        if (textInput && urlInput) {
                            textInput.value = link.text || '';
                            urlInput.value = link.url || '';
                        }
                    });
                }
            }
        }
        
        console.log('Website content loaded successfully');
    } catch (error) {
        console.error('Error loading website content:', error);
        showNotification('Error loading website content', 'error');
    }
}

async function saveWebsiteContent() {
    try {
        console.log('Saving website content...');
        
        // Collect all form data
        const websiteData = {
            hero: {
                title: document.getElementById('heroTitle').value,
                subtitle: document.getElementById('heroSubtitle').value,
                buttonText: document.getElementById('heroButtonText').value,
                buttonLink: document.getElementById('heroButtonLink').value
            },
            music: {
                title: document.getElementById('musicSectionTitle').value,
                description: document.getElementById('musicSectionDescription').value
            },
            gallery: {
                title: document.getElementById('gallerySectionTitle').value,
                description: document.getElementById('gallerySectionDescription').value
            },
            merchandise: {
                title: document.getElementById('merchandiseSectionTitle').value,
                description: document.getElementById('merchandiseSectionDescription').value,
                storeLink: document.getElementById('storeLink').value
            },
            members: {
                title: document.getElementById('membersSectionTitle').value,
                description: document.getElementById('membersSectionDescription').value
            },
            events: {
                title: document.getElementById('eventsSectionTitle').value,
                description: document.getElementById('eventsSectionDescription').value
            },
            contact: {
                title: document.getElementById('contactSectionTitle').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                address: document.getElementById('contactAddress').value,
                social: {
                    facebook: document.querySelector('input[name="facebook"]').value,
                    instagram: document.querySelector('input[name="instagram"]').value,
                    twitter: document.querySelector('input[name="twitter"]').value,
                    youtube: document.querySelector('input[name="youtube"]').value
                }
            },
            footer: {
                text: document.getElementById('footerText').value,
                links: getFooterLinks()
            }
        };
        
        // Handle file uploads
        const heroVideo = document.getElementById('heroVideo').files[0];
        const musicSectionImage = document.getElementById('musicSectionImage').files[0];
        
        if (heroVideo) {
            const heroVideoUrl = await uploadFile(heroVideo, 'website/hero');
            websiteData.hero.videoUrl = heroVideoUrl;
        }
        
        if (musicSectionImage) {
            const musicImageUrl = await uploadFile(musicSectionImage, 'website/music');
            websiteData.music.imageUrl = musicImageUrl;
        }
        
        // Save to Firestore
        const websiteRef = doc(db, 'website', 'content');
        await setDoc(websiteRef, websiteData, { merge: true });
        
        showNotification('Website content saved successfully', 'success');
        console.log('Website content saved successfully');
    } catch (error) {
        console.error('Error saving website content:', error);
        showNotification('Error saving website content', 'error');
    }
}

function getFooterLinks() {
    const footerInputs = document.querySelectorAll('.footer-links input');
    const links = [];
    
    for (let i = 0; i < footerInputs.length; i += 2) {
        const textInput = footerInputs[i];
        const urlInput = footerInputs[i + 1];
        if (textInput.value && urlInput.value) {
            links.push({
                text: textInput.value,
                url: urlInput.value
            });
        }
    }
    
    return links;
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing dashboard...');
    initDashboard().catch(error => {
        console.error('Failed to initialize dashboard:', error);
        showNotification('Failed to initialize dashboard', 'error');
    });
});

// Make functions globally accessible
window.playMusic = playMusic;
window.editMusic = editMusic;
window.deleteMusic = deleteMusic;
window.handleEditMusic = handleEditMusic;
window.showAddMusicModal = showAddMusicModal;
window.handleAddMusic = handleAddMusic; 