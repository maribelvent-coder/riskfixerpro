import React, { useState } from 'react';
import { 
  Building2, AlertTriangle, CheckCircle2, Clock, FileText, RefreshCw, ChevronRight,
  MapPin, Calendar, Shield, Target, Bell, Settings, Search, Plus,
  ArrowUpRight, ArrowDownRight, Lock, User, Home, Globe, 
  Plane, Eye, Crosshair, Users, Car, Smartphone, AlertOctagon,
  FileWarning, Scale, Briefcase, Activity, Info, ExternalLink
} from 'lucide-react';

/*
================================================================================
RISKFIXER EXECUTIVE PROTECTION DASHBOARD
Aligned with: RiskFixer-Architecture-Alignment-MVP.md
================================================================================

DATA FLOW (per Architecture Alignment Document):
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Interview Data  │───>│ Mapper (v2)     │───>│ AI Engine       │
│ (48 questions)  │    │ (Data Prep ONLY)│    │ (6-Layer)       │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Dashboard Data  │
                                              │ - AI Scenarios  │
                                              │ - AI Scores     │
                                              │ - AI Narratives │
                                              │ - Evidence      │
                                              └─────────────────┘

DASHBOARD DISPLAYS AI ENGINE OUTPUT:
- Risk scenarios with evidence chains
- T×V×I×E scores with rubric citations
- Control recommendations with rationale
- Narrative justifications (MacQuarrie-grade)
- Audit trail for every score
- Confidence indicators

EP ASSESSMENT SECTIONS (7 sections, ~48 questions):
1. Executive Profile & Threat Perception (8 questions)
2. Residence Security (8 questions)
3. Daily Routines & Pattern Predictability (7 questions)
4. Workplace Security (6 questions)
5. Travel & Transportation Security (6 questions)
6. Digital Footprint & Privacy (7 questions)
7. Emergency Preparedness (6 questions)

EP CONTROL CATEGORIES (48 controls):
1. Personal Protection (10)
2. Residential Security (10)
3. Digital/OSINT Countermeasures (8)
4. Travel Security (8)
5. Family Protection (6)
6. Emergency Preparedness (6)

EP THREAT SCENARIOS (AI-generated):
- Kidnapping/Abduction
- Stalking/Harassment
- Targeted Home Invasion
- Workplace Targeted Violence
- Extortion/Blackmail
- Assassination Threat
- Family Member Targeting
- Vehicular Ambush
- Public Event Attack
- Swatting Attack
- Doxxing/Privacy Violation
- Identity Theft/Fraud
================================================================================
*/

// ===========================================
// TYPES - Matching AI Engine Output Structure
// ===========================================

interface AIGeneratedScenario {
  id: string;
  name: string;
  description: string;  // AI-generated narrative
  
  // T×V×I×E Scores (AI-calculated with evidence)
  scores: {
    threat: { score: number; reasoning: string; evidence: string[] };
    vulnerability: { score: number; reasoning: string; evidence: string[] };
    impact: { score: number; reasoning: string; evidence: string[] };
    exposure: { score: number; reasoning: string; evidence: string[] };
  };
  
  overallScore: number;  // T×V×I×E product (normalized)
  riskLevel: 'critical' | 'high' | 'elevated' | 'moderate' | 'low';
  
  // AI confidence in assessment
  confidence: 'high' | 'medium' | 'low';
  confidenceReasoning: string;
  
  // AI-selected controls
  recommendedControls: {
    controlId: string;
    name: string;
    category: string;
    priority: 'immediate' | 'short_term' | 'medium_term' | 'ongoing';
    rationale: string;  // Why AI selected this control
    estimatedCost: number;
    effectivenessRating: number;
  }[];
  
  // Audit trail
  evidenceChain: {
    source: 'interview' | 'cap_index' | 'osint' | 'site_observation' | 'threat_intel';
    questionId?: string;
    finding: string;
    weight: 'critical' | 'significant' | 'moderate' | 'minor';
  }[];
}

interface PrincipalAssessment {
  id: string;
  principalName: string;
  principalTitle: string;
  assessmentDate: string;
  assessorName: string;
  
  // Overall risk (AI-calculated)
  overallRisk: {
    score: number;
    level: 'critical' | 'high' | 'elevated' | 'moderate' | 'low';
    executiveSummary: string;  // AI-generated narrative
    keyFindings: string[];     // AI-generated bullet points
  };
  
  // T×V×I×E Component Scores (aggregated by AI)
  componentScores: {
    threat: { score: number; narrative: string };
    vulnerability: { score: number; narrative: string };
    impact: { score: number; narrative: string };
    exposure: { score: number; narrative: string };
  };
  
  // Section assessments (AI-analyzed)
  sectionAssessments: {
    sectionId: string;
    sectionName: string;
    riskIndicators: number;
    totalQuestions: number;
    keyFindings: string[];
    aiNarrative: string;
  }[];
  
  // AI-generated scenarios
  scenarios: AIGeneratedScenario[];
  
  // Control implementation status
  controlStatus: {
    category: string;
    implemented: number;
    inProgress: number;
    recommended: number;
    total: number;
  }[];
  
