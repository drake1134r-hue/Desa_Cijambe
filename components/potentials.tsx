export default function Potentials() {
  const coreLeadership = [
    {
      title: "BPD",
      name: "BPD",
      role: "Badan Permusyawaratan Desa",
      accent: "bg-slate-950 text-white",
    },
    {
      title: "Kepala Desa",
      name: "Takhyar S Iskandar",
      role: "Kepala Desa Cijambe",
      accent: "bg-emerald-600 text-white",
    },
    {
      title: "Sekretaris Desa",
      name: "Iwan Setiawan, SE",
      role: "Sekretaris Desa",
      accent: "bg-slate-800 text-white",
    },
  ];

  const bpdTeam = [
    { name: "Edi Sahudi", role: "Kasie Pemerintahan" },
    { name: "Selvi Adiyanti Koesnadi", role: "Kasie Kesejahteraan" },
    { name: "Yayan Mulyana, S.Kom", role: "Kasie Pelayanan" },
  ];

  const sekretariatTeam = [
    { name: "Sri Sumiarisih", role: "Kaur TU & Umum" },
    { name: "Eti Sulastri", role: "Kaur Keuangan" },
    { name: "Ade Kokom Kodariah, Amd", role: "Kaur Perencanaan" },
  ];

  const kadus = [
    { name: "Adis Apriyadi", role: "Kadus Cijambe" },
    { name: "Supanta, S.Pd", role: "Kadus Parugpug Kaler" },
    { name: "Dian Hermana", role: "Kadus Parugpug Kidul" },
  ];

  return (
    <section id="potentials" className="bg-white px-6 py-20 text-slate-950 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Struktur Organisasi</p>
          <h2 className="mt-4 text-4xl font-semibold">Struktur Organisasi Pemerintah Desa Cijambe</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Susunan kepemimpinan dan jabatan utama Desa Cijambe yang diselaraskan dengan tema hijau emerald dan nuansa formal modern.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr_1fr]">
          {coreLeadership.map((leader) => (
            <article key={leader.title} className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-slate-50 p-8 shadow-sm">
              <div className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${leader.accent}`}>{leader.title}</div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-950">{leader.name}</h3>
              <p className="mt-3 text-slate-600">{leader.role}</p>
              <div className="pointer-events-none absolute right-6 top-6 h-16 w-16 rounded-full bg-emerald-100/60 blur-3xl" />
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">Dibawah BPD</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Tim Kasie</h3>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-700">3 Anggota</span>
            </div>
            <div className="mt-8 space-y-4">
              {bpdTeam.map((item) => (
                <div key={item.name} className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <p className="text-lg font-semibold text-slate-950">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">Dibawah Sekretaris</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Tim Kaur</h3>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-700">3 Anggota</span>
            </div>
            <div className="mt-8 space-y-4">
              {sekretariatTeam.map((item) => (
                <div key={item.name} className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <p className="text-lg font-semibold text-slate-950">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Kepala Dusun</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-950">Pimpinan Dusun Desa Cijambe</h3>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Tiga kepala dusun yang bertugas mendukung administrasi dan pelayanan masyarakat di masing-masing wilayah.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {kadus.map((item) => (
              <div key={item.name} className="rounded-[1.75rem] border border-slate-100 bg-emerald-50 p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-950">{item.name}</p>
                <p className="mt-2 text-sm text-slate-700">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
