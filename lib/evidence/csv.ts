import Papa from "papaparse"
import type { RawCsvRow } from "@/lib/evidence/types"

export function parseCsv<T extends RawCsvRow = RawCsvRow>(csvText: string): T[] {
  const result = Papa.parse<T>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  })

  if (result.errors.length > 0) {
    const fatal = result.errors.find((entry) => entry.code !== "UndetectableDelimiter")
    if (fatal) {
      throw new Error(`CSV parsing failed: ${fatal.message}`)
    }
  }

  return result.data.filter((row) => Object.values(row).some((value) => String(value ?? "").trim().length > 0))
}

