# UI Context

## Theme

DuroNet operates strictly in Dark Mode. The design language is a sleek, "tech-forward" workspace. It uses cool, dark slate backgrounds to reduce eye strain, layered surfaces to establish data hierarchy, and vibrant emerald and teal accents to signal health, momentum, and success.

## Colors

All components must use these CSS custom property tokens. No hardcoded hex values are permitted in the component files.

| Role            | CSS Variable         | Value     | Notes |
| --------------- | -------------------- | --------- | ----- |
| Page background | `--bg-base`          | `#0f172a` | Cool slate dark |
| Surface         | `--bg-surface`       | `#1e293b` | Slightly lighter slate |
| Primary text    | `--text-primary`     | `#f8fafc` | Off-white |
| Muted text      | `--text-muted`       | `#94a3b8` | Slate gray |
| Primary accent  | `--accent-emerald`   | `#10b981` | Vibrant Emerald |
| Secondary accent| `--accent-teal`      | `#14b8a6` | Bright Teal |
| Border          | `--border-default`   | `#334155` | |
| Error/Critical  | `--state-error`      | `#ef4444` | Red |
| Warning/Risk    | `--state-warning`    | `#f59e0b` | Amber |
| Success/Stable  | `--state-success`    | `#10b981` | Maps to primary Emerald |

## Typography

| Role      | Font              | Variable      |
| --------- | ----------------- | ------------- |
| UI text   | Geist Sans        | `--font-sans` |
| Code/mono | Geist Mono        | `--font-mono` |

## Border Radius

To maintain a sharp, technical, and modern SaaS feel:

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-sm`  |
| Cards / panels    | `rounded-md`  |
| Modals / overlays | `rounded-lg`  |

## Component Library

This project uses **shadcn/ui** built on top of Tailwind CSS.
- Components live in `components/ui/`.
- Use the shadcn CLI to add new primitives rather than writing core interactive elements from scratch.
- Primary CTA buttons use `--accent-emerald`. Secondary actions or data visualizations lean on `--accent-teal`.