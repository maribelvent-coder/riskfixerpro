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
  // ========================================================================
  // SECTION 1: Personal Threat Perception
  // ========================================================================
  threat_perception_1: 9, // Very concerned about safety (1-10 scale)
  threat_perception_2: 'yes', // Has received direct threats
  threat_perception_2a: 'Multiple death threats via email from terminated CFO who blamed me for his indictment. Anonymous letters at home with specific details about my family schedule. Two instances of being followed by unknown vehicles. Threatening voicemails on personal cell phone.',
  threat_perception_2b: 'yes', // Reported to law enforcement
  threat_perception_3: 'yes', // Has active restraining order
  threat_perception_4: 'yes', // Aware of threat actors
  threat_perception_4a: 'Former CFO Marcus Reynolds - terminated for embezzlement, publicly vowed revenge, active on dark web forums. Obsessed fan "Jennifer" who has sent 200+ letters and attempted contact at public events. Disgruntled investor group from failed acquisition. Anonymous online persona tracking my movements.',
  threat_perception_5: [
    'Kidnapping or abduction',
    'Physical assault or assassination',
    'Home invasion',
    'Stalking or harassment',
    'Cyberstalking or doxxing',
    'Threats to family members',
    'Corporate espionage',
    'Extortion or blackmail'
  ],
  
  // ========================================================================
  // SECTION 2: Public Profile & Exposure
  // ========================================================================
  public_profile_1: 'Very High (National/international recognition, frequent media coverage)',
  public_profile_2: 'Weekly or more',
  public_profile_3: 'yes', // Subject of negative media
  public_profile_3a: 'WSJ expose on executive compensation (Jan 2024) sparked online harassment campaign. CNBC interview about layoffs went viral, received thousands of hate messages. Bloomberg profile revealed family details including school names. Recent Twitter/X trending topic after controversial merger announcement.',
  public_profile_4: [
    'LinkedIn',
    'Twitter/X',
    'Instagram'
  ],
  public_profile_5: 'Occasionally (some location tags)',
  
  // ========================================================================
  // SECTION 3: Daily Routines & Patterns
  // ========================================================================
  routines_1: 'Very predictable (same time, same routes daily)',
  routines_2: 'no', // Does NOT vary routes
  routines_3: '7:00-8:00 AM',
  routines_4: 'yes', // Has regular evening/weekend routines
  routines_4a: 'Monday/Wednesday/Friday: 6am gym at Equinox 63rd St. Saturday: 9am tennis at country club. Sunday: 11am brunch at The Smith. Daily: 6:30pm dinner at home. These patterns have been consistent for 3 years.',
  routines_5: 'Weekly or more',
  
  // ========================================================================
  // SECTION 4: Residential Security
  // ========================================================================
  residential_1: 'yes', // In gated community
  residential_2: [
    'Monitored alarm system',
    'CCTV cameras'
  ], // Missing many key controls
  residential_3: 'yes', // Home address publicly available
  residential_4: 'yes', // Has had security incidents
  residential_4a: 'Unknown person photographed property from street (Feb 2024). Suspicious vehicle parked outside for 3 consecutive days. Anonymous package delivered with no return address containing threatening message. Ring camera captured trespasser on property at 2am.',
  
  // ========================================================================
  // SECTION 5: Family & Dependents
  // ========================================================================
  family_1: 'yes', // Concerns about family safety
  family_1a: 'My wife has received threatening DMs on Instagram referencing my business decisions. Both children (12 and 15) have been photographed at school by unknown individuals. My elderly mother was approached by a "reporter" asking about my whereabouts. Wife is anxious and children are aware of security concerns.',
  family_2: 'yes', // Family has public profile
  family_3: 'yes', // Children\'s schools are publicly known
  
  // ========================================================================
  // SECTION 6: Transportation & Travel
  // ========================================================================
  transportation_1: 'Personal vehicle (self-driven)',
  transportation_2: 'no', // No armored vehicle
  transportation_3: 'Sometimes mention general destinations',
  
  // ========================================================================
  // SECTION 7: Current Security Measures
  // ========================================================================
  current_security_1: 'no', // No personal protection
  current_security_2: 'no', // No security training
  current_security_3: [
    'None'
  ] // No safety devices
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
