import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AssessmentQuestion, AssessmentWithQuestions } from "@shared/schema";
import ExecutiveSurveyQuestions, { EP_PART1_CATEGORIES } from "./ExecutiveSurveyQuestions";

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
  const [activeSection, setActiveSection] = useState(SECTION_CONFIGS[0].id);

  const { data: assessment } = useQuery<AssessmentWithQuestions>({
    queryKey: ['/api/assessments', assessmentId],
  });

  const { data: allQuestions } = useQuery<AssessmentQuestion[]>({
    queryKey: ['/api/assessments', assessmentId, 'assessment-questions'],
    enabled: !!assessment,
  });

  const filteredQuestions = useMemo(() => {
    if (!allQuestions) return [];
    return allQuestions.filter(q => 
      EP_PART1_CATEGORIES.includes(q.category || '')
    );
  }, [allQuestions]);

  const sectionProgress = useMemo(() => {
    const progress: Record<string, { total: number; answered: number; percent: number }> = {};
    
    SECTION_CONFIGS.forEach(section => {
      const sectionQuestions = filteredQuestions.filter(q => q.category === section.category);
      const answered = sectionQuestions.filter(q => q.response || q.notes).length;
      const total = sectionQuestions.length;
      progress[section.id] = {
        total,
        answered,
        percent: total > 0 ? Math.round((answered / total) * 100) : 0
      };
    });
    
    return progress;
  }, [filteredQuestions]);

  const totalProgress = useMemo(() => {
    const total = filteredQuestions.length;
    const answered = filteredQuestions.filter(q => q.response || q.notes).length;
    return {
      total,
      answered,
      percent: total > 0 ? Math.round((answered / total) * 100) : 0
    };
  }, [filteredQuestions]);

  const currentSectionIndex = SECTION_CONFIGS.findIndex(s => s.id === activeSection);
  const currentSection = SECTION_CONFIGS[currentSectionIndex];
  const nextSection = SECTION_CONFIGS[currentSectionIndex + 1];
  const isLastSection = currentSectionIndex === SECTION_CONFIGS.length - 1;

  const handleNextSection = () => {
    if (nextSection) {
      setActiveSection(nextSection.id);
    } else if (onComplete) {
      onComplete();
    }
  };

  const getSectionStatus = (sectionId: string) => {
    const progress = sectionProgress[sectionId];
    if (!progress) return 'pending';
    if (progress.percent === 100) return 'complete';
    if (progress.answered > 0) return 'in-progress';
    return 'pending';
  };

  return (
    <div className="space-y-4">
      <Card data-testid="card-executive-interview-overview">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Part 1: Executive Interview
              </CardTitle>
              <CardDescription className="mt-1">
                Comprehensive interview covering threat perception, routines, and security posture
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" data-testid="badge-question-count">
                {totalProgress.answered}/{totalProgress.total} Questions
              </Badge>
              <Badge variant="outline" data-testid="badge-section-count">
                8 Sections
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{totalProgress.percent}%</span>
            </div>
            <Progress value={totalProgress.percent} className="h-2" data-testid="progress-overall" />
          </div>
        </CardHeader>
      </Card>

      <Card data-testid="card-executive-interview-sections">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <div className="border-b">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none">
                {SECTION_CONFIGS.map((section, index) => {
                  const status = getSectionStatus(section.id);
                  const progress = sectionProgress[section.id];
                  const Icon = section.icon;
                  
                  return (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="flex-shrink-0 relative px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/50 gap-2"
                      data-testid={`tab-section-${section.id}`}
                    >
                      <div className="flex items-center gap-2">
                        {status === 'complete' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{section.label}</span>
                        <span className="sm:hidden">{section.shortLabel}</span>
                      </div>
                      {progress && progress.total > 0 && status !== 'complete' && (
                        <Badge 
                          variant="secondary" 
                          className="ml-1 text-xs h-5 px-1.5"
                        >
                          {progress.answered}/{progress.total}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {SECTION_CONFIGS.map((section) => (
            <TabsContent 
              key={section.id} 
              value={section.id} 
              className="p-0 mt-0"
              data-testid={`content-section-${section.id}`}
            >
              <div className="p-4 sm:p-6 border-b bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{section.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {sectionProgress[section.id]?.percent || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sectionProgress[section.id]?.answered || 0} of {sectionProgress[section.id]?.total || 0}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={sectionProgress[section.id]?.percent || 0} 
                  className="h-1.5 mt-4" 
                  data-testid={`progress-section-${section.id}`}
                />
              </div>

              <CardContent className="p-0">
                <ExecutiveSurveyQuestions
                  assessmentId={assessmentId}
                  sectionCategory={section.category}
                />
              </CardContent>

              <div className="p-4 sm:p-6 border-t bg-muted/20 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Section {currentSectionIndex + 1} of {SECTION_CONFIGS.length}
                </div>
                <Button 
                  onClick={handleNextSection}
                  className="gap-2"
                  data-testid={`button-next-section-${section.id}`}
                >
                  {isLastSection ? (
                    <>Complete Interview</>
                  ) : (
                    <>
                      Next: {nextSection?.shortLabel}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
