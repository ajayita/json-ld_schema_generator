/**
 * JSON-LD Generator for Schema.org LocalBusiness structured data
 */

export class JsonLdGenerator {
    /**
     * Generate LocalBusiness JSON-LD from form data
     */
    static generate(formData) {
        if (!formData || Object.keys(formData).length === 0) {
            return this.getEmptySchema();
        }

        const schema = {
            "@context": "https://schema.org",
            "@type": formData.businessType || "LocalBusiness"
        };

        // Required fields
        if (formData.businessName) {
            schema.name = this.sanitizeText(formData.businessName);
        }

        // Address (PostalAddress)
        const address = this.buildAddress(formData);
        if (address && Object.keys(address).length > 1) { // More than just @type
            schema.address = address;
        }

        // Contact information
        if (formData.phone) {
            schema.telephone = formData.phone;
        }

        if (formData.website) {
            schema.url = formData.website;
        }

        if (formData.email) {
            schema.email = formData.email;
        }

        // Optional fields
        if (formData.description) {
            schema.description = this.sanitizeText(formData.description);
        }

        if (formData.priceRange) {
            schema.priceRange = formData.priceRange;
        }

        // Geo coordinates (GeoCoordinates)
        const geo = this.buildGeoCoordinates(formData);
        if (geo) {
            schema.geo = geo;
        }

        // Opening hours
        const openingHours = this.buildOpeningHours(formData);
        if (openingHours && openingHours.length > 0) {
            schema.openingHoursSpecification = openingHours;
        }

        return schema;
    }

    /**
     * Build PostalAddress object
     */
    static buildAddress(formData) {
        const address = {
            "@type": "PostalAddress"
        };

        if (formData.streetAddress) {
            address.streetAddress = this.sanitizeText(formData.streetAddress);
        }

        if (formData.city) {
            address.addressLocality = this.sanitizeText(formData.city);
        }

        if (formData.state) {
            address.addressRegion = this.sanitizeText(formData.state);
        }

        if (formData.postalCode) {
            address.postalCode = formData.postalCode;
        }

        if (formData.country) {
            address.addressCountry = formData.country;
        }

        return address;
    }

    /**
     * Build GeoCoordinates object
     */
    static buildGeoCoordinates(formData) {
        if (!formData.latitude || !formData.longitude) {
            return null;
        }

        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return null;
        }

