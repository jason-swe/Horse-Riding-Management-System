import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT = path.join(ROOT, "artifacts", "fixed-odds-phase-3");
const PROFILE = path.join(tmpdir(), `horse-racing-fixed-odds-${process.pid}`);
const APP_ORIGIN = "http://127.0.0.1:5187";
const DEBUG_PORT = 9337;
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Cdp {
  constructor(url) {
    this.id = 1;
    this.pending = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      else pending.resolve(message.result);
    });
  }
  async send(method, params = {}) {
    await this.ready;
    const id = this.id++;
    const response = new Promise((resolve, reject) => this.pending.set(id, { method, resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
  }
  close() { this.socket.close(); }
}

function assert(value, message) { if (!value) throw new Error(message); }

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", { expression: `JSON.stringify(${expression})`, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return JSON.parse(response.result.value);
}

async function waitFor(client, expression, message, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) return;
    await wait(100);
  }
  throw new Error(message);
}

async function clickText(client, selector, text) {
  return evaluate(client, `(() => { const node = [...document.querySelectorAll(${JSON.stringify(selector)})].find((item) => item.textContent.trim().includes(${JSON.stringify(text)})); if (!node) return false; node.click(); return true; })()`);
}

async function capture(client, name) {
  const result = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true });
  await writeFile(path.join(OUTPUT, name), Buffer.from(result.data, "base64"));
}

async function setViewport(client, width, height) {
  await client.send("Emulation.setScrollbarsHidden", { hidden: true });
  await client.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
}

