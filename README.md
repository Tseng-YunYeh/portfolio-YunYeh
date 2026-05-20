# Portfolio - Yun Yeh Tseng

Welcome to my creative portfolio website! This is a modern, fully-featured portfolio showcasing my work in web development, video production, and graphic design.

## 🌐 Live Portfolio

Visit my portfolio here: **[https://portfolio-yunyeh.web.app/](https://portfolio-yunyeh.web.app/)**

---

## 📋 About This Project

This portfolio is a React-based web application that showcases my professional work across three main categories:

### **Web Development**
- RSEQ Website Redesign - A complete redesign focusing on user experience and modern aesthetics

### **Video Production**
- Robot Showcase - Cinematic 3D rendering and video editing
- Movie Trailer - Professional trailer editing
- Loup-Garou: La Nuit - Animated short film with original illustrations

### **Graphic Design**
- Les Gardiens Bleus - Poster designs exploring color theory
- Sunset Scenes - Digital paintings series
- And more design projects showcasing creative direction

---

## ✨ Key Features

- **Multi-Language Support** - Available in English, French, Spanish, and Chinese
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Admin Dashboard** - Secure authentication for portfolio management
- **Contact Form** - Direct email communication via EmailJS
- **Project Filtering** - Browse projects by category (Web, Video, Design)
- **SEO Optimized** - Proper meta tags and SEO setup for search engine visibility
- **Dark Mode Support** - Theme switching capability
- **Firebase Integration** - Real-time database and hosting

---

## 🛠 Tech Stack

### Frontend
- **React** 19.2 - UI library
- **React Router** 7.13 - Client-side routing
- **Vite** 7.3 - Build tool and dev server

### Backend & Services
- **Firebase** 12.13 - Authentication, Firestore database, and hosting
- **EmailJS** 4.4 - Email communication

### UI & Icons
- **React Icons** 5.6 - Icon library for UI elements

### Development Tools
- **ESLint** - Code quality and linting
- **Globals** - Global variables for linting

---

## 📂 Project Structure

```
portfolio-YunYeh/
├── src/
│   ├── components/          # Reusable React components
│   │   └── ProtectedRoute.jsx
│   ├── context/             # Context API for state management
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── firebase/            # Firebase configuration
│   │   ├── init.js
│   │   └── project-modele.js
│   ├── hooks/               # Custom React hooks
│   │   └── useSeo.js        # SEO meta tag management
│   ├── i18n/                # Internationalization files
│   │   ├── en.json
│   │   ├── fr.json
│   │   ├── es.json
│   │   └── zh.json
│   ├── data/                # Static data
│   │   └── projects.json    # Portfolio projects data
│   ├── admin-page/          # Admin dashboard
│   │   ├── Admin.jsx
│   │   └── Admin.css
│   ├── App.jsx              # Main app component
│   ├── App.css
│   ├── main.jsx             # Entry point
│   └── index.css
├── public/                  # Static assets
│   ├── imgs/                # Portfolio images
│   ├── pdfs/                # CV documents
│   ├── videos/              # Video projects
│   └── webs/                # Web project files
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
├── firebase.json            # Firebase configuration
├── firestore.indexes.json   # Firestore indexes
├── firestore.rules          # Firestore security rules
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-YunYeh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (if needed)
   - Update `src/firebase/init.js` with your Firebase credentials

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

---

## 📝 Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build optimized production bundle
- **`npm run preview`** - Preview the production build locally
- **`npm run lint`** - Run ESLint to check code quality
- **`npm run ghp`** - Deploy to GitHub Pages (runs build first)

---

## 🔐 Authentication

The admin dashboard is protected with Firebase authentication. Only authorized users can access the admin panel to manage portfolio content.

---

## 📧 Contact

The contact form is powered by **EmailJS**, allowing visitors to reach out directly through the portfolio website.

---

## 🌍 Internationalization

The portfolio supports 4 languages:
- **English** (en)
- **French** (fr)
- **Spanish** (es)
- **Mandarin** (zh)

Language files are located in `src/i18n/` and can be easily updated or extended.

---

## 📤 Deployment

This portfolio is deployed on **Firebase Hosting**. To deploy your own version:

```bash
npm run build
npm run ghp
```

Or use Firebase CLI:
```bash
firebase deploy
```

---

## 🎨 Customization

### Add New Projects
Edit `src/data/projects.json` to add new projects to your portfolio.

### Update Translations
Modify files in `src/i18n/` to update content in different languages.

### Styling
- Global styles: `src/App.css` and `src/index.css`
- Component-specific styles: Adjacent `.css` files

---

## 📄 License

This project is personal and private. All rights reserved.

---

## 👤 Author

**Yun Yeh Tseng** - Creative Developer & Designer

Visit my portfolio: [https://portfolio-yunyeh.web.app/](https://portfolio-yunyeh.web.app/)

---

## 📞 Contact & Connect

For inquiries or collaboration opportunities, please visit the contact page on my portfolio website.

---

*Last updated: May 2026*