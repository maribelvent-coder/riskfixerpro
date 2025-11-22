/**
 * Template-Specific Metrics Calculator
 * 
 * Calculates financial impact and ROI metrics for template-specific "killer features"
 * Shared by PDF generator and HTML preview generator
 */

/**
 * Calculate template-specific metrics for "killer features"
 */
export function calculateTemplateMetrics(assessment: any, risks: any[]): Record<string, any> {
  
  const templateId = assessment.templateId;
  
  if (!templateId) {
    return {};
  }
  
  switch (templateId) {
    case 'warehouse-distribution':
      return calculateWarehouseMetrics(assessment, risks);
    
    case 'retail-store':
      return calculateRetailMetrics(assessment, risks);
    
    case 'manufacturing-facility':
      return calculateManufacturingMetrics(assessment, risks);
    
    case 'executive-protection':
      return calculateExecutiveProtectionMetrics(assessment, risks);
    
    case 'data-center':
      return calculateDataCenterMetrics(assessment, risks);
    
    case 'office-building':
      return calculateOfficeMetrics(assessment, risks);
    
    default:
      return {};
  }
}

/**
 * Warehouse: Cargo Theft ROI & Loading Dock Heatmap
 */
function calculateWarehouseMetrics(assessment: any, risks: any[]): Record<string, any> {
  const profile = assessment.warehouse_profile || {};
  
  // Calculate cargo theft ROI
  const cargoTheftRisks = risks.filter(r => 
    r.scenario?.toLowerCase().includes('cargo') || 
    r.scenario?.toLowerCase().includes('theft')
  );
  
  const inventoryValue = profile.inventoryValue || 0;
  const shrinkageRate = (profile.shrinkageRate || 1.5) / 100;
  const annualLoss = inventoryValue * shrinkageRate;
  const preventionCostEstimate = annualLoss * 0.15; // 15% of loss for prevention
  const potentialSavings = annualLoss - preventionCostEstimate;
  
  return {
    cargoTheftROI: {
      inventoryValue,
      estimatedAnnualLoss: annualLoss,
      preventionInvestment: preventionCostEstimate,
      potentialSavings,
      roi: preventionCostEstimate > 0 ? potentialSavings / preventionCostEstimate : 0
    },
    loadingDockHeatmap: {
      totalDocks: profile.loadingDockCount || 0,
      dailyTruckVolume: profile.dailyTruckVolume || 0,
      highRiskDocks: cargoTheftRisks.length,
      recommendations: [
        'Install CCTV coverage on all loading docks',
        'Implement trailer seal verification procedures',
        'Conduct random truck inspections'
      ]
    }
  };
}

/**
 * Retail: Shrinkage Analysis & Loss Prevention ROI
 */
function calculateRetailMetrics(assessment: any, risks: any[]): Record<string, any> {
  const profile = assessment.retail_profile || {};
  
  const annualRevenue = profile.annualRevenue || 0;
  const shrinkageRate = (profile.shrinkageRate || 1.5) / 100;
  const shrinkageDollars = annualRevenue * shrinkageRate;
  
  // Industry benchmark: 1.4-1.6%
  const industryAvg = 0.015;
  const excessShrinkage = Math.max(0, shrinkageRate - industryAvg);
  const excessLoss = annualRevenue * excessShrinkage;
  
  // LP ROI calculation
  const lpInvestment = shrinkageDollars * 0.20; // 20% of shrinkage for LP program
  const potentialRecovery = excessLoss * 0.70; // Can recover 70% of excess
  
  return {
    shrinkageAnalysis: {
      annualRevenue,
      shrinkageRate: shrinkageRate * 100,
      shrinkageDollars,
      industryBenchmark: industryAvg * 100,
      excessLoss,
      orcIncidents: profile.orcIncidents || 0
    },
    lossPreventionROI: {
      recommendedInvestment: lpInvestment,
      potentialRecovery,
      netBenefit: potentialRecovery - lpInvestment,
      roi: lpInvestment > 0 ? potentialRecovery / lpInvestment : 0,
      paybackPeriod: potentialRecovery > 0 ? lpInvestment / (potentialRecovery / 12) : 0 // months
    }
  };
}

/**
 * Manufacturing: Downtime Cost Calculator
 */
function calculateManufacturingMetrics(assessment: any, risks: any[]): Record<string, any> {
  const profile = assessment.manufacturing_profile || {};
  
  const productionValue = profile.productionValue || 0;
  const hoursPerYear = 8760; // 24/7 operation
  const valuePerHour = productionValue / hoursPerYear;
  
  // Calculate downtime risk
  const downtimeRisks = risks.filter(r => 
    r.scenario?.toLowerCase().includes('downtime') || 
    r.scenario?.toLowerCase().includes('sabotage')
  );
  
  const avgDowntimeHours = 24; // Conservative estimate for major incident
  const potentialLoss = valuePerHour * avgDowntimeHours;
  
  return {
    downtimeCostCalculator: {
      annualProductionValue: productionValue,
      valuePerHour,
      avgIncidentDowntime: avgDowntimeHours,
      potentialLossPerIncident: potentialLoss,
      downtimeRiskCount: downtimeRisks.length,
      mitigationRecommendations: [
        'Implement redundant systems for critical equipment',
        'Establish emergency response protocols',
        'Conduct regular equipment maintenance'
      ]
    },
    ipTheftImpact: {
      hasIPSensitivity: profile.hasIPSensitivity || false,
      estimatedRDInvestment: productionValue * 0.10, // 10% of production value
      competitiveAdvantageAtRisk: true
    }
  };
}

/**
 * Executive Protection: Exposure Factor & Threat Radar
 */
