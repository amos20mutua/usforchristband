# Us For Christ Band Website

This is the official website for the Us For Christ Band.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## Deployment

### Netlify Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Go to [Netlify](https://app.netlify.com/) and sign up/login

3. Click "Add new site" > "Import an existing project"

4. Choose your Git provider and select your repository

5. Configure the build settings:
   - Build command: leave empty
   - Publish directory: `.`

6. Add the following environment variables in Netlify:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`

7. Click "Deploy site"

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Authentication (Email/Password)

3. Create a Firestore database

4. Enable Storage

5. Create an admin user in Firebase Authentication

## Admin Access

Access the admin panel at `/admin/login.html` using your Firebase admin credentials.

## Features

- Responsive design
- Dynamic content management
- Music streaming integration
- Photo gallery
- Merchandise store
- Audition system
- Admin dashboard 