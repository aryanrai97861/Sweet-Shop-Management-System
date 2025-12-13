# Sweet Shop Management System - Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based (E-commerce + Dashboard Hybrid)

Drawing inspiration from:
- **Shopify/Etsy**: For product showcase and shopping experience
- **Linear/Notion**: For clean, functional admin interfaces
- **Stripe**: For authentication forms and minimal, trustworthy interactions

**Key Principles**:
- Approachable and inviting for sweet shop browsing
- Efficient and clear for inventory management
- Trust-building for authentication flows
- Responsive and accessible across all devices

---

## Typography System

**Font Families**:
- **Primary**: Inter or DM Sans (body text, UI elements)
- **Accent**: Poppins or Outfit (headings, product names)

**Hierarchy**:
- **H1 (Page Titles)**: 2.5rem (40px), font-weight 700
- **H2 (Section Headers)**: 1.875rem (30px), font-weight 600
- **H3 (Product Names, Card Titles)**: 1.25rem (20px), font-weight 600
- **Body**: 1rem (16px), font-weight 400
- **Small (Labels, Metadata)**: 0.875rem (14px), font-weight 500
- **Buttons**: 0.9375rem (15px), font-weight 600, letter-spacing: 0.02em

---

## Layout System

**Spacing Primitives** (Tailwind Units):
- **Primary scale**: 2, 4, 6, 8, 12, 16
- **Component spacing**: p-4, p-6, p-8
- **Section spacing**: py-12, py-16
- **Gap patterns**: gap-4 (cards), gap-6 (forms), gap-8 (sections)

**Container Widths**:
- **Main Content**: max-w-7xl mx-auto
- **Forms**: max-w-md mx-auto
- **Product Grid**: max-w-6xl mx-auto

**Grid Patterns**:
- **Product Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- **Dashboard Stats**: grid-cols-1 md:grid-cols-3
- **Form Fields**: Single column stacked

---

## Component Library

### Navigation
**Header Navigation**:
- Fixed top navigation with max-w-7xl container
- Logo on left, navigation links center, user menu on right
- Height: h-16
- Padding: px-6
- Links: horizontal flex with gap-8
- User dropdown: Avatar with role badge (Admin/User)

### Authentication Pages
**Login/Register Forms**:
- Centered card layout (max-w-md)
- Card padding: p-8
- Input fields: Full-width with h-12
- Input spacing: space-y-4
- Submit button: Full-width, h-12
- Link to alternate form (Login ↔ Register): text-sm, centered below form
- Form container: Vertical center of viewport

### Dashboard Layout
**Admin Dashboard**:
- Sidebar navigation (w-64) with:
  - Logo/branding at top
  - Navigation items: p-3, rounded-lg
  - Active state: Different visual treatment
  - Admin badge display
- Main content area: flex-1, p-8
- Stats cards at top: Grid of 3-4 key metrics (Total Sweets, Low Stock, etc.)
  - Card structure: p-6, rounded-lg, with icon + number + label

### Product Cards (Sweet Cards)
**Sweet Display Card**:
- Aspect ratio: 4:3 for sweet image container
- Card structure:
  - Image area with rounded-t-lg
  - Content padding: p-4
  - Sweet name: H3 typography
  - Category badge: Inline pill, text-xs, px-2, py-1, rounded-full
  - Price: text-lg, font-semibold
  - Stock indicator: text-sm with quantity
  - Purchase button: Full-width at bottom, h-10
  - Out of stock state: Button disabled with opacity-50

**Grid Layout**:
- Gap between cards: gap-6
- Hover state: Subtle lift effect (translate-y-1)

### Search & Filter Bar
**Filter Interface**:
- Horizontal bar: flex items-center gap-4
- Search input: flex-1, h-12
- Category dropdown: w-48, h-12
- Price range inputs: Two inputs (min/max), each w-32, h-12
- Filter button: h-12, px-6

### Forms (Add/Edit Sweet)
**Admin Forms**:
- Two-column layout on desktop (grid-cols-1 md:grid-cols-2)
- Form padding: p-6
- Field structure:
  - Label: mb-2, font-medium
  - Input: h-12, full-width
  - Textarea (description): h-32
  - Field spacing: mb-6
- Action buttons: Right-aligned, gap-4
  - Cancel: Secondary style
  - Submit: Primary style
  - Both: h-12, px-8

### Data Tables (Admin Inventory View)
**Table Structure**:
- Full-width responsive table
- Headers: bg treatment, font-semibold, p-4
- Rows: p-4, border-b
- Columns: ID, Image (thumbnail 12x12), Name, Category, Price, Stock, Actions
- Actions column: flex gap-2
  - Edit icon button: w-8 h-8
  - Delete icon button: w-8 h-8
  - Restock button: h-8, px-4

### Modals & Overlays
**Confirmation Dialog** (Delete Sweet):
- Centered overlay with backdrop blur
- Modal: max-w-md, p-6, rounded-lg
- Title: H3 typography, mb-4
- Message: text-sm, mb-6
- Actions: flex justify-end gap-3
  - Cancel: Secondary, h-10, px-6
  - Confirm: Destructive style, h-10, px-6

**Purchase Success Modal**:
- Same structure as confirmation
- Success icon at top
- Sweet details displayed
- Single "Continue Shopping" button

### Empty States
**No Sweets / No Results**:
- Centered content
- Illustration or icon: mb-4
- Message: H3 typography
- Subtext: text-sm
- Action button (if applicable): mt-6

### Loading States
**Skeleton Loaders**:
- Product cards: Pulse animation on placeholder rectangles
- Table rows: Animated skeleton matching table structure
- Use sparingly, prefer instant feedback

---

## Accessibility
- All form inputs have associated labels with htmlFor
- Focus states: Ring treatment (ring-2) on all interactive elements
- Button states: Disabled buttons use opacity-50 and cursor-not-allowed
- ARIA labels on icon-only buttons
- Keyboard navigation support throughout
- Minimum touch target: 44x44px (h-12 for most buttons)

---

## Images

**Hero Section** (Public Shopping Page):
- Large hero banner showcasing sweet shop aesthetic
- Height: 400px (h-96) on desktop, 300px (h-72) on mobile
- Content overlay: Centered with backdrop blur on any buttons/text
- Heading + subtext + "Browse Sweets" CTA button

**Sweet Images**:
- Product cards require sweet images
- Use placeholder service (e.g., placeholder.com) for prototype
- Maintain 4:3 aspect ratio
- Alt text required for each sweet

**Empty State Illustrations**:
- Simple SVG icons or illustrations for empty states
- Centered, max-w-xs

**No large hero image required** for authenticated dashboard pages - focus on functionality.

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (base tailwind)
- Tablet: 768px - 1024px (md:)
- Desktop: > 1024px (lg:)

**Key Adaptations**:
- Navigation: Hamburger menu on mobile
- Product grid: 1 column mobile, 2 tablet, 3-4 desktop
- Dashboard: Sidebar collapses to overlay drawer on mobile
- Forms: Single column on mobile, may expand on desktop
- Tables: Horizontal scroll on mobile or card-based alternative

---

This design balances the playful nature of a sweet shop with the functional needs of inventory management, ensuring both customers and administrators have optimal experiences.