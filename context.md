# plex — Project Context

This file is written for a new AI session. Read it first, then continue work.

---

## 1. What this project is

A small compiler toolkit in plain JavaScript (Node.js, ES-modules).
Three stages, each is a separate executable:

```
lexer.js  ->  tokens.json
parser.js ->  parser.compiled.js
runner.js ->  output.text
```

The parser is an LR(0) automaton generator. The project is being extended to LALR(1).

---

## 2. Files

| Path | Role |
|---|---|
| `src/lexer.js` | Lexer. Builds rules and tokenizes input. |
| `src/parser.js` | Parser generator. Builds states and the action table. |
| `src/runner.js` | Runs the table over tokens. |
| `src/actions.js` | Shared helper functions for lexer callbacks and grammar callbacks. |
| `src/commons/bunch.class.js` | `Bunch` — ordered collection with a Map index by `key`. |
| `src/commons/filesys.js` | File helpers: read, write, import. |
| `src/commons/utils.js` | Misc helpers: `splitByBlanks`, `parseArgs`, `compact`, `pad`. |
| `src/models/entity.class.js` | `Entity` — grammar symbol. |
| `src/models/rule.class.js` | `Rule` — production with a callback. |
| `src/models/snap.class.js` | `Snap` — LR(0) item. |
| `src/models/ext-snap.class.js` | `ExtSnap` — LR(1) item (Snap + lookouts). |
| `src/models/state.class.js` | `State` — a set of snaps. |
| `resources/lexer.rules.js` | Lexer rules. |
| `resources/parser.rules.js` | Grammar rules with callbacks. |
| `resources/input.txt` | Input text for the lexer. |
| `resources/*.compiled.js` | Generated modules. Do not edit by hand. |

---

## 3. Terms

- **Entity** — a grammar symbol. `isNode` marks a non-terminal.
- **Rule** — a production `A -> seq` with an optional `callback`.
- **Snap** — an LR(0) item: a rule plus a dot position `dp`.
- **ExtSnap** — an LR(1) item: a `Snap` plus a `Bunch<Entity>` of lookouts.
- **State** — a `Bunch` of snaps, plus an `id`.
- **Bunch** — ordered collection indexed by `key`. Behaves both as a set and as a list.
- **Lookout** — a terminal that may follow a rule in some context. Same as lookahead. We use the short word ``lookout``.
- **key** — string identity of a model. Computed in the constructor. For `State` it is recomputed in the `snaps` setter.
- **coreKey** — key of an `ExtSnap` without lookouts. Used to merge LALR states.
- **initials** — the FIRST set: names of the terminals that can start a symbol or a sequence. Stored on `Entity` as `string[]`; `Parser.entitiesByName(names)` turns a list back into a `Bunch<Entity>`.
- **canVanish** — true if a symbol can produce the empty string. Always false for a terminal. The flag is set by `computeInitials()`; a sequence can vanish if every symbol in it can.

### Entity sentinels

| Name | Value | Meaning |
|---|---|---|
| `Entity.FIRST` | `^^` | Augmented start symbol. |
| `Entity.ANY` | `...` | Wildcard key used by the LR(0) table for reduce. |
| `Entity.EMPTY` | `$$` | Epsilon in grammar rules. |
| `Entity.NONE` | `$$$` | Returned by `Snap.pointed` when the dot is at the end. |
| `Entity.EOF` | `$` | End of input. Used by LR(1)/LALR(1). |

### Actions

| Action | Meaning |
|---|---|
| `LEAD` | GOTO over a non-terminal. |
| `MOVE` | SHIFT over a terminal. |
| `FOLD` | REDUCE by a rule. |
| `ACCEPT` | Done. |
| `ERROR` | No action in the table. |

---

## 4. Entry points

```bash
node src/lexer.js -b -t     # build lexer rules, then tokenize
node src/parser.js           # build states and table -> parser.compiled.js
node src/runner.js           # run parser -> output.text
```

Flags for the lexer:

- `-b` / `--build` — compile rules into `lexer.compiled-rules.js`.
- `-t` / `--tokenize` — tokenize `input.txt` into `tokens.json`.
- no flags — do nothing, exit 0.

Any `key=value` argument overrides the defaults in `settings`.

---

## 5. Current state

Working end to end with the LR(0) automaton:

