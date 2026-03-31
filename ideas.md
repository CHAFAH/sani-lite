# SANI Lite — Design Brainstorming

## Context
SANI Lite is an AI-powered Employee Operating System that replaces HR, payroll, IT, and finance tools. The website needs both a marketing landing page and a working app UI (dashboard). Target aesthetic: Stripe / Notion / Linear quality.

---

<response>
## Idea 1: "Swiss Precision" — Neo-Rationalist Design

<text>

### Design Movement
Inspired by Swiss/International Typographic Style modernized for 2026 — clean grid systems, strong typographic hierarchy, and mathematical precision. Think Linear meets Dieter Rams.

### Core Principles
1. **Typographic Dominance** — Large, bold headlines with extreme weight contrast create visual anchors
2. **Negative Space as Structure** — Generous whitespace defines sections more than borders or backgrounds
3. **Monochromatic Depth** — A near-black and white palette with a single electric accent color
4. **Geometric Consistency** — All elements follow a strict 8px grid with mathematical proportions

### Color Philosophy
- Primary: Deep Ink (#0A0A0B) — authority, trust, sophistication
- Surface: Snow (#FAFAFA) — clean, clinical precision
- Accent: Electric Indigo (#4F46E5) — intelligence, innovation, energy
- Success: Emerald (#059669) — growth, positive metrics
- Muted: Zinc-400 (#A1A1AA) — secondary information hierarchy
- The palette communicates "enterprise-grade yet modern" — avoiding the typical SaaS blue

### Layout Paradigm
- Asymmetric split layouts on landing page (60/40 text-to-visual ratio)
- Full-bleed sections with alternating alignment
- Dashboard uses a compact sidebar with generous content area
- Cards use subtle 1px borders instead of shadows for a flatter, more editorial feel

### Signature Elements
1. **Oversized section numbers** — Large, semi-transparent numerals (01, 02, 03) anchor each landing page section
2. **Animated metric counters** — Numbers that count up with easing when scrolled into view
3. **Dot-grid backgrounds** — Subtle dot patterns on alternating sections for texture

### Interaction Philosophy
Interactions are precise and intentional — no bouncy animations. Hover states use opacity shifts and underline reveals. Transitions are 200ms with ease-out curves. Everything feels snappy and controlled.

### Animation
- Fade-up entrance animations (translateY: 20px → 0, opacity: 0 → 1) with 400ms duration
- Staggered children animations with 80ms delay between items
- Smooth sidebar collapse/expand with width transition
- Chart data animates in sequentially on mount
- No spring physics — all cubic-bezier easing

### Typography System
- Display: "Space Grotesk" (700) — geometric, modern, distinctive
- Body: "Inter" (400, 500) — readable, neutral, professional
- Monospace: "JetBrains Mono" for data/metrics
- Scale: 14px base, 1.5 line-height, modular scale ratio 1.25

</text>
<probability>0.08</probability>
</response>

---

<response>
## Idea 2: "Warm Machine" — Organic Modernism

<text>

### Design Movement
Organic Modernism — blending warm, human-centered aesthetics with technical precision. Think Notion's approachability meets Stripe's polish. Soft, warm tones with purposeful depth.

### Core Principles
1. **Warm Neutrals** — Cream and warm gray tones replace cold whites for a friendlier feel
2. **Layered Depth** — Multiple elevation levels using soft shadows create a tactile, paper-like interface
3. **Rounded Geometry** — Generous border-radius and pill shapes soften the technical nature of HR software
4. **Illustration-Forward** — Abstract, organic shapes and gradients add personality

### Color Philosophy
- Background: Warm Cream (#FEFCF8) — approachable, human, not sterile
- Surface: Pure White (#FFFFFF) — elevated cards float above the warm base
- Primary: Deep Teal (#0D9488) — trust, growth, calm authority (avoids generic blue)
- Secondary: Warm Amber (#F59E0B) — energy, optimism, highlights
- Text: Warm Charcoal (#1C1917) — softer than pure black
- The palette says "we're enterprise software that doesn't feel like enterprise software"

### Layout Paradigm
- Landing page uses a magazine-style layout with overlapping elements and offset grids
- Hero section with a large gradient orb floating behind the headline
- Feature cards in a staggered masonry-like arrangement
- Dashboard uses a warm sidebar with rounded navigation items and avatar-forward design
- Content areas use card stacks with varying sizes

### Signature Elements
1. **Gradient orbs** — Large, soft, blurred gradient circles (teal-to-amber) floating behind key sections
2. **Pill-shaped badges** — Status indicators and tags use pill shapes with pastel backgrounds
3. **Hand-drawn accent lines** — Subtle wavy underlines beneath key headlines for a human touch

### Interaction Philosophy
Interactions feel alive and responsive — buttons scale slightly on hover (1.02), cards lift with shadow increase, and elements have a gentle bounce. The interface rewards exploration with micro-delights.

### Animation
- Spring-based entrance animations (stiffness: 100, damping: 15) for a natural feel
- Cards scale up 2% on hover with shadow deepening
- Page transitions use a gentle crossfade (300ms)
- Sidebar items have a sliding highlight indicator
- Gradient orbs slowly drift with a CSS animation (60s loop)
- Charts animate with spring physics for a playful data reveal

### Typography System
- Display: "Instrument Serif" (400) — elegant, distinctive, warm
- Headings: "DM Sans" (500, 700) — geometric but friendly
- Body: "DM Sans" (400) — clean and readable
- Scale: 16px base, 1.6 line-height, perfect fourth ratio (1.333)

</text>
<probability>0.06</probability>
</response>

---

<response>
## Idea 3: "Dark Signal" — Premium Dark Interface

<text>

### Design Movement
Premium Dark UI — inspired by Vercel, Raycast, and Linear's dark modes. A dark-first design that communicates technical sophistication and premium quality. The darkness isn't just aesthetic — it reduces cognitive load for power users.

### Core Principles
1. **Dark Canvas** — Rich dark backgrounds with carefully calibrated gray levels for depth
2. **Luminous Accents** — Bright, saturated accent colors pop against dark surfaces
3. **Glass Morphism** — Frosted glass effects and subtle transparency create layered depth
4. **Data Density** — Compact, information-rich layouts that respect power users

### Color Philosophy
- Background: Near-Black (#09090B) — deep, immersive, premium
- Surface: Dark Zinc (#18181B) — elevated panels with subtle distinction
- Border: Zinc-800 (#27272A) — barely visible structure lines
- Primary: Violet (#8B5CF6) — creative, innovative, stands out on dark
- Accent: Cyan (#06B6D4) — data visualization, secondary actions
- Success: Lime (#84CC16) — vibrant positive indicators on dark
- Text: Zinc-100 (#F4F4F5) — high contrast but not pure white
- The palette communicates "cutting-edge tech platform" — this is software for the future

### Layout Paradigm
- Landing page uses full-viewport sections with dramatic reveals on scroll
- Hero has a large code-editor-style window showing the product, floating on a gradient mesh
- Features displayed in a horizontal scroll carousel with large preview cards
- Dashboard uses a slim, icon-first sidebar with tooltips
- Content uses a bento-grid layout with varying card sizes for visual interest

### Signature Elements
1. **Gradient mesh backgrounds** — Subtle, animated gradient meshes (violet-to-cyan) behind hero sections
2. **Glow effects** — Buttons and active elements emit a soft colored glow
3. **Terminal-style metrics** — Key numbers displayed in monospace with a blinking cursor effect

### Interaction Philosophy
Interactions feel electric and responsive. Hover states trigger glow intensification, borders light up, and elements have a subtle pulse. The interface feels alive, like a control panel for the future of work.

### Animation
- Smooth fade-in-up with 500ms duration and ease-out
- Glow pulse on hover (box-shadow animation, 200ms)
- Staggered grid item reveals with 60ms delays
- Sidebar icons have a subtle bounce on active state
- Charts use sequential line-draw animations
- Background gradient mesh slowly morphs (120s CSS animation loop)

### Typography System
- Display: "Outfit" (700, 800) — modern geometric sans with character
- Body: "Outfit" (300, 400) — light weights for elegance on dark backgrounds
- Monospace: "Fira Code" for metrics and data points
- Scale: 15px base, 1.5 line-height, major third ratio (1.25)

</text>
<probability>0.07</probability>
</response>

---

## Selected Approach: Idea 2 — "Warm Machine" (Organic Modernism)

**Rationale:** For an HR platform that needs to feel approachable yet professional, the Warm Machine approach strikes the best balance. HR software users spend hours in these interfaces — warm tones reduce fatigue, organic shapes feel human-centered (perfect for a people platform), and the layered depth creates a premium feel without the coldness of dark mode or the austerity of Swiss rationalism. The teal + amber accent combination is distinctive and avoids the oversaturated SaaS blue that HiBob and competitors use.
