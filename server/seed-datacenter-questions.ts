/**
 * Seed Data Center Interview Questions
 * Populates template_questions and question_threat_map/question_control_map tables with proper ID linkages
 */
import { db } from './db';
import { templateQuestions, questionThreatMap, questionControlMap } from '../shared/schema';
import { datacenterInterviewQuestions } from './data/datacenter-interview-questionnaire';
import { eq, and } from 'drizzle-orm';

// Mapping from questionnaire snake_case identifiers to library names
const THREAT_NAME_MAP: Record<string, string> = {
  'data_theft_server_drive_removal': 'Data Theft - Server/Drive Removal',
  'environmental_failure_cooling_loss': 'Cooling Loss - Environmental Failure',
  'fire_data_loss': 'Fire - Data Loss',
  'insider_threat_privileged_access': 'Insider Threat - Privileged Access Abuse',
  'multi_tenant_breach': 'Multi-Tenant Breach - Cross-Contamination',
  'power_failure_service_disruption': 'Power Failure - Service Disruption',
  'sabotage_infrastructure': 'Sabotage - Infrastructure Disruption',
  'social_engineering_fake_technician': 'Social Engineering - Fake Technician',
  'supply_chain_hardware_tampering': 'Supply Chain - Hardware Tampering',
  'tailgating_unauthorized_entry': 'Tailgating - Unauthorized Entry',
  'unauthorized_physical_access_customer_data': 'Unauthorized Physical Access - Customer Data'
};

const CONTROL_NAME_MAP: Record<string, string> = {
  'access_logging_audit_trail': 'Access Logging & Audit Trail',
  'access_revocation_immediate': 'Access Revocation (Immediate)',
  'background_checks_level_2': 'Background Checks Level 2',
  'biometric_fingerprint': 'Biometric Fingerprint',
  'biometric_iris_facial': 'Biometric Iris & Facial Recognition',
  'biometric_palm_vein': 'Biometric Palm Vein',
  'business_continuity_plan': 'Business Continuity Plan',
  'cabinet_access_logging': 'Cabinet Access Logging',
  'cabinet_electronic_locks': 'Cabinet Electronic Locks',
  'cctv_all_entry_exit_points': 'CCTV All Entry/Exit Points',
  'cctv_man_trap_portals': 'CCTV Man-Trap Portals',
  'cctv_perimeter_datacenter': 'CCTV Perimeter (Datacenter)',
  'cctv_server_floor_aisles': 'CCTV Server Floor Aisles',
  'clean_desk_clear_screen_policy': 'Clean Desk Clear Screen Policy',
  'compliance_audit_annual': 'Compliance Audit (Annual)',
  'customer_controlled_locks': 'Customer-Controlled Locks',
  'disaster_recovery_site': 'Disaster Recovery Site',
  'emergency_power_off_epo': 'Emergency Power Off (EPO)',
  'environmental_monitoring_system': 'Environmental Monitoring System',
  'facial_recognition_system': 'Facial Recognition System',
  'fire_detection_vesda_aspirating': 'Fire Detection VESDA/Aspirating',
  'fire_suppression_clean_agent': 'Fire Suppression Clean Agent',
  'generator_backup_fuel_48_hours': 'Generator Backup (48hr Fuel)',
  'hands_on_server_cameras': 'Hands-On-Server Cameras',
  'hot_cold_aisle_containment': 'Hot/Cold Aisle Containment',
  'incident_response_plan_documented': 'Incident Response Plan (Documented)',
  'incident_response_team_24x7': 'Incident Response Team 24/7',
  'insider_threat_monitoring_program': 'Insider Threat Monitoring Program',
  'jump_box_access_controlled': 'Jump Box Access Controlled',
  'logical_access_integration': 'Logical Access Integration',
  'man_trap_portal_system': 'Man-Trap Portal System',
  'multi_factor_authentication_3_factors': 'Multi-Factor Authentication (3 Factors)',
  'nda_confidentiality_agreements': 'NDA & Confidentiality Agreements',
  'network_segmentation_customer_isolation': 'Network Segmentation (Customer Isolation)',
  'noc_soc_24x7_monitoring': 'NOC/SOC 24/7 Monitoring',
  'out_of_band_management': 'Out-of-Band Management',
  'penetration_testing_physical': 'Penetration Testing (Physical)',
  'perimeter_barrier_standoff_distance': 'Perimeter Barrier & Standoff Distance',
  'perimeter_intrusion_detection_datacenter': 'Perimeter Intrusion Detection (Datacenter)',
  'perimeter_lighting_datacenter': 'Perimeter Lighting',
  'redundant_cooling_2n': 'Redundant Cooling 2N',
  'redundant_cooling_n_plus_1': 'Redundant Cooling N+1',
  'redundant_power_2n': 'Redundant Power 2N',
  'redundant_power_n_plus_1': 'Redundant Power N+1',
  'remote_hands_procedures': 'Remote Hands Procedures',
  'secure_disposal_drive_shredding': 'Secure Disposal & Drive Shredding',
  'security_awareness_training_annual': 'Security Awareness Training',
  'security_guard_24x7': 'Security Guard 24/7',
  'seismic_protection_if_applicable': 'Seismic Protection',
  'temperature_humidity_monitoring': 'Temperature & Humidity Monitoring',
  'two_person_rule_sensitive_ops': 'Two-Person Rule (Sensitive Ops)',
  'ups_battery_backup': 'UPS Battery Backup',
  'vehicle_barriers_bollards': 'Vehicle Barriers (Bollards)',
  'vendor_vetting_background_checks': 'Vendor Vetting & Background Checks',
  'video_analytics_behavior_detection': 'Video Analytics & Behavior Detection',
  'video_retention_90_days': 'Video Retention 90 Days',
  'visitor_check_in_id_verification': 'Visitor Check-In & ID Verification',
  'visitor_escort_mandatory': 'Visitor Escort (Mandatory)',
  'vulnerability_assessment_regular': 'Vulnerability Assessment (Regular)',
  'water_leak_detection': 'Water Leak Detection'
};

