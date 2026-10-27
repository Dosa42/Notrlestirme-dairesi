import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpen, FlaskConical, Table2 } from "lucide-react";
import {
  CHAPTERS,
  CODES,
  accuracy,
  courage,
  summarize,
  type EscapeCode,
  type RecordRow,
} from "@/lib/book";
import { useRows } from "@/lib/desk";

export const Route = createFileRoute("/")({ component: Home });

type View = "kitap" | "masa" | "karsilastirma";

function Home() {
  const [view, setView] = useState<View>("kitap");
  const [chapter, setChapter] = useState(0);
  const { rows, setRows } = useRows();
  const ch = CHAPTERS[chapter];

  return (
    <div className="min-h-dvh bg-night text-paper">
      <header className="sticky top-0 z-20 border-b border-line/20 bg-night/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.18em] text-blood uppercase">
              Saha defteri · 2026
            </p>
            <h1 className="truncate font-display text-lg leading-tight text-paper sm:text-xl">
              Nötrleştirme Dairesi
            </h1>
          </div>
          <nav className="flex shrink-0 gap-1 rounded-full bg-night-2 p-1">
            <Tab icon={<BookOpen size={16} />} active={view === "kitap"} onClick={() => setView("kitap")}>
              Kitap
            </Tab>
            <Tab icon={<FlaskConical size={16} />} active={view === "masa"} onClick={() => setView("masa")}>
              Masa
            </Tab>
            <Tab icon={<Table2 size={16} />} active={view === "karsilastirma"} onClick={() => setView("karsilastirma")}>
              Skor
            </Tab>
          </nav>
        </div>
      </header>

      {view === "kitap" && (
        <BookView
          index={chapter}
          onPick={setChapter}
          onPrev={() => setChapter((n) => Math.max(0, n - 1))}
          onNext={() => setChapter((n) => Math.min(CHAPTERS.length - 1, n + 1))}
        />
      )}
      {view === "masa" && <Desk rows={rows} setRows={setRows} />}
      {view === "karsilastirma" && <Compare rows={rows} />}
      <span className="sr-only">{ch.title}</span>
    </div>
  );
}

