/**
 * MenuManager - Centralized menu management system
 * Handles all menu interactions and state management
 */
class MenuManager {
  constructor() {
    this.menus = new Map();
    this.activeMenu = null;
    
    // Register all menus
    this.registerMenu('file', 'file-menu-button', 'file-menu');
    this.registerMenu('edit', 'edit-menu-button', 'edit-menu');
    this.registerMenu('view', 'view-menu-button', 'view-menu');
    this.registerMenu('export', 'export-menu-button', 'export-menu');
    this.registerMenu('lore', 'lore-menu-button', 'lore-menu');
    
    // Close menus when clicking outside
    document.addEventListener('click', () => this.closeAllMenus());
  }

  /**
   * Register a new menu
   * @param {string} name - Menu identifier
   * @param {string} buttonId - Button element ID
   * @param {string} menuId - Menu element ID
   */
  registerMenu(name, buttonId, menuId) {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);
    
    if (!button || !menu) {
      console.warn(`Menu elements not found for: ${name}`);
      return;
    }
    
    this.menus.set(name, { button, menu });
    
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu(name);
    });
  }

  /**
   * Toggle menu visibility
   * @param {string} name - Menu identifier
   */
  toggleMenu(name) {
    const menuData = this.menus.get(name);
    if (!menuData) return;

    if (this.activeMenu === name) {
      this.closeMenu(name);
    } else {
      this.closeAllMenus();
      this.openMenu(name);
    }
  }

  /**
   * Open a specific menu
   * @param {string} name - Menu identifier
   */
  openMenu(name) {
    const menuData = this.menus.get(name);
    if (!menuData) return;

    const { button, menu } = menuData;
    const buttonRect = button.getBoundingClientRect();
    
    menu.style.left = `${buttonRect.left}px`;
    menu.style.top = `${buttonRect.bottom}px`;
    menu.style.zIndex = '2000';
    menu.style.display = 'flex';
    button.classList.add('active');
    
    this.activeMenu = name;
  }

  /**
   * Close a specific menu
   * @param {string} name - Menu identifier
   */
  closeMenu(name) {
    const menuData = this.menus.get(name);
    if (!menuData) return;

    menuData.menu.style.display = 'none';
    menuData.button.classList.remove('active');
    
    if (this.activeMenu === name) {
      this.activeMenu = null;
    }
  }

  /**
   * Close all menus
   */
  closeAllMenus() {
    this.menus.forEach((menuData, name) => {
      this.closeMenu(name);
    });
  }
}

export default MenuManager;