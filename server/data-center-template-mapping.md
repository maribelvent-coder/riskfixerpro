# Data Center Template: Threat → Control → Question Mapping

## Purpose
Map high-security data center threats to controls and assessment questions.

---

## 1. Unauthorized Entry
**Threat:** Intrusion into secure data center areas

**Mitigating Controls:**
- Biometric Access Control
- Card Access System
- Man Trap/Vestibule
- Motion Detectors - PIR
- Alarm Monitoring Service

**Survey Questions:**
1. **Multi-Factor Access**
   - Q: "Is biometric access control (fingerprint, retina, facial) implemented at data center entry?"
   - Type: Yes/No
   - If Yes: "Rate biometric system reliability and coverage (1-5)"
   - Evidence: Photo of biometric reader
   - Control: Biometric Access Control

2. **Vestibule Entry**
   - Q: "Is a man-trap or security vestibule installed at main data center entrance?"
   - Type: Yes/No
   - If Yes: "Rate man-trap effectiveness in preventing tailgating (1-5)"
   - Evidence: Photo of vestibule
   - Control: Man Trap/Vestibule

3. **Motion Detection**
   - Q: "Are motion detectors installed in server halls and restricted areas?"
   - Type: Yes/No
   - If Yes: "Rate motion detection coverage (1-5)"
   - Evidence: Security zone map
   - Control: Motion Detectors - PIR

---

## 2. Data Breach - Physical Access
**Threat:** Theft or tampering with data via physical access to servers

**Mitigating Controls:**
- Biometric Access Control
- Card Access System
- CCTV System - IP/Network
- Video Monitoring Station
- Visitor Escort Policy

**Survey Questions:**
4. **Server Area Access**
   - Q: "Is access to server racks restricted to authorized personnel only?"
   - Type: Yes/No
   - If Yes: "Rate rack-level access control effectiveness (1-5)"
   - Evidence: Photo of locked server cages
   - Control: Card Access System

5. **24/7 Video Monitoring**
   - Q: "Is CCTV monitored continuously at a security operations center?"
   - Type: Yes/No
   - If Yes: "Rate video monitoring responsiveness (1-5)"
   - Evidence: SOC monitoring logs
   - Control: Video Monitoring Station

6. **Visitor Escort**
   - Q: "Are all visitors and vendors escorted 100% of the time in data center areas?"
   - Type: Yes/No
   - If Yes: "Rate visitor escort policy enforcement (1-5)"
   - Evidence: Visitor escort log
   - Control: Visitor Escort Policy

---

## 3. Intellectual Property Theft
**Threat:** Theft of sensitive data or proprietary systems

**Mitigating Controls:**
- Biometric Access Control
- Background Checks
- CCTV System - IP/Network

**Survey Questions:**
7. **Personnel Screening**
   - Q: "Are background checks and security clearances required for data center staff?"
   - Type: Yes/No
   - If Yes: "Rate screening thoroughness (1-5)"
   - Evidence: Security clearance policy
   - Control: Background Checks

---

## 4. Insider Threat
**Threat:** Malicious activity by employees with authorized access

**Mitigating Controls:**
- Background Checks
- CCTV System - IP/Network
- Video Monitoring Station
- Visitor Escort Policy

**Survey Questions:**
8. **Activity Monitoring**
   - Q: "Are employee activities in server areas continuously monitored via CCTV?"
   - Type: Yes/No
   - If Yes: "Rate monitoring effectiveness in detecting anomalies (1-5)"
   - Evidence: Camera coverage map
   - Control: CCTV System - IP/Network

---

## 5. Environmental System Failure
**Threat:** HVAC, cooling, or humidity control failures

**Mitigating Controls:**
- Environmental Monitoring System
- Redundant Power Systems (UPS/Generator)

**Survey Questions:**
9. **Environmental Sensors**
   - Q: "Are temperature, humidity, and water leak sensors installed throughout the data center?"
   - Type: Yes/No
   - If Yes: "Rate environmental monitoring coverage and alerting (1-5)"
   - Evidence: Sensor layout map
   - Control: Environmental Monitoring System

10. **HVAC Redundancy**
    - Q: "Are redundant HVAC and cooling systems in place with automatic failover?"
    - Type: Yes/No
    - If Yes: "Rate HVAC redundancy and reliability (1-5)"
    - Evidence: HVAC system diagram
    - Control: Environmental Monitoring System

---

## 6. Fire Hazard
**Threat:** Fire damage to servers and infrastructure

**Mitigating Controls:**
- Fire Alarm System
- Fire Suppression System

