import { render } from "preact";
import ShaderPlayground from "./ShaderPlayground";

const body = document.querySelector("main");
if (!body) {
  throw new Error("Missing <main> mount element");
}
render(<ShaderPlayground />, body);

// Offline support: register the service worker (skipped where unsupported).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Offline caching is best-effort.
    });
  });
}
