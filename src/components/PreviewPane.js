import { JsonLdGenerator } from '../utils/jsonld-generator.js';

export class PreviewPane {
    constructor(container) {
        this.container = container;
        this.currentData = {};
        this.render();
    }

    /**
     * Render the preview pane HTML
     */
    render() {
        this.container.innerHTML = `
            <!-- Real-time Preview Card -->
            <div class="card">
                <div class="preview-header">
                    <div class="preview-title">
                        <h3>📝 Live JSON-LD Preview</h3>
                        <div class="preview-info">
                            <span id="validationStatus" class="validation-status"></span>
                            <span id="completenessScore" class="completeness-score"></span>
                        </div>
                    </div>
                    <div class="preview-controls">
                        <button type="button" id="expandBtn" class="btn btn-small btn-outline">
                            🔍 Expand
                        </button>
                        <button type="button" id="validateBtn" class="btn btn-small btn-primary">
                            ✓ Validate
                        </button>
                        <button type="button" id="refreshBtn" class="btn btn-small btn-outline">
                            🔄 Refresh
                        </button>
                    </div>
                </div>
                
                <div class="preview-stats">
                    <div class="stat-item">
                        <span class="stat-label">Characters</span>
                        <span id="charCount" class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Size</span>
                        <span id="fileSize" class="stat-value">0 B</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Lines</span>
                        <span id="lineCount" class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Properties</span>
                        <span id="propertyCount" class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Validity</span>
                        <span id="validityStatus" class="stat-value">-</span>
                    </div>
                </div>
                
                <div class="preview-toolbar">
                    <div class="preview-mode">
                        <label class="radio-label">
                            <input type="radio" name="previewMode" value="formatted" checked>
                            <span class="radio-mark"></span>
                            Formatted
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="previewMode" value="minified">
                            <span class="radio-mark"></span>
                            Minified
                        </label>
                    </div>
                    <div class="preview-actions">
                        <button type="button" id="copyPreviewBtn" class="btn btn-small btn-success">
                            📋 Copy JSON
                        </button>
                    </div>
                </div>
                
                <div id="previewContainer" class="preview-container">
                    <div class="preview-placeholder">
                        <div class="placeholder-icon">🚀</div>
                        <h4>Ready to Generate!</h4>
                        <p>Fill out the business information form to see your JSON-LD structured data appear here in real-time.</p>
                        <div class="placeholder-features">
                            <span class="feature">✓ Live Preview</span>
                            <span class="feature">✓ Syntax Highlighting</span>
                            <span class="feature">✓ Validation</span>
                            <span class="feature">✓ Export Ready</span>
                        </div>
                    </div>
                    <pre id="jsonPreview" class="json-preview" style="display: none;"></pre>
                </div>
                
                <div id="validationResults" class="validation-results" style="display: none;">
                    <div id="validationErrors" class="validation-errors"></div>
                    <div id="validationWarnings" class="validation-warnings"></div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.updatePreview({});
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const expandBtn = this.container.querySelector('#expandBtn');
        const validateBtn = this.container.querySelector('#validateBtn');
        const refreshBtn = this.container.querySelector('#refreshBtn');
        const copyPreviewBtn = this.container.querySelector('#copyPreviewBtn');
        const previewModeRadios = this.container.querySelectorAll('input[name="previewMode"]');

        expandBtn.addEventListener('click', () => this.toggleExpanded());
        validateBtn.addEventListener('click', () => this.showValidation());
        refreshBtn.addEventListener('click', () => this.updatePreview(this.currentData));
        copyPreviewBtn.addEventListener('click', () => this.copyCurrentPreview());
        
        previewModeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updatePreview(this.currentData));
        });
    }

    /**
     * Update preview with new form data
     */
    updatePreview(formData) {
        this.currentData = formData;
        const jsonLd = JsonLdGenerator.generate(formData);
        
        // Check if we have meaningful data
        const hasData = Object.keys(formData).length > 0 && 
                       (formData.businessName || formData.phone || formData.streetAddress);
        
        const placeholder = this.container.querySelector('.preview-placeholder');
        const jsonPreview = this.container.querySelector('#jsonPreview');
        
        if (!hasData) {
            // Show placeholder
            placeholder.style.display = 'block';
            jsonPreview.style.display = 'none';
            this.updateStats('', {});
            this.updateStatus({});
            this.updateCompletenessScore({});
            return;
        }
        
        // Hide placeholder and show preview
        placeholder.style.display = 'none';
        jsonPreview.style.display = 'block';
        
        // Get preview mode
        const previewMode = this.container.querySelector('input[name="previewMode"]:checked').value;
        const jsonString = previewMode === 'minified' 
            ? JsonLdGenerator.minify(jsonLd)
            : JsonLdGenerator.format(jsonLd);
        
        // Update JSON preview with syntax highlighting
        this.renderHighlightedJson(jsonString);
        
        // Update status indicators
        this.updateStatus(jsonLd);
        
        // Update completeness score
        this.updateCompletenessScore(jsonLd);
        
        // Update character count and stats
        this.updateStats(jsonString, jsonLd);
    }

    /**
     * Render JSON with syntax highlighting
     */
    renderHighlightedJson(jsonString) {
        const previewElement = this.container.querySelector('#jsonPreview');
        
        // Simple syntax highlighting for JSON
        const highlighted = this.highlightJson(jsonString);
        previewElement.innerHTML = highlighted;
    }

    /**
     * Apply syntax highlighting to JSON string
     */
    highlightJson(jsonString) {
        return jsonString
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                let cls = 'json-number';
                
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                
                return `<span class="${cls}">${match}</span>`;
            })
            .replace(/([{}])/g, '<span class="json-brace">$1</span>')
            .replace(/(\[|\])/g, '<span class="json-bracket">$1</span>')
            .replace(/,/g, '<span class="json-comma">,</span>');
    }

    /**
     * Update validation status indicator
     */
    updateStatus(jsonLd) {
        const statusElement = this.container.querySelector('#validationStatus');
        const validityElement = this.container.querySelector('#validityStatus');
        
        if (!jsonLd || Object.keys(jsonLd).length <= 2) {
            statusElement.innerHTML = '<span class="status-indicator status-warning">Waiting for data</span>';
            validityElement.textContent = '-';
            validityElement.className = 'stat-value';
            return;
        }
        
        const validation = JsonLdGenerator.validate(jsonLd);
        
        if (validation.isValid) {
            statusElement.innerHTML = '<span class="status-indicator status-valid">✓ Valid Schema</span>';
            validityElement.textContent = 'Valid';
            validityElement.className = 'stat-value stat-good';
        } else {
            statusElement.innerHTML = `<span class="status-indicator status-invalid">⚠ ${validation.errors.length} Error(s)</span>`;
            validityElement.textContent = 'Invalid';
            validityElement.className = 'stat-value stat-warning';
        }
        
        if (validation.warnings.length > 0) {
            statusElement.innerHTML += `<span class="status-indicator status-warning">${validation.warnings.length} Warning(s)</span>`;
        }
    }

    /**
     * Update completeness score
     */
    updateCompletenessScore(jsonLd) {
        const scoreElement = this.container.querySelector('#completenessScore');
        
        if (!jsonLd || Object.keys(jsonLd).length <= 2) {
            scoreElement.innerHTML = '<span class="completeness-score score-low">Completeness: 0%</span>';
            return;
        }
        
        const score = JsonLdGenerator.getCompletenessScore(jsonLd);
        
        let scoreClass = 'score-low';
        let emoji = '🔴';
        if (score >= 80) {
            scoreClass = 'score-high';
            emoji = '🟢';
        } else if (score >= 60) {
            scoreClass = 'score-medium';
            emoji = '🟡';
        }
        
        scoreElement.innerHTML = `
            <span class="completeness-score ${scoreClass}">
                ${emoji} ${score}% Complete
            </span>
        `;
    }

    /**
     * Update statistics display
     */
    updateStats(formattedJson, jsonLd) {
        const charCountEl = this.container.querySelector('#charCount');
        const fileSizeEl = this.container.querySelector('#fileSize');
        const lineCountEl = this.container.querySelector('#lineCount');
        const propertyCountEl = this.container.querySelector('#propertyCount');

        // Character count
        const charCount = formattedJson.length;
        charCountEl.textContent = charCount.toLocaleString();
        charCountEl.className = `stat-value ${this.getCharCountClass(charCount)}`;

        // File size
        const sizeBytes = new Blob([formattedJson]).size;
        fileSizeEl.textContent = this.formatBytes(sizeBytes);
        fileSizeEl.className = `stat-value ${this.getSizeClass(sizeBytes)}`;

        // Line count
        const lineCount = formattedJson.split('\n').length;
        lineCountEl.textContent = lineCount.toString();

        // Property count
        const propertyCount = this.countProperties(jsonLd);
        propertyCountEl.textContent = propertyCount.toString();
        propertyCountEl.className = `stat-value ${this.getPropertyCountClass(propertyCount)}`;
    }

    /**
     * Count properties in JSON-LD object recursively
     */
    countProperties(obj) {
        let count = 0;
        
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key) && !key.startsWith('@')) {
                    count++;
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        count += this.countProperties(obj[key]);
                    }
                }
            }
        }
        
        return count;
    }

    /**
     * Get CSS class for character count
     */
    getCharCountClass(count) {
        if (count > 10000) return 'stat-warning'; // Very large
        if (count > 5000) return 'stat-medium';   // Large
        return 'stat-good';                       // Normal
    }

    /**
     * Get CSS class for file size
     */
    getSizeClass(bytes) {
        if (bytes > 50000) return 'stat-warning'; // > 50KB
        if (bytes > 20000) return 'stat-medium';  // > 20KB
        return 'stat-good';                       // < 20KB
    }

    /**
     * Get CSS class for property count
     */
    getPropertyCountClass(count) {
        if (count < 5) return 'stat-warning';     // Too few properties
        if (count < 10) return 'stat-medium';     // Moderate
        return 'stat-good';                       // Good coverage
    }

    /**
     * Format bytes to human readable string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Toggle expanded/collapsed view
     */
    toggleExpanded() {
        const btn = this.container.querySelector('#expandBtn');
        const previewContainer = this.container.querySelector('#previewContainer');
        
        if (previewContainer.classList.contains('expanded')) {
            previewContainer.classList.remove('expanded');
            btn.textContent = 'Expand All';
        } else {
            previewContainer.classList.add('expanded');
            btn.textContent = 'Collapse';
        }
    }

    /**
     * Show detailed validation results
     */
    showValidation() {
        const jsonLd = JsonLdGenerator.generate(this.currentData);
        const validation = JsonLdGenerator.validate(jsonLd);
        const resultsContainer = this.container.querySelector('#validationResults');
        const errorsContainer = this.container.querySelector('#validationErrors');
        const warningsContainer = this.container.querySelector('#validationWarnings');
        
        // Clear previous results
        errorsContainer.innerHTML = '';
        warningsContainer.innerHTML = '';
        
        // Show errors
        if (validation.errors.length > 0) {
            errorsContainer.innerHTML = `
                <div class="validation-section">
                    <h4 class="validation-title error">Errors (${validation.errors.length})</h4>
                    <ul class="validation-list">
                        ${validation.errors.map(error => `<li class="validation-item error">${error}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Show warnings
        if (validation.warnings.length > 0) {
            warningsContainer.innerHTML = `
                <div class="validation-section">
                    <h4 class="validation-title warning">Warnings (${validation.warnings.length})</h4>
                    <ul class="validation-list">
                        ${validation.warnings.map(warning => `<li class="validation-item warning">${warning}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Show success message if no issues
        if (validation.errors.length === 0 && validation.warnings.length === 0) {
            errorsContainer.innerHTML = `
                <div class="validation-section">
                    <div class="validation-success">
                        ✅ Your JSON-LD is valid and complete!
                    </div>
                </div>
            `;
        }
        
        // Show/hide results container
        resultsContainer.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            resultsContainer.style.display = 'none';
        }, 10000);
    }

    /**
     * Get current JSON-LD
     */
    getCurrentJsonLd() {
        return JsonLdGenerator.generate(this.currentData);
    }

    /**
     * Get formatted JSON string
     */
    getFormattedJson() {
        const jsonLd = this.getCurrentJsonLd();
        return JsonLdGenerator.format(jsonLd);
    }

    /**
     * Get minified JSON string
     */
    getMinifiedJson() {
        const jsonLd = this.getCurrentJsonLd();
        return JsonLdGenerator.minify(jsonLd);
    }

    /**
     * Get HTML script tag
     */
    getHtmlScript() {
        const jsonLd = this.getCurrentJsonLd();
        return JsonLdGenerator.toHtmlScript(jsonLd);
    }

    /**
     * Load example data
     */
    loadExample() {
        const exampleData = JsonLdGenerator.generateExample();
        this.updatePreview(exampleData);
        return exampleData;
    }

    /**
     * Clear preview
     */
    clear() {
        this.updatePreview({});
    }
}