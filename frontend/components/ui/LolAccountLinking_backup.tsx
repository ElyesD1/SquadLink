'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Gamepad2,
  Trophy,
  Star,
  Link,
  ChevronDown,
  X
} from 'lucide-react';
import { lolService, type SearchSummonerRequest } from '@/lib/lol-service';

interface LolAccountLinkingProps {
  userEmail: string;
  onBack: () => void;
  onSuccess: (accountData: any) => void;
  currentTheme: string;
}

interface SummonerData {
  account: {
    puuid: string;
    gameName: string;
    tagLine: string;
  };
  summoner: {
    summonerLevel: number;
    profileIconId: number;
  };
  rankedData: Array<{
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
  }>;
  region: string;
}

export default function LolAccountLinking({ 
  userEmail, 
  onBack, 
  onSuccess, 
  currentTheme 
}: LolAccountLinkingProps) {
  const [step, setStep] = useState(1); // 1: Search Form, 2: Confirmation, 3: Success
  const [formData, setFormData] = useState({
    gameName: '',
    tagline: '',
    region: 'euw1'
  });
  
  const [searchResult, setSearchResult] = useState<SummonerData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');

  const getTextClass = (theme: string) => theme === 'light' ? 'text-gray-900' : 'text-white';
  const getSecondaryTextClass = (theme: string) => theme === 'light' ? 'text-gray-600' : 'text-white/60';
  const getCardClass = (theme: string) => theme === 'light' ? 'bg-white/90' : 'bg-card/90';
  const getBorderClass = (theme: string) => theme === 'light' ? 'border-gray-200' : 'border-border';

  const regions = lolService.getAvailableRegions();

  const handleSearch = async () => {
    if (!formData.gameName.trim() || !formData.tagline.trim()) {
      setError('Please enter both game name and tagline');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const result = await lolService.searchSummoner({
        gameName: formData.gameName.trim(),
        tagline: formData.tagline.trim(),
        region: formData.region
      });

      setSearchResult(result);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to find summoner. Please check your information.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!searchResult) return;

    setIsLinking(true);
    setError('');

    try {
      await lolService.linkLolAccount({
        email: userEmail,
        gameName: formData.gameName.trim(),
        tagline: formData.tagline.trim(),
        region: formData.region
      });

      setStep(3);
      // Call onSuccess after a short delay to show the success message
      setTimeout(() => {
        onSuccess(searchResult);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to link account. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const getRankDisplay = (rankData: any) => {
    if (!rankData || rankData.length === 0) return null;

    return rankData.map((rank: any, index: number) => (
      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
        <img
          src={lolService.getRankImageUrl(rank.tier)}
          alt={rank.tier}
          className="w-8 h-8"
        />
        <div className="flex-1">
          <div className={`${getTextClass(currentTheme)} font-medium`}>
            {lolService.formatQueueType(rank.queueType)}
          </div>
          <div className={`${getSecondaryTextClass(currentTheme)} text-sm`}>
            {lolService.getRankDisplayString(rank.tier, rank.rank)} • {rank.leaguePoints} LP
          </div>
          <div className={`${getSecondaryTextClass(currentTheme)} text-xs`}>
            {rank.wins}W / {rank.losses}L
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className={`fixed inset-0 ${currentTheme === 'light' ? 'bg-black/30' : 'bg-black/50'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
      {/* Step 1: Search Form */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-xl bg-card/95 rounded-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`${getTextClass(currentTheme)} text-xl font-bold flex items-center gap-2`}>
              <Gamepad2 className="w-6 h-6 text-purple-500" />
              Link LoL Account
            </h3>
            <button
              onClick={onBack}
              className={`${getSecondaryTextClass(currentTheme)} hover:${getTextClass(currentTheme)} transition-colors`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          
          <p className={`${getSecondaryTextClass(currentTheme)} text-sm mb-6 text-center`}>
            Enter your Riot ID to connect your League account
          </p>

          <div className="space-y-4">
            {/* Region Selection */}
            <div>
              <label className={`${getTextClass(currentTheme)} text-sm font-medium block mb-2`}>
                Region
              </label>
              <div className="relative">
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className={`w-full border border-border/50 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-card/80 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 ${getTextClass(currentTheme)} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none pr-10`}
                >
                  {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getSecondaryTextClass(currentTheme)} pointer-events-none`} />
              </div>
            </div>

              {/* Game Name */}
              <div>
                <label className={`${getTextClass(currentTheme)} text-sm font-medium block mb-2`}>
                  Game Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Akaidou"
                  value={formData.gameName}
                  onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
                  className={`border border-border/50 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-card/80 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 ${getTextClass(currentTheme)} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                />
              </div>

              {/* Tagline */}
              <div>
                <label className={`${getTextClass(currentTheme)} text-sm font-medium block mb-2`}>
                  Tagline
                </label>
                <Input
                  type="text"
                  placeholder="e.g., 9823"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className={`border border-border/50 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-card/80 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 ${getTextClass(currentTheme)} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 text-sm">{error}</span>
                </motion.div>
              )}

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={isSearching || !formData.gameName.trim() || !formData.tagline.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Summoner
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Confirmation */}
      {step === 2 && searchResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-xl bg-card/95 rounded-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`${getTextClass(currentTheme)} text-xl font-bold flex items-center gap-2`}>
              <Trophy className="w-6 h-6 text-purple-500" />
              Confirm Account
            </h3>
            <button
              onClick={() => setStep(1)}
              className={`${getSecondaryTextClass(currentTheme)} hover:${getTextClass(currentTheme)} transition-colors`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          
          <p className={`${getSecondaryTextClass(currentTheme)} text-sm mb-6 text-center`}>
            Is this your League of Legends account?
          </p>

          <div className="space-y-4">
              {/* Summoner Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/30">
                <img
                  src={lolService.getSummonerIconUrl(searchResult.summoner.profileIconId)}
                  alt="Summoner Icon"
                  className="w-16 h-16 rounded-full border-2 border-purple-500"
                />
                <div className="flex-1">
                  <div className={`${getTextClass(currentTheme)} font-bold text-lg`}>
                    {searchResult.account.gameName}#{searchResult.account.tagLine}
                  </div>
                  <div className={`${getSecondaryTextClass(currentTheme)} text-sm flex items-center gap-2`}>
                    <Star className="w-4 h-4" />
                    Level {searchResult.summoner.summonerLevel}
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {regions.find(r => r.value === searchResult.region)?.label}
                  </Badge>
                </div>
              </div>

              {/* Ranked Data */}
              {searchResult.rankedData && searchResult.rankedData.length > 0 && (
                <div className="space-y-2">
                  <div className={`${getTextClass(currentTheme)} font-medium flex items-center gap-2`}>
                    <Trophy className="w-4 h-4" />
                    Ranked Information
                  </div>
                  {getRankDisplay(searchResult.rankedData)}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 text-sm">{error}</span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={isLinking}
                >
                  Back
                </Button>
                <Button
                  onClick={handleLinkAccount}
                  disabled={isLinking}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Link Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-green-500/30 shadow-2xl shadow-green-500/10 backdrop-blur-xl bg-card/95 rounded-2xl p-6 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className={`${getTextClass(currentTheme)} text-xl font-bold mb-2`}>
            Account Linked Successfully!
          </h3>
          <p className={`${getSecondaryTextClass(currentTheme)} text-sm`}>
            Your League of Legends account has been linked to your profile.
          </p>
        </motion.div>
      )}
    </div>
  );
}