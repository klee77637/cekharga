"use client";

import { useState, useRef } from "react";
import { saveProductAction } from "@/app/admin/actions";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AdminFormProps {
  categories: Category[];
}

export default function AdminForm({ categories }: AdminFormProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === "") return;
    
    // We do a simple pre-check (actual verification happens on server submit)
    setIsAuthenticated(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const response = await saveProductAction(formData, password);
      
      if (response.success) {
        setMessage({ type: "success", text: response.message });
        formRef.current?.reset();
      } else {
        setMessage({ type: "error", text: response.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menyimpan produk." });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: "400px", margin: "80px auto", padding: "32px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px", textAlign: "center" }}>🔐 Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>Password Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin..."
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                color: "var(--text-primary)",
              }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
            Masuk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "32px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700 }}>➕ Tambah Produk Manual</h2>
        <button 
          onClick={() => { setIsAuthenticated(false); setPassword(""); setMessage(null); }}
          className="btn btn-secondary" 
          style={{ padding: "6px 12px", fontSize: "12px" }}
        >
          Keluar 🔒
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            fontSize: "14px",
            marginBottom: "20px",
            backgroundColor: message.type === "success" ? "var(--color-hemat-bg)" : "var(--color-mahal-bg)",
            color: message.type === "success" ? "var(--color-hemat)" : "var(--color-mahal)",
            border: `1px solid ${message.type === "success" ? "var(--color-hemat)" : "var(--color-mahal)"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Name */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Nama Produk (Sesuai Judul Shopee) *</label>
          <input
            type="text"
            name="name"
            placeholder="Contoh: SGM Eksplor 1+ Madu Susu Formula 900g"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
            }}
            required
          />
          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
            * Sistem akan otomatis mengekstrak berat/volume dari judul (misal: 900g, 1.8kg).
          </span>
        </div>

        {/* Category */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Kategori *</label>
          <select
            name="categorySlug"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
            }}
            required
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Harga (Rupiah) *</label>
          <input
            type="number"
            name="price"
            placeholder="Contoh: 94500"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
            }}
            required
          />
        </div>

        {/* Product URL */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Tautan Produk (Shopee/Lazada) *</label>
          <input
            type="url"
            name="productUrl"
            placeholder="Contoh: https://shopee.co.id/product-name-i.123.456"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
            }}
            required
          />
          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
            * Tautan akan otomatis diubah menjadi link afiliasi Involve Asia Anda.
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Brand */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Merek (Opsional)</label>
            <input
              type="text"
              name="brand"
              placeholder="Contoh: SGM (Kosongkan jika auto)"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Shop Name */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Nama Toko (Opsional)</label>
            <input
              type="text"
              name="shopName"
              placeholder="Contoh: SGM Official Store"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>URL Gambar Produk (Opsional)</label>
          <input
            type="url"
            name="imageUrl"
            placeholder="Contoh: https://images.tokopedia.net/..."
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: "14px", marginTop: "10px" }} disabled={loading}>
          {loading ? "Menyimpan & Generate Link..." : "Simpan Produk 💾"}
        </button>
      </form>
    </div>
  );
}
