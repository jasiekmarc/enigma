// @ts-check

// @ts-ignore
import { useLayoutEffect, useRef } from "preact";

// Returns the order of the character (a or A maps to 0, b or B to 1, ...).
export function ord(/** @type string */ c) {
  const smallA = "a".charCodeAt(0);
  const smallZ = "z".charCodeAt(0);
  const capitA = "A".charCodeAt(0);
  const code = c.charCodeAt(0);
  if (smallA <= code && code <= smallZ) {
    return code - smallA;
  }
  return code - capitA;
}

// Returns the small letter of alphabet of the given order.
export function char(/** @type number */ i) {
  return String.fromCharCode("a".charCodeAt(0) + i);
}

// Creates a ref and instructs Preact to update the state with its dimensions.
//
// An optional argument rootRef is a DOM element relative to which the
// dimensions will be computed.
export function createRefForDimensions(key, setDimensions, rootRef = null) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    const parent = (rootRef && rootRef.current) || ref.current.offsetParent;
    const refRect = ref.current.getBoundingClientRect();
    if (!parent) {
      return;
    }
    const parRect = parent.getBoundingClientRect();
    // Handle the scaling of entire component (Reveal.js does that).
    const scale =
      parRect.width !== 0 ? parent.offsetWidth / parRect.width : 1;
    setDimensions((oldDimensions) => ({
      ...oldDimensions,
      [key]: {
        x:
          scale *
          (refRect.left - parRect.left + (refRect.right - refRect.left) / 2),
        y:
          scale *
          (refRect.top - parRect.top + (refRect.bottom - refRect.top) / 2),
      },
    }));
  }, []);
  return ref;
}
