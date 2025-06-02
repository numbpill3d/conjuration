/**
 * ThemeManager Class
 * 
 * Handles theme switching and management.
 */
class ThemeManager {
  /**
   * Create a new ThemeManager
   */
  constructor() {
    this.currentTheme = 'lain-dive';
    this.themeStylesheet = document.getElementById('theme-stylesheet');
    this.bodyElement = document.body;
    
    // Initialize with the default theme
    this.setTheme(this.currentTheme);
  }
  
  /**
   * Set the current theme
   * @param {string} themeName - Name of the theme to set
   */
  setTheme(themeName) {
    // Update the theme stylesheet
    this.themeStylesheet.href = `styles/themes/${themeName}.css`;
    
    // Update the body class
    this.bodyElement.className = `theme-${themeName}`;
    
    // Store the current theme
    this.currentTheme = themeName;
    
    // Save the theme preference to localStorage
    localStorage.setItem('voidsketch-theme', themeName);
  }
  
  /**
   * Get the current theme
   * @returns {string} Name of the current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  /**
   * Load the theme preference from localStorage
   */
  loadThemePreference() {
    const savedTheme = localStorage.getItem('voidsketch-theme');
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }
  
  /**
   * Get all available themes
   * @returns {Array} Array of theme objects
   */
  getAvailableThemes() {
    return [
      {
        id: 'lain-dive',
        name: 'Lain Dive',
        description: 'Purple hues inspired by Serial Experiments Lain'
      },
      {
        id: 'morrowind-glyph',
        name: 'Morrowind Glyph',
        description: 'Warm sepia tones inspired by Elder Scrolls UI'
      },
      {
        id: 'monolith',
        name: 'Monolith',
        description: 'Minimalist black and white high contrast theme'
      }
    ];
  }
  
  /**
   * Apply a glitch effect to the theme
   * @param {number} intensity - Intensity of the glitch effect (0-1)
   */
  applyGlitchEffect(intensity = 0.5) {
    // Create a style element for the glitch effect
    let glitchStyle = document.getElementById('glitch-effect-style');
    
    if (!glitchStyle) {
      glitchStyle = document.createElement('style');
      glitchStyle.id = 'glitch-effect-style';
      document.head.appendChild(glitchStyle);
    }
    
    // Generate random CSS transforms
    const transforms = [];
    
    for (let i = 0; i < 10; i++) {
      const skewX = (Math.random() - 0.5) * intensity * 10;
      const skewY = (Math.random() - 0.5) * intensity * 10;
      const translateX = (Math.random() - 0.5) * intensity * 10;
      const translateY = (Math.random() - 0.5) * intensity * 10;
      
      transforms.push(`
        ${i * 10}% {
          transform: skew(${skewX}deg, ${skewY}deg) translate(${translateX}px, ${translateY}px);
        }
      `);
    }
    
    // Create the keyframes animation
    const keyframes = `
      @keyframes glitch-transform {
        ${transforms.join('')}
        100% {
          transform: skew(0) translate(0);
        }
      }
    `;
    
    // Apply the glitch effect
    glitchStyle.textContent = `
      ${keyframes}
      
      body {
        animation: glitch-transform 0.5s infinite;
      }
      
      .tool-button, .menu-button, .panel-title, .section-title {
        position: relative;
      }
      
      .tool-button::before, .menu-button::before, .panel-title::before, .section-title::before {
        content: attr(data-text);
        position: absolute;
        left: -${intensity * 3}px;
        top: 0;
        color: rgba(255, 0, 0, 0.7);
        clip: rect(0, 900px, 0, 0);
        animation: glitch-noise 2s infinite linear alternate-reverse;
      }
      
      .tool-button::after, .menu-button::after, .panel-title::after, .section-title::after {
        content: attr(data-text);
        position: absolute;
        left: ${intensity * 3}px;
        top: 0;
        color: rgba(0, 255, 255, 0.7);
        clip: rect(0, 900px, 0, 0);
        animation: glitch-noise 3s infinite linear alternate-reverse;
      }
      
      @keyframes glitch-noise {
        0% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        5% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        10% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        15% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        20% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        25% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        30% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        35% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        40% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        45% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        50% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        55% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        60% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        65% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        70% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        75% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        80% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        85% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        90% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        95% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
        100% {
          clip: rect(${Math.random() * 100}px, 9999px, ${Math.random() * 100}px, 0);
        }
      }
    `;
    
    // Add data-text attributes to elements
    document.querySelectorAll('.tool-button, .menu-button, .panel-title, .section-title').forEach(element => {
      element.setAttribute('data-text', element.textContent);
    });
    
    // Remove the effect after a short time
    setTimeout(() => {
      glitchStyle.textContent = '';
    }, 2000);
  }
  
  /**
   * Remove the glitch effect
   */
  removeGlitchEffect() {
    const glitchStyle = document.getElementById('glitch-effect-style');
    
    if (glitchStyle) {
      glitchStyle.textContent = '';
    }
  }
}
