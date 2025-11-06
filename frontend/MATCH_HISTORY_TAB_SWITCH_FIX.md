# Match History Tab Switch Fix

## Problem
The match history page was hard refreshing (reloading all data from scratch) every time the user:
- Switched to another browser tab and came back
- Lost and regained focus on the application
- Navigated away and returned to the match history page

This was annoying and created unnecessary API calls and loading screens.

## Root Cause
The issue was in the useEffect hook that loads matches:

```typescript
// ❌ BEFORE - Problematic code
useEffect(() => {
  if (profile?.lolAccount?.puuid) {
    loadCachedMatches();
  } else {
    setLoading(false);
  }
}, [profile]); // Re-runs whenever 'profile' object changes
```

**Why it failed:**
1. The dependency was the entire `profile` object
2. React treats objects as new references even if their content is the same
3. When switching tabs, Next.js/React might re-render components
4. The `profile` object gets a new reference, triggering the useEffect
5. This calls `loadCachedMatches()` again, causing a hard refresh

## Solution
Implemented a **"load-once"** pattern using a ref to track if matches have been loaded:

### 1. Added a tracking ref
```typescript
// Track if matches have been loaded to prevent unnecessary reloads
const matchesLoadedRef = useRef(false);
```

### 2. Updated the useEffect
```typescript
// ✅ AFTER - Fixed code
useEffect(() => {
  // Only load matches once when puuid becomes available, unless explicitly refreshed
  if (profile?.lolAccount?.puuid && !matchesLoadedRef.current && matches.length === 0) {
    matchesLoadedRef.current = true;
    loadCachedMatches();
  } else if (!profile?.lolAccount?.puuid) {
    setLoading(false);
  }
}, [profile?.lolAccount?.puuid]); // Only depend on puuid, not entire profile object
```

**Improvements:**
- ✅ Depends only on `profile?.lolAccount?.puuid` (primitive value, not object)
- ✅ Checks `matchesLoadedRef.current` to see if already loaded
- ✅ Only loads if `matches.length === 0` (no matches in state)
- ✅ Sets the ref to `true` after loading to prevent future loads

### 3. Reset ref when intentionally reloading

Updated all functions that should trigger a fresh load to reset the ref:

#### Refresh Button
```typescript
const refreshMatches = async () => {
  // ... clear state ...
  matchesLoadedRef.current = false; // ✅ Allow reload
  // ... fetch fresh data ...
}
```

#### Search for Different Summoner
```typescript
const fetchSummonerMatches = async (account: LolAccount, count: number = 50) => {
  setMatches([]);
  setPlayerTags([]);
  matchesLoadedRef.current = false; // ✅ Allow new summoner load
  // ... fetch matches ...
}
```

#### Return to My Profile
```typescript
const handleReturnToMyProfile = () => {
  setMatches([]);
  setPlayerTags([]);
  matchesLoadedRef.current = false; // ✅ Allow profile reload
  if (profile?.lolAccount) {
    loadCachedMatches();
  }
}
```

## Behavior After Fix

### ✅ Normal Tab Switching (No Reload)
```
User loads match history → Matches load
User switches to YouTube tab → (state preserved)
User returns to match history → ✅ NO RELOAD (same matches shown)
```

### ✅ Explicit Refresh (Does Reload)
```
User presses Refresh button → matchesLoadedRef.current = false
→ Fetches fresh data from API
→ Updates matches
```

### ✅ Search New Summoner (Does Reload)
```
User searches for "Faker#KR1" → matchesLoadedRef.current = false
→ Fetches Faker's matches
→ Updates display
```

### ✅ Return to Own Profile (Does Reload)
```
User clicks "Back to My Profile" → matchesLoadedRef.current = false
→ Loads user's own matches
→ Updates display
```

## Technical Benefits

1. **Performance:** No unnecessary API calls when switching tabs
2. **User Experience:** Instant return to match history, no loading screens
3. **State Preservation:** Scroll position, expanded matches, filters all preserved
4. **Bandwidth:** Reduces data transfer and server load
5. **Reliability:** Prevents race conditions from multiple simultaneous loads

## Testing Checklist

- [x] Switch to another tab and back → No reload
- [x] Minimize/maximize browser → No reload
- [x] Click refresh button → Does reload
- [x] Search for different summoner → Does reload
- [x] Return to own profile → Does reload
- [x] Load more matches → Works normally
- [x] Expand/collapse matches → State preserved

## Related Files Modified

- `/frontend/app/match-history/page.tsx`
  - Added `matchesLoadedRef` ref
  - Updated `useEffect` dependency and logic
  - Updated `refreshMatches()` to reset ref
  - Updated `fetchSummonerMatches()` to reset ref
  - Updated `handleReturnToMyProfile()` to reset ref

## Notes

- This pattern is similar to how modern apps like Discord, Spotify, and Twitter work
- The ref persists across renders but doesn't trigger re-renders when changed
- The approach follows React best practices for "run once on mount" effects
- No changes needed to backend or API endpoints

---

**Fixed:** 2025-01-17  
**Issue:** Hard refresh on tab switch  
**Solution:** Load-once pattern with ref tracking
