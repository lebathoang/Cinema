const fs = require("fs");
const path = require("path");
const localtunnel = require("localtunnel");

const port = Number(process.env.TUNNEL_PORT || 5000);
const host = process.env.TUNNEL_HOST || "127.0.0.1";
const outputPath = process.env.TUNNEL_OUTPUT || path.resolve(__dirname, "backend-tunnel-url.txt");

async function main() {
  const tunnel = await localtunnel({ port, local_host: host });

  fs.writeFileSync(outputPath, `${tunnel.url}\n`, "utf8");
  console.log(tunnel.url);
  setInterval(() => {}, 60_000);

  tunnel.on("close", () => {
    process.exit(0);
  });

  tunnel.on("error", (error) => {
    console.error(error);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
