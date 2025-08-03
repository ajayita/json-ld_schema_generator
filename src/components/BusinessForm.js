import { FormValidator, Validators } from '../utils/validators.js';

export class BusinessForm {
    constructor(container) {
        this.container = container;
        this.validator = new FormValidator();
        this.data = this.loadFromStorage();
        this.onChangeCallback = null;
        
        this.render();
        this.setupValidation();
        this.setupEventListeners();
        this.updateStateOptions(); // Initialize state options
        this.restoreFormData();
    }

    /**
     * Business type options for LocalBusiness Schema.org types
     */
    getBusinessTypes() {
        return [
            { value: 'LocalBusiness', label: 'Local Business (General)' },
            { value: 'Restaurant', label: 'Restaurant' },
            { value: 'Store', label: 'Store' },
            { value: 'AutoDealer', label: 'Auto Dealer' },
            { value: 'AutoRepair', label: 'Auto Repair' },
            { value: 'BeautySalon', label: 'Beauty Salon' },
            { value: 'DentistOffice', label: 'Dentist Office' },
            { value: 'DryCleaningBusiness', label: 'Dry Cleaning' },
            { value: 'FinancialService', label: 'Financial Service' },
            { value: 'FoodEstablishment', label: 'Food Establishment' },
            { value: 'GasStation', label: 'Gas Station' },
            { value: 'HealthAndBeautyBusiness', label: 'Health & Beauty' },
            { value: 'HomeAndConstructionBusiness', label: 'Home & Construction' },
            { value: 'LegalService', label: 'Legal Service' },
            { value: 'Library', label: 'Library' },
            { value: 'LodgingBusiness', label: 'Lodging Business' },
            { value: 'MedicalBusiness', label: 'Medical Business' },
            { value: 'ProfessionalService', label: 'Professional Service' },
            { value: 'RealEstateAgent', label: 'Real Estate Agent' },
            { value: 'TravelAgency', label: 'Travel Agency' },
            { value: 'VeterinaryCare', label: 'Veterinary Care' }
        ];
    }

    /**
     * Country options
     */
    getCountries() {
        return [
            { value: 'US', label: 'United States' },
            { value: 'CA', label: 'Canada' },
            { value: 'GB', label: 'United Kingdom' },
            { value: 'AU', label: 'Australia' },
            { value: 'DE', label: 'Germany' },
            { value: 'FR', label: 'France' },
            { value: 'IT', label: 'Italy' },
            { value: 'ES', label: 'Spain' },
            { value: 'NL', label: 'Netherlands' },
            { value: 'JP', label: 'Japan' },
            { value: 'KR', label: 'South Korea' },
            { value: 'CN', label: 'China' },
            { value: 'IN', label: 'India' },
            { value: 'BR', label: 'Brazil' },
            { value: 'MX', label: 'Mexico' }
        ];
    }

