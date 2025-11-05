'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card/30 border border-border/20">
          <img
            src="/Rank=Iron.png"
            alt="Unranked"
            className="w-12 h-12"
          />
          <div className="flex-1">
            <div className={`${getTextClass(currentTheme)} font-semibold`}>
              {queueName}
            </div>
            <div className={`${getSecondaryTextClass(currentTheme)} text-sm`}>
              Unranked
            </div>
          </div>
        </div>
      );
    }

    const winRate = getWinRate(rankData.wins, rankData.losses);
    const total = rankData.wins + rankData.losses;

    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/30">
        <img
          src={lolService.getRankImageUrl(rankData.tier)}
          alt={rankData.tier}
          className="w-12 h-12"
        />
        <div className="flex-1">
          <div className={`${getTextClass(currentTheme)} font-semibold`}>
            {queueName}
          </div>
          <div className={`${getTextClass(currentTheme)} text-sm font-medium`}>
            {lolService.getRankDisplayString(rankData.tier, rankData.rank)}
          </div>
          <div className={`${getSecondaryTextClass(currentTheme)} text-xs`}>
            {rankData.leaguePoints} LP
          </div>
        </div>
        <div className="text-right">
          <div className={`${getWinRateColor(winRate)} font-semibold text-sm`}>
            {winRate}% WR
          </div>
          <div className={`${getSecondaryTextClass(currentTheme)} text-xs`}>
            {rankData.wins}W / {rankData.losses}L
          </div>
          <div className={`${getSecondaryTextClass(currentTheme)} text-xs`}>
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
      <Card className={`border-2 border-purple-500/30 shadow-xl shadow-purple-500/10 backdrop-blur-sm ${getCardClass(currentTheme)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`${getTextClass(currentTheme)} text-xl flex items-center gap-2`}>
              <Trophy className="w-5 h-5 text-purple-500" />
              League of Legends Account
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover:bg-blue-500/10"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlink}
                disabled={isUnlinking}
                className="hover:bg-red-500/10 text-red-500 border-red-500/30"
              >
                {isUnlinking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30"
            >
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-500 text-sm font-medium">{successMessage}</span>
            </motion.div>
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

          {/* Summoner Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/30">
            <img
              src={lolService.getSummonerIconUrl(lolAccount.profileIconId)}
              alt="Summoner Icon"
              className="w-16 h-16 rounded-full border-2 border-purple-500"
            />
            <div className="flex-1">
              <div className={`${getTextClass(currentTheme)} font-bold text-lg`}>
                {lolAccount.gameName}#{lolAccount.tagLine}
              </div>
              <div className={`${getSecondaryTextClass(currentTheme)} text-sm flex items-center gap-2`}>
                <Star className="w-4 h-4" />
                Level {lolAccount.summonerLevel}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {regionName}
                </Badge>
                <div className={`${getSecondaryTextClass(currentTheme)} text-xs flex items-center gap-1`}>
                  <Calendar className="w-3 h-3" />
                  Updated {formatLastUpdated(lolAccount.lastUpdated)}
                </div>
              </div>
            </div>
          </div>

          {/* Ranked Information */}
          <div className="space-y-3">
            <h4 className={`${getTextClass(currentTheme)} font-semibold flex items-center gap-2`}>
              <Trophy className="w-4 h-4" />
              Ranked Statistics
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
                  <div key={index} className="text-center p-3 rounded-lg bg-card/30 border border-border/20">
                    <div className={`${getTextClass(currentTheme)} font-semibold text-sm`}>
                      {lolService.formatQueueType(rank.queueType)}
                    </div>
                    <div className={`${getWinRateColor(winRate)} font-bold text-lg`}>
                      {winRate}%
                    </div>
                    <div className={`${getSecondaryTextClass(currentTheme)} text-xs`}>
                      Win Rate
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}