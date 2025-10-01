import { useState, useEffect } from 'react';
import { X, Check, Crown, Zap, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  max_quality: string;
  max_devices: number;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [currentTierId, setCurrentTierId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTiers();
      if (user) {
        loadCurrentSubscription();
      }
    }
  }, [isOpen, user]);

  const loadTiers = async () => {
    const { data } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('price', { ascending: true });

    if (data) {
      setTiers(data);
    }
  };

  const loadCurrentSubscription = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_subscriptions')
      .select('tier_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      setCurrentTierId(data.tier_id);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingSub) {
        await supabase
          .from('user_subscriptions')
          .update({ tier_id: tierId, updated_at: new Date().toISOString() })
          .eq('id', existingSub.id);
      } else {
        await supabase.from('user_subscriptions').insert({
          user_id: user.id,
          tier_id: tierId,
          status: 'active',
        });
      }

      setCurrentTierId(tierId);
    } catch (error) {
      console.error('Error updating subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free':
        return <Shield className="text-slate-400" size={32} />;
      case 'basic':
        return <Zap className="text-blue-400" size={32} />;
      case 'premium':
        return <Crown className="text-yellow-400" size={32} />;
      default:
        return <Shield className="text-slate-400" size={32} />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free':
        return 'from-slate-600 to-slate-700';
      case 'basic':
        return 'from-blue-600 to-blue-700';
      case 'premium':
        return 'from-yellow-600 to-orange-600';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-lg max-w-6xl w-full p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-4xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-slate-400 mb-8">
          Unlock unlimited entertainment with the perfect plan for you
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const isCurrentPlan = tier.id === currentTierId;
            const isPremium = tier.name.toLowerCase() === 'premium';

            return (
              <div
                key={tier.id}
                className={`relative bg-slate-800 rounded-lg p-6 border-2 transition ${
                  isPremium
                    ? 'border-yellow-500 scale-105'
                    : isCurrentPlan
                    ? 'border-cyan-500'
                    : 'border-slate-700'
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  {getTierIcon(tier.name)}
                  {isCurrentPlan && (
                    <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 mb-4">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${tier.price.toFixed(2)}
                  </span>
                  <span className="text-slate-400">/month</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="text-cyan-400 flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading || isCurrentPlan}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    isCurrentPlan
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${getTierColor(
                          tier.name
                        )} text-white hover:opacity-90`
                  }`}
                >
                  {loading
                    ? 'Processing...'
                    : isCurrentPlan
                    ? 'Current Plan'
                    : tier.price === 0
                    ? 'Select Free Plan'
                    : 'Upgrade Now'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>All plans include a 30-day money-back guarantee</p>
          <p>Cancel anytime with no fees or penalties</p>
        </div>
      </div>
    </div>
  );
}
