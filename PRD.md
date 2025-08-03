# Schema Snap MVP - Product Requirements Document

## Product Overview
Schema Snap is a web-based tool that generates local business JSON-LD structured data markup through a simple form interface. The tool produces valid Schema.org LocalBusiness markup for immediate implementation.

## Core Functionality

### 1. Data Input Form
**Required Fields:**
- Business Name (text input)
- Street Address (text input)
- City (text input)
- State/Province (dropdown or text input)
- Postal Code (text input)
- Country (dropdown with common countries)
- Phone Number (text input with format validation)
- Business Type (dropdown with common LocalBusiness subtypes)

**Optional Fields:**
- Website URL (text input with URL validation)
- Email Address (text input with email validation)
- Opening Hours (structured time picker interface)
- Latitude (decimal input)
- Longitude (decimal input)
- Business Description (textarea, 160 char limit)
- Price Range (dropdown: $, $$, $$$, $$$$)

### 2. Opening Hours Interface
- Day-of-week selector (checkboxes for each day)
- Time range pickers for each selected day
- Support for multiple time ranges per day (e.g., lunch break)
- "24/7" toggle option
- "Closed" option for specific days

### 3. Geolocation Features
- "Use My Location" button (browser geolocation API)
- Address-to-coordinates conversion via geocoding API
- Manual lat/long input fields
- Coordinate validation and formatting

### 4. JSON-LD Generation Engine
**Output Requirements:**
- Valid Schema.org LocalBusiness JSON-LD
- Proper escaping of special characters
- Structured data testing tool compliance
- Support for nested properties (address, geo, openingHours)

**Schema Properties to Generate:**
```
@context: https://schema.org
@type: LocalBusiness (or specific subtype)
name
address (PostalAddress object)
telephone
url
email
openingHoursSpecification
geo (GeoCoordinates object)
description
priceRange
```

### 5. Preview Interface
- Real-time JSON-LD preview pane
- Syntax highlighting for JSON
- Collapsible/expandable sections
- Character count indicators
- Validation status indicators

### 6. Export Functionality
- Copy to clipboard button
- Download as .json file
- Download as .html snippet (with script tags)
- "Insert into website" instructions modal

## Technical Specifications

### Frontend Requirements
- Single-page application (SPA)
- Responsive design (mobile-first)
- Real-time form validation
- Progressive enhancement approach
- Accessibility compliance (WCAG 2.1 AA)

### Data Validation
- Phone number format validation (international support)
- URL format validation
- Email format validation
- Coordinate range validation (-90 to 90 lat, -180 to 180 lng)
- Required field validation with clear error messages
- Business hours logic validation (open < close times)

### Performance Requirements
- JSON generation: < 100ms response time
- Form validation: Real-time (on blur/change)
- File size: Complete app < 500KB initial load
- Mobile performance: < 3s load time on 3G

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## User Interface Specifications

### Layout Structure
1. **Header**: Logo, tool name, brief description
2. **Form Section**: Input fields organized in logical groups
3. **Preview Section**: Live JSON-LD preview with controls
4. **Export Section**: Copy/download options with instructions

### Form Organization
**Business Information Group:**
- Name, Type, Description
- Website, Email, Phone, Price Range

**Location Group:**
- Address fields
- Coordinates (with map preview if possible)
- Geolocation button

**Hours Group:**
- Days of week with time pickers
- Special conditions (24/7, closed)

### Interaction Design
- Auto-save form data to localStorage
- Clear form button with confirmation
- Form field focus management
- Loading states for async operations
- Success/error feedback for all actions

## Data Handling

### Input Processing
- Trim whitespace from all text inputs
- Standardize phone number formatting
- Validate and normalize URLs (add https:// if missing)
- Geocode addresses when coordinates not provided
- Handle timezone considerations for opening hours

### Output Generation
- Generate compliant JSON-LD structure
- Escape HTML entities in text fields
- Format coordinates to 6 decimal places
- Structure opening hours in Schema.org format
- Validate output against Schema.org specifications

### Error Handling
- Field-level validation with inline error messages
- Form-level validation summary
- Graceful degradation when geolocation fails
- Fallback behavior when geocoding service unavailable
- Clear error recovery instructions

## Integration Requirements

### Third-Party Services
- Geocoding API (Google Maps, Mapbox, or OpenStreetMap)
- Browser Geolocation API
- JSON-LD validation service integration

### API Considerations
- Rate limiting for geocoding requests
- API key management and rotation
- Fallback geocoding providers
- Offline functionality considerations

## Quality Assurance

### Testing Requirements
- Unit tests for JSON generation logic
- Form validation testing
- Cross-browser compatibility testing
- Mobile device testing
- Accessibility testing with screen readers
- Performance testing under load

### Validation Checks
- Schema.org structured data testing tool validation
- Google Rich Results Test validation
- JSON syntax validation
- Coordinate accuracy verification
- Opening hours format verification

## Technical Constraints

### File Structure
```
/src
  /components
    BusinessForm.js
    PreviewPane.js
    ExportControls.js
  /utils
    jsonld-generator.js
    validators.js
    geocoder.js
  /styles
    main.css
  app.js
  index.html
```

### Development Standards
- ES6+ JavaScript
- CSS Grid/Flexbox for layout
- Semantic HTML5
- Progressive web app considerations
- No external CSS frameworks (custom CSS)
- Minimal JavaScript dependencies

### Security Considerations
- Input sanitization for all user data
- XSS prevention in preview rendering
- Safe JSON parsing and generation
- API key protection
- No server-side data storage required
