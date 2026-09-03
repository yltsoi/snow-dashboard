import random
from datetime import datetime, timedelta

random.seed(42)

BASE_DATE = datetime(2026, 7, 31)

STATES = [
    ("New", 0.08), 
    ("Assess", 0.12), 
    ("Authorize", 0.10), 
    ("Scheduled", 0.15), 
    ("Implement", 0.30), 
    ("Review", 0.15), 
    ("Closed", 0.10)
]

TYPES = [("Normal", 0.70), ("Emergency", 0.20), ("Standard", 0.10)]
RISKS = [("Low", 0.50), ("Medium", 0.30), ("High", 0.20)]
PRIORITIES = [
    ("1 - Critical", 0.05),
    ("2 - High", 0.15),
    ("3 - Moderate", 0.30),
    ("4 - Low", 0.50)
]

CATEGORIES = [
    ("Software", 0.40),
    ("Hardware", 0.30),
    ("Network", 0.20),
    ("Security", 0.10)
]

DESCRIPTIONS = [
    "Update software version",    
    "Replace faulty hardware component",
    "Upgrade network infrastructure",
    "Implement security patch",
    "Conduct system maintenance",
    "Perform database optimization",       
    "Deploy new application feature",
    "Resolve performance issues",
    "Migrate data to cloud storage",
    "Conduct security audit",
    "Implement backup and recovery plan",
    "Upgrade server hardware",
    "Optimize network configuration",
    "Perform software testing and quality assurance",
    "Implement disaster recovery procedures",
    "Conduct user training and onboarding",
    "Perform system monitoring and performance tuning",
    "Implement access control and user permissions",
    "Conduct vulnerability assessment and penetration testing",
    "Implement change management processes",
]


LONG_DESCRIPTIONS = [
    "This change invloves applying the latest vendor supplied security path tp all production server. All serers will be patched in a rolling fashing to main availability",
    "The user table requires schema changes to supprot new profile fields introduce in the Q3 product release",
    "Firewall updates are required to permit traffic from the new analytics subnet to the data warehouse. Rule have been reviewed by security operation",
    "Upgrade the application runtime release to address memory leak",
    "Add a new DNS-record to newly deployed microservices",
]

JUSTIFICATIONS = [
    "Required to maintain vendor support and address critical security vulnerabilities.",
    "Business requirement from the product roadmap; delays will block the Q3 feature release",
    "Risk mitigation: current configuration poses an unacceptable operational risk",
    "Performance degradation observe in production over the past two weeks",
]

IMPL_PLANS = [
    "1. Notify stakeholders 30 minutes before start. \n 2. Take configuration backup \n 3. Apply change to stage environment and validate \n 4. Apply change to PROD in rolling fashion\n 5. Run smoke test after each host. \n 6. Confirm with application owner",
    "1. Create database snapshot \n 2. Execute migration script on replica first \n 3. Verify row count. \4 Apply to primary during low traffic window \5. Validate applicaiton connectivity",
    "1. Raise a pre change notification to NOC \n 2. Push firewall rule set to the management plane \n 3. Confirm rule deployment on each appliance. \n 4. Perform live swap with zero-downtime",
    "1. Generate new certificate signing request \n 2. Submit to internal CA and retrieve signed certificate\n 3. Stage certificate on load balancer standby node \n 4. Perform live swap with zero downtime reload \n 5. Verify certificate expiry",
]

BACKOUT_PLANS = [
    "Restore from pre-change configuration backup. Estimated recovery time: 20 minutes",
    "Execute rollback SQL script to revert schema change",
    "Revert fiurewall rule set to the previous named checkpoint.",
    "Reinstall the previous certification from the backup store.",
]

GROUPS = [
    "IT Operations",
    "Network Team",
    "Security Team",
    "Database Team",
    "Application Development Team",
    "Infrastructure Team",
]

PEOPLE = [
    "Alice Johnson",
    "Bob Smith",
    "Charlie Brown",
    "David Wilson",
    "Eva Davis",
    "Frank Miller",
    "Grace Lee",
    "Henry Clark",
    "Isabella Lewis",
    "Jack Walker",
]


