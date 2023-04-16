// @ts-check

// @ts-ignore
import { html, useMemo, useReducer, useState, useEffect } from "preact";

import { Keyboard } from "./keyboard.js";
import { Lampboard } from "./lampboard.js";
import { ord, char } from "./lib.js";
import { Plugboard } from "./plugboard.js";
import { Rotorboard } from "./rotors.js";

const PERMUTATIONS = [
  "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
  "AJDKSIRUXBLHWTMCQGZNPYFVOE",
  "BDFHJLCPRTXVZNYEIWGAKMUSQO",
].map((cs) => cs.split("").map(ord));

const REVERSE_PERMUTATIONS = PERMUTATIONS.map((ns) => {
  let rs = Array(26).fill(null);
  ns.map((n, i) => {
    rs[n] = i;
  });
  return rs;
});

const REFLECTOR = "EJMZALYXVBWFCRQUONTSPIKHGD".split("").map(ord);

const initialWires = () => ({
  keyboard: [],
  plugboard: [],
  rotorboard: [],
  lampboard: [],
  delay: 0,
  current: undefined,
});

function wiresReducer(state, action) {
  let delay = state.delay;
  let value = char(action.value);
  switch (action.step) {
    case "key":
      state.keyboard = [
        { s: action.value, t: "port", delay: delay++, type: "key", value: value },
      ];
      state.delay = delay;
      state.current = action.value;
      return state;
    case "plug":
      // Connect to the plugboard.
      switch (action.direction) {
        case "in":
          state.plugboard.push({
            s: "portIn",
            t: state.current,
            delay: delay++,
            type: "plug-in-key",
            value: char(state.current),
          });
          break;
        case "out":
          state.rotorboard.push({
            s: `2-${state.current}`,
            t: "out-port",
            delay: delay++,
            type: "rotor-out",
            value: char(state.current),
          });
          state.plugboard.push({
            s: "portRot",
            t: state.current,
            delay: delay++,
            type: "plug-in-rot",
            value: char(state.current),
          });
          break;
      }
      // Pass through plugboard cable.
      if (action.value !== state.current) {
        state.plugboard.push({
          s: state.current,
          t: action.value,
          delay: delay++,
          type: "plug-switch",
          value: char(state.current),
        });
      }
      // Move out the plugboard.
      switch (action.direction) {
        case "in":
          state.plugboard.push({
            s: action.value,
            t: "portRot",
            delay: delay++,
            type: "plug-out-rot",
            value: value,
          });
          state.rotorboard.push({
            s: "in-port",
            t: `2-${action.value}`,
            delay: delay++,
            type: "rotor-in",
            value: value,
          });
          break;
        case "out":
          state.plugboard.push({
            s: action.value,
            t: "portOut",
            delay: delay++,
            type: "plug-out-lamp",
            value: value,
          });
          state.lampboard = [
            { s: "port", t: action.value, delay: delay++, type: "lamp-in", value: value },
          ];
          break;
      }
      state.delay = delay;
      state.current = action.value;
      return state;
    case "rotors":
      const ROUTE_MAP = {
        in: [
          [0, "reflector"],
          [1, 0],
          [2, 1],
        ],
        out: [
          ["reflector", 0],
          [0, 1],
          [1, 2],
        ],
      };
      const [s, t] = ROUTE_MAP[action.direction][action.number];
      state.rotorboard.push({
        s: `${s}-${action.value}`,
        t: `${t}-${action.value}`,
        delay: delay++,
        type: "rotor-mid",
        value: value,
      });
      state.delay = delay;
      state.current = action.value;
      return state;
    case "clear":
      return initialWires();
    default:
      state.current = action.value;
      return state;
  }
}

export function Enigma({}) {
  const [rotors, setRotors] = useState([
    { position: ord("A"), turnover: ord("R") },
    { position: ord("E"), turnover: ord("F") },
    { position: ord("M"), turnover: ord("W") },
  ]);

  const [switches, setSwitches] = useState([
    ["a", "b"],
    ["p", "y"],
  ]);
  // Recomputes the switches permutation whenever the switches have changed.
  const switchesPermutation = useMemo(() => {
    const perm = [...Array(26).keys()];
    switches.map(([a, b]) => {
      perm[ord(a)] = ord(b);
      perm[ord(b)] = ord(a);
    });
    return perm;
  }, [switches]);

  const [lamp, setLamp] = useState(null);

  const [wires, setWires] = useReducer(wiresReducer, undefined, initialWires);
  
  const [clicked, setClicked] = useState(null);

  const click = (c) => {
    setRotors((rotors) => {
      const rs = rotors.slice();
      let turnover = true;
      for (const i of [2, 1, 0]) {
        rs[i].position = (rotors[i].position + 1) % 26;
        turnover = rs[i].position === rs[i].turnover;
        if (!turnover) {
          break;
        }
      }
      return rs;
    });

    // Compute the permutation and activate the wires.
    let curr = ord(c);
    setWires({ step: "key", value: curr });
    curr = switchesPermutation[curr];
    setWires({ step: "plug", direction: "in", value: curr });
    for (const i of [2, 1, 0]) {
      curr = (curr + rotors[i].position) % 26;
      curr = PERMUTATIONS[i][curr];
      curr = (curr + 26 - rotors[i].position) % 26;
      setWires({ step: "rotors", direction: "in", number: i, value: curr });
    }
    curr = REFLECTOR[curr];
    for (const i of [0, 1, 2]) {
      setWires({ step: "rotors", direction: "out", number: i, value: curr });
      curr = (curr + rotors[i].position) % 26;
      curr = REVERSE_PERMUTATIONS[i][curr];
      curr = (curr + 26 - rotors[i].position) % 26;
    }
    setWires({ value: curr });
    curr = switchesPermutation[curr];
    setWires({ step: "plug", direction: "out", value: curr });
    setLamp(curr);
  };

  const unclick = () => {
    setLamp(null);
    setWires({ step: "clear" });
  };

  const keydown = (event) => {
    if (event.repeat) {
      return
    }
    if (event.ctrlKey || event.metaKey) {
      return
    }
    if (event.key.length !== 1) {
      return
    }
    let key = event.key;
    if (key >= "A" && key <= "Z") {
      key = key.toLowerCase()
    }
    if (key < "a" || key > "z") {
      return;
    }
    click(key);
    setClicked(key);
  }
  
  const keyup = (_) => {
    unclick()
    setClicked(null);
  }

  useEffect(() => {
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup)
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  })

  return html`
    <div class="enigma">
      <${Lampboard} lamp=${lamp} wires=${wires["lampboard"]} />
      <${Rotorboard} rotors=${rotors} wires=${wires["rotorboard"]} />
      <${Keyboard}
        clicked=${clicked}
        click=${click}
        unclick=${unclick}
        wires=${wires["keyboard"]}
      />
      <${Plugboard} wires=${wires["plugboard"]} switches=${switches} />
    </div>
    <div class="legend">
      <p>Press <kbd>A</kbd>-<kbd>Z</kbd> and observe the lamps. Notice the rotor stepping.</p>
      <p>Hold to see the electric current flow.</p>
    </div>
  `;
}
