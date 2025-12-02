import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * Universal Auto-Generation Hook
 * 
 * Automatically triggers risk scenario generation when:
 * 1. Profile has been saved (profileSaved = true)
 * 2. No scenarios exist yet (scenariosExist = false)
 * 3. Scenarios haven't been checked yet (to prevent loops)
 * 
 * @param assessmentId - The assessment ID
 * @param profileSaved - Whether the profile has been saved (triggers check)
 * @param scenarioGenerationEnabled - Whether auto-generation is enabled (default: true)
 * @returns Object with scenariosExist flag and generation status
 */
export function useAutoGenerateRisks(
  assessmentId: string | undefined,
  profileSaved: boolean,
  scenarioGenerationEnabled: boolean = true
) {
  const hasCheckedScenarios = useRef(false);

  // Check if scenarios already exist
  const { data: scenarios, isLoading } = useQuery({
    queryKey: [`/api/assessments/${assessmentId}/risk-scenarios`],
    enabled: !!assessmentId && profileSaved && !hasCheckedScenarios.current && scenarioGenerationEnabled
  });

  const scenariosExist = scenarios && Array.isArray(scenarios) && scenarios.length > 0;

  useEffect(() => {
    // Skip if already checked, not enabled, or assessment ID missing
    if (hasCheckedScenarios.current || !scenarioGenerationEnabled || !assessmentId) {
      return;
    }

    // Skip if profile not saved yet (wait for user to save profile first)
    if (!profileSaved) {
      return;
    }

    // Skip if still loading scenarios
    if (isLoading) {
      return;
    }

    // Mark as checked to prevent infinite loops
    hasCheckedScenarios.current = true;

    // NOTE: Scenario generation now happens automatically on the backend
    // when the profile is saved (hybrid model). No explicit frontend trigger needed.
    // This hook simply tracks whether scenarios exist for UI purposes.
    
  }, [assessmentId, profileSaved, isLoading, scenarioGenerationEnabled]);

  return {
    scenariosExist: scenariosExist || false,
    isCheckingScenarios: isLoading,
  };
}
