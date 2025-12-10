import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  User, 
  Home, 
  Clock, 
  Briefcase, 
  Plane, 
  Globe, 
  Users, 
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  LayoutGrid,
  List
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AssessmentQuestion, AssessmentWithQuestions } from "@shared/schema";
import ExecutiveSurveyQuestions, { EP_PART1_CATEGORIES } from "./ExecutiveSurveyQuestions";
import ExecutiveInterviewWizard from "./ExecutiveInterviewWizard";

interface ExecutiveInterviewTabsProps {
  assessmentId: string;
  onComplete?: () => void;
}

interface SectionConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: typeof MessageSquare;
  category: string;
  description: string;
}

const SECTION_CONFIGS: SectionConfig[] = [
  {
    id: "threat-perception",
    label: "Threat Perception",
    shortLabel: "Threats",
    icon: AlertTriangle,
    category: "Executive Profile & Threat Perception",
    description: "Understanding baseline threat perception and identifying documented threat history"
  },
  {
    id: "residence",
    label: "Residence Security",
    shortLabel: "Residence",
    icon: Home,
    category: "Residence Security",
    description: "Home security inventory and residential vulnerability assessment"
  },
  {
    id: "routines",
    label: "Daily Routines",
    shortLabel: "Routines",
    icon: Clock,
    category: "Daily Routines & Pattern Predictability",
    description: "Pattern analysis for vulnerability and routine predictability assessment"
  },
  {
    id: "workplace",
    label: "Workplace Security",
    shortLabel: "Workplace",
    icon: Briefcase,
    category: "Workplace Security",
    description: "Office and workplace security posture evaluation"
  },
  {
    id: "travel",
    label: "Travel & Transportation",
    shortLabel: "Travel",
    icon: Plane,
    category: "Travel & Transportation",
    description: "Travel frequency, transportation methods, and travel OPSEC assessment"
  },
  {
    id: "digital",
    label: "Digital Footprint",
    shortLabel: "Digital",
    icon: Globe,
    category: "Digital Footprint & Privacy",
    description: "Digital hygiene practices and online presence management"
  },
  {
    id: "family",
    label: "Family Security",
    shortLabel: "Family",
    icon: Users,
    category: "Family Security",
    description: "Family vulnerability assessment and family member visibility evaluation"
  },
  {
    id: "emergency",
    label: "Emergency Preparedness",
    shortLabel: "Emergency",
    icon: AlertTriangle,
    category: "Emergency Preparedness",
    description: "Emergency protocols, duress codes, and security training assessment"
  }
];

export default function ExecutiveInterviewTabs({ assessmentId, onComplete }: ExecutiveInterviewTabsProps) {
  // Wizard view is now the only view - classic view has been sunsetted
  return (
    <ExecutiveInterviewWizard
      assessmentId={assessmentId}
      onComplete={onComplete}
    />
  );
}
