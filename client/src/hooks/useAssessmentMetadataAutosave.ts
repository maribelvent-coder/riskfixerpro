import { useEffect, useRef, useCallback } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface AssessmentMetadata {
  title: string;
  location: string;
  assessor: string;
}

interface UseAssessmentMetadataAutosaveOptions {
  assessmentId: string | undefined;
  data: AssessmentMetadata;
  enabled?: boolean;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAssessmentMetadataAutosave({
  assessmentId,
  data,
  enabled = true,
  debounceMs = 1500,
  onSaveSuccess,
  onSaveError,
}: UseAssessmentMetadataAutosaveOptions) {
  const pendingDataRef = useRef<AssessmentMetadata | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const lastSavedRef = useRef<string>('');
  const previousDataRef = useRef<string>('');

  const saveMetadata = useCallback(async (metadata: AssessmentMetadata, useKeepalive = false) => {
    if (!assessmentId) return;
    
    const dataStr = JSON.stringify(metadata);
    if (dataStr === lastSavedRef.current) {
      console.log(`[AssessmentMetadata] Skip save - no changes from last saved`);
      return;
    }

    console.log(`[AssessmentMetadata] AUTOSAVE:`, metadata);

    try {
      const url = `/api/assessments/${assessmentId}`;
      
      if (useKeepalive) {
        fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metadata),
          credentials: 'include',
          keepalive: true,
        });
        console.log(`[AssessmentMetadata] UNMOUNT SAVE sent with keepalive`);
        return;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      lastSavedRef.current = dataStr;
      console.log(`[AssessmentMetadata] AUTOSAVE SUCCESS`);
      pendingDataRef.current = null;
      onSaveSuccess?.();
    } catch (error) {
      console.error(`[AssessmentMetadata] AUTOSAVE ERROR:`, error);
      onSaveError?.(error as Error);
    }
  }, [assessmentId, onSaveSuccess, onSaveError]);

  useEffect(() => {
    if (!enabled || !assessmentId) return;

    const dataStr = JSON.stringify(data);
    
    if (dataStr === previousDataRef.current) return;
    
    const prevDataStr = previousDataRef.current;
    previousDataRef.current = dataStr;
    
    if (prevDataStr === '') {
      lastSavedRef.current = dataStr;
      console.log(`[AssessmentMetadata] Initialized with server data`);
      return;
    }
    
    if (dataStr === lastSavedRef.current) return;

    pendingDataRef.current = data;
    console.log(`[AssessmentMetadata] CHANGE detected, scheduling autosave`);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (pendingDataRef.current && isMountedRef.current) {
        saveMetadata(pendingDataRef.current);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, enabled, debounceMs, saveMetadata, assessmentId]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (pendingDataRef.current) {
        saveMetadata(pendingDataRef.current, true);
      }
    };
  }, [saveMetadata]);

  useEffect(() => {
    previousDataRef.current = '';
    lastSavedRef.current = '';
    pendingDataRef.current = null;
  }, [assessmentId]);

  return {
    hasPendingChanges: pendingDataRef.current !== null,
    forceSave: () => {
      if (pendingDataRef.current) {
        saveMetadata(pendingDataRef.current);
      }
    },
  };
}
