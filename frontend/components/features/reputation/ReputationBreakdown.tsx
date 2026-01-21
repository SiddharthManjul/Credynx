'use client';

import { FuturisticCard } from '@/components/ui/futuristic-card';
import { GitBranch, FolderGit2, Clock, Trophy, Users } from 'lucide-react';
import type { ReputationBreakdown as ReputationBreakdownType } from '@/types';

interface ReputationBreakdownProps {
  breakdown: ReputationBreakdownType;
}

const categoryConfig = {
  github: {
    label: 'GitHub Profile',
    icon: GitBranch,
    color: 'text-purple-400',
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Repos, stars, commits, PRs',
    maxScore: 30,
  },
  projects: {
    label: 'Projects',
    icon: FolderGit2,
    color: 'text-blue-400',
    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    description: 'Completed projects, complexity',
    maxScore: 25,
  },
  time: {
    label: 'Time Investment',
    icon: Clock,
    color: 'text-green-400',
    bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
    description: 'Consistency, activity',
    maxScore: 15,
  },
  hackathons: {
    label: 'Hackathons & Grants',
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    description: 'Wins, placements, grants',
    maxScore: 20,
  },
  community: {
    label: 'Community',
    icon: Users,
    color: 'text-orange-400',
    bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
    description: 'Vouches, sessions',
    maxScore: 10,
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
            const percentage = (score / config.maxScore) * 100;

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
                    <p className="font-bold text-lg text-white">{score.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">
                      / {config.maxScore}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
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
              <p className="font-semibold text-muted-foreground uppercase tracking-wider text-sm">Total Reputation Score</p>
              <p className="text-3xl font-bold text-orange-500">
                {(breakdown.githubScore + breakdown.projectsScore + breakdown.timeScore + breakdown.hackathonsScore + breakdown.communityScore).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </FuturisticCard>
  );
}
