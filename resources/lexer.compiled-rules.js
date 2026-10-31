import * as Act from '../src/actions.js';
export default [
  { type: "(", re: null, substr: "(", callback: ($) => Act.same($) },
  { type: ")", re: null, substr: ")", callback: ($) => Act.same($) },
  { type: "+", re: null, substr: "+", callback: ($) => Act.same($) },
  { type: "-", re: null, substr: "-", callback: ($) => Act.same($) },
  { type: "*", re: null, substr: "*", callback: ($) => Act.same($) },
  { type: "/", re: null, substr: "/", callback: ($) => Act.same($) },
  { type: "!", re: null, substr: "!", callback: ($) => Act.same($) },
  { type: "NUM", re: /-?\d+(\.\d+)?/, substr: null, callback: ($) => Act.float($) },
  { type: "BLANK", re: /\s+/, substr: null, callback: () => Act.ignore() }
];
