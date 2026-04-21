# Design System Strategy: Industrial Innovation

## 1. Overview & Creative North Star: "The Kinetic Foundry"
This design system moves away from static, corporate layouts toward a high-velocity, industrial aesthetic tailored for the Zenith Comp Co. 'Case Opening' experience. Our Creative North Star is **"The Kinetic Foundry."** 

We are not just building a UI; we are crafting a high-tech terminal where software innovation meets physical machinery. Think of the interface as a precision instrument—heavy, metallic, and illuminated by the internal "heat" of the innovation engine. We break the "template" look by utilizing intentional asymmetry, oversized display typography that bleeds off the grid, and layered glass surfaces that mimic a heads-up display (HUD).

## 2. Colors & Surface Philosophy
The palette is rooted in high-contrast "Heat & Carbon" tones. We use the vibrancy of the innovation orange against a deep, multi-layered charcoal environment.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. Structural definition must be achieved through:
*   **Background Shifts:** Contrast a `surface-container-low` section against a `surface` background.
*   **Tonal Transitions:** Use soft, linear gradients of the same hue to define edges.

### Surface Hierarchy & Nesting
Treat the UI as a physical machine. Use the `surface-container` tiers to create "recessed" or "elevated" mechanical parts:
*   **Base Layer:** `surface` (#0a0e14) for the main canvas.
*   **Recessed Modules:** `surface-container-lowest` (#000000) for "well" areas where items are dropped or opened.
*   **Interactive Panels:** `surface-container-high` (#1b2028) for floating HUD elements.

### The "Glass & Gradient" Rule
To capture the "Nutanix Cloud Native" essence, use Glassmorphism for floating overlays. Apply `surface-variant` at 60% opacity with a 20px backdrop-blur. 
*   **Signature Heat:** Apply a subtle radial gradient from `primary` (#ff9159) to `primary-container` (#ff7a2f) on primary interaction points to simulate an industrial glow.

## 3. Typography: The Engineering Font Stack
We pair the technical precision of **Space Grotesk** with the utilitarian clarity of **Manrope**.

*   **Display & Headlines (Space Grotesk):** These are your "Machine Markings." Use `display-lg` for win states and `headline-md` for case titles. The geometry of Space Grotesk should feel like etched serial numbers on industrial hardware.
*   **Titles & Body (Manrope):** High-readability sans-serif for technical specs and prize descriptions. Manrope’s modern proportions keep the "Corporate Tech" side of the event professional.
*   **The Editorial Edge:** In Hero sections, use `display-lg` with `inverse_on_surface` color and a -2% letter-spacing to create a dense, authoritative "Military Tech" feel.

## 4. Elevation & Depth: Tonal Layering
Avoid drop shadows that look like "web shadows." We use **Tonal Layering** to convey physics.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-highest` card atop a `surface-dim` background. This creates a "machined" look where parts are fitted together rather than floating.
*   **Ambient Glow:** When an item is "Legendary" or high-value, use an **Ambient Shadow**. This is a large (40px-60px) blur of the `primary` color at 10% opacity. It should look like the screen is glowing from the item's internal heat.
*   **The "Ghost Border" Fallback:** If a separation is required, use the `outline-variant` token at 15% opacity. It should be felt, not seen.

## 5. Components: The Industrial Toolkit

### Buttons (Power Switches)
*   **Primary:** Solid `primary_container` (#ff7a2f). No rounded corners (use `sm` or `none` scale for an aggressive industrial look). Add a subtle inner-glow on hover using `primary_fixed`.
*   **Secondary:** Glassmorphic. `surface_variant` at 40% opacity with a `ghost-border` of the `primary` color.

### The "Case" Component (Custom)
*   Instead of a standard card, the "Case" uses a `surface_container_highest` background with a subtle metallic texture overlay. 
*   **Forbid Dividers:** Use vertical white space and font-weight shifts to separate the prize name from the rarity level.

### Input Fields (Terminal Inputs)
*   Background: `surface_container_lowest`. 
*   Focus State: The bottom edge glows with a 2px `primary` line; the rest of the field remains borderless.

### Progress Bars (Loading the Innovation)
*   Background: `surface_container_high`.
*   Fill: A striped "hazard" gradient using `primary` and `primary_fixed_dim`.

## 6. Do’s and Don’ts

### Do:
*   **DO** use intentional asymmetry. Align titles to the far left and secondary actions to the far right with significant negative space between.
*   **DO** use "Metallic Textures." A very low-opacity noise texture (2-3%) over `surface` containers adds a premium, physical feel.
*   **DO** use `error` (#ff7351) sparingly for high-alert "Critical Innovation" states.

### Don’t:
*   **DON’T** use standard 8px or 12px rounded corners. This is an industrial game; keep corners sharp (`sm` 2px or `none`) to maintain a "high-tech hardware" vibe.
*   **DON’T** use 100% black (#000000) for text. Always use `on_surface` or `on_surface_variant` to ensure the "glow" of the UI doesn't feel harsh.
*   **DON’T** use traditional horizontal dividers. If you need to separate content, use a 32px gap or a change in `surface-container` depth.

## 7. Motion & Interaction (The Gamified Layer)
*   **Micro-interactions:** When hovering over a "Case," the `surface_container` should transition from `low` to `high` instantly, mimicking a mechanical "click."
*   **The Reveal:** During the case opening, use a `primary` glow that expands from the center, utilizing the `surface_tint` to wash over the background elements momentarily.