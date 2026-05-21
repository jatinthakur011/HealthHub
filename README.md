# 🏥 HealthHub — Digital Healthcare Platform

<div align="center">

![HealthHub Banner](https://img.shields.io/badge/HealthHub-Healthcare%20Platform-0ea5e9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjIgMjIgMTcuNTIgMjIgMTIgMTcuNTIgMiAxMiAyek0xMyAxN0gxMVYxNUgxM1YxN1pNMTMgMTNIMTFWN0gxM1YxM1oiLz48L3N2Zz4=)

**A full-stack web-based healthcare platform connecting patients, doctors, and donors through online appointment booking, real-time chat & video consultations, and an emergency blood request system.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Appwrite](https://img.shields.io/badge/Appwrite-Auth-FD366E?logo=appwrite)](https://appwrite.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

</div>

---
## 🔗 Live Project & Documentation

### 🌐 Live Demo
👉 [Open HealthHub Live](https://healthhubmain.vercel.app)

### 📄 Project Report
👉 [View Full Project Report](./HealthHub_Final_Report-T.docx)

### 📊 Project Presentation (PPT/PDF)
👉 [View Project Presentation PDF](./IOHE_Final-HealtHub.pdf)

### 💻 GitHub Repository
👉 https://github.com/jatinthakur011/HealthHub

---

---

## 🎓 Team Information

- **Project Title:** HealthHub — Digital Healthcare Platform
- **Project Type:** Copyright — (Diary No.- 'LD-20136/2026-CO')
- **Submission Status:** Final Submission (Viva Ready)
- **University:** Chitkara University, Rajpura, Punjab
- **Supervisor:** Ajay Kumar (akumar@chitkara.edu.in)

| Name | Roll Number | Role |
| :--- | :--- | :--- |
| **Naimish Sharma** | 2211981232 | Full-Stack Developer |
| **Jatin Thakur** | 2211981182 | Full-Stack Developer (Copyright Uploader) |

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Role-Based Access](#-role-based-access)
- [API Routes](#-api-routes)
- [Key Design Decisions](#-key-design-decisions)

---

## 🌟 Overview

HealthHub is a web-based healthcare platform built to bridge the gap between patients, doctors, and donors. It eliminates the inefficiencies of traditional healthcare — long wait times, manual appointment scheduling, and poor emergency coordination — by digitising the entire experience in one unified system.

```
Patient registers → Browses doctor profiles → Books appointment
→ Consults via chat or video call → Doctor responds in real time
→ Appointment completed → Patient leaves review

Patient in emergency → Raises blood request → Donors notified
→ Donor responds → Emergency coordinated digitally
```

---

## ✨ Features

### For Patients
| Feature | Description |
|---|---|
| 🔐 Authentication | Secure sign-up and login via Appwrite + JWT |
| 👨‍⚕️ Browse Doctors | View doctor profiles with specialization, experience, and ratings |
| 📅 Book Appointments | Schedule appointments based on doctor availability |
| 💬 Chat Consultation | Real-time messaging with doctors via Socket.io |
| 📹 Video Consultation | Face-to-face video calls with doctors using WebRTC |
| 🩸 Blood Request | Raise an emergency blood request and connect with donors |
| 🔔 Notifications | Real-time alerts for appointment updates and messages |
| ⭐ Reviews | Leave ratings and reviews for doctors after consultation |

### For Doctors
| Feature | Description |
|---|---|
| 🏥 Doctor Dashboard | Overview of appointments, patient messages, and schedule |
| 📋 Profile Management | Manage specialization, availability, and medical license |
| 📅 Appointment Handling | Accept or reject incoming booking requests |
| 💬 Patient Chat | In-platform real-time messaging with patients |
| 📹 Video Calls | Initiate or accept video consultation sessions |
| 📞 Incoming Call Listener | Real-time call invites with accept/decline modal |
| 📄 License Upload | Upload and manage medical license documents (PDF) |
| 📢 Doctor Application | Apply to be listed on the platform (Admin-reviewed) |

### For Donors
| Feature | Description |
|---|---|
| 🩸 Blood Requests Feed | Browse all open emergency blood requests |
| ✅ Respond to Requests | Accept a request and coordinate with the patient |
| 📋 Request Details | View blood type, location, and urgency per request |

### For Admins
| Feature | Description |
|---|---|
| 🛠 Application Review | Approve or reject doctor onboarding applications |
| 📋 Complaints Management | View and resolve complaints raised by users |
| 👥 Doctor Registry | Add, edit, or remove doctors from the platform |

---

## 🛠 Tech Stack

### Frontend
```
React 18 + Vite           — UI framework and build tool
React Router DOM v6       — Client-side routing with protected routes
Redux Toolkit             — Global state management (auth, role switching)
Appwrite JS SDK           — Patient authentication and session management
Axios                     — HTTP client for backend API calls
Tailwind CSS + Shadcn UI  — Utility-first styling with accessible components
MUI (Material UI)         — Additional UI components and icons
Socket.io Client          — Real-time bidirectional chat messaging
WebRTC                    — Peer-to-peer video consultation
React Hook Form           — Form state and validation
React Toastify            — Toast notifications
Leaflet                   — Map integration for hospital/clinic locations
```

### Backend
```
Node.js + Express         — REST API server (ESM modules)
Mongoose                  — MongoDB ODM for schema and query management
MongoDB Atlas             — Primary cloud database
JSON Web Tokens (JWT)     — Doctor authentication and session management
bcryptjs                  — Password hashing for doctor accounts
Multer                    — File/image/PDF upload handling
Socket.io                 — Real-time event broadcasting
Cookie Parser             — Secure HTTP-only cookie management
```

### Infrastructure
```
Vercel                    — Frontend deployment
Render / Node Server      — Backend deployment
MongoDB Atlas             — Cloud-hosted database
Appwrite Cloud            — Patient auth + session storage
```

---

## 📁 Project Structure

```
Healthhub/
├── backend/
│   └── src/
│       ├── models/
│       │   ├── BloodRequest.js       # Blood request schema (type, location, urgency)
│       │   ├── bookings.js           # Appointment booking schema
│       │   ├── CallInvite.js         # Incoming video call invite schema
│       │   ├── Complaint.js          # User complaints schema
│       │   ├── Doctor.js             # Doctor profile schema
│       │   ├── DoctorApplication.js  # Doctor onboarding application schema
│       │   ├── Message.js            # Chat message schema
│       │   ├── Review.js             # Doctor review and rating schema
│       │   └── VideoCallLink.js      # Video call room/link schema
│       │
│       ├── routes/
│       │   ├── auth.js               # Patient register, login, logout, profile
│       │   ├── doctors.js            # Doctor listing, profile, availability
│       │   ├── booking.js            # Create, update, cancel appointments
│       │   ├── blood.js              # Raise and respond to blood requests
│       │   ├── messages.js           # Chat messages between patient and doctor
│       │   ├── calls.js              # Call invite creation and management
│       │   ├── videoCallLinks.js     # Video call room link generation
│       │   ├── applications.js       # Doctor application submission and review
│       │   ├── reviews.js            # Submit and fetch doctor reviews
│       │   ├── complaints.js         # Raise and manage complaints
│       │   └── uploads.js            # File/image upload handling (Multer)
│       │
│       ├── utils/
│       │   ├── licensePdf.js         # Medical license PDF generation logic
│       │   └── templateLicensePdf.js # PDF template for doctor license certificates
│       │
│       └── server.js                 # Express app, MongoDB connection, route registration
│
└── src/  (Frontend)
    ├── appwrite/
    │   ├── auth.js                   # Appwrite patient auth (login, signup, logout)
    │   ├── authDoc.js                # Appwrite doctor auth helpers
    │   ├── blood.js                  # Appwrite blood request helpers
    │   └── config.js                 # Appwrite project configuration
    │
    ├── services/
    │   ├── auth.js                   # Patient API service calls
    │   ├── doctors.js                # Doctor API service calls
    │   ├── blood.js                  # Blood request API service calls
    │   ├── messages.js               # Chat API service calls
    │   ├── calls.js                  # Call invite API service calls
    │   ├── reviews.js                # Reviews API service calls
    │   └── videoCall.js              # Video call link API service
    │
    ├── store/
    │   ├── authSlice.js              # Redux slice: login, logout, switchRole
    │   └── store.js                  # Redux store configuration
    │
    ├── hooks/
    │   └── useInView.js              # Intersection observer hook for scroll animations
    │
    ├── components/
    │   ├── header/
    │   │   ├── Header.jsx            # Responsive navbar with role-aware navigation
    │   │   └── LogoutBtn.jsx         # Logout button with Redux dispatch
    │   ├── home/
    │   │   ├── Home.jsx              # Landing page hero and feature sections
    │   │   ├── DocPost.jsx           # Featured doctor cards on landing page
    │   │   └── Location.jsx          # Hospital/clinic location map (Leaflet)
    │   ├── blood/
    │   │   ├── Blood.jsx             # Blood donation landing section
    │   │   ├── Form.jsx              # Blood request submission form
    │   │   ├── AllReq.jsx            # All open blood requests list
    │   │   ├── ReqCard.jsx           # Single blood request card component
    │   │   └── ReqPage.jsx           # Full blood request detail page
    │   ├── doctors/
    │   │   ├── Doctors.jsx           # Doctor listing page with search/filters
    │   │   └── BookAppointment.jsx   # Appointment booking dialog
    │   ├── about/About.jsx           # About / mission page
    │   ├── contact/Contact.jsx       # Contact page
    │   ├── Signup/
    │   │   ├── Signup.jsx            # Patient registration form
    │   │   └── DocSignup.jsx         # Doctor registration + license upload form
    │   ├── Login.jsx                 # Patient login form
    │   ├── AuthLayout.jsx            # Protected route wrapper (checks Redux auth state)
    │   ├── IncomingCallListener.jsx  # Global listener for incoming video call invites
    │   ├── SessionSwitcher.jsx       # Toggle between patient and doctor sessions
    │   └── footer/Footer.jsx         # Site footer
    │
    └── pages/
        ├── doctor/
        │   ├── DoctorHome.jsx        # Doctor's main dashboard home page
        │   ├── DoctorDashboard.jsx   # Appointments, patient stats, schedule overview
        │   └── DoctorLogin.jsx       # Doctor-specific login page
        ├── room/
        │   ├── Room.jsx              # Full WebRTC video call room
        │   ├── Video.jsx             # Individual video stream component
        │   └── WebrtcRoom.jsx        # WebRTC room wrapper and signalling
        ├── Doctor.jsx                # Public doctor profile page
        ├── DoctorEmail.jsx           # Doctor lookup by email
        ├── AdminApplications.jsx     # Admin: review and approve doctor applications
        ├── AdminComplaints.jsx       # Admin: view and resolve user complaints
        ├── AddDoc.jsx                # Admin: manually onboard a new doctor
        ├── AllDoc.jsx                # Admin: list and manage all doctors
        ├── EditDoc.jsx               # Admin: edit a doctor's profile
        ├── Notification.jsx          # Notification centre page
        ├── NotfCard.jsx              # Single notification card component
        └── VideoCall.jsx             # Video call entry point / lobby page
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- An [Appwrite](https://appwrite.io) project (for patient auth)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/healthhub.git
cd healthhub
```

### 2. Install dependencies

```bash
# Frontend (root)
npm install

# Backend
cd backend && npm install
```

### 3. Set up environment variables

See [Environment Variables](#-environment-variables) below.

### 4. Start development servers

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173) — from project root
npm run dev
```

---

## 🔑 Environment Variables

### Frontend `.env`
```env
VITE_APPWRITE_URL=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
VITE_APPWRITE_BUCKET_ID=your_bucket_id
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend `backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.XXXXXXXX.mongodb.net/lifelink?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
```

> ⚠️ If your MongoDB password contains special characters, URL-encode them (e.g. `@` → `%40`).

---

## 👥 Role-Based Access

```
New user arrives → Chooses sign-up type
                            ↓
              ┌─────────────┴──────────────┐
          PatientApp                   DoctorApp
       (Appwrite Auth)              (JWT + MongoDB)
       role: 'user'                 role: 'doctor'
```

Both sessions are maintained simultaneously in Redux state. `SessionSwitcher` allows toggling between them if a user holds both roles. `AuthLayout` guards protected routes by reading `auth.status` from the Redux store. Doctors who land on `/` are automatically redirected to `/doctor-home`.

---

## 🌐 API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Patient registration |
| POST | `/api/auth/login` | Patient login |
| POST | `/api/auth/logout` | Patient logout |
| GET | `/api/doctors` | List all doctors with filters |
| GET | `/api/doctors/:id` | Get a specific doctor's profile |
| POST | `/api/booking` | Create an appointment |
| PUT | `/api/booking/:id` | Update appointment status |
| GET | `/api/booking/:doctorId` | Get bookings for a doctor |
| GET | `/api/messages/:roomId` | Fetch chat messages for a room |
| POST | `/api/messages` | Send a chat message |
| GET | `/api/blood` | List all open blood requests |
| POST | `/api/blood` | Raise a new blood request |
| PUT | `/api/blood/:id` | Update blood request status |
| POST | `/api/calls` | Create a call invite |
| GET | `/api/calls/:doctorId` | Get incoming calls for a doctor |
| POST | `/api/video-call-links` | Generate a video room link |
| POST | `/api/doctor-applications` | Submit a doctor onboarding application |
| GET | `/api/doctor-applications` | Admin: list all applications |
| POST | `/api/reviews` | Submit a doctor review |
| GET | `/api/reviews/:doctorId` | Get reviews for a doctor |
| POST | `/api/complaints` | Submit a complaint |
| GET | `/api/complaints` | Admin: list all complaints |
| POST | `/api/uploads` | Upload image or document (Multer) |

---

## 🏗 Key Design Decisions

- **Dual authentication model** — Patients authenticate via Appwrite (OAuth-ready, cloud-managed sessions) while Doctors authenticate via custom JWT stored in HTTP-only cookies. Both sessions coexist in the Redux store with a `switchRole` action.
- **WebRTC for video** — Peer-to-peer video calls run directly between patient and doctor via WebRTC, with call invites and signalling coordinated through the backend `calls` API and Socket.io.
- **Socket.io for chat** — Real-time messaging uses Socket.io rooms keyed on a `roomId`, creating isolated chat channels per doctor-patient pair with no polling.
- **Multer for file uploads** — Doctor license PDFs and profile images are stored on the server filesystem via Multer and served as static assets under `/uploads`.
- **Role-aware startup** — `App.jsx` runs a parallel `Promise.allSettled` on both patient and doctor session checks at mount, dispatching the correct role to Redux and redirecting without a visible flash.
- **IncomingCallListener** — A globally-mounted component that polls for call invites while a doctor is logged in, surfacing an accept/decline modal without disrupting the current page.
- **Admin module** — Dedicated admin pages (`AdminApplications`, `AdminComplaints`, `AllDoc`, `AddDoc`, `EditDoc`) provide full oversight of the doctor registry, onboarding pipeline, and complaint resolution.
- **License PDF generation** — The backend auto-generates a medical license certificate PDF on doctor approval using a custom template, giving newly approved doctors a downloadable credential.

---

## 📝 License

MIT © 2026 HealthHub Team

---

<div align="center">
Made with ❤️ by Naimish Sharma & Jatin Thakur — Chitkara University
</div>
