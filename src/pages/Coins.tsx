import { useState, useEffect } from 'react';
import { Wallet, ShoppingBag, History, Gift, Zap, Crown, Sparkles, Star, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const COIN_USES = [
  { icon: '💬', label: 'Message Request', cost: 50, desc: 'Message someone before matching' },
  { icon: '⭐', label: 'Super Like', cost: 30, desc: 'Stand out with a Super Like' },
  { icon: '🚀', label: 'Profile Boost (1hr)', cost: 100, desc: 'Get 10x more visibility' },
  { icon: '🎁', label: 'Send Gift', cost: 50, desc: 'Send a virtual gift to your match' },
  { icon: '📹', label: 'Video Date', cost: 200, desc: 'Schedule a video date' },
  { icon: '🎪', label: 'Event Entry', cost: 150, desc: 'Join exclusive dating events' },
  { icon: '🔓', label: 'Reveal Admirer', cost: 150, desc: 'See who has a secret crush on you' },
  { icon: '🌍', label: 'Travel Mode (1 week)', cost: 300, desc: 'Match with people in any city' },
];

export function Coins() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'history' | 'spend'>('buy');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [pkgs, coins, txns] = await Promise.all([
        api.getCoinPackages(),
        api.getUserCoins(user.id),
        api.getCoinTransactions(user.id, 20),
      ]);
      setPackages(pkgs);
      setBalance(coins?.balance || 0);
      setTransactions(txns);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: any) => {
    setPurchasing(pkg.id);
    try {
      toast({
        title: '🪙 Purchase Initiated',
        description: `${pkg.coins + pkg.bonus_coins} Spark Coins for $${(pkg.price_cents / 100).toFixed(2)}`,
      });
      // In production, redirect to Stripe checkout
      // For demo, award coins directly
      await api.awardCoins(user!.id, pkg.coins + pkg.bonus_coins, `Purchased ${pkg.name} package`);
      await loadData();
      toast({ title: '✅ Coins Added!', description: `${pkg.coins + pkg.bonus_coins} Spark Coins added to your balance` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Balance Card */}
          <div className="relative bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-3xl p-8 text-white overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🪙</span>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Your Spark Coins</p>
                  <h2 className="text-4xl font-bold">{balance.toLocaleString()}</h2>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Use coins for premium features</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {[
              { key: 'buy', label: 'Buy Coins', icon: ShoppingBag },
              { key: 'spend', label: 'How to Spend', icon: Gift },
              { key: 'history', label: 'History', icon: History },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Buy Coins */}
          {activeTab === 'buy' && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground text-sm">
                Coins unlock premium features — no subscription needed.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {packages.map(pkg => {
                  const totalCoins = pkg.coins + pkg.bonus_coins;
                  return (
                    <div
                      key={pkg.id}
                      className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${
                        pkg.is_popular
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      {pkg.is_popular && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-yellow-500 rounded-full text-xs font-bold text-white whitespace-nowrap">
                          ⭐ Most Popular
                        </div>
                      )}
                      {pkg.bonus_coins > 0 && (
                        <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-green-500 rounded-full text-xs font-bold text-white">
                          +{pkg.bonus_coins} FREE
                        </div>
                      )}

                      <div className="text-center">
                        <div className="text-3xl mb-1">🪙</div>
                        <div className="text-2xl font-bold">{totalCoins.toLocaleString()}</div>
                        {pkg.bonus_coins > 0 && (
                          <div className="text-xs text-green-500 font-medium">{pkg.coins} + {pkg.bonus_coins} bonus</div>
                        )}
                        <div className="text-lg font-bold mt-2 text-primary">
                          ${(pkg.price_cents / 100).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">
                          ${((pkg.price_cents / 100) / totalCoins * 100).toFixed(1)}¢ per coin
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(pkg)}
                          disabled={purchasing === pkg.id}
                          className={`w-full ${pkg.is_popular ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-0' : 'gradient-primary text-white border-0'}`}
                        >
                          {purchasing === pkg.id ? 'Processing...' : 'Buy Now'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Earn Free Coins */}
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Earn Free Coins
                </h3>
                <div className="space-y-2">
                  {[
                    { action: 'Complete your profile', coins: 100, icon: '✅' },
                    { action: 'Invite a friend', coins: 50, icon: '👫' },
                    { action: 'Get profile verified', coins: 150, icon: '✓' },
                    { action: 'Daily login streak (7 days)', coins: 75, icon: '🔥' },
                    { action: 'Complete personality test', coins: 30, icon: '🧠' },
                  ].map(item => (
                    <div key={item.action} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm">{item.action}</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-500">+{item.coins} 🪙</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* How to Spend */}
          {activeTab === 'spend' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Use your coins for premium actions without a subscription.</p>
              <div className="grid grid-cols-2 gap-3">
                {COIN_USES.map(use => (
                  <div key={use.label} className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-all">
                    <div className="text-3xl mb-2">{use.icon}</div>
                    <h4 className="font-semibold text-sm mb-0.5">{use.label}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{use.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-yellow-500">{use.cost} 🪙</span>
                      {balance >= use.cost ? (
                        <span className="text-xs text-green-500 font-medium">✓ Enough coins</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{use.cost - balance} more needed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📋</div>
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                transactions.map(txn => (
                  <div key={txn.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      txn.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {txn.amount > 0 ? '⬆️' : '⬇️'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${txn.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {txn.amount > 0 ? '+' : ''}{txn.amount} 🪙
                      </p>
                      <p className="text-xs text-muted-foreground">Balance: {txn.balance_after}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
