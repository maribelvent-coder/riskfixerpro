import { ReportGenerator } from '../ReportGenerator';

export default function ReportGeneratorExample() {
  const handleGenerate = (reportId: string) => {
    console.log('Generate report:', reportId);
  };

  const handleDownload = (reportId: string) => {
    console.log('Download report:', reportId);
  };

  const handleShare = (reportId: string) => {
    console.log('Share report:', reportId);
  };

  return (
    <ReportGenerator
      assessmentId="demo-001"
      onGenerate={handleGenerate}
      onDownload={handleDownload}
      onShare={handleShare}
    />
  );
}