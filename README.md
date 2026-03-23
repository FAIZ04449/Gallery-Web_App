# Celebrare Intern Pre-Screening Assignment

This repository contains a high-performance **Virtualized Image Gallery** built with **React, Vite, and absolute Vanilla CSS**. It fulfills and exceeds all requirements for the Assignment 3 intern pre-screening assignment, focusing on optimal performance, smooth virtualization without lagging, efficient Web Worker utilization, and premium UI/UX aesthetics.

## Features

- 🖼️ **True DOM Virtualization**: Capable of handling hundreds of images effortlessly. Only the images currently visible in your viewport are rendered into the DOM, maintaining 60 FPS scrolling and minimal memory footprint.
- 🚀 **Zero-Flicker Virtualization (In-Memory Cache)**: Solves virtualization image flicker on scroll-up using an in-memory map. By awaiting `img.decode()` before rendering, we guarantee the image is fully parsed, bypassing the skeleton shimmer state entirely.
- 💾 **Network Latency Offset (IndexedDB)**: Stores gallery metadata persistently via IndexedDB. Operates asynchronously without blocking the main thread, allowing immediate UI hydration on re-visits before network requests trigger.
- ⚡ **Web Worker Offloading**: Image text watermarking ("Celebrare") is processed completely off the main thread using a Web Worker and the `OffscreenCanvas` API, meaning the UI never freezes during complex batch downloads.
- ✨ **Premium Vanilla CSS UI**: A modern, sleek dark mode paired with glassmorphism, fluid interactive hover effects, and custom checkboxes designed natively without heavy external libraries like Tailwind.
- 🔍 **Instant Full-Screen Previews**: Instantly preview any image in an elegant full-screen modal interaction. Uses an in-memory cache for high-resolution assets so toggling the preview modal is completely instantaneous.
- 📦 **Batch Selections & Downloading**: Select single or multiple images to process, displaying a live animated tray that guides the user through the process.

## Getting Started

First, ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository && Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173/`


## Tech Stack
- **React.js 18**
- **Vite**
- **Lucide React** (for minimalist SVG iconography)
- **Vanilla CSS 3** (Custom properties, grid integrations, flexbox)
- **HTML Canvas API & Web Workers**
