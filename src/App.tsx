import React, { useState } from "react";
import "./App.css";

// Pull in exactly what you need from jadets:
import {
  Jade,
  JadeInterface,
  SerialTransport,
  base64ToBytes,
  bytesToBase64,
} from "jadets";

const PSBT_STRING = `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`;

function App() {
  const [status, setStatus] = useState<string>("Disconnected");
  const [version, setVersion] = useState<any | null>(null);
  const [jadeClient, setJadeClient] = useState<Jade | null>(null);
  const [signedpsbt, setSignedpsbt] = useState<string | null>(null);

  // When the user clicks “Connect to Jade”
  const connect = async () => {
    try {
      setStatus("Instantiating transport…");
      // 1. SerialTransport will itself do all the WebSerial work internally.
      const transport = new SerialTransport({});

      setStatus("Building JadeInterface…");
      const ijade = new JadeInterface(transport);

      setStatus("Creating Jade client…");
      const client = new Jade(ijade);

      setStatus(
        "Calling client.connect() (SerialTransport will request port)…"
      );
      // 2. This single call asks for permission, opens port at 115200, does any handshakes.
      await client.connect();

      setJadeClient(client);
      setStatus("Connected to Jade");
    } catch (err: any) {
      console.error(err);
      setStatus("Connect failed: " + (err.message || err.toString()));
    }
  };

  // Authenticate button handler
  const authenticate = async () => {
    if (!jadeClient) return;

    try {
      setStatus("Authenticating Jade…");

      const httpRequestFn = async (params: any): Promise<{ body: any }> => {
        const url = params.urls[0];
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params.data),
        });
        if (!response.ok) {
          throw new Error("HTTP request failed in authUser");
        }
        return { body: await response.json() };
      };

      // Replace "testnet" with "mainnet" if you're on mainnet
      const unlockResult = await jadeClient.authUser("testnet", httpRequestFn);
      if (unlockResult !== true) {
        throw new Error("Failed to unlock Jade device");
      }

      setStatus("Jade authenticated");
    } catch (err: any) {
      console.error(err);
      setStatus("Authentication failed: " + (err.message || err.toString()));
    }
  };

  // Ping button handler
  const ping = async () => {
    if (!jadeClient) return;
    try {
      setStatus("Pinging Jade…");
      const p = await jadeClient.ping();
      setStatus("Ping response: " + p);
    } catch (err: any) {
      console.error(err);
      setStatus("Ping failed: " + (err.message || err.toString()));
    }
  };

  // Get Version button handler
  const getVersion = async () => {
    if (!jadeClient) return;
    try {
      setStatus("Fetching version info…");
      const info = await jadeClient.getVersionInfo();
      setVersion(info);
      setStatus("Version info fetched");
    } catch (err: any) {
      console.error(err);
      setStatus("Failed to get version: " + (err.message || err.toString()));
    }
  };

  // Sign Transaction button handler
  const signTransaction = async () => {
    if (!jadeClient) return;
    try {
      setStatus("Signing PSBT…");
      const PSBT_ARRAY = base64ToBytes(PSBT_STRING);
      const signed = await jadeClient.signPSBT("testnet", PSBT_ARRAY);
      const psbtString = bytesToBase64(signed);
      setSignedpsbt(psbtString);
      console.log("Signed PSBT (base64):", psbtString);
      setStatus("PSBT signed successfully");
    } catch (err: any) {
      console.error(err);
      setStatus("Failed to sign PSBT: " + (err.message || err.toString()));
    }
  };

  return (
    <div className="App">
      <h1>Jade WebSerial Demo (via SerialTransport)</h1>
      <p>
        <strong>Status:</strong> {status}
      </p>

      <button onClick={connect} disabled={!!jadeClient}>
        Connect to Jade
      </button>
      <button onClick={authenticate} disabled={!jadeClient}>
        Authenticate
      </button>
      <button onClick={ping} disabled={!jadeClient}>
        Ping
      </button>
      <button onClick={getVersion} disabled={!jadeClient}>
        Get Version
      </button>
      <button onClick={signTransaction} disabled={!jadeClient}>
        Sign Transaction
      </button>

      {version && (
        <pre
          style={{
            textAlign: "left",
            margin: "1em auto",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: 4,
            maxWidth: 600,
            backgroundColor: "#f9f9f9",
          }}
        >
          {JSON.stringify(version, null, 2)}
        </pre>
      )}

      {signedpsbt && (
        <div
          style={{
            textAlign: "left",
            margin: "1em auto",
            padding: "0.5rem",
            border: "1px solid #4caf50",
            borderRadius: 4,
            maxWidth: 600,
            backgroundColor: "#f1f8e9",
          }}
        >
          <strong>Signed PSBT (Base64):</strong>
          <pre>{signedpsbt}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

