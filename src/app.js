/**
 * Schema Snap - Main Application
 * Local Business JSON-LD Generator
 */

import { BusinessForm } from './components/BusinessForm.js';
import { PreviewPane } from './components/PreviewPane.js';
import { ExportControls } from './components/ExportControls.js';
import { JsonLdGenerator } from './utils/jsonld-generator.js';
import { geocoder } from './utils/geocoder.js';

class SchemaSnapApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    init() {
        try {
            this.initializeComponents();
            this.setupGlobalEventListeners();
            this.setupKeyboardShortcuts();
            this.loadInitialData();
            
            this.isInitialized = true;
            console.log('Schema Snap initialized successfully');
            
            // Test geocoding service
            this.testServices();
            
        } catch (error) {
            console.error('Failed to initialize Schema Snap:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialize all components
     */
    initializeComponents() {
        const formContainer = document.getElementById('business-form');
        const previewContainer = document.getElementById('preview-pane');
        const exportContainer = document.getElementById('export-controls');

        if (!formContainer || !previewContainer || !exportContainer) {
            throw new Error('Required DOM elements not found');
        }

        // Initialize components
        this.components.form = new BusinessForm(formContainer);
        this.components.preview = new PreviewPane(previewContainer);
        this.components.export = new ExportControls(exportContainer, this.components.preview);

        // Setup component interactions
        this.components.form.onChange((formData) => {
            this.handleFormChange(formData);
        });

        console.log('Components initialized');
    }

    /**
     * Handle form data changes
     */
    handleFormChange(formData) {
        try {
            // Update preview
            this.components.preview.updatePreview(formData);
            
            // Update export controls
            this.components.export.updateControls();
            
            // Auto-geocode if address is complete
            this.handleAutoGeocode(formData);
            
        } catch (error) {
            console.error('Error handling form change:', error);
        }
    }

    /**
     * Handle automatic geocoding when address changes
     */
    async handleAutoGeocode(formData) {
        // Only auto-geocode if coordinates are not manually set
        if (formData.latitude || formData.longitude) {
            return;
        }

        // Check if we have enough address info
        if (!formData.streetAddress || !formData.city) {
            return;
        }

        try {
            const address = geocoder.constructor.buildAddressString(formData);
            
            // Debounce geocoding requests
            clearTimeout(this.geocodeTimeout);
            this.geocodeTimeout = setTimeout(async () => {
                try {
                    const result = await geocoder.geocode(address);
                    if (result) {
                        this.suggestCoordinates(result.latitude, result.longitude, result.formatted_address);
                    }
                } catch (error) {
                    console.log('Auto-geocoding failed:', error.message);
                }
            }, 2000); // Wait 2 seconds after user stops typing
            
        } catch (error) {
            console.log('Auto-geocoding error:', error.message);
        }
    }

    /**
     * Suggest coordinates to user
     */
    suggestCoordinates(latitude, longitude, address) {
        // Create a subtle notification
        const notification = document.createElement('div');
        notification.className = 'coordinate-suggestion';
        notification.innerHTML = `
            <div class="suggestion-content">
                <span>📍 Found coordinates for your address</span>
                <button type="button" class="btn btn-small btn-primary" onclick="app.acceptCoordinates(${latitude}, ${longitude})">
                    Use Coordinates
                </button>
                <button type="button" class="btn btn-small btn-outline" onclick="this.parentNode.parentNode.remove()">
                    Dismiss
                </button>
            </div>
        `;

        // Insert after the coordinates input
        const geoControls = document.querySelector('.geo-controls');
        if (geoControls) {
            geoControls.appendChild(notification);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 10000);
        }
    }

    /**
     * Accept suggested coordinates
     */
    acceptCoordinates(latitude, longitude) {
        const latField = document.getElementById('latitude');
        const lngField = document.getElementById('longitude');
        const display = document.getElementById('coordinatesDisplay');
        
        if (latField && lngField) {
            latField.value = latitude.toFixed(6);
            lngField.value = longitude.toFixed(6);
            
            if (display) {
                display.textContent = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                display.style.display = 'block';
            }
            
            // Trigger form update
            const formData = this.components.form.getFormData();
            this.handleFormChange(formData);
        }
        
        // Remove suggestion
        document.querySelector('.coordinate-suggestion')?.remove();
    }

    /**
     * Handle quick export button click
     */
    handleQuickExport() {
        try {
            const formData = this.components.form?.getFormData();
            if (!formData || Object.keys(formData).length === 0) {
                this.showErrorMessage('Please fill out the business form first before exporting.');
                return;
            }

            // Check if we have at least the minimum required data
            if (!formData.businessName) {
                this.showErrorMessage('Please enter a business name before exporting.');
                return;
            }

            // Generate and copy JSON-LD
            const jsonLd = JsonLdGenerator.generate(formData);
            const jsonString = JsonLdGenerator.format(jsonLd);
            
            navigator.clipboard.writeText(jsonString).then(() => {
                this.showSuccessMessage('JSON-LD copied to clipboard! ✅ Ready to paste into your website.');
            }).catch(() => {
                this.showErrorMessage('Failed to copy to clipboard. Please try using the export controls below.');
            });

        } catch (error) {
            console.error('Quick export error:', error);
            this.showErrorMessage('Failed to generate JSON-LD. Please check your form data.');
        }
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Handle window resize for responsive layout
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.handlePageVisible();
            }
        });

        // Handle beforeunload to warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            const formData = this.components.form?.getFormData();
            if (formData && Object.keys(formData).length > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved form data. Are you sure you want to leave?';
            }
        });

        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showErrorMessage('An unexpected error occurred. Please try again.');
        });

        // Quick export button handler
        const quickExportBtn = document.getElementById('quickExportBtn');
        if (quickExportBtn) {
            quickExportBtn.addEventListener('click', () => {
                this.handleQuickExport();
            });
        }

        // Service worker registration (if available)
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S: Save/Export
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.components.export.copyJson();
            }
            
            // Ctrl/Cmd + E: Export HTML
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.components.export.copyHtml();
            }
            
            // Escape: Clear validation messages
            if (e.key === 'Escape') {
                this.clearMessages();
            }
        });
    }

    /**
     * Load initial data and example
     */
    loadInitialData() {
        // Check if there's saved data in localStorage
        const savedData = localStorage.getItem('schemasnap-form-data');
        
        if (!savedData) {
            // Show example data hint
            this.showWelcomeMessage();
        }
    }

    /**
     * Show welcome message with example option
     */
    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'welcome-message message';
        welcome.innerHTML = `
            <div class="welcome-content">
                <h3>Welcome to Schema Snap!</h3>
                <p>Generate valid Schema.org JSON-LD for your local business.</p>
                <button type="button" class="btn btn-primary" onclick="app.loadExample()">
                    Load Example Data
                </button>
                <button type="button" class="btn btn-outline" onclick="this.parentNode.parentNode.remove()">
                    Start Fresh
                </button>
            </div>
        `;

        const main = document.querySelector('.main');
        if (main) {
            main.insertBefore(welcome, main.firstChild);
        }
    }

    /**
     * Load example business data
     */
    loadExample() {
        const exampleData = JsonLdGenerator.generateExample();
        
        // Clear any existing data first
        this.components.form.clearForm();
        
        // Populate form with example data
        Object.keys(exampleData).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = exampleData[key];
                } else {
                    field.value = exampleData[key];
                }
            }
        });

        // Handle opening hours
        if (exampleData.openingHours) {
            Object.keys(exampleData.openingHours).forEach(day => {
                const checkbox = document.querySelector(`[data-day="${day}"]`);
                const openInput = document.querySelector(`[data-day="${day}"][data-type="open"]`);
                const closeInput = document.querySelector(`[data-day="${day}"][data-type="close"]`);
                
                if (checkbox && openInput && closeInput) {
                    checkbox.checked = true;
                    openInput.disabled = false;
                    closeInput.disabled = false;
                    openInput.value = exampleData.openingHours[day].open;
                    closeInput.value = exampleData.openingHours[day].close;
                    
                    const closedLabel = checkbox.closest('.hours-group').querySelector('.hours-closed');
                    closedLabel.style.display = 'none';
                }
            });
        }

        // Update components
        this.handleFormChange(exampleData);
        
        // Remove welcome message
        document.querySelector('.welcome-message')?.remove();
        
        this.showMessage('Example data loaded! Edit the fields to customize for your business.', 'success');
    }

    /**
     * Test external services
     */
    async testServices() {
        try {
            // Test geocoding service
            const testResult = await geocoder.test();
            if (testResult) {
                console.log('Geocoding service is working');
            }
        } catch (error) {
            console.warn('Service test failed:', error);
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update layout if needed
        console.log('Window resized');
    }

    /**
     * Handle page becoming visible
     */
    handlePageVisible() {
        // Refresh data if needed
        console.log('Page visible');
    }

    /**
     * Register service worker for offline support
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show general message
     */
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;

        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(messageEl, container.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                messageEl.remove();
            }, 5000);
        }
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        document.querySelectorAll('.message').forEach(msg => msg.remove());
    }

    /**
     * Debounce utility function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            components: Object.keys(this.components),
            hasData: Boolean(this.components.form?.getFormData()),
            cacheStats: geocoder.getCacheStats()
        };
    }

    /**
     * Reset application
     */
    reset() {
        if (confirm('This will clear all data and reset the application. Continue?')) {
            localStorage.clear();
            geocoder.clearCache();
            this.components.form?.clearForm();
            this.components.preview?.clear();
            this.clearMessages();
            this.showMessage('Application reset successfully', 'success');
        }
    }
}

// Add CSS for dynamic elements
const style = document.createElement('style');
style.textContent = `
.coordinate-suggestion {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background-color: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 6px;
    font-size: 0.875rem;
}

.suggestion-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.welcome-message {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    margin-bottom: 2rem;
}

.welcome-content {
    text-align: center;
}

.welcome-content h3 {
    margin-bottom: 0.5rem;
    color: white;
}

.welcome-content p {
    margin-bottom: 1rem;
    opacity: 0.9;
}

.welcome-content .btn {
    margin: 0 0.5rem;
}

.btn-disabled {
    opacity: 0.6;
    pointer-events: none;
}

@media (max-width: 768px) {
    .suggestion-content {
        flex-direction: column;
        align-items: stretch;
    }
    
    .suggestion-content .btn {
        margin: 0.25rem 0;
    }
}
`;
document.head.appendChild(style);

// Initialize the application
const app = new SchemaSnapApp();

// Make app globally available for callbacks
window.app = app;

// Export for module use
export default SchemaSnapApp;