const express = require("express");
const app = express();
const cors = require("cors");
const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { toHex, hexToBytes } = require('ethereum-cryptography/utils');
const { keccak256 } = require('ethereum-cryptography/keccak');
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "c6e005c0a3c89c48e89d0b077196c35db6f617be": 100, // Luis
  "691a3112aeed2d9d2ae26bac65e0d4aafb856270": 50, // Adel
  "f245a486fa58fee83f10390fb6721c2f694e9236": 75, // Anna
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, message } = req.body;

  // recover the public address from the signature adn the message
  const messageHash = new Uint8Array(Object.values(message));
  const sig = {
    r: hexToBytes(signature.r),
    s: hexToBytes(signature.s),
    recovery: signature.recovery,
  };
  const publicKey = secp256k1.recoverPublicKey(messageHash, sig, signature.recovery);

  // convert the recovered public key to an address
  const pkwhitoutFirstByte = publicKey.slice(1);
  const address = toHex(keccak256(pkwhitoutFirstByte).slice(-20));

  if (address !== sender) {
    return res.status(400).send({message: "Invalid signature!"});
  
  }


  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

app.listen(port, () => {
console.log(`Server running on port ${port}`);
});
