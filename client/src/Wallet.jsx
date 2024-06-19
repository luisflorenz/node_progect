import { useState } from "react";
import server from "./server";

function Wallet({ address, setAddress, balance, setBalance }) {
  const [privateKey, setPrivateKey] = useState("");
  
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }


  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>
      <label>
        Private Key
        <input placeholder="Type your private key" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)}></input>
      </label>
      <button onClick={() => sendTransaction("recipient_address", 10)}>Send 10 tokens</button>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet; 
