'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  RefreshCw, 
  Unlink, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { lolService, type LolAccount } from '@/lib/lol-service';

interface LolProfileDisplayProps {
  lolAccount: LolAccount;
  userEmail: string;
  currentTheme: string;
  onRefresh: (accountData: LolAccount) => void;
  onUnlink: () => void;
}

export default function LolProfileDisplay({ 
  lolAccount, 
  userEmail, 
  currentTheme, 
  onRefresh, 
  onUnlink 
}: LolProfileDisplayProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getTextClass = (theme: string) => theme === 'light' ? 'text-gray-900' : 'text-white';
  const getSecondaryTextClass = (theme: string) => theme === 'light' ? 'text-gray-600' : 'text-white/60';
  const getCardClass = (theme: string) => theme === 'light' ? 'bg-white/90' : 'bg-card/90';

  const regions = lolService.getAvailableRegions();
  const regionName = regions.find(r => r.value === lolAccount.region)?.label || lolAccount.region;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('[LolProfileDisplay] Starting refresh for:', userEmail);
      const refreshedData = await lolService.refreshLolAccount(userEmail);
      console.log('[LolProfileDisplay] Refresh response:', refreshedData);
      console.log('[LolProfileDisplay] Updated LoL account:', refreshedData.lolAccount);
      
      onRefresh(refreshedData.lolAccount);
      setSuccessMessage('Account data refreshed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('[LolProfileDisplay] Refresh error:', err);
      setError(err.message || 'Failed to refresh account data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    setError('');

    try {
      await lolService.unlinkLolAccount(userEmail);
      onUnlink();
    } catch (err: any) {
      setError(err.message || 'Failed to unlink account');
    } finally {
      setIsUnlinking(false);
    }
  };

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 60) return 'text-green-500';
    if (winRate >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getSoloQueueRank = () => {
    return lolAccount.rankedData.find(rank => rank.queueType === 'RANKED_SOLO_5x5');
  };

  const getFlexRank = () => {
    return lolAccount.rankedData.find(rank => rank.queueType === 'RANKED_FLEX_SR');
  };

  const RankCard = ({ rankData, queueName }: { rankData: any, queueName: string }) => {
    if (!rankData) {
      return (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#0f1f3a]/60 to-[#0a1628]/60 border border-cyan-400/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/30"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/30"></div>
          
          <img
            src="/Rank=Iron.png"
            alt="Unranked"
            className="w-12 h-12 relative z-10"
          />
          <div className="flex-1 relative z-10">
            <div className="text-white font-mono font-semibold tracking-wide drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
              {queueName}
            </div>
            <div className="text-gray-400 font-mono text-sm">
              Unranked
            </div>
          </div>
        </div>
      );
    }

    const winRate = getWinRate(rankData.wins, rankData.losses);
    const total = rankData.wins + rankData.losses;

    return (
      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#0f1f3a]/60 to-[#0a1628]/60 border border-cyan-400/20 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-[#5383E8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/30"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/30"></div>
        
        <img
          src={lolService.getRankImageUrl(rankData.tier)}
          alt={rankData.tier}
          className="w-12 h-12 relative z-10 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]"
        />
        <div className="flex-1 relative z-10">
          <div className="text-white font-mono font-semibold tracking-wide drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
            {queueName}
          </div>
          <div className="text-cyan-400 text-sm font-mono font-medium drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">
            {lolService.getRankDisplayString(rankData.tier, rankData.rank)}
          </div>
          <div className="text-gray-400 font-mono text-xs">
            {rankData.leaguePoints} LP
          </div>
        </div>
        <div className="text-right relative z-10">
          <div className={`${getWinRateColor(winRate)} font-semibold text-sm font-mono drop-shadow-[0_0_8px_currentColor]`}>
            {winRate}% WR
          </div>
          <div className="text-gray-400 font-mono text-xs">
            {rankData.wins}W / {rankData.losses}L
          </div>
          <div className="text-gray-500 font-mono text-xs">
            {total} games
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Profile Card */}
      <div className="bg-gradient-to-br from-[#0f1f3a]/60 to-[#0a1628]/60 rounded-none p-6 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(0,255,255,0.2)] relative overflow-hidden">
        {/* Top tech line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
        
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/40"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/40"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
            <h3 className="text-sm font-bold text-cyan-400 font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              LEAGUE OF LEGENDS ACCOUNT
            </h3>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-2 border border-cyan-400/50 disabled:border-gray-500/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] disabled:shadow-none transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/50"></div>
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/50"></div>
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin relative z-10" />
              ) : (
                <RefreshCw className="w-4 h-4 relative z-10" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUnlink}
              disabled={isUnlinking}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-2 border border-red-400/50 disabled:border-gray-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] disabled:shadow-none transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/50"></div>
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/50"></div>
              {isUnlinking ? (
                <Loader2 className="w-4 h-4 animate-spin relative z-10" />
              ) : (
                <Unlink className="w-4 h-4 relative z-10" />
              )}
            </motion.button>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-400/50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-400/50"></div>
              <svg className="w-4 h-4 text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.6)] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 text-sm font-mono font-medium relative z-10">{successMessage}</span>
            </motion.div>
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

          {/* Summoner Info */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#0f1f3a]/60 to-[#0a1628]/60 border border-cyan-400/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/30"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/30"></div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-[#5383E8] to-cyan-400 opacity-40 blur-md rounded-full"></div>
              <img
                src={lolService.getSummonerIconUrl(lolAccount.profileIconId)}
                alt="Summoner Icon"
                className="w-16 h-16 rounded-full border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.4)] relative z-10"
              />
            </div>
            <div className="flex-1 relative z-10">
              <div className="text-white font-mono font-bold text-lg tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                {lolAccount.gameName}#{lolAccount.tagLine}
              </div>
              <div className="text-gray-400 font-mono text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-cyan-400" />
                Level {lolAccount.summonerLevel}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-gradient-to-r from-[#5383E8]/20 to-cyan-400/20 border border-cyan-400/30 px-2 py-0.5 text-cyan-400 font-mono text-xs font-semibold tracking-wider">
                  {regionName}
                </div>
                <div className="text-gray-500 font-mono text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Updated {formatLastUpdated(lolAccount.lastUpdated)}
                </div>
              </div>
            </div>
          </div>

          {/* Ranked Information */}
          <div className="space-y-3">
            <h4 className="text-white font-mono font-bold tracking-wider uppercase text-sm flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              <Trophy className="w-4 h-4 text-cyan-400" />
              RANKED STATISTICS
            </h4>
            
            <div className="space-y-3">
              <RankCard 
                rankData={getSoloQueueRank()} 
                queueName="Solo/Duo Queue" 
              />
              <RankCard 
                rankData={getFlexRank()} 
                queueName="Flex Queue" 
              />
            </div>
          </div>

          {/* Quick Stats */}
          {lolAccount.rankedData && lolAccount.rankedData.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {lolAccount.rankedData.map((rank, index) => {
                const winRate = getWinRate(rank.wins, rank.losses);
                return (
                  <div key={index} className="text-center p-3 bg-gradient-to-br from-[#0f1f3a]/60 to-[#0a1628]/60 border border-cyan-400/20 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/30"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/30"></div>
                    <div className="text-white font-mono font-semibold text-sm tracking-wide relative z-10">
                      {lolService.formatQueueType(rank.queueType)}
                    </div>
                    <div className={`${getWinRateColor(winRate)} font-bold text-lg font-mono drop-shadow-[0_0_8px_currentColor] relative z-10`}>
                      {winRate}%
                    </div>
                    <div className="text-gray-400 font-mono text-xs relative z-10">
                      Win Rate
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}