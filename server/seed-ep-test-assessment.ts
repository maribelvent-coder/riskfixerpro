/**
 * Seed script for creating a fully-populated Executive Protection test assessment
 * with high-risk interview responses across all sections.
 * 
 * Run with: npx tsx server/seed-ep-test-assessment.ts
 */

import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { 
  users,
  assessments,
  executiveProfiles,
  executiveInterviewResponses,
  executiveInterviewQuestions
} from '../shared/schema';

// High-risk responses mapped to question UUIDs from executive_interview_questions table
// Format: { questionUUID: { yesNoResponse?: boolean, textResponse?: string } }
const HIGH_RISK_INTERVIEW_RESPONSES: Record<string, { yesNoResponse?: boolean; textResponse?: string }> = {
  // ========================================================================
  // SECTION: Incident History & Threats (4 questions)
  // ========================================================================
  // Q1: Have you personally received many irate calls, e-mails, letters, etc.?
  'e9e8ce30-e909-4d99-a6a4-07484f504ad9': { 
    yesNoResponse: true, 
    textResponse: 'Yes, I have received numerous threatening communications. Multiple death threats via email from a terminated CFO (Marcus Reynolds) who blamed me for his indictment. He has publicly vowed revenge and is active on dark web forums discussing me. Also received anonymous letters at home with disturbingly specific details about my family\'s daily schedule. Two instances of being followed by unknown vehicles (silver sedan, reported to police). Threatening voicemails on personal cell phone from blocked numbers. I screen calls through my EA but emails come directly to me.' 
  },
  // Q2: What is the source and nature of the complaints?
  '7ef6d860-cdc4-4bd0-addf-14b372d6fc9c': { 
    yesNoResponse: true, 
    textResponse: 'Sources: (1) Former CFO Marcus Reynolds - terminated for embezzlement, made public statements threatening "consequences." (2) Obsessed individual who calls herself "Jennifer" - has sent over 200 letters, attempted physical contact at 3 public events. (3) Disgruntled investor group from failed acquisition - threatening class action and have made veiled threats. (4) Anonymous online persona tracking and posting my movements on social media. Internal: Several layoff-related complaints including one employee who stated I would "regret" the decision.' 
  },
  // Q3: Have you received any training on how to handle an irate or unusual call?
  '7032367e-87aa-4796-a260-82e393fb8c2b': { 
    yesNoResponse: false, 
    textResponse: 'No formal training received. I have never been trained on threat response protocols or how to handle threatening communications. I typically try to de-escalate or end calls quickly, but I\'m not confident I\'m handling these correctly.' 
  },
  // Q4: If no training, how do you handle these kinds of calls?
  'b0585ae7-f84a-436c-83d4-829a2fc4915f': { 
    yesNoResponse: false, 
    textResponse: 'I usually try to remain calm and end the call as quickly as possible. Sometimes I engage trying to understand what the person wants. I don\'t have a protocol for documenting these incidents or reporting them consistently. My EA keeps some notes but there\'s no formal logging system. Some threatening emails have been deleted rather than preserved for evidence.' 
  },

  // ========================================================================
  // SECTION: Executive Protection (3 questions)
  // ========================================================================
  // Q1: Do you receive any type of security close protection?
  '4b90786f-d04a-44d1-ba26-9a58406cbf42': { 
    yesNoResponse: false, 
    textResponse: 'No close protection. I currently have no personal security detail, no executive protection services, and no security driver. I travel alone to all appointments, drive myself to and from work daily, and attend public events without security escort. My wife has expressed serious concerns about this given the threats we\'ve received.' 
  },
  // Q2: If protection is provided, is it only during work-related hours?
  '9c184bb3-ac86-478c-9cdd-950109d4dc3c': { 
    yesNoResponse: false, 
    textResponse: 'N/A - No protection is currently provided at any time. I am completely unprotected during work hours, personal time, overnight, weekends, holidays, and vacations. Even during high-profile events or international travel, I have no security support.' 
  },
  // Q3: What are your feelings about the protection you are currently receiving?
  'ef46f833-3169-4ed9-b063-d00bd33f540a': { 
    yesNoResponse: false, 
    textResponse: 'Very concerned about the lack of protection. Given the active threats from the former CFO, the persistent stalker, and the online tracking, I am increasingly worried for both my safety and my family\'s safety. My wife has had panic attacks about security. I realize I need professional protection but haven\'t known where to start.' 
  },

  // ========================================================================
  // SECTION: Public Profile (2 questions)
  // ========================================================================
  // Q1: Do you notify Corporate Security if a public speaking engagement is scheduled?
  'e48b174b-c2b2-431d-a87c-3469190a4155': { 
    yesNoResponse: false, 
    textResponse: 'No, I don\'t notify anyone about public appearances. I regularly appear at industry conferences, shareholder meetings, media interviews, and charity events without informing any security personnel. My schedule for public events is often posted on the company website and shared on social media in advance.' 
  },
  // Q2: Have you felt the need for close protection at any public events?
  'bc28f2d8-3d9d-43ee-88cb-9a02da4358be': { 
    yesNoResponse: true, 
    textResponse: 'Yes, absolutely. At 3 events in the past year, the obsessed individual "Jennifer" appeared and tried to approach me. At a charity gala, she got within arm\'s length before security intervened. At a recent shareholder meeting, there were protesters specifically targeting me with signs showing my home address. During a TV interview, someone called in a threat that required police response. I feel very exposed at all public events.' 
  },

  // ========================================================================
  // SECTION: Routines & Predictability (2 questions)
  // ========================================================================
  // Q1: Do you have predictable routines or appointments?
  'b469aa65-8936-4482-a0f6-83d03e2daaa4': { 
    yesNoResponse: true, 
    textResponse: 'Highly predictable. Every weekday: Leave home 7:15am, same route to office, arrive 7:40am, same parking spot P1-Executive. Monday/Wednesday/Friday: 6am workout at Equinox on 63rd Street, same time, same locker. Every Saturday: 9am tennis at Greenwich Country Club. Every Sunday: 11am brunch at The Smith, same table. These patterns have been consistent for over 3 years with minimal variation.' 
  },
  // Q2: Do you frequent any specific restaurants, clubs, or other venues?
  '690aee5c-cf6f-4a52-8ca0-e6b88d02633a': { 
    yesNoResponse: true, 
    textResponse: 'Yes, very regular patterns. Every Wednesday dinner at Nobu, 7:30pm, always the same corner table. Friday happy hour at Capital Grille with colleagues. Saturdays at Greenwich Country Club for golf/tennis. Sunday services at First Presbyterian, same pew. Monthly board dinners at The Yale Club, same private room. All staff at these locations know me by name.' 
  },

  // ========================================================================
  // SECTION: Residences (3 questions)
  // ========================================================================
  // Q1: What type of security do you have in place at your residences?
  '0fe254f3-8158-4817-abbf-1052ebcdac92': { 
    yesNoResponse: false, 
    textResponse: 'Minimal security. Primary residence: Basic ADT alarm system (door/window sensors only), Ring video doorbell, 2 outdoor cameras with poor coverage. No 24/7 monitoring, no panic buttons, no safe room. 4-foot decorative wrought iron fence that could be easily climbed. Gate code hasn\'t been changed in 2 years and was shared with contractors. No security personnel. Vacation home in Aspen: Even less security, just basic locks.' 
  },
  // Q2: Are you familiar and comfortable with all aspects of your security?
  '651227a0-ab1a-4a87-9705-ca11799a1cc7': { 
    yesNoResponse: false, 
    textResponse: 'No. I\'m not confident in our security setup. My wife doesn\'t know how to properly arm the system. Children (12 and 15) sometimes forget to set the alarm. We had a suspicious person photographed on our property line in February 2024 and a threatening package delivered in April. Ring camera captured a trespasser at 2am in June. We don\'t feel safe but don\'t know what to improve first.' 
  },
  // Q3: Do you employ domestic staff?
  'db1c1587-b2f3-420c-9158-d806d135c108': { 
    yesNoResponse: true, 
    textResponse: 'Yes. Full-time housekeeper (5 years), part-time nanny (3 years), gardener (weekly), and pool service (bi-weekly). Only basic reference checks were done - no background investigations, no social media vetting, no credit checks. No NDAs or confidentiality agreements. All staff know our family schedule, security codes, children\'s school schedules, and travel plans. We haven\'t conducted any ongoing screening.' 
  },

  // ========================================================================
  // SECTION: Family (3 questions)
  // ========================================================================
  // Q1: Has your family received any disturbing communication?
  '12323a48-6a53-42b1-931a-2a9c41c481bd': { 
    yesNoResponse: true, 
    textResponse: 'Yes. My wife received threatening DMs on Instagram referencing my business decisions - "Your husband will pay for what he did." Both children (12 and 15) have been photographed at school by unknown individuals on at least 2 occasions - school security intervened but couldn\'t identify the photographers. My elderly mother was approached by someone claiming to be a reporter asking about my whereabouts and schedule. She gave information before realizing it was suspicious.' 
  },
  // Q2: Are there health issues with family members requiring special attention?
  'a45e7e56-140a-466e-afa2-a7f539be7962': { 
    yesNoResponse: true, 
    textResponse: 'Yes. My wife has developed anxiety disorder partly due to the ongoing security concerns - she sometimes has panic attacks. Our 12-year-old has asthma and requires access to inhalers. My 82-year-old mother lives alone and has mobility issues - she would be unable to evacuate quickly in an emergency and doesn\'t understand the severity of our security situation.' 
  },
  // Q3: Please describe routines for any school-aged children
  'fb95f476-314c-4b00-a6e7-bc10ad2b2088': { 
    yesNoResponse: true, 
    textResponse: 'Very predictable patterns. Both children attend Rye Country Day School. Drop-off: 7:45am by wife or nanny, same entrance. Pickup: 3:30pm. Son has soccer practice Tuesday/Thursday 4-6pm at Rye Recreation. Daughter has piano Wednesday 4pm at teacher\'s home studio. Both attend Sunday school 9am. Summer camp schedules are posted on family social media. Nanny handles most transportation in her personal vehicle.' 
  },

  // ========================================================================
  // SECTION: Ground Transportation (3 questions)
  // ========================================================================
  // Q1: Do you utilize a driving service or security drivers?
  'c599f91b-bf84-4998-b6ed-24c7cb6ebc13': { 
    yesNoResponse: false, 
    textResponse: 'No. I drive myself in my personal vehicle (Tesla Model S, license plate publicly visible in magazine photos). I use the same route to work every day. No security driver, no counter-surveillance training. I park in an assigned executive spot that could be easily observed. I have no evasive driving skills and the Tesla is not armored.' 
  },
  // Q2: Do you feel comfortable with your outside car service companies?
  'fd4ef81d-f1a6-4fee-818d-a9ee319b7954': { 
    yesNoResponse: false, 
    textResponse: 'When I use car services (rarely), I typically use Uber Black. No advance vetting of drivers, no pre-arranged secure services. I\'ve shared my home address with random Uber drivers. For business travel, I sometimes use corporate car service but they don\'t provide security-trained drivers.' 
  },
  // Q3: Do you utilize car services when traveling internationally?
  '3d7c7289-e646-4e39-bca3-83e3a488b410': { 
    yesNoResponse: false, 
    textResponse: 'Sometimes use hotel-arranged cars internationally but no security drivers. Have traveled to high-risk areas (parts of Latin America, Southeast Asia) using standard local transportation. No advance coordination with security firms, no secure vehicle provisions, no contingency plans. Often rely on local Uber equivalents.' 
  },

  // ========================================================================
  // SECTION: Itinerary Management (2 questions)
  // ========================================================================
  // Q1: Who has access to your daily calendar?
  '921be0dd-2f51-4d32-9b7f-91a8a44c77c2': { 
    yesNoResponse: true, 
    textResponse: 'Many people have access. My executive assistant manages my calendar and has full access. Calendar is synced to my phone which family members can sometimes see. My EA\'s assistant also has read access for scheduling. Meeting details including locations are visible. Some calendar items including dinner reservations sync to my wife\'s calendar. No one from security reviews my schedule.' 
  },
  // Q2: Are you comfortable with this arrangement?
  'd2a2dff-c97a-4dc5-9260-9e79bf08728d': { 
    yesNoResponse: false, 
    textResponse: 'Not really. I realize too many people know my exact schedule and whereabouts. My EA sometimes shares my general schedule with people calling to confirm meetings without verification. I don\'t have a protocol for who should know what level of detail about my movements. Given the active threats, this concerns me.' 
  },

  // ========================================================================
  // SECTION: Office Security (7 questions)
  // ========================================================================
  // Q1: What concerns do you have about safety in your office building?
  '40e6a7b2-d5c1-449a-be18-132945f4c600': { 
    yesNoResponse: true, 
    textResponse: 'Several concerns. The building has lobby security but a disgruntled former employee (who made threats) was able to access my floor before being stopped. Visitor logs are inconsistent. The executive floor doesn\'t have separate access control. Contractors and cleaning staff have unsupervised access to my office area. Window to my office is visible from adjacent building with direct sightline.' 
  },
  // Q2: Is your office locked at night?
  '57a56573-4c05-4a3c-994d-542567a3d012': { 
    yesNoResponse: false, 
    textResponse: 'No. My office door doesn\'t have a lock. The executive floor is theoretically badge-access but cleaning staff have unsupervised access. My desk drawers have simple locks but sensitive documents are often left out. Computer is password protected but often left logged in when I step out.' 
  },
  // Q3: Do you typically arrive before or after your EA?
  '1e2d8a37-f66c-44aa-9001-880fb0c64ce5': { 
    yesNoResponse: true, 
    textResponse: 'I arrive before my EA. I typically arrive at 7:40am and my EA arrives at 8:30am. For almost an hour each morning, I\'m alone on the executive floor (building security is in lobby only). Similarly, I often stay late after EA leaves. No one is screening visitors or monitoring my area during these times.' 
  },
  // Q4: What kind of access does cleaning staff have?
  'cd9d5184-71d5-40ea-8f23-d8d884482e20': { 
    yesNoResponse: false, 
    textResponse: 'Cleaning staff has full access to my office and the entire executive floor. They are not escorted by security. They clean between 7-10pm when many executives are still working. I don\'t know if they\'ve been vetted. I rarely see security staff on my floor - they\'re primarily stationed in the lobby.' 
  },
  // Q5: If you leave late or arrive early, do you feel comfortable?
  '9a40fdcf-e649-48d3-9cde-31a185936199': { 
    yesNoResponse: false, 
    textResponse: 'No. The parking garage is minimally lit and I have to walk a considerable distance to reach the building entrance. There\'s no security escort service. When I leave late, the garage is nearly empty. I\'ve noticed unfamiliar vehicles parked near my space on multiple occasions. One time found a note on my windshield that made me uncomfortable.' 
  },
  // Q6: Do you participate in emergency evacuation drills?
  '6e4cbeb6-4612-4463-ab61-db33267826b2': { 
    yesNoResponse: false, 
    textResponse: 'Rarely. I usually skip fire drills due to meetings. I know there\'s a stairwell near my office but I\'m not certain of the complete evacuation route. I don\'t know where the secondary exit leads. The assembly point is in a public plaza with no controlled access.' 
  },
  // Q7: Do you have a panic button at your desk?
  'ddf30a20-80c0-475b-9763-f8f189a8ed06': { 
    yesNoResponse: false, 
    textResponse: 'No panic button. No duress system. My only option would be to call 911 on my cell phone. There\'s no direct line to building security from my desk. No intercom system, no emergency buzzer.' 
  },

  // ========================================================================
  // SECTION: Travel Security (4 questions)
  // ========================================================================
  // Q1: Do you make your own travel arrangements?
  'de422290-2f6c-4e1d-9354-13a6c090feff': { 
    yesNoResponse: true, 
    textResponse: 'Mix of EA and myself. My EA books business travel but I often book personal travel directly using my personal credit card. No security review of destinations. I\'ve booked hotels in high-risk countries without consulting anyone. My frequent flyer status and hotel preferences are publicly known from interviews. I sometimes post travel photos in real-time on social media.' 
  },
  // Q2: Who helps you with needed security on trips?
  'bec98d88-901d-4d14-926b-71ac716da4a3': { 
    yesNoResponse: false, 
    textResponse: 'No one. I have no security support for travel. I travel internationally alone including to higher-risk destinations. No advance security assessments, no secure transportation arranged, no emergency extraction plans. For a recent trip to Brazil, I used regular taxis from the airport. No one from corporate security was informed of my travel.' 
  },
  // Q3: If security is provided, do you have good contact with the team?
  '68411816-7cf8-4cbe-84c5-25b08aad0882': { 
    yesNoResponse: false, 
    textResponse: 'N/A - No security team is ever provided. I travel completely without protection support. No one tracks my movements, no check-in protocols, no emergency contacts established for travel. If something happened, my family wouldn\'t know until I failed to arrive home or missed scheduled calls.' 
  },
  // Q4: Are you pleased with the level of security while traveling?
  '477c3e12-2152-43db-8211-eab6c18b0c99': { 
    yesNoResponse: false, 
    textResponse: 'Very concerned about it. Given the active threats against me, I feel very exposed when traveling. I\'ve had concerning incidents including being followed from an airport, aggressive paparazzi in London, and finding someone had photographed my hotel room door (photo posted online). I need professional travel security but don\'t have it.' 
  },

  // ========================================================================
  // SECTION: Mail & Package Security (1 question)
  // ========================================================================
  // Q1: Do you know what to do with suspicious mail/packages?
  '4c55dfe4-db93-4c83-8fa3-a3c15f6b087c': { 
    yesNoResponse: false, 
    textResponse: 'No training received. In April 2024, we received a suspicious package at home - no return address, unusual weight, hand-delivered. We weren\'t sure what to do. My wife opened it (shouldn\'t have) - it contained a threatening letter with photos of our children at school. We called police after the fact. At office, mail goes through mailroom but I don\'t know their screening protocols.' 
  },
};

