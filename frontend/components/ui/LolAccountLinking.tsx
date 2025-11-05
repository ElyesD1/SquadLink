'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
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
      setError(err.message || 'Failed to find summoner. Please check your details and try again.');
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
      <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#0f1f3a]/60 to-[#0a1628]/60 border border-cyan-400/20 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/30"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/30"></div>
        
        <img
          src={lolService.getRankImageUrl(rank.tier)}
          alt={rank.tier}
          className="w-8 h-8 relative z-10 drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]"
        />
        <div className="flex-1 relative z-10">
          <div className="text-white font-mono font-medium tracking-wide">
            {lolService.formatQueueType(rank.queueType)}
          </div>
          <div className="text-cyan-400 text-sm font-mono">
            {lolService.getRankDisplayString(rank.tier, rank.rank)} • {rank.leaguePoints} LP
          </div>
          <div className="text-gray-400 text-xs font-mono">
            {rank.wins}W / {rank.losses}L
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Step 1: Search Form */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-6 border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.3)] max-w-md w-full relative overflow-hidden"
        >
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-lg font-bold text-cyan-400 font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.4)] flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              LINK LOL ACCOUNT
            </h3>
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-cyan-400/10 border border-transparent hover:border-cyan-400/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-400 font-mono text-sm mb-6 text-center relative z-10">
            Enter your Riot ID to connect your League account
          </p>

          <div className="space-y-4 relative z-10">
            {/* Region Selection */}
            <div>
              <label className="text-white font-mono text-sm font-semibold block mb-2 tracking-wide">
                REGION
              </label>
              <div className="relative">
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full bg-gradient-to-r from-[#0a1628]/80 to-[#1a2f4a]/80 border border-cyan-400/30 shadow-[0_0_15px_rgba(83,131,232,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:border-cyan-400/50 p-4 text-white font-mono focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 appearance-none pr-10"
                >
                  {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
              </div>
            </div>

            {/* Game Name */}
            <div>
              <label className="text-white font-mono text-sm font-semibold block mb-2 tracking-wide">
                GAME NAME
              </label>
              <Input
                type="text"
                placeholder="e.g., summoner"
                value={formData.gameName}
                onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
                className="w-full bg-gradient-to-r from-[#0a1628]/80 to-[#1a2f4a]/80 border border-cyan-400/30 shadow-[0_0_15px_rgba(83,131,232,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:border-cyan-400/50 p-4 text-white font-mono placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="text-white font-mono text-sm font-semibold block mb-2 tracking-wide">
                TAGLINE
              </label>
              <Input
                type="text"
                placeholder="e.g., 1234"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-gradient-to-r from-[#0a1628]/80 to-[#1a2f4a]/80 border border-cyan-400/30 shadow-[0_0_15px_rgba(83,131,232,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:border-cyan-400/50 p-4 text-white font-mono placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-400/50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-400/50"></div>
                <AlertCircle className="w-4 h-4 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] relative z-10" />
                <span className="text-red-400 text-sm font-mono relative z-10">{error}</span>
              </motion.div>
            )}

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={isSearching || !formData.gameName.trim() || !formData.tagline.trim()}
              className="w-full bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-4 border border-cyan-400/50 disabled:border-gray-500/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] disabled:shadow-none transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
              <div className="flex items-center justify-center gap-2 text-sm font-bold font-mono tracking-wider uppercase relative z-10">
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    SEARCHING...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    SEARCH SUMMONER
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Confirmation */}
      {step === 2 && searchResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-6 border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.3)] max-w-md w-full relative overflow-hidden"
        >
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-lg font-bold text-cyan-400 font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.4)] flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              CONFIRM ACCOUNT
            </h3>
            <button
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-cyan-400/10 border border-transparent hover:border-cyan-400/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-400 font-mono text-sm mb-6 text-center relative z-10">
            Is this your League of Legends account?
          </p>

          <div className="space-y-4 relative z-10">
            {/* Summoner Info */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#0f1f3a]/60 to-[#0a1628]/60 border border-cyan-400/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/30"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/30"></div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-[#5383E8] to-cyan-400 opacity-40 blur-md rounded-full"></div>
                <img
                  src={lolService.getSummonerIconUrl(searchResult.summoner.profileIconId)}
                  alt="Summoner Icon"
                  className="w-16 h-16 rounded-full border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.4)] relative z-10"
                />
              </div>
              <div className="flex-1 relative z-10">
                <div className="text-white font-mono font-bold text-lg tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  {searchResult.account.gameName}#{searchResult.account.tagLine}
                </div>
                <div className="text-gray-400 font-mono text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-cyan-400" />
                  Level {searchResult.summoner.summonerLevel}
                  <span className="mx-2">•</span>
                  {regions.find((r: any) => r.value === searchResult.region)?.label}
                </div>
              </div>
            </div>

            {/* Ranked Information */}
            {searchResult.rankedData && searchResult.rankedData.length > 0 && (
              <div>
                <div className="text-white font-mono font-semibold flex items-center gap-2 mb-3 tracking-wide">
                  <Trophy className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                  RANKED INFORMATION
                </div>
                <div className="space-y-2">
                  {getRankDisplay(searchResult.rankedData)}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-400/50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-400/50"></div>
                <AlertCircle className="w-4 h-4 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] relative z-10" />
                <span className="text-red-400 text-sm font-mono relative z-10">{error}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                disabled={isLinking}
                className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 disabled:from-gray-800 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 border border-gray-500/50 shadow-[0_0_15px_rgba(107,114,128,0.2)] hover:shadow-[0_0_25px_rgba(107,114,128,0.4)] disabled:shadow-none transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                <span className="text-sm font-bold font-mono tracking-wider uppercase relative z-10">BACK</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLinkAccount}
                disabled={isLinking}
                className="flex-1 bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 border border-cyan-400/50 disabled:border-gray-500/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] disabled:shadow-none transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                <div className="flex items-center justify-center gap-2 text-sm font-bold font-mono tracking-wider uppercase relative z-10">
                  {isLinking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      LINKING...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      LINK ACCOUNT
                    </>
                  )}
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-8 border-2 border-green-400/40 shadow-[0_0_40px_rgba(34,197,94,0.4)] max-w-md w-full text-center relative overflow-hidden"
        >
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400/50"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400/50"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400/50"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400/50"></div>
          
          {/* Glowing orb effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.6)] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-green-300/50 to-transparent rounded-full"></div>
              <CheckCircle className="w-10 h-10 text-white relative z-10" strokeWidth={3} />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-green-400 font-mono tracking-wider uppercase mb-3 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]"
            >
              ACCOUNT LINKED!
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 font-mono text-sm"
            >
              Your League of Legends account has been successfully linked to your profile.
            </motion.p>
            
            {/* Animated success particles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex justify-center gap-2"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{
                    delay: 0.6 + i * 0.1,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}