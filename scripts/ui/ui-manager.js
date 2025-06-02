/**
 * UIManager.js
 * Manages the user interface for VOIDSKETCH
 */

class UIManager {
    constructor() {
        // References to UI elements
        this.menuButtons = {};
        this.menuDropdowns = {};
        this.modalContainer = document.getElementById('modal-container');
        this.modalContent = document.getElementById('modal-content');
        this.toastContainer = document.getElementById('toast-container');
        
        // Track open menu
        this.activeMenu = null;
        
        // Initialize
        this.initialize();
    }
    
    initialize() {
        // Collect menu buttons and dropdowns
        const menuButtons = document.querySelectorAll('.menu-button');
        const menuDropdowns = document.querySelectorAll('.menu-dropdown');
        
        // Store references
        menuButtons.forEach(button => {
            const id = button.id;
            this.menuButtons[id] = button;
        });
        
        menuDropdowns.forEach(dropdown => {
            const id = dropdown.id;
            this.menuDropdowns[id] = dropdown;
        });
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up window controls
        this.setupWindowControls();
    }
    
    setupEventListeners() {
        // Menu button click handlers
        Object.entries(this.menuButtons).forEach(([id, button]) => {
            button.addEventListener('click', () => this.toggleMenu(id));
        });
        
        // Document click handler to close menus when clicking outside
        document.addEventListener('click', (event) => {
            const isMenuClick = event.target.closest('.menu-button') || event.target.closest('.menu-dropdown');
            
            if (!isMenuClick && this.activeMenu) {
                this.closeAllMenus();
            }
        });
        
        // Modal click handler to close when clicking outside content
        this.modalContainer.addEventListener('click', (event) => {
            if (event.target === this.modalContainer) {
                this.closeModal();
            }
        });
        
        // Escape key to close menus/modals
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAllMenus();
                this.closeModal();
            }
        });
        
        // Set up menu item handlers
        this.setupMenuItemHandlers();
    }
    
    setupWindowControls() {
        // Minimize button
        document.getElementById('minimize-button').addEventListener('click', () => {
            window.voidAPI.minimizeWindow();
        });
        
        // Maximize button
        document.getElementById('maximize-button').addEventListener('click', () => {
            window.voidAPI.maximizeWindow().then(result => {
                const button = document.getElementById('maximize-button');
                if (result.isMaximized) {
                    button.textContent = '[]';
                } else {
                    button.textContent = '[]';
                }
            });
        });
        
        // Close button
        document.getElementById('close-button').addEventListener('click', () => {
            // Show confirmation dialog before closing
            this.showConfirmDialog(
                'Exit VOIDSKETCH',
                'Are you sure you want to exit? Any unsaved changes will be lost.',
                () => window.voidAPI.closeWindow()
            );
        });
    }
    
    setupMenuItemHandlers() {
        // File menu items
        document.getElementById('new-project').addEventListener('click', () => {
            this.closeAllMenus();
            this.showConfirmDialog(
                'New Project',
                'Create a new project? Any unsaved changes will be lost.',
                () => this.triggerEvent('new-project')
            );
        });
        
        document.getElementById('open-project').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('open-project');
        });
        
        document.getElementById('save-project').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('save-project');
        });
        
        document.getElementById('save-project-as').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('save-project-as');
        });
        
        document.getElementById('exit-app').addEventListener('click', () => {
            this.closeAllMenus();
            this.showConfirmDialog(
                'Exit VOIDSKETCH',
                'Are you sure you want to exit? Any unsaved changes will be lost.',
                () => window.voidAPI.closeWindow()
            );
        });
        
        // Edit menu items
        document.getElementById('undo').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('undo');
        });
        
        document.getElementById('redo').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('redo');
        });
        
        document.getElementById('cut').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('cut');
        });
        
        document.getElementById('copy').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('copy');
        });
        
        document.getElementById('paste').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('paste');
        });
        
        document.getElementById('select-all').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('select-all');
        });
        
        document.getElementById('deselect').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('deselect');
        });
        
        // View menu items
        document.getElementById('theme-lain-dive').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('change-theme', 'lain-dive');
        });
        
        document.getElementById('theme-morrowind-glyph').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('change-theme', 'morrowind-glyph');
        });
        
        document.getElementById('theme-monolith').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('change-theme', 'monolith');
        });
        
        document.getElementById('toggle-grid').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('toggle-grid');
        });
        
        document.getElementById('toggle-rulers').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('toggle-rulers');
        });
        
        // Export menu items
        document.getElementById('export-png').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('export-png');
        });
        
        document.getElementById('export-gif').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('export-gif');
        });
        
        document.getElementById('export-sprite-sheet').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('export-sprite-sheet');
        });
        
        // Lore menu items
        document.getElementById('toggle-lore-layer').addEventListener('click', () => {
            this.closeAllMenus();
            this.triggerEvent('toggle-lore-layer');
        });
        
        document.getElementById('edit-metadata').addEventListener('click', () => {
            this.closeAllMenus();
            this.showMetadataEditor();
        });
        
        document.getElementById('add-sigil').addEventListener('click', () => {
            this.closeAllMenus();
            this.showSigilEditor();
        });
        
        document.getElementById('glitch-inject').addEventListener('click', () => {
            this.closeAllMenus();
            this.showGlitchOptions();
        });
    }
    
    toggleMenu(buttonId) {
        // Extract menu id from button id (remove '-button' suffix)
        const menuId = buttonId.replace('-button', '');
        
        // Get the corresponding dropdown
        const dropdown = this.menuDropdowns[menuId];
        
        if (!dropdown) return;
        
        // If menu is already active, close it
        if (this.activeMenu === menuId) {
            this.closeAllMenus();
            return;
        }
        
        // Close all open menus
        this.closeAllMenus();
        
        // Open the clicked menu
        dropdown.classList.add('active');
        this.menuButtons[buttonId].classList.add('active');
        
        // Set active menu
        this.activeMenu = menuId;
        
        // Position the menu
        this.positionMenu(buttonId, menuId);
    }
    
    positionMenu(buttonId, menuId) {
        const button = this.menuButtons[buttonId];
        const dropdown = this.menuDropdowns[menuId];
        
        if (!button || !dropdown) return;
        
        // Get button position
        const buttonRect = button.getBoundingClientRect();
        
        // Position the dropdown below the button
        dropdown.style.left = `${buttonRect.left}px`;
    }
    
    closeAllMenus() {
        // Remove active class from all dropdowns
        Object.values(this.menuDropdowns).forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        
        // Remove active class from all buttons
        Object.values(this.menuButtons).forEach(button => {
            button.classList.remove('active');
        });
        
        // Reset active menu
        this.activeMenu = null;
    }
    
    showModal(title, content) {
        // Clear previous content
        this.modalContent.innerHTML = '';
        
        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = title;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.textContent = 'x';
        closeButton.addEventListener('click', () => this.closeModal());
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // Create modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        
        // Add content
        if (typeof content === 'string') {
            modalBody.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            modalBody.appendChild(content);
        }
        
        // Add to modal
        this.modalContent.appendChild(modalHeader);
        this.modalContent.appendChild(modalBody);
        
        // Show modal
        this.modalContainer.classList.remove('hidden');
    }
    
    closeModal() {
        // Hide modal
        this.modalContainer.classList.add('hidden');
    }
    
    showToast(message, type = 'info', duration = 3000) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Add to container
        this.toastContainer.appendChild(toast);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                this.toastContainer.removeChild(toast);
            }, 300);
        }, duration);
    }
    
    showConfirmDialog(title, message, onConfirm, onCancel = null) {
        // Create dialog content
        const content = document.createElement('div');
        content.className = 'confirm-dialog';
        
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'dialog-buttons';
        
        const confirmButton = document.createElement('button');
        confirmButton.className = 'dialog-button confirm';
        confirmButton.textContent = 'OK';
        confirmButton.addEventListener('click', () => {
            this.closeModal();
            if (onConfirm) onConfirm();
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'dialog-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.closeModal();
            if (onCancel) onCancel();
        });
        
        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(cancelButton);
        
        content.appendChild(messageElement);
        content.appendChild(buttonContainer);
        
        // Show the dialog
        this.showModal(title, content);
    }
    
    showInputDialog(title, label, defaultValue, onConfirm, onCancel = null) {
        // Create dialog content
        const content = document.createElement('div');
        content.className = 'input-dialog';
        
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = defaultValue || '';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'dialog-buttons';
        
        const confirmButton = document.createElement('button');
        confirmButton.className = 'dialog-button confirm';
        confirmButton.textContent = 'OK';
        confirmButton.addEventListener('click', () => {
            this.closeModal();
            if (onConfirm) onConfirm(input.value);
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'dialog-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.closeModal();
            if (onCancel) onCancel();
        });
        
        // Handle Enter key
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                confirmButton.click();
            }
        });
        
        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(cancelButton);
        
        content.appendChild(labelElement);
        content.appendChild(input);
        content.appendChild(buttonContainer);
        
        // Show the dialog
        this.showModal(title, content);
        
        // Focus the input
        setTimeout(() => input.focus(), 100);
    }
    
    showMetadataEditor() {
        // Create form content
        const content = document.createElement('div');
        content.className = 'metadata-editor';
        
        const form = document.createElement('form');
        
        // Title field
        const titleGroup = document.createElement('div');
        titleGroup.className = 'form-group';
        
        const titleLabel = document.createElement('label');
        titleLabel.textContent = 'Title:';
        
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = 'metadata-title';
        
        titleGroup.appendChild(titleLabel);
        titleGroup.appendChild(titleInput);
        
        // Author field
        const authorGroup = document.createElement('div');
        authorGroup.className = 'form-group';
        
        const authorLabel = document.createElement('label');
        authorLabel.textContent = 'Author:';
        
        const authorInput = document.createElement('input');
        authorInput.type = 'text';
        authorInput.id = 'metadata-author';
        
        authorGroup.appendChild(authorLabel);
        authorGroup.appendChild(authorInput);
        
        // Hidden message field
        const messageGroup = document.createElement('div');
        messageGroup.className = 'form-group';
        
        const messageLabel = document.createElement('label');
        messageLabel.textContent = 'Hidden Message:';
        
        const messageInput = document.createElement('textarea');
        messageInput.id = 'metadata-message';
        messageInput.rows = 5;
        
        messageGroup.appendChild(messageLabel);
        messageGroup.appendChild(messageInput);
        
        // Encoding options
        const encodingGroup = document.createElement('div');
        encodingGroup.className = 'form-group';
        
        const encodingLabel = document.createElement('label');
        encodingLabel.textContent = 'Encoding:';
        
        const encodingSelect = document.createElement('select');
        encodingSelect.id = 'metadata-encoding';
        
        // Add encoding options
        const encodings = [
            { value: 'plain', text: 'Plain Text' },
            { value: 'binary', text: 'Binary' },
            { value: 'reversed', text: 'Reversed' },
            { value: 'rot13', text: 'ROT13' },
            { value: 'ascii', text: 'ASCII Art' }
        ];
        
        encodings.forEach(encoding => {
            const option = document.createElement('option');
            option.value = encoding.value;
            option.textContent = encoding.text;
            encodingSelect.appendChild(option);
        });
        
        encodingGroup.appendChild(encodingLabel);
        encodingGroup.appendChild(encodingSelect);
        
        // Buttons
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'form-buttons';
        
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'save-button';
        saveButton.textContent = 'Save Metadata';
        saveButton.addEventListener('click', () => {
            const metadata = {
                title: titleInput.value,
                author: authorInput.value,
                message: messageInput.value,
                encoding: encodingSelect.value
            };
            
            this.closeModal();
            this.triggerEvent('save-metadata', metadata);
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.closeModal();
        });
        
        buttonGroup.appendChild(saveButton);
        buttonGroup.appendChild(cancelButton);
        
        // Assemble form
        form.appendChild(titleGroup);
        form.appendChild(authorGroup);
        form.appendChild(messageGroup);
        form.appendChild(encodingGroup);
        form.appendChild(buttonGroup);
        
        content.appendChild(form);
        
        // Show in modal
        this.showModal('Edit Metadata Ritual', content);
        
        // Fill with existing metadata if available
        this.triggerEvent('get-metadata', (metadata) => {
            if (metadata) {
                titleInput.value = metadata.title || '';
                authorInput.value = metadata.author || '';
                messageInput.value = metadata.message || '';
                encodingSelect.value = metadata.encoding || 'plain';
            }
        });
    }
    
    showSigilEditor() {
        // Create sigil editor content
        const content = document.createElement('div');
        content.className = 'sigil-editor';
        
        // Placeholder for sigil canvas
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'sigil-canvas-container';
        
        const sigilCanvas = document.createElement('canvas');
        sigilCanvas.width = 64;
        sigilCanvas.height = 64;
        sigilCanvas.className = 'sigil-canvas';
        
        canvasContainer.appendChild(sigilCanvas);
        
        // Controls
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'sigil-controls';
        
        // Pattern select
        const patternGroup = document.createElement('div');
        patternGroup.className = 'form-group';
        
        const patternLabel = document.createElement('label');
        patternLabel.textContent = 'Sigil Pattern:';
        
        const patternSelect = document.createElement('select');
        patternSelect.id = 'sigil-pattern';
        
        // Add pattern options
        const patterns = [
            { value: 'circle', text: 'Circle' },
            { value: 'pentagram', text: 'Pentagram' },
            { value: 'hexagram', text: 'Hexagram' },
            { value: 'grid', text: 'Grid' },
            { value: 'text', text: 'Text Sigil' }
        ];
        
        patterns.forEach(pattern => {
            const option = document.createElement('option');
            option.value = pattern.value;
            option.textContent = pattern.text;
            patternSelect.appendChild(option);
        });
        
        patternGroup.appendChild(patternLabel);
        patternGroup.appendChild(patternSelect);
        
        // Text input (for text sigils)
        const textGroup = document.createElement('div');
        textGroup.className = 'form-group';
        
        const textLabel = document.createElement('label');
        textLabel.textContent = 'Sigil Text:';
        
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = 'sigil-text';
        textInput.placeholder = 'Enter text for sigil...';
        
        textGroup.appendChild(textLabel);
        textGroup.appendChild(textInput);
        
        // Visibility options
        const visibilityGroup = document.createElement('div');
        visibilityGroup.className = 'form-group';
        
        const visibilityLabel = document.createElement('label');
        visibilityLabel.textContent = 'Visibility:';
        
        const visibilitySelect = document.createElement('select');
        visibilitySelect.id = 'sigil-visibility';
        
        // Add visibility options
        const visibilityOptions = [
            { value: 'hidden', text: 'Hidden (Reveal on Hover)' },
            { value: 'faint', text: 'Faint (Barely Visible)' },
            { value: 'visible', text: 'Visible' }
        ];
        
        visibilityOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            visibilitySelect.appendChild(optionElement);
        });
        
        visibilityGroup.appendChild(visibilityLabel);
        visibilityGroup.appendChild(visibilitySelect);
        
        // Buttons
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'form-buttons';
        
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'save-button';
        addButton.textContent = 'Add Sigil';
        addButton.addEventListener('click', () => {
            const sigilData = {
                pattern: patternSelect.value,
                text: textInput.value,
                visibility: visibilitySelect.value,
                canvasData: sigilCanvas.toDataURL()
            };
            
            this.closeModal();
            this.triggerEvent('add-sigil', sigilData);
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.closeModal();
        });
        
        buttonGroup.appendChild(addButton);
        buttonGroup.appendChild(cancelButton);
        
        // Assemble controls
        controlsContainer.appendChild(patternGroup);
        controlsContainer.appendChild(textGroup);
        controlsContainer.appendChild(visibilityGroup);
        controlsContainer.appendChild(buttonGroup);
        
        // Add to content
        content.appendChild(canvasContainer);
        content.appendChild(controlsContainer);
        
        // Show in modal
        this.showModal('Add Hidden Sigil', content);
        
        // Initialize sigil preview
        const ctx = sigilCanvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, sigilCanvas.width, sigilCanvas.height);
        
        // Drawing the initial sigil
        this.drawSigilPreview(ctx, patternSelect.value, textInput.value);
        
        // Update preview when options change
        patternSelect.addEventListener('change', () => {
            this.drawSigilPreview(ctx, patternSelect.value, textInput.value);
        });
        
        textInput.addEventListener('input', () => {
            this.drawSigilPreview(ctx, patternSelect.value, textInput.value);
        });
    }
    
    drawSigilPreview(ctx, pattern, text) {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw sigil based on pattern
        ctx.strokeStyle = '#E1BEE7';
        ctx.lineWidth = 1;
        
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        switch (pattern) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(centerX, centerY, width / 3, 0, Math.PI * 2);
                ctx.stroke();
                
                // Inner circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, width / 5, 0, Math.PI * 2);
                ctx.stroke();
                
                // Runes around the circle
                ctx.font = '6px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#9C27B0';
                
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = centerX + Math.cos(angle) * (width / 4);
                    const y = centerY + Math.sin(angle) * (width / 4);
                    
                    ctx.fillText(String.fromCharCode(i + 0x16A0), x, y);
                }
                break;
                
            case 'pentagram':
                ctx.beginPath();
                
                // Draw pentagon first
                const radius = width / 3;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.stroke();
                
                // Draw pentagram
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const angle2 = ((i + 2) % 5 / 5) * Math.PI * 2 - Math.PI / 2;
                    
                    const x1 = centerX + Math.cos(angle1) * radius;
                    const y1 = centerY + Math.sin(angle1) * radius;
                    const x2 = centerX + Math.cos(angle2) * radius;
                    const y2 = centerY + Math.sin(angle2) * radius;
                    
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
                ctx.stroke();
                break;
                
            case 'hexagram':
                // Draw hexagram (Star of David)
                const hexRadius = width / 3;
                
                // First triangle
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2;
                    const x = centerX + Math.cos(angle) * hexRadius;
                    const y = centerY + Math.sin(angle) * hexRadius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.stroke();
                
                // Second triangle
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2 + Math.PI / 3;
                    const x = centerX + Math.cos(angle) * hexRadius;
                    const y = centerY + Math.sin(angle) * hexRadius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.stroke();
                break;
                
            case 'grid':
                // Draw occult grid pattern
                const gridSize = 5;
                const cellSize = width / gridSize;
                
                // Vertical lines
                for (let x = 0; x <= gridSize; x++) {
                    ctx.beginPath();
                    ctx.moveTo(x * cellSize, 0);
                    ctx.lineTo(x * cellSize, height);
                    ctx.stroke();
                }
                
                // Horizontal lines
                for (let y = 0; y <= gridSize; y++) {
                    ctx.beginPath();
                    ctx.moveTo(0, y * cellSize);
                    ctx.lineTo(width, y * cellSize);
                    ctx.stroke();
                }
                
                // Diagonal lines
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(width, height);
                ctx.moveTo(width, 0);
                ctx.lineTo(0, height);
                ctx.stroke();
                
                // Circle in center
                ctx.beginPath();
                ctx.arc(centerX, centerY, cellSize, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'text':
                // Draw text-based sigil
                text = text || 'VOIDSKETCH';
                
                // Create a spiral of text
                ctx.font = '8px monospace';
                ctx.fillStyle = '#9C27B0';
                
                const letters = text.split('');
                const spiralRadius = width / 5;
                const letterCount = letters.length;
                
                for (let i = 0; i < letterCount; i++) {
                    const angle = (i / letterCount) * Math.PI * 6;
                    const distance = (i / letterCount) * spiralRadius;
                    
                    const x = centerX + Math.cos(angle) * distance;
                    const y = centerY + Math.sin(angle) * distance;
                    
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(angle + Math.PI / 2);
                    ctx.fillText(letters[i], 0, 0);
                    ctx.restore();
                }
                
                // Draw connecting lines
                ctx.beginPath();
                for (let i = 0; i < letterCount; i++) {
                    const angle1 = (i / letterCount) * Math.PI * 6;
                    const distance1 = (i / letterCount) * spiralRadius;
                    
                    const angle2 = ((i + 1) % letterCount / letterCount) * Math.PI * 6;
                    const distance2 = ((i + 1) % letterCount / letterCount) * spiralRadius;
                    
                    const x1 = centerX + Math.cos(angle1) * distance1;
                    const y1 = centerY + Math.sin(angle1) * distance1;
                    const x2 = centerX + Math.cos(angle2) * distance2;
                    const y2 = centerY + Math.sin(angle2) * distance2;
                    
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
                ctx.stroke();
                break;
        }
    }
    
    showGlitchOptions() {
        // Create glitch options content
        const content = document.createElement('div');
        content.className = 'glitch-options';
        
        // Create options form
        const form = document.createElement('form');
        
        // Glitch type
        const typeGroup = document.createElement('div');
        typeGroup.className = 'form-group';
        
        const typeLabel = document.createElement('label');
        typeLabel.textContent = 'Glitch Type:';
        
        const typeSelect = document.createElement('select');
        typeSelect.id = 'glitch-type';
        
        // Add glitch type options
        const glitchTypes = [
            { value: 'random', text: 'Random Glitch' },
            { value: 'shift', text: 'Row Shift' },
            { value: 'channel', text: 'Channel Shift' },
            { value: 'sort', text: 'Pixel Sort' },
            { value: 'noise', text: 'Add Noise' },
            { value: 'corrupt', text: 'Data Corruption' }
        ];
        
        glitchTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.text;
            typeSelect.appendChild(option);
        });
        
        typeGroup.appendChild(typeLabel);
        typeGroup.appendChild(typeSelect);
        
        // Intensity slider
        const intensityGroup = document.createElement('div');
        intensityGroup.className = 'form-group';
        
        const intensityLabel = document.createElement('label');
        intensityLabel.textContent = 'Intensity:';
        
        const intensityContainer = document.createElement('div');
        intensityContainer.className = 'slider-container';
        
        const intensitySlider = document.createElement('input');
        intensitySlider.type = 'range';
        intensitySlider.id = 'glitch-intensity';
        intensitySlider.min = '0';
        intensitySlider.max = '100';
        intensitySlider.value = '50';
        
        const intensityValue = document.createElement('span');
        intensityValue.id = 'intensity-value';
        intensityValue.textContent = '50%';
        
        intensitySlider.addEventListener('input', () => {
            intensityValue.textContent = `${intensitySlider.value}%`;
        });
        
        intensityContainer.appendChild(intensitySlider);
        intensityContainer.appendChild(intensityValue);
        
        intensityGroup.appendChild(intensityLabel);
        intensityGroup.appendChild(intensityContainer);
        
        // Buttons
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'form-buttons';
        
        const applyButton = document.createElement('button');
        applyButton.type = 'button';
        applyButton.className = 'save-button';
        applyButton.textContent = 'Apply Glitch';
        applyButton.addEventListener('click', () => {
            const options = {
                type: typeSelect.value,
                intensity: parseInt(intensitySlider.value) / 100
            };
            
            this.closeModal();
            this.triggerEvent('apply-glitch', options);
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.closeModal();
        });
        
        buttonGroup.appendChild(applyButton);
        buttonGroup.appendChild(cancelButton);
        
        // Assemble form
        form.appendChild(typeGroup);
        form.appendChild(intensityGroup);
        form.appendChild(buttonGroup);
        
        content.appendChild(form);
        
        // Show in modal
        this.showModal('Inject Glitch', content);
    }
    
    triggerEvent(event, data = null) {
        // Create and dispatch a custom event
        const customEvent = new CustomEvent(`ui-${event}`, {
            detail: data
        });
        
        document.dispatchEvent(customEvent);
    }
}

