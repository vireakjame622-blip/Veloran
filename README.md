# Veloran • AETHER H-1 Cybernetic Smart Helmet

An interactive, high-tech web application and real-time **3D WebGL Digital Helmet Explorer** built for next-generation cybernetic head protection and telemetry.

[![Status](https://img.shields.io/badge/Status-Active%20Production-00f2fe.svg)](#)
[![Three.js](https://img.shields.io/badge/Three.js-r128%20WebGL-00ff88.svg)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#)

---

## 🌟 Interactive Features for Visitors

- **🎮 360° Real-Time 3D Orbit & Zoom**: Click and drag to inspect the digital helmet from any angle, with smooth mouse wheel zooming and panning.
- **💥 3D Explode Parts Slider**: Drag the interactive slider from `0%` to `100%` to dynamically explode the 22 internal CAD subsystems outward in 3D space.
- **🎨 Dynamic Material Customizer**: Real-time PBR material shaders allowing visitors to switch between **3K Carbon Fiber**, **Gloss Obsidian**, **Cyber Cyan**, and **Brushed Titanium**.
- **📍 Floating 3D Hotspot Telemetry**: Interactive 3D pins projecting onto screen coordinates that smoothly glide the camera to subsystems (*Waveguide Visor, LiDAR, Shell, Audio, Battery, Rear Brake LED*) and open detailed engineering specs.
- **⚡ Live Visor HUD Simulator**: Live heads-up display telemetry with interactive switching between **Urban Cruise**, **Track Apex**, **Night Vision FLIR**, and **Rain & Fog Hazard Warning**.
- **📊 12 Subsystem Engineering Matrix**: Full component breakdown covering aerospace carbon fiber shell, dual-layer EPS, bone conduction audio, active noise cancellation, and autonomous eCall SOS.

---

## 📁 Repository Structure

```
Veloran/
├── assets/
│   ├── digital_helmet.glb          # 22-part CAD 3D helmet model (225 KB)
│   ├── digital_helmet_data.js      # Embedded base64 fallback geometry
│   ├── three.min.js                # Three.js 3D rendering library
│   ├── OrbitControls.js            # 360-degree interactive camera orbit controller
│   ├── GLTFLoader.js               # GLTF/GLB 3D model loader
│   ├── render_isometric.png        # High-resolution CAD render
│   ├── smart_helmet_real_render.jpg
│   ├── smart_helmet_internal_cutaway.jpg
│   └── smart_helmet_audio_comms.jpg
├── .gitignore                      # Strict policy: Zero .env files, zero secrets
├── digital-helmet.html             # Digital Helmet standalone explorer
├── index.html                      # Root entry point (Web & GitHub Pages ready)
└── README.md                       # Project documentation
```

---

## 🚀 Quick Start / Local Preview

You can run the interactive website locally using any standard HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Then open your browser at:
```
http://localhost:8000/
```

---

## 🛡️ Security & Privacy Notice
This project follows strict zero-secret compliance:
- **No `.env` files** or environment variables are stored or tracked.
- **No API keys or private tokens** are included in this repository.

---

## 👨‍💻 Developed by
**CADT • Faculty of Digital Engineering**
