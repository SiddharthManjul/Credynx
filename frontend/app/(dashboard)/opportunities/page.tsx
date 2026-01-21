'use client';

import { useState } from 'react';
import { Background3D } from '@/components/landing/Background3D';
import { FuturisticCard } from '@/components/ui/futuristic-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { HackathonCard, GrantCard } from '@/components/features/opportunities';
import { useHackathons, useGrants, useEcosystems } from '@/lib/hooks';
import { Trophy, DollarSign, Filter } from 'lucide-react';

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<'hackathons' | 'grants'>('hackathons');
  const [ecosystem, setEcosystem] = useState<string | undefined>(undefined);

  const { data: hackathons, isLoading: hackathonsLoading } = useHackathons({ ecosystem });
  const { data: grants, isLoading: grantsLoading } = useGrants({ ecosystem });
  const { data: ecosystems, isLoading: ecosystemsLoading } = useEcosystems();

  const handleEcosystemChange = (value: string) => {
    setEcosystem(value === 'all' ? undefined : value);
  };

  return (
    <div className="space-y-8 relative py-6">
      <Background3D />

      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-orange-500 mb-2">
          Opportunities
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover hackathons and grants to boost your Web3 career
        </p>
      </div>

      {/* Filters */}
      <FuturisticCard className="border-primary/20 relative z-10">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-white">Filter by Ecosystem:</span>
            </div>
            <Select
              value={ecosystem || 'all'}
              onValueChange={handleEcosystemChange}
              disabled={ecosystemsLoading}
            >
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10">
                <SelectValue placeholder="All Ecosystems" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ecosystems</SelectItem>
                {ecosystems?.map((eco) => (
                  <SelectItem key={eco} value={eco}>
                    {eco}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FuturisticCard>

      {/* Tabs */}
      <div className="relative z-10">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'hackathons' | 'grants')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger
              value="hackathons"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Hackathons ({hackathons?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="grants"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Grants ({grants?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Hackathons Tab */}
          <TabsContent value="hackathons" className="mt-6">
            {hackathonsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[400px] w-full" />
                ))}
              </div>
            ) : hackathons && hackathons.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {hackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            ) : (
              <FuturisticCard className="border-primary/20">
                <div className="p-12 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Hackathons Available</h3>
                  <p className="text-muted-foreground">
                    {ecosystem
                      ? `No hackathons found in the ${ecosystem} ecosystem. Try selecting a different ecosystem.`
                      : 'There are no active hackathons at the moment. Check back soon!'}
                  </p>
                </div>
              </FuturisticCard>
            )}
          </TabsContent>

          {/* Grants Tab */}
          <TabsContent value="grants" className="mt-6">
            {grantsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[400px] w-full" />
                ))}
              </div>
            ) : grants && grants.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {grants.map((grant) => (
                  <GrantCard key={grant.id} grant={grant} />
                ))}
              </div>
            ) : (
              <FuturisticCard className="border-primary/20">
                <div className="p-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Grants Available</h3>
                  <p className="text-muted-foreground">
                    {ecosystem
                      ? `No grants found in the ${ecosystem} ecosystem. Try selecting a different ecosystem.`
                      : 'There are no open grants at the moment. Check back soon!'}
                  </p>
                </div>
              </FuturisticCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
