# Warehouse Framework v2.0 - Step 5: Loading Dock Grid & Route Registration

**Status:** ✅ Complete  
**Date:** November 21, 2025  
**Components:** LoadingDockGrid Component + Route Registration + Dashboard Integration

---

## 📋 Implementation Summary

Step 5 completes the warehouse security dashboard by implementing a visual grid for loading dock security assessment and registering the warehouse dashboard route in the application.

---

## Part A: Route Registration ✅

### Route Added to App.tsx

**Location:** `client/src/App.tsx`

**Import Added:**
```typescript
import WarehouseDashboard from "@/pages/assessments/WarehouseDashboard";
```

**Route Definition:**
```typescript
<Route path="/app/assessments/:id/warehouse">
  {(params) => (
    <ProtectedAppLayout>
      <WarehouseDashboard />
    </ProtectedAppLayout>
  )}
</Route>
```

**URL Pattern:**
- Path: `/app/assessments/:id/warehouse`
- Example: `/app/assessments/abc123/warehouse`
- Protected: Yes (requires authentication)
- Layout: Uses `ProtectedAppLayout` with sidebar

**Navigation:**
Users can now access the warehouse dashboard by navigating to the warehouse route for any assessment.

---

## Part B: LoadingDockGrid Component ✅

### Component Overview

**Location:** `client/src/components/warehouse/LoadingDockGrid.tsx`

**Purpose:** Display a visual grid of loading docks with color-coded security scores and status indicators

---

### Props Interface

```typescript
interface LoadingDock {
  id: string;
  assessmentId: string;
  dockNumber: string;
  securityScore?: number | null;
  hasCctv: boolean;
  hasMotionSensor?: boolean | null;
  hasAlarm?: boolean | null;
  hasAccessControl?: boolean | null;
  lightingQuality?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LoadingDockGridProps {
  loadingDocks: LoadingDock[];
  onDockClick?: (dock: LoadingDock) => void;
}
```

---

### Visual Design

#### Responsive Grid Layout
```css
grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

**Breakpoints:**
- **Mobile (< 768px):** 2 columns
- **Tablet (768px - 1024px):** 3 columns
- **Desktop (>= 1024px):** 4 columns

#### Color-Coded Borders

| Score Range | Border Color | Meaning |
|-------------|--------------|---------|
| ≥ 80 | Green (`border-green-500`) | Excellent security |
| 50-79 | Yellow (`border-yellow-500`) | Adequate security |
| < 50 | Red (`border-red-500`) | Poor security |
| N/A | Gray (`border-gray-300`) | Not scored yet |

---

### Card Components

Each loading dock is displayed as a `Card` with:

#### 1. Header Section
- **Dock Number** (e.g., "Dock 1", "Bay A")
- **Status Icon:**
  - ✅ Green checkmark (score ≥ 80)
  - ⚠️ Yellow warning (score 50-79)
  - ❌ Red X (score < 50)
  - 🛡️ Gray shield (no score)

#### 2. Content Section

**Security Score Badge:**
- Large, prominent badge showing 0-100 score
- Color-coded:
  - Green variant: score ≥ 80
  - Yellow variant: score 50-79
  - Red variant: score < 50
  - Gray outline: N/A

**Mini Feature Badges:**
Three optional badges appear when features are enabled:

1. **CCTV Badge** (if `hasCctv === true`)
   - 📹 Camera icon + "CCTV" text
   - Primary color background
   - `data-testid="badge-cctv-{id}"`

2. **Sensor Badge** (if `hasMotionSensor === true`)
   - 📊 Activity icon + "Sensor" text
   - Blue color background
   - `data-testid="badge-sensor-{id}"`

3. **Alarm Badge** (if `hasAlarm === true`)
   - 🔔 Bell icon + "Alarm" text
   - Orange color background
   - `data-testid="badge-alarm-{id}"`

#### 3. Footer
- "Security Score" label text
- Centered, muted text

---

### Interaction

**Clickable Cards:**
```typescript
onClick={() => handleDockClick(dock)}
```

**Behavior:**
- Cursor changes to pointer on hover
- Card elevates on hover (`hover-elevate` class)
- Card depresses on click (`active-elevate-2` class)
- Calls `onDockClick` callback if provided
- Falls back to `console.log` if no callback

**Current Implementation in Dashboard:**
```typescript
onDockClick={(dock) => {
  toast({
    title: dock.dockNumber,
    description: `Security Score: ${dock.securityScore || 'N/A'}`,
  });
}}
```

Shows a toast notification with dock info when clicked.

---

### Example Visual Layout

```
┌─────────────────────────────────────────────────┐
│  [DOCK 1]                            ✅          │
│                                                  │
│                   [ 85 ]                         │
│                                                  │
│  [📹 CCTV] [📊 Sensor] [🔔 Alarm]                │
│                                                  │
│              Security Score                      │
└─────────────────────────────────────────────────┘
   ↑ Green border (score ≥ 80)

