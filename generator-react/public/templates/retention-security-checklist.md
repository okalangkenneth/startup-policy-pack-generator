# Data Retention & Security Checklist
_Last updated: [LAST_UPDATED]_

## Retention Schedule (examples)
- **Account data**: while active + **[RETENTION_ACCOUNT]** after closure
- **Logs/telemetry**: **[RETENTION_LOGS]**
- **Support tickets**: **[RETENTION_SUPPORT]**

## Deletion/Anonymization
- Scheduled deletion runs **[DELETION_FREQUENCY]**
- Irreversible anonymization for analytics after **[ANONYMIZATION_DELAY]**

## Access Controls
- Role-based access; least privilege; MFA for admins; quarterly access reviews

## Security Measures
- TLS 1.2+ in transit; encryption at rest (where supported)
- Backups: **[BACKUP_FREQUENCY]**, tested restores

## Incident Response
- Report to **[SECURITY_CONTACT_EMAIL]**
- Triage within **[IR_TRIAGE_HOURS]** hours; notify per legal requirements

## Vendors
- Processors listed at **[PROCESSORS_URL]**; DPAs/SCCs in place; annual review
