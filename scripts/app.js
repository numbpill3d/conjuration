/**
 * app.js
 * Main application script for VOIDSKETCH
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    const app = new VoidSketchApp();
});

/**
 * VoidSketchApp
 * Main application class that initializes and ties together all components
 */
class VoidSketchApp {
    constructor() {
        // Application state
        this.state = {
            currentFilePath: null,
            projectName: 'Untitled',
            isModified: false,
            metadata: {
                title: '',
                author: '',
                message: '',
                encoding: 'plain'
            },
            loreLayer: {
                enabled: false,
                sigils: []
            }
        };
        
        // Initialize components
        this.initializeComponents();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show welcome message
        this.uiManager.showToast('VOIDSKETCH initialized. Draw in the dark. Animate the echo.', 'info', 5000);
        
        // Set window title
        this.updateWindowTitle();
    }
    
    initializeComponents() {
        // Initialize UI Manager
        this.uiManager = new UIManager();
        
        // Initialize Theme Manager
        this.themeManager = new ThemeManager();
        
        // Initialize Menu System
        this.menuSystem = new MenuSystem(this.uiManager);
        
        // Initialize Pixel Canvas
        this.pixelCanvas = new PixelCanvas({
            width: 64,
            height: 64,
            pixelSize: 8,
            backgroundColor: '#000000'
        });
        
        // Initialize Timeline
        this.timeline = new Timeline(this.pixelCanvas);
        
        // Initialize GIF Exporter
        this.gifExporter = new GifExporter(this.timeline);
        
        // Initialize Dithering Engine
        this.ditheringEngine = new DitheringEngine(this.pixelCanvas);
        
        // Initialize Effects Engine
        this.effectsEngine = new EffectsEngine(this.pixelCanvas);
        
        // Initialize Palette Tool
        this.paletteTool = new PaletteTool(this.pixelCanvas);
        
        // Initialize Brush Engine
        this.brushEngine = new BrushEngine(this.pixelCanvas);
        
        // Initialize Symmetry Tools
        this.symmetryTools = new SymmetryTools(this.pixelCanvas);
        
        // Initialize Glitch Tool
        this.glitchTool = new GlitchTool(this.pixelCanvas);
    }
    
    setupEventListeners() {
        // UI Event Listeners
        document.addEventListener('ui-new-project', () => this.createNewProject());
        document.addEventListener('ui-open-project', () => this.openProject());
        document.addEventListener('ui-save-project', () => this.saveProject());
        document.addEventListener('ui-save-project-as', () => this.saveProjectAs());
        
        document.addEventListener('ui-undo', () => this.pixelCanvas.undo());
        document.addEventListener('ui-redo', () => this.pixelCanvas.redo());
        
        document.addEventListener('ui-copy', () => this.copySelection());
        document.addEventListener('ui-cut', () => this.cutSelection());
        document.addEventListener('ui-paste', () => this.pasteSelection());
        document.addEventListener('ui-select-all', () => this.selectAll());
        document.addEventListener('ui-deselect', () => this.deselect());
        
        document.addEventListener('ui-toggle-grid', () => this.pixelCanvas.toggleGrid());
        document.addEventListener('ui-toggle-rulers', () => this.toggleRulers());
        
        document.addEventListener('ui-export-png', () => this.exportPNG());
        document.addEventListener('ui-export-gif', () => this.exportGIF());
        document.addEventListener('ui-export-sprite-sheet', () => this.exportSpriteSheet());
        
        document.addEventListener('ui-toggle-lore-layer', () => this.toggleLoreLayer());
        document.addEventListener('ui-get-metadata', (event) => {
            if (event.detail && typeof event.detail === 'function') {
                event.detail(this.state.metadata);
            }
        });
        document.addEventListener('ui-save-metadata', (event) => this.saveMetadata(event.detail));
        document.addEventListener('ui-add-sigil', (event) => this.addSigil(event.detail));
        document.addEventListener('ui-apply-glitch', (event) => this.applyGlitch(event.detail));
        
        document.addEventListener('ui-set-tool', (event) => {
            if (event.detail) {
                this.brushEngine.setTool(event.detail);
            }
        });
        
        // Handle palette changes
        document.addEventListener('palette-changed', () => {
            this.markAsModified();
        });
        
        // Handle theme changes
        document.addEventListener('theme-changed', () => {
            this.updateEffectsForTheme();
        });
        
        // Track modifications
        this.pixelCanvas.canvas.addEventListener('mouseup', () => {
            this.markAsModified();
        });
    }
    