async function seedDatacenterQuestions() {
  console.log('🏢 Seeding Data Center Interview Questions...\n');

  const templateId = 'datacenter';
  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  const unmappedThreats = new Set<string>();
  const unmappedControls = new Set<string>();

  // Pre-load all control and threat mappings for efficiency
  console.log('📚 Loading control and threat libraries...');
  const { loadControlLibraryByName, loadThreatLibraryByName } = await import('./services/library-resolver');
  const controlLib = await loadControlLibraryByName();
  const threatLib = await loadThreatLibraryByName();
  console.log(`   Loaded ${controlLib.size} controls and ${threatLib.size} threats\n`);

  // Helper function to convert questionnaire data to flat question list
  function flattenQuestions(questions: any[], parentSection: string = ''): any[] {
    const result: any[] = [];
    for (const q of questions) {
      result.push(q);
      if (q.followUpQuestions && q.followUpQuestions.length > 0) {
        result.push(...flattenQuestions(q.followUpQuestions, q.section));
      }
    }
    return result;
  }

  const allQuestions = flattenQuestions(datacenterInterviewQuestions);
  console.log(`📋 Processing ${allQuestions.length} questions (including follow-ups)...\n`);

  for (const question of allQuestions) {
    try {
      console.log(`Processing question ${question.id}...`);
      
      // Resolve control name to ID (only take first control mapping for FK)
      let controlLibraryId: string | null = null;
      if (question.suggestsControls && question.suggestsControls.length > 0) {
        const snakeCaseName = question.suggestsControls[0];
        const libraryName = CONTROL_NAME_MAP[snakeCaseName];
        
        if (!libraryName) {
          unmappedControls.add(snakeCaseName);
          console.warn(`⚠️  Question ${question.id}: Unmapped control: ${snakeCaseName}`);
        } else {
          const control = controlLib.get(libraryName);
          if (control) {
            controlLibraryId = control.id;
          } else {
            console.warn(`⚠️  Question ${question.id}: Control not found in library: ${libraryName}`);
          }
        }
      }

      // Check if question already exists
      const existingQuestion = await db
        .select()
        .from(templateQuestions)
        .where(
          and(
            eq(templateQuestions.templateId, templateId),
            eq(templateQuestions.questionId, question.id)
          )
        );

      let dbQuestionId: string;

      if (existingQuestion.length > 0) {
        // Update existing question
        await db
          .update(templateQuestions)
          .set({
            category: question.section,
            subcategory: question.zoneApplicable?.join(', ') || null,
            question: question.questionText,
            bestPractice: null,
            rationale: question.riskIndicators?.join('; ') || null,
            importance: question.required ? 'High' : 'Medium',
            type: question.questionType.replace(/_/g, '-'),
            options: question.options || null,
            orderIndex: parseInt(question.id.replace(/[^0-9]/g, '')) || 0,
            controlLibraryId: controlLibraryId
          })
          .where(eq(templateQuestions.id, existingQuestion[0].id));

        dbQuestionId = existingQuestion[0].id;
        updatedCount++;
      } else {
        // Insert new question
        const result = await db
          .insert(templateQuestions)
          .values({
            templateId,
            questionId: question.id,
            category: question.section,
            subcategory: question.zoneApplicable?.join(', ') || null,
            question: question.questionText,
            bestPractice: null,
            rationale: question.riskIndicators?.join('; ') || null,
            importance: question.required ? 'High' : 'Medium',
            type: question.questionType.replace(/_/g, '-'),
            options: question.options || null,
            orderIndex: parseInt(question.id.replace(/[^0-9]/g, '')) || 0,
            controlLibraryId: controlLibraryId
          })
          .returning();

        dbQuestionId = result[0].id;
        insertedCount++;
      }

      // Create threat mappings in question_threat_map
      if (question.informsThreat && question.informsThreat.length > 0) {
        for (const snakeCaseName of question.informsThreat) {
          const libraryName = THREAT_NAME_MAP[snakeCaseName];
          
          if (!libraryName) {
            unmappedThreats.add(snakeCaseName);
            console.warn(`⚠️  Question ${question.id}: Unmapped threat: ${snakeCaseName}`);
            continue;
          }

          const threat = threatLib.get(libraryName);
          if (!threat) {
            console.error(`❌ CRITICAL: Question ${question.id}: Threat not found in library: "${libraryName}"`);
            errorCount++;
            continue;
          }

          // Check if mapping already exists
          const existingMapping = await db
            .select()
            .from(questionThreatMap)
            .where(
              and(
                eq(questionThreatMap.questionId, dbQuestionId),
                eq(questionThreatMap.threatId, threat.id)
              )
            );

          if (existingMapping.length === 0) {
            await db.insert(questionThreatMap).values({
              questionId: dbQuestionId,
              threatId: threat.id,
              impactDriver: question.informsImpact || false
            });
          }
        }
      }

      // Create control mappings in question_control_map
      if (question.suggestsControls && question.suggestsControls.length > 0) {
        for (let i = 0; i < question.suggestsControls.length; i++) {
          const snakeCaseName = question.suggestsControls[i];
          const libraryName = CONTROL_NAME_MAP[snakeCaseName];
          
          if (!libraryName) {
            // Already logged as unmapped above
            continue;
          }

          const control = controlLib.get(libraryName);
          if (!control) {
            console.error(`❌ CRITICAL: Question ${question.id}: Control not found in library: "${libraryName}"`);
            errorCount++;
            continue;
          }

          // Check if mapping already exists
          const existingMapping = await db
            .select()
            .from(questionControlMap)
            .where(
              and(
                eq(questionControlMap.questionId, dbQuestionId),
                eq(questionControlMap.controlId, control.id)
              )
            );

          if (existingMapping.length === 0) {
            await db.insert(questionControlMap).values({
              questionId: dbQuestionId,
              controlId: control.id,
              isPrimary: i === 0
            });
          }
        }
      }

      console.log(`✓ ${question.id} processed`);
    } catch (error: any) {
      console.error(`❌ Error processing question ${question.id}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Seed Summary:');
  console.log(`   Questions inserted: ${insertedCount}`);
  console.log(`   Questions updated: ${updatedCount}`);
  console.log(`   Errors: ${errorCount}`);
  
  if (unmappedThreats.size > 0) {
    console.log('\n⚠️  Unmapped Threats (need to add to THREAT_NAME_MAP):');
    unmappedThreats.forEach(t => console.log(`   - ${t}`));
  }
  
  if (unmappedControls.size > 0) {
    console.log('\n⚠️  Unmapped Controls (need to add to CONTROL_NAME_MAP):');
    unmappedControls.forEach(c => console.log(`   - ${c}`));
  }

  if (errorCount === 0 && unmappedThreats.size === 0 && unmappedControls.size === 0) {
    console.log('\n✅ Data Center questions seeded successfully with ZERO errors and ZERO warnings!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Seed completed with warnings or errors - see above for details');
    process.exit(unmappedThreats.size > 0 || unmappedControls.size > 0 || errorCount > 0 ? 1 : 0);
  }
}

seedDatacenterQuestions();
