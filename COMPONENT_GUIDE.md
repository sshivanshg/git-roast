# Component Guide — git wrapped

## Quick Reference

### File Structure
```
components/
├── RoastApp.tsx              # Main orchestrator component
├── HeroSection.tsx           # Animated title & subtitle
├── GlassInput.tsx           # Glassmorphic search input
├── BackgroundAtmosphere.tsx # Isometric grid background
├── RecentVictimsTicker.tsx  # Marquee ticker (bottom)
└── RoastCard.tsx            # Result card (existing)
```

---

## Component APIs

### **RoastApp**
Main application entry point. Manages state and orchestrates all subcomponents.

**Props:** None (standalone component)

**Features:**
- Input state management
- API calls to `/api/roast`
- Result display & actions
- Loading states

**Usage:**
```typescript
import RoastApp from "@/components/RoastApp";

export default function Page() {
  return <RoastApp />;
}
```

---

### **HeroSection**
Animated header with title and subtitle.

**Props:** None (self-contained)

**Features:**
- Entrance animations
- Glowing text on "wrapped"
- Decorative line separator

**Customization:**
```typescript
// Edit text directly in component
<motion.h1>git <span className="text-accent-glow">wrapped</span></motion.h1>

// Adjust animation timing
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ delay: 0.1, duration: 0.8 }}
```

---

### **GlassInput**
Glassmorphic input component with integrated button.

**Props:**
```typescript
interface GlassInputProps {
  placeholder: string;           // Placeholder text
  value: string;                 // Current input value
  onChange: (value: string) => void;  // Change handler
  onSubmit: () => void;          // Submit handler
  isLoading: boolean;            // Show loading state
}
```

**Usage:**
```typescript
<GlassInput
  placeholder="Enter username..."
  value={username}
  onChange={setUsername}
  onSubmit={handleRoast}
  isLoading={isLoading}
/>
```

**Features:**
- Focus glow effect
- Enter key submission
- Loading animation
- Hint text below input

**Customization:**
```typescript
// Change button text/icon
{isLoading ? "..." : "roast"}

// Adjust glow color
className="bg-accent-glow text-black"

// Modify focus styling
${
  isFocused
    ? "border-accent-glow/60 shadow-glow-lg"
    : "border-neutral-700/30 shadow-glass-lg"
}
```

---

### **BackgroundAtmosphere**
Canvas-based animated isometric grid background.

**Props:** None (fills viewport)

**Features:**
- Isometric grid with motion
- Radial glow effect
- Responsive canvas
- 60 FPS animation

**Usage:**
```typescript
import { BackgroundAtmosphere } from "@/components/BackgroundAtmosphere";

export default function Layout() {
  return (
    <>
      <BackgroundAtmosphere />
      <main>{/* Your content */}</main>
    </>
  );
}
```

**Customization:**
```typescript
// Grid tile size
const tileSize = 40; // Try 30, 50, 60

// Grid color & opacity
ctx.strokeStyle = "rgba(0, 255, 136, 0.03)"; // RGB, opacity

// Glow intensity
gradient.addColorStop(0, "rgba(0, 255, 136, 0.05)"); // More/less glow

// Animation speed
const offset = (Date.now() * 0.02) % (tileSize * 2); // Change 0.02 to 0.01 (slower) or 0.04 (faster)
```

---

### **RecentVictimsTicker**
Continuous marquee showing recent roasts.

**Props:** None (self-contained)

**Features:**
- Auto-scrolling marquee
- Hover effects
- Fixed bottom positioning
- Glass background

**Usage:**
```typescript
<RecentVictimsTicker />
```

**Customization:**
```typescript
// Edit recent victims list
const victims = [
  { username: "user1", crime: "action 1" },
  { username: "user2", crime: "action 2" }
];

// Adjust scroll duration (seconds)
transition={{ duration: 30 }} // Try 20, 40, 60

// Change colors
className="text-accent-glow" // Use other accent colors
```

---

## Styling Reference

### Tailwind Classes Quick Lookup

#### Backgrounds
- `bg-white/5` — Very subtle white overlay
- `bg-accent-glow/5` — Subtle glow color overlay
- `bg-gradient-to-b from-white/10 to-transparent` — Shine effect

#### Borders
- `border-neutral-700/30` — Subtle border
- `border-accent-glow/60` — Glowing border (focus state)

