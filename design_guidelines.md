# FYNDO Design Guidelines

## Design Approach: Material Design Mobile-First

**Rationale**: Material Design is ideal for this utility-focused, mobile-optimized PWA. Its emphasis on tactile interactions, clear visual feedback, and information density perfectly suits agricultural workers who need efficient, reliable functionality on smartphones.

**Key Principles**:
- Mobile-first responsive design (320px minimum, optimized for 375px-414px)
- Touch-friendly targets (minimum 48x48px for all interactive elements)
- Clear visual hierarchy for quick information scanning
- Purposeful elevation and depth for navigation clarity

---

## Typography System

**Font Family**: 
- Primary: Inter (via Google Fonts) - excellent readability on mobile screens
- Headings: Inter SemiBold/Bold
- Body: Inter Regular/Medium

**Type Scale**:
- H1 (Page Headers): 28px / SemiBold / leading-tight
- H2 (Section Headers): 22px / SemiBold / leading-snug  
- H3 (Card Headers): 18px / SemiBold / leading-normal
- Body Large: 16px / Regular / leading-relaxed
- Body: 14px / Regular / leading-relaxed
- Caption/Metadata: 12px / Medium / leading-normal
- Button Text: 15px / SemiBold / tracking-wide uppercase

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4 or p-6
- Section spacing: gap-4 or gap-6
- Card margins: m-4
- Icon spacing: gap-2 or gap-3
- Form field spacing: space-y-4

**Container Strategy**:
- Mobile: px-4 (16px side margins)
- Tablet: px-6 
- Desktop: max-w-6xl mx-auto px-8

**Grid System**:
- Job cards/listings: Single column on mobile (< 768px)
- Associate profiles: 2-column grid on tablet+ (md:grid-cols-2)
- Dashboard metrics: 2x2 grid on mobile, 4-column on desktop

---

## Navigation Architecture

**Bottom Tab Navigation** (Primary):
- Fixed bottom bar with 4 main tabs
- Icons + labels for clarity
- Active state with Material elevation effect
- Tabs: Dashboard | Jobs | Profile | More

**Top App Bar**:
- Height: h-14 (56px - Material standard)
- Logo/Title left-aligned
- Action icons right-aligned (notifications, menu)
- Shadow elevation when scrolled

---

## Component Library

### Cards (Primary Content Container)
**Job Post Cards**:
- Rounded corners: rounded-lg
- Padding: p-4
- Shadow: Material elevation level 2
- Header: Service type + Date (H3 + Caption)
- Body: Duration, Associates needed, Budget (body text)
- Footer: Action buttons or status badges
- Divider between header/body/footer: border-t with subtle treatment

**Associate Profile Cards**:
- Avatar: 48x48px circular
- Name + Rating (stars inline)
- Skill badges as chips
- Hourly rate prominent (Body Large)
- "Express Interest" button: full-width, h-12

**Dashboard Metric Cards**:
- Centered layout
- Large numeric value (H1)
- Label below (Caption)
- Icon above number (24x24px)
- Padding: p-6

### Forms

**Multi-Step Job Posting**:
- Step indicator at top (1/5, 2/5, etc.) with progress bar
- Single field focus per step when possible
- Large touch targets for selections
- Next/Back buttons: fixed bottom position, h-12

**Input Fields**:
- Height: h-12 (48px touch target)
- Rounded: rounded-md
- Padding: px-4
- Label: Caption size, mb-2
- Helper text/errors: Caption, mt-1
- Focus state: Material outline effect

**Buttons**:
- Primary: h-12, rounded-lg, full-width on mobile
- Secondary: h-12, rounded-lg, outlined variant
- Text buttons: h-10, no background
- Icon buttons: 48x48px circular hit area

**Selection Controls**:
- Checkboxes/Radio: 24x24px with 48x48px touch area
- Switches: Material toggle design
- Sliders: h-12 total touch area
- Dropdowns: h-12, chevron icon right

### Lists & Data Display

**Job Listings**:
- Each item: p-4, border-b divider
- Left: Service icon (24x24px)
- Center: Job details (multi-line)
- Right: Chevron or action button
- Swipe actions for mobile (optional delete/archive)

**Reviews Section**:
- Avatar + Name + Rating (horizontal)
- Date (Caption)
- Review text (Body)
- Spacing: py-4 between reviews

### Interactive Elements

**Badges/Chips**:
- Skill level badges: px-3 py-1, rounded-full, Caption text
- Status indicators: px-2 py-1, rounded, inline

**Action Sheets** (Mobile-Optimized):
- Slide up from bottom
- Rounded top corners: rounded-t-xl
- Options with 56px height each
- Cancel button separated with divider

**Modals/Dialogs**:
- Mobile: Full-screen with slide-up animation
- Tablet+: Centered, max-w-lg, rounded-lg
- Close button: top-right, 48x48px target

### Maps Integration
- Location Picker: Full-screen map view
- Current location fab button: bottom-right, 56x56px circular
- Search bar: fixed top, h-12
- Confirm button: fixed bottom, h-12

### Payment Interface
- Summary card: itemized list with dividers
- Payment method selector: Radio buttons with icons
- Total: prominent (H2), separated with thick divider
- Pay button: h-14, full-width, Material elevation on press

---

## Images

**Profile Avatars**:
- Farmers/Associates: 48x48px in cards, 96x96px in full profile
- Placeholder: Initials on solid background

**No Hero Images**: This is a utility app - launch directly into functionality

**Service Type Icons**:
- Use Material Icons via CDN
- 24x24px in cards, 32x32px in selection grids
- Icons for: Ploughing, Harvesting, Sowing, Irrigation, etc.

---

## Responsive Breakpoints

- Mobile: < 768px (default)
- Tablet: 768px - 1024px
- Desktop: > 1024px (max-w-6xl container)

---

## Accessibility

- Minimum 4.5:1 text contrast ratios
- Focus indicators on all interactive elements (2px outline)
- ARIA labels for icon-only buttons
- Touch targets never smaller than 48x48px
- Screen reader support for status updates

---

## PWA-Specific Features

**Installable Prompt**: Modal with app icon, name, and "Add to Home Screen" instructions

**Offline Indicator**: Toast notification at top when offline, persistent banner if critical functionality affected

**Loading States**: Material circular progress indicators, skeleton screens for lists