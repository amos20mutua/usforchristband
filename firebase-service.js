import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    where,
    getDoc,
    serverTimestamp 
} from "firebase/firestore";
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "firebase/storage";
import { 
    signInWithEmailAndPassword,
    signOut 
} from "firebase/auth";
import { db, auth, storage } from './firebase-config';

// Authentication
export const loginAdmin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const logoutAdmin = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};

// Music Management
export const addSong = async (songData) => {
    try {
        const docRef = await addDoc(collection(db, "songs"), {
            ...songData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        throw error;
    }
};

export const getSongs = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "songs"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
};

export const updateSong = async (songId, songData) => {
    try {
        const songRef = doc(db, "songs", songId);
        await updateDoc(songRef, songData);
    } catch (error) {
        throw error;
    }
};

export const deleteSong = async (songId) => {
    try {
        await deleteDoc(doc(db, "songs", songId));
    } catch (error) {
        throw error;
    }
};

// Gallery Management
export const addGalleryImage = async (imageData, imageFile) => {
    try {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `gallery/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        // Add image data to Firestore
        const docRef = await addDoc(collection(db, "gallery"), {
            ...imageData,
            imageUrl,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        throw error;
    }
};

export const getGalleryImages = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "gallery"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        return [];
    }
};

export const deleteGalleryImage = async (imageId, imageUrl) => {
    try {
        // Delete from Storage
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);

        // Delete from Firestore
        await deleteDoc(doc(db, "gallery", imageId));
    } catch (error) {
        throw error;
    }
};

// Merchandise Management
export const addProduct = async (productData, productImage) => {
    try {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `products/${productImage.name}`);
        await uploadBytes(storageRef, productImage);
        const imageUrl = await getDownloadURL(storageRef);

        // Add product data to Firestore
        const docRef = await addDoc(collection(db, "products"), {
            ...productData,
            imageUrl,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        throw error;
    }
};

export const getProducts = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const updateProduct = async (productId, productData) => {
    try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, productData);
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async (productId, imageUrl) => {
    try {
        // Delete from Storage
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);

        // Delete from Firestore
        await deleteDoc(doc(db, "products", productId));
    } catch (error) {
        throw error;
    }
};

// Auditions Management
export const addAuditionRequest = async (data) => {
    try {
        const docRef = await addDoc(collection(db, "auditions"), {
            ...data,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding audition request:', error);
        throw error;
    }
};

export const getAuditionRequests = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "auditions"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw error;
    }
};

export const updateAuditionStatus = async (auditionId, status) => {
    try {
        const auditionRef = doc(db, "auditions", auditionId);
        await updateDoc(auditionRef, { status });
    } catch (error) {
        throw error;
    }
};

// Settings Management
export const updateSettings = async (settings) => {
    try {
        const settingsRef = doc(db, "settings", "site_settings");
        
        // Handle hero video upload if present
        if (settings.heroVideo && settings.heroVideo instanceof File) {
            const videoRef = ref(storage, `hero-videos/${Date.now()}_${settings.heroVideo.name}`);
            const snapshot = await uploadBytes(videoRef, settings.heroVideo);
            const videoUrl = await getDownloadURL(snapshot.ref);
            
            // Update settings with video URL
            settings.heroVideo = {
                mp4Url: videoUrl,
                webmUrl: videoUrl.replace('.mp4', '.webm') // Assuming WebM version is available
            };
        }
        
        await updateDoc(settingsRef, settings);
    } catch (error) {
        throw error;
    }
};

export const getSettings = async () => {
    try {
        const settingsRef = doc(db, "settings", "site_settings");
        const settingsDoc = await getDoc(settingsRef);
        
        if (!settingsDoc.exists()) {
            console.warn('No settings found, using default settings');
            return {
                siteTitle: 'Us For Christ Band',
                contactEmail: 'mutuaamos35@gmail.com',
                phoneNumber: '+254 105 255 479',
                facebookUrl: '#',
                instagramUrl: '#',
                youtubeUrl: '#',
                spotifyUrl: '#',
                heroVideo: {
                    mp4Url: 'assets/videos/hero-background.mp4',
                    webmUrl: 'assets/videos/hero-background.webm'
                },
                latestRelease: {
                    title: 'Coming Soon',
                    description: 'Our newest worship single is coming soon',
                    streamingLinks: {}
                }
            };
        }
        
        return settingsDoc.data();
    } catch (error) {
        console.error('Error fetching settings:', error);
        // Return default settings on error
        return {
            siteTitle: 'Us For Christ Band',
            contactEmail: 'mutuaamos35@gmail.com',
            phoneNumber: '+254 105 255 479',
            facebookUrl: '#',
            instagramUrl: '#',
            youtubeUrl: '#',
            spotifyUrl: '#',
            heroVideo: {
                mp4Url: 'assets/videos/hero-background.mp4',
                webmUrl: 'assets/videos/hero-background.webm'
            },
            latestRelease: {
                title: 'Coming Soon',
                description: 'Our newest worship single is coming soon',
                streamingLinks: {}
            }
        };
    }
};

// Add initialization check
export const checkFirebaseConnection = async () => {
    try {
        await getSettings();
        return true;
    } catch (error) {
        console.error('Firebase connection failed:', error);
        return false;
    }
};

// Events Management
export const getEvents = async () => {
    try {
        const eventsRef = collection(db, 'events');
        const querySnapshot = await getDocs(eventsRef);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting events:', error);
        throw error;
    }
};

export const addEvent = async (eventData) => {
    try {
        const eventsRef = collection(db, 'events');
        const docRef = await addDoc(eventsRef, {
            ...eventData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding event:', error);
        throw error;
    }
};

export const updateEvent = async (eventId, eventData) => {
    try {
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
            ...eventData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

export const deleteEvent = async (eventId) => {
    try {
        const eventRef = doc(db, 'events', eventId);
        await deleteDoc(eventRef);
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
}; 