<div align="center">
  <img src="public/logo.png" alt="Ravell Networks Logo" width="120" />
  <h1>Ravell Networks Frontend</h1>
  <p><em>Architecting Secure Digital Infrastructures</em></p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  </p>
</div>

---

## 📖 Overview

Welcome to the **Ravell Networks** frontend repository. This project serves as a modern, high-performance technical blog and knowledge base, specifically engineered for professionals in **Network Engineering** and **Cybersecurity**. 

Built with React, TypeScript, and Tailwind CSS, this platform prioritizes speed, responsive design, and an exceptional reading experience. It features dynamic markdown rendering, syntax highlighting for code snippets, and a sophisticated SEO implementation.

---

## ✨ Key Features

### 🎨 Modern UI/UX Architecture
- **Holy Grail Layout:** An intuitive three-column design featuring persistent left navigation, a focused reading area, and a context-aware right sidebar.
- **Smart Theming:** Seamless Dark/Light mode toggle with system preference detection and state persistence.
- **Micro-interactions:** Fluid animations, including slide-ins, fade-ins, and scroll-aware dynamic headers.
- **Responsive Design:** A mobile-first approach ensuring pixel-perfect rendering across all device breakpoints.
- **Performance First:** Integrated Skeleton Loading states to prevent Cumulative Layout Shifts (CLS) during data fetching.

### 📝 Content & Reading Experience
- **Advanced Markdown:** Fully supports GitHub Flavored Markdown (GFM) via `react-markdown`.
- **Code Highlighting:** Integrated `react-syntax-highlighter` mimicking a VS Code terminal environment.
- **Intelligent Navigation:** 
  - Auto-generated, scroll-spy enabled Table of Contents (ToC).
  - Dynamic breadcrumb trails for spatial awareness.
- **Interactive Media:** Click-to-zoom image lightboxes for detailed diagram inspection.
- **Reading Utility:** A sticky reading progress bar to track article completion.

### 🔍 Discovery & SEO
- **Robust Search & Filtering:** Filter articles by categories, tags, or perform full-text queries.
- **Timeline Archive:** A chronological timeline view of all published content.
- **Optimized SEO:** Fully integrated `react-helmet-async` providing dynamic meta tags, Open Graph protocols, and Twitter Cards for rich social sharing.

---

## 💻 Tech Stack

### Core Technologies
- **Framework:** React 19
- **Language:** TypeScript
- **Bundler:** Vite
- **Routing:** React Router v7

### Styling & UI
- **CSS Framework:** Tailwind CSS v4
- **Icons:** Lucide React & FontAwesome
- **Animations:** Framer Motion & Tailwind Animate
- **Typography:** `@tailwindcss/typography`

### Data & Content
- **Data Fetching:** Axios & TanStack React Query
- **Markdown Handling:** `react-markdown`, `remark-gfm`
- **SEO:** `react-helmet-async`

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/USERNAME/ravell-frontend.git
   cd ravell-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` to view the application.

---

## 📂 Project Structure

```text
ravell-frontend/
├── public/                 # Static assets (robots.txt, sitemap.xml, images)
├── src/
│   ├── assets/             # Global CSS and local assets
│   ├── components/         # Reusable UI components (SEO, Header, Cards)
│   ├── context/            # Global React Contexts (Theme, Sidebar)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route-level components (Home, ArticleDetail)
│   ├── services/           # API integration and HTTP clients
│   ├── types/              # TypeScript interfaces and type definitions
│   ├── App.tsx             # Main application shell and routing setup
│   └── main.tsx            # Application entry point
├── eslint.config.js        # ESLint configuration
├── vite.config.ts          # Vite bundler configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

---

## 📜 Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the production bundle.
- `npm run preview`: Bootstraps a local server to preview the production build.
- `npm run lint`: Runs ESLint to identify and report on patterns in the codebase.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/USERNAME">Ravell Networks</a></p>
</div>