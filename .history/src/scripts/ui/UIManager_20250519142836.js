/**
 * UIManager Class
 *
 * Handles UI interactions and updates.
 */
class UIManager {
  /**
   * Create a new UIManager
   */
  constructor() {
    this.modalContainer = document.getElementById('modal-container');
    this.modalContent = document.getElementById('modal-content');
    this.toastContainer = document.getElementById('toast-container');

    // Set up event listeners
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  /**
   * Handle document click events
   * @param {MouseEvent} e - Click event
   */
  handleDocumentClick(e) {
    // Close modal if clicking outside the content
    if (e.target === this.modalContainer) {
      this.hideModal();
    }
  }

  /**
   * Set the active tool in the UI
   * @param {string} toolId - ID of the tool element
   */
  setActiveTool(toolId) {
    // Remove active class from all tool buttons
    document.querySelectorAll('.tool-button').forEach(button => {
      if (button.id.startsWith('brush-')) {
        button.classList.remove('active');
      }
    });

    // Add active class to the selected tool
    const toolButton = document.getElementById(toolId);
    if (toolButton) {
      toolButton.classList.add('active');
    }
  }

  /**
   * Set the active symmetry mode in the UI
   * @param {string} symmetryId - ID of the symmetry element
   */
  setActiveSymmetry(symmetryId) {
    // Remove active class from all symmetry buttons
    document.querySelectorAll('.tool-button').forEach(button => {
      if (button.id.startsWith('symmetry-')) {
        button.classList.remove('active');
      }
    });

    // Add active class to the selected symmetry
    const symmetryButton = document.getElementById(symmetryId);
    if (symmetryButton) {
      symmetryButton.classList.add('active');
    }
  }

  /**
   * Set the active palette in the UI
   * @param {string} paletteId - ID of the palette element
   */
  setActivePalette(paletteId) {
    // Remove active class from all palette options
    document.querySelectorAll('.palette-option').forEach(option => {
      option.classList.remove('active');
    });

    // Add active class to the selected palette
    const paletteOption = document.getElementById(paletteId);
    if (paletteOption) {
      paletteOption.classList.add('active');
    }
  }

  /**
   * Show a modal dialog
   * @param {string} title - Title of the modal
   * @param {string} content - HTML content of the modal
   * @param {Function} onClose - Callback function when the modal is closed
   * @param {boolean} showCloseButton - Whether to show the close button (default: true)
   */
  showModal(title, content, onClose = null, showCloseButton = true) {
    // Create modal HTML
    const modalHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          ${showCloseButton ? '<button class="modal-close" id="modal-close-button">×</button>' : ''}
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    // Set modal content
    this.modalContent.innerHTML = modalHTML;

    // Show modal
    this.modalContainer.classList.remove('hidden');

    // Add close button event listener if it exists
    const closeButton = document.getElementById('modal-close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hideModal();
        if (onClose) onClose();
      });
    }
  }

  /**
   * Hide the modal dialog
   */
  hideModal() {
    this.modalContainer.classList.add('hidden');
  }

  /**
   * Show a confirmation dialog
   * @param {string} title - Title of the dialog
   * @param {string} message - Message to display
   * @param {Function} onConfirm - Callback function when confirmed
   * @param {Function} onCancel - Callback function when canceled
   */
  showConfirmDialog(title, message, onConfirm, onCancel = null) {
    // Create dialog HTML
    const dialogHTML = `
      <div class="confirm-dialog">
        <p>${message}</p>
        <div class="modal-footer">
          <button class="modal-button" id="cancel-button">Cancel</button>
          <button class="modal-button primary" id="confirm-button">Confirm</button>
        </div>
      </div>
    `;

    // Show the modal
    this.showModal(title, dialogHTML);

    // Add button event listeners
    document.getElementById('confirm-button').addEventListener('click', () => {
      this.hideModal();
      if (onConfirm) onConfirm();
    });

    document.getElementById('cancel-button').addEventListener('click', () => {
      this.hideModal();
      if (onCancel) onCancel();
    });
  }

  /**
   * Show a loading dialog
   * @param {string} message - Message to display
   */
  showLoadingDialog(message) {
    // Create loading dialog HTML
    const loadingHTML = `
      <div class="loading-dialog">
        <p>${message}</p>
        <div class="loading-spinner"></div>
      </div>
    `;

    // Show the modal
    this.showModal('Loading', loadingHTML);

    // Remove the close button
    const closeButton = document.getElementById('modal-close-button');
    if (closeButton) {
      closeButton.style.display = 'none';
    }
  }

  /**
   * Hide the loading dialog
   */
  hideLoadingDialog() {
    this.hideModal();
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast ('success', 'error', 'info')
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, type = 'info', duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Add to container
    this.toastContainer.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        this.toastContainer.removeChild(toast);
      }, 300);
    }, duration);
  }

  /**
   * Show a prompt dialog
   * @param {string} title - Title of the dialog
   * @param {string} message - Message to display
   * @param {string} defaultValue - Default value for the input
   * @param {Function} onConfirm - Callback function when confirmed
   * @param {Function} onCancel - Callback function when canceled
   */
  showPromptDialog(title, message, defaultValue = '', onConfirm, onCancel = null) {
    // Create dialog HTML
    const dialogHTML = `
      <div class="prompt-dialog">
        <p>${message}</p>
        <div class="form-group">
          <input type="text" id="prompt-input" class="form-input" value="${defaultValue}">
        </div>
        <div class="modal-footer">
          <button class="modal-button" id="cancel-button">Cancel</button>
          <button class="modal-button primary" id="confirm-button">Confirm</button>
        </div>
      </div>
    `;

    // Show the modal
    this.showModal(title, dialogHTML);

    // Focus the input
    setTimeout(() => {
      document.getElementById('prompt-input').focus();
    }, 0);

    // Add button event listeners
    document.getElementById('confirm-button').addEventListener('click', () => {
      const value = document.getElementById('prompt-input').value;
      this.hideModal();
      if (onConfirm) onConfirm(value);
    });

    document.getElementById('cancel-button').addEventListener('click', () => {
      this.hideModal();
      if (onCancel) onCancel();
    });

    // Add enter key event listener
    document.getElementById('prompt-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = document.getElementById('prompt-input').value;
        this.hideModal();
        if (onConfirm) onConfirm(value);
      }
    });
  }

  /**
   * Show a form dialog
   * @param {string} title - Title of the dialog
   * @param {Array} fields - Array of field objects
   * @param {Function} onSubmit - Callback function when submitted
   * @param {Function} onCancel - Callback function when canceled
   */
  showFormDialog(title, fields, onSubmit, onCancel = null) {
    // Create fields HTML
    let fieldsHTML = '';

    fields.forEach(field => {
      let inputHTML = '';

      switch (field.type) {
        case 'text':
        case 'number':
        case 'email':
        case 'password':
          inputHTML = `<input type="${field.type}" id="${field.id}" class="form-input" value="${field.value || ''}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>`;
          break;
        case 'checkbox':
          inputHTML = `<input type="checkbox" id="${field.id}" ${field.checked ? 'checked' : ''}>`;
          break;
        case 'select':
          inputHTML = `
            <select id="${field.id}" class="form-input">
              ${field.options.map(option => `<option value="${option.value}" ${option.value === field.value ? 'selected' : ''}>${option.label}</option>`).join('')}
            </select>
          `;
          break;
        case 'textarea':
          inputHTML = `<textarea id="${field.id}" class="form-input" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>${field.value || ''}</textarea>`;
          break;
      }

      fieldsHTML += `
        <div class="form-group">
          <label class="form-label" for="${field.id}">${field.label}</label>
          ${inputHTML}
        </div>
      `;
    });

    // Create dialog HTML
    const dialogHTML = `
      <div class="form-dialog">
        <form id="modal-form">
          ${fieldsHTML}
          <div class="modal-footer">
            <button type="button" class="modal-button" id="cancel-button">Cancel</button>
            <button type="submit" class="modal-button primary" id="submit-button">Submit</button>
          </div>
        </form>
      </div>
    `;

    // Show the modal
    this.showModal(title, dialogHTML);

    // Add form submit event listener
    document.getElementById('modal-form').addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect form values
      const formData = {};

      fields.forEach(field => {
        const element = document.getElementById(field.id);

        switch (field.type) {
          case 'checkbox':
            formData[field.id] = element.checked;
            break;
          default:
            formData[field.id] = element.value;
            break;
        }
      });

      this.hideModal();
      if (onSubmit) onSubmit(formData);
    });

    // Add cancel button event listener
    document.getElementById('cancel-button').addEventListener('click', () => {
      this.hideModal();
      if (onCancel) onCancel();
    });
  }

  /**
   * Update the status message
   * @param {string} message - Message to display
   */
  updateStatus(message) {
    document.getElementById('status-message').textContent = message;
  }
}
