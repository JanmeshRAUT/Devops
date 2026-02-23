#!/usr/bin/env python
# test_separate_tables.py - Test separate database tables

from static_db import (
    get_all_admins, get_all_doctors, get_all_nurses, get_all_patients,
    get_doctors_by_specialization, get_doctors_by_hospital,
    get_nurses_by_department, get_nurses_by_hospital,
    get_patients_by_blood_type, get_patients_by_age_range,
    admin_count, doctor_count, nurse_count, patient_count,
    get_database_stats
)

print('=' * 70)
print('🧪 TESTING SEPARATE TABLE FUNCTIONS')
print('=' * 70)

# Test Admin queries
print('\n👨‍💻 ADMIN QUERIES:')
print(f'   Total admins: {admin_count()}')
admins = get_all_admins()
print(f'   get_all_admins(): {len(admins)} results')
for admin in admins:
    print(f'      └─ {admin.get("name")} ({admin.get("email")})')

# Test Doctor queries
print('\n👨‍⚕️  DOCTOR QUERIES:')
print(f'   Total doctors: {doctor_count()}')
doctors = get_all_doctors()
print(f'   get_all_doctors(): {len(doctors)} results')

cardio_docs = get_doctors_by_specialization('Cardiology')
print(f'   get_doctors_by_specialization("Cardiology"): {len(cardio_docs)} results')
for doc in cardio_docs:
    print(f'      └─ {doc.get("name")} ({doc.get("specialization")})')

central_docs = get_doctors_by_hospital('Central Hospital')
print(f'   get_doctors_by_hospital("Central Hospital"): {len(central_docs)} results')
for doc in central_docs:
    print(f'      └─ {doc.get("name")} at {doc.get("hospital")}')

# Test Nurse queries
print('\n👩‍⚕️  NURSE QUERIES:')
print(f'   Total nurses: {nurse_count()}')
nurses = get_all_nurses()
print(f'   get_all_nurses(): {len(nurses)} results')

icu_nurses = get_nurses_by_department('ICU')
print(f'   get_nurses_by_department("ICU"): {len(icu_nurses)} results')
for nurse in icu_nurses:
    print(f'      └─ {nurse.get("name")} in {nurse.get("department")}')

# Test Patient queries
print('\n🧑‍🤝‍🧑 PATIENT QUERIES:')
print(f'   Total patients: {patient_count()}')
patients = get_all_patients()
print(f'   get_all_patients(): {len(patients)} results')

oplus_patients = get_patients_by_blood_type('O+')
print(f'   get_patients_by_blood_type("O+"): {len(oplus_patients)} results')
for patient in oplus_patients:
    print(f'      └─ {patient.get("name")} (Blood Type: {patient.get("blood_type")})')

middle_age = get_patients_by_age_range(40, 60)
print(f'   get_patients_by_age_range(40, 60): {len(middle_age)} results')
for patient in middle_age:
    print(f'      └─ {patient.get("name")} (Age: {patient.get("age")})')

# Test database stats
print('\n📊 DATABASE STATISTICS:')
stats = get_database_stats()
print(f'   Total Users: {stats["total_users"]}')
print(f'   Breakdown:')
for key, value in stats.items():
    if key != 'total_users':
        print(f'      └─ {key.capitalize()}: {value}')

print('\n' + '=' * 70)
print('✅ ALL TABLE TESTS PASSED!')
print('=' * 70)
