import Link from "next/link";

interface CategoryTabsProps {
  activeSlug?: string;
}

export default function CategoryTabs({ activeSlug = "" }: CategoryTabsProps) {
  const tabs = [
    { name: "Semua", slug: "", emoji: "📦" },
    { name: "Susu Formula", slug: "susu-formula", emoji: "🍼" },
    { name: "Popok", slug: "popok", emoji: "👶" },
    { name: "Skincare", slug: "skincare", emoji: "💄" },
  ];

  return (
    <div className="category-tabs">
      {tabs.map((tab) => {
        const isActive = activeSlug === tab.slug;
        const url = tab.slug ? `/kategori/${tab.slug}` : "/";
        
        return (
          <Link
            key={tab.slug}
            href={url}
            className={`category-tab ${isActive ? "active" : ""}`}
          >
            <span>{tab.emoji}</span> {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
