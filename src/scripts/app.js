/**
 * Conjuration - Main Application
 *
 * This is the main entry point for the application that initializes
 * all components and manages the application state.
 */

// VoidAPI is available globally via preload script

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI Manager
  const uiManager = new UIManager();

  // Initialize Theme Manager
  const themeManager = new ThemeManager();

  // Add data-text attributes to section titles for glitch effect
  document.querySelectorAll('.section-title').forEach(title => {
    title.setAttribute('data-text', title.textContent);
  });

  // Initialize Menu System
  const menuSystem = new MenuSystem();

  // Initialize Canvas with temporary size (will be changed by user selection)
  const pixelCanvas = new PixelCanvas({
    canvasId: 'pixel-canvas',
    effectsCanvasId: 'effects-canvas',
    uiCanvasId: 'ui-canvas',
    width: 64,
    height: 64,
    pixelSize: 8
  });

  // Show canvas size selection dialog on startup
  showCanvasSizeSelectionDialog();

  // Initialize Glitch Tool for enhanced glitch effects
  const glitchTool = new GlitchTool(pixelCanvas);

  // Initialize Brush Engine
  const brushEngine = new BrushEngine(pixelCanvas, glitchTool);

  // Initialize Symmetry Tools
  const symmetryTools = new SymmetryTools(pixelCanvas);

  // Initialize Palette Tool with brush engine
  const paletteTool = new PaletteTool(pixelCanvas, brushEngine);

  // Initialize Timeline (glitchTool removed as unused)
  const timeline = new Timeline(pixelCanvas);

  // Initialize GIF Exporter
  const gifExporter = new GifExporter(timeline);

  // Set up event listeners
  setupEventListeners();

  // Initialize the first frame
  timeline.addFrame();

  // Show welcome message
  uiManager.showToast('Welcome to Conjuration', 'success');

  // Global app state for unsaved changes tracking
  window.voidApp = {
    hasUnsavedChanges: () => {
      // Check if there are any changes since last save
      return pixelCanvas.historyIndex > 0 || timeline.getFrameCount() > 1;
    },
    saveProject: () => {
      return new Promise((resolve) => {
        handleSaveProject();
        resolve({ success: true });
      });
    }
  };

  /**
   * Set up all event listeners for the application
   */
  function setupEventListeners() {
    setupWindowControls();
    setupMenuManager();
    setupFileMenu();
    setupEditMenu();
    setupExportMenu();
    setupThemeMenu();
    setupLoreMenu();
    setupToolButtons();
    setupPaletteOptions();
    setupEffectControls();
    setupBrushControls();
    setupTimelineControls();
    setupAnimationControls();
    setupZoomControls();
    setupMiscControls();
   /**
    * Set up keyboard shortcuts
    */
   function setupKeyboardShortcuts() {
     document.addEventListener('keydown', (e) => {
       // Undo/Redo
       if (e.ctrlKey || e.metaKey) {
         if (e.key === 'z') {
           e.preventDefault();
           if (e.shiftKey) {
             pixelCanvas.redo();
           } else {
             pixelCanvas.undo();
           }
         }
       }

       // Zoom
       if (e.key === '0') {
         pixelCanvas.resetZoom();
         updateZoomLevel();
       } else if (e.key === '+' || e.key === '=') {
         e.preventDefault();
         pixelCanvas.zoomIn();
         updateZoomLevel();
       } else if (e.key === '-') {
         e.preventDefault();
         pixelCanvas.zoomOut();
         updateZoomLevel();
       }

       // Brush tools
       if (e.key === '1') {
         brushEngine.setActiveBrush('pencil');
         uiManager.setActiveTool('brush-pencil');
       } else if (e.key === '2') {
         brushEngine.setActiveBrush('brush');
         uiManager.setActiveTool('brush-brush');
       } else if (e.key === '3') {
         brushEngine.setActiveBrush('spray');
         uiManager.setActiveTool('brush-spray');
       } else if (e.key === '4') {
         brushEngine.setActiveBrush('eraser');
         uiManager.setActiveTool('brush-eraser');
       } else if (e.key === '5') {
         brushEngine.setActiveBrush('fill');
         uiManager.setActiveTool('brush-fill');
       } else if (e.key === '6') {
         brushEngine.setActiveBrush('line');
         uiManager.setActiveTool('brush-line');
       } else if (e.key === '7') {
         brushEngine.setActiveBrush('rect');
         uiManager.setActiveTool('brush-rect');
       } else if (e.key === '8') {
         brushEngine.setActiveBrush('ellipse');
         uiManager.setActiveTool('brush-ellipse');
       } else if (e.key === '9') {
         brushEngine.setActiveBrush('glitch');
         uiManager.setActiveTool('brush-glitch');
       }

       // Symmetry
       if (e.key === 'h') {
         symmetryTools.setSymmetryMode('horizontal');
         uiManager.setActiveSymmetry('symmetry-horizontal');
       } else if (e.key === 'v') {
         symmetryTools.setSymmetryMode('vertical');
         uiManager.setActiveSymmetry('symmetry-vertical');
       } else if (e.key === 'q') {
         symmetryTools.setSymmetryMode('quad');
         uiManager.setActiveSymmetry('symmetry-quad');
       } else if (e.key === 'o') {
         symmetryTools.setSymmetryMode('octal');
         uiManager.setActiveSymmetry('symmetry-octal');
       }

       // Timeline
       if (e.key === 'n') {
         timeline.addFrame();
       } else if (e.key === 'd') {
         timeline.duplicateCurrentFrame();
       } else if (e.key === 'x') {
         timeline.deleteCurrentFrame();
       } else if (e.key === 'space') {
         e.preventDefault();
         if (timeline.isPlaying) {
           timeline.stopAnimation();
         } else {
           timeline.playAnimation();
         }
       }

       // Toggle grid
       if (e.key === 'g') {
         pixelCanvas.toggleGrid();
       }

       // Toggle onion skin
       if (e.key === 's') {
         const onionSkinCheckbox = document.getElementById('onion-skin');
         if (onionSkinCheckbox) {
           onionSkinCheckbox.checked = !onionSkinCheckbox.checked;
           timeline.setOnionSkinning(onionSkinCheckbox.checked);
         }
       }
     });
   }
    
    updateCanvasSizeDisplay();
    uiManager.setActiveTool('brush-pencil');
    uiManager.setActiveSymmetry('symmetry-none');
    uiManager.setActivePalette('palette-monochrome');
  }

  function setupWindowControls() {
    document.getElementById('minimize-button').addEventListener('click', () => voidAPI.minimizeWindow());
    
    document.getElementById('maximize-button').addEventListener('click', () => {
      voidAPI.maximizeWindow().then(result => {
        document.getElementById('maximize-button').textContent = result.isMaximized ? '□' : '[]';
      });
    });
    
    document.getElementById('close-button').addEventListener('click', () => voidAPI.closeWindow());
  }

  function setupMenuManager() {
    // Set up menu button event listeners
    document.getElementById('file-menu-button').addEventListener('click', () => {
      menuSystem.toggleMenu('file-menu');
    });
    
    document.getElementById('edit-menu-button').addEventListener('click', () => {
      menuSystem.toggleMenu('edit-menu');
    });
    
    document.getElementById('view-menu-button').addEventListener('click', () => {
      menuSystem.toggleMenu('view-menu');
    });
    
    document.getElementById('export-menu-button').addEventListener('click', () => {
      menuSystem.toggleMenu('export-menu');
    });
    
    document.getElementById('lore-menu-button').addEventListener('click', () => {
      menuSystem.toggleMenu('lore-menu');
    });
  }

  function setupFileMenu() {
    document.getElementById('new-project').addEventListener('click', handleNewProject);
    document.getElementById('open-project').addEventListener('click', handleOpenProject);
    document.getElementById('save-project').addEventListener('click', handleSaveProject);
  }

  function setupEditMenu() {
    document.getElementById('undo').addEventListener('click', handleUndo);
    document.getElementById('redo').addEventListener('click', handleRedo);
    document.getElementById('toggle-grid').addEventListener('click', handleToggleGrid);
    document.getElementById('resize-canvas').addEventListener('click', handleResizeCanvas);
  }

  function setupExportMenu() {
    document.getElementById('export-png').addEventListener('click', handleExportPNG);
    document.getElementById('export-gif').addEventListener('click', handleExportGIF);
  }

  function setupThemeMenu() {
    document.getElementById('theme-lain-dive').addEventListener('click', () => {
      themeManager.setTheme('lain-dive');
      menuSystem.closeAllMenus();
    });

    document.getElementById('theme-morrowind-glyph').addEventListener('click', () => {
      themeManager.setTheme('morrowind-glyph');
      menuSystem.closeAllMenus();
    });

    document.getElementById('theme-monolith').addEventListener('click', () => {
      themeManager.setTheme('monolith');
      menuSystem.closeAllMenus();
    });
  }

  function setupLoreMenu() {
    document.getElementById('toggle-lore-layer').addEventListener('click', () => {
      menuSystem.closeAllMenus();
      uiManager.showToast('Lore layer toggled', 'info');
    });

    document.getElementById('edit-metadata').addEventListener('click', () => {
      menuSystem.closeAllMenus();
      uiManager.showToast('Metadata ritual initiated', 'success');
    });

    document.getElementById('add-sigil').addEventListener('click', () => {
      menuSystem.closeAllMenus();
      uiManager.showToast('Hidden sigil added', 'success');
    });

    document.getElementById('glitch-inject').addEventListener('click', () => {
      menuSystem.closeAllMenus();
      uiManager.showToast('Glitch injected', 'success');
    });
  }

  function setupToolButtons() {
    document.querySelectorAll('.tool-button').forEach(button => {
      button.addEventListener('click', () => {
        const toolId = button.id;

        if (toolId.startsWith('brush-')) {
          const brushType = toolId.replace('brush-', '');
          brushEngine.setActiveBrush(brushType);
          uiManager.setActiveTool(toolId);
        }

        if (toolId.startsWith('symmetry-')) {
          const symmetryType = toolId.replace('symmetry-', '');
          symmetryTools.setSymmetryMode(symmetryType);
          uiManager.setActiveSymmetry(toolId);
        }
      });
    });
  }

  function setupPaletteOptions() {
    document.querySelectorAll('.palette-option').forEach(option => {
      option.addEventListener('click', () => {
        const paletteId = option.id;
        const paletteName = paletteId.replace('palette-', '');
        paletteTool.setPalette(paletteName);
        uiManager.setActivePalette(paletteId);
      });
    });
  }

  function setupEffectControls() {
    document.querySelectorAll('.effect-checkbox input').forEach(checkbox => {
      checkbox.addEventListener('change', updateEffects);
    });

    document.getElementById('effect-intensity').addEventListener('input', updateEffects);
  }

  function setupBrushControls() {
    document.getElementById('brush-size').addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      brushEngine.setBrushSize(size);
      document.getElementById('brush-size-value').textContent = size;
    });
  }

  function setupTimelineControls() {
    document.getElementById('add-frame').addEventListener('click', () => timeline.addFrame());
    document.getElementById('duplicate-frame').addEventListener('click', () => timeline.duplicateCurrentFrame());
    document.getElementById('delete-frame').addEventListener('click', handleDeleteFrame);
  }

  function setupAnimationControls() {
    document.getElementById('play-animation').addEventListener('click', () => timeline.playAnimation());
    document.getElementById('stop-animation').addEventListener('click', () => timeline.stopAnimation());
    
    document.getElementById('loop-animation').addEventListener('click', (e) => {
      const loopButton = e.currentTarget;
      loopButton.classList.toggle('active');
      timeline.setLooping(loopButton.classList.contains('active'));
    });
    
    document.getElementById('onion-skin').addEventListener('change', (e) => {
      timeline.setOnionSkinning(e.target.checked);
    });
  }

  function setupZoomControls() {
    document.getElementById('zoom-in').addEventListener('click', () => {
      pixelCanvas.zoomIn();
      updateZoomLevel();
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
      pixelCanvas.zoomOut();
      updateZoomLevel();
    });

    document.getElementById('zoom-in-menu').addEventListener('click', () => {
      pixelCanvas.zoomIn();
      updateZoomLevel();
      menuSystem.closeAllMenus();
    });

    document.getElementById('zoom-out-menu').addEventListener('click', () => {
      pixelCanvas.zoomOut();
      updateZoomLevel();
      menuSystem.closeAllMenus();
    });

    document.getElementById('zoom-reset').addEventListener('click', () => {
      pixelCanvas.resetZoom();
      updateZoomLevel();
      menuSystem.closeAllMenus();
    });

    document.getElementById('canvas-wrapper').addEventListener('wheel', (e) => {
      e.preventDefault();
      pixelCanvas.zoomIn(e.deltaY < 0);
      updateZoomLevel();
    }, { passive: false });
  }

  function setupMiscControls() {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.menu-dropdown').forEach(m => m.style.display = 'none');
        document.querySelectorAll('.menu-button').forEach(b => b.classList.remove('active'));
      });
    });
  }

  function handleNewProject() {
    uiManager.showConfirmDialog(
      'Create New Project',
      'This will clear your current project. Are you sure?',
      () => {
        pixelCanvas.clear();
        timeline.clear();
        timeline.addFrame();
        menuSystem.closeAllMenus();
        uiManager.showToast('New project created', 'success');
      }
    );
  }

  function handleOpenProject() {
    voidAPI.openProject().then(result => {
      if (result.success) {
        try {
          const projectData = result.data;
          pixelCanvas.setDimensions(projectData.width, projectData.height);
          timeline.loadFromData(projectData.frames);
          menuSystem.closeAllMenus();
          uiManager.showToast('Project loaded successfully', 'success');
        } catch (error) {
          uiManager.showToast('Failed to load project: ' + error.message, 'error');
        }
      }
    });
  }

  function handleSaveProject() {
    const projectData = {
      width: pixelCanvas.width,
      height: pixelCanvas.height,
      frames: timeline.getFramesData(),
      palette: paletteTool.getCurrentPalette(),
      effects: {
        grain: document.getElementById('effect-grain').checked,
        static: document.getElementById('effect-static').checked,
        glitch: document.getElementById('effect-glitch').checked,
        crt: document.getElementById('effect-crt').checked,
        intensity: document.getElementById('effect-intensity').value
      }
    };

    voidAPI.saveProject(projectData).then(result => {
      if (result.success) {
        menuSystem.closeAllMenus();
        uiManager.showToast('Project saved successfully', 'success');
      } else {
        uiManager.showToast('Failed to save project', 'error');
      }
    });
  }

  function handleUndo() {
    if (pixelCanvas.undo()) {
      uiManager.showToast('Undo successful', 'info');
    } else {
      uiManager.showToast('Nothing to undo', 'info');
    }
    menuSystem.closeAllMenus();
  }

  function handleRedo() {
    if (pixelCanvas.redo()) {
      uiManager.showToast('Redo successful', 'info');
    } else {
      uiManager.showToast('Nothing to redo', 'info');
    }
    menuSystem.closeAllMenus();
  }

  function handleToggleGrid() {
    pixelCanvas.toggleGrid();
    menuSystem.closeAllMenus();
    uiManager.showToast('Grid toggled', 'info');
  }

  function handleResizeCanvas() {
    const content = `
      <div class="form-group">
        <label class="form-label">Preset Sizes:</label>
        <div class="preset-sizes">
          <button class="preset-size-button" data-width="32" data-height="32">32×32</button>
          <button class="preset-size-button" data-width="64" data-height="64">64×64</button>
          <button class="preset-size-button" data-width="88" data-height="31">88×31</button>
          <button class="preset-size-button" data-width="120" data-height="60">120×60</button>
          <button class="preset-size-button" data-width="120" data-height="80">120×80</button>
          <button class="preset-size-button" data-width="128" data-height="128">128×128</button>
          <button class="preset-size-button" data-width="256" data-height="256">256×256</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Custom Size:</label>
        <div class="custom-size">
          <input type="number" id="canvas-width" min="1" max="1024" value="${pixelCanvas.width}">
          <span>×</span>
          <input type="number" id="canvas-height" min="1" max="1024" value="${pixelCanvas.height}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">
          <input type="checkbox" id="preserve-content" checked>
          Preserve content
        </label>
      </div>
    `;

    uiManager.showModal('Resize Canvas', content, () => menuSystem.closeAllMenus());

    document.querySelectorAll('.preset-size-button').forEach(button => {
      button.addEventListener('click', () => {
        const width = parseInt(button.dataset.width);
        const height = parseInt(button.dataset.height);
        document.getElementById('canvas-width').value = width;
        document.getElementById('canvas-height').value = height;
      });
    });

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'modal-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => uiManager.hideModal());

    const resizeButton = document.createElement('button');
    resizeButton.className = 'modal-button primary';
    resizeButton.textContent = 'Resize';
    resizeButton.addEventListener('click', () => {
      const width = parseInt(document.getElementById('canvas-width').value);
      const height = parseInt(document.getElementById('canvas-height').value);
      const preserveContent = document.getElementById('preserve-content').checked;

      if (width > 0 && height > 0 && width <= 1024 && height <= 1024) {
        pixelCanvas.resize(width, height, preserveContent);
        updateCanvasSizeDisplay();
        uiManager.hideModal();
        uiManager.showToast(`Canvas resized to ${width}×${height}`, 'success');
      } else {
        uiManager.showToast('Invalid dimensions', 'error');
      }
    });

    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(resizeButton);
    document.querySelector('.modal-dialog').appendChild(modalFooter);
    menuSystem.closeAllMenus();
  }

  function handleExportPNG() {
    const pngDataUrl = pixelCanvas.exportToPNG();
    try {
      voidAPI.exportPng(pngDataUrl).then(result => {
        if (result.success) {
          menuSystem.closeAllMenus();
          uiManager.showToast('PNG exported successfully', 'success');
        } else {
          uiManager.showToast('Failed to export PNG', 'error');
        }
      }).catch(error => {
        uiManager.showToast(`PNG export failed: ${error.message}`, 'error');
      });
    } catch (error) {
      uiManager.showToast(`PNG export error: ${error.message}`, 'error');
    }
  }

  function handleExportGIF() {
    uiManager.showLoadingDialog('Generating GIF...');
    const frameDelay = parseInt(document.getElementById('frame-delay').value);
    
    try {
      gifExporter.generateGif(frameDelay).then(gifData => {
        voidAPI.exportGif(gifData).then(result => {
          uiManager.hideLoadingDialog();
          if (result.success) {
            menuSystem.closeAllMenus();
            uiManager.showToast('GIF exported successfully', 'success');
          } else {
            uiManager.showToast('Failed to export GIF', 'error');
          }
        }).catch(error => {
          uiManager.hideLoadingDialog();
          uiManager.showToast(`GIF export failed: ${error.message}`, 'error');
        });
      }).catch(error => {
        uiManager.hideLoadingDialog();
        uiManager.showToast(`GIF generation failed: ${error.message}`, 'error');
      });
    } catch (error) {
      uiManager.hideLoadingDialog();
      uiManager.showToast(`GIF export error: ${error.message}`, 'error');
    }
  }

  function handleDeleteFrame() {
    if (timeline.getFrameCount() > 1) {
      timeline.deleteCurrentFrame();
    } else {
      uiManager.showToast('Cannot delete the only frame', 'error');
    }
  }

  /**
   * Update all active effects
   */
  function updateEffects() {
    const effects = {
      grain: document.getElementById('effect-grain').checked,
      static: document.getElementById('effect-static').checked,
      glitch: document.getElementById('effect-glitch').checked,
      crt: document.getElementById('effect-crt').checked,
      intensity: document.getElementById('effect-intensity').value / 100
    };
  
    pixelCanvas.setEffects(effects);
  }

  /**
   * Update the zoom level display
   */
  function updateZoomLevel() {
    const zoomPercent = Math.round(pixelCanvas.getZoom() * 100);
    document.getElementById('zoom-level').textContent = zoomPercent + '%';
  }

  /**
   * Update the canvas size display
   */
  function updateCanvasSizeDisplay() {
    const width = pixelCanvas.width;
    const height = pixelCanvas.height;
    document.getElementById('canvas-size').textContent = `${width}x${height}`;
  }

  /**
   * Show canvas size selection dialog with visual previews
   */
  function showCanvasSizeSelectionDialog() {
    // Create canvas size options with silhouettes
    const canvasSizes = [
      { width: 32, height: 32, name: '32×32', description: 'Tiny pixel art' },
      { width: 64, height: 64, name: '64×64', description: 'Standard pixel art' },
      { width: 88, height: 31, name: '88×31', description: 'Classic web button' },
      { width: 120, height: 60, name: '120×60', description: 'Small banner' },
      { width: 120, height: 80, name: '120×80', description: 'Small animation' },
      { width: 128, height: 128, name: '128×128', description: 'Medium square' },
      { width: 256, height: 256, name: '256×256', description: 'Large square' }
    ];

    // Create HTML for size options with silhouettes
    let sizesHTML = '<div class="canvas-size-options">';

    canvasSizes.forEach(size => {
      // Calculate silhouette dimensions to match aspect ratio
      let silhouetteWidth, silhouetteHeight;

      if (size.width > size.height) {
        silhouetteWidth = "70%";
        silhouetteHeight = `${Math.round((size.height / size.width) * 70)}%`;
      } else {
        silhouetteHeight = "70%";
        silhouetteWidth = `${Math.round((size.width / size.height) * 70)}%`;
      }

      sizesHTML += `
        <div class="canvas-size-option" data-width="${size.width}" data-height="${size.height}">
          <div class="canvas-size-preview">
            <div class="canvas-size-silhouette" style="width: ${silhouetteWidth}; height: ${silhouetteHeight};"></div>
          </div>
          <div class="canvas-size-info">
            <div class="canvas-size-name">${size.name}</div>
            <div class="canvas-size-description">${size.description}</div>
          </div>
        </div>
      `;
    });

    sizesHTML += '</div>';

    // Show the modal with size options and a title
    const modalContent = `
      <h3 style="text-align: center; margin-bottom: 20px; color: var(--highlight-color); text-shadow: var(--text-glow);">
        Select Canvas Size Template
      </h3>
      <p style="text-align: center; margin-bottom: 20px; color: var(--secondary-color);">
        Choose a canvas size to begin your creation
      </p>
      ${sizesHTML}
    `;

    uiManager.showModal('Conjuration', modalContent, null, false);

    // Add event listeners to size options
    document.querySelectorAll('.canvas-size-option').forEach(option => {
      option.addEventListener('click', () => {
        const width = parseInt(option.dataset.width);
        const height = parseInt(option.dataset.height);

        // Resize the canvas
        pixelCanvas.resize(width, height, false);
        updateCanvasSizeDisplay();

        // Close the modal
        uiManager.hideModal();

        // Show confirmation message
        uiManager.showToast(`Canvas set to ${width}×${height}`, 'success');
      });
    });

    // Add CSS only once to prevent memory leaks
    if (!document.getElementById('canvas-size-dialog-styles')) {
      const style = document.createElement('style');
      style.id = 'canvas-size-dialog-styles';
      style.textContent = `
        .modal-dialog {
          width: 600px !important;
          height: 500px !important;
          max-width: 80% !important;
          max-height: 80% !important;
        }

        .modal-body {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 10px;
        }

        .canvas-size-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .canvas-size-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          border: 1px solid var(--panel-border);
          background-color: var(--button-bg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .canvas-size-option:hover {
          background-color: var(--button-hover);
          transform: translateY(-2px);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
        }

        .canvas-size-preview {
          position: relative;
          background-color: #000;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--panel-border);
          width: 120px;
          height: 120px;
        }

        .canvas-size-silhouette {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .canvas-size-info {
          text-align: center;
          width: 100%;
        }

        .canvas-size-name {
          font-weight: bold;
          margin-bottom: 5px;
          color: var(--highlight-color);
          text-shadow: var(--text-glow);
        }

        .canvas-size-description {
          font-size: 12px;
          color: var(--secondary-color);
        }

        /* Make the modal dialog more square/rectangular */
        #modal-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `;
      document.head.appendChild(style);
    }
  }
});
