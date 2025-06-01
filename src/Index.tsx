import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, Button } from "@mui/material";
import { RepoCard } from "./_components/repo-card";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  language: string;
  created_at: string;
}

interface GitHubResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

export default function GitHubRepos() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastRepoRef = useRef<HTMLDivElement | null>(null);

  const getDateTenDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);
    return date.toISOString().split("T")[0];
  };

  console.log(getDateTenDaysAgo(), "getDateTenDaysAgo");

  const fetchRepositories = useCallback(
    async (pageNum: number) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const dateFilter = getDateTenDaysAgo();
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${apiUrl}?q=created:>${dateFilter}&sort=stars&order=desc&page=${pageNum}&per_page=20`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GitHubResponse = await response.json();
        console.log("Fetched data:", data);
        console.log(
          "New items:",
          data.items.length,
          "Unique added:",
          data.items.filter(
            (repo) => !repositories.some((r) => r.id === repo.id)
          ).length
        );

        setRepositories((prev) => {
          const ids = new Set(prev.map((repo) => repo.id));
          const newRepos = data.items.filter((repo) => !ids.has(repo.id));
          return [...prev, ...newRepos];
        });

        setHasMore(data.items.length === 20);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [loading, repositories]
  );

  useEffect(() => {
    fetchRepositories(page);
  }, [page]);

  console.log("New items:", repositories, "Unique added:", repositories.length);

  useEffect(() => {
    if (loading || !hasMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { rootMargin: "100px" }
    );

    if (lastRepoRef.current) {
      observerRef.current.observe(lastRepoRef.current);
    }
  }, [repositories, hasMore, loading]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setPage(1);
                setRepositories([]);
                fetchRepositories(1);
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Most Starred GitHub Repos
          </h1>
          <p className="text-gray-600">
            Repositories created in the last 10 days
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {repositories.map((repo, index) => {
            const isLast = index === repositories.length - 1;
            return (
              <div key={repo.id} ref={isLast ? lastRepoRef : null}>
                <RepoCard repository={repo} />
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!hasMore && !loading && (
          <div className="text-center py-8 text-gray-600">
            No more repositories to load.
          </div>
        )}
      </div>
    </div>
  );
}
