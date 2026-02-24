// seed.js — Full database population with doctor-patient assignments
const { run, get, all } = require("./database");

// ─── 1. USERS ─────────────────────────────────────────────────────────────────
const sampleUsers = [
  // Doctors
  { email: "dr.rajesh@ehr.com",   name: "Dr. Rajesh Kumar",    role: "doctor",  phone: "9876543210", department: "Cardiology",      trustScore: 88 },
  { email: "dr.priya@ehr.com",    name: "Dr. Priya Sharma",    role: "doctor",  phone: "9876543211", department: "Neurology",       trustScore: 92 },
  { email: "dr.arun@ehr.com",     name: "Dr. Arun Mehta",      role: "doctor",  phone: "9876543217", department: "Orthopedics",     trustScore: 85 },
  { email: "dr.sunita@ehr.com",   name: "Dr. Sunita Iyer",     role: "doctor",  phone: "9876543218", department: "Pulmonology",     trustScore: 90 },
  { email: "dr.vikram@ehr.com",   name: "Dr. Vikram Rao",      role: "doctor",  phone: "9876543219", department: "Gastroenterology",trustScore: 87 },
  // Nurses
  { email: "nurse.ananya@ehr.com",  name: "Ananya Verma",    role: "nurse", phone: "9876543212", department: "ICU",       trustScore: 75 },
  { email: "nurse.deepika@ehr.com", name: "Deepika Singh",   role: "nurse", phone: "9876543213", department: "Emergency", trustScore: 80 },
  { email: "nurse.kavita@ehr.com",  name: "Kavita Nair",     role: "nurse", phone: "9876543226", department: "Cardiology",trustScore: 78 },
  { email: "nurse.ritu@ehr.com",    name: "Ritu Bhatia",     role: "nurse", phone: "9876543227", department: "Neurology", trustScore: 76 },
  // Admin
  { email: "admin@ehr.com",         name: "Admin User",      role: "admin", phone: "9876543216", department: "Administration", trustScore: 100 },
  // Sample Patients (user accounts)
  { email: "patient.amit@ehr.com",  name: "Amit Patel",      role: "patient", phone: "9876543214", trustScore: 50 },
  { email: "patient.neha@ehr.com",  name: "Neha Desai",      role: "patient", phone: "9876543215", trustScore: 55 },
];

