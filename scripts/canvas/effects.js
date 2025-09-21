/**
 * effects.js
 * Implements visual effects for VOIDSKETCH (grain, static, CRT, glitch)
 */

class EffectsEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.effectsCanvas = this.canvas.effectsCanvas;
    this.effectsCtx = this.canvas.effectsCtx;

    // Effect settings
    this.settings = {
      grain: {
        enabled: false,
        intensity: 0.5,
      },
      static: {
        enabled: false,
        intensity: 0.3,
      },
      glitch: {
        enabled: false,
        intensity: 0.4,
      },
      crt: {
        enabled: false,
        intensity: 0.6,
      },
    };

    // Animation frame
    this.animationId = null;

    // Initialize
    this.initialize();
  }

  initialize() {
    // Set up event listeners for effect controls
    document.getElementById("effect-grain").addEventListener("change", (e) => {
      this.settings.grain.enabled = e.target.checked;
      this.updateEffects();
    });

    document.getElementById("effect-static").addEventListener("change", (e) => {
      this.settings.static.enabled = e.target.checked;
      this.updateEffects();
    });

    document.getElementById("effect-glitch").addEventListener("change", (e) => {
      this.settings.glitch.enabled = e.target.checked;
      this.updateEffects();
    });

    document.getElementById("effect-crt").addEventListener("change", (e) => {
      this.settings.crt.enabled = e.target.checked;
      this.updateEffects();
    });

    document
      .getElementById("effect-intensity")
      .addEventListener("input", (e) => {
        const intensity = e.target.value / 100;
        Object.keys(this.settings).forEach((effect) => {
          this.settings[effect].intensity = intensity;
        });
        this.updateEffects();
      });
  }

  updateEffects() {
    // Clear the effects canvas
    this.effectsCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Stop animation if running
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Check if any effects are enabled
    const anyEffectEnabled = Object.values(this.settings).some(
      (effect) => effect.enabled,
    );

    if (anyEffectEnabled) {
      // Apply static effects
      this.renderEffects();

      // Start animation loop for animated effects
      this.animateEffects();
    }
  }

  renderEffects() {
    // Apply each enabled effect
    if (this.settings.grain.enabled) {
      this.applyGrain();
    }

    if (this.settings.crt.enabled) {
      this.applyCrt();
    }
  }

  animateEffects() {
    // Animated effects (static and glitch)
    const animate = () => {
      // Clear the parts of canvas that need animation
      if (this.settings.static.enabled || this.settings.glitch.enabled) {
        this.effectsCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Re-apply static effects
        if (this.settings.grain.enabled) {
          this.applyGrain();
        }

        if (this.settings.crt.enabled) {
          this.applyCrt();
        }
      }

      // Apply animated effects
      if (this.settings.static.enabled) {
        this.applyStatic();
      }

      if (this.settings.glitch.enabled) {
        this.applyGlitch();
      }

      // Continue animation
      this.animationId = requestAnimationFrame(animate);
    };

    // Start animation
    this.animationId = requestAnimationFrame(animate);
  }

  applyGrain() {
    // Apply film grain effect
    const intensity = this.settings.grain.intensity;
    const imageData = this.effectsCtx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Generate noise
      const noise = (Math.random() - 0.5) * intensity * 50;

      // Apply to RGB channels with varying intensity
      data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
      data[i + 3] = 40; // Low alpha for grain overlay
    }

    this.effectsCtx.putImageData(imageData, 0, 0);
  }

  applyStatic() {
    // Apply TV static effect
    const intensity = this.settings.static.intensity;
    const ctx = this.effectsCtx;

    // Draw static noise
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Clear with slight fade
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Create static pattern
    const staticCount = Math.round(
      this.canvas.width * this.canvas.height * intensity * 0.05,
    );

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";

    for (let i = 0; i < staticCount; i++) {
      const x = Math.floor(Math.random() * this.canvas.width);
      const y = Math.floor(Math.random() * this.canvas.height);
      const size = Math.random() > 0.95 ? 2 : 1; // Occasionally larger static pixels

      ctx.fillRect(x, y, size, size);
    }

    // Occasionally add horizontal static lines
    if (Math.random() < 0.1 * intensity) {
      const y = Math.floor(Math.random() * this.canvas.height);
      const height = Math.floor(Math.random() * 2) + 1;

      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(0, y, this.canvas.width, height);
    }
  }

  applyGlitch() {
    // Apply digital glitch effect
    const intensity = this.settings.glitch.intensity;
    const ctx = this.effectsCtx;

    // Only apply glitches occasionally
    if (Math.random() > intensity * 0.7) return;

    // Create random glitch shapes
    const glitchCount = Math.floor(intensity * 5);

    for (let i = 0; i < glitchCount; i++) {
      // Random positions
      const x = Math.floor(Math.random() * this.canvas.width);
      const y = Math.floor(Math.random() * this.canvas.height);
      const width = Math.floor(Math.random() * 20) + 5;
      const height = Math.floor(Math.random() * 5) + 1;

      // Random colors
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      const a = Math.random() * 0.3;

      // Draw glitch rectangle
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.fillRect(x, y, width, height);
    }

    // Occasional RGB shift
    if (Math.random() < intensity * 0.2) {
      const shiftX = Math.floor(Math.random() * 6) - 3;
      const shiftY = Math.floor(Math.random() * 6) - 3;
      const width = this.canvas.width;
      const height = this.canvas.height;

      // Get image data from the main canvas
      const mainImageData = this.canvas.ctx.getImageData(0, 0, width, height);
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");

      // RGB shift
      tempCtx.putImageData(mainImageData, 0, 0);
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(tempCanvas, shiftX, shiftY);
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
    }
  }

  applyCrt() {
    // Apply CRT screen effect
    const intensity = this.settings.crt.intensity;
    const ctx = this.effectsCtx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Subtle scanlines
    ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
    for (let y = 0; y < height; y += 2) {
      ctx.fillRect(0, y, width, 1);
    }

    // CRT curvature effect using a gradient
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width * 0.7,
    );

    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.8, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.4})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Occasional slight vertical hold jump
    if (Math.random() < 0.03 * intensity) {
      const jumpHeight = Math.floor(Math.random() * 3) + 1;
      const jumpY = Math.floor(Math.random() * height);

      const imageData = this.canvas.ctx.getImageData(
        0,
        jumpY,
        width,
        jumpHeight,
      );
      ctx.putImageData(imageData, 0, jumpY + jumpHeight);
    }
  }

  // Export current effects settings
  getEffectsSettings() {
    return JSON.parse(JSON.stringify(this.settings));
  }

  // Apply specific effects settings
  setEffectsSettings(settings) {
    this.settings = Object.assign({}, this.settings, settings);

    // Update UI controls
    document.getElementById("effect-grain").checked =
      this.settings.grain.enabled;
    document.getElementById("effect-static").checked =
      this.settings.static.enabled;
    document.getElementById("effect-glitch").checked =
      this.settings.glitch.enabled;
    document.getElementById("effect-crt").checked = this.settings.crt.enabled;

    // Calculate average intensity for the intensity slider
    const intensities = Object.values(this.settings).map(
      (effect) => effect.intensity,
    );
    const avgIntensity =
      intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
    document.getElementById("effect-intensity").value = Math.round(
      avgIntensity * 100,
    );

    // Apply effects
    this.updateEffects();
  }
}
