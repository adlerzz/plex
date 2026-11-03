# Plex

Plex is a small compiler/interpreter building toolkit.
It has three parts:

1. **Lexer** — reads text and makes tokens.
2. **Parser generator** — builds an LR(0) automaton from a grammar.
3. **Runner** — uses the automaton to read tokens and run semantic actions.

## Files

| File / Folder | Purpose |
|---|---|
| `src/lexer.js` | Splits input text into tokens using lexer rules. |
| `src/parser.js` | Reads grammar rules and builds a parsing table. |
| `src/runner.js` | Reads tokens and the parsing table, runs the parser. |
| `src/actions.js` | Helper functions used in lexer and parser rules. |
| `src/commons/` | Small shared helpers: `Bunch`, file tools, utilities. |
| `src/models/` | Core data classes: `Entity`, `Rule`, `Snap`, `State`, `ExtSnap`. |
| `resources/` | Input files, rule files, and generated compiled files. |

## Terminology

| Term | Meaning |
|---|---|
| **Token** | A small piece of input text with a type and value, like a number or a plus sign. |
| **Entity** | A symbol in the grammar. It can be a terminal (token) or a non-terminal (node). |
| **Rule** | A grammar production, for example `Expr → Ex1 TailEx2`. |
| **Snap** | An LR item: a rule with a dot showing how much is already matched. |
| **ExtSnap** | A Snap plus lookout symbols. Used for LR(1) / LALR(1). |
| **State** | A set of Snaps in the LR automaton. |
| **Lookout** | A terminal symbol that follows a rule in some context. Used by LR(1) / LALR(1) to decide when to reduce. |
| **Action** | What the runner does next: `MOVE` (shift), `FOLD` (reduce), or `LEAD` (goto). |
| **Callback** | A function run when a lexer rule matches or a parser rule folds. |

## How to run

### 1. Build lexer rules and tokenize input

```bash
node src/lexer.js -b -t
```

- `-b` builds the compiled lexer rules file.
- `-t` reads input text and writes tokens.

### 2. Build the parser table

```bash
node src/parser.js
```

This writes `resources/parser.compiled.js`.

### 3. Run the parser

```bash
node src/runner.js
```

This reads tokens and the parser table and writes `resources/output.text`.