#### Shadows
- `shadow-glass` — Inner glass shine
- `shadow-glass-lg` — Stronger glass effect
- `shadow-glow` — Subtle glow
- `shadow-glow-lg` — Strong glow

#### Animations
- `animate-rise` — Slide up with fade
- `animate-blink` — Blinking cursor
- `animate-glow-pulse` — Pulsing glow
- `animate-slide-left` — Marquee scroll

#### Text
- `text-accent-glow` — Bright green text
- `text-neutral-500` — Dimmer text
- `text-neutral-600` — Even dimmer
- `font-mono` — Terminal font

---

## Common Patterns

### Loading State
```typescript
{isLoading ? (
  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
    <Spinner />
  </motion.div>
) : (
  <Content />
)}
```

### Focus Ring (Accessibility)
```typescript
className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-glow"
```

### Hover Scale Effect
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Staggered Entrance
```typescript
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
  Content
</motion.div>
```

### Backdrop Blur
```typescript
className="bg-white/5 backdrop-blur-xl rounded-2xl"
```

---

## Framer Motion API Cheatsheet

### Basic Animations
```typescript
// Entrance
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}

// With easing
transition={{ duration: 0.6, ease: "easeOut" }}

// Delayed
transition={{ delay: 0.3 }}

// Repeat
transition={{ repeat: Infinity }}

// Repeat with delay
transition={{ repeat: Infinity, repeatDelay: 1 }}
```

### Hover & Tap
```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### Continuous Animation
```typescript
animate={{ rotate: 360 }}
transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
```

### Conditional Variants
```typescript
<motion.div
  initial={isMobile ? "mobile" : "desktop"}
  animate={isMobile ? "mobile" : "desktop"}
  variants={{
    mobile: { x: 0 },
    desktop: { x: 100 }
  }}
/>
```

---

## Icon Reference (Lucide React)

Used icons in components:
- `ArrowRight` — In button (GlassInput)
- `Download` — Download action button
- `Share2` — Share on X button
- `Copy` / `Check` — Copy link button

**Usage:**
```typescript
import { Download, Share2 } from "lucide-react";

<Download size={16} />
<Share2 size={20} className="text-accent-glow" />
```

---

## Debugging Tips

### Canvas Not Rendering?
1. Check console for errors
2. Verify `canvasRef.current` is not null
3. Ensure `2d` context is available
4. Check if component is in viewport

### Animations Not Smooth?
1. Avoid animating `width`, `height`, `left`, `top` — use `transform` instead
2. Use `opacity` and `transform` for best performance
3. Check if animations are conflicting

### Glow Not Visible?
1. Verify background color is dark enough
2. Check z-index stacking context
3. Ensure `boxShadow` is not being overridden by Tailwind

### Input Not Focusing?
1. Check if input is disabled
2. Verify `onFocus`/`onBlur` handlers
3. Ensure z-index is high enough

---

## Performance Considerations

### Canvas (BackgroundAtmosphere)
- Uses `requestAnimationFrame` for optimal performance
- Relatively lightweight computation
- Can be disabled on low-end devices if needed

### Framer Motion
- GPU-accelerated transforms
- Optimize by using `transform` and `opacity` only
- Avoid animating expensive properties

### Scrollbar Customization
- CSS-only, no performance impact
- Webkit-specific for Chrome/Safari
- Firefox uses `scrollbar-width`

---

## Accessibility Checklist

- [x] Color contrast (WCAG AAA)
- [x] Focus visible states
- [x] Keyboard navigation (Enter to submit)
- [x] Semantic HTML
- [x] Alt text on images (in RoastCard)
- [x] Form labels
- [ ] ARIA labels (can be added)
- [ ] Reduced motion support (can be added)

---

## Next Steps / Enhancement Ideas

1. **Dark/Light Mode Toggle** — Add theme switcher
2. **Reduced Motion Support** — Respect `prefers-reduced-motion`
3. **Share Animations** — Add toast notification on copy
4. **Skeleton Loading** — Show skeleton while fetching
5. **Error Animations** — Better error state feedback
6. **Stats Dashboard** — Show global roasting stats
7. **Dark Mode Variants** — Different accent colors per theme
8. **Mobile Optimization** — Simplify ticker on small screens

---

**Last Updated:** 2026-05-29  
**Version:** 1.0
