# VOIDSKETCH: Pixel Art Application

VOIDSKETCH is an Electron-based pixel art and animation application with a unique aesthetic inspired by Uno Moralez, Serial Experiments Lain, and Morrowind. The app is designed for creating creepy, glitchy, low-resolution pixel art and animated GIFs.

## Core Features

- **Custom Drawing Engine**: Pixel-precise canvas with support for various drawing tools and symmetry modes
- **Animation System**: Frame-based animation with timeline, onion skinning, and GIF export
- **Visual Effects**: Grain, static, CRT, and glitch effects for unique visual styles
- **Dithering System**: Various dithering algorithms including Floyd-Steinberg, Bayer matrix, and noise
- **Custom Themes**: Three distinct visual themes (Lain Dive, Morrowind Glyph, Monolith)
- **Lore System**: Hidden metadata, sigils, and glitch injection for embedded "rituals"

## Technical Implementation

1. **Electron Framework**: Cross-platform desktop application with Node.js integration
2. **HTML/CSS/JavaScript**: Pure frontend tech stack as requested
3. **Modular Architecture**: Separated components for drawing, animation, effects, UI, and tools
4. **Custom File Format**: .void file format for saving projects with all metadata
5. **Export Options**: PNG, GIF, and sprite sheet export capabilities

## Implementation Highlights

- **Pixel Canvas**: Implements Bresenham's algorithm for line drawing, flood fill, and symmetry tools
- **Animation Timeline**: Manages frames with thumbnails, playback controls, and onion skinning
- **Effects Engine**: Real-time animated effects with grain, static noise, and CRT simulation
- **UI System**: Custom window frame, menus, modal dialogs, and toast notifications
- **Theme System**: Completely different visual styles with dynamic CSS switching

## User Experience

The application provides a unique, atmospheric experience:

- **Terminal-inspired UI**: Dark, retro terminal aesthetics with glowing elements
- **Ritual-based Workflow**: Framing creative work as digital rituals and sigil creation
- **Glitch as Feature**: Embracing digital corruption as an artistic tool
- **Limited Palette**: Forcing creativity through constraint with 1-bit or 2-bit color

## Extensions & Future Development

Potential areas for expansion:

1. **Custom Brush System**: Support for user-created brush shapes
2. **Audio Integration**: Sound effects and possibly music generation
3. **Export Enhancements**: Additional formats like WebM video
4. **Pattern Generation**: Procedural sigil and pattern generation
5. **Community Features**: Sharing capabilities for VOIDSKETCH creations

This implementation fully realizes the vision outlined in the concept document, creating a specialized tool for a unique artistic niche.
