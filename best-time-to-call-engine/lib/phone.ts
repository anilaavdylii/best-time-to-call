import { TOLL_FREE, VALID_STATES, stateForAreaCode } from "./areaCodes";

export type ParsedNumber = {
  phone: string; // normalized, e.g. "+14155550101"
  state: string; // "CA"
  source: "area-code" | "manual"; // estimated from the number, or typed by the user
};

export type ParseError = {
  line: number; // 1-based line in the pasted text
  raw: string; // the line as typed
  reason: string;
};

export type ImportResult = {
  added: number; // new contacts saved
  alreadySaved: number; // valid, but this workspace already had them
  repeated: number; // the same number pasted twice in one go
  invalid: ParseError[]; // lines we skipped, with the reason
};

const MAX_LINES = 2000;

// US/Canada numbers look like NXX NXX XXXX, where N is a digit from 2 to 9.
const NANP = /^[2-9]\d{2}[2-9]\d{6}$/;

/**
 * Turns the pasted text into clean numbers.
 * One number per line, with an optional state after a comma:
 *   +1 415-555-0101
 *   (212) 555-0142, NY
 */
export function parsePhoneLines(text: string) {
  const valid: ParsedNumber[] = [];
  const invalid: ParseError[] = [];
  const seen = new Set<string>();
  let repeated = 0;

  const lines = text.split(/\r?\n/);
  if (lines.length > MAX_LINES) {
    return {
      valid,
      invalid: [
        {
          line: 0,
          raw: "",
          reason: `Paste at most ${MAX_LINES} lines at a time.`,
        },
      ],
      repeated,
    };
  }

  lines.forEach((rawLine, i) => {
    const raw = rawLine.trim();
    if (!raw) return; // skip blank lines
    const line = i + 1;
    const fail = (reason: string) => invalid.push({ line, raw, reason });

    // "number, STATE": split on the first comma only
    const comma = raw.indexOf(",");
    const numberPart = comma === -1 ? raw : raw.slice(0, comma);
    const statePart =
      comma === -1
        ? ""
        : raw
            .slice(comma + 1)
            .trim()
            .toUpperCase();

    // keep only the digits, and drop a leading country code 1
    let digits = numberPart.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1"))
      digits = digits.slice(1);

    if (digits.length !== 10)
      return fail("Not a valid US number (needs 10 digits).");
    if (!NANP.test(digits)) return fail("Not a valid US number format.");

    const areaCode = digits.slice(0, 3);
    if (TOLL_FREE.has(areaCode))
      return fail("Toll-free numbers have no state.");

    // work out the state: the user's choice wins over our estimate
    let state: string | null;
    let source: ParsedNumber["source"];
    if (statePart) {
      if (!VALID_STATES.has(statePart))
        return fail(`“${statePart}” is not a state code.`);
      state = statePart;
      source = "manual";
    } else {
      state = stateForAreaCode(areaCode);
      source = "area-code";
      if (!state) {
        return fail(
          `Unknown area code ${areaCode}. Add a state after a comma, like “, CA”.`,
        );
      }
    }

    const phone = `+1${digits}`;
    if (seen.has(phone)) {
      repeated++;
      return;
    }
    seen.add(phone);
    valid.push({ phone, state, source });
  });

  return { valid, invalid, repeated };
}