// ─── 2. PATIENTS ──────────────────────────────────────────────────────────────
// Each patient has: name, age, gender, diagnosis, treatment, notes, doctor assigned
const samplePatients = [
  // ── Dr. Rajesh Kumar (Cardiology) ──
  {
    patientName: "Arjun Gupta",
    age: 52, gender: "Male",
    patient_email: "arjun.gupta@gmail.com",
    medicalHistory: JSON.stringify(["Hypertension", "Type 2 Diabetes", "Hyperlipidemia"]),
    emergencyContact: JSON.stringify({ name: "Priya Gupta", phone: "9876543220", relation: "Wife" }),
    diagnosis: "Coronary Artery Disease with stable angina",
    treatment: "Aspirin 75mg OD, Atorvastatin 40mg OD, Metoprolol 25mg BD, dietary modifications, bi-weekly ECG monitoring",
    notes: "Patient shows significant improvement after 3 months of therapy. BP controlled at 130/82 mmHg. Follow-up in 4 weeks.",
    doctor_name: "Dr. Rajesh Kumar",
    createdBy: "dr.rajesh@ehr.com"
  },
  {
    patientName: "Rohan Reddy",
    age: 61, gender: "Male",
    patient_email: "rohan.reddy@gmail.com",
    medicalHistory: JSON.stringify(["Heart Failure", "High Cholesterol", "Atrial Fibrillation"]),
    emergencyContact: JSON.stringify({ name: "Sunita Reddy", phone: "9876543222", relation: "Wife" }),
    diagnosis: "Congestive Heart Failure (NYHA Class II), Paroxysmal AF",
    treatment: "Furosemide 40mg OD, Ramipril 5mg OD, Bisoprolol 5mg OD, Warfarin 5mg OD (INR monitoring). Echo every 6 months.",
    notes: "EF improved from 35% to 42% over 6 months. INR maintained at 2.3. Referred for EP study.",
    doctor_name: "Dr. Rajesh Kumar",
    createdBy: "dr.rajesh@ehr.com"
  },
  {
    patientName: "Divya Sharma",
    age: 38, gender: "Female",
    patient_email: "divya.sharma@gmail.com",
    medicalHistory: JSON.stringify(["Hypertensive Heart Disease", "Obesity"]),
    emergencyContact: JSON.stringify({ name: "Arun Sharma", phone: "9876543225", relation: "Husband" }),
    diagnosis: "Hypertensive heart disease with LV hypertrophy",
    treatment: "Amlodipine 5mg OD, Losartan 50mg OD, weight management program, DASH diet counselling",
    notes: "LV mass index normalizing. Weight reduced by 6kg. BP 124/78 mmHg on last visit.",
    doctor_name: "Dr. Rajesh Kumar",
    createdBy: "dr.rajesh@ehr.com"
  },

  {
    patientName: "Anjali Nair",
    age: 34, gender: "Female",
    patient_email: "anjali.nair@gmail.com",
    medicalHistory: JSON.stringify(["Migraine with Aura", "Anxiety Disorder"]),
    emergencyContact: JSON.stringify({ name: "Vikram Nair", phone: "9876543221", relation: "Husband" }),
    diagnosis: "Chronic Migraine with aura (≥15 days/month), Generalized Anxiety Disorder",
    treatment: "Topiramate 50mg BD (prophylaxis), Sumatriptan 50mg PRN (acute), Escitalopram 10mg OD for anxiety. Neuropsychology referral.",
    notes: "Migraine frequency reduced from 18 to 9 days/month. Sleep hygiene counselled. Next EEG in 3 months.",
    doctor_name: "Dr. Priya Sharma",
    createdBy: "dr.priya@ehr.com"
  },
  {
    patientName: "Meera Joshi",
    age: 29, gender: "Female",
    patient_email: "meera.joshi@gmail.com",
    medicalHistory: JSON.stringify(["Epilepsy (JME)", "Iron Deficiency Anaemia"]),
    emergencyContact: JSON.stringify({ name: "Hemant Joshi", phone: "9876543223", relation: "Father" }),
    diagnosis: "Juvenile Myoclonic Epilepsy — well controlled on Sodium Valproate",
    treatment: "Sodium Valproate 500mg BD. Avoid sleep deprivation. Driving restrictions advised. Iron supplementation.",
    notes: "Seizure-free for 14 months. VPA levels 68 µg/mL (therapeutic). LFTs normal. Next review in 6 months.",
    doctor_name: "Dr. Priya Sharma",
    createdBy: "dr.priya@ehr.com"
  },
  {
    patientName: "Karan Malhotra",
    age: 44, gender: "Male",
    patient_email: "karan.malhotra@gmail.com",
    medicalHistory: JSON.stringify(["Parkinson's Disease (Early Stage)", "Hypertension"]),
    emergencyContact: JSON.stringify({ name: "Sonia Malhotra", phone: "9876543228", relation: "Wife" }),
    diagnosis: "Parkinson's Disease — Hoehn and Yahr Stage 2",
    treatment: "Levodopa-Carbidopa 100/25mg TDS, Pramipexole 0.5mg OD. Physiotherapy twice weekly. Occupational therapy referral.",
    notes: "UPDRS motor score 22. Tremor controlled. Gait improving with PT. Patient counselled on fall prevention.",
    doctor_name: "Dr. Priya Sharma",
    createdBy: "dr.priya@ehr.com"
  },

  // ── Dr. Arun Mehta (Orthopedics) ──
  {
    patientName: "Vikram Singh",
    age: 55, gender: "Male",
    patient_email: "vikram.singh@gmail.com",
    medicalHistory: JSON.stringify(["Osteoarthritis (Bilateral Knee)", "Gout"]),
    emergencyContact: JSON.stringify({ name: "Kavya Singh", phone: "9876543224", relation: "Wife" }),
    diagnosis: "Severe bilateral knee osteoarthritis (K-L Grade III), Gouty arthritis — right great toe",
    treatment: "Etoricoxib 60mg OD, Febuxostat 40mg OD. Intra-articular hyaluronate injections (right knee). Physiotherapy. Surgical review in 3 months.",
    notes: "VAS pain score improved from 8/10 to 4/10. Serum uric acid 5.8 mg/dL. Candidate for TKR evaluation.",
    doctor_name: "Dr. Arun Mehta",
    createdBy: "dr.arun@ehr.com"
  },
  {
    patientName: "Pooja Iyer",
    age: 30, gender: "Female",
    patient_email: "pooja.iyer@gmail.com",
    medicalHistory: JSON.stringify(["ACL Tear — Right Knee", "Patellofemoral Syndrome"]),
    emergencyContact: JSON.stringify({ name: "Suresh Iyer", phone: "9876543229", relation: "Father" }),
    diagnosis: "Complete ACL rupture (right knee) with associated medial meniscal tear",
    treatment: "Post-ACL reconstruction (arthroscopic). Brace for 6 weeks. Aggressive rehab protocol — Weeks 1-12 PT. Return to sport at 9 months.",
    notes: "3 months post-op. Quad strength at 75% of contra-lateral. Pivot shift negative. Progressing well in rehab.",
    doctor_name: "Dr. Arun Mehta",
    createdBy: "dr.arun@ehr.com"
  },
  {
    patientName: "Rajendra Bose",
    age: 68, gender: "Male",
    patient_email: "rajendra.bose@gmail.com",
    medicalHistory: JSON.stringify(["Lumbar Spondylosis", "Osteoporosis", "Type 2 Diabetes"]),
    emergencyContact: JSON.stringify({ name: "Meena Bose", phone: "9876543230", relation: "Wife" }),
    diagnosis: "L4-L5 disc herniation with radiculopathy. Severe osteoporosis (T-score -3.1)",
    treatment: "Methylprednisolone epidural injection (L4-L5). Zoledronic acid infusion annually. Calcium 1200mg + Vit D3 2000IU daily. Lumbar support. Physiotherapy.",
    notes: "Leg pain VAS 3/10 (improved from 7/10). DEXA re-eval in 12 months. Controlled ambulation. No surgical indication currently.",
    doctor_name: "Dr. Arun Mehta",
    createdBy: "dr.arun@ehr.com"
  },

  // ── Dr. Sunita Iyer (Pulmonology) ──
  {
    patientName: "Sanjay Mishra",
    age: 48, gender: "Male",
    patient_email: "sanjay.mishra@gmail.com",
    medicalHistory: JSON.stringify(["COPD (Stage III)", "Ex-smoker (40 pack-years)", "Hypertension"]),
    emergencyContact: JSON.stringify({ name: "Lata Mishra", phone: "9876543231", relation: "Wife" }),
    diagnosis: "COPD — GOLD Stage III (Severe), post-COVID-19 pulmonary fibrosis (mild)",
    treatment:
      "Tiotropium 18µg inhaler OD, Salmeterol/Fluticasone 50/500 BD, Carbocisteine 375mg TDS. Pulmonary rehabilitation. Home O2 PRN. Flu vaccine annually.",
    notes: "FEV1 42% predicted. 6MWT: 310m. Exacerbation-free for 7 months. Enrolled in pulmonary rehab programme.",
    doctor_name: "Dr. Sunita Iyer",
    createdBy: "dr.sunita@ehr.com"
  },
  {
    patientName: "Lalitha Krishnan",
    age: 42, gender: "Female",
    patient_email: "lalitha.k@gmail.com",
    medicalHistory: JSON.stringify(["Bronchial Asthma (Moderate Persistent)", "Allergic Rhinitis"]),
    emergencyContact: JSON.stringify({ name: "Ramesh Krishnan", phone: "9876543232", relation: "Husband" }),
    diagnosis: "Moderate persistent bronchial asthma — partially controlled. Allergic rhinosinusitis.",
    treatment: "Budesonide/Formoterol 160/4.5 BD (maintenance + reliever), Montelukast 10mg OD, Intranasal fluticasone spray. Allergen avoidance counselling.",
    notes: "ACT score 18 (partially controlled). Night awakenings reduced. PEFR variability 15%. Spirometry stable.",
    doctor_name: "Dr. Sunita Iyer",
    createdBy: "dr.sunita@ehr.com"
  },

  // ── Dr. Vikram Rao (Gastroenterology) ──
  {
    patientName: "Nikhil Kapoor",
    age: 36, gender: "Male",
    patient_email: "nikhil.kapoor@gmail.com",
    medicalHistory: JSON.stringify(["Crohn's Disease", "Iron Deficiency", "Vitamin B12 Deficiency"]),
    emergencyContact: JSON.stringify({ name: "Ritu Kapoor", phone: "9876543233", relation: "Wife" }),
    diagnosis: "Crohn's disease — ileal, moderate-to-severe activity (CDAI 280). Nutritional deficiencies.",
    treatment: "Azathioprine 2mg/kg OD, Prednisolone 30mg taper, Adalimumab 40mg bi-weekly (pending approval). IV Iron sucrose. B12 IM monthly. Low-residue diet.",
    notes: "CRP 38 mg/L (down from 72). Faecal calprotectin 640 µg/g. MR enterography: improvement in bowel wall enhancement.",
    doctor_name: "Dr. Vikram Rao",
    createdBy: "dr.vikram@ehr.com"
  },
  {
    patientName: "Shreya Patel",
    age: 27, gender: "Female",
    patient_email: "shreya.patel@gmail.com",
    medicalHistory: JSON.stringify(["Irritable Bowel Syndrome", "Anxiety", "GERD"]),
    emergencyContact: JSON.stringify({ name: "Manish Patel", phone: "9876543234", relation: "Father" }),
    diagnosis: "IBS-D (diarrhoea-predominant) meeting Rome IV criteria, GERD — LA Grade B",
    treatment: "Loperamide 2mg PRN, Mebeverine 135mg TDS, Pantoprazole 40mg OD AC. Gut-directed CBT referral. Low-FODMAP diet education.",
    notes: "BSS Type 6→3 on low-FODMAP. Anxiety management improving. GERD symptoms controlled with PPI. Review in 8 weeks.",
    doctor_name: "Dr. Vikram Rao",
    createdBy: "dr.vikram@ehr.com"
  },
  {
    patientName: "Amit Patel",
    age: 40, gender: "Male",
    patient_email: "patient.amit@ehr.com",
    medicalHistory: JSON.stringify(["Chronic Hepatitis B", "Fatty Liver (Grade 2)", "Hypertension"]),
    emergencyContact: JSON.stringify({ name: "Seema Patel", phone: "9876543214", relation: "Wife" }),
    diagnosis: "Chronic Hepatitis B — HBeAg negative, HBV DNA 2800 IU/mL. NAFLD Grade 2.",
    treatment: "Tenofovir 300mg OD. Lifestyle modification — weight loss target 8kg. Avoid alcohol. LFTs and HBV DNA q3 monthly.",
    notes: "HBV DNA declining (from 18,000 IU/mL). AST/ALT normal. Fibroscan: F2 (7.2 kPa). USG abdomen — Grade 1 NAFLD on 3-month follow-up.",
    doctor_name: "Dr. Vikram Rao",
    createdBy: "dr.vikram@ehr.com"
  }
];

