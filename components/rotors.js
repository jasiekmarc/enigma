// @ts-check

// @ts-ignore
import { html, useRef, useState } from "preact";
import { char, createRefForDimensions } from "./lib.js";
import { drawWires } from "./wires.js";

const contact = (angle, radius, ref) => {
  const style = {
    transform: `rotateZ(${angle}deg) translateX(${radius}px)`,
  };
  return html`<div
    class="rotor-side-contact"
    style="${style}"
    ref=${ref}
  ></div>`;
};

const rotorSide = (refs, radius) => {
  const angle = 360 / refs.length;
  const sideStyle = {
    height: `${radius * 2}px`,
    width: `${radius * 2}px`,
    left: `calc(50% - ${radius}px)`,
    top: `calc(50% - ${radius}px)`,
  };
  return html`<div class="rotor-side" style="${sideStyle}">
    ${refs.map((ref, i) => contact(angle * i, radius * 0.9, ref))}
  </div>`;
};

function Reflector({ refs }) {
  const angle = 360 / 26;
  const radius = 70;
  const circum = Math.PI * radius * 2;
  const height = circum / 26;
  const surfs = [...Array(26)].map((_, i) => {
    const deg = angle * i;
    const style = {
      transform: `rotateX(${deg}deg) translateZ(${radius}px)`,
      height: `${height * 1.1}px`,
      top: `calc(50% - ${height * 0.5}px)`,
      lineHeight: `${height}px`,
    };
    const letter = i === 0 ? html`<span class="reflector-label">B</span>` : "";
    return html`<div class="reflector-surface" style=${style}>${letter}</div>`;
  });
  const side = rotorSide(refs, radius);
  return html` <div class="reflector">${surfs} ${side}</div> `;
}

function Rotor({ /** @type {string} */ position, refs }) {
  const angle = 360 / 26;
  const radius = 80;
  const circum = Math.PI * radius * 2;
  const height = circum / 26;
  // Lays out letters on the rotor. See https://stackoverflow.com/a/63785218.
  const letters = [...Array(26)].map((_, i) => {
    const deg = angle * i;
    const style = {
      transform: `rotateX(${deg}deg) translateZ(${radius}px)`,
      height: `${height * 1.1}px`,
      top: `calc(50% - ${height * 0.5}px)`,
      lineHeight: `${height}px`,
    };
    return html`
      <div class="rotor-letter" style=${style}>
        <span>${char(i).toUpperCase()} </span>
      </div>
    `;
  });
  const side = rotorSide(refs, radius);
  const rotation = position * angle;
  const style = {
    transform: `rotateX(-${rotation}deg)`,
  };
  return html`
    <span class="rotor-marker"></span>
    <div class="rotor">
      <div class="rotor-backface" style=${style}>${letters}</div>
      ${side}
    </div>
  `;
}

export function Rotorboard({ rotors, wires }) {
  const [dimensions, setDimensions] = useState({
    // Keys will be `{i}-{s}-{c}` where i may be 0,1,2, or 'reflector', s may be
    // 'left' or 'right' and c a number in 0..25.
  });
  // boardRef will be used to compute connectors' positions relative to the board.
  const boardRef = useRef(null);

  const rotorElems = rotors.map((r, i) => {
    let refs = [...Array(26)];
    [...Array(26)].map((_, c) => {
      const ref = createRefForDimensions(`${i}-${c}`, setDimensions, boardRef);
      refs[c] = ref;
    });
    return html`<${Rotor} ...${r} refs=${refs} />`;
  });

  const reflectorRefs = [...Array(26)].map((_, c) =>
    createRefForDimensions(`reflector-${c}`, setDimensions, boardRef)
  );
  const inPortRef = createRefForDimensions("in-port", setDimensions);
  const inPort = html`<div
    class="port port-bottom-right"
    ref=${inPortRef}
  ></div>`;
  const outPortRef = createRefForDimensions("out-port", setDimensions);
  const outPort = html`<div
    class="port port-bottom-right"
    ref=${outPortRef}
  ></div>`;

  const activeWires = drawWires(wires, dimensions);
  return html`
    <div class="board rotorboard" ref=${boardRef}>
      <${Reflector} refs=${reflectorRefs} />
      ${rotorElems} ${inPort} ${outPort} ${activeWires}
    </div>
  `;
}
