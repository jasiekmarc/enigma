// @ts-check

// @ts-ignore
import { html, useRef, useLayoutEffect } from "preact";

// Equivalent to TikZ
//   \draw (s) to[in=degIn, out=degOut, looseness=looseness] (t);
export function curve({
  s,
  t,
  degOut = undefined,
  degIn = undefined,
  looseness = 1,
}) {
  const polar = ({ x, y }, deg, len) => ({
    x: x + len * Math.cos(deg),
    y: y + len * Math.sin(deg),
  });
  const [dx, dy] = [t.x - s.x, t.y - s.y];
  const d = Math.hypot(dx, dy);
  const ctrLen = looseness * (d * (4 - 2 * Math.SQRT2)) / 3;
  if (degOut === undefined) {
    degOut = Math.atan2(dy, dx);
  } else {
    degOut *= Math.PI / 180;
  }
  if (degIn === undefined) {
    degIn = Math.atan2(-dy, -dx);
  } else {
    degIn *= Math.PI / 180;
  }
  const p = polar(s, degOut, ctrLen);
  const q = polar(t, degIn, ctrLen);
  return `M ${s.x},${s.y} C ${p.x},${p.y} ${q.x},${q.y} ${t.x},${t.y}`;
}

export const DEG_MAP = {
  ["key"]: { degIn: 270, degOut: 90 },
  ["plug-in-key"]: { degIn: 90, degOut: 270 },
  ["rotor-out"]: { degIn: 270, degOut: 0 },
  ["plug-in-rot"]: { degIn: 0, degOut: 105 },
  ["plug-switch"]: { degIn: 90, degOut: 90, looseness: .9 },
  ["plug-out-rot"]: { degIn: 105, degOut: -45 },
  ["rotor-in"]: { degIn: 0, degOut: 250 },
  ["plug-out-lamp"]: { degIn: 45, degOut: -105 },
  ["lamp-in"]: { degIn: 90, degOut: 205 },
};

function Wires({ pairs }) {
  const paths = pairs.map(({ s, t, delay, type = "" }) => {
    if (!s || !t) {
      return;
    }
    // ref will allow us to query the path length once it is drawn.
    const ref = useRef(null);
    useLayoutEffect(() => {
      if (!ref.current) {
        return;
      }
      const len = ref.current.getTotalLength();
      const style = {
        strokeDasharray: len,
        strokeWidth: 3,
      };
      ref.current.animate(
        [
          { ...style, strokeDashoffset: len },
          { ...style, strokeDashoffset: 0, offset: 0.05 },
          {
            ...style,
            strokeDashoffset: 0,
            stroke: "var(--material-color-red)",
          },
        ],
        {
          delay: 500 * (delay + 2),
          duration: 10000,
          iterations: 1,
          fill: "forwards",
        }
      );
    }, []);
    return html`<path
      class="wire"
      ref=${ref}
      d="${curve({ s, t, ...DEG_MAP[type] })}"
    ></path>`;
  });
  return html` <svg width="100%" height="100%">${paths}</svg> `;
}

// Lays out SVG wires as specified by wires, using coordinates stored in
// dimensions.
export function drawWires(wires, dimensions) {
  if (!wires.length) {
    return;
  }
  const pairs = wires.map((conn) => ({
    ...conn,
    s: dimensions[conn.s],
    t: dimensions[conn.t],
  }));
  return html`<${Wires} pairs=${pairs} />`;
}
