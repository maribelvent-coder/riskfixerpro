import { useEffect, useRef, useCallback } from 'react';

interface UseProfileAutosaveOptions<T> {
  assessmentId: string | undefined;
  profileType: 'office' | 'retail' | 'warehouse' | 'manufacturing' | 'datacenter';
  data: T;
  enabled?: boolean;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useProfileAutosave<T extends Record<string, unknown>>({
  assessmentId,
  profileType,
  data,
  enabled = true,
  debounceMs = 1500,
  onSaveSuccess,
  onSaveError,
}: UseProfileAutosaveOptions<T>) {
  const pendingDataRef = useRef<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const lastSavedRef = useRef<string>('');
  const hasUserEditedRef = useRef(false);
  const previousDataRef = useRef<string>('');

  const saveProfile = useCallback(async (profileData: T, useKeepalive = false) => {
    if (!assessmentId) return;
    
    const dataStr = JSON.stringify(profileData);
    if (dataStr === lastSavedRef.current) {
      console.log(`[${profileType}Profile] Skip save - no changes from last saved`);
      return;
    }

    console.log(`[${profileType}Profile] AUTOSAVE:`, profileData);

    try {
      const url = `/api/assessments/${assessmentId}/${profileType}-profile`;
      
      if (useKeepalive) {
        fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
          credentials: 'include',
          keepalive: true,
        });
        console.log(`[${profileType}Profile] UNMOUNT SAVE sent with keepalive`);
        return;
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      lastSavedRef.current = dataStr;
      console.log(`[${profileType}Profile] AUTOSAVE SUCCESS`);
      pendingDataRef.current = null;
      onSaveSuccess?.();
    } catch (error) {
      console.error(`[${profileType}Profile] AUTOSAVE ERROR:`, error);
      onSaveError?.(error as Error);
    }
  }, [assessmentId, profileType, onSaveSuccess, onSaveError]);

  // Track data changes and trigger debounced save
  useEffect(() => {
    if (!enabled || !assessmentId) return;

    const dataStr = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (dataStr === previousDataRef.current) return;
    
    const prevDataStr = previousDataRef.current;
    previousDataRef.current = dataStr;
    
    // If this is the first data (from server load), just record it - don't save
    if (prevDataStr === '') {
      lastSavedRef.current = dataStr;
      console.log(`[${profileType}Profile] Initialized with server data`);
      return;
    }
    
    // User has made an edit - data differs from what we had before
    hasUserEditedRef.current = true;
    
    // Skip if no changes from last saved
    if (dataStr === lastSavedRef.current) return;

    pendingDataRef.current = data;
    console.log(`[${profileType}Profile] CHANGE detected, scheduling autosave`);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (pendingDataRef.current && isMountedRef.current) {
        saveProfile(pendingDataRef.current);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, enabled, debounceMs, saveProfile, assessmentId, profileType]);

  // Save on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (pendingDataRef.current) {
        saveProfile(pendingDataRef.current, true);
      }
    };
  }, [saveProfile]);

  // Reset when assessmentId changes
  useEffect(() => {
    hasUserEditedRef.current = false;
    previousDataRef.current = '';
    lastSavedRef.current = '';
    pendingDataRef.current = null;
  }, [assessmentId]);

  return {
    hasPendingChanges: pendingDataRef.current !== null,
    forceSave: () => {
      if (pendingDataRef.current) {
        saveProfile(pendingDataRef.current);
      }
    },
  };
}
