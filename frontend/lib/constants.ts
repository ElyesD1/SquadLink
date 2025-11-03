/**
 * League of Legends Data Dragon version
 * Update this constant when a new patch is released
 * Format: MAJOR.MINOR.PATCH (e.g., "15.1.1")
 */
export const LOL_VERSION = '15.21.1';

/**
 * Base URLs for League of Legends CDN resources
 */
export const CDN_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn';
export const COMMUNITY_DRAGON_URL = 'https://raw.communitydragon.org/latest';

/**
 * Helper functions for CDN URLs
 */
export const getCDNUrl = (path: string) => `${CDN_BASE_URL}/${LOL_VERSION}/${path}`;
export const getPerksUrl = (path: string) => `${CDN_BASE_URL}/img/${path}`;
export const getProfileIconUrl = (iconId: number) => `${COMMUNITY_DRAGON_URL}/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${iconId}.jpg`;
