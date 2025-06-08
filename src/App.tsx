// App.tsx
import React, { useState } from "react";
import "./App.css";
import {
  Jade,
  JadeInterface,
  SerialTransport,
  base64ToBytes,
  bytesToBase64,
  MultisigDescriptor,
  SignerDescriptor, 
  ReceiveOptions,
} from "jadets";
/*
const testDescriptor_unf: MultisigDescriptor =  
{

    "variant": "sh(multi(k))",
    "sorted": false,
    "threshold": 2,
    "signers": [
        {
            "fingerprint": {
                "type": "Buffer",
                "data": [
                    245,
                    126,
                    198,
                    93
                ]
            },
            "derivation": [
                2147483693,
                2147483649,
                2147483748
            ],
            "xpub": "tpubDDQubdBx9cbwQtdcRTisKF7wVCwHgHewhU7wh77VzCi62Q9q81qyQeLoZjKWZ62FnQbWU8k7CuKo2A21pAWaFtPGDHP9WuhtAx4smcCxqn1",
            "path": []
        },
        {
            "fingerprint": {
                "type": "Buffer",
                "data": [
                    0,
                    0,
                    0,
                    1
                ]
            },
            "derivation": [
                2147483693,
                2147483649,
                2147483748
            ],
            "xpub": "tpubDDinbKDXyddTUKcX6mv936Ux5utCJteq5S6EEKhfpM8CqN2rMAcccv6GecsB3cPt8eGL4e4K2eaZ9Jis9TGf7mbwBsRTN7ngnFR7yJZxBKC",
            "path": []
        }
    ]
}
*/
const testDescriptor: MultisigDescriptor = {
	variant: "wsh(multi(k))",
	sorted: false,
	threshold: 2,
	signers: [
		{
			fingerprint: new Uint8Array([245,126,198,93]),
			derivation: [
				2147483696, 2147483649, 2147483748, 2147483650
			],

			xpub: "tpubDFc9Mm4tw6EkgR4YTC1GrU6CGEd9yw7KSBnSssL4LXAXh89D4uMZigRyv3csdXbeU3BhLQc4vWKTLewboA1Pt8Fu6fbHKu81MZ6VGdc32eM",
			path: []       // ← **must include** 
		},
		{
			fingerprint: new Uint8Array([0,0,0,3]),
			derivation: [
				2147483696, 2147483649, 2147483748, 2147483650
			],

			xpub: "tpubDErWN5qfdLwYE94mh12oWr4uURDDNKCjKVhCEcAgZ7jKnnAwq5tcTF2iEk3VuznkJuk2G8SCHft9gS6aKbBd18ptYWPqKLRSTRQY7e2rrDj",
			path: []       // ← **must include** 
		},
	],
};

function App() {
  const [status, setStatus] = useState<string>("Disconnected");
  const [version, setVersion] = useState<any>(null);
  const [messageSig, setMessageSig] = useState<string | null>(null);
  const [jadeClient, setJadeClient] = useState<Jade | null>(null);
  const [multisigDescriptor, setMultisigDescriptor] = useState<MultisigDescriptor | null>(null);
  const [foundName, setFoundName] = useState<string | null | undefined>(null);

  const connect = async () => {
    setStatus("Connecting…");
    const transport = new SerialTransport({});
    const client = new Jade(new JadeInterface(transport));
    await client.connect();
    setJadeClient(client);
    setStatus("Connected");
  };

  const authenticate = async () => {
    if (!jadeClient) return;
    setStatus("Authenticating…");
    const httpRequestFn = async (params: any): Promise<{ body: any }> => {
      const response = await fetch(params.urls[0], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params.data),
      });
      return { body: await response.json() };
    };
    const ok = await jadeClient.authUser("testnet", httpRequestFn);
    setStatus(ok ? "Unlocked" : "Auth failed");
  };

  const ping = async () => {
    if (!jadeClient) return;
    setStatus("Pinging…");
    const p = await jadeClient.ping();
    setStatus("Ping=" + p);
  };

  const getVersion = async () => {
    if (!jadeClient) return;
    setStatus("Fetching version…");
    const info = await jadeClient.getVersionInfo();
    setVersion(info);
    setStatus("Version fetched");
  };


  const registerMultisigWallet = async () => {
    if (!jadeClient) return;
    setStatus("Checking multisig…");
    //let name = await jadeClient.getMultiSigName("testnet", testDescriptor);
    //if (!name) {
	//
	const nameM = "flaby";
      await jadeClient.registerMultisig("testnet", nameM, testDescriptor);
      setStatus("Registered as " + "bingo");

	  const walletd = await jadeClient.getRegisteredMultisig(nameM);
	  console.log(walletd);
	  const desc = walletd.descriptor;
	  if (
		  desc.variant === "sh(multi(k))" ||
		  desc.variant === "wsh(multi(k))" ||
	  desc.variant === "sh(wsh(multi(k)))"
	  ) {
		  setMultisigDescriptor(desc);
	  } else {
		  throw new Error(`Unknown variant: ${desc.variant}`);
	  }
    //} else {
     // setStatus("Already registered: " + name);
    //}
  };

  const findWalletName = async () => {
    if (!jadeClient) return;
    setStatus("finding multisg wallet name…");

	if (!multisigDescriptor) return; 

	const expectedName = "flaby";
	const actualName = await jadeClient.getMultiSigName("testnet", multisigDescriptor);
      setStatus("found name or didnt find name lets see...");
	  console.log("expected: ", expectedName);
	  console.log("actual: ", actualName);
	  setFoundName(actualName);

    //} else {
     // setStatus("Already registered: " + name);
    //}
  };
