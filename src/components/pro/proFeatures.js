import {
    Palette, Shapes, Tags, MapPin, Sparkles, BarChart3, FileText, Contact, BadgeCheck, Link2, Crown,
} from 'lucide-react';

// What Pro gives. "live" is on the card today; "soon" is being built and is labelled that way everywhere.
export const PRO_FEATURES = [
    { id: 'themes', icon: Palette, title: 'Premium themes', text: 'Armor, Storybook, Studio, Sunrise and more as they arrive.', state: 'live' },
    { id: 'glow', icon: Sparkles, title: 'Animated Pro card', text: 'A glowing ring and a MegaYou badge that set your card apart.', state: 'live' },
    { id: 'shapes', icon: Shapes, title: 'More icon shapes', text: 'Diamond, octagon, shield, squircle and leaf for your link buttons.', state: 'live' },
    { id: 'tags', icon: Tags, title: '6 interests', text: 'Show twice as much of what you are about.', state: 'live' },
    { id: 'where', icon: MapPin, title: 'City and role', text: 'Tell people where you are and what you do at a glance.', state: 'live' },
    { id: 'links', icon: Link2, title: 'Custom link buttons', text: 'Your own colour and shape on every link.', state: 'live' },
    { id: 'stats', icon: BarChart3, title: 'Visitor insights', text: 'See who opens your card and which links they tap.', state: 'live' },
    { id: 'resume', icon: FileText, title: 'Resume on your card', text: 'Attach a PDF so people can download it in one tap.', state: 'live' },
    { id: 'exchange', icon: Contact, title: 'Exchange contacts', text: 'Visitors leave their details; you keep a Connections list.', state: 'soon' },
    { id: 'verified', icon: BadgeCheck, title: 'Verified tick', text: 'A tick once your email is confirmed.', state: 'soon' },
    { id: 'more', icon: Crown, title: 'And what comes next', text: 'Pro members get new things first, at the same price.', state: 'soon' },
];

export const PRO_FAQ = [
    ['Can I cancel any time?', 'Yes. Cancel from the MiniYou Pro tab in your dashboard. You keep Pro until the end of the period you already paid for, and you are not charged again.'],
    ['What happens when Pro ends?', 'Your card keeps working. Your city, role, extra shapes and any tags beyond the first 3 stop showing, but they stay saved. They come back if you renew.'],
    ['Is my payment secure?', 'Payment is handled by Razorpay in its own secure window. MiniYou never sees or stores your card details. The price includes GST.'],
    ['What if a payment fails?', 'No money is taken when a payment fails. You can try again, or use a different way to pay in the same window.'],
];