async function run() {
  await mkdir(OUTPUT, { recursive: true });
  await rm(PROFILE, { recursive: true, force: true });
  const vite = spawn(process.execPath, [path.join(ROOT, "node_modules", "vite", "bin", "vite.js"), "--host", "127.0.0.1", "--port", "5187"], { cwd: ROOT, env: { ...process.env, VITE_MOCK_MARKET_LOCK_DELAY_MS: "8000" }, stdio: "ignore", windowsHide: true });
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) { try { if ((await fetch(APP_ORIGIN)).ok) break; } catch {} await wait(150); }
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${PROFILE}`, `${APP_ORIGIN}/`], { stdio: "ignore" });
  const report = { passed: false, assertions: [], screenshots: [], audits: {} };
  let client;

  try {
    let targets;
    const targetDeadline = Date.now() + 12000;
    while (Date.now() < targetDeadline) { try { targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json(); if (targets.length) break; } catch {} await wait(150); }
    const target = targets.find((item) => item.type === "page" && item.url.startsWith(APP_ORIGIN));
    assert(target, "Browser target was not created.");
    client = new Cdp(target.webSocketDebuggerUrl);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Page.addScriptToEvaluateOnNewDocument", { source: `(() => {
      localStorage.setItem("horse_racing_token", "phase-3-token");
      localStorage.setItem("horse_racing_user", JSON.stringify({ id: "phase-3", full_name: "Phase 3 Spectator" }));
      localStorage.setItem("horse_racing_roles", JSON.stringify(["spectator"]));
      localStorage.setItem("horse_racing_profiles", JSON.stringify({ spectator: { id: "phase-3-profile" } }));
      localStorage.setItem("horse_racing_active_role", "spectator");
      const nativeFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = typeof input === "string" ? input : input.url;
        if (url.includes("/api/auth/me")) return Promise.resolve(new Response(JSON.stringify({ success: true, data: { user: { id: "phase-3", full_name: "Phase 3 Spectator" }, roles: ["spectator"], profiles: { spectator: { id: "phase-3-profile" } } } }), { status: 200, headers: { "Content-Type": "application/json" } }));
        return nativeFetch(input, init);
      };
    })();` });

    await setViewport(client, 1440, 1100);
    await client.send("Page.navigate", { url: `${APP_ORIGIN}/spectator/predictions/races/race-opening-sprint` });
    await waitFor(client, `document.querySelectorAll(".fixed-odds-tabs button").length === 6 && !document.querySelector(".fixed-odds-runner button").disabled`, "Fixed-odds market did not open.");

    const initial = await evaluate(client, `(() => ({ tabs: document.querySelectorAll(".fixed-odds-tabs button").length, runners: document.querySelectorAll(".fixed-odds-runner").length, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, viewer: document.querySelectorAll(".live-race-viewer").length }))()`);
    assert(initial.tabs === 6 && initial.runners === 5 && initial.viewer === 0 && initial.overflow === 0, "Desktop market structure is incorrect.");
    report.audits.initial = initial;
    report.assertions.push("Race betting route renders six market tabs, five runners, and no embedded race viewer");

    for (const singleType of ["Win", "Place", "Show"]) {
      await clickText(client, ".fixed-odds-tabs button", singleType);
      await evaluate(client, `(() => { document.querySelector(".fixed-odds-runner button").click(); return true; })()`);
      const single = await evaluate(client, `({ filled: document.querySelectorAll(".fixed-odds-slot.is-filled").length, odds: document.querySelector(".fixed-odds-slip__totals strong").textContent.trim() })`);
      assert(single.filled === 1 && single.odds !== "--", `${singleType} did not resolve a single-runner price.`);
    }
    report.assertions.push("Win, Place, and Show resolve one-runner fixed prices");

    await clickText(client, ".fixed-odds-tabs button", "Quinella");
    await clickText(client, ".fixed-odds-runner button", "Add");
    await evaluate(client, `(() => { document.querySelectorAll(".fixed-odds-runner button")[1].click(); return true; })()`);
    const quinella = await evaluate(client, `(() => ({ filled: document.querySelectorAll(".fixed-odds-slot.is-filled").length, odds: document.querySelector(".fixed-odds-slip__totals strong").textContent.trim(), reviewDisabled: document.querySelector(".fixed-odds-review").disabled }))()`);
    assert(quinella.filled === 2 && quinella.odds !== "--" && !quinella.reviewDisabled, "Quinella selection is incomplete.");
    report.assertions.push("Quinella accepts two unique unordered runners and resolves combination odds");

    await clickText(client, ".fixed-odds-tabs button", "Exacta");
    await clickText(client, ".fixed-odds-runner button", "Add");
    await evaluate(client, `(() => { document.querySelectorAll(".fixed-odds-runner button")[1].click(); return true; })()`);
    const exactaBefore = await evaluate(client, `document.querySelector(".fixed-odds-slip__totals strong").textContent.trim()`);
    await evaluate(client, `(() => { document.querySelectorAll(".fixed-odds-slot__move button")[1].click(); return true; })()`);
    const exactaAfter = await evaluate(client, `document.querySelector(".fixed-odds-slip__totals strong").textContent.trim()`);
    assert(exactaBefore !== exactaAfter, "Exacta odds did not change after ordered selections were reversed.");
    report.assertions.push("Exacta reorder changes the ordered combination and its fixed odds");

    await clickText(client, ".fixed-odds-tabs button", "Trifecta");
    await clickText(client, ".fixed-odds-runner button", "Add");
    await evaluate(client, `(() => { document.querySelectorAll(".fixed-odds-runner button")[1].click(); return true; })()`);
    await evaluate(client, `(() => { document.querySelectorAll(".fixed-odds-runner button")[2].click(); return true; })()`);
    const trifecta = await evaluate(client, `document.querySelectorAll(".fixed-odds-slot.is-filled").length`);
    assert(trifecta === 3, "Trifecta did not require three slots.");
    report.assertions.push("Trifecta fills three unique ordered position slots");
    await capture(client, "fixed-odds-trifecta-desktop-1440x1100.png");
    report.screenshots.push("fixed-odds-trifecta-desktop-1440x1100.png");

    await evaluate(client, `(() => { document.querySelector(".fixed-odds-review").click(); return true; })()`);
    await waitFor(client, `Boolean(document.querySelector(".prediction-confirm-modal"))`, "Confirmation modal did not open.");
    const modal = await evaluate(client, `({ summaryRows: document.querySelectorAll(".prediction-confirm-summary > div").length, odds: document.querySelectorAll(".prediction-confirm-hero strong")[1].textContent.trim() })`);
    assert(modal.summaryRows === 4 && modal.odds !== "0.00x", "Confirmation modal is missing fixed odds details.");
    await clickText(client, ".prediction-confirm-actions button", "Place fixed-odds bet");
    await waitFor(client, `document.querySelectorAll(".fixed-odds-receipts article").length === 1`, "Accepted receipt did not render.");
    const accepted = await evaluate(client, `(() => ({ receipt: document.querySelectorAll(".fixed-odds-receipts article").length, balance: document.querySelector(".fixed-odds-slip__wallet strong").textContent.trim(), message: document.querySelector(".fixed-odds-message--success")?.textContent.trim() }))()`);
    assert(accepted.balance === "1,080 pts" && accepted.message.includes("accepted"), "Wallet or accepted receipt did not update.");
    report.audits.accepted = accepted;
    report.assertions.push("Confirmation creates an accepted receipt and updates wallet balance dynamically");

    await setViewport(client, 390, 844);
    await wait(250);
    const mobile = await evaluate(client, `(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, boardWidth: document.querySelector(".fixed-odds-board").getBoundingClientRect().width, clippedRunners: [...document.querySelectorAll(".fixed-odds-runner")].filter((row) => row.scrollWidth > row.clientWidth + 1).length }))()`);
    assert(mobile.overflow === 0 && mobile.boardWidth <= 390 && mobile.clippedRunners === 0, "Mobile fixed-odds layout overflows.");
    report.audits.mobile = mobile;
    report.assertions.push("Mobile odds board has no horizontal page overflow or clipped runner rows");
    await capture(client, "fixed-odds-mobile-390x844.png");
    report.screenshots.push("fixed-odds-mobile-390x844.png");

    await waitFor(client, `document.querySelector(".fixed-odds-clock small")?.textContent.trim() === "Market locked"`, "stop_betting did not lock the market.", 15000);
    const locked = await evaluate(client, `(() => ({ runnerControlsLocked: [...document.querySelectorAll(".fixed-odds-runner button")].every((button) => button.disabled), stakeLocked: document.querySelector("#fixed-odds-stake").disabled, reviewLocked: document.querySelector(".fixed-odds-review").disabled, modalClosed: !document.querySelector(".prediction-confirm-modal") }))()`);
    assert(locked.runnerControlsLocked && locked.stakeLocked && locked.reviewLocked && locked.modalClosed, "stop_betting did not disable the complete form.");
    report.audits.locked = locked;
    report.assertions.push("stop_betting locks runner, stake, review, and confirmation controls immediately");
    report.passed = true;
  } catch (error) {
    report.error = error.stack || error.message;
    throw error;
  } finally {
    await writeFile(path.join(OUTPUT, "verification-report.json"), JSON.stringify(report, null, 2));
    client?.close();
    chrome.kill();
    vite.kill();
    await wait(400);
    await rm(PROFILE, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }).catch(() => {});
  }
  return report;
}

run().then((report) => console.log(JSON.stringify(report, null, 2))).catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