```
(9 - 4) * 3   ->   s_push_1 9 / s_push_1 4 / s_sub_2 / s_push_1 3 / s_mul_2
```

Already done for LALR(1):

- `ExtSnap` — full class, not yet wired into the algorithm.
- `Entity.NONE` and `Entity.EOF`.
- `Snap.pointed` returns `Entity.NONE` at the end of a rule.
- `Bunch` — `Map` index, `Symbol.iterator`, `from` for any iterable, `slice`, strict `flatMap`, `every`, `toJSON` (serializes as `data`, rebuild with `Bunch.from`).
- `Action.ACCEPT` and `Action.ERROR` in `parser.js` and `runner.js`.
- `computeInitials()`, `seqInitials(seq)`, `seqCanVanish(seq)`, `initials(seq, lookouts)` and `entitiesByName(names)` in `Parser`. Initials are arrays of names; the Sets inside `computeInitials` are only the running state.
- `Parser` is exported for debugging.

---

## 6. Next steps (LALR(1) plan)

Ordered. Each step must keep the pipeline working.

1. ~~Initials and canVanish~~ (done).
2. ~~Refactor step 1 into a single `seqInitials(seq)` helper~~ (done, plus `seqCanVanish(seq)`).
3. `State` -> `Bunch<ExtSnap>`: `coreKey()`, `mergeLookouts(other)`.
4. `getNodedSnaps(node, lookouts)` and `ngen` with lookouts.
5. Build LR(1) states, then merge states by `coreKey()`.
6. Table: `FOLD` per concrete lookout, `ACCEPT` on `Entity.EOF`, conflict detection.
7. Runner: drop the `...` fallback, use the current token as the lookout.
8. Tests: dangling else, assignment grammar `L -> *R | id`, `R -> L`.

---

## 7. Decided conventions

Do not re-propose these; they are already agreed.

- Keep action names `LEAD`, `MOVE`, `FOLD`. Only added `ACCEPT` and `ERROR`.
- Use the word ``lookout`` instead of ``lookahead`` everywhere.
- Initials live on `Entity` as `string[]` of terminal names. A `Bunch<Entity>` in every entity was rejected: the set is a value, and names are cheap. `entitiesByName(names)` rebuilds a `Bunch<Entity>` when real entities are needed.
- Use `canVanish` instead of `nullable`. The flag lives on `Entity`, a terminal never vanishes, and the getter enforces that.
- Keep the `ngen` / `convolute` split also for LR(1).
- Do **not** touch `convolute`: it is a generic fixed-point loop and does not care what `ngen` returns.
- `ExtSnap` constructor takes a `Bunch` of lookouts. No default. Discipline, not guards.
- `Bunch.from` accepts any iterable. `Bunch.flatMap` requires the callback to return an iterable.
- `Bunch` has an internal `Map` index, so `add` / `has` / `findByKey` are O(1).
- `key` is a property computed in the constructor, not a method.
- For `State`, `key` is recomputed in the setter of `snaps`.
- Prefer declarative code over loops when a known pattern applies (`map`, `filter`, `every`, `flatMap`).
- No `new Function` in the runtime. Generated modules import `Act` from `src/actions.js`.

---

## 8. Known risks

- `mergeLookouts` changes `ExtSnap.key` while the snap is already inside a `Bunch`. The index can go stale. Reassign `state.snaps` through the setter after merging.
- `State.counter` is static. Reset it before the LALR merge, or ids will keep growing.
- An empty right side (`$$`) must be handled by `initials()`: a vanishing sequence returns the lookouts.
- `Entity.EMPTY` is not the instance stored in `parser.entities`: `parseRules` drops `$$` from rule sequences and `entities.add` skips it as a duplicate key. Compare by `.name` or filter `$$` out.
- `ExtSnap.tail` is built from `rule.seq.slice(...)`, so a rule with no symbols gives an empty tail. An empty sequence can vanish, so `initials()` returns the lookouts.
- `rule.node` is an `Entity` from `this.entities`, not the static `Entity.FIRST`. Compare by `.name`.

---

## 9. Git history (recent)

```
Action ACCEPT/ERROR, iterable Bunch, ExtSnap lookouts
Precalculated keys, indexed Bunch, Entity.NONE sentinel.
improvments, added docs
```
