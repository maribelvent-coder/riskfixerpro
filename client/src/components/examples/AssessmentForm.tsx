import { AssessmentForm } from '../AssessmentForm';

export default function AssessmentFormExample() {
  const handleSave = (data: any) => {
    console.log('Save assessment data:', data);
  };

  const handleSubmit = (data: any) => {
    console.log('Submit assessment data:', data);
  };

  return (
    <AssessmentForm
      assessmentId="demo-001"
      title="Corporate Office Security Assessment"
      onSave={handleSave}
      onSubmit={handleSubmit}
    />
  );
}