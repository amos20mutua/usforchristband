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
        throw error;
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
        throw error;
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
        throw error;
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
export const addAuditionRequest = async (auditionData) => {
    try {
        const docRef = await addDoc(collection(db, "auditions"), {
            ...auditionData,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
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
        await updateDoc(settingsRef, settings);
    } catch (error) {
        throw error;
    }
};

export const getSettings = async () => {
    try {
        const settingsRef = doc(db, "settings", "site_settings");
        const settingsDoc = await getDoc(settingsRef);
        return settingsDoc.exists() ? settingsDoc.data() : null;
    } catch (error) {
        throw error;
    }
}; 