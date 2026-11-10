// The design as it may be sent to a visitor: a phone number, email or note whose "Save MiniMe" switch is off is removed,
// so a number typed in earlier cannot be read from the page's data.
export function publicDesign(design) {
    const d = design?.details;
    if (!d || typeof d !== 'object') return design;
    const details = { ...d };
    if (d.sharePhone !== true) delete details.phone;
    if (d.shareEmail !== true) delete details.email;
    if (d.shareNote !== true) delete details.note;
    return { ...design, details };
}
