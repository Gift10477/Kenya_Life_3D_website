# Karibu Kenya 3D 🇰🇪✨

An interactive, immersive 3D web experience showcasing Kenyan culture, landmarks, and iconic elements using React, Three.js, React Three Fiber, GSAP, and Tailwind CSS.

---

## 🚀 Features

- **Interactive 3D Visualizations**: Real-time rendering of custom 3D models including Parliament, Nganya (Matatu culture), and iconic emblems.
- **Custom Shaders & FX**: Fluid ripple canvas shaders, particle cursor reactions, and smooth transitions.
- **Dynamic Layouts**: Cultural showcase grid, interactive component cards, and custom responsive layouts.
- **Modern Animations**: Smooth UI animations powered by GSAP and Framer Motion.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [GSAP](https://gsap.com/) & [Framer Motion](https://www.framer.com/motion/)

---

## 📦 Project Setup

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) installed.

### 2. Clone & Install Dependencies

```bash
git clone <repository-url>
cd karibu-kenya-3d
npm install
```

### 3. 3D Model Assets Notice ⚠️

> **Note**: 3D GLB model files (`*.glb`, `*.gltf`) in `public/models/` are ignored by `.gitignore` to keep the repository lean and lightweight.

Before running the application locally, place your 3D model files in the `public/models/` directory:
- `public/models/Mood.glb`
- `public/models/coat_of_arms.glb`
- `public/models/moneyfest-transformed.glb`
- `public/models/mood-transformed.glb`
- `public/models/optimus1-transformed.glb`
- `public/models/parliament-transformed.glb`

---

## 💻 Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local Vite development server |
| `npm run build` | Builds the optimized production application |
| `npm run preview` | Previews the production build locally |

---

## 📁 Directory Structure

```text
├── public/
│   ├── images/
│   ├── models/            # 3D GLB Models (Ignored in Git)
│   └── nganya_dimantle/
├── src/
│   ├── components/        # React & R3F 3D Components
│   ├── hooks/             # Custom React Hooks
│   ├── App.jsx            # App Entry Component
│   ├── main.jsx           # Vite Mount Entry
│   └── index.css          # Tailwind & Custom CSS
├── package.json
└── README.md
```

---

## 📜 License

This project is open-source.