/**
 * ThemeManager.js
 * Manages theme switching for VOIDSKETCH
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'lain-dive';
        this.themeStylesheet = document.getElementById('theme-stylesheet');
        
        // Available themes
        this.themes = {
            'lain-dive': {
                name: 'Lain Dive',
                path: 'styles/themes/lain-dive.css'
            },
            'morrowind-glyph': {
                name: 'Morrowind Glyph',
                path: 'styles/themes/morrowind-glyph.css'
            },
            'monolith': {
                name: 'Monolith',
                path: 'styles/themes/monolith.css'
            }
        };
        
        // Initialize
        this.initialize();
    }
    
    initialize() {
        // Listen for theme change events
        document.addEventListener('ui-change-theme', (event) => {
            const theme = event.detail;
            this.setTheme(theme);
        });
    }
    
    setTheme(themeId) {
        // Check if theme exists
        if (!this.themes[themeId]) return;
        
        // Update current theme
        this.currentTheme = themeId;
        
        // Update stylesheet
        this.themeStylesheet.href = this.themes[themeId].path;
        
        // Update body class
        document.body.className = '';
        document.body.classList.add(`theme-${themeId}`);
        
        // Dispatch event
        const event = new CustomEvent('theme-changed', {
            detail: {
                themeId,
                theme: this.themes[themeId]
            }
        });
        document.dispatchEvent(event);
    }
    
    getCurrentTheme() {
        return {
            id: this.currentTheme,
            ...this.themes[this.currentTheme]
        };
    }
}

/**
 * MenuSystem.js
 * Manages menu system and keyboard shortcuts
 */

