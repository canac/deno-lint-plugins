/**
 * Applies fixes the way `deno lint --fix` does, and returns the fixed source.
 *
 * Each pass applies every fix whose range neither overlaps nor duplicates one
 * already applied in that pass, then re-lints the result.
 *
 * @param source Source text to lint and fix.
 * @param lint Runs the plugin under test against a source text.
 * @throws If the fixes have not converged after ten passes.
 */
export function applyFixes(
  source: string,
  lint: (source: string) => Deno.lint.Diagnostic[],
): string {
  let result = source;

  for (let pass = 0; pass < 10; pass++) {
    const fixes = lint(result)
      .flatMap((diagnostic) => diagnostic.fix ?? [])
      .toSorted((a, b) => a.range[0] - b.range[0]);

    const applied: Deno.lint.Fix[] = [];
    let appliedEnd = -1;
    for (const fix of fixes) {
      const duplicate = applied.some(
        (other) =>
          other.range[0] === fix.range[0] && other.range[1] === fix.range[1],
      );
      if (duplicate || fix.range[0] < appliedEnd) {
        continue;
      }
      applied.push(fix);
      appliedEnd = fix.range[1];
    }

    let next = result;
    for (const fix of applied.toReversed()) {
      next = next.slice(0, fix.range[0]) + fix.text + next.slice(fix.range[1]);
    }
    if (next === result) {
      return result;
    }
    result = next;
  }

  throw new Error("fixes did not converge");
}
