import { db } from './db';

const criticalControls = [
  // Data Center Critical Controls
  { name: 'Incident Response Plan (Documented)', category: 'procedural', control_type: 'preventive', description: 'Written incident response procedures with defined roles, escalation paths, communication protocols, and step-by-step response actions.', base_weight: 0.18, reduction_percentage: 0.25, estimated_cost: 'low', maintenance_level: 'medium', requires_training: true, requires_maintenance: false, is_active: true },
  { name: 'Business Continuity Plan (Tested)', category: 'procedural', control_type: 'preventive', description: 'Documented business continuity procedures tested annually with tabletop exercises. Includes RTO/RPO objectives.', base_weight: 0.20, reduction_percentage: 0.28, estimated_cost: 'low', maintenance_level: 'medium', requires_training: true, requires_maintenance: false, is_active: true },
  { name: 'Disaster Recovery Site', category: 'business_continuity', control_type: 'preventive', description: 'Geographically separate facility capable of assuming operations during primary site failure.', base_weight: 0.30, reduction_percentage: 0.40, estimated_cost: 'high', maintenance_level: 'high', requires_training: true, requires_maintenance: true, is_active: true },
  // Warehouse Critical Controls
  { name: 'Machine Guarding & Safety Interlocks', category: 'safety', control_type: 'preventive', description: 'Physical guards and electronic interlocks preventing access to hazardous equipment during operation.', base_weight: 0.25, reduction_percentage: 0.32, estimated_cost: 'medium', maintenance_level: 'medium', requires_training: true, requires_maintenance: true, is_active: true },
  { name: 'Warehouse Management System (WMS)', category: 'technology', control_type: 'detective', description: 'Software system tracking inventory location, movement, and status with audit trail capabilities.', base_weight: 0.20, reduction_percentage: 0.28, estimated_cost: 'medium', maintenance_level: 'medium', requires_training: true, requires_maintenance: true, is_active: true },
  { name: 'Hazmat Storage & Handling Procedures', category: 'procedural', control_type: 'preventive', description: 'Documented procedures for storage, handling, and emergency response for hazardous materials per OSHA/EPA requirements.', base_weight: 0.18, reduction_percentage: 0.25, estimated_cost: 'low', maintenance_level: 'medium', requires_training: true, requires_maintenance: false, is_active: true },
];

console.log('Starting critical missing controls seed...');

const stmt = db.prepare(`
  INSERT INTO controls (
    name, category, control_type, description, base_weight,
    reduction_percentage, estimated_cost, maintenance_level,
    requires_training, requires_maintenance, is_active
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let added = 0;
for (const control of criticalControls) {
  try {
    stmt.run(
      control.name,
      control.category,
      control.control_type,
      control.description,
      control.base_weight,
      control.reduction_percentage,
      control.estimated_cost,
      control.maintenance_level,
      control.requires_training ? 1 : 0,
      control.requires_maintenance ? 1 : 0,
      control.is_active ? 1 : 0
    );
    added++;
    console.log(`✅ Added: ${control.name}`);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint')) {
      console.log(`⚠️  Already exists: ${control.name}`);
    } else {
      console.error(`❌ Error adding ${control.name}:`, err.message);
    }
  }
}

console.log(`\n✅ Critical controls seed complete! Added ${added} controls.`);
