#!/usr/bin/env node

// HTTPS proxy for Vite dev server
// Spawns Vite, then proxies http://localhost:5173 → https://0.0.0.0:5443

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const TARGET = "http://localhost:5173";
const PORT = parseInt(process.argv[2] || "5443", 10);
const CERT_DIR = path.join(__dirname, "..", "node_modules", ".cache");

const EMBEDDED_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqobnm/tYTfKex
6NNOrSeawxbVuEPE1Ka/gdKFB4jIRH48FL0ImECD4JhFIVCuHfOWiqhS+5pohlqa
RKpIxrJ12rHoqSswXisArG4w35LcGpXGFwV+DIuIInHTcw8Hj0MKXCVl3Hd4M3yi
CzmhiJgPU5zcLu+OzLAy74JM2IOxlZDMeOTEE7An4a3VCeLIy8aSZPfW/wp1e2Gy
cC9R6gQA1I3R9GGI43QiVrucxcizX2endWdXhm3bXJOhOIF6wpgxg77omHeDEr8y
nQ14I4lQapn9NMyj34xH5flQuStYPVGhG4IEXlPJ4Bq1tyey6aHVGiur/Gg0ZRb/
OFdlG6X3AgMBAAECggEABD4iODEG132dBqqY7y1+vP0SFH1YeGM+D3sHsWhWHFEn
6J8ukHUdo294EVRyxBa++mwzbp0HBC03DGUd7Q6QNomShzGr/wo2B7J2m8bJfcdl
NkdH+D0+YWlTfeBGu1091C28FHAbq4wkbPCWknc5DDz72T0h4dK4lVZ4A0ad4VJW
lXA/nRQJAWW8fvwomdnnX9NiWnSBJ4EHOH6mZC5ZinaZigiuZnNr/QATn04orBlK
SdD17TSslpzm+Uz/csBRa9R/v7K410SVIL92how3gsQXlyp68cBvAVTJOU6IPTXr
DsxpyKbDst4Zm6iOPr0sW9kdBaRQS7rfNoWVMsks9QKBgQDedAc56vSqk0lwWPoD
qLL0Bv8qMCe6vFEH2otmteojB+3B5RGQ2MDbEvKIA86oSzvkx1G/nL08o9NByS+T
zoIxJ41v3DdNVqMCzetPiOjsYrc7GSA0X8v+CEwcq33b9Z3sqINphYSy2xbsvWWW
yoFA7/bN3GzFRN+p13+PrYDcFQKBgQDEXRdEl0KPFqlOf+QnDl4FWkmAkdg6QnfI
h2kg7yBc+GFkeoQ9JKyXD/tcc8WtOj+8vEgpJusCheblDd0g2ipan5d/RP15uNkA
zb7+AW2WLj4PR8e6nFyD0eV8j5vndZQ7DCEu0PtGld9X6oO2v/Vp7x9zPgRxnSvH
XB0W5Fng2wKBgDKSaC4nlxXMRC7RW41HZd+KU6oQpoeSVk2VxolEJAVwwQGKhRLL
5BQp249GZk3mRKh/E7ue83p8uANFrJZKpVhtaH8crknbv1Vc4PkE5AcRbhx2Wtbt
TF/lHQCLkCJYVV2+9ZkgrIlIu454hEbipL3Rj+c/DE9QmBRxlGNii1/9AoGBALoE
hfpQYJk0mobm2Le3AJKJiX/mqbPnK5onzQuJ/FqWYYzSE1vo1ib02OYoNmd3+tFM
e/+gApmNR8JNc+GfSug2r0m9jXI2DjyYrAnsSGgwvlGzah356hpmSMPLN6H43Mdj
Ijw7dQ7VA5NBci05g78q69w8L/GBNuvQ8y2wfQRpAoGADOU5skRpusqTFKnZYYxw
pMOq43PCRp6HPT7OSLPXOLotAKfifEmIXHlW6y9hP9ZoupqvrutDRMNzmWDjNOsy
faQVvFb7c1hFKN1V3ZMSCujgWKCKaw4HNUFqYQkk+rXXiY9T2Y36ArIjcfrG/34I
J8O43c1q1fuAlnWb4RKsln4=
-----END PRIVATE KEY-----`;

const EMBEDDED_CERT = `-----BEGIN CERTIFICATE-----
MIIDJTCCAg2gAwIBAgIUCIhD8dGLClc9moKdTPQhUxZrhSwwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI2MDUyNjAxNTY0NFoXDTI3MDUy
NjAxNTY0NFowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAqqG55v7WE3ynsejTTq0nmsMW1bhDxNSmv4HShQeIyER+
PBS9CJhAg+CYRSFQrh3zloqoUvuaaIZamkSqSMayddqx6KkrMF4rAKxuMN+S3BqV
xhcFfgyLiCJx03MPB49DClwlZdx3eDN8ogs5oYiYD1Oc3C7vjsywMu+CTNiDsZWQ
zHjkxBOwJ+Gt1QniyMvGkmT31v8KdXthsnAvUeoEANSN0fRhiON0Ila7nMXIs19n
p3VnV4Zt21yToTiBesKYMYO+6Jh3gxK/Mp0NeCOJUGqZ/TTMo9+MR+X5ULkrWD1R
oRuCBF5TyeAatbcnsumh1Rorq/xoNGUW/zhXZRul9wIDAQABo28wbTAdBgNVHQ4E
FgQU7J8qjNJA6bEmjZofjbwhQTyNkScwHwYDVR0jBBgwFoAU7J8qjNJA6bEmjZof
jbwhQTyNkScwDwYDVR0TAQH/BAUwAwEB/zAaBgNVHREEEzARgglsb2NhbGhvc3SH
BH8AAAEwDQYJKoZIhvcNAQELBQADggEBAKLGWrexthWMvvdG87pkPOeTfeVCC/vL
FfhgBzlLUh81i6VirhwgjCJ517nXeZP9OhMNJXA9M2V+eUzesEGK2RUI+Yf+NZ68
70dU9NGeQeymrrZC/2K3OenjVfHp/hWMaMmh6BDhzYpiePAlk1E/eoYE81DGAyIe
bPs+qmCmVM+wbO0KmTO5Nt0FDNSHErBVe8Nkzo5qOm/jT6ZP6XVLDFRIhQ8vjpDZ
dk3VPBslDFrdSh73wdbp81W2zfbYWtatOTWkJULLae2c4olG2Fmjo1PQ83hlVjlA
GdHxghxLEHIm8VpQUwiVcmMIIhPSjd05VnlKDr0EpiOPEKr0lvNcO80=
-----END CERTIFICATE-----`;

function getOrCreateCert() {
  const keyPath = path.join(CERT_DIR, "dev-key.pem");
  const certPath = path.join(CERT_DIR, "dev-cert.pem");

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
  }

  fs.mkdirSync(CERT_DIR, { recursive: true });
  fs.writeFileSync(keyPath, EMBEDDED_KEY);
  fs.writeFileSync(certPath, EMBEDDED_CERT);
  return { key: EMBEDDED_KEY, cert: EMBEDDED_CERT };
}

// Spawn Vite dev server
const vite = spawn("npm", ["-w", "@micro-measure-tool/app", "run", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: path.join(__dirname, ".."),
});

process.on("SIGINT", () => { vite.kill(); process.exit(); });
process.on("SIGTERM", () => { vite.kill(); process.exit(); });

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
