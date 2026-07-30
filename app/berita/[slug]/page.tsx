"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  author_id: number;
  category_id: number | null;
  is_featured: boolean;
  published_at: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Author {
  id: number;
  name: string;
  avatar_url: string | null;
}

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Get article by slug - you'll need to modify the API to support this
        const response = await fetch(`/api/berita?slug=${slug}`);
        if (!response.ok) throw new Error("Failed to fetch article");

        const data = await response.json();
        const article = Array.isArray(data) ? data[0] : data;

        if (!article) {
          setError("Artikel tidak ditemukan");
          return;
        }

        setArticle(article);

        // Fetch author info
        if (article.author_id) {
          const authorResponse = await fetch(`/api/users/${article.author_id}`);
          if (authorResponse.ok) {
            const authorData = await authorResponse.json();
            setAuthor(authorData);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan memuat artikel"
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Artikel tidak ditemukan"}
          </h1>
          <Link
            href="/berita"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Kembali ke daftar berita
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(article.published_at || article.created_at).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Image */}
      {article.cover_image_url && (
        <div className="relative h-96 w-full overflow-hidden">
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            quality={100}
            unoptimized
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <span className="text-sm">{formattedDate}</span>
            {author && (
              <div className="flex items-center gap-2">
                {author.avatar_url && (
                  <Image
                    src={author.avatar_url}
                    alt={author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm">{author.name}</span>
              </div>
            )}
          </div>

          {/* Summary */}
          <p className="text-xl text-gray-700 leading-relaxed">
            {article.summary}
          </p>
        </header>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Footer Navigation */}
        <div className="border-t pt-8 mt-12">
          <Link
            href="/berita"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <span className="mr-2">←</span>
            Kembali ke daftar berita
          </Link>
        </div>
      </div>
    </article>
  );
}
