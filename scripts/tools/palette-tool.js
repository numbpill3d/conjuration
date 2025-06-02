/**
 * PaletteTool.js
 * Manages color palettes for VOIDSKETCH
 */

class PaletteTool {
    constructor(pixelCanvas) {
        this.pixelCanvas = pixelCanvas;
        this.currentPalette = 'monochrome';
        
        // Predefined palettes
        this.palettes = {
            monochrome: {
                name: 'Monochrome',
                colors: ['#000000', '#FFFFFF'],
                background: '#000000'
            },
            lain: {
                name: 'Lain',
                colors: ['#000000', '#6A1B9A', '#9C27B0', '#E1BEE7'],
                background: '#000000'
            },
            red: {
                name: 'Red',
                colors: ['#000000', '#540D0D', '#A91B1B', '#FF1744'],
                background: '#000000'
            },
            green: {
                name: 'Green',
                colors: ['#000000', '#003300', '#006600', '#00E676'],
                background: '#000000'
            }
        };
        
        // Initialize
        this.initialize();
    }
    
    initialize() {
        // Set default palette
        this.setPalette(this.currentPalette);
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Palette selection buttons
        document.getElementById('palette-monochrome').addEventListener('click', () => this.setPalette('monochrome'));
        document.getElementById('palette-lain').addEventListener('click', () => this.setPalette('lain'));
        document.getElementById('palette-red').addEventListener('click', () => this.setPalette('red'));
        document.getElementById('palette-green').addEventListener('click', () => this.setPalette('green'));
        
        // Mark the default palette as active
        document.getElementById(`palette-${this.currentPalette}`).classList.add('active');
    }
    
    setPalette(paletteId) {
        // Check if palette exists
        if (!this.palettes[paletteId]) return;
        
        // Set current palette
        this.currentPalette = paletteId;
        const palette = this.palettes[paletteId];
        
        // Set the drawing color to the first non-background color
        const colorIndex = palette.colors.findIndex(color => color !== palette.background);
        if (colorIndex >= 0) {
            this.pixelCanvas.setColor(palette.colors[colorIndex]);
        } else {
            this.pixelCanvas.setColor(palette.colors[0]);
        }
        
        // Set the background color
        this.pixelCanvas.setBackgroundColor(palette.background);
        
        // Update UI - remove active class from all palette options
        document.querySelectorAll('.palette-option').forEach(element => {
            element.classList.remove('active');
        });
        
        // Add active class to the selected palette
        document.getElementById(`palette-${paletteId}`).classList.add('active');
        
        // Create palette swatches
        this.createPaletteSwatches();
        
        // Dispatch event for palette change
        const event = new CustomEvent('palette-changed', {
            detail: {
                paletteId,
                palette: this.palettes[paletteId]
            }
        });
        document.dispatchEvent(event);
    }
    
    createPaletteSwatches() {
        // Remove any existing swatches
        const oldSwatches = document.getElementById('color-swatches');
        if (oldSwatches) {
            oldSwatches.remove();
        }
        
        // Create swatches container
        const swatchesContainer = document.createElement('div');
        swatchesContainer.id = 'color-swatches';
        swatchesContainer.className = 'color-swatches';
        
        // Get current palette
        const palette = this.palettes[this.currentPalette];
        
        // Create a swatch for each color
        palette.colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            
            // Highlight active color
            if (color === this.pixelCanvas.currentColor) {
                swatch.classList.add('active');
            }
            
            // Add click event to select color
            swatch.addEventListener('click', () => {
                // Set active color
                this.pixelCanvas.setColor(color);
                
                // Update UI
                document.querySelectorAll('.color-swatch').forEach(element => {
                    element.classList.remove('active');
                });
                swatch.classList.add('active');
            });
            
            swatchesContainer.appendChild(swatch);
        });
        
        // Add to the document - place after the palette selector
        const paletteSelector = document.querySelector('.palette-selector');
        paletteSelector.parentNode.insertBefore(swatchesContainer, paletteSelector.nextSibling);
    }
    
    // Get the current palette
    getCurrentPalette() {
        return {
            id: this.currentPalette,
            ...this.palettes[this.currentPalette]
        };
    }
    
    // Create a custom palette
    createCustomPalette(name, colors, background) {
        const paletteId = name.toLowerCase().replace(/\s+/g, '-');
        
        this.palettes[paletteId] = {
            name,
            colors,
            background: background || colors[0]
        };
        
        return paletteId;
    }
    
    // Apply dithering based on the current palette
    applyPaletteDithering(ditheringEngine, type = 'floyd-steinberg') {
        const palette = this.palettes[this.currentPalette];
        
        // Apply different dithering based on number of colors
        if (palette.colors.length === 2) {
            // Binary palette - simple dithering
            switch (type) {
                case 'floyd-steinberg':
                    ditheringEngine.applyFloydSteinberg(palette.colors[1], palette.colors[0]);
                    break;
                case 'ordered':
                    ditheringEngine.applyOrderedDithering(palette.colors[1], palette.colors[0]);
                    break;
                case 'noise':
                    ditheringEngine.applyNoiseDithering(palette.colors[1], palette.colors[0]);
                    break;
                default:
                    ditheringEngine.applyFloydSteinberg(palette.colors[1], palette.colors[0]);
            }
        } else {
            // Multi-color palette - apply 2-bit color
            ditheringEngine.applyTwoBitColor(palette.colors);
        }
    }
}
