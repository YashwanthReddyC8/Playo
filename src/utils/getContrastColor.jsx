export function getContrastColor(hex) {
    let c = hex.replace("#", "");
    if (c.length === 3) {
        c = c.split("").map(x => x + x).join("");
    }

    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);

    // Relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.6 ? "text-black" : "text-white";
}