        return {
            "@type": "GeoCoordinates",
            latitude: lat,
            longitude: lng
        };
    }

    /**
     * Build OpeningHoursSpecification array
     */
    static buildOpeningHours(formData) {
        if (formData.open24Hours) {
            return [{
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                    "Monday", "Tuesday", "Wednesday", "Thursday", 
                    "Friday", "Saturday", "Sunday"
                ],
                opens: "00:00",
                closes: "23:59"
            }];
        }

        if (!formData.openingHours) {
            return [];
        }

        const specifications = [];
        const dayMapping = {
            monday: "Monday",
            tuesday: "Tuesday", 
            wednesday: "Wednesday",
            thursday: "Thursday",
            friday: "Friday",
            saturday: "Saturday",
            sunday: "Sunday"
        };

        // Group consecutive days with same hours
        const dayGroups = this.groupConsecutiveDays(formData.openingHours, dayMapping);

        dayGroups.forEach(group => {
            specifications.push({
                "@type": "OpeningHoursSpecification",
                dayOfWeek: group.days.length === 1 ? group.days[0] : group.days,
                opens: group.opens,
                closes: group.closes
            });
        });

        return specifications;
    }

    /**
     * Group consecutive days with same opening hours
     */
    static groupConsecutiveDays(openingHours, dayMapping) {
        const groups = [];
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        // Create time signature for each day
        const dayTimes = {};
        Object.keys(openingHours).forEach(day => {
            const hours = openingHours[day];
            dayTimes[day] = `${hours.open}-${hours.close}`;
        });

        // Group consecutive days with same times
        const processed = new Set();
        
        dayOrder.forEach(day => {
            if (processed.has(day) || !dayTimes[day]) return;
            
            const currentTime = dayTimes[day];
            const group = {
                days: [dayMapping[day]],
                opens: openingHours[day].open,
                closes: openingHours[day].close
            };
            
            processed.add(day);
            
            // Look for consecutive days with same times
            let nextDayIndex = dayOrder.indexOf(day) + 1;
            while (nextDayIndex < dayOrder.length) {
                const nextDay = dayOrder[nextDayIndex];
                
                if (dayTimes[nextDay] === currentTime) {
                    group.days.push(dayMapping[nextDay]);
                    processed.add(nextDay);
                    nextDayIndex++;
                } else {
                    break;
                }
            }
            
            groups.push(group);
        });

        return groups;
    }

    /**
     * Sanitize text for JSON-LD
     */
    static sanitizeText(text) {
        if (!text) return '';
        
        return text
            .trim()
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/\s+/g, ' '); // Normalize whitespace
    }

    /**
     * Get empty schema template
     */
    static getEmptySchema() {
        return {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Your Business Name",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Main Street",
                "addressLocality": "City",
                "addressRegion": "State",
                "postalCode": "12345",
                "addressCountry": "US"
            },
            "telephone": "(555) 123-4567"
        };
    }

    /**
     * Validate generated JSON-LD
     */
    static validate(jsonLd) {
        const errors = [];
        const warnings = [];

        // Check required fields
        if (!jsonLd.name || jsonLd.name.trim() === '') {
            errors.push('Business name is required');
        }

        if (!jsonLd.address || !jsonLd.address.streetAddress) {
            errors.push('Street address is required');
        }

        if (!jsonLd.telephone) {
            errors.push('Phone number is required');
        }

        // Check recommended fields
        if (!jsonLd.url) {
            warnings.push('Website URL is recommended for better SEO');
        }

        if (!jsonLd.openingHoursSpecification) {
            warnings.push('Opening hours help customers find you');
        }

        if (!jsonLd.geo) {
            warnings.push('Geographic coordinates improve local search');
        }

        // Validate address completeness
        if (jsonLd.address) {
            const requiredAddressFields = ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode'];
            requiredAddressFields.forEach(field => {
                if (!jsonLd.address[field]) {
                    errors.push(`Address ${field} is required`);
                }
            });
        }

        // Validate coordinates if present
        if (jsonLd.geo) {
            const { latitude, longitude } = jsonLd.geo;
            if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
                errors.push('Invalid latitude coordinate');
            }
            if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
                errors.push('Invalid longitude coordinate');
            }
        }

        // Validate opening hours format
        if (jsonLd.openingHoursSpecification) {
            jsonLd.openingHoursSpecification.forEach((spec, index) => {
                if (!spec.opens || !spec.closes) {
                    errors.push(`Opening hours specification ${index + 1} missing opens/closes times`);
                }
                
                if (spec.opens && spec.closes && spec.opens >= spec.closes) {
                    errors.push(`Opening hours specification ${index + 1}: opening time must be before closing time`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Format JSON-LD for display with proper indentation
     */
    static format(jsonLd) {
        return JSON.stringify(jsonLd, null, 2);
    }

    /**
     * Minify JSON-LD for production use
     */
    static minify(jsonLd) {
        return JSON.stringify(jsonLd);
    }

    /**
     * Generate HTML script tag with JSON-LD
     */
    static toHtmlScript(jsonLd) {
        const minified = this.minify(jsonLd);
        return `<script type="application/ld+json">\n${this.format(jsonLd)}\n</script>`;
    }

    /**
     * Get supported business types
     */
    static getSupportedBusinessTypes() {
        return [
            'LocalBusiness',
            'Restaurant',
            'Store', 
            'AutoDealer',
            'AutoRepair',
            'BeautySalon',
            'DentistOffice',
            'DryCleaningBusiness',
            'FinancialService',
            'FoodEstablishment',
            'GasStation',
            'HealthAndBeautyBusiness',
            'HomeAndConstructionBusiness',
            'LegalService',
            'Library',
            'LodgingBusiness',
            'MedicalBusiness',
            'ProfessionalService',
            'RealEstateAgent',
            'TravelAgency',
            'VeterinaryCare'
        ];
    }

    /**
     * Generate example data for testing
     */
    static generateExample() {
        return {
            businessName: "Acme Coffee Shop",
            businessType: "Restaurant",
            description: "Artisanal coffee and fresh pastries in downtown",
            phone: "(555) 123-4567",
            website: "https://acmecoffee.com",
            email: "hello@acmecoffee.com",
            streetAddress: "123 Main Street",
            city: "Anytown",
            state: "CA",
            postalCode: "90210",
            country: "US",
            latitude: "34.0522",
            longitude: "-118.2437",
            priceRange: "$$",
            openingHours: {
                monday: { open: "07:00", close: "19:00" },
                tuesday: { open: "07:00", close: "19:00" },
                wednesday: { open: "07:00", close: "19:00" },
                thursday: { open: "07:00", close: "19:00" },
                friday: { open: "07:00", close: "20:00" },
                saturday: { open: "08:00", close: "20:00" },
                sunday: { open: "08:00", close: "18:00" }
            }
        };
    }

    /**
     * Calculate schema completeness score
     */
    static getCompletenessScore(jsonLd) {
        const requiredFields = ['name', 'address', 'telephone'];
        const recommendedFields = ['url', 'email', 'description', 'geo', 'openingHoursSpecification', 'priceRange'];
        
        let score = 0;
        let maxScore = requiredFields.length * 20 + recommendedFields.length * 10;
        
        // Required fields (20 points each)
        requiredFields.forEach(field => {
            if (jsonLd[field]) {
                if (field === 'address') {
                    // Check address completeness
                    const addressFields = ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode'];
                    const completedAddressFields = addressFields.filter(f => jsonLd.address[f]).length;
                    score += (completedAddressFields / addressFields.length) * 20;
                } else {
                    score += 20;
                }
            }
        });
        
        // Recommended fields (10 points each)
        recommendedFields.forEach(field => {
            if (jsonLd[field]) {
                score += 10;
            }
        });
        
        return Math.round((score / maxScore) * 100);
    }
}