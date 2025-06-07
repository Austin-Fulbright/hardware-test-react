// src/shims/tiny-secp256k1.js
// This stub provides exactly the methods BIP32Factory needs at import time.
// We return a dummy “ecc” object so that bip32.fromBase58().fingerprint won’t crash.
// In practice, we never call getMasterFingerPrint() in the browser, so a dummy is fine.

export default {
  isPoint: () => true,
  validatePublicKey: () => true,
  // Other ecc methods can be stubbed here if called, but for minimal import-time safety:
};

