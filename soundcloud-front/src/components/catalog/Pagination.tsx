import React from "react";

interface PaginationProps {
    page: number;          // 1-based
    totalPages: number;
    onChange: (page: number) => void;
}

// 1 2 3 … 10, as in the design: first pages, «…», last
const getPages = (page: number, total: number): (number | "dots")[] => {
    if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "dots")[] = [];
    const start = Math.max(1, Math.min(page - 4, total - 9));
    const end = Math.min(total - 1, start + 8);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("dots");
    pages.push(total);
    return pages;
};

const Arrow: React.FC<{ dir: "left" | "right" }> = ({ dir }) => (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d={dir === "left" ? "M6.5 1L1.5 6L6.5 11" : "M1.5 1L6.5 6L1.5 11"}
            stroke="#FFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        />
    </svg>
);

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange }) => {
    if (totalPages <= 1) return null;

    const go = (p: number) => {
        if (p < 1 || p > totalPages || p === page) return;
        onChange(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <nav className="catalog_pagination" aria-label="Pages">
            <button className="catalog_pagination_arrow" onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous">
                <Arrow dir="left" />
            </button>
            <div className="catalog_pagination_pages">
                {getPages(page, totalPages).map((p, i) =>
                    p === "dots" ? (
                        <span key={`dots-${i}`} className="catalog_pagination_dots">…</span>
                    ) : (
                        <button
                            key={p}
                            className={`catalog_pagination_page ${p === page ? "active" : ""}`}
                            onClick={() => go(p)}
                            aria-current={p === page ? "page" : undefined}
                        >
                            {p}
                        </button>
                    )
                )}
            </div>
            <button className="catalog_pagination_arrow" onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="Next">
                <Arrow dir="right" />
            </button>
        </nav>
    );
};

export default Pagination;
