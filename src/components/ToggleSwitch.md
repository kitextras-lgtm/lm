# ToggleSwitch Component

A reusable toggle switch component that automatically adapts to the current background theme.

## Usage

```tsx
import { ToggleSwitch } from '../components/ToggleSwitch';

// Basic usage
<ToggleSwitch
  isActive={isEnabled}
  onToggle={() => setIsEnabled(!isEnabled)}
/>

// With theme awareness
<ToggleSwitch
  isActive={isEnabled}
  onToggle={() => setIsEnabled(!isEnabled)}
  backgroundTheme={backgroundTheme} // 'light' | 'grey' | 'dark'
/>

// Different sizes
<ToggleSwitch
  isActive={isEnabled}
  onToggle={() => setIsEnabled(!isEnabled)}
  size="sm" // 'sm' | 'md' (default) | 'lg'
/>

// Disabled state
<ToggleSwitch
  isActive={isEnabled}
  onToggle={() => setIsEnabled(!isEnabled)}
  disabled={true}
/>
```

## Theme-Aware Colors

The component automatically adjusts the active state color based on the background theme:

- **Light theme (Navy)**: `bg-slate-700` when active
- **Grey theme**: `bg-zinc-800` when active  
- **Dark theme (Black)**: `bg-zinc-900` when active
- **Inactive state**: Always `bg-gray-600`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isActive` | `boolean` | - | Whether the toggle is active/on |
| `onToggle` | `() => void` | - | Function called when toggle is clicked |
| `backgroundTheme` | `'light' \| 'grey' \| 'dark'` | `'dark'` | Current background theme |
| `disabled` | `boolean` | `false` | Whether the toggle is disabled |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the toggle |

## Implementation Notes

- The toggle uses a white thumb for all themes for maximum contrast
- Focus ring is white with 20% opacity
- Smooth transitions (200ms) for all state changes
- Disabled state has 50% opacity and no cursor

## Where to Use

This component should be used for all toggle switches across the dashboard:
- Settings toggles (e.g., "Keep sidebar collapsed")
- Feature flags
- Notification preferences
- Any binary on/off setting

## Migration from Old Toggles

Replace old toggle implementations:

```tsx
// OLD
<button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
  isActive ? 'bg-blue-600' : 'bg-gray-600'
}`}>
  <span className={`inline-block h-4 w-4 transform rounded-full bg-white ${
    isActive ? 'translate-x-6' : 'translate-x-1'
  }`} />
</button>

// NEW
<ToggleSwitch
  isActive={isActive}
  onToggle={() => setIsActive(!isActive)}
  backgroundTheme={backgroundTheme}
/>
```
