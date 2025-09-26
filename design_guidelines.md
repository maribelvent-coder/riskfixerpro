# Physical Security Risk Assessment Platform - Design Guidelines

## Design Approach Documentation

**Selected Approach**: Design System (Carbon Design + Linear-inspired patterns)
**Justification**: This is a utility-focused, data-heavy enterprise application where efficiency, clarity, and professional credibility are paramount. Security teams need quick access to complex information with minimal cognitive load.

**Key Design Principles**:
- Professional authority and trustworthiness
- Information hierarchy for quick scanning
- Consistent patterns for repeated workflows
- Dark mode as primary interface (security industry standard)

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (main interface):
- Background: 220 15% 8%
- Surface: 220 15% 12%  
- Border: 220 15% 18%
- Text Primary: 220 15% 95%
- Text Secondary: 220 15% 70%

**Brand Colors**:
- Primary: 210 100% 65% (security blue)
- Success: 142 76% 45% (assessment complete)
- Warning: 38 92% 55% (medium risk)
- Danger: 0 84% 60% (high risk)
- Info: 200 95% 65% (neutral info)

### B. Typography

**Fonts**: Inter (primary), JetBrains Mono (data/codes)
- Headers: Inter 600-700, 24px-32px
- Body: Inter 400-500, 14px-16px  
- Data/Metrics: JetBrains Mono 400, 13px-14px
- Captions: Inter 400, 12px

### C. Layout System

**Spacing Units**: Tailwind 2, 4, 6, 8, 12 (p-2, h-8, m-4, gap-6, etc.)
- Tight spacing (2-4) for data tables and forms
- Medium spacing (6-8) for card separation
- Large spacing (12) for section breaks

### D. Component Library

**Navigation**:
- Sidebar navigation with collapsible sections
- Breadcrumbs for assessment workflow tracking
- Tab navigation for switching between assessment views

**Data Display**:
- Risk score cards with color-coded severity indicators
- Assessment progress bars with completion percentages  
- Data tables with sortable columns and filtering
- Timeline components for assessment history

**Forms**:
- Multi-step assessment forms with progress indicators
- Checkbox/radio groups for risk evaluation criteria
- File upload zones for photo evidence collection
- Auto-saving draft indicators

**Overlays**:
- Modal dialogs for assessment confirmations
- Slide-out panels for detailed risk analysis
- Toast notifications for save states and errors
- Loading states for AI analysis processing

**Core UI Elements**:
- Primary buttons for assessment actions (solid blue)
- Secondary buttons for navigation (outline)
- Danger buttons for critical findings (solid red)
- Icon buttons for quick actions (minimal)

### E. Animations

**Minimal Motion**:
- Subtle fade-ins for loading states only
- Smooth transitions for tab switching (200ms)
- Hover states for interactive elements (no custom animations)
- Progress bar animations for assessment completion

## Images

No large hero images needed. This is a professional tool focused on functionality over visual marketing.

**Imagery Usage**:
- Small icons for risk categories and assessment types
- Document thumbnails for uploaded evidence
- Simple illustrations for empty states
- Placeholder images for photo upload areas

The interface should feel like a sophisticated security command center - clean, information-dense, and built for professionals who need to work quickly and accurately.