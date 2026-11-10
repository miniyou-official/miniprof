import { Zap, Flower2, Palette, BookOpen, ShieldHalf, Sunrise, BriefcaseBusiness, Users, Award, Cog } from 'lucide-react';

// One clean icon per look, drawn in that look's own colours, for the design picker.
const ICONS = {
    cyberpunk: Zap,
    anime: Flower2,
    artist: Palette,
    bookreader: BookOpen,
    marvel: ShieldHalf,
    pathways: Sunrise,
    professional: BriefcaseBusiness,
    suitwoman: BriefcaseBusiness,
    community: Users,
    rmc2026: Award,
    ws2026: Cog,
};

// Dark or white icon, whichever reads better on the colour behind it
function inkOn(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#05060A';
    const n = parseInt(m[1], 16);
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.6 ? '#05060A' : '#FFFFFF';
}

export function ThemeIcon({ themeKey, colors, size = 22 }) {
    const Icon = ICONS[themeKey] || Palette;
    const a = colors?.gradientStart || '#1AD1FF';
    const b = colors?.gradientEnd || a;
    return (
        <span
            aria-hidden="true"
            style={{ width: 42, height: 42, borderRadius: 13, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${a}, ${b})`, color: inkOn(a), boxShadow: `0 8px 18px -10px ${a}` }}
        >
            <Icon size={size} strokeWidth={2.2} />
        </span>
    );
}
