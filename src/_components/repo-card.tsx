import { Card, CardContent, Avatar, Badge } from "@mui/material"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
import { Star, GitFork, ExternalLink } from "lucide-react"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  stargazers_count: number
  forks_count: number
  html_url: string
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
  language: string
  created_at: string
}

interface RepoCardProps {
  repository: Repository
}

export function RepoCard({ repository: repo }: RepoCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex sm:flex-row gap-4">
          {/* Owner Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-12 h-12">
              <Avatar src={repo.owner.avatar_url || "/placeholder.svg"} alt={repo.owner.login} />
              {!repo.owner.avatar_url && (
                <div className="flex items-center justify-center w-12 h-12 bg-gray-300 rounded-full">
                  {repo.owner.login[0].toUpperCase()}
                </div>
              )}

            </Avatar>
          </div>

          {/* Repository Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    {repo.full_name}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  by{" "}
                  <a
                    href={repo.owner.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-blue-600"
                  >
                    {repo.owner.login}
                  </a>
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{formatNumber(repo.stargazers_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" />
                  <span>{formatNumber(repo.forks_count)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-3 line-clamp-2">{repo.description || "No description available"}</p>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {repo.language && (
                <Badge color="primary" className="text-xs">
                  {repo.language}
                </Badge>
              )}
              <span className="text-xs text-gray-500">Created {formatDate(repo.created_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