    updateWindowTitle() {
        // Update window title with project name and modified indicator
        const modifiedIndicator = this.state.isModified ? '*' : '';
        document.title = `${this.state.projectName}${modifiedIndicator} - VOIDSKETCH`;
        
        // Update title bar text
        document.getElementById('title-bar-text').textContent = 
            `VOIDSKETCH :: ${this.state.projectName}${modifiedIndicator}`;
    }
    
    markAsModified() {
        if (!this.state.isModified) {
            this.state.isModified = true;
            this.updateWindowTitle();
        }
    }
    
    clearModified() {
        if (this.state.isModified) {
            this.state.isModified = false;
            this.updateWindowTitle();
        }
    }
    
    createNewProject() {
        // Reset the canvas
        this.pixelCanvas.clear();
        
        // Reset the timeline
        this.timeline.frames = [];
        this.timeline.createNewFrame();
        this.timeline.updateFramesUI();
        
        // Reset the project state
        this.state.currentFilePath = null;
        this.state.projectName = 'Untitled';
        this.state.isModified = false;
        this.state.metadata = {
            title: '',
            author: '',
            message: '',
            encoding: 'plain'
        };
        this.state.loreLayer = {
            enabled: false,
            sigils: []
        };
        
        // Update the UI
        this.updateWindowTitle();
        this.uiManager.showToast('Created new project', 'success');
    }
    
