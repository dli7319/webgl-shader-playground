import { describe, expect, it } from "vitest";
import { conf, language } from "./glsl";

describe("GLSL language configuration", () => {
  it("defines line and block comments", () => {
    expect(conf.comments?.lineComment).toBe("//");
    expect(conf.comments?.blockComment).toEqual(["/*", "*/"]);
  });

  it("brackets match GLSL structure", () => {
    expect(conf.brackets).toContainEqual(["{", "}"]);
    expect(conf.brackets).toContainEqual(["(", ")"]);
    expect(conf.brackets).toContainEqual(["[", "]"]);
  });

  it("has the standard tokenizer states", () => {
    expect(Object.keys(language.tokenizer ?? {})).toEqual(
      expect.arrayContaining(["root", "comment", "string", "whitespace"])
    );
  });
});

describe("keyword coverage", () => {
  it("includes storage qualifiers and types", () => {
    const keywords = language.keywords as string[];
    for (const word of [
      "uniform",
      "varying",
      "const",
      "attribute",
      "sampler2D",
      "vec2",
      "vec3",
      "vec4",
      "mat4",
      "float",
      "int",
      "bool",
      "void",
    ]) {
      expect(keywords).toContain(word);
    }
  });

  it("includes flow control words", () => {
    const keywords = language.keywords as string[];
    for (const word of ["if", "else", "for", "while", "return", "discard"]) {
      expect(keywords).toContain(word);
    }
  });

  it("includes built-in math functions", () => {
    const keywords = language.keywords as string[];
    for (const fn of ["sin", "cos", "pow", "mix", "clamp", "smoothstep", "texture2D"]) {
      expect(keywords).toContain(fn);
    }
  });

  it("includes gl_ builtins used by the default shader", () => {
    const keywords = language.keywords as string[];
    for (const name of ["gl_FragColor", "gl_FragCoord", "gl_Position"]) {
      expect(keywords).toContain(name);
    }
  });
});

describe("operator symbols", () => {
  const symbols = language.symbols as RegExp;

  it("matches GLSL operators", () => {
    for (const op of [
      "+",
      "-",
      "*",
      "/",
      "=",
      "==",
      "<=",
      ">=",
      "!=",
      "&&",
      "||",
      "<<",
      ">>",
    ]) {
      expect(op).toMatch(symbols);
    }
  });

  it("matches compound assignment operators", () => {
    for (const op of ["+=", "-=", "*=", "/=", "<<=", ">>=", "&=", "|=", "^=", "%="]) {
      expect(op).toMatch(symbols);
    }
  });

  it("does not match identifiers or literals", () => {
    expect("foo").not.toMatch(symbols);
    expect("42").not.toMatch(symbols);
    expect(" ").not.toMatch(symbols);
  });
});

describe("number token regexes", () => {
  // Monarch expands `@placeholder` references inside rule regexes when the
  // language is compiled; do the same here before asserting matches.
  const expand = (re: RegExp): RegExp =>
    new RegExp(
      re.source
        .replace("@floatsuffix", `(?:${(language.floatsuffix as RegExp).source})`)
        .replace("@integersuffix", `(?:${(language.integersuffix as RegExp).source})`)
    );

  const rules = (language.tokenizer as Record<string, unknown>).root as Array<
    [RegExp, unknown]
  >;
  const floatRules = rules
    .filter((r) => r[1] === "number.float")
    .map((r) => expand(r[0]));
  const hex = expand(rules.find((r) => r[1] === "number.hex")![0]);
  const binary = expand(rules.find((r) => r[1] === "number.binary")![0]);

  it("has separate exponent and dot float rules", () => {
    expect(floatRules).toHaveLength(2);
  });

  it("float exponent form", () => {
    expect("1e10").toMatch(floatRules[0]);
    expect("2.5E-3").toMatch(floatRules[0]);
  });

  it("float dot form", () => {
    expect("3.14").toMatch(floatRules[1]);
    expect(".5").toMatch(floatRules[1]);
  });

  it("hex and binary integer forms", () => {
    expect("0xFF").toMatch(hex);
    expect("0b1010").toMatch(binary);
  });
});

describe("escape sequences", () => {
  const escapes = language.escapes as RegExp;

  it("matches GLSL string escapes", () => {
    for (const esc of ["\\n", "\\t", "\\\\", '\\"', "\\x41", "\\u0041"]) {
      expect(esc).toMatch(escapes);
    }
  });
});
