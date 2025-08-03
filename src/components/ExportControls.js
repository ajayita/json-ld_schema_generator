export class ExportControls {
    constructor(container, previewPane) {
        this.container = container;
        this.previewPane = previewPane;
        this.render();
        this.setupEventListeners();
    }

    /**
     * Render the export controls HTML
     */
    render() {
        this.container.innerHTML = `
            <div class="card">
                <div class="export-buttons">
                    <button type="button" id="copyJsonBtn" class="btn btn-primary">
                        📋 Copy JSON-LD
                    </button>
                    <button type="button" id="downloadJsonBtn" class="btn btn-outline">
                        💾 Download JSON
                    </button>
                    <button type="button" id="copyHtmlBtn" class="btn btn-secondary">
                        🔗 Copy HTML Snippet
                    </button>
                    <button type="button" id="downloadHtmlBtn" class="btn btn-outline">
                        📄 Download HTML
                    </button>
                </div>
                
                <div class="export-options">
                    <div class="option-group">
                        <label>
                            <input type="radio" name="format" value="formatted" checked>
                            Formatted (human-readable)
                        </label>
                        <label>
                            <input type="radio" name="format" value="minified">
                            Minified (production-ready)
                        </label>
                    </div>
                </div>

                <div id="exportMessage" class="export-message" style="display: none;"></div>
                
                <div class="export-info">
                    <h4>Implementation Instructions</h4>
                    <p><strong>For JSON-LD:</strong> Copy the JSON-LD and paste it into a <code>&lt;script type="application/ld+json"&gt;</code> tag in your HTML head section.</p>
                    <p><strong>For HTML snippet:</strong> Copy the complete HTML snippet and paste it directly into your page's head section.</p>
                    <p><strong>Testing:</strong> Use Google's <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener">Rich Results Test</a> to validate your structured data.</p>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const copyJsonBtn = this.container.querySelector('#copyJsonBtn');
        const downloadJsonBtn = this.container.querySelector('#downloadJsonBtn');
        const copyHtmlBtn = this.container.querySelector('#copyHtmlBtn');
        const downloadHtmlBtn = this.container.querySelector('#downloadHtmlBtn');

        copyJsonBtn.addEventListener('click', () => this.copyJson());
        downloadJsonBtn.addEventListener('click', () => this.downloadJson());
        copyHtmlBtn.addEventListener('click', () => this.copyHtml());
        downloadHtmlBtn.addEventListener('click', () => this.downloadHtml());
    }

    /**
     * Get selected format (formatted or minified)
     */
    getSelectedFormat() {
        const formatRadio = this.container.querySelector('input[name="format"]:checked');
        return formatRadio ? formatRadio.value : 'formatted';
    }

    /**
     * Get JSON content based on selected format
     */
    getJsonContent() {
        const format = this.getSelectedFormat();
        return format === 'minified' 
            ? this.previewPane.getMinifiedJson()
            : this.previewPane.getFormattedJson();
    }

    /**
     * Copy JSON-LD to clipboard
     */
    async copyJson() {
        try {
            const jsonContent = this.getJsonContent();
            await navigator.clipboard.writeText(jsonContent);
            this.showMessage('JSON-LD copied to clipboard!', 'success');
        } catch (error) {
            this.fallbackCopy(this.getJsonContent(), 'JSON-LD');
        }
    }

    /**
     * Download JSON-LD as file
     */
    downloadJson() {
        const jsonContent = this.getJsonContent();
        const format = this.getSelectedFormat();
        const filename = `schema-${format}-${this.getTimestamp()}.json`;
        
        this.downloadFile(jsonContent, filename, 'application/json');
        this.showMessage('JSON-LD file downloaded!', 'success');
    }

    /**
     * Copy HTML snippet to clipboard
     */
    async copyHtml() {
        try {
            const htmlContent = this.previewPane.getHtmlScript();
            await navigator.clipboard.writeText(htmlContent);
            this.showMessage('HTML snippet copied to clipboard!', 'success');
        } catch (error) {
            this.fallbackCopy(this.previewPane.getHtmlScript(), 'HTML snippet');
        }
    }

    /**
     * Download HTML snippet as file
     */
    downloadHtml() {
        const htmlContent = this.generateFullHtml();
        const filename = `schema-snippet-${this.getTimestamp()}.html`;
        
        this.downloadFile(htmlContent, filename, 'text/html');
        this.showMessage('HTML file downloaded!', 'success');
    }

    /**
     * Generate complete HTML file with schema
     */
    generateFullHtml() {
        const scriptTag = this.previewPane.getHtmlScript();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local Business Schema</title>
    ${scriptTag}
</head>
<body>
    <h1>Local Business Structured Data</h1>
    <p>This page contains JSON-LD structured data for a local business.</p>
    <p>Use Google's <a href="https://search.google.com/test/rich-results" target="_blank">Rich Results Test</a> to validate the structured data.</p>
</body>
</html>`;
    }

    /**
     * Fallback copy method for browsers without clipboard API
     */
    fallbackCopy(text, type) {
        try {
            // Create temporary textarea
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            
            // Select and copy
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            this.showMessage(`${type} copied to clipboard!`, 'success');
        } catch (error) {
            this.showMessage(`Failed to copy ${type}. Please copy manually.`, 'error');
            console.error('Copy failed:', error);
        }
    }

    /**
     * Download file with given content
     */
    downloadFile(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up object URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            this.showMessage('Download failed. Please try again.', 'error');
            console.error('Download failed:', error);
        }
    }

    /**
     * Show export message
     */
    showMessage(message, type = 'success') {
        const messageElement = this.container.querySelector('#exportMessage');
        
        messageElement.textContent = message;
        messageElement.className = `export-message message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }

    /**
     * Get timestamp for filename
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString()
            .replace(/[:.]/g, '-')
            .slice(0, -5); // Remove milliseconds and 'Z'
    }

    /**
     * Check if content is available for export
     */
    hasContent() {
        try {
            const jsonLd = this.previewPane.getCurrentJsonLd();
            return jsonLd && Object.keys(jsonLd).length > 2; // More than just @context and @type
        } catch {
            return false;
        }
    }

    /**
     * Update export controls based on content availability
     */
    updateControls() {
        const hasContent = this.hasContent();
        const buttons = this.container.querySelectorAll('button');
        
        buttons.forEach(button => {
            button.disabled = !hasContent;
            if (!hasContent) {
                button.title = 'Fill out the form to enable export options';
            } else {
                button.title = '';
            }
        });
    }

    /**
     * Get export statistics
     */
    getExportStats() {
        const jsonLd = this.previewPane.getCurrentJsonLd();
        const formatted = this.previewPane.getFormattedJson();
        const minified = this.previewPane.getMinifiedJson();
        const html = this.previewPane.getHtmlScript();
        
        return {
            fields: Object.keys(jsonLd).length,
            formattedSize: this.formatBytes(new Blob([formatted]).size),
            minifiedSize: this.formatBytes(new Blob([minified]).size),
            htmlSize: this.formatBytes(new Blob([html]).size),
            compression: Math.round((1 - minified.length / formatted.length) * 100)
        };
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
     * Show export preview modal (for future enhancement)
     */
    showPreview(content, type) {
        // This could be enhanced to show a modal preview
        console.log(`Preview ${type}:`, content);
    }

    /**
     * Enable/disable controls based on validation
     */
    setValidationState(isValid) {
        const buttons = this.container.querySelectorAll('button');
        
        buttons.forEach(button => {
            if (!isValid) {
                button.classList.add('btn-disabled');
                button.title = 'Please fix validation errors before exporting';
            } else {
                button.classList.remove('btn-disabled');
                button.title = '';
            }
        });
    }
}