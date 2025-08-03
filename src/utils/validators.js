/**
 * Form validation utilities for Schema Snap
 */

export class Validators {
    /**
     * Validate required field
     */
    static required(value) {
        const trimmed = String(value).trim();
        return {
            isValid: trimmed.length > 0,
            message: 'This field is required'
        };
    }

    /**
     * Validate email format
     */
    static email(value) {
        if (!value) return { isValid: true, message: '' };
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
            isValid: emailRegex.test(value),
            message: 'Please enter a valid email address'
        };
    }

    /**
     * Validate URL format
     */
    static url(value) {
        if (!value) return { isValid: true, message: '' };
        
        try {
            const url = new URL(value.startsWith('http') ? value : `https://${value}`);
            return {
                isValid: true,
                message: '',
                normalizedValue: url.toString()
            };
        } catch {
            return {
                isValid: false,
                message: 'Please enter a valid URL'
            };
        }
    }

    /**
     * Validate phone number format (international support)
     */
    static phone(value) {
        if (!value) return { isValid: true, message: '' };
        
        // Remove all non-digit characters for validation
        const digitsOnly = value.replace(/\D/g, '');
        
        // Must have at least 7 digits, max 15 (international standard)
        if (digitsOnly.length < 7 || digitsOnly.length > 15) {
            return {
                isValid: false,
                message: 'Please enter a valid phone number'
            };
        }
        
        return {
            isValid: true,
            message: '',
            normalizedValue: this.formatPhoneNumber(value)
        };
    }

    /**
     * Format phone number for display
     */
    static formatPhoneNumber(value) {
        const digitsOnly = value.replace(/\D/g, '');
        
        // Format US numbers as (XXX) XXX-XXXX
        if (digitsOnly.length === 10) {
            return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
        }
        
        // Format international numbers with + prefix
        if (digitsOnly.length > 10) {
            return `+${digitsOnly}`;
        }
        
        return value;
    }

    /**
     * Validate latitude coordinate
     */
    static latitude(value) {
        if (!value) return { isValid: true, message: '' };
        
        const num = parseFloat(value);
        if (isNaN(num)) {
            return {
                isValid: false,
                message: 'Latitude must be a number'
            };
        }
        
        if (num < -90 || num > 90) {
            return {
                isValid: false,
                message: 'Latitude must be between -90 and 90'
            };
        }
        
        return {
            isValid: true,
            message: '',
            normalizedValue: parseFloat(num.toFixed(6))
        };
    }

    /**
     * Validate longitude coordinate
     */
    static longitude(value) {
        if (!value) return { isValid: true, message: '' };
        
        const num = parseFloat(value);
        if (isNaN(num)) {
            return {
                isValid: false,
                message: 'Longitude must be a number'
            };
        }
        
        if (num < -180 || num > 180) {
            return {
                isValid: false,
                message: 'Longitude must be between -180 and 180'
            };
        }
        
        return {
            isValid: true,
            message: '',
            normalizedValue: parseFloat(num.toFixed(6))
        };
    }

    /**
     * Validate postal code
     */
    static postalCode(value, country = 'US') {
        if (!value) return { isValid: true, message: '' };
        
        const patterns = {
            US: /^\d{5}(-\d{4})?$/,
            CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
            UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/,
            // Add more patterns as needed
        };
        
        const pattern = patterns[country] || patterns.US;
        
        return {
            isValid: pattern.test(value.trim()),
            message: 'Please enter a valid postal code'
        };
    }

    /**
     * Validate text length
     */
    static maxLength(value, maxLength) {
        if (!value) return { isValid: true, message: '' };
        
        return {
            isValid: value.length <= maxLength,
            message: `Maximum ${maxLength} characters allowed`
        };
    }

    /**
     * Validate opening hours time format
     */
    static time(value) {
        if (!value) return { isValid: true, message: '' };
        
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        return {
            isValid: timeRegex.test(value),
            message: 'Please enter time in HH:MM format'
        };
    }

    /**
     * Validate that opening time is before closing time
     */
    static timeRange(openTime, closeTime) {
        if (!openTime || !closeTime) return { isValid: true, message: '' };
        
        const [openHour, openMin] = openTime.split(':').map(Number);
        const [closeHour, closeMin] = closeTime.split(':').map(Number);
        
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        return {
            isValid: openMinutes < closeMinutes,
            message: 'Opening time must be before closing time'
        };
    }

    /**
     * Sanitize text input
     */
    static sanitizeText(value) {
        if (!value) return '';
        
        return value
            .trim()
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Normalize URL by adding protocol if missing
     */
    static normalizeUrl(value) {
        if (!value) return '';
        
        const trimmed = value.trim();
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            return `https://${trimmed}`;
        }
        
        return trimmed;
    }
}