async function seedEPTestAssessment() {
  console.log('🎯 Seeding Executive Protection Test Assessment...\n');
  
  // Find or create admin user
  const adminUser = await db.select()
    .from(users)
    .where(eq(users.username, 'admin'))
    .limit(1);
  
  if (adminUser.length === 0) {
    console.error('❌ Admin user not found. Please create an admin user first.');
    process.exit(1);
  }
  
  const userId = adminUser[0].id;
  console.log('📝 Creating assessment for user:', adminUser[0].username);
  
  // Check for existing test assessment
  const targetAssessmentId = '197d44c9-6ac6-4a6d-987c-d8c93d5541c5';
  const existingAssessment = await db.select()
    .from(assessments)
    .where(eq(assessments.id, targetAssessmentId))
    .limit(1);
  
  let assessmentId: string;
  
  if (existingAssessment.length > 0) {
    assessmentId = existingAssessment[0].id;
    console.log('♻️  Using existing test assessment:', assessmentId);
    
    // Update to executive template if needed
    await db.update(assessments)
      .set({
        templateId: 'executive-protection',
        surveyParadigm: 'executive',
        title: 'EP Assessment - Jonathan Sterling III',
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, assessmentId));
  } else {
    // Create new assessment
    const [newAssessment] = await db.insert(assessments)
      .values({
        userId: userId,
        templateId: 'executive-protection',
        surveyParadigm: 'executive',
        title: 'EP Assessment - Jonathan Sterling III',
        location: 'New York, NY',
        assessor: 'Security Assessment Team',
        status: 'in_progress',
      })
      .returning();
    
    assessmentId = newAssessment.id;
    console.log('✨ Created new assessment:', assessmentId);
  }
  
  // Update or create executive profile
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
        knownThreats: 'Terminated CFO with vendetta, online stalker who identified home address, disgruntled investor group',
        previousIncidents: 'Death threats from former CFO, 200+ letters from obsessed fan, suspicious package with threatening note, trespasser at residence, photographers at children\'s school',
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
        knownThreats: 'Terminated CFO with vendetta, online stalker who identified home address, disgruntled investor group',
        previousIncidents: 'Death threats from former CFO, 200+ letters from obsessed fan, suspicious package with threatening note, trespasser at residence, photographers at children\'s school',
      });
    console.log('📋 Created executive profile');
  }
  
  // First, delete existing responses for this assessment to start fresh
  await db.delete(executiveInterviewResponses)
    .where(eq(executiveInterviewResponses.assessmentId, assessmentId));
  console.log('🧹 Cleared existing interview responses');
  
  // Insert interview responses
  console.log('\n📝 Inserting interview responses...');
  let insertedCount = 0;
  let errorCount = 0;
  
  for (const [questionId, response] of Object.entries(HIGH_RISK_INTERVIEW_RESPONSES)) {
    try {
      await db.insert(executiveInterviewResponses)
        .values({
          assessmentId: assessmentId,
          questionId: questionId,
          yesNoResponse: response.yesNoResponse,
          textResponse: response.textResponse,
        });
      insertedCount++;
    } catch (err: any) {
      console.error(`❌ Failed to insert response for question ${questionId}:`, err.message);
      errorCount++;
    }
  }
  
  console.log(`\n✅ Inserted ${insertedCount} interview responses`);
  if (errorCount > 0) {
    console.log(`⚠️  Failed to insert ${errorCount} responses`);
  }
  
  console.log(`\n🎉 EP Test Assessment seeded successfully!`);
  console.log(`\n📊 Assessment ID: ${assessmentId}`);
  console.log(`\n🔗 To view the dashboard, navigate to:`);
  console.log(`   /assessments/${assessmentId}/executive`);
  console.log(`\n💡 Click "Generate AI Risk Analysis" to populate the threat matrix.`);
  
  console.log('\n✅ Seeding complete!');
  process.exit(0);
}

seedEPTestAssessment().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
