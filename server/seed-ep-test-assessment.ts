/**
 * Seed Executive Protection Test Assessment
 * Creates a fully populated EP assessment with high-risk interview responses
 * for testing the EP Dashboard and AI risk analysis features.
 * 
 * Run: npx tsx server/seed-ep-test-assessment.ts
 */
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { 
  assessments, 
  users, 
  sites,
  executiveInterviewResponses,
  executiveProfiles 
} from '../shared/schema';

const HIGH_RISK_INTERVIEW_RESPONSES: Record<string, any> = {
  // Personal Threat Perception (8-10 = high concern)
  threat_perception_1: 8, // Very concerned about safety
  threat_perception_2: 'yes', // Has received direct threats
  threat_perception_2a: 'Multiple threatening emails from a terminated employee who blamed me for layoffs. Also received anonymous letters at home office.',
  threat_perception_2b: 'yes', // Reported to law enforcement
  threat_perception_3: 'yes', // Has active restraining order
  threat_perception_4: 'yes', // Aware of threat actors
  threat_perception_4a: 'Former CFO who was terminated for fraud and has made public statements against me. Also a persistent online stalker who has identified my home address.',
  threat_perception_5: [
    'Kidnapping or abduction',
    'Physical assault or assassination',
    'Stalking or harassment',
    'Cyberstalking or doxxing',
    'Threats to family members'
  ],
  
  // Public Profile & Exposure
  public_profile_1: 'Very High (National/international recognition, frequent media coverage)',
  public_profile_2: 'Weekly or more',
  public_profile_3: 'yes', // Subject of negative media
  public_profile_3a: 'Recent coverage of company layoffs generated significant backlash. Some media portrayed me negatively.',
  public_profile_4: 'yes', // Active social media
  public_profile_5: 'yes', // Has been doxxed
  public_profile_6: 8, // Net worth visibility rating (high)
  
  // Family & Dependents
  family_1: 'yes', // Has family/dependents
  family_2: ['Spouse/Partner', 'Minor Children', 'Elderly Parents'],
  family_3: 'yes', // Family has public exposure
  family_4: 'yes', // Family included in threats
  family_5: 'yes', // Children attend identifiable schools
  family_5a: 'Children attend private school that is well known and frequently mentioned in social media.',
  family_6: 'no', // No security for family
  
  // Residence Security
  residence_1: 'Single-family home in gated community',
  residence_2: 'no', // Not 24/7 secured
  residence_3: 'no', // No perimeter intrusion detection
  residence_4: 'yes', // Has alarm system
  residence_5: 'no', // No panic room/safe room
  residence_6: 'yes', // Address publicly known
  residence_7: 'no', // No security personnel at residence
  residence_8: 3, // Security rating (low-medium)
  
  // Daily Routines & Travel
  routine_1: 'yes', // Has predictable daily routine
  routine_2: 'Same route daily',
  routine_3: 'Self-driven personal vehicle',
  routine_4: 'no', // No driver/security during commute
  routine_5: 'Frequent', // Travel frequency
  routine_6: ['High-risk countries (parts of Latin America, Africa, Asia)', 'Countries with known corporate espionage'],
  routine_7: 'no', // No advance security for international travel
  routine_8: 'yes', // Uses public transportation internationally
  
  // Workplace Security
  workplace_1: 'High-rise office building in urban center',
  workplace_2: 'yes', // Building has lobby security
  workplace_3: 'no', // No dedicated reception for executive floor
  workplace_4: 'yes', // Publicly known office location
  workplace_5: 'no', // No secure parking with direct access
  workplace_6: 'no', // No panic button in office
  workplace_7: 'yes', // Has had workplace threats
  workplace_7a: 'Disgruntled former employee gained access to building and was found near my office floor.',
  
  // Digital & Cyber Security
  digital_1: 'yes', // Uses personal devices for work
  digital_2: 'no', // Has not had security audit of personal devices
  digital_3: 'yes', // Personal info available online
  digital_4: 'no', // Does not use VPN
  digital_5: 'yes', // Has been victim of phishing/social engineering
  digital_6: 'Moderate', // Password hygiene
  digital_7: 'yes', // Family members share devices
  
  // Emergency Preparedness
  emergency_1: 'no', // No emergency action plan
  emergency_2: 'no', // No designated safe locations
  emergency_3: 'no', // No emergency communication protocol
  emergency_4: 'no', // No go-bag prepared
  emergency_5: 'no', // Family not trained on emergency procedures
};