┌─────────────────────────────────────────────────┐
│  [DOCK 2]                            ⚠️          │
│                                                  │
│                   [ 65 ]                         │
│                                                  │
│  [📹 CCTV]                                       │
│                                                  │
│              Security Score                      │
└─────────────────────────────────────────────────┘
   ↑ Yellow border (score 50-79)

┌─────────────────────────────────────────────────┐
│  [DOCK 3]                            ❌          │
│                                                  │
│                   [ 35 ]                         │
│                                                  │
│  (no security features)                         │
│                                                  │
│              Security Score                      │
└─────────────────────────────────────────────────┘
   ↑ Red border (score < 50)
```

---

## Part C: Dashboard Integration ✅

### Updates to WarehouseDashboard.tsx

#### 1. Import Added
```typescript
import { LoadingDockGrid } from "@/components/warehouse/LoadingDockGrid";
import { Plus } from "lucide-react";
```

#### 2. Loading Dock Section Replaced

**Old Implementation:**
- Placeholder text only
- Static dock count display
- No visual grid

**New Implementation:**
- Conditional rendering based on `loadingDocks.length`
- **If docks exist:** Show `<LoadingDockGrid />`
- **If no docks:** Show empty state with "Add Dock" button

---

### Empty State Design

**When `loadingDocks.length === 0`:**

```typescript
<div className="text-center py-12">
  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
  <p className="font-medium mb-2">No Loading Docks Configured</p>
  <p className="text-sm mb-6">
    Add loading docks to track security metrics and identify vulnerabilities.
  </p>
  <Button variant="default" data-testid="button-add-first-dock">
    <Plus className="h-4 w-4 mr-2" />
    Add Your First Dock
  </Button>
</div>
```

**Features:**
- ✅ Large package icon (muted)
- ✅ Clear messaging
- ✅ Call-to-action button
- ✅ Placeholder action (shows toast for now)

---

### Active State with Docks

**When `loadingDocks.length > 0`:**

```typescript
<LoadingDockGrid
  loadingDocks={loadingDocks}
  onDockClick={(dock) => {
    toast({
      title: dock.dockNumber,
      description: `Security Score: ${dock.securityScore || 'N/A'}`,
    });
  }}
/>
```

**Features:**
- ✅ Passes loading docks array from API
- ✅ Handles click events with toast notifications
- ✅ Responsive grid automatically adjusts columns
- ✅ Color-coded security indicators

---

### Header Enhancement

**Added "Add Dock" Button in Header** (when no docks exist):

```typescript
{loadingDocks.length === 0 && (
  <Button
    variant="outline"
    size="sm"
    data-testid="button-add-dock"
    onClick={() => {
      toast({
        title: 'Add Loading Dock',
        description: 'Loading dock configuration feature coming soon.',
      });
    }}
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Dock
  </Button>
)}
```

Shows in the card header as an additional CTA when empty.

---

## 🎨 UI/UX Features

### Responsive Design
- ✅ Mobile-first grid layout
- ✅ Adjusts columns based on screen size
- ✅ Touch-friendly card sizes
- ✅ Proper spacing with gap-4

### Visual Feedback
- ✅ Hover elevation effect
- ✅ Active depression effect
- ✅ Color-coded borders
- ✅ Status icons
- ✅ Badge color coordination

### Accessibility
- ✅ `data-testid` attributes on all interactive elements
- ✅ Keyboard navigation support
- ✅ Clear visual hierarchy
- ✅ Screen reader friendly labels

---

## 🧪 Test IDs for Automated Testing

### LoadingDockGrid
- `card-dock-{id}` - Dock card container
- `text-dock-number-{id}` - Dock number text
- `badge-score-{id}` - Security score badge
- `badge-cctv-{id}` - CCTV indicator badge
- `badge-sensor-{id}` - Motion sensor badge
- `badge-alarm-{id}` - Alarm badge

### Dashboard Buttons
- `button-add-dock` - Add dock button in header
- `button-add-first-dock` - Add first dock button in empty state

---

## 📊 Data Flow

```
1. API Response → WarehouseAnalysisResponse
   ↓
2. loadingDocks: LoadingDock[]
   ↓
3. Conditional Rendering
   ├─ If length === 0 → Empty State
   └─ If length > 0 → LoadingDockGrid
       ↓
4. Grid renders cards with:
   - Border color based on score
   - Status icon based on score
   - Badge variant based on score
   - Mini badges for enabled features
       ↓
5. User clicks dock
   ↓
6. onDockClick callback fires
   ↓
