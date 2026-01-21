import { FuturisticCard } from '@/components/ui/futuristic-card';
import { TierBadge } from './TierBadge';
import { DeveloperTier } from '@/types';
import { TrendingUp, TrendingDown, Minus, Target, Sparkles, ArrowRight } from 'lucide-react';

interface ReputationScoreProps {
  score: number;
  tier: DeveloperTier;
  previousScore?: number;
  compact?: boolean;
}

export function ReputationScore({
  score,
  tier,
  previousScore,
  compact = false
}: ReputationScoreProps) {
  const getTrendIcon = () => {
    if (!previousScore) return null;
    if (score > previousScore) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (score < previousScore) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendText = () => {
    if (!previousScore) return null;
    const diff = score - previousScore;
    if (diff === 0) return 'No change';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)} from last calculation`;
  };

  const getProgressColor = () => {
    if (score >= 76) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (score >= 51) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (score >= 26) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    return 'bg-gradient-to-r from-gray-500 to-slate-500';
  };

  const getNextTierInfo = () => {
    if (score >= 76) {
      return { nextTier: null, pointsNeeded: 0, nextTierName: 'Elite' };
    } else if (score >= 51) {
      return { nextTier: 76, pointsNeeded: 76 - score, nextTierName: 'Elite' };
    } else if (score >= 26) {
      return { nextTier: 51, pointsNeeded: 51 - score, nextTierName: 'Advanced' };
    } else {
      return { nextTier: 26, pointsNeeded: 26 - score, nextTierName: 'Intermediate' };
    }
  };

  const getRecommendations = () => {
    if (score >= 76) {
      return [
        'Maintain your Elite status by staying active',
        'Mentor lower tier developers through vouching',
        'Share knowledge in community sessions'
      ];
    } else if (score >= 51) {
      return [
        'Add more verified projects to boost your score',
        'Participate in hackathons to gain recognition',
        'Increase GitHub contributions and activity'
      ];
    } else if (score >= 26) {
      return [
        'Complete at least 3 verified projects',
        'Maintain consistent GitHub activity',
        'Get vouched by higher tier developers'
      ];
    } else {
      return [
        'Add your first projects with live demos',
        'Connect and sync your GitHub profile',
        'Complete your profile with bio and social links'
      ];
    }
  };

  const nextTierInfo = getNextTierInfo();
  const recommendations = getRecommendations();

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white">{score.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">Reputation</span>
        </div>
        <TierBadge tier={tier} size="md" />
      </div>
    );
  }

  return (
    <FuturisticCard className="border-primary/20" hoverEffect={false}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Reputation Score</h3>
            <p className="text-muted-foreground mt-1">Your overall platform ranking</p>
          </div>
          <TierBadge tier={tier} size="lg" />
        </div>

        {/* Score Display */}
        <div className="flex items-end gap-2 mb-6">
          <span className="text-5xl font-bold text-orange-500">{score.toFixed(1)}</span>
          <span className="text-2xl text-muted-foreground pb-1">/ 100</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Trend */}
        {previousScore !== undefined && (
          <div className="flex items-center gap-2 text-sm mb-6">
            {getTrendIcon()}
            <span className="text-muted-foreground">{getTrendText()}</span>
          </div>
        )}

        {/* Next Tier Milestone */}
        {nextTierInfo.nextTier && (
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-orange-400" />
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Next Milestone</h4>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">
                  {nextTierInfo.pointsNeeded.toFixed(1)} points to <span className="font-bold text-orange-400">{nextTierInfo.nextTierName}</span> tier
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-lg font-bold text-white">{nextTierInfo.nextTier}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-orange-400" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Recommendations */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              {score >= 76 ? 'Maintain Your Status' : 'Improve Your Score'}
            </h4>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FuturisticCard>
  );
}
