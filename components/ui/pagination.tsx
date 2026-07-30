import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-6 py-4 sm:justify-between">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={cn(
          "rounded-full border px-4 py-2 text-sm font-semibold transition",
          page === 1
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        )}
      >
        Sebelumnya
      </button>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => onPageChange(index + 1)}
            aria-current={page === index + 1 ? "page" : undefined}
            className={cn(
              "min-w-[2rem] rounded-full border px-3 py-2 text-sm font-semibold transition",
              page === index + 1
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className={cn(
          "rounded-full border px-4 py-2 text-sm font-semibold transition",
          page === pageCount
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        )}
      >
        Berikutnya
      </button>
    </div>
  );
}
