import { RiskScoreCard } from '../RiskScoreCard';

export default function RiskScoreCardExample() {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <RiskScoreCard
        title="Physical Access Control"
        score={15}
        maxScore={20}
        category="low"
        lastAssessed="2 days ago"
        trends="stable"
      />
      <RiskScoreCard
        title="Perimeter Security"
        score={12}
        maxScore={20}
        category="medium"
        lastAssessed="1 week ago"
        trends="down"
      />
      <RiskScoreCard
        title="CCTV Coverage"
        score={8}
        maxScore={20}
        category="high"
        lastAssessed="3 days ago"
        trends="up"
      />
      <RiskScoreCard
        title="Emergency Protocols"
        score={3}
        maxScore={20}
        category="critical"
        lastAssessed="2 weeks ago"
        trends="down"
      />
    </div>
  );
}