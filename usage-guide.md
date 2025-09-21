# VOIDSKETCH - Installation and Usage Guide

## Overview

VOIDSKETCH is an offline-first pixel art editor designed for creating creepy, grainy, monochrome, low-resolution masterpieces with glitched frames, dithering, and a lore-coded interface. Inspired by the aesthetics of Uno Moralez, Serial Experiments Lain, and Morrowind, VOIDSKETCH provides a unique environment for pixel art creation with a focus on horror, glitch, and cyber-fantasy themes.

## Installation

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Setup

1. Clone the repository or extract the downloaded archive:

   ```
   git clone https://github.com/yourusername/voidsketch.git
   cd voidsketch
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

### Building for Your Platform

To build a standalone application for your platform:

```
npm run package
```

This will create executables in the `release-builds` directory for Windows, macOS, and Linux.

## Features

### Canvas and Drawing

- **Pixel-Precise Canvas**: Default 64x64 resolution with monochrome or limited color palette
- **Brush Tools**: Pencil, Line, Rectangle, Ellipse, Glitch, Static, Eraser, Fill
- **Symmetry Modes**: None, Horizontal, Vertical, Quad, and Octal symmetry
- **Grid Toggle**: Show/hide grid for precise pixel placement

### Animation

- **Frame-Based Animator**: Create multi-frame animations with preview
- **Timeline Controls**: Add, duplicate, and delete frames
- **Onion Skinning**: Show adjacent frames as a reference while drawing
- **Animation Playback**: Preview with adjustable frame delay and loop settings

### Effects

- **Grain Effect**: Add film grain to your artwork
- **Static Overlay**: Apply TV static noise effect
- **Glitch Effects**: Shift rows, corrupt data, and add digital glitches
- **CRT Effect**: Simulate CRT screen curvature and scanlines

### Color and Dithering

- **Limited Palettes**: Monochrome, Lain (purple), Red, and Green
- **Dithering Options**: Floyd-Steinberg, Ordered (Bayer matrix), and Noise dithering

### Export Options

- **PNG Export**: Save individual frames as PNG images
- **GIF Export**: Create animated GIFs with custom settings
- **Sprite Sheet Export**: Generate sprite sheets from animations

### Themes

- **Lain Dive**: Purple hues inspired by Serial Experiments Lain
- **Morrowind Glyph**: Warm sepia tones inspired by Elder Scrolls UI
- **Monolith**: Minimalist black and white high contrast theme

### Lore Features

- **Metadata Ritual**: Embed hidden messages in your projects
- **Hidden Sigils**: Add occult-inspired glyphs to your work
- **Glitch Injection**: Deliberately corrupt your artwork for effect

## Usage Guide

### Interface Overview

The VOIDSKETCH interface consists of:

1. **Title Bar**: Window controls and application title
2. **Tools Panel** (left): Drawing tools, symmetry options, palette selector, and effects
3. **Canvas Area** (center): Main drawing area with zoom controls
4. **Timeline Panel** (right): Animation frames and controls
5. **Menu Bar** (bottom): File, Edit, View, Export, and Lore menus

### Drawing Basics

- Select a tool from the left panel
- Click and drag on the canvas to draw
- Use the color swatches to select drawing colors
- Toggle the grid with View → Toggle Grid

### Animation

1. Click "+" in the Timeline panel to add a new frame
2. Draw on each frame to create your animation
3. Use the playback controls to preview your animation
4. Adjust frame delay to control animation speed

### Using Effects

1. Check the effect boxes you want to apply (Grain, Static, Glitch, CRT)
2. Adjust the intensity slider to control the effect strength

### Exporting Your Work

- **PNG**: Export → Export Current Frame (PNG)
- **GIF**: Export → Export Animation (GIF)
- **Sprite Sheet**: Export → Export Sprite Sheet

### Working with Themes

Switch between themes via the View menu:

- View → Lain Dive Theme
- View → Morrowind Glyph Theme
- View → Monolith Theme

### Lore Features

- **Toggle Lore Layer**: Lore → Toggle Lore Layer
- **Edit Metadata Ritual**: Lore → Edit Metadata Ritual
- **Add Hidden Sigil**: Lore → Add Hidden Sigil
- **Inject Glitch**: Lore → Inject Glitch

### Keyboard Shortcuts

- Ctrl+N: New Project
- Ctrl+O: Open Project
- Ctrl+S: Save Project
- Ctrl+Shift+S: Save Project As
- Ctrl+Z: Undo
- Ctrl+Y/Ctrl+Shift+Z: Redo
- Ctrl+G: Toggle Grid
- B: Pencil Tool
- E: Eraser Tool
- F: Fill Tool
- L: Line Tool
- R: Rectangle Tool
- O: Ellipse Tool
- G: Glitch Tool
- S: Static Tool

## Project Files

VOIDSKETCH uses a custom .void file format that contains:

- Canvas size information
- All animation frames
- Palette and effect settings
- Metadata and lore layer information

## Troubleshooting

- **Canvas Not Rendering**: Try toggling the grid or changing themes
- **Animation Not Playing**: Check if you have multiple frames and frame delay is set properly
- **Export Not Working**: Ensure you have write permissions for the destination folder
- **Glitches/Effects Not Visible**: Adjust the intensity slider or toggle the effect off and on again

## Credits

VOIDSKETCH was inspired by:

- The pixel art of Uno Moralez
- The interface aesthetics of Serial Experiments Lain
- The UI design of The Elder Scrolls III: Morrowind
- Late-90s cyber-fantasy OS interfaces