class MenuSystem {
    constructor(uiManager) {
        this.uiManager = uiManager;
        
        // Keyboard shortcuts
        this.shortcuts = {
            // File menu
            'Ctrl+N': 'new-project',
            'Ctrl+O': 'open-project',
            'Ctrl+S': 'save-project',
            'Ctrl+Shift+S': 'save-project-as',
            
            // Edit menu
            'Ctrl+Z': 'undo',
            'Ctrl+Y': 'redo',
            'Ctrl+Shift+Z': 'redo',
            'Ctrl+X': 'cut',
            'Ctrl+C': 'copy',
            'Ctrl+V': 'paste',
            'Ctrl+A': 'select-all',
            'Escape': 'deselect',
            
            // View
            'Ctrl+G': 'toggle-grid',
            'Ctrl+R': 'toggle-rulers',
            
            // Tools
            'B': 'tool-pencil',
            'E': 'tool-eraser',
            'F': 'tool-fill',
            'L': 'tool-line',
            'R': 'tool-rect',
            'O': 'tool-ellipse',
            'G': 'tool-glitch',
            'S': 'tool-static'
        };
        
        // Initialize
        this.initialize();
    }
    
    initialize() {
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Skip if in input fields
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Build key string
            let keyString = '';
            if (event.ctrlKey || event.metaKey) keyString += 'Ctrl+';
            if (event.shiftKey) keyString += 'Shift+';
            if (event.altKey) keyString += 'Alt+';
            
            // Add the key itself
            if (event.key === ' ') {
                keyString += 'Space';
            } else if (event.key === 'Escape') {
                keyString = 'Escape'; // Special case
            } else {
                keyString += event.key.toUpperCase();
            }
            
            // Check if we have a shortcut for this key combination
            const action = this.shortcuts[keyString];
            if (action) {
                event.preventDefault();
                this.triggerAction(action);
            }
        });
    }
    
    triggerAction(action) {
        // Tool shortcuts
        if (action.startsWith('tool-')) {
            const tool = action.replace('tool-', '');
            document.dispatchEvent(new CustomEvent('ui-set-tool', {
                detail: tool
            }));
            return;
        }
        
        // Other actions
        this.uiManager.triggerEvent(action);
    }
    
    // Register a custom shortcut
    registerShortcut(keyString, action) {
        this.shortcuts[keyString] = action;
    }
}
