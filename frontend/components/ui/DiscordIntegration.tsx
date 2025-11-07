'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '@/lib/constants';

interface DiscordIntegrationProps {
  partyId: string;
  partyName: string;
  isOwner: boolean;
  existingChannelUrl?: string;
  hasDiscordAccount?: boolean;
}

export default function DiscordIntegration({ partyId, partyName, isOwner, existingChannelUrl, hasDiscordAccount = false }: DiscordIntegrationProps) {
  const { data: session } = useSession();
  const [voiceChannelUrl, setVoiceChannelUrl] = useState<string | null>(existingChannelUrl || null);
  const DISCORD_GUILD_ID = '1427653997191499817';

  const handleJoinDiscord = () => {
    if (!session?.user?.email) return;

    // If user already has Discord linked, just redirect to the server
    if (hasDiscordAccount) {
      window.open(`https://discord.com/channels/${DISCORD_GUILD_ID}`, '_blank');
      return;
    }

    // Otherwise, go through OAuth flow
    window.location.href = `${API_URL}/discord/auth?userEmail=${encodeURIComponent(session.user.email)}&partyId=${partyId}`;
  };

  return (
    <div className="space-y-4">
      {/* Voice Channel - Always show if exists */}
      {voiceChannelUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                🎤 Party Voice Channel
              </h3>
              <p className="text-sm text-white/60 mb-3">
                Click below to join your party's voice channel on Discord
              </p>
              
              <div className="space-y-2">
                <a
                  href={voiceChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full"
                >
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base py-6">
                    <Users className="w-5 h-5 mr-2" />
                    Join Voice Channel Now
                  </Button>
                </a>
                <p className="text-xs text-white/40 text-center">
                  Opens Discord and connects you to the voice channel
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Join Discord Server */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              {hasDiscordAccount ? '💬 Open Discord Server' : 'First Time? Join Discord Server'}
            </h3>
            <p className="text-sm text-white/60 mb-3">
              {hasDiscordAccount 
                ? 'Open SquadLink Discord server to chat with your party'
                : 'One-time setup to join our Discord server'
              }
            </p>
            <Button
              onClick={handleJoinDiscord}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {hasDiscordAccount ? 'Open Discord Server' : 'Connect Discord Account'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
