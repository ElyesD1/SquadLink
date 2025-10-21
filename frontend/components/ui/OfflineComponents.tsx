'use client';

import React from 'react';
import { useOffline } from '../../lib/useOffline';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOfflineMode, connectionType, refreshCache } = useOffline();

  if (!isOfflineMode) return null;

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="font-medium">You're offline</span>
        <span className="text-yellow-800">
          {connectionType ? `Connection: ${connectionType}` : 'No internet connection'}
        </span>
      </div>
      <button
        onClick={() => refreshCache()}
        className="flex items-center space-x-1 hover:bg-yellow-600 px-2 py-1 rounded transition-colors"
        title="Refresh cache"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Refresh</span>
      </button>
    </div>
  );
};

export const OnlineIndicator: React.FC = () => {
  const { isOnline, connectionType } = useOffline();

  return (
    <div className={`flex items-center space-x-1 text-xs ${
      isOnline ? 'text-green-600' : 'text-red-600'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Online</span>
          {connectionType && (
            <span className="text-gray-500">({connectionType})</span>
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};

interface OfflineMessageProps {
  title?: string;
  message?: string;
  showRefresh?: boolean;
  className?: string;
}

export const OfflineMessage: React.FC<OfflineMessageProps> = ({
  title = "Content Unavailable Offline",
  message = "This content requires an internet connection. Please check your connection and try again.",
  showRefresh = true,
  className = ""
}) => {
  const { isOfflineMode, refreshCache } = useOffline();

  if (!isOfflineMode) return null;

  return (
    <div className={`text-center py-8 px-4 ${className}`}>
      <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">{message}</p>
      {showRefresh && (
        <button
          onClick={() => refreshCache()}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

interface CachedDataIndicatorProps {
  dataType: string;
  isAvailable: boolean;
  lastUpdated?: Date;
  className?: string;
}

export const CachedDataIndicator: React.FC<CachedDataIndicatorProps> = ({
  dataType,
  isAvailable,
  lastUpdated,
  className = ""
}) => {
  const { isOfflineMode } = useOffline();

  if (!isOfflineMode || !isAvailable) return null;

  return (
    <div className={`flex items-center space-x-2 text-xs text-gray-500 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span>{dataType} (cached)</span>
      {lastUpdated && (
        <span>
          {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

interface OfflineDataMessageProps {
  dataType: string;
  className?: string;
}

export const OfflineDataMessage: React.FC<OfflineDataMessageProps> = ({
  dataType,
  className = ""
}) => {
  const { isOfflineMode } = useOffline();

  if (!isOfflineMode) return null;

  return (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
        <WifiOff className="w-4 h-4" />
        <span className="font-medium">You're offline</span>
      </div>
      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
        This {dataType} data is from cache. Connect to the internet to see the latest information.
      </p>
    </div>
  );
};