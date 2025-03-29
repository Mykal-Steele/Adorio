import { verifyToken, optional, admin } from "./verifyToken.js";

// Re-export with consistent naming to support any existing imports
export { verifyToken as protect, optional, admin };
export default verifyToken;
