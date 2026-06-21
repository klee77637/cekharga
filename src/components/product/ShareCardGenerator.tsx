"use client";

import { useState, useRef, useEffect } from "react";
import { formatRupiah } from "@/lib/unit-price/normalizer";

interface CompareItemInput {
  name: string;
  weight: number; // e.g., 900
  unit: string;   // e.g., 'g' or 'pcs'
  price: number;  // e.g., 94500
}

export default function ShareCardGenerator() {
  // We compare 2 items by default (Item A vs Item B)
  const [productTitle, setProductTitle] = useState("SGM Eksplor 1+");
  const [itemA, setItemA] = useState<CompareItemInput>({
    name: "Kemasan Besar",
    weight: 1800,
    unit: "g",
    price: 245000,
  });
  const [itemB, setItemB] = useState<CompareItemInput>({
    name: "Kemasan Sedang",
    weight: 900,
    unit: "g",
    price: 156000,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Unit calculations
  const pricePerUnitA = itemA.weight > 0 ? itemA.price / itemA.weight : 0;
  const pricePerUnitB = itemB.weight > 0 ? itemB.price / itemB.weight : 0;

  const isAIsCheaper = pricePerUnitA < pricePerUnitB;
  const cheapestItem = isAIsCheaper ? itemA : itemB;
  const expensiveItem = isAIsCheaper ? itemB : itemA;
  const cheapestUnitPrice = isAIsCheaper ? pricePerUnitA : pricePerUnitB;
  const expensiveUnitPrice = isAIsCheaper ? pricePerUnitB : pricePerUnitA;

  const unitDiff = Math.abs(pricePerUnitA - pricePerUnitB);
  // Calculate total savings if buying the cheapest item in the volume of the larger package
  const referenceWeight = Math.max(itemA.weight, itemB.weight);
  const totalSavings = unitDiff * referenceWeight;

  // Redraw canvas on any state change
  useEffect(() => {
    drawCanvas();
  }, [productTitle, itemA, itemB]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas size (9:16 aspect ratio - standard TikTok 1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Background (Sleek dark gradient)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#0d0d12");
    bgGrad.addColorStop(0.5, "#14141c");
    bgGrad.addColorStop(1, "#08080a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle background mesh/lines for high-tech aesthetic
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 80) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 80) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // 2. Header
    // Logo Icon (Orange magnifying glass)
    ctx.fillStyle = "#ff6b35";
    ctx.beginPath();
    ctx.arc(150, 160, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0d0d12";
    ctx.beginPath();
    ctx.arc(150, 160, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff6b35";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(170, 180);
    ctx.lineTo(200, 210);
    ctx.stroke();

    // Brand Logo Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px Arial, Helvetica, sans-serif";
    ctx.fillText("CekHarga", 220, 165);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "300 48px Arial, Helvetica, sans-serif";
    ctx.fillText(".my.id", 460, 165);

    // Date Stamp
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    ctx.fillStyle = "#64748b";
    ctx.font = "600 32px Arial, Helvetica, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(today, 1080 - 100, 165);
    ctx.textAlign = "left"; // reset

    // Divider Line
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 260);
    ctx.lineTo(1080 - 100, 260);
    ctx.stroke();

    // 3. Question Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 82px Arial, Helvetica, sans-serif";
    ctx.fillText(productTitle.toUpperCase(), 100, 400);

    ctx.fillStyle = "#ff6b35";
    ctx.font = "800 68px Arial, Helvetica, sans-serif";
    ctx.fillText("KEMASAN MANA PALING HEMAT?", 100, 485);

    // 4. Comparison Cards Layout
    const cardY = 600;
    const cardHeight = 620;
    const cardWidth = 410;
    const cardAX = 100;
    const cardBX = 570;

    // Helper function to draw a comparison card
    const drawCard = (
      x: number,
      item: CompareItemInput,
      unitPrice: number,
      isCheaper: boolean
    ) => {
      // Rounded Card Background
      ctx.fillStyle = "#161622";
      ctx.strokeStyle = isCheaper ? "#10b981" : "#27272a";
      ctx.lineWidth = isCheaper ? 6 : 3;
      
      const r = 24; // radius
      ctx.beginPath();
      ctx.moveTo(x + r, cardY);
      ctx.lineTo(x + cardWidth - r, cardY);
      ctx.quadraticCurveTo(x + cardWidth, cardY, x + cardWidth, cardY + r);
      ctx.lineTo(x + cardWidth, cardY + cardHeight - r);
      ctx.quadraticCurveTo(x + cardWidth, cardY + cardHeight, x + cardWidth - r, cardY + cardHeight);
      ctx.lineTo(x + r, cardY + cardHeight);
      ctx.quadraticCurveTo(x, cardY + cardHeight, x, cardY + cardHeight - r);
      ctx.lineTo(x, cardY + r);
      ctx.quadraticCurveTo(x, cardY, x + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Card Label (e.g., Kemasan Besar)
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 36px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.name, x + cardWidth / 2, cardY + 80);

      // Package Quantity/Weight
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px Arial, Helvetica, sans-serif";
      ctx.fillText(`${item.weight} ${item.unit}`, x + cardWidth / 2, cardY + 180);

      // Total Price
      ctx.fillStyle = "#ffffff";
      ctx.font = "500 48px Arial, Helvetica, sans-serif";
      ctx.fillText(formatRupiah(item.price), x + cardWidth / 2, cardY + 270);

      // Card Divider Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 40, cardY + 330);
      ctx.lineTo(x + cardWidth - 40, cardY + 330);
      ctx.stroke();

      // UNIT PRICE (The Hero)
      ctx.fillStyle = isCheaper ? "#10b981" : "#f43f5e";
      ctx.font = "900 68px Arial, Helvetica, sans-serif";
      ctx.fillText(formatRupiah(unitPrice), x + cardWidth / 2, cardY + 430);
      
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 32px Arial, Helvetica, sans-serif";
      ctx.fillText(`per ${item.unit}`, x + cardWidth / 2, cardY + 480);

      // Badge (HEMAT / MAHAL)
      ctx.fillStyle = isCheaper ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)";
      const bW = 200;
      const bH = 60;
      const bX = x + (cardWidth - bW) / 2;
      const bY = cardY + 520;
      const bR = 12;
      
      ctx.beginPath();
      ctx.moveTo(bX + bR, bY);
      ctx.lineTo(bX + bW - bR, bY);
      ctx.quadraticCurveTo(bX + bW, bY, bX + bW, bY + bR);
      ctx.lineTo(bX + bW, bY + bH - bR);
      ctx.quadraticCurveTo(bX + bW, bY + bH, bX + bW - bR, bY + bH);
      ctx.lineTo(bX + bR, bY + bH);
      ctx.quadraticCurveTo(bX, bY + bH, bX, bY + bH - bR);
      ctx.lineTo(bX, bY + bR);
      ctx.quadraticCurveTo(bX, bY, bX + bR, bY);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = isCheaper ? "#10b981" : "#f43f5e";
      ctx.font = "bold 28px Arial, Helvetica, sans-serif";
      ctx.fillText(isCheaper ? "Paling Hemat 🟢" : "Lebih Mahal 🔴", x + cardWidth / 2, cardY + 560);
    };

    // Draw both cards
    ctx.textAlign = "center";
    drawCard(cardAX, itemA, pricePerUnitA, isAIsCheaper);
    drawCard(cardBX, itemB, pricePerUnitB, !isAIsCheaper);
    ctx.textAlign = "left"; // reset

    // 5. Savings Summary Banner (Big Call-to-Action)
    const bannerY = 1320;
    const bannerWidth = 1080 - 200;
    const bannerHeight = 360;
    const bx = 100;
    const br = 28;

    // Banner Background (Green theme for savings)
    ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    ctx.moveTo(bx + br, bannerY);
    ctx.lineTo(bx + bannerWidth - br, bannerY);
    ctx.quadraticCurveTo(bx + bannerWidth, bannerY, bx + bannerWidth, bannerY + br);
    ctx.lineTo(bx + bannerWidth, bannerY + bannerHeight - br);
    ctx.quadraticCurveTo(bx + bannerWidth, bannerY + bannerHeight, bx + bannerWidth - br, bannerY + bannerHeight);
    ctx.lineTo(bx + br, bannerY + bannerHeight);
    ctx.quadraticCurveTo(bx, bannerY + bannerHeight, bx, bannerY + bannerHeight - br);
    ctx.lineTo(bx, bannerY + br);
    ctx.quadraticCurveTo(bx, bannerY, bx + br, bannerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Banner Content
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px Arial, Helvetica, sans-serif";
    ctx.fillText("BEDA HARGA SIGNIFIKAN! 😱", canvas.width / 2, bannerY + 100);

    ctx.fillStyle = "#10b981";
    ctx.font = "900 82px Arial, Helvetica, sans-serif";
    ctx.fillText(
      `SELISIH Rp ${unitDiff.toFixed(1)} / ${cheapestItem.unit}!`,
      canvas.width / 2,
      bannerY + 200
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 42px Arial, Helvetica, sans-serif";
    ctx.fillText(
      `Setara dengan Hemat ${formatRupiah(totalSavings)} per ${referenceWeight}${cheapestItem.unit}!`,
      canvas.width / 2,
      bannerY + 290
    );
    ctx.textAlign = "left"; // reset

    // 6. Watermark Footer
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 36px Arial, Helvetica, sans-serif";
    ctx.fillText("Cek Harga Terbaik Sebelum Membeli di:", 100, 1800);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Arial, Helvetica, sans-serif";
    ctx.fillText("cekharga.my.id", 100, 1860);

    // Call-to-action text in right corner
    ctx.fillStyle = "#ff6b35";
    ctx.font = "800 36px Arial, Helvetica, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("KLIK LINK DI BIO 🔗", 1080 - 100, 1840);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `cekharga-${productTitle.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "40px", marginTop: "24px" }}>
      {/* 🛠️ Control Panel Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", alignSelf: "start" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>⚙️ Pengaturan Konten</h3>
        
        {/* Product Title */}
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>Judul Produk Utama</label>
          <input
            type="text"
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
            style={{ width: "100%", padding: "10px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Item A Column */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)", marginBottom: "12px" }}>📦 Item A (Kemasan Kiri)</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Label (Contoh: Kemasan Besar)"
              value={itemA.name}
              onChange={(e) => setItemA({ ...itemA, name: e.target.value })}
              style={{ width: "100%", padding: "8px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input
                type="number"
                placeholder="Berat/Volume"
                value={itemA.weight || ""}
                onChange={(e) => setItemA({ ...itemA, weight: parseFloat(e.target.value) || 0 })}
                style={{ width: "100%", padding: "8px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
              />
              <input
                type="text"
                placeholder="Unit (g/ml/pcs)"
                value={itemA.unit}
                onChange={(e) => setItemA({ ...itemA, unit: e.target.value })}
                style={{ width: "100%", padding: "8px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
              />
            </div>
            <input
              type="number"
              placeholder="Harga Total (Rp)"
              value={itemA.price || ""}
              onChange={(e) => setItemA({ ...itemA, price: parseFloat(e.target.value) || 0 })}
              style={{ width: "100%", padding: "8px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Item B Column */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)", marginBottom: "12px" }}>📦 Item B (Kemasan Kanan)</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Label (Contoh: Kemasan Kecil)"
              value={itemB.name}
              onChange={(e) => setItemB({ ...itemB, name: e.target.value })}
              style={{ width: "100%", padding: "8px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input
                type="number"
                placeholder="Berat/Volume"
                value={itemB.weight || ""}
                onChange={(e) => setItemB({ ...itemB, weight: parseFloat(e.target.value) || 0 })}
                style={{ width: "100%", padding: "8px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
              />
              <input
                type="text"
                placeholder="Unit (g/ml/pcs)"
                value={itemB.unit}
                onChange={(e) => setItemB({ ...itemB, unit: e.target.value })}
                style={{ width: "100%", padding: "8px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
              />
            </div>
            <input
              type="number"
              placeholder="Harga Total (Rp)"
              value={itemB.price || ""}
              onChange={(e) => setItemB({ ...itemB, price: parseFloat(e.target.value) || 0 })}
              style={{ width: "100%", padding: "8px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button 
          onClick={handleDownload} 
          className="btn btn-primary" 
          style={{ padding: "14px", marginTop: "10px", width: "100%" }}
        >
          📥 Unduh Gambar Infografis (PNG)
        </button>
      </div>

      {/* 📱 Real-time Mobile Preview Area */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" }}>
          📱 Pratinjau Tampilan Konten (Skala 9:16)
        </h4>
        <div style={{ 
          border: "4px solid var(--border-color)", 
          borderRadius: "var(--radius-lg)", 
          overflow: "hidden", 
          boxShadow: "var(--shadow-lg)",
          width: "360px",
          height: "640px",
          position: "relative"
        }}>
          <canvas 
            ref={canvasRef} 
            style={{ 
              width: "100%", 
              height: "100%",
              display: "block" 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
