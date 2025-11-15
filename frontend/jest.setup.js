import { TextEncoder, TextDecoder } from "util";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Configure act() for React 19
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
