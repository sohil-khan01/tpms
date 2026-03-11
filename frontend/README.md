# TPMS Frontend - Talent Profile Management System

> **TPMS (Talent Profile Management System)** frontend - a modern, responsive, and user-friendly web application for managing candidate profiles.

---

## 📋 Contents

- [What is This?](#-what-is-this)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Installation](#-installation)
- [How to Run?](#-how-to-run)
- [Components Guide](#-components-guide)
- [API Integration](#-api-integration)
- [Routing](#-routing)
- [Authentication](#-authentication)

---

## 🤔 What is This?

TPMS is a **Talent Profile Management System** that helps recruiters and hiring managers upload candidate resumes, analyze their skills, match job descriptions, and communicate with candidates.

This frontend is built with React.js and Tailwind CSS, providing a modern UI/UX experience.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | Building UI components |
| **Vite** | Fast development and building |
| **Tailwind CSS 4** | Modern styling |
| **React Router v7** | Page navigation |
| **React Icons** | Displaying icons |
| **Fetch API** | Fetching data from backend |

---

## 📁 Project Structure

```
frontend/
├── public/              # Static files (images, fonts)
├── src/
│   ├── components/      # React components (page parts)
│   │   ├── Login.jsx           # Login page
│   │   ├── Dashboard.jsx       # Dashboard (overview)
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   ├── UploadResume.jsx    # Resume upload page
│   │   ├── AllCandidates.jsx   # All candidates list
│   │   ├── JDMatcher.jsx       # Job description matcher
│   │   ├── MessagingCenter.jsx # Send messages to candidates
│   │   ├── ResumeCustomizer.jsx# Resume customizer
│   │   ├── AdminProfile.jsx    # Admin profile page
│   │   ├── CandidateProfile.jsx# Candidate details page
│   │   └── Settings.jsx        # App settings (dark mode, etc.)
│   │
│   ├── utils/           # Helper functions
│   │   └── api.js      # Backend API calls
│   │
│   ├── assets/         # Images, logos, etc.
│   ├── App.jsx         # Main app component (defines routes)
│   ├── main.jsx        # App entry point
│   ├── App.css         # Global styles
│   └── index.css       # Tailwind imports
│
├── index.html          # HTML template
├── package.json        # Dependencies list
├── vite.config.js      # Vite configuration
├── tailwind.config     # Tailwind CSS config (embedded in CSS)
└── .env                # Environment variables
```

---

## ✨ Features

### 1. **Authentication (Login)**
- Username/Password login
- JWT token based authentication
- Session saved in localStorage
- Logout functionality

### 2. **Dashboard**
- Overview of total candidates
- List of recent uploads
- Quick stats display
- Dark/Light mode support

### 3. **Resume Upload**
- Upload PDF resume files
- Drag & drop support
- Auto parsing (from backend)
- Upload progress indicator

### 4. **Candidates Management**
- List view of all candidates
- Search and filter options
- Individual candidate profile view
- Download resumes

### 5. **JD Matcher (Job Description Matcher)**
- Paste/upload job description
- AI-based candidate matching
- Display match scores (percentage)
- Suggest best candidates

### 6. **Messaging Center**
- Send emails/messages to candidates
- Template-based messaging
- Track message history
- Bulk messaging support

### 7. **Resume Customizer**
- Select resume templates
- Edit and preview resumes
- Download customized resume

### 8. **Settings**
- Dark Mode / Light Mode toggle
- Profile settings
- Notification preferences
- Update admin details

---

## 🚀 Installation

### Requirements:
- Node.js 18+ installed
- npm or yarn package manager

### Steps:

```bash
# 1. Go to project folder
cd tpms/frontend

# 2. Install dependencies
npm install

# 3. Set up environment (.env file)
# File: .env
cat .env
```

**`.env` file content:**
```
VITE_API_BASE_URL=http://localhost:8080/api
```

This tells where the backend is (API address).

---

## ▶️ How to Run?

### Development Mode (for development):

```bash
npm run dev
```

This starts the development server. Open browser:
- **http://localhost:5173**

And the app will be visible!

### Production Build (for final deployment):

```bash
npm run build
```

This creates a `dist/` folder which is production ready.

### Preview Production Build:

```bash
npm run preview
```

---

## 🐳 Run with Docker (Alternative)

You can also run the frontend using Docker without installing Node.js or dependencies.

### Requirements:
- Docker installed on your machine

### Steps:

```bash
# 1. Pull the Docker image
docker pull hoshiyar9351/tmps-frontend:latest

# 2. Run the container
docker run -p 3000:80 hoshiyar9351/tmps-frontend:latest
```

Then open browser: **http://localhost:3000**

The app will be running inside a Docker container!

---

## 🧩 Components Guide

### **App.jsx** - Main Brain
This file controls everything:
- Checks authentication
- Manages dark mode
- Defines routes
- Organizes sidebar and main content

```
┌─────────────────────────────────────┐
│  Sidebar │    Main Content          │
│  (Menu)  │    (Route component)     │
│          │                          │
│  - Dash  │   /dashboard → Dashboard │
│  - Upload│   /upload    → Upload    │
│  - JD    │   /candidates → AllCand  │
│  - etc.  │   /candidate/:id → Prof. │
└─────────────────────────────────────┘
```

### **Sidebar.jsx** - Navigation
- Fixed menu on the left side
- Links to all pages
- Mobile responsive (toggle hamburger menu)
- Displays user info

### **Dashboard.jsx** - Home Page
- Shows system overview
- Total candidates count
- Recent activity list
- Quick action buttons

### **UploadResume.jsx** - Resume Upload
- File selection area
- Drag & drop support
- Multiple file upload
- Success/error messages

### **AllCandidates.jsx** - Candidate List
- Candidates in table format
- Search bar
- Filter options (skills, experience, etc.)
- Profile view button

### **CandidateProfile.jsx** - Detail View
- Complete profile of individual candidate
- Personal details
- Skills, experience, education
- Resume view/download

### **JDMatcher.jsx** - AI Matching
- Job description input area
- Paste text or upload file
- Matches with candidates
- Shows results in percentage

### **MessagingCenter.jsx** - Communication
- Email templates
- Send messages to candidates
- Track history

### **Settings.jsx** - App Settings
- Dark mode toggle
- Profile management
- Other preferences

---

## 🔌 API Integration

### **api.js** - Backend Connection

This file communicates with the backend. Defined in `utils/api.js`.

#### API Endpoints:

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `authAPI.login()` | POST `/auth/login` | Login |
| `authAPI.logout()` | POST `/auth/logout` | Logout |
| `candidatesAPI.getAll()` | GET `/candidates` | Get all candidates |
| `candidatesAPI.getById(id)` | GET `/candidates/:id` | Get one candidate |
| `candidatesAPI.uploadResume()` | POST `/resumes/upload` | Upload resume |
| `jdAPI.matchCandidates()` | POST `/jd/match` | JD matching |
| `messagingAPI.sendMessage()` | POST `/messaging/send` | Send message |
| `dashboardAPI.getStats()` | GET `/dashboard/stats` | Get stats |

### **Example API Call:**

```javascript
import { candidatesAPI } from './utils/api';

// Fetch all candidates
const data = await candidatesAPI.getAll();
console.log(data); // Candidates list
```

### **Error Handling:**
- Network errors are caught
- 401 (Unauthorized) → Redirect to login page
- 500 (Server Error) → Shows message to user

---

## 🛣️ Routing

React Router is used for navigation.

### **Routes Table:**

| URL | Component | What It Shows |
|-----|-----------|---------------|
| `/` | → `/dashboard` redirect | After login |
| `/login` | Login.jsx | Login form |
| `/dashboard` | Dashboard.jsx | Overview |
| `/upload` | UploadResume.jsx | Resume upload |
| `/candidates` | AllCandidates.jsx | Candidate list |
| `/candidate/:id` | CandidateProfile.jsx | Candidate details |
| `/jd-matcher` | JDMatcher.jsx | JD matching tool |
| `/messaging` | MessagingCenter.jsx | Message center |
| `/customizer` | ResumeCustomizer.jsx | Resume editor |
| `/profile` | AdminProfile.jsx | Admin profile |
| `/settings` | Settings.jsx | App settings |

### **Protected Routes:**
If user is not logged in, it will show `Login` component without routes.

---

## 🔐 Authentication

### **Login Flow:**
1. User enters username/password → `Login.jsx`
2. `authAPI.login()` sends request to backend
3. Backend returns JWT token
4. Token is saved in `localStorage`
5. `App.jsx` sets `isAuthenticated = true`
6. Dashboard becomes visible

### **Logout Flow:**
1. Click logout button → `handleLogout()`
2. `authAPI.logout()` sends request to backend
3. Delete token, user data from `localStorage`
4. `isAuthenticated = false`
5. Login page becomes visible

### **Token Storage:**
```javascript
// Save token
localStorage.setItem('authToken', token);
localStorage.setItem('adminUser', JSON.stringify(userData));
localStorage.setItem('isAuthenticated', 'true');

// Get token
const token = localStorage.getItem('authToken');
```

---

## 🎨 Dark Mode

Toggle is available in **Settings**.

- `darkMode` state is managed in `App.jsx`
- Preference is saved in `localStorage`
- Applied via `document.documentElement.classList.add('dark')`
- Dark styles are applied using Tailwind `dark:` prefix

**Example:**
```jsx
<div className={`${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
  {/* Content */}
</div>
```

---

## 📱 Responsive Design

Tailwind CSS breakpoints are used:

- **Mobile** (< 768px): Sidebar hide, hamburger menu
- **Tablet** (768px - 1024px): Sidebar collapsible
- **Desktop** (> 1024px): Full sidebar visible

---

## 🐛 Common Issues & Solutions

### Issue: Backend not connecting
```
Solution: Check .env file, API_BASE_URL should be correct
```

### Issue: Login not working
```
Solution: Check if backend server is running (port 8080)
```

### Issue: Build failing
```
Solution: Run npm install again, dependencies might be missing
```

---

## 📦 NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start development server |
| `build` | `vite build` | Create production build |
| `preview` | `vite preview` | Preview the build |
| `lint` | `eslint .` | Check code for errors |

---

## 🔗 Backend Connection

Frontend connects to backend at this address:
```
http://localhost:8080/api
```

**Important:** Backend server (`tpms/backend`) should be running for frontend to work.

To run backend:
```bash
cd tpms/backend
# (Follow backend instructions)
```

---

## 📝 Summary

This frontend is a **Single Page Application (SPA)** built with React that:
- Uploads and manages resumes
- Tracks candidate profiles
- Matches job descriptions
- Supports Dark/Light mode
- Is mobile responsive

**Main Entry Point:** `src/main.jsx` → `src/App.jsx` → Components

**Data Flow:** Component → api.js → Backend → Response → UI Update

---

**Happy Coding! 🚀**

*If any issue occurs, check the backend server and look for errors in browser console.*
