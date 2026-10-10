import { render } from "preact";
import ShaderPlayground from "./ShaderPlayground";

const body = document.querySelector("main");
if (!body) {
  throw new Error("Missing <main> mount element");
}
render(<ShaderPlayground />, body);
