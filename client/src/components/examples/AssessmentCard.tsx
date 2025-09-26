import { AssessmentCard } from '../AssessmentCard';

export default function AssessmentCardExample() {
  const handleAction = (action: string, id: string) => {
    console.log(`${action} triggered for assessment ${id}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <AssessmentCard
        id="draft-001"
        title="Main Office Building Security Assessment"
        location="123 Corporate Blvd, Suite 100"
        status="draft"
        assessor="Sarah Johnson"
        createdDate="Dec 20, 2024"
        lastModified="Dec 20, 2024"
        onStart={(id) => handleAction('Start assessment', id)}
      />
      
      <AssessmentCard
        id="progress-002"
        title="Warehouse Facility Risk Evaluation"
        location="456 Industrial Way"
        status="in-progress"
        assessor="Mike Chen"
        createdDate="Dec 18, 2024"
        lastModified="Dec 22, 2024"
        onView={(id) => handleAction('View assessment', id)}
      />
      
      <AssessmentCard
        id="completed-003"
        title="Data Center Security Audit"
        location="789 Tech Park Dr"
        status="completed"
        assessor="Alex Rivera"
        createdDate="Dec 15, 2024"
        lastModified="Dec 21, 2024"
        riskLevel="high"
        onView={(id) => handleAction('View assessment', id)}
        onGenerate={(id) => handleAction('Generate report', id)}
      />
    </div>
  );
}