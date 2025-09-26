import { useState } from 'react';
import { RiskAnalysis } from '../RiskAnalysis';

export default function RiskAnalysisExample() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGenerateAnalysis = () => {
    setIsAnalyzing(true);
    console.log('Generating AI risk analysis...');
    
    // Simulate analysis time
    setTimeout(() => {
      setIsAnalyzing(false);
      console.log('Analysis complete!');
    }, 3000);
  };

  return (
    <RiskAnalysis
      isAnalyzing={isAnalyzing}
      onGenerateAnalysis={handleGenerateAnalysis}
    />
  );
}