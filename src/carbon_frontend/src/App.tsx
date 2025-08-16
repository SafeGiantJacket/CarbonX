import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    setMessage("🚀 Carbon Ledger React Frontend is Live!");
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{message}</h1>
      <p>You can now connect this UI to your Motoko canisters.</p>
    </div>
  );
}

export default App;
