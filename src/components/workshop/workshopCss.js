// Card styles for the Innovation Workshop role themes (ws_speaker, ws_organizer, ws_panelist, ws_attendee).
// Added to the card's styles only when one of these themes is showing. They follow the same pattern as the RMC role themes.
export const WS_CSS = `
.mu-card[data-theme^='ws_'] .mu-banner { background: none; animation: none; }
.mu-card[data-theme^='ws_'] .mu-banner::before, .mu-card[data-theme^='ws_'] .mu-banner::after { display: none; }
.mu-card[data-theme^='ws_'] .mu-rmc-pill b { font-size: 11px; letter-spacing: .1em; }

/* Speaker: brightest lime on deep teal */
.mu-card[data-theme='ws_speaker'] .mu-face { background: radial-gradient(380px 260px at 86% 10%, rgba(200,232,58,0.26), transparent 70%), linear-gradient(165deg, #052F31 0%, #0B4A4A 55%, #0E5858 100%); border-color: rgba(200,232,58,0.42); }
.mu-card[data-theme='ws_speaker'] .mu-ring::before { background: conic-gradient(#C8E83A, #1FA58A, #E9F9A8, #C8E83A); }
.mu-card[data-theme='ws_speaker'] .mu-handle, .mu-card[data-theme='ws_speaker'] .mu-tag { color: #C8E83A; border-color: rgba(200,232,58,0.55); background: rgba(200,232,58,0.10); }
.mu-card[data-theme='ws_speaker'] .mu-panel { background: rgba(200,232,58,0.08); border: 1px solid rgba(200,232,58,0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mu-card[data-theme='ws_speaker'] .mu-panel-title { color: #C8E83A; }
.mu-card[data-theme='ws_speaker'] .mu-links > button { color: #C8E83A !important; background-color: rgba(5,47,49,0.78) !important; box-shadow: inset 0 0 0 1.5px rgba(200,232,58,0.65) !important; }
.mu-card[data-theme='ws_speaker'] .mu-primary { background: linear-gradient(120deg, #C8E83A, #7FCB6B); color: #05302F; }
.mu-card[data-theme='ws_speaker'] .mu-ghost { background: rgba(5,47,49,0.85); color: #fff; border: 1.5px solid rgba(200,232,58,0.65); }

/* Organizer: the darkest teal, mint lines */
.mu-card[data-theme='ws_organizer'] .mu-face { background: radial-gradient(380px 260px at 86% 10%, rgba(141,235,194,0.16), transparent 70%), radial-gradient(340px 260px at 0% 100%, rgba(182,224,46,0.12), transparent 70%), linear-gradient(165deg, #031D20 0%, #05323A 55%, #07403F 100%); border-color: rgba(141,235,194,0.4); }
.mu-card[data-theme='ws_organizer'] .mu-ring::before { background: conic-gradient(#8DEBC2, #2FB59A, #B6E02E, #8DEBC2); }
.mu-card[data-theme='ws_organizer'] .mu-handle, .mu-card[data-theme='ws_organizer'] .mu-tag { color: #8DEBC2; border-color: rgba(141,235,194,0.5); background: rgba(141,235,194,0.09); }
.mu-card[data-theme='ws_organizer'] .mu-panel { background: rgba(141,235,194,0.07); border: 1px solid rgba(141,235,194,0.4); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mu-card[data-theme='ws_organizer'] .mu-panel-title { color: #B6E02E; }
.mu-card[data-theme='ws_organizer'] .mu-links > button { color: #8DEBC2 !important; background-color: rgba(3,29,32,0.8) !important; box-shadow: inset 0 0 0 1.5px rgba(141,235,194,0.6) !important; }
.mu-card[data-theme='ws_organizer'] .mu-primary { background: linear-gradient(120deg, #8DEBC2, #B6E02E); color: #03262A; }
.mu-card[data-theme='ws_organizer'] .mu-ghost { background: rgba(3,29,32,0.88); color: #fff; border: 1.5px solid rgba(141,235,194,0.6); }

/* Panelist: light mint with teal and soft green */
.mu-card[data-theme='ws_panelist'] .mu-face { background: radial-gradient(360px 240px at 85% 8%, rgba(255,255,255,0.9), transparent 70%), linear-gradient(170deg, #F1FAEA 0%, #E4F4DC 55%, #D3EBCB 100%); border-color: rgba(14,107,99,0.3); }
.mu-card[data-theme='ws_panelist'] .mu-ring::before { background: conic-gradient(#0E6B63, #8CC63F, #D7EFC4, #0E6B63); }
.mu-card[data-theme='ws_panelist'] .mu-handle { background: rgba(255,255,255,0.9); color: #0B4A4A; border-color: rgba(11,74,74,0.25); }
.mu-card[data-theme='ws_panelist'] .mu-tag { background: rgba(255,255,255,0.78); color: #0B4A4A; border-color: rgba(11,74,74,0.25); }
.mu-card[data-theme='ws_panelist'] .mu-panel { background: rgba(255,255,255,0.55); border: 1px solid rgba(14,107,99,0.35); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mu-card[data-theme='ws_panelist'] .mu-panel-title { color: #0E6B63; }
.mu-card[data-theme='ws_panelist'] .mu-bio, .mu-card[data-theme='ws_panelist'] .mu-meta { color: #0B4A4A; }
.mu-card[data-theme='ws_panelist'] .mu-links > button { color: #fff !important; background-color: #0B4A4A !important; box-shadow: none !important; }
.mu-card[data-theme='ws_panelist'] .mu-primary { background: #0E6B63; color: #fff; }
.mu-card[data-theme='ws_panelist'] .mu-ghost { background: rgba(255,255,255,0.75); color: #0B4A4A; border: 1.5px solid rgba(11,74,74,0.4); }

/* Attendee: fresh and bright, mid teal with lime */
.mu-card[data-theme='ws_attendee'] .mu-face { background: radial-gradient(380px 260px at 84% 12%, rgba(226,255,92,0.28), transparent 70%), linear-gradient(165deg, #0A5F59 0%, #10806C 55%, #17977A 100%); border-color: rgba(226,255,92,0.45); }
.mu-card[data-theme='ws_attendee'] .mu-ring::before { background: conic-gradient(#E2FF5C, #7BE0B5, #FFFFFF, #E2FF5C); }
.mu-card[data-theme='ws_attendee'] .mu-handle, .mu-card[data-theme='ws_attendee'] .mu-tag { color: #E2FF5C; border-color: rgba(226,255,92,0.55); background: rgba(226,255,92,0.12); }
.mu-card[data-theme='ws_attendee'] .mu-panel { background: rgba(255,255,255,0.10); border: 1px solid rgba(226,255,92,0.5); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mu-card[data-theme='ws_attendee'] .mu-panel-title { color: #E2FF5C; }
.mu-card[data-theme='ws_attendee'] .mu-links > button { color: #E2FF5C !important; background-color: rgba(7,70,66,0.8) !important; box-shadow: inset 0 0 0 1.5px rgba(226,255,92,0.65) !important; }
.mu-card[data-theme='ws_attendee'] .mu-primary { background: linear-gradient(120deg, #E2FF5C, #7BE0B5); color: #07403C; }
.mu-card[data-theme='ws_attendee'] .mu-ghost { background: rgba(7,70,66,0.85); color: #fff; border: 1.5px solid rgba(226,255,92,0.6); }
`;
