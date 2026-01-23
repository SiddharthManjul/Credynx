import { FuturisticCard } from '@/components/ui/futuristic-card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, Users, ExternalLink, MapPin } from 'lucide-react';
import type { Hackathon } from '@/types';
import { format } from 'date-fns';

interface HackathonCardProps {
  hackathon: Hackathon;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);
  const isOngoing = hackathon.status === 'ONGOING';
  const isUpcoming = hackathon.status === 'UPCOMING';

  return (
    <FuturisticCard className="border-primary/20 h-full">
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={isOngoing ? 'default' : 'secondary'}
                className={
                  isOngoing
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : isUpcoming
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }
              >
                {hackathon.status}
              </Badge>
              <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                {hackathon.ecosystem}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{hackathon.name}</h3>
          </div>
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Trophy className="h-5 w-5 text-orange-400" />
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Users className="h-4 w-4" />
          <span>Organized by {hackathon.organizer}</span>
        </div>

        {/* Prize Pool */}
        {hackathon.prizePool && (
          <div className="mb-4">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Prize Pool</p>
              <p className="text-2xl font-bold text-orange-400">
                ${hackathon.prizePool.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Calendar className="h-4 w-4 text-green-400" />
            <span className="text-muted-foreground">Start:</span>
            <span className="font-semibold">{format(startDate, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Calendar className="h-4 w-4 text-red-400" />
            <span className="text-muted-foreground">End:</span>
            <span className="font-semibold">{format(endDate, 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <a
            href={hackathon.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 text-orange-400 font-semibold transition-all"
          >
            <span>View Details</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </FuturisticCard>
  );
}
