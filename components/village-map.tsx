"use client";

import dynamic from "next/dynamic";

const VillageMapInner = dynamic(() => import("./village-map-inner"), { ssr: false });

export default function VillageMap() {
  return (
    <section id="map" className="bg-white px-6 py-20 text-slate-950 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Peta Desa Cijambe</p>
          <h2 className="mt-4 text-4xl font-semibold">Lokasi Kantor Desa Cijambe</h2>
        </div>
        <div className="h-[560px] overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm">
          <VillageMapInner />
        </div>
      </div>
    </section>
  );
}