function calculateExecutiveProtectionMetrics(assessment: any, risks: any[]): Record<string, any> {
  
  // Calculate exposure factor based on risk categories
  const kidnappingRisks = risks.filter(r => r.scenario?.toLowerCase().includes('kidnap'));
  const stalkingRisks = risks.filter(r => r.scenario?.toLowerCase().includes('stalk'));
  const exposureRisks = risks.filter(r => 
    r.scenario?.toLowerCase().includes('exposure') ||
    r.scenario?.toLowerCase().includes('osint') ||
    r.scenario?.toLowerCase().includes('doxxing')
  );
  
  const totalRisks = risks.length;
  const exposureFactor = totalRisks > 0 
    ? ((kidnappingRisks.length * 3) + (stalkingRisks.length * 2) + exposureRisks.length) / (totalRisks * 3)
    : 0;
  
  return {
    exposureFactor: {
      score: exposureFactor * 100,
      level: exposureFactor > 0.7 ? 'High' : exposureFactor > 0.4 ? 'Medium' : 'Low',
      kidnappingRisks: kidnappingRisks.length,
      stalkingRisks: stalkingRisks.length,
      digitalExposureRisks: exposureRisks.length
    },
    threatRadar: {
      categories: [
        { name: 'Kidnapping/Abduction', count: kidnappingRisks.length, severity: 'critical' },
        { name: 'Stalking/Harassment', count: stalkingRisks.length, severity: 'high' },
        { name: 'Digital Exposure', count: exposureRisks.length, severity: 'medium' },
        { name: 'Travel Security', count: risks.filter(r => r.scenario?.toLowerCase().includes('travel')).length, severity: 'medium' }
      ],
      recommendations: [
        'Implement counter-surveillance measures',
        'Conduct OSINT vulnerability assessment',
        'Establish secure travel protocols'
      ]
    }
  };
}

/**
 * Data Center: SLA Gap Analysis
 */
function calculateDataCenterMetrics(assessment: any, risks: any[]): Record<string, any> {
  const profile = assessment.datacenter_profile || {};
  
  // Parse uptime requirement (e.g., "99.99%" -> 0.9999)
  const uptimeStr = profile.uptimeRequirement || '99.9%';
  const uptimeTarget = parseFloat(uptimeStr) / 100;
  
  // Calculate allowed downtime
  const minutesPerYear = 525600;
  const allowedDowntime = minutesPerYear * (1 - uptimeTarget);
  
  // SLA breach risks
  const slaRisks = risks.filter(r => 
    r.scenario?.toLowerCase().includes('sla') ||
    r.scenario?.toLowerCase().includes('downtime') ||
    r.scenario?.toLowerCase().includes('power')
  );
  
  // Calculate financial impact
  const annualRevenue = profile.annualRevenue || 0;
  const customerCount = profile.customerCount || 0;
  const revenuePerMinute = annualRevenue / minutesPerYear;
  const penaltyPerMinute = revenuePerMinute * 0.10; // 10% penalty rate
  
  return {
    slaGapAnalysis: {
      uptimeTarget: uptimeTarget * 100,
      allowedDowntimeMinutes: allowedDowntime,
      allowedDowntimeHours: allowedDowntime / 60,
      slaBreachRisks: slaRisks.length,
      customerCount,
      potentialPenaltyPerHour: penaltyPerMinute * 60,
      tierLevel: profile.tierLevel || 'Tier III'
    },
    complianceGaps: {
      frameworks: profile.complianceFrameworks || [],
      complianceRisks: risks.filter(r => r.scenario?.toLowerCase().includes('compliance')).length,
      auditReadiness: slaRisks.length === 0 ? 'High' : slaRisks.length < 3 ? 'Medium' : 'Low'
    }
  };
}

/**
 * Office Building: Safety Score
 */
function calculateOfficeMetrics(assessment: any, risks: any[]): Record<string, any> {
  const profile = assessment.office_profile || {};
  
  // Calculate safety score based on violence preparedness
  const violenceRisks = risks.filter(r => 
    r.scenario?.toLowerCase().includes('violence') ||
    r.scenario?.toLowerCase().includes('shooter') ||
    r.scenario?.toLowerCase().includes('threat')
  );
  
  const dataSecurityRisks = risks.filter(r => 
    r.scenario?.toLowerCase().includes('data') ||
    r.scenario?.toLowerCase().includes('breach') ||
    r.scenario?.toLowerCase().includes('theft')
  );
  
  // Safety score: 100 - (violence risks * 15 + data risks * 10)
  const safetyScore = Math.max(0, 100 - (violenceRisks.length * 15 + dataSecurityRisks.length * 10));
  
  return {
    safetyScore: {
      overall: safetyScore,
      grade: safetyScore >= 90 ? 'A' : safetyScore >= 80 ? 'B' : safetyScore >= 70 ? 'C' : safetyScore >= 60 ? 'D' : 'F',
      employeeCount: profile.employeeCount || '1-50',
      violencePreparedness: violenceRisks.length === 0 ? 'Excellent' : violenceRisks.length < 3 ? 'Good' : 'Needs Improvement',
      dataSecurityPosture: dataSecurityRisks.length === 0 ? 'Excellent' : dataSecurityRisks.length < 3 ? 'Good' : 'Needs Improvement'
    },
    keyMetrics: {
      workplaceViolenceRisks: violenceRisks.length,
      dataSecurityRisks: dataSecurityRisks.length,
      hasExecutivePresence: profile.hasExecutivePresence || false,
      dataSensitivity: profile.dataSensitivity || 'Internal'
    }
  };
}