**Survey Questions:**
11. **Fire Detection**
    - Q: "Is early smoke detection (VESDA or similar) installed in server areas?"
    - Type: Yes/No
    - If Yes: "Rate fire detection sensitivity and coverage (1-5)"
    - Evidence: Fire detection system specs
    - Control: Fire Alarm System

12. **Gas Suppression**
    - Q: "Is gas-based fire suppression (FM-200, Inergen) installed instead of water sprinklers?"
    - Type: Yes/No
    - If Yes: "Rate suppression system adequacy (1-5)"
    - Evidence: Suppression system certificate
    - Control: Fire Suppression System

---

## 7. Flood
**Threat:** Water damage from flooding or leaks

**Mitigating Controls:**
- Environmental Monitoring System
- Fire Suppression System

**Survey Questions:**
13. **Water Detection**
    - Q: "Are water leak detection sensors installed under raised floors and near cooling equipment?"
    - Type: Yes/No
    - If Yes: "Rate water leak detection coverage (1-5)"
    - Evidence: Leak sensor map
    - Control: Environmental Monitoring System

---

## 8. Earthquake
**Threat:** Seismic damage to infrastructure

**Mitigating Controls:**
- (Structural hardening - not in control_library but question can assess)

**Survey Questions:**
14. **Seismic Protection**
    - Q: "Are server racks bolted to the floor and equipped with seismic bracing?"
    - Type: Yes/No
    - If Yes: "Rate seismic hardening measures (1-5)"
    - Evidence: Photo of rack anchoring
    - Control: N/A (structural - no control_library entry)

---

## 9. Tailgating
**Threat:** Unauthorized persons following authorized entry

**Mitigating Controls:**
- Man Trap/Vestibule
- Biometric Access Control
- CCTV System - IP/Network

**Survey Questions:**
15. **Anti-Tailgating**
    - Q: "Does the man-trap or turnstile prevent more than one person entry per credential?"
    - Type: Yes/No
    - If Yes: "Rate anti-tailgating effectiveness (1-5)"
    - Evidence: Man-trap specifications
    - Control: Man Trap/Vestibule

---

## 10. Equipment Sabotage
**Threat:** Intentional damage to servers or infrastructure

**Mitigating Controls:**
- CCTV System - IP/Network
- Video Monitoring Station
- Background Checks

**Survey Questions:**
16. **Tamper Detection**
    - Q: "Are server cabinets equipped with tamper alerts or cabinet intrusion detection?"
    - Type: Yes/No
    - If Yes: "Rate tamper detection effectiveness (1-5)"
    - Evidence: Cabinet alarm logs
    - Control: CCTV System - IP/Network

---

## 11. ICS/SCADA Attack
**Threat:** Cyberattack on building management systems

**Mitigating Controls:**
- Network Segmentation
- Biometric Access Control

**Survey Questions:**
17. **Network Isolation**
    - Q: "Are building management systems (BMS/SCADA) network-segmented from corporate and internet access?"
    - Type: Yes/No
    - If Yes: "Rate network segmentation effectiveness (1-5)"
    - Evidence: Network diagram
    - Control: Network Segmentation

18. **BMS Access Control**
    - Q: "Is physical access to BMS control panels restricted and logged?"
    - Type: Yes/No
    - If Yes: "Rate BMS physical access control (1-5)"
    - Evidence: BMS access logs
    - Control: Card Access System

---

## Power Continuity (Cross-Threat Control)
**Threat Mitigated:** Environmental System Failure, Equipment Failure

**Mitigating Controls:**
- Redundant Power Systems (UPS/Generator)

**Survey Questions:**
19. **UPS Systems**
    - Q: "Are Uninterruptible Power Supply (UPS) systems installed with sufficient capacity for critical load?"
    - Type: Yes/No
    - If Yes: "Rate UPS capacity and reliability (1-5)"
    - Evidence: UPS load test reports
    - Control: Redundant Power Systems (UPS/Generator)

20. **Generator Backup**
    - Q: "Is backup generator installed and tested regularly to support extended outages?"
    - Type: Yes/No
    - If Yes: "Rate generator reliability and testing frequency (1-5)"
    - Evidence: Generator test logs
    - Control: Redundant Power Systems (UPS/Generator)

---

## Summary
**Total Questions:** 20
**Unique Controls Assessed:** 14
- Biometric Access Control
- Card Access System
- Man Trap/Vestibule
- CCTV System - IP/Network
- Video Monitoring Station
- Alarm Monitoring Service
- Motion Detectors - PIR
- Environmental Monitoring System
- Fire Alarm System
- Fire Suppression System
- Redundant Power Systems (UPS/Generator)
- Background Checks
- Visitor Escort Policy
- Network Segmentation

**Threats Covered:** All 11 data center commonRisks
