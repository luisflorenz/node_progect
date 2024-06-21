// Transfer.jsx
import React, { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes, hexToBytes } from "ethereum-cryptography/utils";
import { privateKeys } from "./privateKeys";

function Transfer({ setBalance, address }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const signMessage = async () => {
    try {
      if (!privateKey) {
        alert("Private key is required.");
        return;
      }

      const message = `Send ${sendAmount} to ${recipient}`;
      const messageHash = keccak256(utf8ToBytes(message));

      const privateKeyBytes = hexToBytes(privateKey);
      const [signature, recovery] = await secp256k1.sign(messageHash, privateKeyBytes);

      const sig = {
        r: toHex(signature.slice(0, 32)),
        s: toHex(signature.slice(32, 64)),
        recovery,
      };

      return sig;
    } catch (ex) {
      console.error("Signing failed:", ex);
      throw ex;
    }
  };

  const transfer = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    try {
      const sig = await signMessage();

      const response = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: sig,
        message: toHex(keccak256(utf8ToBytes(`Send ${sendAmount} to ${recipient}`))),
      });

      setBalance(response.data.balance);
      setLoading(false);

      // Display success message to user
      setSuccessMessage("Transaction successful!");

      // Optionally clear form fields after successful transfer
      setSendAmount("");
      setRecipient("");

    } catch (ex) {
      console.error("Transfer failed:", ex);
      alert(ex.response?.data?.message || "An error occurred during the transfer.");
      setLoading(false);
    }
  };

  const handleSignClick = async () => {
    const fetchedPrivateKey = privateKeys[address];
    if (fetchedPrivateKey) {
      setPrivateKey(fetchedPrivateKey);
      await transfer();
    } else {
      alert(`No private key found for address: ${address}`);
    }
  };

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
          disabled={loading}
        />
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
          disabled={loading}
        />
      </label>

      <label>
        Private Key
        <input
          type="password"
          placeholder="Type your private key"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
          disabled={loading}
        />
      </label>

      <button type="button" className="button" onClick={handleSignClick} disabled={loading}>
        Sign
      </button>

      {successMessage && <p className="success-message">{successMessage}</p>}
    </form>
  );
}

export default Transfer;


