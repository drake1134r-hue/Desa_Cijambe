import { Briefcase, Home, ShieldCheck, Sprout, TrendingUp } from "lucide-react";

const pillars = [
  {
    title: "Pendidikan dan Kesehatan",
    description:
      "Program pemberdayaan masyarakat yang fokus pada peningkatan kualitas pendidikan, layanan kesehatan, dan sarana pendukung warga.",
    icon: Home,
  },
  {
    title: "Ekonomi Kerakyatan",
    description:
      "Penguatan usaha mikro, pertanian, dan UMKM desa untuk mendorong kesejahteraan masyarakat secara berkelanjutan.",
    icon: TrendingUp,
  },
  {
    title: "Ketahanan Sosial",
    description:
      "Peningkatan rasa aman, gotong royong, dan kebersamaan melalui kegiatan sosial, keagamaan, dan penguatan budaya desa.",
    icon: ShieldCheck,
  },
  {
    title: "Kemandirian Desa",
    description:
      "Pengembangan potensi lokal dan pemerataan pembangunan agar desa semakin mandiri dalam mengelola sumber daya sendiri.",
    icon: Sprout,
  },
];

export default function SocialEconomy() {
  return (
    <section id="social-economy" className="bg-slate-50 px-6 py-20 text-slate-950 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Sosial & Ekonomi</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
            Penguatan sosial dan ekonomi masyarakat desa yang berkelanjutan
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Desa Cijambe terus mengembangkan berbagai program untuk memperkuat kehidupan sosial, ekonomi, dan tata kelola masyarakat secara terpadu.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-emerald-100 bg-emerald-600 p-8 text-white shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">Prioritas Desa</p>
              <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Menjadikan Desa Cijambe sebagai desa yang maju, mandiri, dan sejahtera
              </h3>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-white/15 px-5 py-3 text-sm font-medium">
              <Briefcase className="h-5 w-5" />
              <span>Program kerja terarah dan berbasis kebutuhan masyarakat</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
