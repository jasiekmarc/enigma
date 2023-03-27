// @ts-check

// @ts-ignore
import { html, useState } from "preact";
import { createRefForDimensions, ord } from "./lib.js";
import { drawWires, curve, DEG_MAP } from "./wires.js";

// Draws a switch cable between two plugs.
function Switch({ s, t }) {
  if (s === undefined || t === undefined) {
    return;
  }
  return html` <path
    class="switch-cable"
    d="${curve({s, t, ...DEG_MAP["plug-switch"]})}"
  />`;
}

function Plug({ x, y }) {
  if (x === undefined || y === undefined) {
    return;
  }
  return html`<circle class="plug" cx="${x}" cy="${y}" r="7" />`;
}

function drawSwitches(switches, dimensions) {
  return html`<svg class="switches">
    ${switches.map(
      ([s, t]) =>
        html`<${Plug} ...${dimensions[ord(s)]} />
          <${Plug} ...${dimensions[ord(t)]} />`
    )}
    ${switches.map(
      ([s, t]) =>
        html`<${Switch} s=${dimensions[ord(s)]} t=${dimensions[ord(t)]} />`
    )}
  </svg>`;
}

// Constructs an entire Enigma plugboard.
export function Plugboard({ wires, switches }) {
  const [dimensions, setDimensions] = useState({});

  const keys = [
    ["q", "w", "e", "r", "t", "z", "u", "i", "o"],
    ["a", "s", "d", "f", "g", "h", "j", "k"],
    ["p", "y", "x", "c", "v", "b", "n", "m", "l"],
  ].map(
    (cs, r) => html`
      <div class="board-row" key="row-${r}">
        ${cs.map((c) => {
          // Enter the coordinates of the sockets into the state, where it will be
          // used by the SVG paths.
          const ref = createRefForDimensions(ord(c), setDimensions);
          return html`
            <div class="socket" ref=${ref}>
              <span class="socket-label">${c.toUpperCase()}</span>
            </div>
          `;
        })}
      </div>
    `
  );

  // Lay out the wiring ports.
  const refIn = createRefForDimensions("portIn", setDimensions);
  const refRot = createRefForDimensions("portRot", setDimensions);
  const refOut = createRefForDimensions("portOut", setDimensions);
  const ports = html` <div class="port port-bottom" ref=${refIn}></div>
    <div class="port port-top-right" ref=${refRot}></div>
    <div class="port port-top-left" ref=${refOut}></div>`;

  const activeWires = drawWires(wires, dimensions);
  const activeSwitches = drawSwitches(switches, dimensions);

  return html`
    <div class="board plugboard">
      ${keys} ${ports} ${activeSwitches} ${activeWires}
    </div>
  `;
}
