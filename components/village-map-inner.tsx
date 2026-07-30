"use client";

export default function VillageMapInner() {
  const latitude = -6.806427272115972;
  const longitude = 108.01227738135054;
  const embedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=17&t=m&output=embed`;

  return (
    <div className="h-full w-full overflow-hidden rounded-3xl">
      <iframe
        title="Peta lokasi Kantor Desa Cijambe"
        src={embedUrl}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
