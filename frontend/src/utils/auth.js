const decodeJwtPayload = (token) => {
    const parts = token?.split(".");
    if (!parts || parts.length !== 3) return null;

    try {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        const decoded = atob(padded);
        return JSON.parse(decoded);
    } catch (e) {
        return null;
    }
};

export const isSessionValid = (token, user) => {
    if (!token || !user) return false;

    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return false;
    if (Date.now() >= payload.exp * 1000) return false;

    const tokenUsername = payload.username || payload.sub;
    return Boolean(tokenUsername) && tokenUsername === user.name;
};
