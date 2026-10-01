# NEC Grievance Redressal Portal

A complete, modern college grievance portal consisting of a **React (Vite) frontend** and an **Express / Node.js backend**.

---

## 📁 Project Structure

```
grievance-portal/
├── backend/
│   ├── server.js                # Express REST API, CORS & Nodemailer logic
│   ├── package.json
│   ├── .env                     # Local backend environment variables
│   ├── .env.example             # Example environment file for backend
│   ├── data/
│   │   └── grievances.json      # JSON persistence store (submissions)
│   └── uploads/                 # Uploaded grievance attachments
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx       # Header with branding, contact info & auth links
    │   │   └── Footer.jsx       # Footer component
    │   ├── config/
    │   │   └── api.js           # Centralized API configuration (VITE_API_URL)
    │   ├── services/
    │   │   └── api.js           # Centralized API communication & error handling
    │   ├── pages/
    │   │   ├── Home.jsx         # Portal welcome page & committee details
    │   │   ├── GrievanceForm.jsx# Interactive submission form with dynamic fields
    │   │   ├── AdminLogin.jsx   # Admin authentication page
    │   │   └── AdminDashboard.jsx# Admin management dashboard & CSV export
    │   ├── App.jsx              # React Router configuration
    │   ├── main.jsx             # React entry point
    │   └── index.css            # Responsive CSS design system
    ├── public/
    ├── .env                     # Local frontend environment variables
    ├── .env.example             # Example environment file for frontend
    ├── index.html               # Vite HTML entry point
    ├── package.json
    ├── vite.config.js           # Vite configuration
    ├── vercel.json              # Vercel SPA routing rewrites
    └── legacy-html/             # Backed-up original HTML files
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend
npm install
```

Ensure `backend/.env` has:
```env
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="NEC Grievance Portal <your-email@gmail.com>"
ADMIN_EMAIL=principal@nec.edu.in
CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000,https://grievanceportalfrontend-frontendgri.vercel.app
FRONTEND_URL=https://grievanceportalfrontend-frontendgri.vercel.app
```

Run the backend server:
```bash
npm start
```
*Backend runs on `http://localhost:5000`.*

---

### 2. Frontend Setup

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🛠️ Production Build & Verification

To verify that the frontend builds without errors:
```bash
cd frontend
npm run build
```

---

## 🌐 Deploying the Backend (e.g. Render / Railway / Server)

1. Deploy the `backend/` directory to your chosen hosting service (such as Render or Railway).
2. Set Environment Variables on the backend host:
   - `PORT`: (provided automatically or 5000)
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `465` (or `587`)
   - `SMTP_USER`: your sending email address
   - `SMTP_PASS`: your Google App Password (or college mail server password)
   - `MAIL_FROM`: `"NEC Grievance Portal <your-email>"`
   - `ADMIN_EMAIL`: comma-separated admin emails
   - `CLIENT_ORIGIN`: `https://grievanceportalfrontend-frontendgri.vercel.app`
   - `FRONTEND_URL`: `https://grievanceportalfrontend-frontendgri.vercel.app`
3. Note down your deployed backend URL (e.g., `https://my-grievance-backend.onrender.com`).

---

## ⚡ Deploying the React Frontend to Vercel

1. In Vercel, connect your Git repository.
2. In Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (or `./` if the repo only contains the frontend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. In **Environment Variables** on Vercel, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://my-grievance-backend.onrender.com` (Your deployed backend URL)
4. Deploy!
   - `vercel.json` already configures SPA routing (`/(.*)` -> `/index.html`) so refreshing routes like `/register` or `/admin/dashboard` will never return 404.