async function seedEPTestAssessment() {
  console.log('🎯 Seeding Executive Protection Test Assessment...\n');
  
  try {
    // Find a user to create assessment for (prefer admin or first user)
    const existingUsers = await db.select().from(users).limit(5);
    
    if (existingUsers.length === 0) {
      console.error('❌ No users found. Please create a user first.');
      return;
    }
    
    // Use first user found
    const testUser = existingUsers[0];
    console.log(`📝 Creating assessment for user: ${testUser.username}`);
    
    // Get or create a site
    let testSite = await db.select().from(sites).where(eq(sites.userId, testUser.id)).limit(1);
    let siteId: string | null = null;
    
    if (testSite.length > 0) {
      siteId = testSite[0].id;
      console.log(`📍 Using existing site: ${testSite[0].name}`);
    } else {
      console.log('📍 No site found, assessment will be created without site');
    }
    
    // Check if EP test assessment already exists
    const existingAssessment = await db.select()
      .from(assessments)
      .where(and(
        eq(assessments.userId, testUser.id),
        eq(assessments.title, 'EP Test - High Risk Principal')
      ))
      .limit(1);
    
    let assessmentId: string;
    
    if (existingAssessment.length > 0) {
      assessmentId = existingAssessment[0].id;
      console.log(`♻️  Updating existing test assessment: ${assessmentId}`);
    } else {
      // Create new EP assessment
      const [newAssessment] = await db.insert(assessments)
        .values({
          title: 'EP Test - High Risk Principal',
          location: 'New York, NY',
          assessor: 'Security Team',
          userId: testUser.id,
          siteId: siteId,
          templateId: 'executive-protection',
          surveyParadigm: 'executive',
          status: 'in_progress',
          organizationId: testUser.organizationId,
        })
        .returning();
      
      assessmentId = newAssessment.id;
      console.log(`✨ Created new assessment: ${assessmentId}`);
    }
    
    // Create or update executive profile
    const existingProfile = await db.select()
      .from(executiveProfiles)
      .where(eq(executiveProfiles.assessmentId, assessmentId))
      .limit(1);
    
    if (existingProfile.length > 0) {
      await db.update(executiveProfiles)
        .set({
          fullName: 'Jonathan Sterling III',
          title: 'CEO & Chairman',
          companyRole: 'Chief Executive Officer',
          publicProfile: 'high',
          netWorthRange: '$1B+',
          industryCategory: 'Finance & Investment',
          currentSecurityLevel: 'minimal',
          knownThreats: 'Terminated CFO with vendetta, online stalker who identified home address',
          previousIncidents: 'Threatening emails from terminated employee, anonymous threatening letters',
          updatedAt: new Date(),
        })
        .where(eq(executiveProfiles.id, existingProfile[0].id));
      console.log('📋 Updated executive profile');
    } else {
      await db.insert(executiveProfiles)
        .values({
          assessmentId: assessmentId,
          fullName: 'Jonathan Sterling III',
          title: 'CEO & Chairman',
          companyRole: 'Chief Executive Officer',
          publicProfile: 'high',
          netWorthRange: '$1B+',
          industryCategory: 'Finance & Investment',
          currentSecurityLevel: 'minimal',
          knownThreats: 'Terminated CFO with vendetta, online stalker who identified home address',
          previousIncidents: 'Threatening emails from terminated employee, anonymous threatening letters',
        });
      console.log('📋 Created executive profile');
    }
    
    // Insert all interview responses
    console.log('\n📝 Inserting interview responses...');
    let insertedCount = 0;
    
    // Since executiveInterviewResponses requires questionId to reference executiveInterviewQuestions table,
    // we'll store responses in the assessment's epProfile JSONB field instead
    const epProfileData = HIGH_RISK_INTERVIEW_RESPONSES;
    
    await db.update(assessments)
      .set({
        epProfile: epProfileData,
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, assessmentId));
    
    insertedCount = Object.keys(HIGH_RISK_INTERVIEW_RESPONSES).length;
    console.log(`✅ Stored ${insertedCount} interview responses in epProfile`)
    
    console.log(`✅ Inserted/updated ${insertedCount} interview responses`);
    
    // Clear any cached dashboard data to force regeneration
    await db.update(assessments)
      .set({
        epDashboardCache: null,
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, assessmentId));
    
    console.log('\n🎉 EP Test Assessment seeded successfully!');
    console.log(`\n📊 Assessment ID: ${assessmentId}`);
    console.log(`\n🔗 To view the dashboard, navigate to:`);
    console.log(`   /assessments/${assessmentId}/executive`);
    console.log(`\n💡 Click "Generate AI Risk Analysis" to populate the threat matrix.`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEPTestAssessment()
    .then(() => {
      console.log('\n✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedEPTestAssessment };
