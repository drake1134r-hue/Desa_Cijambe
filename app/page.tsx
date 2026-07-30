import HomepageContent from "@/components/homepage-content";
import dynamic from "next/dynamic";
import VillageMap from "@/components/village-map";
import { findMany } from "@/lib/db/index";
import { umkms } from "@/lib/db/schema";

const NewsCard = dynamic(() => import("@/components/cards/news-card"), {
  ssr: true,
  loading: () => <div className="h-96 bg-slate-100 animate-pulse" />,
});
const Potentials = dynamic(() => import("@/components/potentials-server"), { ssr: true });
const SocialEconomy = dynamic(() => import("@/components/social-economy"), { ssr: true });
const Footer = dynamic(() => import("@/components/footer"), { ssr: true });
const UmkmList = dynamic(() => import("@/components/umkm-list"), { ssr: true });

export default async function Home() {
  type UmkmCard = {
    id: number;
    name: string;
    category: string;
    location: string;
    phone: string;
    image: string;
  };

  let umkmItems: UmkmCard[] = [];
  try {
    const items = await findMany(
      umkms.collectionName,
      { status: "published" },
      { sort: { created_at: -1 }, limit: 3 }
    );
    umkmItems = items.map((d: any) => ({
      id: d.id,
      name: d.name,
      category: d.category || "Umum",
      location: d.address || "-",
      phone: d.whatsapp || "-",
      image: d.photo_url || "/images/umkm1.jpg",
    }));
  } catch (err) {
    console.error("Failed to load UMKM for home page", err);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <HomepageContent />
      <SocialEconomy />
      <VillageMap />
      <Potentials />
      <UmkmList items={umkmItems} />
      <NewsCard />
      <Footer />
    </main>
  );
}