// ─── 3. ACCESS REQUESTS (doctor-patient approved access) ─────────────────────
// Built dynamically after patient IDs are known — see seedDatabase()

// ─── 4. ACCESS LOGS ───────────────────────────────────────────────────────────
const buildAccessLogs = (patientIdMap) => [
  // Dr. Rajesh — Cardiology
  { name: "Dr. Rajesh Kumar", role: "doctor",  patientId: patientIdMap["Arjun Gupta"],    action: "VIEW_RECORD",    reason: "Routine cardiology follow-up",                  ip: "192.168.1.100", doctor_name: "Dr. Rajesh Kumar", patient_name: "Arjun Gupta",    status: "Success", hoursAgo: 2   },
  { name: "Dr. Rajesh Kumar", role: "doctor",  patientId: patientIdMap["Rohan Reddy"],    action: "UPDATE_RECORD",  reason: "Updated INR result and medication dose",         ip: "192.168.1.100", doctor_name: "Dr. Rajesh Kumar", patient_name: "Rohan Reddy",    status: "Success", hoursAgo: 5   },
  { name: "Dr. Rajesh Kumar", role: "doctor",  patientId: patientIdMap["Divya Sharma"],   action: "VIEW_RECORD",    reason: "BP review and medication adjustment",            ip: "192.168.1.100", doctor_name: "Dr. Rajesh Kumar", patient_name: "Divya Sharma",   status: "Success", hoursAgo: 26  },
  { name: "Kavita Nair",      role: "nurse",   patientId: patientIdMap["Arjun Gupta"],    action: "VIEW_RECORD",    reason: "Pre-procedure vitals check",                    ip: "192.168.1.105", doctor_name: "Dr. Rajesh Kumar", patient_name: "Arjun Gupta",    status: "Success", hoursAgo: 1   },
  { name: "Kavita Nair",      role: "nurse",   patientId: patientIdMap["Rohan Reddy"],    action: "UPDATE_VITALS",  reason: "Updated daily vitals and fluid balance",        ip: "192.168.1.105", doctor_name: "Dr. Rajesh Kumar", patient_name: "Rohan Reddy",    status: "Success", hoursAgo: 3   },

  // Dr. Priya — Neurology
  { name: "Dr. Priya Sharma", role: "doctor",  patientId: patientIdMap["Anjali Nair"],    action: "VIEW_RECORD",    reason: "Migraine follow-up, trigger diary review",      ip: "192.168.1.101", doctor_name: "Dr. Priya Sharma", patient_name: "Anjali Nair",    status: "Success", hoursAgo: 4   },
  { name: "Dr. Priya Sharma", role: "doctor",  patientId: patientIdMap["Meera Joshi"],    action: "VIEW_RECORD",    reason: "Epilepsy medication review, VPA levels",        ip: "192.168.1.101", doctor_name: "Dr. Priya Sharma", patient_name: "Meera Joshi",    status: "Success", hoursAgo: 8   },
  { name: "Dr. Priya Sharma", role: "doctor",  patientId: patientIdMap["Karan Malhotra"], action: "UPDATE_RECORD",  reason: "UPDRS assessment update, PT notes added",       ip: "192.168.1.101", doctor_name: "Dr. Priya Sharma", patient_name: "Karan Malhotra", status: "Success", hoursAgo: 12  },
  { name: "Ritu Bhatia",      role: "nurse",   patientId: patientIdMap["Karan Malhotra"], action: "VIEW_RECORD",    reason: "Assist physiotherapy session",                  ip: "192.168.1.106", doctor_name: "Dr. Priya Sharma", patient_name: "Karan Malhotra", status: "Success", hoursAgo: 11  },

  // Dr. Arun — Orthopedics
  { name: "Dr. Arun Mehta",   role: "doctor",  patientId: patientIdMap["Vikram Singh"],   action: "VIEW_RECORD",    reason: "Orthopedic OPD review — knee pain",             ip: "192.168.1.102", doctor_name: "Dr. Arun Mehta",   patient_name: "Vikram Singh",   status: "Success", hoursAgo: 6   },
  { name: "Dr. Arun Mehta",   role: "doctor",  patientId: patientIdMap["Pooja Iyer"],     action: "UPDATE_RECORD",  reason: "Post-op ACL rehab progress note",               ip: "192.168.1.102", doctor_name: "Dr. Arun Mehta",   patient_name: "Pooja Iyer",     status: "Success", hoursAgo: 10  },
  { name: "Dr. Arun Mehta",   role: "doctor",  patientId: patientIdMap["Rajendra Bose"],  action: "VIEW_RECORD",    reason: "DEXA scan results review, osteoporosis mgmt",   ip: "192.168.1.102", doctor_name: "Dr. Arun Mehta",   patient_name: "Rajendra Bose",  status: "Success", hoursAgo: 30  },
  { name: "Ananya Verma",     role: "nurse",   patientId: patientIdMap["Pooja Iyer"],     action: "UPDATE_VITALS",  reason: "Post-op day 1 vitals and wound assessment",     ip: "192.168.1.103", doctor_name: "Dr. Arun Mehta",   patient_name: "Pooja Iyer",     status: "Success", hoursAgo: 9   },

  // Dr. Sunita — Pulmonology
  { name: "Dr. Sunita Iyer",  role: "doctor",  patientId: patientIdMap["Sanjay Mishra"],  action: "VIEW_RECORD",    reason: "COPD exacerbation review, spirometry",          ip: "192.168.1.107", doctor_name: "Dr. Sunita Iyer",  patient_name: "Sanjay Mishra",  status: "Success", hoursAgo: 7   },
  { name: "Dr. Sunita Iyer",  role: "doctor",  patientId: patientIdMap["Lalitha Krishnan"],action: "UPDATE_RECORD", reason: "Asthma control assessment, ACT score updated",  ip: "192.168.1.107", doctor_name: "Dr. Sunita Iyer",  patient_name: "Lalitha Krishnan",status:"Success", hoursAgo: 20  },
  { name: "Deepika Singh",    role: "nurse",   patientId: patientIdMap["Sanjay Mishra"],  action: "VIEW_RECORD",    reason: "Nebulisation session monitoring",               ip: "192.168.1.104", doctor_name: "Dr. Sunita Iyer",  patient_name: "Sanjay Mishra",  status: "Success", hoursAgo: 6   },

  // Dr. Vikram — Gastroenterology
  { name: "Dr. Vikram Rao",   role: "doctor",  patientId: patientIdMap["Nikhil Kapoor"],  action: "VIEW_RECORD",    reason: "Crohn's disease — biologics response evaluation",ip: "192.168.1.108",doctor_name: "Dr. Vikram Rao",   patient_name: "Nikhil Kapoor",  status: "Success", hoursAgo: 14  },
  { name: "Dr. Vikram Rao",   role: "doctor",  patientId: patientIdMap["Shreya Patel"],   action: "VIEW_RECORD",    reason: "IBS-D review, dietary response check",          ip: "192.168.1.108", doctor_name: "Dr. Vikram Rao",   patient_name: "Shreya Patel",   status: "Success", hoursAgo: 18  },
  { name: "Dr. Vikram Rao",   role: "doctor",  patientId: patientIdMap["Amit Patel"],     action: "UPDATE_RECORD",  reason: "Hep B DNA result updated, treatment adjusted",  ip: "192.168.1.108", doctor_name: "Dr. Vikram Rao",   patient_name: "Amit Patel",     status: "Success", hoursAgo: 36  },

  // Emergency & denied logs
  { name: "Deepika Singh",    role: "nurse",   patientId: patientIdMap["Arjun Gupta"],    action: "EMERGENCY_ACCESS",reason: "Cardiac arrest emergency — crash team",       ip: "192.168.1.104", doctor_name: "Dr. Rajesh Kumar", patient_name: "Arjun Gupta",    status: "Emergency",hoursAgo: 48 },
  { name: "Ananya Verma",     role: "nurse",   patientId: patientIdMap["Nikhil Kapoor"],  action: "VIEW_RECORD",    reason: "Temp access for IV Iron infusion",              ip: "192.168.1.103", doctor_name: "Dr. Vikram Rao",   patient_name: "Nikhil Kapoor",  status: "Success", hoursAgo: 16  },
  { name: "Unknown User",     role: "doctor",  patientId: patientIdMap["Meera Joshi"],    action: "VIEW_RECORD",    reason: "Unauthorized access attempt",                   ip: "10.0.0.55",     doctor_name: "",                 patient_name: "Meera Joshi",    status: "Denied",  hoursAgo: 72  },
];