  // AI confidence
  assessmentConfidence: 'high' | 'medium' | 'low';
  confidenceFactors: string[];
}

// ===========================================
// MOCK DATA - Simulating AI Engine Output
// ===========================================

const mockPrincipalAssessment: PrincipalAssessment = {
  id: 'ep-001',
  principalName: 'Robert Chen',
  principalTitle: 'Chief Executive Officer',
  assessmentDate: '2024-12-08',
  assessorName: 'Nicole MacQuarrie, CPP',
  
  overallRisk: {
    score: 77,
    level: 'elevated',
    executiveSummary: `Mr. Chen presents an elevated risk profile driven primarily by his significant public exposure as CEO of a Fortune 500 technology company and highly predictable daily patterns. The assessment identified 12 threat scenarios, with kidnapping/abduction and stalking/harassment presenting the highest risk levels. Current security measures, while present, contain critical gaps in residential perimeter security, pattern randomization, and digital privacy management. The combination of high net worth ($100M+), frequent media coverage, and school-age children creates a threat multiplier that requires immediate attention to personal protection and family security protocols.`,
    keyFindings: [
      'High public profile with frequent media coverage increases targeting likelihood',
      'Highly predictable daily commute pattern (same route, same time) creates ambush vulnerability',
      'Residential security lacks perimeter intrusion detection and monitored alarm',
      'Digital footprint reveals home address, family information, and travel patterns',
      'School-age children attend same school daily without security coordination',
      'No formal emergency response plan or family duress code system'
    ]
  },
  
  componentScores: {
    threat: { 
      score: 4, 
      narrative: 'Threat likelihood is SIGNIFICANT based on high net worth, public profile, and history of concerning communications. Industry sector (technology) and recent controversial business decisions elevate targeting probability.' 
    },
    vulnerability: { 
      score: 3, 
      narrative: 'Vulnerability is MODERATE with several critical gaps identified: lack of professional protection detail, inadequate residential perimeter security, and highly predictable patterns. Some controls exist but are inconsistently applied.' 
    },
    impact: { 
      score: 5, 
      narrative: 'Impact is SEVERE across all dimensions. Personal harm would be life-threatening, family trauma would be significant, financial exposure exceeds $100M, business disruption would affect thousands of employees, and reputational damage would be substantial.' 
    },
    exposure: { 
      score: 4, 
      narrative: 'Exposure is HIGH due to very public profile, extensive digital footprint, predictable patterns, and family members with independent public presence. Attack surface is significantly expanded by social media activity and public records accessibility.' 
    }
  },
  
  sectionAssessments: [
    {
      sectionId: 'executive_profile',
      sectionName: 'Executive Profile & Threat Perception',
      riskIndicators: 5,
      totalQuestions: 8,
      keyFindings: ['Very high public profile', 'Net worth over $100M', 'Past threatening communications', 'School-age children'],
      aiNarrative: 'Profile analysis indicates a high-value target with multiple vulnerability factors. Previous threatening correspondence and controversial industry involvement suggest active threat interest.'
    },
    {
      sectionId: 'residence_security',
      sectionName: 'Residence Security',
      riskIndicators: 4,
      totalQuestions: 8,
      keyFindings: ['No perimeter intrusion detection', 'Basic unmonitored alarm', 'No safe room', 'Police response >10 minutes'],
      aiNarrative: 'Residential security infrastructure is inadequate for threat level. Primary residence lacks layered defense approach and relies on deterrence rather than detection and delay.'
    },
    {
      sectionId: 'daily_routines',
      sectionName: 'Daily Routines & Pattern Predictability',
      riskIndicators: 5,
      totalQuestions: 7,
      keyFindings: ['Highly predictable commute', 'Same route daily', 'Regular gym schedule', 'Children predictable school pattern'],
      aiNarrative: 'Pattern predictability represents the most significant vulnerability. Surveillance detection would be trivial, and ambush planning is facilitated by consistent timing and routing.'
    },
    {
      sectionId: 'workplace_security',
      sectionName: 'Workplace Security',
      riskIndicators: 2,
      totalQuestions: 6,
      keyFindings: ['Good access control', 'Security personnel present', 'Executive floor restricted'],
      aiNarrative: 'Workplace security is adequate with corporate security infrastructure providing reasonable protection during business hours. Gaps exist in parking security and after-hours access.'
    },
    {
      sectionId: 'travel_security',
      sectionName: 'Travel & Transportation Security',
      riskIndicators: 3,
      totalQuestions: 6,
      keyFindings: ['Frequent international travel', 'No secure driver', 'Travel published on social media', 'High-risk destinations'],
      aiNarrative: 'Travel security presents elevated risk with frequent high-risk destination travel and inadequate advance preparation. Commercial travel without security coordination increases vulnerability.'
    },
    {
      sectionId: 'digital_footprint',
      sectionName: 'Digital Footprint & Privacy',
      riskIndicators: 5,
      totalQuestions: 7,
      keyFindings: ['Home address findable', 'Active social media', 'Family exposed online', 'No OSINT monitoring'],
      aiNarrative: 'Digital exposure is extensive and represents a force multiplier for all physical threats. OSINT analysis reveals comprehensive reconnaissance opportunities including real-time location data.'
    },
    {
      sectionId: 'emergency_preparedness',
      sectionName: 'Emergency Preparedness',
      riskIndicators: 3,
      totalQuestions: 6,
      keyFindings: ['No formal emergency plan', 'No duress codes', 'No family training', 'Basic evacuation awareness'],
      aiNarrative: 'Emergency preparedness is inadequate. Family members lack training in emergency response, and no structured protocols exist for various threat scenarios.'
    }
  ],
  
  scenarios: [
    {
      id: 'kidnapping_abduction',
      name: 'Kidnapping/Abduction',
      description: 'Given Mr. Chen\'s net worth exceeding $100 million, high public profile, and predictable daily patterns, kidnapping for ransom represents the highest-priority threat. The consistent commute route and timing create optimal conditions for vehicular interdiction. Family members, particularly school-age children, represent secondary targets with potentially lower resistance.',
      scores: {
        threat: { 
          score: 4, 
          reasoning: 'High-value target profile with demonstrated interest from unknown parties',
          evidence: ['Net worth >$100M (ep_net_worth_range)', 'Previous concerning communications (ep_known_threats)', 'Technology sector with IP value']
        },
        vulnerability: { 
          score: 4, 
          reasoning: 'Highly predictable patterns, no protection detail, accessible commute route',
          evidence: ['Same route/same time commute (ep_commute_pattern)', 'No EP detail (ep_current_security_level)', 'Street parking at frequent locations']
        },
        impact: { 
          score: 5, 
          reasoning: 'Life-threatening situation with severe family/business consequences',
          evidence: ['Personal safety at stake', 'Ransom demand potential $10M+', 'Business operations disruption', 'Media coverage impact']
        },
        exposure: { 
          score: 4, 
          reasoning: 'Very high public profile enables target identification and surveillance',
          evidence: ['Frequent media coverage (ep_public_profile_level)', 'Social media activity (ep_social_media_usage)', 'Public calendar visibility']
        }
      },
      overallScore: 80,
      riskLevel: 'critical',
      confidence: 'high',
      confidenceReasoning: 'Assessment based on comprehensive interview data, CAP Index crime analysis, and OSINT verification. All key risk indicators are well-documented.',
      recommendedControls: [
        {
          controlId: 'ep_detail_24x7',
          name: 'Executive Protection Detail - 24/7',
          category: 'Personal Protection',
          priority: 'immediate',
          rationale: 'Continuous close protection addresses surveillance detection, creates deterrence, and provides immediate response capability for interdiction attempts.',
          estimatedCost: 750000,
          effectivenessRating: 95
        },
        {
          controlId: 'route_randomization',
          name: 'Route Randomization Protocol',
          category: 'Travel Security',
          priority: 'immediate',
          rationale: 'Eliminates pattern predictability that enables surveillance and ambush planning. Zero-cost operational change with significant risk reduction.',
          estimatedCost: 0,
          effectivenessRating: 75
        },
        {
          controlId: 'armored_vehicle',
          name: 'Armored Vehicle (B6 Rated)',
          category: 'Travel Security',
          priority: 'short_term',
          rationale: 'Provides ballistic protection and ram resistance during transit, the highest-vulnerability period for kidnapping attempts.',
          estimatedCost: 250000,
          effectivenessRating: 90
        },
        {
          controlId: 'counter_surveillance',
          name: 'Counter-Surveillance Operations',
          category: 'Personal Protection',
          priority: 'short_term',
          rationale: 'Detects hostile surveillance during the pre-operational planning phase, enabling threat interdiction before attack execution.',
          estimatedCost: 120000,
          effectivenessRating: 75
        }
      ],
      evidenceChain: [
        { source: 'interview', questionId: 'ep_net_worth_range', finding: 'Net worth exceeds $100 million', weight: 'critical' },
        { source: 'interview', questionId: 'ep_commute_pattern', finding: 'Same route and time daily', weight: 'critical' },
        { source: 'interview', questionId: 'ep_known_threats', finding: 'Concerning communications received in past year', weight: 'significant' },
        { source: 'cap_index', finding: 'Residence area violent crime index: 127 (above average)', weight: 'moderate' },
        { source: 'osint', finding: 'Home address discoverable via property records', weight: 'significant' },
        { source: 'interview', questionId: 'ep_current_security_level', finding: 'No professional protection detail', weight: 'critical' }
      ]
    },
    {
      id: 'stalking_harassment',
      name: 'Stalking/Harassment',
      description: 'Mr. Chen\'s very high public profile and active social media presence create substantial exposure to stalking behavior. The technology sector\'s visibility and controversial nature of some business decisions may attract fixated individuals. Current lack of OSINT monitoring means potential stalking behavior may go undetected until escalation.',
      scores: {
        threat: { score: 4, reasoning: 'High-profile CEO with public visibility attracts fixated individuals', evidence: ['Very high public profile', 'Controversial business involvement', 'Extensive media coverage'] },
        vulnerability: { score: 4, reasoning: 'No monitoring program, accessible patterns, digital exposure', evidence: ['No OSINT monitoring', 'Predictable locations', 'Social media location sharing'] },
        impact: { score: 4, reasoning: 'Personal safety risk, family distress, potential escalation to violence', evidence: ['Historical escalation patterns', 'Family exposure', 'Reputational impact'] },
        exposure: { score: 5, reasoning: 'Maximum exposure through media, social media, and public appearances', evidence: ['Frequent media coverage', 'Active public social media', 'Published event attendance'] }
      },
      overallScore: 72,
      riskLevel: 'elevated',
      confidence: 'high',
      confidenceReasoning: 'High confidence based on documented public exposure and lack of monitoring controls.',
      recommendedControls: [
        {
          controlId: 'osint_monitoring',
          name: 'OSINT Monitoring Service',
          category: 'Digital/OSINT',
          priority: 'immediate',
          rationale: 'Continuous monitoring detects concerning online behavior, mentions, and potential threat actors before physical approach.',
          estimatedCost: 50000,
          effectivenessRating: 75
        },
        {
          controlId: 'protective_intel',
          name: 'Protective Intelligence Program',
          category: 'Personal Protection',
          priority: 'short_term',
          rationale: 'Proactive identification and assessment of persons of interest through structured methodology.',
          estimatedCost: 200000,
          effectivenessRating: 80
        }
      ],
      evidenceChain: [
        { source: 'interview', questionId: 'ep_public_profile_level', finding: 'Very high public profile', weight: 'critical' },
        { source: 'interview', questionId: 'ep_social_media_usage', finding: 'Very active public social media', weight: 'significant' },
        { source: 'osint', finding: '127 data points discovered in digital footprint analysis', weight: 'significant' }
      ]
    },
    {
      id: 'doxxing_privacy',
      name: 'Doxxing/Privacy Violation',
      description: 'Digital footprint analysis reveals extensive personally identifiable information accessible through public sources including home address via property records, family member identities, travel patterns through social media, and net worth estimates in business publications. This information enables threat actors across all scenario types.',
      scores: {
        threat: { score: 4, reasoning: 'Digital exposure enables all physical threats', evidence: ['Property records accessible', 'Family information published', 'Business coverage reveals net worth'] },
        vulnerability: { score: 4, reasoning: 'No privacy services, no records suppression, active sharing', evidence: ['No digital privacy service', 'No property record privacy', 'Active location sharing'] },
        impact: { score: 3, reasoning: 'Enables other threats, personal distress, potential harassment', evidence: ['Force multiplier for physical threats', 'Family privacy compromised'] },
        exposure: { score: 5, reasoning: 'Maximum digital exposure across multiple platforms', evidence: ['Home address findable', 'Family members identified', 'Real-time location data'] }
      },
      overallScore: 68,
      riskLevel: 'elevated',
      confidence: 'high',
      confidenceReasoning: 'OSINT analysis conducted with verified findings.',
      recommendedControls: [
        {
          controlId: 'digital_privacy',
          name: 'Digital Privacy Service',
          category: 'Digital/OSINT',
          priority: 'immediate',
          rationale: 'Systematic removal of personal information from data brokers, people search sites, and public records where legally possible.',
          estimatedCost: 40000,
          effectivenessRating: 80
        },
        {
          controlId: 'social_media_lockdown',
          name: 'Social Media Privacy Lockdown',
          category: 'Digital/OSINT',
          priority: 'immediate',
          rationale: 'Review and restrict social media privacy settings, remove location data, and implement posting protocols.',
          estimatedCost: 25000,
          effectivenessRating: 70
        }
      ],
      evidenceChain: [
        { source: 'osint', finding: 'Home address found in property records', weight: 'critical' },
        { source: 'osint', finding: 'Family members identified through social media', weight: 'significant' },
        { source: 'osint', finding: 'Travel patterns visible in Instagram posts', weight: 'significant' },
        { source: 'interview', questionId: 'ep_online_presence_management', finding: 'No active digital privacy management', weight: 'significant' }
      ]
    },
    {
      id: 'home_invasion',
      name: 'Targeted Home Invasion',
      description: 'Residential security assessment reveals inadequate layered defense against targeted intrusion. The combination of discoverable home address, high-value target profile, and insufficient perimeter security creates opportunity for home invasion scenarios. Current alarm system is unmonitored and provides detection without response.',
      scores: {
        threat: { score: 3, reasoning: 'High-value target in known location', evidence: ['Net worth attracts targeting', 'Address discoverable', 'Valuable assets assumed'] },
        vulnerability: { score: 4, reasoning: 'Security infrastructure gaps across perimeter, detection, and response', evidence: ['No perimeter detection', 'Unmonitored alarm', 'No safe room', '>10min police response'] },
        impact: { score: 4, reasoning: 'Life-threatening situation in family environment', evidence: ['Family members at risk', 'Safe haven compromised', 'Psychological trauma'] },
        exposure: { score: 3, reasoning: 'Address accessible but residence has some privacy features', evidence: ['Gated community provides some barrier', 'Not street-visible'] }
      },
      overallScore: 52,
      riskLevel: 'elevated',
      confidence: 'medium',
      confidenceReasoning: 'Assessment based on interview data without physical site survey verification.',
      recommendedControls: [
        {
          controlId: 'panic_room',
          name: 'Panic Room / Safe Room',
          category: 'Residential Security',
          priority: 'short_term',
          rationale: 'Provides hardened refuge point with communications capability during home invasion, enabling shelter-in-place until response arrives.',
          estimatedCost: 80000,
          effectivenessRating: 85
        },
        {
          controlId: 'perimeter_detection',
          name: 'Perimeter Intrusion Detection',
          category: 'Residential Security',
          priority: 'immediate',
          rationale: 'Early warning detection at property boundary provides critical response time before threat reaches structure.',
          estimatedCost: 65000,
          effectivenessRating: 80
        },
        {
          controlId: 'alarm_monitored',
          name: 'Professional Monitored Alarm',
          category: 'Residential Security',
          priority: 'immediate',
          rationale: 'Replaces unmonitored system with UL-listed central station monitoring and verified response protocols.',
          estimatedCost: 20000,
          effectivenessRating: 70
        }
      ],
      evidenceChain: [
        { source: 'interview', questionId: 'ep_residence_alarm_system', finding: 'Basic unmonitored alarm system', weight: 'critical' },
        { source: 'interview', questionId: 'ep_residence_perimeter_security', finding: 'No perimeter intrusion detection', weight: 'critical' },
        { source: 'interview', questionId: 'ep_safe_room', finding: 'No panic room or safe room', weight: 'significant' },
        { source: 'interview', questionId: 'ep_police_response_time', finding: 'Police response over 10 minutes', weight: 'moderate' }
      ]
    },
    {
      id: 'family_targeting',
      name: 'Family Member Targeting',
      description: 'School-age children present significant secondary target vulnerability. Daily school schedule is highly predictable, no security coordination exists with school administration, and children have not received age-appropriate security awareness training. Spouse\'s public social media presence reveals family patterns.',
      scores: {
        threat: { score: 3, reasoning: 'Family members as leverage targets', evidence: ['School-age children', 'Spouse public presence', 'Family patterns visible'] },
        vulnerability: { score: 4, reasoning: 'Predictable patterns, no coordination, no training', evidence: ['Daily school schedule predictable', 'No school security coordination', 'No family security training'] },
        impact: { score: 5, reasoning: 'Maximum impact scenario affecting most vulnerable family members', evidence: ['Children at risk', 'Severe trauma potential', 'Leverage for extortion'] },
        exposure: { score: 3, reasoning: 'Family partially exposed through social media and school visibility', evidence: ['Spouse social media active', 'School location known', 'Activity schedules visible'] }
      },
      overallScore: 60,
      riskLevel: 'elevated',
      confidence: 'medium',
      confidenceReasoning: 'Family exposure assessed through interview; children not directly interviewed.',
      recommendedControls: [
        {
          controlId: 'family_security_training',
          name: 'Family Security Awareness Training',
          category: 'Family Protection',
          priority: 'immediate',
          rationale: 'Age-appropriate training for all family members on situational awareness, social engineering resistance, and emergency protocols.',
          estimatedCost: 15000,
          effectivenessRating: 65
        },
        {
          controlId: 'school_coordination',
          name: 'School Security Coordination',
          category: 'Family Protection',
          priority: 'immediate',
          rationale: 'Establish protocols with school administration for pickup authorization, emergency contacts, and communication procedures.',
          estimatedCost: 5000,
          effectivenessRating: 70
        },
        {
          controlId: 'family_duress_codes',
          name: 'Family Duress Code System',
          category: 'Family Protection',
          priority: 'immediate',
          rationale: 'Simple verbal codes that indicate distress without alerting adversary, enabling covert emergency notification.',
          estimatedCost: 1000,
          effectivenessRating: 55
        }
      ],
      evidenceChain: [
        { source: 'interview', questionId: 'ep_family_members', finding: 'School-age children in household', weight: 'critical' },
        { source: 'interview', questionId: 'ep_children_schedule', finding: 'Highly predictable school schedule', weight: 'significant' },
        { source: 'interview', questionId: 'ep_family_emergency_training', finding: 'No family security training conducted', weight: 'significant' },
        { source: 'osint', finding: 'Family activities visible on spouse social media', weight: 'moderate' }
      ]
    }
  ],
  
  controlStatus: [
    { category: 'Personal Protection', implemented: 1, inProgress: 1, recommended: 6, total: 10 },
    { category: 'Residential Security', implemented: 3, inProgress: 1, recommended: 6, total: 10 },
    { category: 'Digital/OSINT', implemented: 1, inProgress: 1, recommended: 6, total: 8 },
    { category: 'Travel Security', implemented: 1, inProgress: 0, recommended: 5, total: 8 },
    { category: 'Family Protection', implemented: 1, inProgress: 0, recommended: 4, total: 6 },
    { category: 'Emergency Preparedness', implemented: 2, inProgress: 1, recommended: 3, total: 6 }
  ],
  
  assessmentConfidence: 'high',
  confidenceFactors: [
    'Comprehensive 48-question interview completed with principal',
    'CAP Index crime data integrated for residence and workplace',
    'OSINT analysis conducted revealing digital footprint',
    'No physical site survey conducted (medium confidence on residence details)',
    'Family members not directly interviewed'
  ]
};

