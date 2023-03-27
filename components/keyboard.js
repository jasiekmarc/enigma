// @ts-check

// @ts-ignore
import { html, useState } from "preact";
import { createRefForDimensions, ord } from "./lib.js";
import { drawWires } from "./wires.js";

// Constructs an entire Enigma keyboard.
export function Keyboard({ click, unclick, wires, clicked }) {
  const [dimensions, setDimensions] = useState({});

  // Lay out keys.
  const keys = [
    ["q", "w", "e", "r", "t", "z", "u", "i", "o"],
    ["a", "s", "d", "f", "g", "h", "j", "k"],
    ["p", "y", "x", "c", "v", "b", "n", "m", "l"],
  ].map(
    (cs, r) =>
      html` <div class="board-row" key="row-${r}">
        ${cs.map((c) => {
          // Enter the coordinates of the button into the state, where it will
          // be used by the SVG paths.
          const ref = createRefForDimensions(ord(c), setDimensions);
          return html`<button
            class="key"
            ref=${ref}
            clicked=${clicked == c}
            onmousedown=${() => click(c)}
            onmouseup=${unclick}
            ontouchstart=${() => click(c)}
            ontouchend=${unclick}
          >
            ${c.toUpperCase()}
          </button>`;
        })}
      </div>`
  );

  // Lay out the wiring port.
  const ref = createRefForDimensions("port", setDimensions);
  const port = html`<div class="port port-bottom" ref=${ref}></div>`;

  const activeWires = drawWires(wires, dimensions);

  return html` <div class="board keyboard">${keys} ${port} ${activeWires}</div> `;
}