// ─── 5. EMERGENCY ACCESS ──────────────────────────────────────────────────────
const buildEmergencyAccess = (patientIdMap) => [
  {
    patientId: patientIdMap["Arjun Gupta"],
    grantedBy: "Deepika Singh",
    reason: "Acute STEMI — patient unresponsive. Crash team activated. Emergency access for immediate cath lab prep.",
    hoursAgo: 48
  },
  {
    patientId: patientIdMap["Sanjay Mishra"],
    grantedBy: "Ananya Verma",
    reason: "Acute COPD exacerbation with respiratory failure. Emergency nebulisation and NIV initiated.",
    hoursAgo: 120
  }
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────
async function seedDatabase() {
  try {
    console.log("\n🌱 ══════════════════════════════════════════");
    console.log("   EMS Access Control — Full Database Seed");
    console.log("══════════════════════════════════════════\n");

    // ── Step 1: Users ────────────────────────────────────────────────────────
    console.log("👥 Step 1: Seeding Users...");
    let usersAdded = 0;
    for (const user of sampleUsers) {
      try {
        await run(
          `INSERT INTO users (email, name, role, phone, department, trustScore, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [user.email, user.name, user.role, user.phone || null, user.department || null, user.trustScore || 50]
        );
        console.log(`   ✅ ${user.role.padEnd(7)} | ${user.name}`);
        usersAdded++;
      } catch {
        console.log(`   ℹ️  Already exists: ${user.name}`);
      }
    }
    console.log(`   → ${usersAdded} new users added\n`);

    // ── Step 2: Patients ─────────────────────────────────────────────────────
    console.log("🏥 Step 2: Seeding Patients (with doctor assignments)...");
    let patientsAdded = 0;
    for (const p of samplePatients) {
      try {
        await run(
          `INSERT INTO patients
             (patientName, age, gender, patient_email, medicalHistory, emergencyContact,
              diagnosis, treatment, notes, doctor_name, createdBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            p.patientName, p.age, p.gender, p.patient_email,
            p.medicalHistory, p.emergencyContact,
            p.diagnosis, p.treatment, p.notes,
            p.doctor_name, p.createdBy
          ]
        );
        console.log(`   ✅ ${p.patientName.padEnd(20)} → assigned to ${p.doctor_name}`);
        patientsAdded++;
      } catch {
        console.log(`   ℹ️  Already exists: ${p.patientName}`);
      }
    }
    console.log(`   → ${patientsAdded} new patients added\n`);

    // ── Build patient name→ID map ─────────────────────────────────────────────
    const allPatients = await all("SELECT id, patientName FROM patients");
    const patientIdMap = {};
    allPatients.forEach(p => { patientIdMap[p.patientName] = p.id; });

    // ── Step 3: Access Requests (approved for doctors) ────────────────────────
    console.log("🔑 Step 3: Seeding Access Requests (approved doctor-patient links)...");

    // Doctor access: approved, 30-day window
    const doctorAccessPairs = [
      { requester: "dr.rajesh@ehr.com",  name: "Dr. Rajesh Kumar", patient: "Arjun Gupta",     type: "read_write" },
      { requester: "dr.rajesh@ehr.com",  name: "Dr. Rajesh Kumar", patient: "Rohan Reddy",     type: "read_write" },
      { requester: "dr.rajesh@ehr.com",  name: "Dr. Rajesh Kumar", patient: "Divya Sharma",    type: "read_write" },
      { requester: "dr.priya@ehr.com",   name: "Dr. Priya Sharma", patient: "Anjali Nair",     type: "read_write" },
      { requester: "dr.priya@ehr.com",   name: "Dr. Priya Sharma", patient: "Meera Joshi",     type: "read_write" },
      { requester: "dr.priya@ehr.com",   name: "Dr. Priya Sharma", patient: "Karan Malhotra",  type: "read_write" },
      { requester: "dr.arun@ehr.com",    name: "Dr. Arun Mehta",   patient: "Vikram Singh",    type: "read_write" },
      { requester: "dr.arun@ehr.com",    name: "Dr. Arun Mehta",   patient: "Pooja Iyer",      type: "read_write" },
      { requester: "dr.arun@ehr.com",    name: "Dr. Arun Mehta",   patient: "Rajendra Bose",   type: "read_write" },
      { requester: "dr.sunita@ehr.com",  name: "Dr. Sunita Iyer",  patient: "Sanjay Mishra",   type: "read_write" },
      { requester: "dr.sunita@ehr.com",  name: "Dr. Sunita Iyer",  patient: "Lalitha Krishnan",type: "read_write" },
      { requester: "dr.vikram@ehr.com",  name: "Dr. Vikram Rao",   patient: "Nikhil Kapoor",   type: "read_write" },
      { requester: "dr.vikram@ehr.com",  name: "Dr. Vikram Rao",   patient: "Shreya Patel",    type: "read_write" },
      { requester: "dr.vikram@ehr.com",  name: "Dr. Vikram Rao",   patient: "Amit Patel",      type: "read_write" },
      // Nurse read-only access (approved)
      { requester: "nurse.kavita@ehr.com",  name: "Kavita Nair",   patient: "Arjun Gupta",     type: "read_only" },
      { requester: "nurse.kavita@ehr.com",  name: "Kavita Nair",   patient: "Rohan Reddy",     type: "read_only" },
      { requester: "nurse.ritu@ehr.com",    name: "Ritu Bhatia",   patient: "Karan Malhotra",  type: "read_only" },
      { requester: "nurse.deepika@ehr.com", name: "Deepika Singh", patient: "Sanjay Mishra",   type: "read_only" },
      { requester: "nurse.ananya@ehr.com",  name: "Ananya Verma",  patient: "Pooja Iyer",      type: "read_only" },
      // Pending (nurse requests awaiting admin approval)
      { requester: "nurse.ananya@ehr.com",  name: "Ananya Verma",  patient: "Nikhil Kapoor",   type: "read_only", status: "pending" },
      { requester: "nurse.deepika@ehr.com", name: "Deepika Singh", patient: "Anjali Nair",      type: "read_only", status: "pending" },
    ];

    let arAdded = 0;
    for (const ar of doctorAccessPairs) {
      const pid = patientIdMap[ar.patient];
      if (!pid) { console.log(`   ⚠️  Patient not found: ${ar.patient}`); continue; }
      const status    = ar.status || "approved";
      const approvedBy = status === "approved" ? "admin@ehr.com" : null;
      const approvedAt = status === "approved" ? new Date(Date.now() - Math.random() * 7 * 86400000).toISOString() : null;
      const expiresAt  = new Date(Date.now() + 30 * 86400000).toISOString();
      const reason     = status === "approved"
        ? `${ar.type === "read_write" ? "Attending" : "Assigned nursing care"} — system-authorized`
        : "Requesting temporary ward access for patient care";

      try {
        await run(
          `INSERT INTO access_requests
             (patientId, requesterId, role, accessType, reason, status, approvedBy, approvedAt, createdAt, expiresAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
          [pid, ar.requester,
           ar.requester.startsWith("dr.") ? "doctor" : "nurse",
           ar.type, reason, status, approvedBy, approvedAt, expiresAt]
        );
        const icon = status === "approved" ? "✅" : "⏳";
        console.log(`   ${icon} [${status.padEnd(7)}] ${ar.name.padEnd(22)} → ${ar.patient} (${ar.type})`);
        arAdded++;
      } catch (err) {
        console.log(`   ℹ️  Access request exists: ${ar.name} → ${ar.patient}`);
      }
    }
    console.log(`   → ${arAdded} access requests seeded\n`);

    // ── Step 4: Access Logs ───────────────────────────────────────────────────
    console.log("📋 Step 4: Seeding Access Logs (audit trail)...");
    const logs = buildAccessLogs(patientIdMap);
    let logsAdded = 0;
    for (const log of logs) {
      if (!log.patientId) { console.log(`   ⚠️  Patient ID missing for log: ${log.patient_name}`); continue; }
      const ts = new Date(Date.now() - log.hoursAgo * 3600000).toISOString();
      try {
        await run(
          `INSERT INTO access_logs
             (name, role, patientId, action, reason, ip, timestamp,
              doctor_name, doctor_role, patient_name, justification, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [log.name, log.role, log.patientId, log.action, log.reason, log.ip, ts,
           log.doctor_name, log.role, log.patient_name, log.reason, log.status]
        );
        const icon = log.status === "Denied" ? "🚫" : log.status === "Emergency" ? "🚨" : "📝";
        console.log(`   ${icon} [${log.status.padEnd(10)}] ${log.name.padEnd(22)} ${log.action.padEnd(18)} → ${log.patient_name}`);
        logsAdded++;
      } catch (err) {
        console.log(`   ⚠️  Log error: ${err.message}`);
      }
    }
    console.log(`   → ${logsAdded} access log entries seeded\n`);

    // ── Step 5: Emergency Access ──────────────────────────────────────────────
    console.log("🚨 Step 5: Seeding Emergency Access Records...");
    const emergencyRecords = buildEmergencyAccess(patientIdMap);
    let emAdded = 0;
    for (const em of emergencyRecords) {
      if (!em.patientId) continue;
      const createdAt = new Date(Date.now() - em.hoursAgo * 3600000).toISOString();
      const expiresAt = new Date(Date.now() - em.hoursAgo * 3600000 + 24 * 3600000).toISOString();
      try {
        await run(
          `INSERT INTO emergency_access (patientId, grantedBy, reason, createdAt, expiresAt)
           VALUES (?, ?, ?, ?, ?)`,
          [em.patientId, em.grantedBy, em.reason, createdAt, expiresAt]
        );
        console.log(`   🚨 Emergency by ${em.grantedBy} → patient #${em.patientId}`);
        emAdded++;
      } catch (err) {
        console.log(`   ℹ️  Emergency record: ${err.message}`);
      }
    }
    console.log(`   → ${emAdded} emergency records seeded\n`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("══════════════════════════════════════════");
    console.log("📊 Final Database Summary:");
    const counts = await Promise.all([
      get("SELECT COUNT(*) as c FROM users"),
      get("SELECT COUNT(*) as c FROM patients"),
      get("SELECT COUNT(*) as c FROM access_requests"),
      get("SELECT COUNT(*) as c FROM access_logs"),
      get("SELECT COUNT(*) as c FROM emergency_access"),
      get("SELECT COUNT(*) as c FROM access_requests WHERE status='approved'"),
      get("SELECT COUNT(*) as c FROM access_requests WHERE status='pending'"),
    ]);
    console.log(`   👥 Users:             ${counts[0].c}`);
    console.log(`   🏥 Patients:          ${counts[1].c}`);
    console.log(`   🔑 Access Requests:   ${counts[2].c}  (✅ ${counts[5].c} approved | ⏳ ${counts[6].c} pending)`);
    console.log(`   📋 Access Logs:       ${counts[3].c}`);
    console.log(`   🚨 Emergency Access:  ${counts[4].c}`);
    console.log("══════════════════════════════════════════\n");
    console.log("✨ Seeding complete! Database is ready.\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seedDatabase();
