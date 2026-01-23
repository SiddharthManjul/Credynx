'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { Background3D } from '@/components/landing/Background3D';
import { FuturisticCard } from '@/components/ui/futuristic-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FuturisticButton as Button } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateHackathon, useCreateGrant } from '@/lib/hooks';
import { Trophy, DollarSign, Plus, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const hackathonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ecosystem: z.string().min(1, 'Ecosystem is required'),
  organizer: z.string().min(1, 'Organizer is required'),
  prizePool: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  websiteUrl: z.string().url('Must be a valid URL'),
});

const grantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ecosystem: z.string().min(1, 'Ecosystem is required'),
  provider: z.string().min(1, 'Provider is required'),
  amount: z.string().optional(),
  websiteUrl: z.string().url('Must be a valid URL'),
  deadline: z.string().optional(),
});

type HackathonFormData = z.infer<typeof hackathonSchema>;
type GrantFormData = z.infer<typeof grantSchema>;

export default function AdminOpportunitiesPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'hackathons' | 'grants'>('hackathons');

  const createHackathon = useCreateHackathon();
  const createGrant = useCreateGrant();

  const {
    register: registerHackathon,
    handleSubmit: handleSubmitHackathon,
    reset: resetHackathon,
    formState: { errors: hackathonErrors },
  } = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema),
  });

  const {
    register: registerGrant,
    handleSubmit: handleSubmitGrant,
    reset: resetGrant,
    formState: { errors: grantErrors },
  } = useForm<GrantFormData>({
    resolver: zodResolver(grantSchema),
  });

  // Redirect if not admin
  if (!isAdmin) {
    router.push('/dashboard');
    return null;
  }

  const onSubmitHackathon = async (data: HackathonFormData) => {
    await createHackathon.mutateAsync({
      name: data.name,
      ecosystem: data.ecosystem,
      organizer: data.organizer,
      prizePool: data.prizePool ? parseFloat(data.prizePool) : undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      websiteUrl: data.websiteUrl,
    });
    resetHackathon();
  };

  const onSubmitGrant = async (data: GrantFormData) => {
    await createGrant.mutateAsync({
      name: data.name,
      ecosystem: data.ecosystem,
      provider: data.provider,
      amount: data.amount ? parseFloat(data.amount) : undefined,
      websiteUrl: data.websiteUrl,
      deadline: data.deadline || undefined,
    });
    resetGrant();
  };

  return (
    <div className="space-y-8 relative py-6">
      <Background3D />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-orange-400" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-orange-500">
            Admin: Manage Opportunities
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Add hackathons and grants to the platform
        </p>
      </div>

      {/* Admin Info Alert */}
      <Alert className="relative z-10 border-orange-500/30 bg-orange-500/10">
        <Shield className="h-4 w-4 text-orange-400" />
        <AlertDescription className="text-white/80">
          You have admin access. All opportunities you create will be immediately visible to all users on the platform.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <div className="relative z-10">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'hackathons' | 'grants')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger
              value="hackathons"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Add Hackathon
            </TabsTrigger>
            <TabsTrigger
              value="grants"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add Grant
            </TabsTrigger>
          </TabsList>

          {/* Hackathon Form */}
          <TabsContent value="hackathons" className="mt-6">
            <FuturisticCard className="border-primary/20">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Hackathon</h2>
                <form onSubmit={handleSubmitHackathon(onSubmitHackathon)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hackathon-name">Hackathon Name *</Label>
                      <Input
                        id="hackathon-name"
                        placeholder="ETHGlobal 2026"
                        {...registerHackathon('name')}
                        className="bg-white/5 border-white/10"
                      />
                      {hackathonErrors.name && (
                        <p className="text-sm text-destructive">{hackathonErrors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hackathon-ecosystem">Ecosystem *</Label>
                      <Input
                        id="hackathon-ecosystem"
                        placeholder="Ethereum, Solana, Polygon"
                        {...registerHackathon('ecosystem')}
                        className="bg-white/5 border-white/10"
                      />
                      {hackathonErrors.ecosystem && (
                        <p className="text-sm text-destructive">{hackathonErrors.ecosystem.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hackathon-organizer">Organizer *</Label>
                      <Input
                        id="hackathon-organizer"
                        placeholder="ETHGlobal"
                        {...registerHackathon('organizer')}
                        className="bg-white/5 border-white/10"
                      />
                      {hackathonErrors.organizer && (
                        <p className="text-sm text-destructive">{hackathonErrors.organizer.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hackathon-prize">Prize Pool (USD)</Label>
                      <Input
                        id="hackathon-prize"
                        type="number"
                        placeholder="100000"
                        {...registerHackathon('prizePool')}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hackathon-start">Start Date *</Label>
                      <Input
                        id="hackathon-start"
                        type="date"
                        {...registerHackathon('startDate')}
                        className="bg-white/5 border-white/10"
                      />
                      {hackathonErrors.startDate && (
                        <p className="text-sm text-destructive">{hackathonErrors.startDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hackathon-end">End Date *</Label>
                      <Input
                        id="hackathon-end"
                        type="date"
                        {...registerHackathon('endDate')}
                        className="bg-white/5 border-white/10"
                      />
                      {hackathonErrors.endDate && (
                        <p className="text-sm text-destructive">{hackathonErrors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hackathon-url">Website URL *</Label>
                    <Input
                      id="hackathon-url"
                      placeholder="https://ethglobal.com/events/2026"
                      {...registerHackathon('websiteUrl')}
                      className="bg-white/5 border-white/10"
                    />
                    {hackathonErrors.websiteUrl && (
                      <p className="text-sm text-destructive">{hackathonErrors.websiteUrl.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={createHackathon.isPending}
                    className="w-full md:w-auto"
                    borderColor="rgba(249, 115, 22, 1)"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createHackathon.isPending ? 'Creating...' : 'Create Hackathon'}
                  </Button>
                </form>
              </div>
            </FuturisticCard>
          </TabsContent>

          {/* Grant Form */}
          <TabsContent value="grants" className="mt-6">
            <FuturisticCard className="border-primary/20">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Grant</h2>
                <form onSubmit={handleSubmitGrant(onSubmitGrant)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="grant-name">Grant Name *</Label>
                      <Input
                        id="grant-name"
                        placeholder="Ethereum Foundation Grant"
                        {...registerGrant('name')}
                        className="bg-white/5 border-white/10"
                      />
                      {grantErrors.name && (
                        <p className="text-sm text-destructive">{grantErrors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grant-ecosystem">Ecosystem *</Label>
                      <Input
                        id="grant-ecosystem"
                        placeholder="Ethereum, Solana, Polygon"
                        {...registerGrant('ecosystem')}
                        className="bg-white/5 border-white/10"
                      />
                      {grantErrors.ecosystem && (
                        <p className="text-sm text-destructive">{grantErrors.ecosystem.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="grant-provider">Provider *</Label>
                      <Input
                        id="grant-provider"
                        placeholder="Ethereum Foundation"
                        {...registerGrant('provider')}
                        className="bg-white/5 border-white/10"
                      />
                      {grantErrors.provider && (
                        <p className="text-sm text-destructive">{grantErrors.provider.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grant-amount">Grant Amount (USD)</Label>
                      <Input
                        id="grant-amount"
                        type="number"
                        placeholder="50000"
                        {...registerGrant('amount')}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="grant-url">Website URL *</Label>
                      <Input
                        id="grant-url"
                        placeholder="https://ethereum.foundation/grants"
                        {...registerGrant('websiteUrl')}
                        className="bg-white/5 border-white/10"
                      />
                      {grantErrors.websiteUrl && (
                        <p className="text-sm text-destructive">{grantErrors.websiteUrl.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grant-deadline">Deadline (Optional)</Label>
                      <Input
                        id="grant-deadline"
                        type="date"
                        {...registerGrant('deadline')}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={createGrant.isPending}
                    className="w-full md:w-auto"
                    borderColor="rgba(34, 197, 94, 1)"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createGrant.isPending ? 'Creating...' : 'Create Grant'}
                  </Button>
                </form>
              </div>
            </FuturisticCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
