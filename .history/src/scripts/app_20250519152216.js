/**
 * VOIDSKETCH - Main Application
 *
 * This is the main entry point for the application that initializes
 * all components and manages the application state.
 */

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI Manager
  const uiManager = new UIManager();

  // Initialize Theme Manager
  const themeManager = new ThemeManager();

  // Add data-text attributes to section titles for glitch effect
  document.querySelectorAll(".section-title").forEach((title) => {
    title.setAttribute("data-text", title.textContent);
  });

  // Initialize Menu System
  const menuSystem = new MenuSystem();

  // Initialize Canvas with temporary size (will be changed by user selection)
  const pixelCanvas = new PixelCanvas({
    canvasId: "pixel-canvas",
    effectsCanvasId: "effects-canvas",
    uiCanvasId: "ui-canvas",
    width: 64,
    height: 64,
    pixelSize: 8,
  });

  // Show canvas size selection dialog on startup
  showCanvasSizeSelectionDialog();

  // Initialize Brush Engine
  const brushEngine = new BrushEngine(pixelCanvas);

  // Initialize Symmetry Tools
  const symmetryTools = new SymmetryTools(pixelCanvas);

  // Initialize Palette Tool
  const paletteTool = new PaletteTool(pixelCanvas);

  // Initialize Glitch Tool
  const glitchTool = new GlitchTool(pixelCanvas);

  // Initialize Timeline
  const timeline = new Timeline(pixelCanvas);

  // Initialize GIF Exporter
  const gifExporter = new GifExporter(timeline);

  // Set up event listeners
  setupEventListeners();

  // Initialize the first frame
  timeline.addFrame();

  // Show welcome message
  uiManager.showToast("Welcome to VOIDSKETCH", "success");

  /**
   * Set up all event listeners for the application
   */
  function setupEventListeners() {
    // Window control buttons
    document.getElementById("minimize-button").addEventListener("click", () => {
      voidAPI.minimizeWindow();
    });

    document.getElementById("maximize-button").addEventListener("click", () => {
      voidAPI.maximizeWindow().then((result) => {
        // Update button text based on window state
        document.getElementById("maximize-button").textContent =
          result.isMaximized ? "□" : "[]";
      });
    });

    document.getElementById("close-button").addEventListener("click", () => {
      voidAPI.closeWindow();
    });

    // Menu buttons
    document
      .getElementById("file-menu-button")
      .addEventListener("click", () => {
        menuSystem.toggleMenu("file-menu");
      });

    document
      .getElementById("edit-menu-button")
      .addEventListener("click", () => {
        menuSystem.toggleMenu("edit-menu");
      });

    document
      .getElementById("view-menu-button")
      .addEventListener("click", () => {
        menuSystem.toggleMenu("view-menu");
      });

    document
      .getElementById("export-menu-button")
      .addEventListener("click", () => {
        menuSystem.toggleMenu("export-menu");
      });

    document
      .getElementById("lore-menu-button")
      .addEventListener("click", () => {
        menuSystem.toggleMenu("lore-menu");
      });

    // File menu items
    document.getElementById("new-project").addEventListener("click", () => {
      uiManager.showConfirmDialog(
        "Create New Project",
        "This will clear your current project. Are you sure?",
        () => {
          pixelCanvas.clear();
          timeline.clear();
          timeline.addFrame();
          menuSystem.closeAllMenus();
          uiManager.showToast("New project created", "success");
        },
      );
    });

    document.getElementById("open-project").addEventListener("click", () => {
      voidAPI.openProject().then((result) => {
        if (result.success) {
          try {
            const projectData = result.data;
            pixelCanvas.setDimensions(projectData.width, projectData.height);
            timeline.loadFromData(projectData.frames);
            menuSystem.closeAllMenus();
            uiManager.showToast("Project loaded successfully", "success");
          } catch (error) {
            uiManager.showToast(
              "Failed to load project: " + error.message,
              "error",
            );
          }
        }
      });
    });

    document.getElementById("save-project").addEventListener("click", () => {
      const projectData = {
        width: pixelCanvas.width,
        height: pixelCanvas.height,
        frames: timeline.getFramesData(),
        palette: paletteTool.getCurrentPalette(),
        effects: {
          grain: document.getElementById("effect-grain").checked,
          static: document.getElementById("effect-static").checked,
          glitch: document.getElementById("effect-glitch").checked,
          crt: document.getElementById("effect-crt").checked,
          intensity: document.getElementById("effect-intensity").value,
        },
      };

      voidAPI.saveProject(projectData).then((result) => {
        if (result.success) {
          menuSystem.closeAllMenus();
          uiManager.showToast("Project saved successfully", "success");
        } else {
          uiManager.showToast("Failed to save project", "error");
        }
      });
    });

    // Edit menu items
    document.getElementById("undo").addEventListener("click", () => {
      if (pixelCanvas.undo()) {
        uiManager.showToast("Undo successful", "info");
      } else {
        uiManager.showToast("Nothing to undo", "info");
      }
      menuSystem.closeAllMenus();
    });

    document.getElementById("redo").addEventListener("click", () => {
      if (pixelCanvas.redo()) {
        uiManager.showToast("Redo successful", "info");
      } else {
        uiManager.showToast("Nothing to redo", "info");
      }
      menuSystem.closeAllMenus();
    });

    document.getElementById("toggle-grid").addEventListener("click", () => {
      pixelCanvas.toggleGrid();
      menuSystem.closeAllMenus();
      uiManager.showToast("Grid toggled", "info");
    });

    document.getElementById("resize-canvas").addEventListener("click", () => {
      // Show canvas resize dialog
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

      uiManager.showModal("Resize Canvas", content, () => {
        menuSystem.closeAllMenus();
      });

      // Add event listeners to preset buttons
      document.querySelectorAll(".preset-size-button").forEach((button) => {
        button.addEventListener("click", () => {
          const width = parseInt(button.dataset.width);
          const height = parseInt(button.dataset.height);
          document.getElementById("canvas-width").value = width;
          document.getElementById("canvas-height").value = height;
        });
      });

      // Add resize button to modal footer
      const modalFooter = document.createElement("div");
      modalFooter.className = "modal-footer";

      const cancelButton = document.createElement("button");
      cancelButton.className = "modal-button";
      cancelButton.textContent = "Cancel";
      cancelButton.addEventListener("click", () => {
        uiManager.hideModal();
      });

      const resizeButton = document.createElement("button");
      resizeButton.className = "modal-button primary";
      resizeButton.textContent = "Resize";
      resizeButton.addEventListener("click", () => {
        const width = parseInt(document.getElementById("canvas-width").value);
        const height = parseInt(document.getElementById("canvas-height").value);
        const preserveContent =
          document.getElementById("preserve-content").checked;

        if (width > 0 && height > 0 && width <= 1024 && height <= 1024) {
          pixelCanvas.resize(width, height, preserveContent);
          updateCanvasSizeDisplay();
          uiManager.hideModal();
          uiManager.showToast(
            `Canvas resized to ${width}×${height}`,
            "success",
          );
        } else {
          uiManager.showToast("Invalid dimensions", "error");
        }
      });

      modalFooter.appendChild(cancelButton);
      modalFooter.appendChild(resizeButton);

      document.querySelector(".modal-dialog").appendChild(modalFooter);

      menuSystem.closeAllMenus();
    });

    // Export menu items
    document.getElementById("export-png").addEventListener("click", () => {
      const pngDataUrl = pixelCanvas.exportToPNG();
      voidAPI.exportPng(pngDataUrl).then((result) => {
        if (result.success) {
          menuSystem.closeAllMenus();
          uiManager.showToast("PNG exported successfully", "success");
        } else {
          uiManager.showToast("Failed to export PNG", "error");
        }
      });
    });

    document.getElementById("export-gif").addEventListener("click", () => {
      uiManager.showLoadingDialog("Generating GIF...");

      // Get frame delay from input
      const frameDelay = parseInt(document.getElementById("frame-delay").value);

      // Generate GIF
      gifExporter
        .generateGif(frameDelay)
        .then((gifData) => {
          voidAPI.exportGif(gifData).then((result) => {
            uiManager.hideLoadingDialog();
            if (result.success) {
              menuSystem.closeAllMenus();
              uiManager.showToast("GIF exported successfully", "success");
            } else {
              uiManager.showToast("Failed to export GIF", "error");
            }
          });
        })
        .catch((error) => {
          uiManager.hideLoadingDialog();
          uiManager.showToast(
            "Failed to generate GIF: " + error.message,
            "error",
          );
        });
    });

    // Theme selection
    document.getElementById("theme-lain-dive").addEventListener("click", () => {
      themeManager.setTheme("lain-dive");
      menuSystem.closeAllMenus();
    });

    document
      .getElementById("theme-morrowind-glyph")
      .addEventListener("click", () => {
        themeManager.setTheme("morrowind-glyph");
        menuSystem.closeAllMenus();
      });

    document.getElementById("theme-monolith").addEventListener("click", () => {
      themeManager.setTheme("monolith");
      menuSystem.closeAllMenus();
    });

    // Tool buttons
    document.querySelectorAll(".tool-button").forEach((button) => {
      button.addEventListener("click", () => {
        const toolId = button.id;

        // Handle brush tools
        if (toolId.startsWith("brush-")) {
          const brushType = toolId.replace("brush-", "");
          brushEngine.setActiveBrush(brushType);
          uiManager.setActiveTool(toolId);
        }

        // Handle symmetry tools
        if (toolId.startsWith("symmetry-")) {
          const symmetryType = toolId.replace("symmetry-", "");
          symmetryTools.setSymmetryMode(symmetryType);
          uiManager.setActiveSymmetry(toolId);
        }
      });
    });

    // Palette options
    document.querySelectorAll(".palette-option").forEach((option) => {
      option.addEventListener("click", () => {
        const paletteId = option.id;
        const paletteName = paletteId.replace("palette-", "");
        paletteTool.setPalette(paletteName);
        uiManager.setActivePalette(paletteId);
      });
    });

    // Effect checkboxes
    document.querySelectorAll(".effect-checkbox input").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateEffects();
      });
    });

    // Effect intensity slider
    document
      .getElementById("effect-intensity")
      .addEventListener("input", () => {
        updateEffects();
      });

    // Brush size slider
    document.getElementById("brush-size").addEventListener("input", (e) => {
      const size = parseInt(e.target.value);
      brushEngine.setBrushSize(size);
      document.getElementById("brush-size-value").textContent = size;
    });

    // Timeline controls
    document.getElementById("add-frame").addEventListener("click", () => {
      timeline.addFrame();
    });

    document.getElementById("duplicate-frame").addEventListener("click", () => {
      timeline.duplicateCurrentFrame();
    });

    document.getElementById("delete-frame").addEventListener("click", () => {
      if (timeline.getFrameCount() > 1) {
        timeline.deleteCurrentFrame();
      } else {
        uiManager.showToast("Cannot delete the only frame", "error");
      }
    });

    // Animation controls
    document.getElementById("play-animation").addEventListener("click", () => {
      timeline.playAnimation();
    });

    document.getElementById("stop-animation").addEventListener("click", () => {
      timeline.stopAnimation();
    });

    document.getElementById("loop-animation").addEventListener("click", (e) => {
      const loopButton = e.currentTarget;
      loopButton.classList.toggle("active");
      timeline.setLooping(loopButton.classList.contains("active"));
    });

    // Onion skin toggle
    document.getElementById("onion-skin").addEventListener("change", (e) => {
      timeline.setOnionSkinning(e.target.checked);
    });

    // Zoom controls
    document.getElementById("zoom-in").addEventListener("click", () => {
      pixelCanvas.zoomIn();
      updateZoomLevel();
    });

    document.getElementById("zoom-out").addEventListener("click", () => {
      pixelCanvas.zoomOut();
      updateZoomLevel();
    });

    // Canvas size display
    updateCanvasSizeDisplay();

    // Initialize with default tool
    uiManager.setActiveTool("brush-pencil");
    uiManager.setActiveSymmetry("symmetry-none");
    uiManager.setActivePalette("palette-monochrome");
  }

  /**
   * Update all active effects
   */
  function updateEffects() {
    const effects = {
      grain: document.getElementById("effect-grain").checked,
      static: document.getElementById("effect-static").checked,
      glitch: document.getElementById("effect-glitch").checked,
      crt: document.getElementById("effect-crt").checked,
      scanlines: document.getElementById("effect-scanlines").checked,
      vignette: document.getElementById("effect-vignette").checked,
      noise: document.getElementById("effect-noise").checked,
      pixelate: document.getElementById("effect-pixelate").checked,
      intensity: document.getElementById("effect-intensity").value / 100,
    };

    pixelCanvas.setEffects(effects);
  }

  /**
   * Update the zoom level display
   */
  function updateZoomLevel() {
    const zoomPercent = Math.round(pixelCanvas.getZoom() * 100);
    document.getElementById("zoom-level").textContent = zoomPercent + "%";
  }

  /**
   * Update the canvas size display
   */
  function updateCanvasSizeDisplay() {
    const width = pixelCanvas.width;
    const height = pixelCanvas.height;
    document.getElementById("canvas-size").textContent = `${width}x${height}`;
  }

  /**
   * Show canvas size selection dialog with visual previews
   */
  function showCanvasSizeSelectionDialog() {
    // Create canvas size options with silhouettes
    const canvasSizes = [
      { width: 32, height: 32, name: "32×32", description: "Tiny pixel art" },
      {
        width: 64,
        height: 64,
        name: "64×64",
        description: "Standard pixel art",
      },
      {
        width: 88,
        height: 31,
        name: "88×31",
        description: "Classic web button",
      },
      { width: 120, height: 60, name: "120×60", description: "Small banner" },
      {
        width: 120,
        height: 80,
        name: "120×80",
        description: "Small animation",
      },
      {
        width: 350,
        height: 350,
        name: "350×350",
        description: "Medium square",
      },
      {
        width: 800,
        height: 500,
        name: "800×500",
        description: "Large landscape",
      },
      { width: 900, height: 900, name: "900×900", description: "Large square" },
    ];

    // Create HTML for size options with silhouettes
    let sizesHTML = '<div class="canvas-size-options">';

    canvasSizes.forEach((size) => {
      // Calculate aspect ratio for preview
      const maxPreviewSize = 100;
      let previewWidth, previewHeight;

      if (size.width > size.height) {
        previewWidth = maxPreviewSize;
        previewHeight = Math.round((size.height / size.width) * maxPreviewSize);
      } else {
        previewHeight = maxPreviewSize;
        previewWidth = Math.round((size.width / size.height) * maxPreviewSize);
      }

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

    sizesHTML += "</div>";

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

    uiManager.showModal("VOIDSKETCH", modalContent, null, false);

    // Add event listeners to size options
    document.querySelectorAll(".canvas-size-option").forEach((option) => {
      option.addEventListener("click", () => {
        const width = parseInt(option.dataset.width);
        const height = parseInt(option.dataset.height);

        // Resize the canvas
        pixelCanvas.resize(width, height, false);
        updateCanvasSizeDisplay();

        // Close the modal
        uiManager.hideModal();

        // Show confirmation message
        uiManager.showToast(`Canvas set to ${width}×${height}`, "success");
      });
    });

    // Add some CSS for the size selection dialog
    const style = document.createElement("style");
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
});
