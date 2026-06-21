"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  initialCategory?: string;
  categories?: { name: string; slug: string }[];
}

export default function SearchBar({
  placeholder = "Cari susu formula, popok, atau skincare...",
  initialValue = "",
  initialCategory = "",
  categories = [
    { name: "Semua Kategori", slug: "" },
    { name: "Susu Formula", slug: "susu-formula" },
    { name: "Popok", slug: "popok" },
    { name: "Skincare", slug: "skincare" },
  ],
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(initialValue || searchParams.get("q") || "");
  const [category, setCategory] = useState(initialCategory || searchParams.get("category") || "");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    
    router.push(`/cari?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="search-wrapper">
      <div className="search-bar">
        {/* Category selector */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            fontSize: "14px",
            fontWeight: 600,
            padding: "8px 12px",
            marginRight: "8px",
            borderRight: "1px solid var(--border-color)",
            cursor: "pointer",
            backgroundColor: "transparent",
            color: "var(--text-secondary)",
          }}
        >
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug} style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Input field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />

        {/* Submit button */}
        <button type="submit" className="search-button">
          Cari 🔍
        </button>
      </div>
    </form>
  );
}
