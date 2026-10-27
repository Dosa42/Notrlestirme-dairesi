import { useEffect, useState } from "react";
import { SEED, type RecordRow } from "@/lib/book";

const KEY = "notr-daire-rows-v1";

export function loadRows(): RecordRow[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as RecordRow[];
    if (!Array.isArray(parsed)) return SEED;
    return parsed;
  } catch {
    return SEED;
  }
}

export function saveRows(rows: RecordRow[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function useRows() {
  const [rows, setRows] = useState<RecordRow[]>(SEED);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setRows(loadRows());
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) saveRows(rows);
  }, [rows, ready]);
  return { rows, setRows, ready };
}
