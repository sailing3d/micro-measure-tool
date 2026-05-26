#!/usr/bin/env node

// HTTPS proxy for Vite dev server
// Spawns Vite, then proxies http://localhost:5173 → https://0.0.0.0:5443

const https = require("https");
const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const TARGET = "http://localhost:5173";
const PORT = parseInt(process.argv[2] || "5443", 10);
const CERT_DIR = path.join(__dirname, "..", "node_modules", ".cache");

function generateCert() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const cert = crypto.createCertificate({
    days: 365,
    selfSigned: true,
    extensions: [
      {
        name: "subjectAltName",
        altNames: [{ type: 2, value: "localhost" }, { type: 7, ip: "127.0.0.1" }],
      },
    ],
  });

  cert.subject = "/CN=localhost";
  cert.issuer = "/CN=localhost";
  cert.publicKey = publicKey;
  cert.sign(privateKey, "sha256");

  return {
    key: privateKey.export({ type: "pkcs8", format: "pem" }),
    cert: cert.export({ type: "pem", format: "pem" }),
  };
}

function getOrCreateCert() {
  const keyPath = path.join(CERT_DIR, "dev-key.pem");
  const certPath = path.join(CERT_DIR, "dev-cert.pem");

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
  }

  const { key, cert } = generateCert();
  fs.mkdirSync(CERT_DIR, { recursive: true });
  fs.writeFileSync(keyPath, key);
  fs.writeFileSync(certPath, cert);
  return { key, cert };
}

// Spawn Vite dev server
const vite = spawn("npm", ["-w", "@micro-measure-tool/app", "run", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: path.join(__dirname, ".."),
});

process.on("SIGINT", () => { vite.kill(); process.exit(); });
process.on("SIGTERM", () => { vite.kill(); process.exit(); });

// Wait for Vite to be ready, then start proxy
function waitForServer(retries = 30) {
  http.get("http://localhost:5173", (res) => {
    startProxy();
  }).on("error", () => {
    if (retries > 0) {
      setTimeout(() => waitForServer(retries - 1), 500);
    } else {
      console.error("Vite dev server did not start in time");
      vite.kill();
      process.exit(1);
    }
  });
}

function startProxy() {
  const sslOptions = getOrCreateCert();

  const server = https.createServer(sslOptions, (clientReq, clientRes) => {
    const options = {
      hostname: "localhost",
      port: 5173,
      path: clientReq.url,
      method: clientReq.method,
      headers: { ...clientReq.headers, host: "localhost:5173" },
    };

    const proxy = http.request(options, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(clientRes);
    });

    proxy.on("error", () => {
      clientRes.writeHead(502);
      clientRes.end();
    });

    clientReq.pipe(proxy);
  });

  server.on("upgrade", (clientReq, socket, head) => {
    const options = {
      hostname: "localhost",
      port: 5173,
      path: clientReq.url,
      method: clientReq.method,
      headers: { ...clientReq.headers, host: "localhost:5173" },
    };

    const proxy = http.request(options);
    proxy.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
      proxySocket.pipe(socket);
      socket.pipe(proxySocket);
    });
    proxy.end(head);
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n========================================`);
    console.log(`  HTTPS:  https://0.0.0.0:${PORT}`);
    console.log(`  HTTP:   ${TARGET}`);
    console.log(`========================================\n`);
  });
}

waitForServer();
