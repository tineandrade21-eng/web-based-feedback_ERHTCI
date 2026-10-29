# El Royale Feedback System: project guide

## Folder structure
```
el-royale-feedback/
├── index.html              Page shell (loads the CSS and app.js)
├── css/
│   └── style.css           All styling, including dark mode and mobile layout
├── js/
│   ├── firebase-config.js  YOUR Firebase settings (the only file you must edit)
│   ├── firebase.js         All Firebase code: login, register, save and read feedback
│   ├── utils.js            Categories, courses, and small helper functions
│   └── app.js              Pages (views), buttons and page navigation
└── FIREBASE-SETUP.md       This guide
```
Where to change things:
- Categories, courses, year levels, statuses: `js/utils.js`
- Colors and fonts: top of `css/style.css`
- Page layouts: the `...HTML` functions in `js/app.js`
- Database or login behavior: `js/firebase.js`

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com and click **Add project**.
2. Click the **</>** (Web) icon to register a web app.
3. Copy the config values into `js/firebase-config.js`.

## 2. Turn on Authentication
Build > Authentication > Get started > Sign-in method > enable **Email/Password**.

## 3. Create the Firestore database
Build > Firestore Database > Create database (production mode, closest region).

## 4. Publish the security rules
Firestore Database > Rules tab > replace everything with the rules below > Publish.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{uid} {
      allow create: if request.auth != null && request.auth.uid == uid
                    && request.resource.data.role == 'student';
      allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow update, delete: if false;
    }

    match /feedback/{id} {
      allow create: if request.auth != null
                    && request.resource.data.uid == request.auth.uid
                    && request.resource.data.status == 'New';
      allow read: if request.auth != null
                  && (isAdmin() || resource.data.uid == request.auth.uid);
      allow update: if isAdmin()
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']);
      allow delete: if false;
    }
  }
}
```

## 5. Create the administrator account (one time, by hand)
1. Authentication > Users > **Add user**. Email: `admin@elroyale-feedback.app`, with a strong password. The login username is the part before the @, so here it is `admin`.
2. Copy that user's **User UID**.
3. Firestore Database > **Start collection** `users` > Document ID = the UID > add these string fields:
   - `role` = `admin`
   - `first` = `Admin`
   - `last` = `Administrator`
   - `username` = `admin`

Students register themselves and always get the `student` role.

## 6. Run it
The page uses JavaScript modules, so it must be served over http(s). Do not double-click index.html.
- Local: VS Code **Live Server** extension, or run `npx serve` inside the folder.
- Online: Firebase Hosting (`firebase deploy`), Netlify, or GitHub Pages. For a domain other than Firebase's, add it under Authentication > Settings > **Authorized domains**.