7. Toast notification shows dock info
```

---

## 🚀 Future Enhancements

### Step 6: Loading Dock CRUD
1. **Add Dock Modal**
   - Form to create new loading dock
   - Fields: dock number, initial security features
   - POST to `/api/assessments/:id/loading-docks`

2. **Edit Dock Modal**
   - Update security features (CCTV, sensors, alarms)
   - Recalculate security score
   - PATCH to `/api/assessments/:id/loading-docks/:dockId`

3. **Delete Dock**
   - Confirmation dialog
   - DELETE to `/api/assessments/:id/loading-docks/:dockId`

### Step 7: Advanced Features
1. **Dock Detail View**
   - Click dock → Opens detail modal/page
   - Shows full security assessment
   - Lists specific vulnerabilities
   - Recommends controls

2. **Bulk Operations**
   - Select multiple docks
   - Apply security controls to multiple docks
   - Batch update security features

3. **Security Score Calculation**
   - Automated scoring based on security features
   - Weighting system for different controls
   - Integration with cargo theft risk analysis

4. **Visual Indicators**
   - Status trends (improving/declining)
   - Recent changes indicator
   - High-risk warning badges

---

## ✅ Completion Checklist

### Part A: Route Registration
- ✅ Import WarehouseDashboard in App.tsx
- ✅ Add route for `/app/assessments/:id/warehouse`
- ✅ Wrap in ProtectedAppLayout
- ✅ Verified route is accessible

### Part B: LoadingDockGrid Component
- ✅ Component created at correct path
- ✅ Props interface defined (LoadingDock, LoadingDockGridProps)
- ✅ Responsive grid layout (2/3/4 columns)
- ✅ Card rendering for each dock
- ✅ Color-coded borders by security score
- ✅ Dock number display
- ✅ Security score badge with color coding
- ✅ Mini badges for CCTV, Sensor, Alarm
- ✅ Clickable cards with onDockClick handler
- ✅ Console.log fallback for clicks
- ✅ Hover and active states implemented
- ✅ Status icons (checkmark, warning, X, shield)
- ✅ All test IDs added

### Part C: Dashboard Integration
- ✅ Import LoadingDockGrid component
- ✅ Replace placeholder with actual grid
- ✅ Pass loadingDocks data from API
- ✅ Implement onDockClick with toast
- ✅ Empty state with "No Docks" message
- ✅ "Add Dock" button (header)
- ✅ "Add Your First Dock" button (empty state)
- ✅ Placeholder toast notifications for add actions
- ✅ Conditional rendering logic
- ✅ Responsive design maintained

---

## 📁 Files Created/Modified

### New Files
- ✅ `client/src/components/warehouse/LoadingDockGrid.tsx` - Grid component

### Modified Files
- ✅ `client/src/App.tsx` - Route registration
- ✅ `client/src/pages/assessments/WarehouseDashboard.tsx` - Integration

### Documentation
- ✅ `docs/warehouse-step5-loading-dock-grid.md` - This file

---

## 🎯 What Works Now

1. **Navigation:** Users can access warehouse dashboard at `/app/assessments/:id/warehouse`
2. **Visual Grid:** Loading docks display in responsive color-coded cards
3. **Security Indicators:** Clear visual feedback for dock security levels
4. **Empty State:** Clean UX when no docks are configured
5. **Interaction:** Clickable docks show toast notifications
6. **Responsive:** Works on all screen sizes (mobile to desktop)

---

## 📝 Example Usage

### Accessing the Dashboard

```typescript
// Navigate to warehouse dashboard for assessment
const assessmentId = 'abc123';
navigate(`/app/assessments/${assessmentId}/warehouse`);
```

### Loading Docks Display

**Example API Response:**
```json
{
  "loadingDocks": [
    {
      "id": "dock-1",
      "dockNumber": "Dock 1",
      "securityScore": 85,
      "hasCctv": true,
      "hasMotionSensor": true,
      "hasAlarm": true
    },
    {
      "id": "dock-2",
      "dockNumber": "Dock 2",
      "securityScore": 62,
      "hasCctv": true,
      "hasMotionSensor": false,
      "hasAlarm": false
    },
    {
      "id": "dock-3",
      "dockNumber": "Bay A",
      "securityScore": 35,
      "hasCctv": false,
      "hasMotionSensor": false,
      "hasAlarm": false
    }
  ]
}
```

**Renders as:**
- Dock 1: Green border, score 85, all three badges (CCTV + Sensor + Alarm)
- Dock 2: Yellow border, score 62, one badge (CCTV only)
- Bay A: Red border, score 35, no security feature badges

---

**Step 5 Implementation Complete!** ✅

The warehouse dashboard now includes a fully functional, visually appealing loading dock security grid with empty state handling and responsive design.