    /**
     * Get states/provinces for selected country
     */
    getStatesProvinces(countryCode) {
        const stateData = {
            'US': [
                { value: 'AL', label: 'Alabama' },
                { value: 'AK', label: 'Alaska' },
                { value: 'AZ', label: 'Arizona' },
                { value: 'AR', label: 'Arkansas' },
                { value: 'CA', label: 'California' },
                { value: 'CO', label: 'Colorado' },
                { value: 'CT', label: 'Connecticut' },
                { value: 'DE', label: 'Delaware' },
                { value: 'FL', label: 'Florida' },
                { value: 'GA', label: 'Georgia' },
                { value: 'HI', label: 'Hawaii' },
                { value: 'ID', label: 'Idaho' },
                { value: 'IL', label: 'Illinois' },
                { value: 'IN', label: 'Indiana' },
                { value: 'IA', label: 'Iowa' },
                { value: 'KS', label: 'Kansas' },
                { value: 'KY', label: 'Kentucky' },
                { value: 'LA', label: 'Louisiana' },
                { value: 'ME', label: 'Maine' },
                { value: 'MD', label: 'Maryland' },
                { value: 'MA', label: 'Massachusetts' },
                { value: 'MI', label: 'Michigan' },
                { value: 'MN', label: 'Minnesota' },
                { value: 'MS', label: 'Mississippi' },
                { value: 'MO', label: 'Missouri' },
                { value: 'MT', label: 'Montana' },
                { value: 'NE', label: 'Nebraska' },
                { value: 'NV', label: 'Nevada' },
                { value: 'NH', label: 'New Hampshire' },
                { value: 'NJ', label: 'New Jersey' },
                { value: 'NM', label: 'New Mexico' },
                { value: 'NY', label: 'New York' },
                { value: 'NC', label: 'North Carolina' },
                { value: 'ND', label: 'North Dakota' },
                { value: 'OH', label: 'Ohio' },
                { value: 'OK', label: 'Oklahoma' },
                { value: 'OR', label: 'Oregon' },
                { value: 'PA', label: 'Pennsylvania' },
                { value: 'RI', label: 'Rhode Island' },
                { value: 'SC', label: 'South Carolina' },
                { value: 'SD', label: 'South Dakota' },
                { value: 'TN', label: 'Tennessee' },
                { value: 'TX', label: 'Texas' },
                { value: 'UT', label: 'Utah' },
                { value: 'VT', label: 'Vermont' },
                { value: 'VA', label: 'Virginia' },
                { value: 'WA', label: 'Washington' },
                { value: 'WV', label: 'West Virginia' },
                { value: 'WI', label: 'Wisconsin' },
                { value: 'WY', label: 'Wyoming' },
                { value: 'DC', label: 'District of Columbia' }
            ],
            'CA': [
                { value: 'AB', label: 'Alberta' },
                { value: 'BC', label: 'British Columbia' },
                { value: 'MB', label: 'Manitoba' },
                { value: 'NB', label: 'New Brunswick' },
                { value: 'NL', label: 'Newfoundland and Labrador' },
                { value: 'NS', label: 'Nova Scotia' },
                { value: 'ON', label: 'Ontario' },
                { value: 'PE', label: 'Prince Edward Island' },
                { value: 'QC', label: 'Quebec' },
                { value: 'SK', label: 'Saskatchewan' },
                { value: 'NT', label: 'Northwest Territories' },
                { value: 'NU', label: 'Nunavut' },
                { value: 'YT', label: 'Yukon' }
            ],
            'AU': [
                { value: 'NSW', label: 'New South Wales' },
                { value: 'QLD', label: 'Queensland' },
                { value: 'SA', label: 'South Australia' },
                { value: 'TAS', label: 'Tasmania' },
                { value: 'VIC', label: 'Victoria' },
                { value: 'WA', label: 'Western Australia' },
                { value: 'ACT', label: 'Australian Capital Territory' },
                { value: 'NT', label: 'Northern Territory' }
            ],
            'GB': [
                { value: 'England', label: 'England' },
                { value: 'Scotland', label: 'Scotland' },
                { value: 'Wales', label: 'Wales' },
                { value: 'Northern Ireland', label: 'Northern Ireland' }
            ]
        };

        return stateData[countryCode] || [];
    }

    /**
     * Price range options
     */
    getPriceRanges() {
        return [
            { value: '$', label: '$ - Inexpensive' },
            { value: '$$', label: '$$ - Moderate' },
            { value: '$$$', label: '$$$ - Expensive' },
            { value: '$$$$', label: '$$$$ - Very Expensive' }
        ];
    }