/**
 * Form field validator class
 */
export class FieldValidator {
    constructor(element) {
        this.element = element;
        this.rules = [];
        this.isValid = true;
        this.setupEventListeners();
    }

    /**
     * Add validation rule
     */
    addRule(validator, ...args) {
        this.rules.push({ validator, args });
        return this;
    }

    /**
     * Validate field
     */
    validate() {
        const value = this.element.value;
        let isValid = true;
        let message = '';
        let normalizedValue = value;

        // Run all validation rules
        for (const rule of this.rules) {
            const result = rule.validator(value, ...rule.args);
            
            if (!result.isValid) {
                isValid = false;
                message = result.message;
                break;
            }
            
            if (result.normalizedValue !== undefined) {
                normalizedValue = result.normalizedValue;
            }
        }

        this.isValid = isValid;
        this.updateUI(isValid, message);
        
        // Update field value if normalized
        if (isValid && normalizedValue !== value) {
            this.element.value = normalizedValue;
        }

        return { isValid, message, value: normalizedValue };
    }

    /**
     * Update field UI based on validation result
     */
    updateUI(isValid, message) {
        const formGroup = this.element.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');

        if (isValid) {
            formGroup.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        } else {
            formGroup.classList.add('error');
            if (errorElement) {
                errorElement.textContent = message;
            }
        }
    }

    /**
     * Setup event listeners for real-time validation
     */
    setupEventListeners() {
        this.element.addEventListener('blur', () => this.validate());
        this.element.addEventListener('input', () => {
            // Clear error state on input
            const formGroup = this.element.closest('.form-group');
            if (formGroup.classList.contains('error')) {
                formGroup.classList.remove('error');
            }
        });
    }
}

/**
 * Form validation manager
 */
export class FormValidator {
    constructor() {
        this.validators = new Map();
    }

    /**
     * Add field validator
     */
    addField(element, rules) {
        const validator = new FieldValidator(element);
        
        // Add rules
        rules.forEach(rule => {
            if (typeof rule === 'function') {
                validator.addRule(rule);
            } else if (Array.isArray(rule)) {
                validator.addRule(...rule);
            }
        });

        this.validators.set(element, validator);
        return validator;
    }

    /**
     * Validate all fields
     */
    validateAll() {
        let isFormValid = true;
        const results = {};

        this.validators.forEach((validator, element) => {
            const result = validator.validate();
            const fieldName = element.name || element.id;
            
            results[fieldName] = result;
            
            if (!result.isValid) {
                isFormValid = false;
            }
        });

        return { isValid: isFormValid, results };
    }

    /**
     * Get form data with validated values
     */
    getFormData() {
        const data = {};
        
        this.validators.forEach((validator, element) => {
            const fieldName = element.name || element.id;
            const result = validator.validate();
            
            if (result.isValid) {
                data[fieldName] = result.value;
            }
        });

        return data;
    }

    /**
     * Clear all validation states
     */
    clearValidation() {
        this.validators.forEach((validator) => {
            validator.updateUI(true, '');
        });
    }
}