import { useState } from "react";
import { issuance } from "../../src/declarations/issuance";

export default function App() {
  const [status, setStatus] = useState("");

  async function testCall() {
    try {
      const result = await issuance.getAllCertificates();
      setStatus(JSON.stringify(result, null, 2));
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div>
      <h1>Carbon Ledger Frontend</h1>
      <button onClick={testCall}>Test Issuance Call</button>
      <pre>{status}</pre>
    </div>
  );
}
