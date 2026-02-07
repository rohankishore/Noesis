<div align="center">

<img width="3497" height="1324" alt="Group 4" src="https://github.com/user-attachments/assets/966c48cc-af53-438d-8b02-75a722a372f8" />


> *νοῆσις* (noesis) — From ancient Greek, meaning "intellectual understanding" and "direct insight"

[![Made with React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Powered by Three.js](https://img.shields.io/badge/Three.js-0.167-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Built with Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 🌌 What is Noesis?

Ever wished you could **see** maths and physics concepts come alive instead of just reading about them in dusty textbooks? That's exactly what Noesis does.

Noesis is an interactive physics and mathematics visualization platform where abstract concepts transform into tangible, playable experiences. Whether you're a student trying to understand projectile motion, a teacher looking for engaging demonstrations, or just someone curious about how the universe works—Noesis makes learning physics feel less like homework and more like exploration.

Think of it as your personal physics laboratory, minus the broken beakers and safety goggles.

## Cool Graphs

<div align="center">

<img width="1850" height="972" alt="image" src="https://github.com/user-attachments/assets/b4780444-3aec-4cc9-a5ec-b433902fd308" />

>sin(x^2 + y^2) = cos(x*y)

</div>


## ✨ Why Noesis?

- **Interactive First**: Drag sliders, adjust parameters, and watch the universe respond in real-time
- **Visual Learning**: See the actual curves, vectors, and forces—not just equations
- **Beautiful Design**: Modern UI with smooth animations that make physics genuinely enjoyable
- **No Installation Required**: Just open your browser and start experimenting
- **Educational**: Perfect for students, educators, or anyone curious about the physical world

## 🎯 Features & Simulations

### Mechanics & Kinematics
- **🎯 Projectile Motion** — Launch objects at different angles and velocities. Adjust gravity, add air resistance, and watch parabolic trajectories unfold in real-time. See how height affects range and understand the math behind every arc.

- **⚖️ Pendulum Simulator** — Explore energy conservation with a swinging pendulum. Visualize the constant trade-off between kinetic and potential energy, adjust length and initial angle, and see harmonic motion in action.

- **💥 Collision Lab** — Crash objects together and explore momentum conservation. Experiment with elastic and inelastic collisions, vary masses and velocities, and watch physics preserve momentum even in chaos.

### Fluid Dynamics
- **⚙️ Pascal's Law** — Discover how pressure propagates through fluids. Perfect for understanding hydraulic systems, from car brakes to industrial machinery.

- **🌊 Fluid Dynamics** — Visualize flow patterns and pressure distributions in moving fluids.

### Electromagnetism
- **🧲 Magnetic Field Visualizer** — See invisible magnetic fields made visible. Place magnets, move them around, and watch field lines dance and interact.

- **⚡ Faraday's Law** — Generate electricity by moving magnets through coils. Experience the principle behind generators and transformers firsthand.

- **⚡ Electric Field Simulator** — Place charges in space and visualize the resulting electric fields.

### Optics
- **🌈 Prism Simulator** — Send white light through a prism and watch it spread into a rainbow. Understand wavelength dispersion and why the sky is blue.

- **🔍 Lens Simulator** — Play with converging and diverging lenses. Move objects, adjust focal lengths, and see how images form.

- **✨ Refraction Explorer** — Watch light bend as it crosses material boundaries. Experiment with different media and angles to understand Snell's Law viscerally.

### Mathematics
- **📊 Mathematical Visualization** — Plot functions, explore transformations, and visualize mathematical concepts in dynamic, interactive ways.

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (version 16 or higher recommended).

### Installation

1. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/Noesis.git
   cd Noesis/noesis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:5173` (or whatever port Vite shows you)

That's it! You're ready to explore physics.

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder, ready to deploy anywhere.

## 🎮 How to Use

1. **Navigate** — Use the header navigation to browse between Math and Physics sections
2. **Experiment** — Each simulation has sliders and controls—tweak them fearlessly
3. **Observe** — Watch the visual representation update in real-time
4. **Learn** — Check the stats and values to understand what's happening mathematically
5. **Explore** — Try extreme values, break things, see what happens at the edges

The best way to learn is to play around. There's no wrong way to use Noesis.

## 🛠️ Tech Stack

Noesis is built with modern web technologies to ensure smooth performance and beautiful visuals:

- **[React 19](https://react.dev/)** — Component-based UI architecture
- **[Three.js](https://threejs.org/)** — 3D graphics and WebGL rendering
- **[GSAP](https://greensock.com/gsap/)** — Silky-smooth animations
- **[Vite](https://vitejs.dev/)** — Lightning-fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling
- **[Math.js](https://mathjs.org/)** — Advanced mathematical computations
- **[Chart.js](https://www.chartjs.org/)** — Beautiful graphs and charts
- **[Framer Motion](https://www.framer.com/motion/)** — React animation library
- **[React Router](https://reactrouter.com/)** — Client-side routing

## 📁 Project Structure

```
noesis/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── component/       # Reusable UI components
│   │   ├── CardNav.jsx
│   │   ├── DarkVeil.jsx
│   │   ├── ShinyText.jsx
│   │   └── TargetCursor.jsx
│   ├── components/
│   │   ├── GlitchText.jsx
│   │   ├── Header.jsx
│   │   └── ui/          # UI component library
│   ├── pages/           # Route pages (each simulation)
│   │   ├── Home.jsx
│   │   ├── Projectile.jsx
│   │   ├── Pendulum.jsx
│   │   ├── MagneticField.jsx
│   │   └── ...
│   ├── lib/             # Utilities and helpers
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── package.json
└── vite.config.js
```

## 🎨 Design Philosophy

Noesis follows a few key principles:

- **Clarity over complexity** — Visualizations should illuminate, not confuse
- **Beauty matters** — Learning is more engaging when it's aesthetically pleasing
- **Real-time feedback** — Every parameter change should produce immediate visual response
- **Accessibility** — Physics should be approachable for everyone
- **Playfulness** — Exploration beats rote memorization

## 🤝 Contributing

Found a bug? Have an idea for a new simulation? Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-simulation`)
3. Commit your changes (`git commit -m 'Add some amazing simulation'`)
4. Push to the branch (`git push origin feature/amazing-simulation`)
5. Open a Pull Request

### Ideas for Contributions

- New physics simulations (wave mechanics, thermodynamics, quantum phenomena)
- Improved visualizations for existing simulations
- Mobile responsiveness improvements
- Accessibility enhancements
- Documentation and tutorials
- Bug fixes and performance optimizations

## 🗺️ Roadmap

Future plans for Noesis include:

- [ ] Newton's Cradle simulation
- [ ] Wave interference patterns
- [ ] Thermodynamics visualizations
- [ ] Quantum mechanics basics (double-slit experiment, etc.)
- [ ] Save/share custom configurations
- [ ] Educational lesson plans and guided tours
- [ ] Dark/light mode toggle
- [ ] Mobile-optimized touch controls
- [ ] Multiplayer physics experiments
- [ ] Export animations as videos or GIFs

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the amazing work at [PhET Interactive Simulations](https://phet.colorado.edu/)
- Physics equations and concepts from OpenStax and Khan Academy
- Special thanks to the open-source community for the incredible tools that made this possible

## 💬 Contact & Support

Have questions or feedback? Feel free to:
- Open an issue on GitHub
- Start a discussion in the Discussions tab
- Reach out directly

---

<div align="center">

**Remember**: The universe is not just mathematical—it's also beautiful. Happy exploring! 🚀

Made with ❤️ and curiosity

</div>
