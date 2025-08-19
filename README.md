# DJJS Event Reporting System

A modern Angular-based event reporting system for managing ashram data.

## Features

### Login Page
- **Split Layout Design**: Beautiful split-screen layout with portrait image on the left and login form on the right
- **DJJS Branding**: Custom logo and branding elements
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Form Validation**: Comprehensive form validation with error messages
- **Password Toggle**: Show/hide password functionality

### Forgot Password Page
- **Consistent Design**: Matches the login page design for brand consistency
- **Email Validation**: Ensures proper email format before submission
- **Success Feedback**: Clear confirmation when reset instructions are sent
- **Loading States**: Visual feedback during form submission

## Design Elements

### Color Scheme
- **Primary Orange**: #ff6b35 (used for buttons and headings)
- **Dark Gray**: #333 (used for text and labels)
- **Light Gray**: #666 (used for subtitles and secondary text)
- **White**: #fff (used for backgrounds and contrast)

### Typography
- **Primary Font**: Segoe UI (with fallbacks to system fonts)
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Layout
- **Split Screen**: 2:1 ratio (image:form) on desktop
- **Responsive**: Stacks vertically on mobile devices
- **Card Design**: Clean white card with subtle shadows

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Angular CLI (v18 or higher)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `ng serve`
4. Navigate to `http://localhost:4200/auth/login`

### Routes
- **Login**: `/auth/login`
- **Forgot Password**: `/auth/reset-password`

## Customization

### Logo
The custom DJJS logo is located at `src/assets/images/logo.svg` and features:
- Globe with land masses
- Conch shell with flame
- "DIVINE LIGHT WORLD" text
- Sunburst rays in orange/red
- Stylized eyes at the bottom

### Colors
Update the color scheme by modifying the SCSS variables in the component files:
- Primary orange: `#ff6b35`
- Hover states: `#e55a2b`
- Form borders: `#e1e5e9`
- Error colors: `#dc3545`

### Images
Replace the portrait image by updating the `src` attribute in both components:
- Current: `assets/images/profile-img.png`
- Update to your preferred image

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Breakpoints
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## Contributing
1. Follow the existing code style
2. Test on multiple devices and screen sizes
3. Ensure accessibility standards are met
4. Update documentation for any new features

## License
This project is proprietary to DJJS and should not be distributed without permission.
