import { FuturisticCard } from '@/components/ui/futuristic-card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Building2, ExternalLink, Clock } from 'lucide-react';
import type { Grant } from '@/types';
import { format, isPast, differenceInDays } from 'date-fns';

interface GrantCardProps {
  grant: Grant;
}

export function GrantCard({ grant }: GrantCardProps) {
  const deadline = grant.deadline ? new Date(grant.deadline) : null;
  const hasDeadline = !!deadline;
  const isExpired = deadline ? isPast(deadline) : false;
  const daysUntilDeadline = deadline && !isExpired ? differenceInDays(deadline, new Date()) : null;

  return (
    <FuturisticCard className="border-primary/20 h-full">
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={grant.status === 'OPEN' ? 'default' : 'secondary'}
                className={
                  grant.status === 'OPEN'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }
              >
                {grant.status}
              </Badge>
              <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                {grant.ecosystem}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{grant.name}</h3>
          </div>
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
        </div>

        {/* Provider */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Building2 className="h-4 w-4" />
          <span>Provided by {grant.provider}</span>
        </div>

        {/* Amount */}
        {grant.amount && (
          <div className="mb-4">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Grant Amount</p>
              <p className="text-2xl font-bold text-green-400">
                ${grant.amount.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Deadline */}
        {hasDeadline ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
              <Calendar className={`h-4 w-4 ${isExpired ? 'text-red-400' : 'text-yellow-400'}`} />
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-semibold">{format(deadline, 'MMM dd, yyyy')}</span>
            </div>
            {!isExpired && daysUntilDeadline !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-400" />
                <span className="text-orange-400 font-semibold">
                  {daysUntilDeadline === 0
                    ? 'Due today!'
                    : daysUntilDeadline === 1
                    ? '1 day left'
                    : `${daysUntilDeadline} days left`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="h-4 w-4" />
            <span>No deadline specified</span>
          </div>
        )}

        {/* Action */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <a
            href={grant.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 text-green-400 font-semibold transition-all"
          >
            <span>Apply Now</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </FuturisticCard>
  );
}
