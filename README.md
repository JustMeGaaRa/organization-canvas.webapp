# 🏢 Organization Canvas

![Organization Canvas](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4)

A powerful, visual, and interactive organizational design tool built with React 19, Vite, and Tailwind CSS. **Organization Canvas** allows you to build, manage, and present organizational structures using a flexible "infinite" canvas approach.

## ✨ Key Features

### 🎨 Visual Canvas

- **Infinite Workspace**: Pan and zoom across a large radial-grid workspace.
- **Drag & Drop**: Easily place roles and people onto the canvas from your library.
- **Multi-Selection**: Select multiple elements to move or group them together.

### 🗃️ Library Management

- **Role Templates**: Define reusable role definitions with summaries.
- **People Directory**: Manage a library of individuals with avatars and names.
- **Smart Assignment**: Drag people onto roles to suggest or assign them.

### 📐 Structural Grouping (Tracks)

- **Container Tracks**: Group related roles into departments, squads, or functional teams.
- **Dynamic Resizing**: Tracks automatically adapt or can be manually resized to fit your structure.
- **Ungrouping**: Easily dissolve tracks while keeping the underlying role cards.

### 📽️ Recording & Presentation Mode

- **State Capture**: Record "snapshots" of your organization at different stages.
- **Smooth Transitions**: Use **Presentation Mode** to animate between recorded states with professional Framer Motion transitions.
- **Step Navigation**: Navigate forward and backward through your org design narrative.

### 💾 Data Management

- **Local Persistence**: All changes are automatically saved to your browser's local storage.
- **Backup & Restore**: Export your entire organization design (including templates and history) as a JSON file for sharing or safe-keeping.
- **Multi-Org Support**: Create and switch between multiple independent organizations.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/JustMeGaaRa/org-structure-web-app.git
   cd org-structure-web-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks & Local Storage
- **Routing**: Minimal page-switching logic (Canvas vs. Library Editor)

---

## 📖 How to Use

### 1. Building your structure

- Use the **Library Sidebar** (on the right) to drag roles onto the canvas.
- Change the **Tool Mode** in the bottom toolbar:
  - `Select` (Pointer): Move cards around.
  - `Pan` (Hand): Move the entire canvas.
  - `Track` (Box): Group selected items into a new container.

### 2. Managing the Library

- Click **"Manage Library"** in the sidebar to enter the **Library Editor**.
- Here you can add new Role templates or Person entries that will be available globally for your organization.

### 3. Recording a Story

- Click the `Capture` button to capture a snapshot of the current organization structure.
- Click the `Reset` button to reset the canvas to its initial state.
- Switch to `Present` mode to play back your snapshots. Use the arrow controls in the bottom toolbar to navigate.

### 4. Backup & Restore

- Use the **Settings** icons in the sidebar to export your current org to a JSON file.
- You can restore any organization by dragging the JSON file into the restore area or selecting it via the file browser.

---

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