// ===========================================
// UTILITY COMPONENTS
// ===========================================

const StatusBadge = ({ level, size = 'normal' }: { level: string; size?: 'normal' | 'large' }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critical' },
    high: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'High' },
    elevated: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Elevated' },
    moderate: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Moderate' },
    low: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Low' },
  };
  const c = config[level] || config.moderate;
  const sizeClass = size === 'large' ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs';
  return <span className={`${sizeClass} rounded font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
};

const ConfidenceBadge = ({ confidence }: { confidence: 'high' | 'medium' | 'low' }) => {
  const config = {
    high: { bg: 'bg-green-500/20', text: 'text-green-400', icon: '●' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '◐' },
    low: { bg: 'bg-red-500/20', text: 'text-red-400', icon: '○' },
  };
  const c = config[confidence];
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text} flex items-center gap-1`}>
      <span>{c.icon}</span> {confidence} confidence
    </span>
  );
};

const ScoreGauge = ({ label, score, maxScore = 5, color }: { label: string; score: number; maxScore?: number; color: string }) => {
  const percentage = (score / maxScore) * 100;
  return (
    <div className="text-center">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="relative w-16 h-16 mx-auto">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-700" />
          <circle 
            cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" 
            className={color}
            strokeDasharray={`${percentage * 1.76} 176`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{score}</span>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: string }) => {
  const percentage = (value / max) * 100;
  const colors: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500'
  };
  return (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div className={`h-2 rounded-full ${colors[color]}`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

// ===========================================
// MAIN DASHBOARD COMPONENT
// ===========================================

export default function EPDashboard() {
  const [selectedScenario, setSelectedScenario] = useState<AIGeneratedScenario | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'scenarios' | 'controls' | 'evidence'>('overview');
  const [showEvidencePanel, setShowEvidencePanel] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  
  const handleGenerateReport = (reportType: string) => {
    setGeneratingReport(reportType);
    setShowReportMenu(false);
    // Simulate report generation
    setTimeout(() => setGeneratingReport(null), 2000);
  };
  
  const assessment = mockPrincipalAssessment;
  
  // Calculate totals
  const totalControls = assessment.controlStatus.reduce((sum, c) => sum + c.total, 0);
  const implementedControls = assessment.controlStatus.reduce((sum, c) => sum + c.implemented, 0);
  const inProgressControls = assessment.controlStatus.reduce((sum, c) => sum + c.inProgress, 0);
  const completionPercentage = Math.round((implementedControls / totalControls) * 100);
  
  // Get all recommended controls across scenarios
  const allRecommendations = assessment.scenarios
    .flatMap(s => s.recommendedControls)
    .reduce((acc, control) => {
      if (!acc.find(c => c.controlId === control.controlId)) {
        acc.push(control);
      }
      return acc;
    }, [] as typeof assessment.scenarios[0]['recommendedControls']);
  
  const immediateControls = allRecommendations.filter(c => c.priority === 'immediate');
  const totalInvestment = allRecommendations.reduce((sum, c) => sum + c.estimatedCost, 0);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-blue-400">RiskFixer</div>
            <div className="flex items-center bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm">
              <Lock className="w-4 h-4 mr-2" />
              Executive Protection — Confidential
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" /> Reassess
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowReportMenu(!showReportMenu)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" /> 
                {generatingReport ? 'Generating...' : 'Generate Report'}
                <ChevronRight className={`w-4 h-4 transition-transform ${showReportMenu ? 'rotate-90' : ''}`} />
              </button>
              
              {showReportMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-gray-700">
                    <span className="text-xs text-gray-400 px-2">Select Report Type</span>
                  </div>
                  
                  <button
                    onClick={() => handleGenerateReport('summary')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-start gap-3 border-b border-gray-700"
                  >
                    <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Executive Summary</div>
                      <div className="text-gray-400 text-xs">3-4 pages • Strategic overview for C-Suite</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleGenerateReport('full')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-start gap-3 border-b border-gray-700"
                  >
                    <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Full Assessment Report</div>
                      <div className="text-gray-400 text-xs">15-20 pages • Complete T×V×I×E analysis</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleGenerateReport('technical')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Scale className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Technical Gap Analysis</div>
                      <div className="text-gray-400 text-xs">Specs, costs, timelines • For implementation</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        {/* Principal Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-orange-500/20`}>
              <User className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{assessment.principalName}</h1>
              <div className="text-gray-400">{assessment.principalTitle}</div>
              <div className="text-sm text-gray-500 mt-1">
                Assessed: {assessment.assessmentDate} by {assessment.assessorName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ConfidenceBadge confidence={assessment.assessmentConfidence} />
          </div>
        </div>
        
        {/* Overall Risk Card */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-850 rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Risk Score */}
            <div className="col-span-3 border-r border-gray-700 pr-6">
              <div className="text-gray-400 text-sm mb-2">Overall Risk Score</div>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold text-white">{assessment.overallRisk.score}</span>
                <span className="text-xl text-gray-500 mb-2">/100</span>
              </div>
              <div className="mt-3">
                <StatusBadge level={assessment.overallRisk.level} size="large" />
              </div>
              <div className="mt-4 text-xs text-gray-500">
                T×V×I×E = {assessment.componentScores.threat.score}×{assessment.componentScores.vulnerability.score}×{assessment.componentScores.impact.score}×{assessment.componentScores.exposure.score}
              </div>
            </div>
            
            {/* T×V×I×E Gauges */}
            <div className="col-span-4 flex items-center justify-around">
              <ScoreGauge label="Threat" score={assessment.componentScores.threat.score} color="text-red-500" />
              <ScoreGauge label="Vulnerability" score={assessment.componentScores.vulnerability.score} color="text-purple-500" />
              <ScoreGauge label="Impact" score={assessment.componentScores.impact.score} color="text-pink-500" />
              <ScoreGauge label="Exposure" score={assessment.componentScores.exposure.score} color="text-orange-500" />
            </div>
            
            {/* Key Stats */}
            <div className="col-span-5 grid grid-cols-3 gap-4">
              <div className="bg-gray-750 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Scenarios Analyzed</div>
                <div className="text-2xl font-bold text-white">{assessment.scenarios.length}</div>
                <div className="text-xs text-red-400">{assessment.scenarios.filter(s => s.riskLevel === 'critical').length} critical</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Controls Status</div>
                <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
                <ProgressBar value={completionPercentage} color="blue" />
              </div>
              <div className="bg-gray-750 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Immediate Actions</div>
                <div className="text-2xl font-bold text-orange-400">{immediateControls.length}</div>
                <div className="text-xs text-gray-500">${(totalInvestment/1000000).toFixed(1)}M total</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Executive Summary (AI-Generated) */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">AI Assessment Summary</h3>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Generated by 6-Layer AI Engine</span>
          </div>
          <p className="text-gray-300 leading-relaxed text-sm">{assessment.overallRisk.executiveSummary}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-2">Key Findings</div>
              <ul className="space-y-1">
                {assessment.overallRisk.keyFindings.slice(0, 3).map((finding, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-orange-400 mt-1 flex-shrink-0" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-2">Assessment Confidence Factors</div>
              <ul className="space-y-1">
                {assessment.confidenceFactors.slice(0, 3).map((factor, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <Info className="w-3 h-3 text-gray-500 mt-1 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex gap-6">
            {(['overview', 'scenarios', 'controls', 'evidence'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab === 'evidence' ? 'Evidence Trail' : tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Section Assessments */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Section Assessments</h3>
              <div className="space-y-3">
                {assessment.sectionAssessments.map(section => (
                  <div key={section.sectionId} className="bg-gray-750 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{section.sectionName}</span>
                      <span className={`text-sm ${section.riskIndicators > 3 ? 'text-red-400' : section.riskIndicators > 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {section.riskIndicators}/{section.totalQuestions} risk indicators
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{section.aiNarrative}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Control Categories */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Control Implementation by Category</h3>
              <div className="space-y-4">
                {assessment.controlStatus.map(category => {
                  const total = category.implemented + category.inProgress + category.recommended;
                  const progress = Math.round((category.implemented / category.total) * 100);
                  return (
                    <div key={category.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{category.category}</span>
                        <span className="text-xs text-gray-500">{category.implemented}/{category.total}</span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div className="bg-green-500 rounded" style={{ width: `${(category.implemented/category.total)*100}%` }} />
                        <div className="bg-blue-500 rounded" style={{ width: `${(category.inProgress/category.total)*100}%` }} />
                        <div className="bg-gray-600 rounded" style={{ width: `${(category.recommended/category.total)*100}%` }} />
                      </div>
                      <div className="flex gap-4 mt-1 text-xs">
                        <span className="text-green-400">{category.implemented} done</span>
                        <span className="text-blue-400">{category.inProgress} in progress</span>
                        <span className="text-gray-400">{category.recommended} recommended</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'scenarios' && (
          <div className="space-y-4">
            {assessment.scenarios.map(scenario => (
              <div 
                key={scenario.id}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-750"
                  onClick={() => setSelectedScenario(selectedScenario?.id === scenario.id ? null : scenario)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        scenario.riskLevel === 'critical' ? 'bg-red-500' :
                        scenario.riskLevel === 'elevated' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium text-white">{scenario.name}</div>
                        <div className="text-sm text-gray-400">
                          T:{scenario.scores.threat.score} × V:{scenario.scores.vulnerability.score} × I:{scenario.scores.impact.score} × E:{scenario.scores.exposure.score}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{scenario.overallScore}</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                      <StatusBadge level={scenario.riskLevel} />
                      <ConfidenceBadge confidence={scenario.confidence} />
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedScenario?.id === scenario.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
                
                {/* Expanded Scenario Detail */}
                {selectedScenario?.id === scenario.id && (
                  <div className="border-t border-gray-700 p-4 bg-gray-850">
                    {/* AI Narrative */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> AI Assessment Narrative
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{scenario.description}</p>
                    </div>
                    
                    {/* Score Breakdown with Evidence */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {(['threat', 'vulnerability', 'impact', 'exposure'] as const).map(dim => {
                        const data = scenario.scores[dim];
                        return (
                          <div key={dim} className="bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400 capitalize">{dim}</span>
                              <span className={`text-lg font-bold ${data.score >= 4 ? 'text-red-400' : data.score >= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {data.score}/5
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{data.reasoning}</p>
                            <div className="text-xs">
                              {data.evidence.slice(0, 2).map((e, i) => (
                                <div key={i} className="text-gray-400 flex items-start gap-1 mb-1">
                                  <span className="text-blue-400">•</span> {e}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Recommended Controls */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">AI-Recommended Controls</div>
                      <div className="grid grid-cols-2 gap-3">
                        {scenario.recommendedControls.map(control => (
                          <div key={control.controlId} className="bg-gray-800 rounded-lg p-3 flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 ${
                              control.priority === 'immediate' ? 'bg-red-500' :
                              control.priority === 'short_term' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} />
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">{control.name}</div>
                              <div className="text-xs text-gray-500">{control.category} • ${(control.estimatedCost/1000).toFixed(0)}K</div>
                              <div className="text-xs text-gray-400 mt-1">{control.rationale}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Evidence Chain */}
                    <div>
                      <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <Scale className="w-3 h-3" /> Evidence Chain (Audit Trail)
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="space-y-2">
                          {scenario.evidenceChain.map((evidence, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                evidence.source === 'interview' ? 'bg-blue-500/20 text-blue-400' :
                                evidence.source === 'cap_index' ? 'bg-purple-500/20 text-purple-400' :
                                evidence.source === 'osint' ? 'bg-green-500/20 text-green-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {evidence.source.replace('_', ' ')}
                              </span>
                              <span className="text-gray-300 flex-1">{evidence.finding}</span>
                              <span className={`text-xs ${
                                evidence.weight === 'critical' ? 'text-red-400' :
                                evidence.weight === 'significant' ? 'text-orange-400' :
                                'text-gray-500'
                              }`}>
                                {evidence.weight}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'controls' && (
          <div className="space-y-6">
            {/* Priority Groups */}
            {(['immediate', 'short_term', 'medium_term'] as const).map(priority => {
              const controls = allRecommendations.filter(c => c.priority === priority);
              if (controls.length === 0) return null;
              
              const priorityConfig = {
                immediate: { label: 'Immediate (0-30 days)', color: 'text-red-400', bg: 'bg-red-500/20' },
                short_term: { label: 'Short-Term (30-90 days)', color: 'text-orange-400', bg: 'bg-orange-500/20' },
                medium_term: { label: 'Medium-Term (90-180 days)', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
              };
              const config = priorityConfig[priority];
              const totalCost = controls.reduce((sum, c) => sum + c.estimatedCost, 0);
              
              return (
                <div key={priority} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded ${config.bg} ${config.color} text-sm font-medium`}>
                        {config.label}
                      </span>
                      <span className="text-gray-400 text-sm">{controls.length} controls</span>
                    </div>
                    <span className="text-gray-400 text-sm">Est. Investment: <span className="text-white font-medium">${(totalCost/1000).toFixed(0)}K</span></span>
                  </div>
                  <div className="divide-y divide-gray-700">
                    {controls.map(control => (
                      <div key={control.controlId} className="p-4 hover:bg-gray-750">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-white">{control.name}</div>
                            <div className="text-sm text-gray-500">{control.category}</div>
                            <div className="text-sm text-gray-400 mt-2">{control.rationale}</div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-white font-medium">${(control.estimatedCost/1000).toFixed(0)}K</div>
                            <div className="text-xs text-gray-500">{control.effectivenessRating}% effective</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'evidence' && (
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Complete Evidence Trail</h3>
            <p className="text-sm text-gray-400 mb-4">
              All findings supporting this assessment, organized by source. This audit trail ensures every score is defensible and traceable.
            </p>
            
            {/* Evidence by Source */}
            {(['interview', 'cap_index', 'osint', 'site_observation'] as const).map(source => {
              const evidenceItems = assessment.scenarios
                .flatMap(s => s.evidenceChain)
                .filter(e => e.source === source);
              
              if (evidenceItems.length === 0) return null;
              
              const sourceConfig = {
                interview: { label: 'Interview Responses', icon: Users, color: 'text-blue-400' },
                cap_index: { label: 'CAP Index Crime Data', icon: MapPin, color: 'text-purple-400' },
                osint: { label: 'OSINT Analysis', icon: Globe, color: 'text-green-400' },
                site_observation: { label: 'Site Observations', icon: Eye, color: 'text-orange-400' }
              };
              const config = sourceConfig[source];
              const Icon = config.icon;
              
              return (
                <div key={source} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className={`font-medium ${config.color}`}>{config.label}</span>
                    <span className="text-gray-500 text-sm">({evidenceItems.length} items)</span>
                  </div>
                  <div className="space-y-2 pl-6">
                    {evidenceItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm bg-gray-750 rounded-lg p-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          item.weight === 'critical' ? 'bg-red-500/20 text-red-400' :
                          item.weight === 'significant' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item.weight}
                        </span>
                        <span className="text-gray-300">{item.finding}</span>
                        {item.questionId && (
                          <span className="text-gray-500 text-xs">({item.questionId})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
