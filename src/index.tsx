import React from "react";
import { createRoot } from "react-dom/client";
import ShaderPlayground from "./ShaderPlayground";

const body = document.querySelector("main");
if (!body) {
  throw new Error("Missing <main> mount element");
}
const root = createRoot(body);
root.render(<ShaderPlayground />);
