import { 
    loginAdmin, 
    logoutAdmin,
    getSongs,
    addSong,
    updateSong,
    deleteSong,
    getGalleryImages,
    addGalleryImage,
    deleteGalleryImage,
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getAuditionRequests,
    updateAuditionStatus,
    getSettings,
    updateSettings
} from '../firebase-service.js';

// Admin Authentication
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            await loginAdmin(email, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            loginError.textContent = 'Invalid email or password';
            loginError.style.display = 'block';
        }
    });
}

// Check Authentication
function checkAuth() {
    const user = auth.currentUser;
    if (!user && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await logoutAdmin();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}

// Navigation
const navLinks = document.querySelectorAll('.admin-nav-links a');
const sections = document.querySelectorAll('.admin-section');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.dataset.section;
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// Modal Management
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close-modal');

function openModal(content) {
    document.getElementById('modalContent').innerHTML = content;
    modal.style.display = 'block';
}

function closeModalHandler() {
    modal.style.display = 'none';
}

if (closeModal) {
    closeModal.addEventListener('click', closeModalHandler);
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalHandler();
    }
});

// Music Management
const addMusicBtn = document.getElementById('addMusicBtn');
const musicList = document.getElementById('musicList');

if (addMusicBtn) {
    addMusicBtn.addEventListener('click', () => {
        const content = `
            <h2>Add New Song</h2>
            <form id="addMusicForm">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label>Spotify Link</label>
                    <input type="url" name="spotifyLink">
                </div>
                <div class="form-group">
                    <label>Apple Music Link</label>
                    <input type="url" name="appleLink">
                </div>
                <div class="form-group">
                    <label>YouTube Link</label>
                    <input type="url" name="youtubeLink">
                </div>
                <div class="form-group">
                    <label>Cover Image</label>
                    <input type="file" name="coverImage" accept="image/*">
                </div>
                <button type="submit" class="save-btn">Add Song</button>
            </form>
        `;
        openModal(content);

        // Handle form submission
        const form = document.getElementById('addMusicForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const songData = Object.fromEntries(formData.entries());
            
            try {
                await addSong(songData);
                closeModal();
                await updateStats();
                alert('Song added successfully!');
            } catch (error) {
                console.error('Error adding song:', error);
                alert('Error adding song. Please try again.');
            }
        });
    });
}

// Gallery Management
const addGalleryBtn = document.getElementById('addGalleryBtn');
const galleryList = document.getElementById('galleryList');

if (addGalleryBtn) {
    addGalleryBtn.addEventListener('click', () => {
        const content = `
            <h2>Add New Image</h2>
            <form id="addGalleryForm">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description"></textarea>
                </div>
                <div class="form-group">
                    <label>Image</label>
                    <input type="file" name="image" accept="image/*" required>
                </div>
                <button type="submit" class="save-btn">Add Image</button>
            </form>
        `;
        openModal(content);

        // Handle form submission
        const form = document.getElementById('addGalleryForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const imageData = {
                title: formData.get('title'),
                description: formData.get('description')
            };
            const imageFile = formData.get('image');
            
            try {
                await addGalleryImage(imageData, imageFile);
                closeModal();
                await updateStats();
                alert('Image added successfully!');
            } catch (error) {
                console.error('Error adding image:', error);
                alert('Error adding image. Please try again.');
            }
        });
    });
}

// Merchandise Management
const addProductBtn = document.getElementById('addProductBtn');
const productList = document.getElementById('productList');

if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
        const content = `
            <h2>Add New Product</h2>
            <form id="addProductForm">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" name="price" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select name="category" required>
                        <option value="clothing">Clothing</option>
                        <option value="accessories">Accessories</option>
                        <option value="music">Music</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Product Image</label>
                    <input type="file" name="image" accept="image/*" required>
                </div>
                <div class="form-group">
                    <label>Available Colors</label>
                    <div class="color-inputs">
                        <input type="color" name="colors[]">
                        <button type="button" class="add-color-btn">+</button>
                    </div>
                </div>
                <button type="submit" class="save-btn">Add Product</button>
            </form>
        `;
        openModal(content);

        // Handle form submission
        const form = document.getElementById('addProductForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                colors: Array.from(formData.getAll('colors[]'))
            };
            const productImage = formData.get('image');
            
            try {
                await addProduct(productData, productImage);
                closeModal();
                await updateStats();
                alert('Product added successfully!');
            } catch (error) {
                console.error('Error adding product:', error);
                alert('Error adding product. Please try again.');
            }
        });
    });
}

// Auditions Management
const auditionsToggle = document.getElementById('auditionsToggle');
const auditionList = document.getElementById('auditionList');

if (auditionsToggle) {
    auditionsToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        // Update auditions visibility in the frontend
        localStorage.setItem('auditionsEnabled', isEnabled);
    });
}

// Settings Management
const settingsForm = document.getElementById('settingsForm');

if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(settingsForm);
        const settings = Object.fromEntries(formData.entries());
        
        try {
            await updateSettings(settings);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings. Please try again.');
        }
    });
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load settings
        const settings = await getSettings();
        if (settings) {
            Object.entries(settings).forEach(([key, value]) => {
                const input = document.getElementById(key);
                if (input) input.value = value;
            });
        }

        // Load auditions state
        const auditionsEnabled = settings?.auditionsEnabled || false;
        if (auditionsToggle) {
            auditionsToggle.checked = auditionsEnabled;
        }

        // Update stats
        await updateStats();
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Update Dashboard Stats
async function updateStats() {
    try {
        const [songs, images, products, auditions] = await Promise.all([
            getSongs(),
            getGalleryImages(),
            getProducts(),
            getAuditionRequests()
        ]);

        document.getElementById('totalSongs').textContent = songs.length;
        document.getElementById('totalImages').textContent = images.length;
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalAuditions').textContent = auditions.length;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadInitialData();
}); 