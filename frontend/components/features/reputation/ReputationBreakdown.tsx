'use client';

import { FuturisticCard } from '@/components/ui/futuristic-card';
import { GitBranch, FolderGit2, Clock, Trophy, Users } from 'lucide-react';
import type { ReputationScore as ReputationScoreType } from '@/types';

interface ReputationBreakdownProps {
  breakdown: ReputationScoreType;
}

// Each sub-score from the backend is 0-100. The weights below determine what
// portion of the total 100-point scale each category contributes.
const categoryConfig = {
  github: {
    label: 'GitHub Profile',
    icon: GitBranch,
    color: 'text-purple-400',
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Repos, stars, commits, PRs',
    weight: 0.30, // 30% of total
  },
  projects: {
    label: 'Projects',
    icon: FolderGit2,
    color: 'text-blue-400',
    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    description: 'Completed projects, complexity',
    weight: 0.25, // 25% of total
  },
  time: {
    label: 'Time Investment',
    icon: Clock,
    color: 'text-green-400',
    bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
    description: 'Consistency, activity',
    weight: 0.15, // 15% of total
  },
  hackathons: {
    label: 'Hackathons & Grants',
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    description: 'Wins, placements, grants',
    weight: 0.20, // 20% of total
  },
  community: {
    label: 'Community',
    icon: Users,
    color: 'text-orange-400',
    bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
    description: 'Vouches, sessions',
    weight: 0.10, // 10% of total
  },
};

export function ReputationBreakdown({ breakdown }: ReputationBreakdownProps) {
  const categories = [
    { key: 'github' as const, score: breakdown.githubScore },
    { key: 'projects' as const, score: breakdown.projectsScore },
    { key: 'time' as const, score: breakdown.timeScore },
    { key: 'hackathons' as const, score: breakdown.hackathonsScore },
    { key: 'community' as const, score: breakdown.communityScore },
  ];

  // The weighted contribution of each sub-score to the total (out of 100)
  // e.g. a githubScore of 80 with weight 0.30 → contributes 24 pts to total
  const weightedTotal = categories.reduce((sum, { key, score }) => {
    return sum + score * categoryConfig[key].weight;
  }, 0);

  // Use the backend's authoritative totalScore if available, fallback to computed
  const displayTotal = breakdown.totalScore ?? Math.round(weightedTotal * 10) / 10;

  return (
    <FuturisticCard className="border-primary/20" hoverEffect={false}>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-1">Reputation Breakdown</h3>
        <p className="text-muted-foreground mb-6">
          How your reputation score is calculated across different categories
        </p>

        <div className="space-y-6">
          {categories.map(({ key, score }) => {
            const config = categoryConfig[key];
            const Icon = config.icon;
            // maxScore for this category = weight × 100 (i.e. its contribution cap)
            const maxScore = config.weight * 100;
            // Weighted contribution of this sub-score
            const weightedScore = score * config.weight;
            // Percentage of how much this category has filled its cap (capped at 100%)
            const percentage = Math.min((score / 100) * 100, 100);

            return (
              <div key={key} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {/* Show weighted contribution / max contribution */}
                    <p className="font-bold text-lg text-white">
                      {weightedScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      / {maxScore.toFixed(0)} pts
                    </p>
                  </div>
                </div>

                {/* Progress Bar — capped at 100% */}
                <div className="space-y-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${config.bgColor} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {percentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-muted-foreground uppercase tracking-wider text-sm">
                Total Reputation Score
              </p>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-500">
                  {displayTotal.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">/ 100 pts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FuturisticCard>
  );
}
