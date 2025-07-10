/**
 * VoidAPI - Interface for Electron IPC communication
 * This file is not used since voidAPI is exposed via preload script
 * Keeping for reference only
 */

// This module is deprecated - voidAPI is now available globally via preload.js
// The actual implementation is in preload.js using contextBridge

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    // Placeholder - actual API is in preload.js
  };
}