//== Help me implement this function 
  //const getPathsFromDesi();
  function parseBip32Path(path_i: string): number[] {
	  let path = path_i;
	  if (path.startsWith("m/")) {
		  path = path.substring(2);
	  } else if (path.startsWith("m")) {
		  path = path.substring(1);
		  if (path.startsWith("/")) {
			  path = path.substring(1);
		  }
	  }
	  const segments = path.split("/");
	  const result: number[] = [];
	  for (const segment of segments) {
		  // Check if the segment is hardened (ends with "'" or "h")
		  let hardened = false;
		  let numStr = segment;
		  if (segment.endsWith("'") || segment.endsWith("h")) {
			  hardened = true;
			  numStr = segment.slice(0, -1);
		  }
		  const index = parseInt(numStr, 10);
		  if (isNaN(index)) {
			  throw new Error(`Invalid path segment: ${segment}`);
		  }
		  // Hardened index = index + 0x80000000 (2^31)
		  result.push(index + (hardened ? 0x80000000 : 0));
	  }
	  return result;
  }
  function extractPathSuffix(
	  fullPathStr: string,
	  baseDerivation: number[]
  ): number[] {
	  // 1. parse the full path
	  const fullPath = parseBip32Path(fullPathStr);

	  // 2. ensure the base matches the start of the full
	  if (fullPath.length < baseDerivation.length ||
		  !baseDerivation.every((v,i) => v === fullPath[i])) {
		  throw new Error(
			  `Path "${fullPathStr}" does not extend base derivation [${baseDerivation.join(",")}]`
		  );
	  }

	  // 3. the suffix is whatever remains after the base
	  return fullPath.slice(baseDerivation.length);
  }

  const getMultisigAddress = async () => {
	const bip32p =  "m/48'/1'/100'/2'/0/0"
	const expectedAddress = "tb1qhgj3fnwn50pq966rjnj4pg8uz9ktsd8nge32qxd73ffvvg636p5q54g7m0" 
    if (!jadeClient) return;
    setStatus("finding multisg wallet name…");

	if (!multisigDescriptor) return; 

	if (!foundName) return;

	const desi = await jadeClient.getRegisteredMultisig(foundName);
	const desi_disc = desi.descriptor;

	const paths = desi_disc.signers.map((signer) => {
		return extractPathSuffix(bip32p, signer.derivation);	
	});
	console.log("paths: ", paths);

	const opts: ReceiveOptions = {
		paths: paths,
		multisigName: foundName
	}
	const multisigAdd = await jadeClient.getReceiveAddress("testnet", opts); 
	console.log("multisig address: ",multisigAdd);


    //} else {
     // setStatus("Already registered: " + name);
    //}
  };

  return (
    <div className="App">
      <h1>Jade Demo</h1>
      <p><strong>Status:</strong> {status}</p>

      <button onClick={connect} disabled={!!jadeClient}>
        Connect
      </button>
      <button onClick={authenticate} disabled={!jadeClient}>
        Unlock
      </button>
      <button onClick={ping} disabled={!jadeClient}>
        Ping
      </button>
      <button onClick={getVersion} disabled={!jadeClient}>
        Get Version
      </button>
      <button onClick={registerMultisigWallet} disabled={!jadeClient}>
        Register/FIND Multisig
      </button>
      <button onClick={findWalletName} disabled={!jadeClient}>
        Register/FIND Multisig
      </button>

      <button onClick={getMultisigAddress} disabled={!jadeClient}>
       get multisig address 
      </button>

      {version && (
        <pre style={{ textAlign: "left", padding: 8 }}>
          {JSON.stringify(version, null, 2)}
        </pre>
      )}

      {messageSig && (
        <div style={{ marginTop: 12 }}>
          <strong>Signature:</strong>
          <pre>{messageSig}</pre>
        </div>
      )}
    </div>
  );
}

export default App;


