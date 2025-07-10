# Conjuration (VOIDSKETCH)

A pixel art editor for creating creepy, grainy, monochrome, low-res masterpieces. Inspired by Serial Experiments Lain, Morrowind, and the aesthetic of early digital art.

## Features

### Drawing Tools
- **Pencil**: Basic pixel-perfect drawing
- **Brush**: Soft brush with opacity falloff
- **Spray**: Airbrush-style tool
- **Pixel**: Sharp pixel art brush
- **Line**: Draw straight lines
- **Rectangle**: Draw rectangles (outline or filled)
- **Ellipse**: Draw ellipses and circles
- **Dither**: Apply dithering patterns
- **Pattern**: Draw with various patterns
- **Glitch**: Apply glitch effects while drawing
- **Static**: Create static/noise effects
- **Eraser**: Remove pixels
- **Fill**: Flood fill areas with color

### Symmetry Tools
- **None**: Normal drawing
- **Horizontal**: Mirror horizontally
- **Vertical**: Mirror vertically
- **Quadrant**: 4-way symmetry
- **Octal**: 8-way symmetry

### Color Palettes
- **Monochrome**: Classic black and white
- **Lain**: Purple hues inspired by Serial Experiments Lain
- **Red**: Red monochrome palette
- **Green**: Green monochrome palette

### Visual Effects
- **Grain**: Add film grain effect
- **Static**: TV static overlay
- **Glitch**: Digital glitch effects
- **CRT**: Cathode ray tube simulation
- **Scan Lines**: Horizontal scan lines
- **Vignette**: Dark edges effect
- **Noise**: Random noise overlay
- **Pixelate**: Pixelation effect

### Animation
- **Timeline**: Frame-by-frame animation
- **Onion Skinning**: See previous/next frames
- **Playback Controls**: Play, stop, loop
- **Frame Management**: Add, duplicate, delete frames
- **GIF Export**: Export animations as GIF files

### Themes
- **Lain Dive**: Purple cyberpunk aesthetic
- **Morrowind Glyph**: Warm sepia tones
- **Monolith**: High contrast black and white

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Starting the Application
```bash
npm start
```

### Building for Distribution
```bash
npm run build
```

### Packaging for Multiple Platforms
```bash
npm run package
```

## Controls

### Drawing
- **Left Click**: Draw with primary color (white)
- **Right Click**: Draw with secondary color (black)
- **Mouse Wheel**: Zoom in/out on canvas

### Keyboard Shortcuts
- **Ctrl+N**: New project
- **Ctrl+O**: Open project
- **Ctrl+S**: Save project
- **Ctrl+Shift+S**: Save project as
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Ctrl+G**: Toggle grid

### Tool Shortcuts
- **B**: Pencil tool
- **E**: Eraser tool
- **F**: Fill tool
- **L**: Line tool
- **R**: Rectangle tool
- **O**: Ellipse tool
- **G**: Glitch tool
- **S**: Static tool

## File Formats

### Project Files (.void)
Save and load complete projects including:
- Canvas dimensions
- All animation frames
- Current palette
- Effect settings

### Export Formats
- **PNG**: Export current frame as PNG image
- **GIF**: Export animation as animated GIF
- **Sprite Sheet**: Export all frames as a sprite sheet

## Technical Details

### Built With
- **Electron**: Cross-platform desktop app framework
- **HTML5 Canvas**: For pixel-perfect rendering
- **JavaScript**: Core application logic
- **CSS3**: Theming and visual effects

### Architecture
- **Main Process**: Electron main process (main.js)
- **Renderer Process**: UI and canvas rendering
- **IPC Communication**: Secure communication between processes
- **Modular Design**: Separate classes for different functionality

### Performance
- **Efficient Rendering**: Optimized canvas operations
- **Memory Management**: Proper cleanup and garbage collection
- **History System**: Undo/redo with memory limits
- **Worker Threads**: GIF generation in background

## Development

### Project Structure
```
conjuration/
├── main.js                 # Electron main process
├── preload.js             # Preload script for IPC
├── package.json           # Project configuration
├── src/
│   ├── index.html         # Main HTML file
│   ├── styles/            # CSS files
│   │   ├── main.css       # Base styles
│   │   ├── components/    # Component-specific styles
│   │   └── themes/        # Theme files
│   └── scripts/           # JavaScript files
│       ├── app.js         # Main application logic
│       ├── canvas/        # Canvas-related classes
│       ├── animation/     # Animation system
│       ├── tools/         # Drawing tools
│       ├── ui/            # User interface
│       └── lib/           # External libraries
```

### Adding New Tools
1. Create a new tool class in `src/scripts/tools/`
2. Add the tool button to the HTML
3. Register the tool in the brush engine
4. Add keyboard shortcut if desired

### Adding New Themes
1. Create a new CSS file in `src/styles/themes/`
2. Define CSS custom properties for colors
3. Add theme option to the view menu
4. Register theme in ThemeManager

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

- Inspired by the aesthetic of Serial Experiments Lain
- UI design influenced by Morrowind and early 2000s software
- Built with love for pixel art and digital nostalgia

## Troubleshooting

### Common Issues

**App won't start**
- Make sure all dependencies are installed: `npm install`
- Check that Node.js and npm are properly installed

**Canvas not responding**
- Try refreshing the app (Ctrl+R in development)
- Check browser console for JavaScript errors

**Export not working**
- Ensure you have write permissions to the export directory
- Try exporting to a different location

**Performance issues**
- Reduce canvas size for better performance
- Disable visual effects if needed
- Close other applications to free up memory

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Try restarting the application
3. Create an issue on the project repository
4. Include your operating system and error details

---

*"Present day, present time... and you don't seem to understand."*