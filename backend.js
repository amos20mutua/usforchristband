console.log('Loading backend.js...');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBWqsCnKNB5swzX9cUzA_TTtXvx4S0rxfQ",
    authDomain: "us-for-crist-band.firebaseapp.com",
    projectId: "us-for-crist-band",
    storageBucket: "us-for-crist-band.appspot.com",
    messagingSenderId: "988539412486",
    appId: "1:988539412486:web:b5a59cb721661a14876387",
    measurementId: "G-B0EPWVX0LD"
};

// Initialize Firebase and declare global variables
let db;
let storage;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();

    // Enable offline persistence
    db.enablePersistence()
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.warn('The current browser does not support persistence.');
            }
        });

    // Test database connection
    db.collection('settings').doc('main').get()
        .then(() => console.log('Successfully connected to Firestore'))
        .catch(error => {
            console.error('Firestore connection error:', error);
            if (error.code === 'permission-denied') {
                alert('Database access denied. Please check Firebase Security Rules.');
            }
        });
} catch (error) {
    console.error('Error initializing Firebase:', error);
    alert('Failed to initialize Firebase. Please check your configuration.');
}

// Settings
async function getSettings() {
    console.log('Fetching settings...');
    try {
        const doc = await db.collection('settings').doc('main').get();
        if (doc.exists) {
            return doc.data();
        } else {
            // Return default settings if document doesn't exist
            const defaultSettings = {
                heroTitle: 'Welcome to U4C Band',
                heroSubtitle: 'Experience the Music',
                missionTitle: 'Our Mission',
                missionText: 'To create and share music that inspires and connects people.'
            };
            // Create the document with default settings
            await db.collection('settings').doc('main').set(defaultSettings);
            return defaultSettings;
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        if (error.code === 'permission-denied') {
            alert('Database access denied. Please check Firebase Security Rules.');
        }
        // Return default settings if there's an error
        return {
            heroTitle: 'Welcome to U4C Band',
            heroSubtitle: 'Experience the Music',
            missionTitle: 'Our Mission',
            missionText: 'To create and share music that inspires and connects people.'
        };
    }
}

async function updateSettings(settings) {
    try {
        await db.collection('settings').doc('main').set(settings);
        return settings;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
}

// Songs
async function getSongs() {
    try {
        const snapshot = await db.collection('songs').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
}

async function addSong(songData) {
    try {
        // Upload audio file if present
        if (songData.audioFile) {
            const audioRef = storage.ref(`songs/${songData.audioFile.name}`);
            await audioRef.put(songData.audioFile);
            songData.audioUrl = await audioRef.getDownloadURL();
        }
        
        // Upload cover image if present
        if (songData.coverImage) {
            const imageRef = storage.ref(`covers/${songData.coverImage.name}`);
            await imageRef.put(songData.coverImage);
            songData.coverUrl = await imageRef.getDownloadURL();
        }

        const docRef = await db.collection('songs').add(songData);
        return { id: docRef.id, ...songData };
    } catch (error) {
        console.error('Error adding song:', error);
        throw error;
    }
}

async function updateSong(id, songData) {
    try {
        // Handle file uploads similar to addSong
        if (songData.audioFile) {
            const audioRef = storage.ref(`songs/${songData.audioFile.name}`);
            await audioRef.put(songData.audioFile);
            songData.audioUrl = await audioRef.getDownloadURL();
        }
        
        if (songData.coverImage) {
            const imageRef = storage.ref(`covers/${songData.coverImage.name}`);
            await imageRef.put(songData.coverImage);
            songData.coverUrl = await imageRef.getDownloadURL();
        }

        await db.collection('songs').doc(id).update(songData);
        return { id, ...songData };
    } catch (error) {
        console.error('Error updating song:', error);
        throw error;
    }
}

async function deleteSong(id) {
    try {
        await db.collection('songs').doc(id).delete();
        return { id };
    } catch (error) {
        console.error('Error deleting song:', error);
        throw error;
    }
}

// Gallery Images
async function getGalleryImages() {
    try {
        const snapshot = await db.collection('gallery').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        return [];
    }
}

async function addGalleryImage(imageData) {
    try {
        if (imageData.imageFile) {
            const imageRef = storage.ref(`gallery/${imageData.imageFile.name}`);
            await imageRef.put(imageData.imageFile);
            imageData.imageUrl = await imageRef.getDownloadURL();
        }

        const docRef = await db.collection('gallery').add(imageData);
        return { id: docRef.id, ...imageData };
    } catch (error) {
        console.error('Error adding gallery image:', error);
        throw error;
    }
}

async function updateGalleryImage(id, imageData) {
    try {
        if (imageData.imageFile) {
            const imageRef = storage.ref(`gallery/${imageData.imageFile.name}`);
            await imageRef.put(imageData.imageFile);
            imageData.imageUrl = await imageRef.getDownloadURL();
        }

        await db.collection('gallery').doc(id).update(imageData);
        return { id, ...imageData };
    } catch (error) {
        console.error('Error updating gallery image:', error);
        throw error;
    }
}

async function deleteGalleryImage(id) {
    try {
        await db.collection('gallery').doc(id).delete();
        return { id };
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        throw error;
    }
}

// Products
async function getProducts() {
    try {
        const snapshot = await db.collection('products').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function addProduct(productData) {
    try {
        if (productData.imageFile) {
            const imageRef = storage.ref(`products/${productData.imageFile.name}`);
            await imageRef.put(productData.imageFile);
            productData.imageUrl = await imageRef.getDownloadURL();
        }

        const docRef = await db.collection('products').add(productData);
        return { id: docRef.id, ...productData };
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

async function updateProduct(id, productData) {
    try {
        if (productData.imageFile) {
            const imageRef = storage.ref(`products/${productData.imageFile.name}`);
            await imageRef.put(productData.imageFile);
            productData.imageUrl = await imageRef.getDownloadURL();
        }

        await db.collection('products').doc(id).update(productData);
        return { id, ...productData };
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

async function deleteProduct(id) {
    try {
        await db.collection('products').doc(id).delete();
        return { id };
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// Events
async function getEvents() {
    try {
        const snapshot = await db.collection('events').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

async function addEvent(eventData) {
    try {
        const docRef = await db.collection('events').add(eventData);
        return { id: docRef.id, ...eventData };
    } catch (error) {
        console.error('Error adding event:', error);
        throw error;
    }
}

async function updateEvent(id, eventData) {
    try {
        await db.collection('events').doc(id).update(eventData);
        return { id, ...eventData };
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
}

async function deleteEvent(id) {
    try {
        await db.collection('events').doc(id).delete();
        return { id };
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
}