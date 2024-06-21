const express = require("express");
const app = express();
const cors = require("cors");
const secp = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { toHex, hexToBytes } = require('ethereum-cryptography/utils');
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "86f967ff38b8ac6182041e4c691cf4139109b6bb": 100, // Luis
  "3e1eb2231f695a5b3f298478ea671ea3934b2e5d": 50,  // Adel
  "fd2138dc9a1cf6821c66ee34c183b676ffdf7465": 75   // Anna
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature, message } = req.body;

  try {
    const messageHash = hexToBytes(message);
    const sig = {
      r: hexToBytes(signature.r),
      s: hexToBytes(signature.s),
      recovery: signature.recovery,
    };

    const publicKey = secp.recoverPublicKey(messageHash, sig, signature.recovery);
    const publicKeyWithoutFirstByte = publicKey.slice(1);
    const recoveredAddress = toHex(keccak256(publicKeyWithoutFirstByte).slice(-20));

    if (recoveredAddress !== sender) {
      return res.status(400).send({ message: "Invalid signature!" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      return res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).send({ message: "An error occurred during transaction processing." });
  }
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});