TASK_DESCRIPTIONS = [
    "Pre-change communication to stakeholders",
    "Take configuration and data backup",
    "Apply change to staging environment",
    "Validate staging environment post-change",
    "Apply "

]

TASK_STATES = [
    ("Open", 0.50),  
    ("In Progress", 0.30),  
    ("Closed", 0.20),
    ("Cancelled", 0.10)
]    

def _weighted_choice(options):
    items, weights = zip(*options)
    return random.choices(items, weights=weights, k=1)[0]

def _generate_tasks(change_number, opened_at, num_tasks):
    tasks = []
    for j in range(num_tasks):
        task_number = f"{change_number}-TASK{j+1:03d}"
        task_description = random.choice(TASK_DESCRIPTIONS)
        task_state = _weighted_choice(TASK_STATES)
        task_assigned_to = random.choice(PEOPLE)
        task_created_at = opened_at + timedelta(days=random.randint(0, 2))
        tasks.append({
            "number": task_number,
            "short_description": task_description,
            "state": task_state,
            "assigned_to": task_assigned_to,
            "created_at": task_created_at.isoformat()
        })
    return tasks

def _generate(n=200):
    records = []
    for i in range(n):
        days_ago = random.randint(0, 90)
        opened_at = BASE_DATE - timedelta(days=days_ago)

        start_offset = random.randint(1, 7)
        start_date = opened_at + timedelta(days=start_offset)
        end_date = start_date + timedelta(days=random.randint(1, 48))


        records.append({
            "number": f"CHG{100100 + i}",
            "short_description": random.choice(DESCRIPTIONS),
            "description": random.choice(LONG_DESCRIPTIONS),
            "justification": random.choice(JUSTIFICATIONS),
            "implementation_plan": random.choice(IMPL_PLANS),
            "backout_plan": random.choice(BACKOUT_PLANS),
            "state": _weighted_choice(STATES),
            "type": _weighted_choice(TYPES),    
            "risk": _weighted_choice(RISKS),
            "priority": _weighted_choice(PRIORITIES),
            "category": _weighted_choice(CATEGORIES),
            "assignment_group": random.choice(GROUPS),
            "assigned_to": random.choice(PEOPLE),
            "opened_at": opened_at.isoformat(),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "tasks": _generate_tasks(f"CHG{100100 + i}", opened_at, random.randint(1, 5))   
        })

    #print( records )

    return records



# Sample records with deliberate data quality issues for testing the Assess feature
SAMPLE_RECORDS = [
    {
        "number": "CHG0000001",
        "short_description": "Database schema migration for reporting module",
        "description": "Migration of legacy reporting tables to new unified schema",
        "justification": "Required to support the new analytics dashboard release in Q4",
        "implementation_plan": "1. Take snapshot of affected table \n 2. Run migration script on replica \n 3. Validate row counts \n",
        "backout_plan": "Execute rollback SQL script. Restore from snapshot",
        "state": "Scheduled",
        "type": "Normal",
        "risk": "High",
        "priority": "2 - High",
        "category": "Database",
        "assigned_to": "",           # Missing implementor
        "assignment_group": "Database Administrator",
        "opened_at": (BASE_DATE - __import__('datetime').timedelta(days=5)).isoformat(),
        "start_date": (BASE_DATE - __import__('datetime').timedelta(days=2)).isoformat(),
        "end_date": (BASE_DATE - __import__('datetime').timedelta(days=2, hours=4)).isoformat(),
        "tasks": [
            {"number": "CTASK0001", "short_description": "Take database snapshot", "state": "Open", "assigned_to": "James Taylor", "created_at": (BASE_DATE - __import__('datetime').timedelta(days=4)).isoformat() },
            {"number": "CTASK0002", "short_description": "Run migration script", "state": "Open", "assigned_to": "Mary Thomas", "created_at": (BASE_DATE - __import__('datetime').timedelta(days=2)).isoformat()},
        ]
        
    }   

]

#CHANGES = SAMPLE_RECORDS + _generate()
CHANGES = _generate()
CHANGES_BY_NUMBER = {c["number"]: c for c in CHANGES}

print(CHANGES[0])