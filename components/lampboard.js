// @ts-check

// @ts-ignore
import { html, useState } from "preact";
import { char, createRefForDimensions, ord } from "./lib.js";
import { drawWires } from "./wires.js";

// Constructs an entire Enigma lampboard.
export function Lampboard({ lamp, wires }) {
  const lampLetter = lamp !== null && char(lamp);
  const [dimensions, setDimensions] = useState({});

  const keys = [
    ["q", "w", "e", "r", "t", "z", "u", "i", "o"],
    ["a", "s", "d", "f", "g", "h", "j", "k"],
    ["p", "y", "x", "c", "v", "b", "n", "m", "l"],
  ].map((cs, r) => {
    return html` <div class="board-row" key="row-${r}">
      ${cs.map((c) => {
        const on = lampLetter === c;
        // Enter the coordinates of the lamp into the state, where it will be
        // used by the SVG paths.
        const ref = createRefForDimensions(ord(c), setDimensions);
        return html`
          <div class="lamp ${on && "lamp-on"}" ref=${ref}>
            ${c.toUpperCase()}
          </div>
        `;
      })}
    </div>`;
  });

  // Lay out the wiring port.
  const ref = createRefForDimensions("port", setDimensions);
  const port = html`<div class="port port-bottom-right" ref=${ref}></div>`;

  const activeWires = drawWires(wires, dimensions);

  return html` <div class="board lampboard">${keys} ${port} ${activeWires}</div> `;
}