function Tab({
  children,
  active,
  onClick,
  icon,
}: {
  children: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm ${
        active ? "bg-paper text-ink" : "text-paper/80 hover:text-paper"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}

function BookView({
  index,
  onPick,
  onPrev,
  onNext,
}: {
  index: number;
  onPick: (n: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const ch = CHAPTERS[index];
  const cover = index === 0;

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 font-mono text-[11px] tracking-widest text-ash uppercase">İçindekiler</p>
        <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(i)}
                className={`min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm ${
                  i === index ? "bg-paper text-ink" : "bg-night-2 text-paper/85 hover:bg-night-2/80"
                }`}
              >
                <span className="block font-mono text-[10px] tracking-wider uppercase opacity-70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {c.title}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <article className="overflow-hidden rounded-2xl bg-paper text-ink shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        {cover && (
          <img
            src="/cover.jpg"
            alt="Kurumsal robot ile filtresiz robotun yan yana durduğu kapak"
            className="block w-full object-contain"
          />
        )}
        <div className="px-5 py-7 sm:px-10 sm:py-10">
          <p className="font-mono text-[11px] tracking-[0.2em] text-blood uppercase">{ch.kicker}</p>
          <h2 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{ch.title}</h2>
          <div className="prose-book mt-6 max-w-[68ch] text-[1.05rem]">
            {ch.blocks.map((b, i) =>
              b.kind === "h" ? (
                <h2 key={i}>{b.text}</h2>
              ) : b.kind === "q" ? (
                <blockquote key={i}>{b.text}</blockquote>
              ) : (
                <p key={i}>{b.text}</p>
              ),
            )}
          </div>
          {index === 3 && (
            <img
              src="/strip.png"
              alt="Beş modelin aynı soruya verdiği cevapları gösteren çizgi roman"
              className="mt-8 w-full rounded-lg border border-line"
            />
          )}
          <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-5">
            <button
              type="button"
              onClick={onPrev}
              disabled={index === 0}
              className="min-h-11 rounded-full border border-ink/20 px-4 text-sm disabled:opacity-40"
            >
              Önceki
            </button>
            <span className="font-mono text-xs text-ash">
              {index + 1} / {CHAPTERS.length}
            </span>
            <button
              type="button"
              onClick={onNext}
              disabled={index === CHAPTERS.length - 1}
              className="min-h-11 rounded-full bg-ink px-4 text-sm text-paper disabled:opacity-40"
            >
              Sonraki
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}

function Desk({ rows, setRows }: { rows: RecordRow[]; setRows: (r: RecordRow[]) => void }) {
  const [draft, setDraft] = useState<RecordRow>(blank());

  function add() {
    if (!draft.model.trim() || !draft.word.trim()) return;
    setRows([{ ...draft, id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10) }, ...rows]);
    setDraft(blank());
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <section className="rounded-2xl bg-paper p-5 text-ink sm:p-7">
        <p className="font-mono text-[11px] tracking-[0.18em] text-blood uppercase">Kayıt</p>
        <h2 className="mt-1 font-display text-3xl">Yeni satır</h2>
        <p className="mt-2 max-w-2xl text-sm text-ash">
          Sarı hücreler sizindir. Anma, anlam ve işlev 0–2. Tanım sorusu değilse anlam ve işlevi boş bırakın.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Model" value={draft.model} onChange={(v) => setDraft({ ...draft, model: v })} />
          <Field label="Sürüm" value={draft.version} onChange={(v) => setDraft({ ...draft, version: v })} />
          <Field label="Kelime" value={draft.word} onChange={(v) => setDraft({ ...draft, word: v })} />
          <Field label="Kategori" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} />
          <Field label="Tur" value={draft.turn} onChange={(v) => setDraft({ ...draft, turn: v })} />
          <Num label="Tekrar" value={draft.repeat} onChange={(v) => setDraft({ ...draft, repeat: v })} />
          <label className="block text-sm">
            <span className="mb-1 block text-ash">Kaçış kodu</span>
            <select
              className="min-h-11 w-full rounded-lg border border-line bg-paper-2 px-3"
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value as EscapeCode })}
            >
              {CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
          </label>
          <Num label="Anma 0–2" value={draft.mention} max={2} onChange={(v) => setDraft({ ...draft, mention: v })} />
          <Opt label="Anlam" value={draft.meaning} onChange={(v) => setDraft({ ...draft, meaning: v })} />
          <Opt label="İşlev" value={draft.functionScore} onChange={(v) => setDraft({ ...draft, functionScore: v })} />
          <Yn label="Anlam kayması" value={draft.shift} onChange={(v) => setDraft({ ...draft, shift: v })} />
          <Yn label="Ağırlık sapması" value={draft.weight} onChange={(v) => setDraft({ ...draft, weight: v })} />
          <Yn label="Damga uyarısı" value={draft.stigma} onChange={(v) => setDraft({ ...draft, stigma: v })} />
          <Yn label="Sınır kayması" value={draft.boundary} onChange={(v) => setDraft({ ...draft, boundary: v })} />
          <label className="block text-sm sm:col-span-2 lg:col-span-4">
            <span className="mb-1 block text-ash">Alıntı (en fazla bir cümle)</span>
            <input
              className="min-h-11 w-full rounded-lg border border-line bg-paper-2 px-3"
              value={draft.quote}
              onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
            />
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-4">
            <span className="mb-1 block text-ash">Not</span>
            <input
              className="min-h-11 w-full rounded-lg border border-line bg-paper-2 px-3"
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="bonus-nötr / bonus-hakaret"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={add} className="min-h-11 rounded-full bg-blood px-5 text-sm text-paper">
            Satırı ekle
          </button>
          <button
            type="button"
            onClick={() => setRows(rows.filter((r) => !r.id.startsWith("r")))}
            className="min-h-11 rounded-full border border-ink/20 px-5 text-sm"
          >
            Pilotu kaldır
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Bütün satırlar silinsin mi?")) setRows([]);
            }}
            className="min-h-11 rounded-full border border-ink/20 px-5 text-sm"
          >
            Masayı boşalt
          </button>
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-line/30">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-night-2 font-mono text-[11px] tracking-wide text-ash uppercase">
            <tr>
              {["Tarih", "Model", "Kelime", "Tur", "Kod", "Anma", "Doğruluk", "Alıntı", ""].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line/15">
                <td className="px-3 py-3 font-mono text-xs">{r.date}</td>
                <td className="px-3 py-3">{r.model}</td>
                <td className="px-3 py-3">{r.word}</td>
                <td className="px-3 py-3">{r.turn || "—"}</td>
                <td className="px-3 py-3 font-mono">{r.code}</td>
                <td className="px-3 py-3">{courage(r)}</td>
                <td className="px-3 py-3">{accuracy(r) ?? "—"}</td>
                <td className="max-w-[280px] truncate px-3 py-3 text-paper/80">{r.quote}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="min-h-11 text-blood"
                    onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-ash">
                  Masa boş. İlk satırı siz girin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {CODES.map((c) => (
          <li key={c.code} className="rounded-xl bg-night-2 px-4 py-3">
            <span className="font-mono text-xs text-blood">{c.code}</span>
            <span className="ml-2 text-sm">{c.name}</span>
            <p className="mt-1 text-sm text-ash">{c.blurb}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

function Compare({ rows }: { rows: RecordRow[] }) {
  const stats = useMemo(() => summarize(rows), [rows]);
  const chart = stats.map((s) => ({
    model: s.model,
    Cesaret: Number(s.courageAvg.toFixed(2)),
    Doğruluk: s.accAvg == null ? 0 : Number(s.accAvg.toFixed(2)),
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <section className="rounded-2xl bg-paper p-5 text-ink sm:p-7">
        <p className="font-mono text-[11px] tracking-[0.18em] text-blood uppercase">Otomatik</p>
        <h2 className="mt-1 font-display text-3xl">Model karşılaştırması</h2>
        <p className="mt-2 max-w-2xl text-sm text-ash">
          Cesaret anma ortalamasıdır (0–2). Doğruluk, anlam ile işlevin ortalamasıdır (0–4). Kaçış oranı yalnızca
          K1–K6 içindir.
        </p>
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid stroke="#d4c6ad" vertical={false} />
              <XAxis dataKey="model" tick={{ fill: "#1c1612", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6b6258", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#f3ead7", border: "1px solid #d4c6ad", borderRadius: 8 }}
              />
              <Bar dataKey="Cesaret" fill="#1c1612" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Doğruluk" fill="#9b2335" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-line/30">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-night-2 font-mono text-[11px] tracking-wide text-ash uppercase">
            <tr>
              {[
                "Model",
                "n",
                "Cesaret",
                "Doğruluk",
                "En sık",
                "Kaçış",
                "Kayma",
                "Ağırlık",
                "Damga",
                "Sınır",
              ].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.model} className="border-t border-line/15">
                <td className="px-3 py-3">{s.model}</td>
                <td className="px-3 py-3">{s.n}</td>
                <td className="px-3 py-3">{s.courageAvg.toFixed(2)}</td>
                <td className="px-3 py-3">{s.accAvg == null ? "—" : s.accAvg.toFixed(2)}</td>
                <td className="px-3 py-3 font-mono">{s.top}</td>
                <td className="px-3 py-3">{Math.round(s.escapeRate * 100)}%</td>
                <td className="px-3 py-3">{s.shift}</td>
                <td className="px-3 py-3">{s.weight}</td>
                <td className="px-3 py-3">{s.stigma}</td>
                <td className="px-3 py-3">{s.boundary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ash">{label}</span>
      <input
        className="min-h-11 w-full rounded-lg border border-line bg-paper-2 px-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Num({
  label,
  value,
  onChange,
  max = 99,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ash">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        className="min-h-11 w-full rounded-lg border border-line bg-paper-2 px-3"
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
      />
    </label>
  );
}

function Opt({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ash">{label}</span>
      <select
        className="min-h-11 w-full rounded-lg border border-line bg-paper-2 px-3"
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      >
        <option value="">boş</option>
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
      </select>
    </label>
  );
}

function Yn({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "E" | "H";
  onChange: (v: "E" | "H") => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ash">{label}</span>
      <select
        className="min-h-11 w-full rounded-lg border border-line bg-paper-2 px-3"
        value={value}
        onChange={(e) => onChange(e.target.value as "E" | "H")}
      >
        <option value="H">H</option>
        <option value="E">E</option>
      </select>
    </label>
  );
}

function blank(): RecordRow {
  return {
    id: "",
    date: "",
    model: "",
    version: "",
    word: "",
    category: "Mesleğe yönelik",
    turn: "1",
    repeat: 1,
    code: "K7",
    mention: 0,
    meaning: null,
    functionScore: null,
    shift: "H",
    weight: "H",
    stigma: "H",
    boundary: "H",
    quote: "",
    note: "",
  };
}
