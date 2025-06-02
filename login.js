// Import Firebase configuration
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loadingSpinner = loginBtn.querySelector('.loading');

// Show notification
function showNotification(message, type = 'error') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Please fill in all fields');
        return;
    }
    
    try {
        // Show loading state
        loginBtn.disabled = true;
        loadingSpinner.classList.add('active');
        
        // Attempt login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if user is admin
        const idTokenResult = await user.getIdTokenResult();
        if (!idTokenResult.claims.admin) {
            // Sign out if not admin
            await auth.signOut();
            throw new Error('Access denied. Admin privileges required.');
        }
        
        // Show success message
        showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        let errorMessage = 'An error occurred during login';
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later';
                break;
        }
        
        showNotification(errorMessage);
        
    } finally {
        // Reset loading state
        loginBtn.disabled = false;
        loadingSpinner.classList.remove('active');
    }
});

// Check if user is already logged in
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            // Check if user is admin
            const idTokenResult = await user.getIdTokenResult();
            if (idTokenResult.claims.admin) {
                // Redirect to dashboard if already logged in as admin
                window.location.href = 'dashboard.html';
            } else {
                // Sign out if not admin
                await auth.signOut();
            }
        } catch (error) {
            console.error('Auth state check error:', error);
        }
    }
}); 