    /**
     * Render the form HTML
     */
    render() {
        const businessTypes = this.getBusinessTypes();
        const countries = this.getCountries();
        const priceRanges = this.getPriceRanges();

        this.container.innerHTML = `
            <!-- Business Information Card -->
            <div class="card">
                <h3>🏢 Business Information</h3>
                
                <div class="form-group required">
                    <label for="businessName">Business Name</label>
                    <input type="text" id="businessName" name="businessName" class="form-input" 
                           placeholder="Enter your business name">
                    <div class="error-message"></div>
                </div>

                <div class="form-row">
                    <div class="form-group required">
                        <label for="businessType">Business Type</label>
                        <select id="businessType" name="businessType" class="form-select">
                            <option value="">Select business type</option>
                            ${businessTypes.map(type => 
                                `<option value="${type.value}">${type.label}</option>`
                            ).join('')}
                        </select>
                        <div class="error-message"></div>
                    </div>

                    <div class="form-group">
                        <label for="priceRange">Price Range</label>
                        <select id="priceRange" name="priceRange" class="form-select">
                            <option value="">Select price range</option>
                            ${priceRanges.map(range => 
                                `<option value="${range.value}">${range.label}</option>`
                            ).join('')}
                        </select>
                        <div class="error-message"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="description">Business Description</label>
                    <textarea id="description" name="description" class="form-textarea" 
                              placeholder="Brief description of your business (max 160 characters)"
                              maxlength="160"></textarea>
                    <div class="error-message"></div>
                    <small class="char-count">0/160 characters</small>
                </div>
            </div>

            <!-- Contact Information Card -->
            <div class="card">
                <h3>📞 Contact Information</h3>
                
                <div class="form-group required">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" class="form-input" 
                           placeholder="(555) 123-4567">
                    <div class="error-message"></div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="website">Website URL</label>
                        <input type="url" id="website" name="website" class="form-input" 
                               placeholder="https://yourwebsite.com">
                        <div class="error-message"></div>
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" class="form-input" 
                               placeholder="contact@yourbusiness.com">
                        <div class="error-message"></div>
                    </div>
                </div>
            </div>

            <!-- Location Card -->
            <div class="card">
                <h3>📍 Location</h3>
                
                <div class="form-group required">
                    <label for="streetAddress">Street Address</label>
                    <input type="text" id="streetAddress" name="streetAddress" class="form-input" 
                           placeholder="123 Main Street">
                    <div class="error-message"></div>
                </div>

                <div class="form-row">
                    <div class="form-group required">
                        <label for="city">City</label>
                        <input type="text" id="city" name="city" class="form-input" 
                               placeholder="City name">
                        <div class="error-message"></div>
                    </div>

                    <div class="form-group required">
                        <label for="state">State/Province</label>
                        <div class="state-input-wrapper">
                            <select id="stateSelect" name="state" class="form-select" style="display: none;">
                                <option value="">Select state/province</option>
                            </select>
                            <input type="text" id="stateText" name="state" class="form-input" 
                                   placeholder="State or Province">
                        </div>
                        <div class="error-message"></div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group required">
                        <label for="postalCode">Postal Code</label>
                        <input type="text" id="postalCode" name="postalCode" class="form-input" 
                               placeholder="12345">
                        <div class="error-message"></div>
                    </div>

                    <div class="form-group required">
                        <label for="country">Country</label>
                        <select id="country" name="country" class="form-select">
                            <option value="">Select country</option>
                            ${countries.map(country => 
                                `<option value="${country.value}">${country.label}</option>`
                            ).join('')}
                        </select>
                        <div class="error-message"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label>🌍 Coordinates (Optional)</label>
                    <div class="geo-controls">
                        <div class="form-row">
                            <div class="form-group">
                                <input type="number" id="latitude" name="latitude" class="form-input" 
                                       placeholder="Latitude" step="any" min="-90" max="90">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <input type="number" id="longitude" name="longitude" class="form-input" 
                                       placeholder="Longitude" step="any" min="-180" max="180">
                                <div class="error-message"></div>
                            </div>
                        </div>
                        <button type="button" id="useLocationBtn" class="btn btn-outline btn-small">
                            📍 Use My Location
                        </button>
                    </div>
                    <div id="coordinatesDisplay" class="coordinates-display" style="display: none;"></div>
                </div>
            </div>

            <!-- Opening Hours Card -->
            <div class="card">
                <h3>🕰️ Opening Hours</h3>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="open24Hours" name="open24Hours"> 
                        <span class="checkmark"></span>
                        Open 24/7
                    </label>
                </div>
                
                <div class="hours-section" id="openingHours">
                    ${this.renderOpeningHours()}
                </div>
            </div>

            <!-- Form Actions Card -->
            <div class="card">
                <div class="form-actions">
                    <button type="button" id="clearFormBtn" class="btn btn-outline">
                        🗑️ Clear Form
                    </button>
                    <button type="button" id="loadExampleBtn" class="btn btn-secondary">
                        📝 Load Example
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render opening hours interface
     */
    renderOpeningHours() {
        const days = [
            { key: 'monday', label: 'Monday', emoji: '🔅' },
            { key: 'tuesday', label: 'Tuesday', emoji: '🔆' },
            { key: 'wednesday', label: 'Wednesday', emoji: '🔇' },
            { key: 'thursday', label: 'Thursday', emoji: '🔈' },
            { key: 'friday', label: 'Friday', emoji: '🔉' },
            { key: 'saturday', label: 'Saturday', emoji: '🔊' },
            { key: 'sunday', label: 'Sunday', emoji: '🔋' }
        ];
        
        return days.map(day => `
            <div class="hours-group" data-day="${day.key}">
                <label class="day-label">
                    <input type="checkbox" class="hours-checkbox" data-day="${day.key}">
                    <span class="checkmark"></span>
                    <span class="day-name">${day.emoji} ${day.label}</span>
                </label>
                <div class="time-inputs">
                    <input type="time" class="hours-time" data-day="${day.key}" data-type="open" disabled value="09:00">
                    <span class="time-separator">to</span>
                    <input type="time" class="hours-time" data-day="${day.key}" data-type="close" disabled value="17:00">
                </div>
                <span class="hours-closed">Closed</span>
            </div>
        `).join('');
    }

    /**
     * Setup form validation
     */
    setupValidation() {
        // Required fields
        this.validator.addField(this.container.querySelector('#businessName'), [
            Validators.required
        ]);

        this.validator.addField(this.container.querySelector('#businessType'), [
            Validators.required
        ]);

        this.validator.addField(this.container.querySelector('#phone'), [
            Validators.required,
            Validators.phone
        ]);

        this.validator.addField(this.container.querySelector('#streetAddress'), [
            Validators.required
        ]);

        this.validator.addField(this.container.querySelector('#city'), [
            Validators.required
        ]);

        this.validator.addField(this.container.querySelector('#state'), [
            Validators.required
        ]);

        this.validator.addField(this.container.querySelector('#postalCode'), [
            Validators.required,
            [Validators.postalCode, this.getSelectedCountry()]
        ]);

        this.validator.addField(this.container.querySelector('#country'), [
            Validators.required
        ]);

        // Optional fields with validation
        this.validator.addField(this.container.querySelector('#website'), [
            Validators.url
        ]);

        this.validator.addField(this.container.querySelector('#email'), [
            Validators.email
        ]);

        this.validator.addField(this.container.querySelector('#description'), [
            [Validators.maxLength, 160]
        ]);

        this.validator.addField(this.container.querySelector('#latitude'), [
            Validators.latitude
        ]);

        this.validator.addField(this.container.querySelector('#longitude'), [
            Validators.longitude
        ]);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Auto-save on input
        this.container.addEventListener('input', (e) => {
            this.saveToStorage();
            if (this.onChangeCallback) {
                this.onChangeCallback(this.getFormData());
            }
        });

        this.container.addEventListener('change', (e) => {
            this.saveToStorage();
            if (this.onChangeCallback) {
                this.onChangeCallback(this.getFormData());
            }
        });

        // Character counter for description
        const descriptionField = this.container.querySelector('#description');
        const charCount = this.container.querySelector('.char-count');
        
        descriptionField.addEventListener('input', () => {
            const count = descriptionField.value.length;
            charCount.textContent = `${count}/160 characters`;
        });

        // Opening hours checkboxes
        this.container.querySelectorAll('.hours-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const day = e.target.dataset.day;
                const timeInputs = this.container.querySelectorAll(`[data-day="${day}"][data-type]`);
                const closedLabel = e.target.closest('.hours-group').querySelector('.hours-closed');
                
                const hoursGroup = e.target.closest('.hours-group');
                
                if (e.target.checked) {
                    timeInputs.forEach(input => {
                        input.disabled = false;
                        if (!input.value) {
                            input.value = input.dataset.type === 'open' ? '09:00' : '17:00';
                        }
                    });
                    closedLabel.style.display = 'none';
                    hoursGroup.classList.add('active');
                } else {
                    timeInputs.forEach(input => {
                        input.disabled = true;
                        input.value = '';
                    });
                    closedLabel.style.display = 'block';
                    hoursGroup.classList.remove('active');
                }
            });
        });

        // 24/7 checkbox
        const open24Hours = this.container.querySelector('#open24Hours');
        open24Hours.addEventListener('change', (e) => {
            const hoursSection = this.container.querySelector('#openingHours');
            if (e.target.checked) {
                hoursSection.style.display = 'none';
                // Uncheck all day checkboxes
                this.container.querySelectorAll('.hours-checkbox').forEach(cb => {
                    cb.checked = false;
                    const hoursGroup = cb.closest('.hours-group');
                    hoursGroup.classList.remove('active');
                });
            } else {
                hoursSection.style.display = 'block';
            }
        });

        // Use my location button
        const useLocationBtn = this.container.querySelector('#useLocationBtn');
        useLocationBtn.addEventListener('click', () => this.useCurrentLocation());

        // Clear form button
        const clearFormBtn = this.container.querySelector('#clearFormBtn');
        clearFormBtn.addEventListener('click', () => this.clearForm());
        
        // Load example button
        const loadExampleBtn = this.container.querySelector('#loadExampleBtn');
        loadExampleBtn.addEventListener('click', () => this.loadExample());

        // Update postal code validation when country changes
        const countrySelect = this.container.querySelector('#country');
        countrySelect.addEventListener('change', () => {
            const postalCodeField = this.container.querySelector('#postalCode');
            this.validator.validators.get(postalCodeField).rules = [
                { validator: Validators.required, args: [] },
                { validator: Validators.postalCode, args: [this.getSelectedCountry()] }
            ];
            
            // Update state/province options
            this.updateStateOptions();
        });
    }

    /**
     * Get currently selected country
     */
    getSelectedCountry() {
        const countrySelect = this.container.querySelector('#country');
        return countrySelect.value || 'US';
    }

    /**
     * Update state/province options based on selected country
     */
    updateStateOptions() {
        const countryCode = this.getSelectedCountry();
        const stateSelect = this.container.querySelector('#stateSelect');
        const stateText = this.container.querySelector('#stateText');
        const states = this.getStatesProvinces(countryCode);

        if (states.length > 0) {
            // Show dropdown, hide text input
            stateSelect.style.display = 'block';
            stateText.style.display = 'none';
            
            // Clear and populate dropdown
            stateSelect.innerHTML = '<option value="">Select state/province</option>';
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state.value;
                option.textContent = state.label;
                stateSelect.appendChild(option);
            });
            
            // Transfer value if exists
            if (stateText.value) {
                const matchingOption = states.find(s => 
                    s.value.toLowerCase() === stateText.value.toLowerCase() ||
                    s.label.toLowerCase() === stateText.value.toLowerCase()
                );
                if (matchingOption) {
                    stateSelect.value = matchingOption.value;
                }
            }
            
            // Clear text input
            stateText.value = '';
            
        } else {
            // Show text input, hide dropdown
            stateSelect.style.display = 'none';
            stateText.style.display = 'block';
            
            // Transfer value from dropdown if exists
            if (stateSelect.value) {
                const selectedOption = stateSelect.options[stateSelect.selectedIndex];
                stateText.value = selectedOption ? selectedOption.textContent : stateSelect.value;
            }
        }
        
        // Update validation
        this.setupStateValidation();
    }

    /**
     * Setup validation for the active state field
     */
    setupStateValidation() {
        const stateSelect = this.container.querySelector('#stateSelect');
        const stateText = this.container.querySelector('#stateText');
        const activeField = stateSelect.style.display !== 'none' ? stateSelect : stateText;
        
        // Remove existing validation
        this.validator.validators.delete(stateSelect);
        this.validator.validators.delete(stateText);
        
        // Add validation to active field
        this.validator.addField(activeField, [Validators.required]);
    }

    /**
     * Use browser geolocation to get current coordinates
     */
    useCurrentLocation() {
        const btn = this.container.querySelector('#useLocationBtn');
        const latField = this.container.querySelector('#latitude');
        const lngField = this.container.querySelector('#longitude');
        const display = this.container.querySelector('#coordinatesDisplay');

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span>Getting location...';

        if (!navigator.geolocation) {
            this.showLocationError('Geolocation is not supported by this browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                
                latField.value = lat;
                lngField.value = lng;
                
                display.textContent = `Location found: ${lat}, ${lng}`;
                display.style.display = 'block';
                
                btn.disabled = false;
                btn.textContent = 'Use My Location';
                
                this.saveToStorage();
                if (this.onChangeCallback) {
                    this.onChangeCallback(this.getFormData());
                }
            },
            (error) => {
                let message = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                this.showLocationError(message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }

    /**
     * Show location error
     */
    showLocationError(message) {
        const btn = this.container.querySelector('#useLocationBtn');
        const display = this.container.querySelector('#coordinatesDisplay');
        
        btn.disabled = false;
        btn.textContent = 'Use My Location';
        
        display.textContent = message;
        display.style.display = 'block';
        display.style.color = '#e74c3c';
        
        setTimeout(() => {
            display.style.display = 'none';
            display.style.color = '#2e7d32';
        }, 5000);
    }

    /**
     * Clear form and storage
     */
    clearForm(confirm = true) {
        if (!confirm || window.confirm('Are you sure you want to clear all form data?')) {
            this.container.querySelectorAll('input, select, textarea').forEach(field => {
                if (field.type === 'checkbox') {
                    field.checked = false;
                } else {
                    field.value = '';
                }
                
                if (field.classList.contains('hours-time')) {
                    field.disabled = true;
                }
            });

            this.container.querySelectorAll('.hours-closed').forEach(label => {
                label.style.display = 'inline';
            });

            this.container.querySelector('#openingHours').style.display = 'block';
            this.container.querySelector('#coordinatesDisplay').style.display = 'none';
            this.container.querySelector('.char-count').textContent = '0/160 characters';

            this.validator.clearValidation();
            localStorage.removeItem('schemasnap-form-data');
            
            if (this.onChangeCallback) {
                this.onChangeCallback({});
            }
        }
    }

    /**
     * Get form data
     */
    getFormData() {
        const formData = {};
        
        // Basic fields
        this.container.querySelectorAll('input[name], select[name], textarea[name]').forEach(field => {
            // Skip hidden state field
            if ((field.id === 'stateSelect' || field.id === 'stateText') && field.style.display === 'none') {
                return;
            }
            
            if (field.type === 'checkbox') {
                formData[field.name] = field.checked;
            } else if (field.value) {
                formData[field.name] = field.value.trim();
            }
        });

        // Opening hours
        if (!formData.open24Hours) {
            const openingHours = {};
            this.container.querySelectorAll('.hours-checkbox:checked').forEach(checkbox => {
                const day = checkbox.dataset.day;
                const openTime = this.container.querySelector(`[data-day="${day}"][data-type="open"]`).value;
                const closeTime = this.container.querySelector(`[data-day="${day}"][data-type="close"]`).value;
                
                if (openTime && closeTime) {
                    openingHours[day] = { open: openTime, close: closeTime };
                }
            });
            
            if (Object.keys(openingHours).length > 0) {
                formData.openingHours = openingHours;
            }
        }

        return formData;
    }

    /**
     * Validate form
     */
    validate() {
        return this.validator.validateAll();
    }

    /**
     * Save form data to localStorage
     */
    saveToStorage() {
        const data = this.getFormData();
        localStorage.setItem('schemasnap-form-data', JSON.stringify(data));
    }

    /**
     * Load form data from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('schemasnap-form-data');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }

    /**
     * Restore form data from storage
     */
    restoreFormData() {
        const data = this.data;
        
        Object.keys(data).forEach(key => {
            if (key === 'openingHours') return;
            
            const field = this.container.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = data[key];
                } else {
                    field.value = data[key];
                }
            }
        });

        // Restore opening hours
        if (data.openingHours) {
            Object.keys(data.openingHours).forEach(day => {
                const checkbox = this.container.querySelector(`[data-day="${day}"]`);
                const openInput = this.container.querySelector(`[data-day="${day}"][data-type="open"]`);
                const closeInput = this.container.querySelector(`[data-day="${day}"][data-type="close"]`);
                
                if (checkbox && openInput && closeInput) {
                    checkbox.checked = true;
                    openInput.disabled = false;
                    closeInput.disabled = false;
                    openInput.value = data.openingHours[day].open;
                    closeInput.value = data.openingHours[day].close;
                    
                    const closedLabel = checkbox.closest('.hours-group').querySelector('.hours-closed');
                    closedLabel.style.display = 'none';
                }
            });
        }

        // Update character counter
        const descriptionField = this.container.querySelector('#description');
        const charCount = this.container.querySelector('.char-count');
        if (descriptionField.value) {
            charCount.textContent = `${descriptionField.value.length}/160 characters`;
        }
    }

    /**
     * Load example business data
     */
    loadExample() {
        if (confirm('This will replace your current form data with example data. Continue?')) {
            const exampleData = {
                businessName: 'The Coffee Corner',
                businessType: 'Restaurant',
                description: 'Cozy neighborhood coffee shop serving artisanal coffee, fresh pastries, and light meals in a warm, welcoming atmosphere.',
                phone: '(555) 123-4567',
                website: 'https://www.thecoffeecorner.com',
                email: 'hello@thecoffeecorner.com',
                streetAddress: '123 Main Street',
                city: 'Downtown',
                state: 'CA',
                postalCode: '90210',
                country: 'US',
                priceRange: '$$',
                latitude: '34.052235',
                longitude: '-118.243685',
                openingHours: {
                    monday: { open: '07:00', close: '19:00' },
                    tuesday: { open: '07:00', close: '19:00' },
                    wednesday: { open: '07:00', close: '19:00' },
                    thursday: { open: '07:00', close: '19:00' },
                    friday: { open: '07:00', close: '20:00' },
                    saturday: { open: '08:00', close: '20:00' },
                    sunday: { open: '08:00', close: '18:00' }
                }
            };
            
            this.populateForm(exampleData);
            this.showMessage('Example data loaded successfully!', 'success');
        }
    }
    
    /**
     * Populate form with data
     */
    populateForm(data) {
        // Clear form first
        this.clearForm(false);
        
        // Populate basic fields
        Object.keys(data).forEach(key => {
            if (key === 'openingHours') return;
            
            const field = this.container.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = data[key];
                } else {
                    field.value = data[key] || '';
                }
                
                // Trigger change event for validation and callbacks
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // Update state options based on country
        this.updateStateOptions();
        
        // Set state value after country is updated
        if (data.state) {
            const stateSelect = this.container.querySelector('#stateSelect');
            const stateText = this.container.querySelector('#stateText');
            const activeField = stateSelect.style.display !== 'none' ? stateSelect : stateText;
            activeField.value = data.state;
        }
        
        // Populate opening hours
        if (data.openingHours) {
            Object.keys(data.openingHours).forEach(day => {
                const checkbox = this.container.querySelector(`[data-day="${day}"]`);
                const openInput = this.container.querySelector(`[data-day="${day}"][data-type="open"]`);
                const closeInput = this.container.querySelector(`[data-day="${day}"][data-type="close"]`);
                const hoursGroup = checkbox?.closest('.hours-group');
                
                if (checkbox && openInput && closeInput && hoursGroup) {
                    checkbox.checked = true;
                    openInput.disabled = false;
                    closeInput.disabled = false;
                    openInput.value = data.openingHours[day].open;
                    closeInput.value = data.openingHours[day].close;
                    
                    const closedLabel = hoursGroup.querySelector('.hours-closed');
                    if (closedLabel) {
                        closedLabel.style.display = 'none';
                    }
                    hoursGroup.classList.add('active');
                }
            });
        }
        
        // Update character counter
        const descriptionField = this.container.querySelector('#description');
        const charCount = this.container.querySelector('.char-count');
        if (descriptionField && charCount) {
            charCount.textContent = `${descriptionField.value.length}/160 characters`;
        }
        
        // Update coordinates display
        if (data.latitude && data.longitude) {
            const display = this.container.querySelector('#coordinatesDisplay');
            if (display) {
                display.textContent = `Coordinates: ${data.latitude}, ${data.longitude}`;
                display.style.display = 'block';
            }
        }
        
        // Save to storage and trigger callbacks
        this.saveToStorage();
        if (this.onChangeCallback) {
            this.onChangeCallback(this.getFormData());
        }
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 1000;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            animation: slideInMessage 0.3s ease-out;
        `;
        
        // Add type-specific styling
        if (type === 'success') {
            messageEl.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            messageEl.style.color = 'white';
        } else if (type === 'error') {
            messageEl.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            messageEl.style.color = 'white';
        }
        
        document.body.appendChild(messageEl);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOutMessage 0.3s ease-in';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }

    /**
     * Set change callback
     */
    onChange(callback) {
        this.onChangeCallback = callback;
    }

    /**
     * Load form data from localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('schemasnap-form-data');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load form data from storage:', error);
            return {};
        }
    }

    /**
     * Save form data to localStorage
     */
    saveToStorage() {
        try {
            const formData = this.getFormData();
            localStorage.setItem('schemasnap-form-data', JSON.stringify(formData));
        } catch (error) {
            console.warn('Failed to save form data to storage:', error);
        }
    }

    /**
     * Restore form data from storage
     */
    restoreFormData() {
        if (this.data && Object.keys(this.data).length > 0) {
            // Set form values from stored data
            Object.entries(this.data).forEach(([key, value]) => {
                const field = this.container.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = Boolean(value);
                    } else {
                        field.value = value;
                    }
                }
            });

            // Update dependent fields
            this.updateStateOptions();
            
            // Show restoration message
            if (Object.keys(this.data).length > 3) {
                this.showMessage('Previous form data restored automatically', 'success');
            }
        }
    }

    /**
     * Clear stored form data
     */
    clearStorage() {
        try {
            localStorage.removeItem('schemasnap-form-data');
            this.data = {};
        } catch (error) {
            console.warn('Failed to clear form data from storage:', error);
        }
    }
}