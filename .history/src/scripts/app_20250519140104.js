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

  // Initialize Menu System
  const menuSystem = new MenuSystem();

  // Initialize Canvas
  const pixelCanvas = new PixelCanvas({
    canvasId: "pixel-canvas",
    effectsCanvasId: "effects-canvas",
    uiCanvasId: "ui-canvas",
    width: 64,
    height: 64,
    pixelSize: 8,
  });

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
});
