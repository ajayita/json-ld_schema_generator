# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Schema Snap is a web-based tool that generates local business JSON-LD structured data markup through a simple form interface. This is a single-page application (SPA) built with vanilla JavaScript and custom CSS.

## Planned Architecture

Based on the PRD.md specifications, the project will follow this structure:

```
/src
  /components
    BusinessForm.js        # Main form with business info, location, and hours
    PreviewPane.js         # Real-time JSON-LD preview with syntax highlighting
    ExportControls.js      # Copy/download functionality
  /utils
    jsonld-generator.js    # Core JSON-LD generation engine
    validators.js          # Form validation logic
    geocoder.js           # Address-to-coordinates conversion
  /styles
    main.css             # Custom CSS (no external frameworks)
  app.js                 # Main application entry point
  index.html             # Single page application
```

## Development Standards

- **JavaScript**: ES6+ features, minimal external dependencies
- **CSS**: CSS Grid/Flexbox for layout, no external CSS frameworks
- **HTML**: Semantic HTML5 with accessibility compliance (WCAG 2.1 AA)
- **Architecture**: Progressive web app considerations, client-side only (no server)

## Key Technical Requirements

### JSON-LD Generation
- Must generate valid Schema.org LocalBusiness markup
- Support nested properties: address (PostalAddress), geo (GeoCoordinates), openingHoursSpecification
- Required Schema properties: @context, @type, name, address, telephone
- Optional: url, email, openingHoursSpecification, geo, description, priceRange

### Form Validation
- Real-time validation on blur/change events
- Phone number format validation (international support)
- URL/email format validation
- Coordinate range validation (-90 to 90 lat, -180 to 180 lng)
- Business hours logic validation (open < close times)

### Performance Targets
- JSON generation: < 100ms response time
- Complete app: < 500KB initial load
- Mobile performance: < 3s load time on 3G

### Browser Support
- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Core Features to Implement

1. **Business Information Form**: Name, type, description, contact details
2. **Location Input**: Address fields with geocoding API integration
3. **Opening Hours Interface**: Day/time pickers with multiple ranges per day
4. **Geolocation Integration**: Browser geolocation API and address-to-coordinates
5. **Real-time Preview**: Live JSON-LD preview with syntax highlighting
6. **Export Options**: Copy to clipboard, download as .json or .html snippet

## Data Handling

- Auto-save form data to localStorage
- Trim whitespace and normalize inputs (URLs, phone numbers)
- Escape HTML entities in JSON output
- Handle timezone considerations for opening hours
- Format coordinates to 6 decimal places

## Security Considerations

- Input sanitization for all user data
- XSS prevention in preview rendering
- Safe JSON parsing and generation
- No server-side data storage (client-side only)

## Integration Requirements

- Geocoding API (Google Maps, Mapbox, or OpenStreetMap)
- Browser Geolocation API
- Schema.org structured data validation
- Rate limiting for geocoding requests