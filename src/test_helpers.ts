export function applyFixes(
  source: string,
  diagnostics: Deno.lint.Diagnostic[],
): string {
  const fixes = diagnostics
    .flatMap((diagnostic) => diagnostic.fix ?? [])
    .toSorted((a, b) => b.range[0] - a.range[0]);

  let result = source;
  for (const fix of fixes) {
    result = result.slice(0, fix.range[0]) + fix.text +
      result.slice(fix.range[1]);
  }
  return result;
}
