// src/shims/bip32.js
// The BIP32Factory(ecc) call runs at import time. We need to return an object
// that at least has a `.fromBase58()` method that returns something with a `.fingerprint`.
// Again, in a purely browser‐test scenario, we won’t actually use this, so we can return a dummy.

export default function BIP32Factory(ecc) {
  return {
    fromBase58: (_xpub, _network) => {
      return {
        fingerprint: new Uint8Array([0, 0, 0, 0]), // dummy 4‐byte array
        // If your code ever uses `.publicKey`, `.privateKey`, etc., you can stub them here.
      };
    },
    // Other methods can be stubbed if necessary…
  };
}

