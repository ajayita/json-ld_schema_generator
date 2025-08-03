# Schema Snap

**JSON-LD Structured Data Generator for Local Businesses**

Schema Snap is a web-based tool that generates Schema.org compliant JSON-LD structured data markup for local businesses through a simple, intuitive form interface. Perfect for improving local SEO and search engine visibility.

## 🚀 Features

- **Easy Form Interface**: Simple form to input business information, location, and operating hours
- **Real-time Preview**: Live JSON-LD preview with syntax highlighting
- **Schema.org Compliant**: Generates valid LocalBusiness structured data markup
- **Geocoding Integration**: Automatic address-to-coordinates conversion
- **Multiple Export Options**: Copy to clipboard or download as JSON/HTML
- **Auto-save**: Form data automatically saved to localStorage
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **No Server Required**: Pure client-side application

## 📋 Supported Schema Properties

- **Required**: @context, @type, name, address, telephone
- **Optional**: url, email, openingHoursSpecification, geo, description, priceRange
- **Nested**: PostalAddress, GeoCoordinates, OpeningHoursSpecification

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Architecture**: Single Page Application (SPA)
- **Styling**: CSS Grid/Flexbox (no external frameworks)
- **APIs**: Browser Geolocation, Geocoding services
- **Standards**: WCAG 2.1 AA accessibility compliance

## 🎯 Performance

- JSON generation: < 100ms response time
- Complete app: < 500KB initial load
- Mobile performance: < 3s load time on 3G

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🏗️ Project Structure

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
    main.css             # Custom CSS styling
  app.js                 # Main application entry point
  index.html             # Single page application
```

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/your-username/schemasnap.git
```

2. Open `src/index.html` in your browser
   - No build process required
   - No dependencies to install
   - Works directly from file system

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Main Site**: [tizonaseo.com](https://tizonaseo.com)
- **Parent Company**: [Bavieca](https://bavieca.io)

## 📞 Support

For support and questions, please visit our main website at [tizonaseo.com](https://tizonaseo.com) or contact us through [Bavieca](https://bavieca.io).

---

Built with ❤️ by the team at [Bavieca](https://bavieca.io)