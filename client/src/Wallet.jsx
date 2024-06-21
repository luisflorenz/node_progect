// Wallet.jsx
import React, { useState } from "react";
import server from "./server";
import { privateKeys } from "./privateKeys"; // Import privateKeys object

function Wallet({ balance, setBalance, address, setAddress }) {
  const [privateKey, setPrivateKey] = useState("");

  async function onChange(evt) {
    const address = evt.target.value.trim();
    setAddress(address); // Update address state
    setPrivateKey(""); // Clear private key state when address changes

    if (address) {
      try {
        // Fetch balance based on address
        const response = await server.get(`balance/${address}`);
        setBalance(response.data.balance);

        // Auto-fill private key based on address
        const privateKey = privateKeys[address];
        if (privateKey) {
          setPrivateKey(privateKey); // Set private key state if found in privateKeys object
        } else {
          // Handle case where no private key is found
          console.warn(`No private key found for address: ${address}`);
        }

      } catch (error) {
        console.error("Failed to fetch balance", error);
        setBalance(0); // Set balance to 0 if there is an error
        // Optionally clear private key state or handle error case
      }
    } else {
      setBalance(0); // Clear balance if address is empty
      // Optionally clear private key state if address is empty
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      <label>
        Wallet Address
        <input
          placeholder="Type an address, for example: 0x1"
          value={address}
          onChange={onChange}
        />
      </label>
      <div className="balance">Balance: {balance}</div>
      {privateKey && (
        <div className="private-key">
          Private Key: ************ {/* Display asterisks for privacy */}
        </div>
      )}
    </div>
  );
}

export default Wallet;

