# Design Guidelines: أضحيتي (Sheep E-commerce Platform)

## Design Approach
**Reference-Based E-commerce:** Inspired by Airbnb's product showcase and Etsy's warm, trustworthy aesthetic, adapted for Arabic-speaking Islamic market selling livestock for Eid al-Adha.

## Cultural & Language Considerations
- **RTL Layout:** All interfaces flow right-to-left
- **Arabic Typography:** Primary language is Arabic with elegant, readable fonts
- **Cultural Sensitivity:** Design reflects Islamic values and traditions around Eid al-Adha
- **Trust Elements:** Halal certifications, quality assurances prominently displayed

## Typography
**Arabic Fonts (Google Fonts):**
- Primary: 'Noto Sans Arabic' or 'Cairo' - Clean, modern Arabic font
- Headings: 600-700 weight, sizes from text-2xl to text-5xl
- Body: 400-500 weight, text-base to text-lg
- Maintain strong hierarchy with clear size differences

## Layout System
**Spacing Units:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm
- Small gaps/padding: p-2, p-4
- Medium spacing: p-6, p-8
- Large section spacing: py-12, py-16
- Container max-width: max-w-7xl with px-4 padding

## Core Pages & Components

### Public-Facing Pages

**Homepage (Landing):**
- Hero: Full-width image of premium sheep with overlay text announcing "أضحيتي - اختر أضحيتك المثالية" with blurred background CTA button
- Featured Categories: 3-column grid showing sheep types (نعجة، كبش، خروف)
- Featured Products: 4-column grid (2 on tablet, 1 on mobile) with product cards
- Trust Signals: Icons with text showing guarantees (جودة مضمونة، توصيل سريع، شهادة حلال)
- Special Offers Section: Highlighted discounted sheep
- Footer: Contact info, social media, quick links, newsletter signup

**Product Listing Page:**
- Filter Sidebar (collapsible on mobile): Categories, price range, age, weight
- Product Grid: 3-4 columns desktop, 2 tablet, 1 mobile
- Product Cards: Primary image, sheep type badge, price (with discount badge if applicable), brief specs
- Sorting Options: Price, newest, featured

**Product Detail Page:**
- Large Image Gallery: Main carousel with thumbnails below (5-8 images per sheep)
- Product Info Panel: 
  - Sheep name/ID, category badge
  - Price (original + discounted if applicable)
  - Key specifications: Age, weight, breed, health status
  - Detailed description
  - "اطلب الآن" (Order Now) primary CTA
- Trust badges: Halal certified, health checked, quality guaranteed
- Similar Products: 4-column grid below

### Admin Dashboard

**Admin Panel Layout:**
- Top Navigation: Logo, admin name, logout
- Sidebar: Dashboard, Products, Orders, Discounts, Admins, Settings
- Main Content Area: Data tables, forms, statistics

**Products Management:**
- Table View: Image thumbnail, name, category, price, stock status, actions
- Add/Edit Form: Multi-image upload, category select, specs inputs, description textarea
- Bulk Actions: Delete, apply discount

**Orders Management:**
- Order Cards: Customer info, products ordered, total, status dropdown, timestamp
- Filter by status: pending, processing, completed, cancelled

**Discount Management:**
- Create discount: Product selection, percentage/fixed amount, validity dates
- Active Discounts List: Product, discount amount, expiry, toggle active/inactive

**Admin Management:**
- Admin list table: Email, role, date added, remove button
- Add Admin Form: Email input, role selector, add button
- Primary admin (bouazzasalah120120@gmail.com) cannot be removed

## Component Library

**Navigation:**
- Top Bar: Logo (right), main menu (center), user account/cart (left)
- Mobile: Hamburger menu (left for RTL), slide-in navigation

**Product Card:**
- Image container with aspect-ratio-square
- Discount badge (top-left corner): "-20%" in contrasting treatment
- Category badge: Small pill at bottom of image
- Text section: Title, price (strikethrough if discounted), new price

**Buttons:**
- Primary CTA: Rounded corners (rounded-lg), medium padding (px-6 py-3)
- Secondary: Outlined version of primary
- Text buttons: No background, underline on hover

**Forms:**
- Input fields: Rounded borders (rounded-md), consistent height (h-12)
- Labels: Above inputs, text-sm, medium weight
- Required field indicator: Red asterisk
- Error states: Red border, error message below

**Image Gallery:**
- Main viewer: Large display area
- Thumbnail strip: Horizontal scroll with 4-5 visible thumbnails
- Zoom on click/hover

**Trust Badges:**
- Icon + text horizontal layout
- Icons from Heroicons library
- Subtle background (bg-gray-50 equivalent without color reference)

**Data Tables (Admin):**
- Alternating row styling
- Action buttons column (right for RTL)
- Responsive: Stack rows on mobile

## Distinctive Design Element
**Islamic Geometric Pattern Accent:** Subtle geometric pattern overlay (inspired by Islamic architecture) used sparingly:
- Background watermark on hero section
- Section dividers
- Footer background
- Never overwhelming, always subtle and tasteful

## Images Strategy

**Homepage Hero:**
- High-quality image of premium sheep in natural setting
- Image description: "Healthy, well-groomed sheep in pastoral environment, professional photography, warm natural lighting"
- Overlay with semi-transparent dark layer for text readability

**Product Images:**
- Multiple angles per sheep: front, side, close-up of wool quality, full body
- Consistent background: Clean, neutral outdoor or studio setting
- Professional, well-lit photography

**Category Images:**
- Representative sheep for each category
- Badge overlay with category name in Arabic

**Trust Section:**
- Icons only, no photography needed

## Accessibility
- High contrast text-to-background ratios
- Focus indicators on all interactive elements
- Screen reader-friendly Arabic labels
- Keyboard navigation support
- RTL-aware focus order

## Animations
Minimal and purposeful:
- Smooth image carousel transitions
- Gentle hover lift on product cards (transform: translateY(-4px))
- Fade-in for modals/dropdowns
- No distracting scroll animations

This design creates a trustworthy, professional platform specifically tailored for Arabic-speaking customers shopping for Eid al-Adha sacrificial animals, while providing administrators with powerful management tools.