    async openProject() {
        try {
            // Show loading indicator
            this.uiManager.showToast('Loading project...', 'info');
            
            // Use Electron IPC to open a file dialog
            const result = await window.voidAPI.openProject();
            
            if (result.success && result.data) {
                // Parse the project data
                const projectData = result.data;
                
                // Load canvas size
                if (projectData.canvasSize) {
                    this.pixelCanvas.setCanvasSize(
                        projectData.canvasSize.width,
                        projectData.canvasSize.height
                    );
                }
                
                // Load frames
                if (projectData.frames && Array.isArray(projectData.frames)) {
                    await this.timeline.setFramesFromData(projectData.frames);
                }
                
                // Load palette
                if (projectData.palette) {
                    this.paletteTool.setPalette(projectData.palette);
                }
                
                // Load effects
                if (projectData.effects) {
                    this.effectsEngine.setEffectsSettings(projectData.effects);
                }
                
                // Load metadata
                if (projectData.metadata) {
                    this.state.metadata = projectData.metadata;
                }
                
                // Load lore layer
                if (projectData.loreLayer) {
                    this.state.loreLayer = projectData.loreLayer;
                }
                
                // Update project state
                this.state.currentFilePath = result.filePath;
                this.state.projectName = this.getFileNameFromPath(result.filePath);
                this.clearModified();
                
                // Show success message
                this.uiManager.showToast('Project loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Error opening project:', error);
            this.uiManager.showToast('Failed to open project: ' + error.message, 'error');
        }
    }
    
    async saveProject() {
        if (!this.state.currentFilePath) {
            // If no current path, use Save As instead
            return this.saveProjectAs();
        }
        
        try {
            // Show saving indicator
            this.uiManager.showToast('Saving project...', 'info');
            
            // Prepare project data
            const projectData = this.prepareProjectData();
            
            // Use Electron IPC to save the file
            const result = await window.voidAPI.saveProject(projectData);
            
            if (result.success) {
                this.clearModified();
                this.uiManager.showToast('Project saved successfully', 'success');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving project:', error);
            this.uiManager.showToast('Failed to save project: ' + error.message, 'error');
        }
    }
    
    async saveProjectAs() {
        try {
            // Show saving indicator
            this.uiManager.showToast('Saving project...', 'info');
            
            // Prepare project data
            const projectData = this.prepareProjectData();
            
            // Use Electron IPC to save the file with dialog
            const result = await window.voidAPI.saveProject(projectData);
            
            if (result.success) {
                // Update project state
                this.state.currentFilePath = result.filePath;
                this.state.projectName = this.getFileNameFromPath(result.filePath);
                this.clearModified();
                this.updateWindowTitle();
                
                this.uiManager.showToast('Project saved successfully', 'success');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving project:', error);
            this.uiManager.showToast('Failed to save project: ' + error.message, 'error');
        }
    }
    
    prepareProjectData() {
        // Create a complete project data object
        return {
            appVersion: '0.1.0',
            timestamp: new Date().toISOString(),
            canvasSize: {
                width: this.pixelCanvas.width,
                height: this.pixelCanvas.height
            },
            frames: this.timeline.getFramesData(),
            palette: this.paletteTool.currentPalette,
            effects: this.effectsEngine.getEffectsSettings(),
            metadata: this.state.metadata,
            loreLayer: this.state.loreLayer
        };
    }
    
    getFileNameFromPath(filePath) {
        if (!filePath) return 'Untitled';
        
        // Extract file name from path
        const pathParts = filePath.split(/[/\\]/);
        let fileName = pathParts[pathParts.length - 1];
        
        // Remove extension
        const extensionIndex = fileName.lastIndexOf('.');
        if (extensionIndex > 0) {
            fileName = fileName.substring(0, extensionIndex);
        }
        
        return fileName;
    }
    
    async exportPNG() {
        try {
            // Get canvas data URL
            const dataUrl = this.pixelCanvas.getCanvasData();
            
            // Use Electron IPC to save the PNG
            const result = await window.voidAPI.exportPng(dataUrl);
            
            if (result.success) {
                this.uiManager.showToast('PNG exported successfully', 'success');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error exporting PNG:', error);
            this.uiManager.showToast('Failed to export PNG: ' + error.message, 'error');
        }
    }
    
    async exportGIF() {
        try {
            // Show options dialog for GIF export
            this.uiManager.showModal('Export GIF', this.createGifOptionsForm());
        } catch (error) {
            console.error('Error showing GIF export dialog:', error);
            this.uiManager.showToast('Failed to open GIF export options: ' + error.message, 'error');
        }
    }
    
    createGifOptionsForm() {
        const form = document.createElement('div');
        form.className = 'gif-options-form';
        
        // Loop options
        const loopGroup = document.createElement('div');
        loopGroup.className = 'form-group';
        
        const loopLabel = document.createElement('label');
        loopLabel.textContent = 'Loop Count:';
        
        const loopInput = document.createElement('input');
        loopInput.type = 'number';
        loopInput.id = 'gif-loop-count';
        loopInput.min = '0';
        loopInput.max = '100';
        loopInput.value = '0';
        
        const loopHelp = document.createElement('small');
        loopHelp.textContent = '0 = infinite loop';
        
        loopGroup.appendChild(loopLabel);
        loopGroup.appendChild(loopInput);
        loopGroup.appendChild(loopHelp);
        
        // Quality options
        const qualityGroup = document.createElement('div');
        qualityGroup.className = 'form-group';
        
        const qualityLabel = document.createElement('label');
        qualityLabel.textContent = 'Quality:';
        
        const qualitySlider = document.createElement('input');
        qualitySlider.type = 'range';
        qualitySlider.id = 'gif-quality';
        qualitySlider.min = '1';
        qualitySlider.max = '20';
        qualitySlider.value = '10';
        
        const qualityValue = document.createElement('span');
        qualityValue.id = 'quality-value';
        qualityValue.textContent = '10';
        
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = qualitySlider.value;
        });
        
        qualityGroup.appendChild(qualityLabel);
        qualityGroup.appendChild(qualitySlider);
        qualityGroup.appendChild(qualityValue);
        
        // Dithering option
        const ditherGroup = document.createElement('div');
        ditherGroup.className = 'form-group';
        
        const ditherLabel = document.createElement('label');
        ditherLabel.textContent = 'Apply Dithering:';
        
        const ditherCheckbox = document.createElement('input');
        ditherCheckbox.type = 'checkbox';
        ditherCheckbox.id = 'gif-dither';
        
        ditherGroup.appendChild(ditherLabel);
        ditherGroup.appendChild(ditherCheckbox);
        
        // Buttons
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'form-buttons';
        
        const exportButton = document.createElement('button');
        exportButton.type = 'button';
        exportButton.className = 'save-button';
        exportButton.textContent = 'Export GIF';
        exportButton.addEventListener('click', () => {
            this.uiManager.closeModal();
            
            // Get options
            const options = {
                quality: parseInt(qualitySlider.value),
                dither: ditherCheckbox.checked,
                loop: parseInt(loopInput.value)
            };
            
            this.processGifExport(options);
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.uiManager.closeModal();
        });
        
        buttonGroup.appendChild(exportButton);
        buttonGroup.appendChild(cancelButton);
        
        // Assemble form
        form.appendChild(loopGroup);
        form.appendChild(qualityGroup);
        form.appendChild(ditherGroup);
        form.appendChild(buttonGroup);
        
        return form;
    }
    
    async processGifExport(options) {
        try {
            // Show loading indicator
            this.uiManager.showToast('Generating GIF...', 'info');
            
            // Save current frame first to ensure it's included
            this.timeline.frames[this.timeline.currentFrameIndex].setImageData(
                this.pixelCanvas.getCanvasImageData()
            );
            
            // Create GIF with options
            const gifData = await this.gifExporter.exportGif(options);
            
            // Use Electron IPC to save the GIF
            const result = await window.voidAPI.exportGif(gifData);
            
            if (result.success) {
                this.uiManager.showToast('GIF exported successfully', 'success');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error exporting GIF:', error);
            this.uiManager.showToast('Failed to export GIF: ' + error.message, 'error');
        }
    }
    
    async exportSpriteSheet() {
        try {
            // Generate sprite sheet
            const spriteSheetDataUrl = await this.gifExporter.exportSpriteSheet();
            
            // Use Electron IPC to save the sprite sheet
            const result = await window.voidAPI.exportPng(spriteSheetDataUrl);
            
            if (result.success) {
                this.uiManager.showToast('Sprite sheet exported successfully', 'success');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error exporting sprite sheet:', error);
            this.uiManager.showToast('Failed to export sprite sheet: ' + error.message, 'error');
        }
    }
    
    toggleRulers() {
        // Placeholder for ruler functionality
        this.uiManager.showToast('Rulers feature coming soon', 'info');
    }
    
    copySelection() {
        // Placeholder for copy functionality
        this.uiManager.showToast('Copy feature coming soon', 'info');
    }
    
    cutSelection() {
        // Placeholder for cut functionality
        this.uiManager.showToast('Cut feature coming soon', 'info');
    }
    
    pasteSelection() {
        // Placeholder for paste functionality
        this.uiManager.showToast('Paste feature coming soon', 'info');
    }
    
    selectAll() {
        // Placeholder for select all functionality
        this.uiManager.showToast('Select All feature coming soon', 'info');
    }
    
    deselect() {
        // Placeholder for deselect functionality
        this.uiManager.showToast('Deselect feature coming soon', 'info');
    }
    
    toggleLoreLayer() {
        // Toggle lore layer visibility
        this.state.loreLayer.enabled = !this.state.loreLayer.enabled;
        
        // Update UI
        this.uiManager.showToast(
            this.state.loreLayer.enabled ? 'Lore layer activated' : 'Lore layer deactivated',
            'info'
        );
        
        // Mark project as modified
        this.markAsModified();
    }
    
    saveMetadata(metadata) {
        // Update metadata
        this.state.metadata = {
            ...this.state.metadata,
            ...metadata
        };
        
        // Show confirmation
        this.uiManager.showToast('Metadata ritual recorded', 'success');
        
        // Mark project as modified
        this.markAsModified();
    }
    
    addSigil(sigilData) {
        // Add sigil to lore layer
        this.state.loreLayer.sigils.push({
            ...sigilData,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        });
        
        // Show confirmation
        this.uiManager.showToast('Hidden sigil embedded', 'success');
        
        // Mark project as modified
        this.markAsModified();
    }
    
    applyGlitch(options) {
        // Apply selected glitch effect
        switch (options.type) {
            case 'random':
                this.glitchTool.applyRandomGlitch();
                break;
            case 'shift':
                this.glitchTool.shiftRows(
                    this.pixelCanvas.getCanvasImageData().data,
                    this.pixelCanvas.width,
                    this.pixelCanvas.height
                );
                break;
            case 'channel':
                this.glitchTool.channelShift(
                    this.pixelCanvas.getCanvasImageData().data,
                    this.pixelCanvas.width,
                    this.pixelCanvas.height
                );
                break;
            case 'sort':
                this.glitchTool.pixelSort(
                    this.pixelCanvas.getCanvasImageData().data,
                    this.pixelCanvas.width,
                    this.pixelCanvas.height
                );
                break;
            case 'noise':
                this.glitchTool.addNoise(options.intensity);
                break;
            case 'corrupt':
                this.glitchTool.corruptData(options.intensity);
                break;
        }
        
        // Show confirmation
        this.uiManager.showToast('Glitch injected', 'success');
        
        // Mark project as modified
        this.markAsModified();
    }
    
    updateEffectsForTheme() {
        // Adjust effects based on current theme
        const theme = this.themeManager.getCurrentTheme();
        
        switch (theme.id) {
            case 'lain-dive':
                // Purple-tinted CRT effects
                this.effectsEngine.settings.crt.intensity = 0.6;
                break;
            case 'morrowind-glyph':
                // Sepia-toned grain
                this.effectsEngine.settings.grain.intensity = 0.7;
                break;
            case 'monolith':
                // High contrast, less effects
                this.effectsEngine.settings.grain.intensity = 0.3;
                this.effectsEngine.settings.crt.intensity = 0.4;
                break;
        }
        
        // Update effects
        this.effectsEngine.updateEffects();
    }
}
