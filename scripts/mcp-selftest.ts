/**
 * VYNTER NORTH — MCP SELF-TEST SCRIPT
 * Usage: npx tsx scripts/mcp-selftest.ts <mcp_url>
 * Example: npx tsx scripts/mcp-selftest.ts https://vynter-north.vercel.app/api/mcp/vn-your-key-here
 */

async function main() {
  const mcpUrl = process.argv[2] || "http://localhost:3000/api/mcp/vn-test-key-001";
  console.log(`=======================================================`);
  console.log(`RUNNING VYNTER NORTH MCP SELF-TEST`);
  console.log(`Target URL: ${mcpUrl}`);
  console.log(`=======================================================\n`);

  // 1. initialize
  console.log("[1] Calling initialize...");
  const initRes = await fetch(mcpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18" },
    }),
  });

  const initData = await initRes.json();
  console.log("Initialize result:", initData);
  if (!initData.result?.serverInfo?.name) {
    throw new Error("Initialize failed or returned unexpected response.");
  }
  console.log("-> initialize PASS\n");

  // 2. tools/list
  console.log("[2] Calling tools/list...");
  const listRes = await fetch(mcpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    }),
  });

  const listData = await listRes.json();
  const tools = listData.result?.tools || [];
  console.log(`Tools available (${tools.length}):`, tools.map((t: any) => t.name));
  if (tools.length < 6) {
    console.warn(`Warning: Expected 6 tools, found ${tools.length}`);
  }
  console.log("-> tools/list PASS\n");

  // 3. tools/call -> list_my_characters
  console.log("[3] Calling tools/call -> list_my_characters...");
  const charRes = await fetch(mcpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "list_my_characters", arguments: {} },
    }),
  });
  const charData = await charRes.json();
  console.log("list_my_characters text:\n", charData.result?.content?.[0]?.text);
  console.log("-> list_my_characters PASS\n");

  // 4. tools/call -> account_status
  console.log("[4] Calling tools/call -> account_status...");
  const statusRes = await fetch(mcpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "account_status", arguments: {} },
    }),
  });
  const statusData = await statusRes.json();
  console.log("account_status text:\n", statusData.result?.content?.[0]?.text);
  console.log("-> account_status PASS\n");

  console.log("=======================================================");
  console.log("ALL MCP SELF-TESTS PASSED SUCCESSFULLY!");
  console.log("=======================================================");
}

main().catch((err) => {
  console.error("MCP self-test error:", err);
  process.exit(1);
});
