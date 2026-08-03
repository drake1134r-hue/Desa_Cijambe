import { findMany } from "@/lib/db/index";
import { organizationStructures } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type OrganizationMember = {
  id?: string | number;
  name?: string;
  title?: string;
  position?: string;
  description?: string;
  role?: string;
  photo_url?: string | null;
};

const titlePriority: Record<string, number> = {
  "bpd": 0,
  "kepala desa": 1,
  "sekretaris desa": 2,
};

function getCategory(title?: string, position?: string) {
  const normalized = String(title ?? position ?? "").toLowerCase();
  if (normalized.includes("bpd")) return "top";
  if (normalized.includes("kepala desa")) return "top";
  if (normalized.includes("sekretaris desa")) return "top";
  if (normalized.includes("kasi")) return "kasie";
  if (normalized.includes("kaur")) return "kaur";
  if (normalized.includes("kepala dusun") || normalized.includes("kadus")) return "kadus";
  return "other";
}

function sortByCategoryAndName(a: OrganizationMember, b: OrganizationMember) {
  const categoryA = getCategory(a.title, a.position);
  const categoryB = getCategory(b.title, b.position);

  if (categoryA !== categoryB) {
    return categoryA.localeCompare(categoryB);
  }

  const titleA = String(a.title ?? a.position ?? "").toLowerCase();
  const titleB = String(b.title ?? b.position ?? "").toLowerCase();
  const priorityA = titlePriority[titleA] ?? 99;
  const priorityB = titlePriority[titleB] ?? 99;

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  return String(a.title ?? a.position ?? a.name ?? "").localeCompare(String(b.title ?? b.position ?? b.name ?? ""));
}

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function TierConnector() {
  return (
    <div className="flex flex-col items-center py-2" aria-hidden="true">
      <div className="h-6 w-px bg-emerald-200" />
      <div className="h-2 w-2 rounded-full border-2 border-emerald-300 bg-white" />
      <div className="h-6 w-px bg-emerald-200" />
    </div>
  );
}

function Avatar({
  name,
  photoUrl,
  size = "md",
}: {
  name?: string;
  photoUrl?: string | null;
  size?: "md" | "lg";
}) {
  const dimension = size === "lg" ? "h-20 w-20 text-lg" : "h-16 w-16 text-base";

  return (
    <div
      className={`relative ${dimension} shrink-0 overflow-hidden rounded-full border border-emerald-200 bg-emerald-100 font-semibold text-emerald-700 ring-4 ring-white shadow-sm`}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name ?? "Foto"}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{getInitials(name)}</span>
      )}
    </div>
  );
}

function MemberCard({ name, subtitle, photoUrl }: { name?: string; subtitle?: string; photoUrl?: string | null }) {
  return (
    <div className="min-w-0 flex h-full flex-col items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 pb-5 pt-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Avatar name={name} photoUrl={photoUrl} size="md" />
      <div className="min-w-0 w-full">
        <p className="truncate text-base font-semibold text-slate-950 break-words">{name}</p>
        <p className="mt-0.5 truncate text-sm text-slate-600 break-words">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <p className="mt-1 text-xs text-slate-500">Tambah data di admin untuk menampilkan.</p>
    </div>
  );
}

export default async function PotentialsServer() {
  const items = (await findMany(organizationStructures.collectionName, { is_active: true })) as OrganizationMember[];
  items.sort(sortByCategoryAndName);

  const topItems = items.filter((item) => getCategory(item.title, item.position) === "top");
  const kasieItems = items.filter((item) => getCategory(item.title, item.position) === "kasie");
  const kaurItems = items.filter((item) => getCategory(item.title, item.position) === "kaur");
  const kadusItems = items.filter((item) => getCategory(item.title, item.position) === "kadus");

  const defaultLeaders: OrganizationMember[] = [
    { title: "BPD", name: "BPD", role: "Badan Permusyawaratan Desa" },
    { title: "Kepala Desa", name: "Kepala Desa", role: "Pimpinan Desa" },
    { title: "Sekretaris Desa", name: "Sekretaris Desa", role: "Sekretaris Desa" },
  ];

  const leadership = topItems.length > 0 ? topItems.slice(0, 3) : defaultLeaders;

  return (
    <section id="potentials" className="bg-white px-6 py-20 text-slate-950 sm:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Struktur Organisasi</p>
          <h2 className="mt-4 text-4xl font-semibold">Struktur Organisasi Pemerintah Desa Cijambe</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Susunan kepemimpinan dan jabatan utama Desa Cijambe, dari tingkat pimpinan hingga kepala dusun.
          </p>
        </div>

        {/* Tingkat 1: Pimpinan */}
        <div>
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Tingkat 1 &middot; Pimpinan Desa
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {leadership.map((leader: OrganizationMember) => (
              <article
                key={leader.id ?? leader.title}
                className="relative flex h-full w-full max-w-sm min-w-0 flex-1 basis-72 flex-col items-center overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-slate-50 p-8 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="inline-flex w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  {leader.title ?? leader.name}
                </div>
                <div className="mt-6">
                  <Avatar name={leader.name} photoUrl={leader.photo_url} size="lg" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">{leader.name}</h3>
                <p className="mt-2 text-slate-600">{leader.description ?? leader.role}</p>
                <div className="pointer-events-none absolute right-6 top-6 h-16 w-16 rounded-full bg-emerald-100/60 blur-3xl" />
              </article>
            ))}
          </div>
        </div>

        <TierConnector />

        {/* Tingkat 2: Kasie & Kaur */}
        <div>
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Tingkat 2 &middot; Koordinator Bidang
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Dibawah BPD</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Tim Kasie</h3>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                  {kasieItems.length} Anggota
                </span>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
                {kasieItems.length > 0
                  ? kasieItems.map((item: OrganizationMember) => (
                      <MemberCard key={item.id} name={item.name} subtitle={item.title ?? item.position} photoUrl={item.photo_url} />
                    ))
                  : <EmptyState label="Belum ada anggota Kasie" />}
              </div>
            </div>

            <div className="flex flex-col rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Dibawah Sekretaris</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Tim Kaur</h3>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                  {kaurItems.length} Anggota
                </span>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
                {kaurItems.length > 0
                  ? kaurItems.map((item: OrganizationMember) => (
                      <MemberCard key={item.id} name={item.name} subtitle={item.title ?? item.position} photoUrl={item.photo_url} />
                    ))
                  : <EmptyState label="Belum ada anggota Kaur" />}
              </div>
            </div>
          </div>
        </div>

        <TierConnector />

        {/* Tingkat 3: Kepala Dusun */}
        <div>
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Tingkat 3 &middot; Kepala Dusun
          </p>
          <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-col gap-2 text-center">
              <h3 className="text-2xl font-semibold text-slate-950">Pimpinan Dusun Desa Cijambe</h3>
              <p className="mx-auto max-w-xl text-sm leading-6 text-slate-600">
                Kepala dusun bertugas mendukung administrasi dan pelayanan masyarakat di masing-masing wilayah.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kadusItems.length > 0
                ? kadusItems.map((item: OrganizationMember) => (
                    <MemberCard key={item.id} name={item.name} subtitle={item.title ?? item.position} photoUrl={item.photo_url} />
                  ))
                : <EmptyState label="Belum ada kepala dusun" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}