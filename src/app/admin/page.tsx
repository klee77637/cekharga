import { createClient } from "@/lib/supabase/server";
import AdminForm from "@/components/admin/AdminForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Fallback categories if database table is not initialized yet
const FALLBACK_CATEGORIES = [
  { id: "1", name: "Susu Formula", slug: "susu-formula" },
  { id: "2", name: "Popok Bayi", slug: "popok" },
  { id: "3", name: "Skincare", slug: "skincare" },
];

export default async function AdminPage() {
  let categories = FALLBACK_CATEGORIES;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("id, name, slug");
    
    if (!error && data && data.length > 0) {
      categories = data;
    }
  } catch (err) {
    console.warn("⚠️ Failed to load categories from Supabase. Using fallback categories for administration.", err);
  }

  return (
    <div style={{ flex: 1, padding: "40px 0" }} className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em" }}>⚙️ Portal Administrasi</h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Kelola data katalog produk dan buat konten pemasaran afiliasi Anda.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            ← Lihat Website
          </Link>
          <Link href="/admin/generator" className="btn btn-primary" style={{ textDecoration: "none" }}>
            🎨 Pembuat Infografis
          </Link>
        </div>
      </div>

      <AdminForm categories={categories} />
    </div>
  );
}
