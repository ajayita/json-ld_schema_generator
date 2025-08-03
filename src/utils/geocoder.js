/**
 * Geocoding utilities for address-to-coordinates conversion
 * Uses multiple providers with fallbacks for reliability
 */

export class Geocoder {
    constructor() {
        this.providers = [
            { name: 'nominatim', url: 'https://nominatim.openstreetmap.org/search', key: null },
            // Add more providers as needed
        ];
        this.cache = new Map();
        this.rateLimit = {
            nominatim: { requests: 0, resetTime: 0, limit: 1 } // 1 request per second for Nominatim
        };
    }

    /**
     * Geocode an address to coordinates
     */
    async geocode(address) {
        if (!address || typeof address !== 'string') {
            throw new Error('Valid address string is required');
        }

        const normalizedAddress = this.normalizeAddress(address);
        
        // Check cache first
        if (this.cache.has(normalizedAddress)) {
            return this.cache.get(normalizedAddress);
        }

        // Try providers in order
        for (const provider of this.providers) {
            try {
                const result = await this.geocodeWithProvider(provider, normalizedAddress);
                if (result) {
                    // Cache successful result
                    this.cache.set(normalizedAddress, result);
                    return result;
                }
            } catch (error) {
                console.warn(`Geocoding with ${provider.name} failed:`, error.message);
                continue;
            }
        }

        throw new Error('Unable to geocode address with any available provider');
    }

    /**
     * Geocode using a specific provider
     */
    async geocodeWithProvider(provider, address) {
        // Check rate limits
        if (!this.checkRateLimit(provider.name)) {
            throw new Error(`Rate limit exceeded for ${provider.name}`);
        }

        switch (provider.name) {
            case 'nominatim':
                return await this.geocodeNominatim(address);
            default:
                throw new Error(`Unknown provider: ${provider.name}`);
        }
    }

    /**
     * Geocode using OpenStreetMap Nominatim
     */
    async geocodeNominatim(address) {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', address);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '1');
        url.searchParams.set('addressdetails', '1');

        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'Schema Snap App (https://github.com/example/schemasnap)'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data || data.length === 0) {
            return null;
        }

        const result = data[0];
        
        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            formatted_address: result.display_name,
            components: this.parseNominatimComponents(result.address),
            accuracy: this.estimateAccuracy(result),
            provider: 'nominatim'
        };
    }

    /**
     * Parse address components from Nominatim response
     */
    parseNominatimComponents(address) {
        if (!address) return {};

        return {
            street_number: address.house_number || '',
            street_name: address.road || address.pedestrian || '',
            city: address.city || address.town || address.village || address.hamlet || '',
            state: address.state || address.region || '',
            postal_code: address.postcode || '',
            country: address.country || '',
            country_code: address.country_code ? address.country_code.toUpperCase() : ''
        };
    }

    /**
     * Estimate accuracy of geocoding result
     */
    estimateAccuracy(result) {
        const type = result.type || '';
        const osmType = result.osm_type || '';
        
        // Rough accuracy estimation based on result type
        if (type.includes('house') || osmType === 'node') {
            return 'high'; // Building level
        } else if (type.includes('street') || type.includes('road')) {
            return 'medium'; // Street level
        } else {
            return 'low'; // City/area level
        }
    }

    /**
     * Check rate limits for provider
     */
    checkRateLimit(providerName) {
        const limit = this.rateLimit[providerName];
        if (!limit) return true;

        const now = Date.now();
        
        // Reset counter if time window has passed
        if (now >= limit.resetTime) {
            limit.requests = 0;
            limit.resetTime = now + 1000; // 1 second window
        }

        // Check if under limit
        if (limit.requests >= limit.limit) {
            return false;
        }

        limit.requests++;
        return true;
    }

    /**
     * Normalize address for consistent caching
     */
    normalizeAddress(address) {
        return address
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s]/g, ''); // Remove special characters
    }

    /**
     * Build address string from form components
     */
    static buildAddressString(formData) {
        const parts = [];
        
        if (formData.streetAddress) parts.push(formData.streetAddress);
        if (formData.city) parts.push(formData.city);
        if (formData.state) parts.push(formData.state);
        if (formData.postalCode) parts.push(formData.postalCode);
        if (formData.country) parts.push(formData.country);
        
        return parts.join(', ');
    }

    /**
     * Reverse geocode coordinates to address
     */
    async reverseGeocode(latitude, longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
            throw new Error('Valid latitude and longitude are required');
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new Error('Coordinates are out of valid range');
        }

        const cacheKey = `${lat},${lng}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const url = new URL('https://nominatim.openstreetmap.org/reverse');
        url.searchParams.set('lat', lat.toString());
        url.searchParams.set('lon', lng.toString());
        url.searchParams.set('format', 'json');
        url.searchParams.set('addressdetails', '1');

        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'Schema Snap App (https://github.com/example/schemasnap)'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data || data.error) {
            throw new Error('No address found for these coordinates');
        }

        const result = {
            formatted_address: data.display_name,
            components: this.parseNominatimComponents(data.address),
            provider: 'nominatim'
        };

        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * Validate coordinates
     */
    static validateCoordinates(latitude, longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        
        const errors = [];
        
        if (isNaN(lat)) {
            errors.push('Latitude must be a valid number');
        } else if (lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90');
        }
        
        if (isNaN(lng)) {
            errors.push('Longitude must be a valid number');
        } else if (lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            coordinates: errors.length === 0 ? { latitude: lat, longitude: lng } : null
        };
    }

    /**
     * Calculate distance between two points
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }

    /**
     * Convert degrees to radians
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Clear geocoding cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            providers: Object.keys(this.rateLimit)
        };
    }

    /**
     * Test geocoding with sample address
     */
    async test() {
        try {
            const result = await this.geocode('1600 Amphitheatre Parkway, Mountain View, CA');
            console.log('Geocoding test successful:', result);
            return true;
        } catch (error) {
            console.error('Geocoding test failed:', error);
            return false;
        }
    }
}

// Create singleton instance
export const geocoder = new Geocoder();