// Opens the MiniYou Pro tab in the dashboard from anywhere inside it (theme lock, "Go Pro", the Pro-ending notice).
// The dashboard listens for this and shows the tab, where the price and the pay button are.
export const OPEN_PRO_EVENT = 'miniyou:open-pro';

export function openProTab() {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_PRO_EVENT));
}

// A visitor who is not logged in is sent to log in first. This remembers they wanted Pro, so the dashboard opens that tab afterwards.
export const PRO_INTENT_KEY = 'miniyou:wants-pro';
