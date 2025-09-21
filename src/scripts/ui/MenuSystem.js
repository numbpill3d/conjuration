/**
 * MenuSystem Class
 *
 * Handles menu interactions and management.
 */
class MenuSystem {
  /**
   * Create a new MenuSystem
   */
  constructor() {
    this.activeMenu = null;
    this.menuButtons = document.querySelectorAll(".menu-button");
    this.menuDropdowns = document.querySelectorAll(".menu-dropdown");

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Close menus when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".menu-button") &&
        !e.target.closest(".menu-dropdown")
      ) {
        this.closeAllMenus();
      }
    });

    // Close menus when pressing Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllMenus();
      }
    });

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Set up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Only handle shortcuts when not in an input field
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      // Ctrl+N: New Project
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        document.getElementById("new-project").click();
      }

      // Ctrl+O: Open Project
      if (e.ctrlKey && e.key === "o") {
        e.preventDefault();
        document.getElementById("open-project").click();
      }

      // Ctrl+S: Save Project
      if (e.ctrlKey && e.key === "s" && !e.shiftKey) {
        e.preventDefault();
        document.getElementById("save-project").click();
      }

      // Ctrl+Shift+S: Save Project As
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        document.getElementById("save-project-as").click();
      }

      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        document.getElementById("undo").click();
      }

      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if (
        (e.ctrlKey && e.key === "y") ||
        (e.ctrlKey && e.shiftKey && e.key === "Z")
      ) {
        e.preventDefault();
        document.getElementById("redo").click();
      }

      // Ctrl+G: Toggle Grid
      if (e.ctrlKey && e.key === "g") {
        e.preventDefault();
        document.getElementById("toggle-grid").click();
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case "b": // Pencil Tool
          document.getElementById("brush-pencil").click();
          break;
        case "e": // Eraser Tool
          document.getElementById("brush-eraser").click();
          break;
        case "f": // Fill Tool
          document.getElementById("brush-fill").click();
          break;
        case "l": // Line Tool
          document.getElementById("brush-line").click();
          break;
        case "r": // Rectangle Tool
          document.getElementById("brush-rect").click();
          break;
        case "o": // Ellipse Tool
          document.getElementById("brush-ellipse").click();
          break;
        case "g": // Glitch Tool
          document.getElementById("brush-glitch").click();
          break;
        case "s": // Static Tool
          document.getElementById("brush-static").click();
          break;
      }
    });
  }

  /**
   * Toggle a menu
   * @param {string} menuId - ID of the menu to toggle
   */
  toggleMenu(menuId) {
    const menu = document.getElementById(menuId);

    if (!menu) return;

    // If this menu is already active, close it
    if (this.activeMenu === menuId) {
      this.closeMenu(menuId);
      return;
    }

    // Close any open menu
    this.closeAllMenus();

    // Open this menu
    this.openMenu(menuId);
  }

  /**
   * Open a menu
   * @param {string} menuId - ID of the menu to open
   */
  openMenu(menuId) {
    const menu = document.getElementById(menuId);
    const button = document.getElementById(`${menuId}-button`);

    if (!menu || !button) return;

    // Position the menu
    this.positionMenu(menu, button);

    // Show the menu
    menu.style.display = "flex";
    menu.classList.add("visible");

    // Add active class to the button
    button.classList.add("active");

    // Set as active menu
    this.activeMenu = menuId;

    // Log for debugging
    console.log(`Opening menu: ${menuId}`);
  }

  /**
   * Close a menu
   * @param {string} menuId - ID of the menu to close
   */
  closeMenu(menuId) {
    const menu = document.getElementById(menuId);
    const button = document.getElementById(`${menuId}-button`);

    if (!menu || !button) return;

    // Hide the menu
    menu.style.display = "none";
    menu.classList.remove("visible");

    // Remove active class from the button
    button.classList.remove("active");

    // Clear active menu
    this.activeMenu = null;

    // Log for debugging
    console.log(`Closing menu: ${menuId}`);
  }

  /**
   * Close all menus
   */
  closeAllMenus() {
    this.menuDropdowns.forEach((menu) => {
      menu.style.display = "none";
      menu.classList.remove("visible");
    });

    this.menuButtons.forEach((button) => {
      button.classList.remove("active");
    });

    this.activeMenu = null;

    // Log for debugging
    console.log("Closing all menus");
  }

  /**
   * Position a menu relative to its button
   * @param {HTMLElement} menu - Menu element
   * @param {HTMLElement} button - Button element
   */
  positionMenu(menu, button) {
    const buttonRect = button.getBoundingClientRect();

    // Position the menu below the button
    menu.style.left = `${buttonRect.left}px`;
    menu.style.top = `${buttonRect.bottom}px`;

    // Ensure the menu is visible by setting a high z-index
    menu.style.zIndex = "2000";
  }

  /**
   * Create a context menu
   * @param {MouseEvent} e - Mouse event
   * @param {Array} items - Array of menu item objects
   */
  createContextMenu(e, items) {
    // Prevent default context menu
    e.preventDefault();

    // Close any open menus
    this.closeAllMenus();

    // Create or get the context menu element
    let contextMenu = document.getElementById("context-menu");

    if (!contextMenu) {
      contextMenu = document.createElement("div");
      contextMenu.id = "context-menu";
      contextMenu.className = "menu-dropdown";
      document.body.appendChild(contextMenu);
    }

    // Clear the context menu
    contextMenu.innerHTML = "";

    // Add menu items
    items.forEach((item) => {
      if (item.separator) {
        // Add separator
        const separator = document.createElement("div");
        separator.className = "menu-separator";
        contextMenu.appendChild(separator);
      } else {
        // Add menu item
        const menuItem = document.createElement("button");
        menuItem.className = "menu-item";
        menuItem.type = "button"; // Add type attribute
        menuItem.textContent = item.label;

        if (item.disabled) {
          menuItem.classList.add("disabled");
        } else {
          menuItem.addEventListener("click", () => {
            this.hideContextMenu();
            if (item.action) item.action();
          });
        }

        contextMenu.appendChild(menuItem);
      }
    });

    // Position the context menu
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;

    // Show the context menu
    contextMenu.style.display = "flex";

    // Bind the hideContextMenu method to this instance
    this._boundHideContextMenu = this.hideContextMenu.bind(this);

    // Add event listener to hide the context menu when clicking outside
    setTimeout(() => {
      document.addEventListener("click", this._boundHideContextMenu);
    }, 0);
  }

  /**
   * Hide the context menu
   */
  hideContextMenu() {
    const contextMenu = document.getElementById("context-menu");

    if (contextMenu) {
      contextMenu.style.display = "none";
    }

    // Remove the event listener using the bound method
    if (this._boundHideContextMenu) {
      document.removeEventListener("click", this._boundHideContextMenu);
    }
  }

  /**
   * Add a menu item to a menu
   * @param {string} menuId - ID of the menu
   * @param {Object} item - Menu item object
   * @param {number} position - Position to insert the item (optional)
   */
  addMenuItem(menuId, item, position = null) {
    const menu = document.getElementById(menuId);

    if (!menu) return;

    // Create the menu item
    const menuItem = document.createElement("button");
    menuItem.className = "menu-item";
    menuItem.id = item.id;
    menuItem.type = "button"; // Add type attribute
    menuItem.textContent = item.label;

    if (item.disabled) {
      menuItem.classList.add("disabled");
    } else {
      menuItem.addEventListener("click", item.action);
    }

    // Add shortcut text if provided
    if (item.shortcut) {
      const shortcutSpan = document.createElement("span");
      shortcutSpan.className = "menu-shortcut";
      shortcutSpan.textContent = item.shortcut;
      menuItem.appendChild(shortcutSpan);
    }

    // Insert at the specified position or append to the end
    if (position !== null && position < menu.children.length) {
      menu.insertBefore(menuItem, menu.children[position]);
    } else {
      menu.appendChild(menuItem);
    }
  }

  /**
   * Remove a menu item from a menu
   * @param {string} menuItemId - ID of the menu item to remove
   */
  removeMenuItem(menuItemId) {
    const menuItem = document.getElementById(menuItemId);

    if (menuItem?.parentNode) {
      menuItem.parentNode.removeChild(menuItem);
    }
  }

  /**
   * Enable or disable a menu item
   * @param {string} menuItemId - ID of the menu item
   * @param {boolean} enabled - Whether the item should be enabled
   */
  setMenuItemEnabled(menuItemId, enabled) {
    const menuItem = document.getElementById(menuItemId);

    if (menuItem) {
      if (enabled) {
        menuItem.classList.remove("disabled");
      } else {
        menuItem.classList.add("disabled");
      }
    }
  }
}
