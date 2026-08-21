# HMIS Manage Platform — Deployment Lifecycle & Provisioning Plan

## 1. Purpose

This plan extends the existing Hospital Provisioning flow into a complete, controlled HMIS deployment lifecycle.

The existing provisioning capability remains the technical provisioning engine. The new lifecycle becomes the orchestration and governance layer that controls everything from deployment authorization through provisioning, configuration, UAT, go-live, hypercare, stabilization, handover, and post-handover review.

### Core principle

> **Hospital = customer/tenant entity**
>
> **Deployment = implementation journey**
>
> **Provisioning = technical creation and synchronization stage inside the deployment**

The existing provisioning behavior must not be unnecessarily rewritten. It should be wrapped by the deployment lifecycle and exposed as a controlled stage with verification, exceptions, auditability, and gates.

---

# 2. Current Architecture Baseline

The current platform consists of:

- `hmis_manage_frontend` — platform administration UI.
- `hmis-manage` — Laravel backend and system of record for organizations, facilities, and users.
- `core-service` — downstream HMIS microservice ecosystem.
- DHA SHA HIE facility registry — optional facility lookup/validation service.

The current registration wizard creates:

1. Organization
2. Optional Facility
3. Optional Hospital Admin
4. User-role assignment

The backend then invokes the existing `CoreServiceProvisioner`.

The core provisioning sequence is:

1. Create organization in core-service.
2. Create facility when applicable.
3. Create user and assign role when applicable.
4. Persist returned core IDs locally.

Core-service failures currently do not roll back local creation. Partial provisioning is repaired manually using the existing retry paths.

This behavior should be preserved.

---

# 3. Target Architecture

Introduce a first-class **Deployment** entity and lifecycle around the existing Hospital/Organization entity.

```text
Deployment
│
├── Organization / Hospital
├── Facilities
├── Deployment Status
├── Current Stage
├── Work Plan / Work Order
├── Assigned Team
├── Readiness Assessment
├── Documents
├── Provisioning
├── Data Migration
├── System Configuration
├── User & Role Configuration
├── Training
├── UAT
├── Go-Live
├── Hypercare
├── Stabilization
├── Completion Sign-off
├── Support Handover
└── Post-Handover Review
```

The deployment lifecycle controls progression.

The existing provisioning engine performs the technical provisioning work when Stage 6 is activated.

---

# 4. Deployment Lifecycle

## Phase A — Authorization & Readiness

### Stage 1 — Contract Confirmation & Deployment Authorization

Purpose:

Confirm that the deployment is commercially and administratively authorized.

Required checks:

- Contract confirmed.
- Deployment authorized.
- Client/organization identified.
- Deployment record created.
- Required administrative information available.

Completion criteria:

- All required authorization fields completed.
- Authorized deployment approval recorded.

Gate:

```text
AUTHORIZED → unlock Stage 2
NOT AUTHORIZED → deployment remains blocked
```

---

## Stage 2 — Facility Readiness Assessment

Purpose:

Confirm that the facility has the technical and operational prerequisites required for deployment.

### Connectivity checks

- Internet availability.
- Internet stability.
- Required bandwidth.
- LAN/network availability.
- Wi-Fi where required.
- DNS/domain requirements.
- Firewall restrictions.
- Required ports/endpoints.
- Connectivity to required external services.

### Device checks

- Computers/workstations.
- Printers.
- Barcode scanners where applicable.
- Network equipment.
- UPS/power availability.
- Required HMIS peripherals.
- Device operating-system/browser compatibility.

### Readiness status

Each check supports:

- `PENDING`
- `IN_PROGRESS`
- `PASSED`
- `FAILED`
- `NOT_APPLICABLE`
- `BLOCKED`

Overall readiness:

- `READY`
- `PARTIALLY_READY`
- `NOT_READY`

Failures must create readiness issues rather than silently disappearing.

---

## Stage 3 — Client Kickoff & Information/Document Collection

Purpose:

Collect everything required to configure the hospital correctly.

### Organization information

- Organization name.
- Facility details.
- Facility identifiers.
- Contacts.
- Location.
- Facility level/type.
- Departments.
- Services.

### Clinical/master-data requirements

- Standard procedures.
- Medication catalogue.
- Consumables.
- Laboratory templates.
- Services.
- Clinical workflows.
- Other agreed master data.

### Administrative requirements

- User structure.
- Role requirements.
- Approval structures.
- Billing requirements.
- Insurance requirements.
- Reporting requirements.
- Integration requirements.

### Documents

Every required document should have a state:

```text
REQUIRED
UPLOADED
UNDER_REVIEW
VERIFIED
APPROVED
REJECTED
MISSING
NOT_APPLICABLE
```

A deployment cannot pass this stage while mandatory information/documents remain unresolved.

---

## Stage 4 — Deployment Team & Technical Support Assignment

Purpose:

Assign responsibility before implementation begins.

The platform should support:

- Deployment lead.
- Technical lead.
- Implementation team.
- Support team.
- Training personnel.
- Escalation contact.
- Customer-side primary contact.

Each assignment should be timestamped and auditable.

---

## Stage 5 — Work Plan & Work Order Approval

Purpose:

Convert preparation into an approved implementation plan.

This stage becomes active only after Stages 1–4 are successfully completed.

Required information:

- Deployment scope.
- Facilities included.
- Modules included.
- Migration requirement.
- Integration requirements.
- Training plan.
- Target dates.
- Assigned resources.
- Go-live target.
- Hypercare period.
- Stabilization period.

### Critical gate

```text
Stage 1 ✓
   +
Stage 2 ✓
   +
Stage 3 ✓
   +
Stage 4 ✓
   ↓
Work Plan / Work Order
   ↓
APPROVAL
   ↓
Deployment Execution Activated
```

Only after approval should implementation stages become executable.

---

# Phase B — Implementation

## Stage 6 — Organization Provisioning, Environment Setup & Configuration

This stage integrates the existing provisioning engine.

### Existing provisioning flow

```text
Create Organization
      ↓
Create Facility
      ↓
Create Initial Admin
      ↓
Assign Hospital Admin Role
      ↓
Provision Core Organization
      ↓
Provision Core Facility
      ↓
Provision Core User
      ↓
Assign Core Roles
      ↓
Persist Core IDs
      ↓
Run Verification
```

The existing HMAC-signed core-service integration remains unchanged unless required by implementation.

### Provisioning verification

The platform must verify:

- Local organization exists.
- Local facility exists.
- Local admin exists.
- Core organization ID exists.
- Core facility ID exists.
- Core user ID exists where applicable.
- Core role assignment exists.
- Tenant/environment is reachable.
- Required health checks pass.

### Partial provisioning

The existing partial-provisioning behavior should be retained.

Possible state:

```text
LOCAL_COMPLETE
CORE_COMPLETE
PARTIALLY_PROVISIONED
PROVISIONING_FAILED
REPAIR_REQUIRED
```

Failures must become deployment exceptions/tasks.

Existing retry/repair actions should be integrated into the deployment stage rather than existing as isolated technical actions.

### Stage completion

Stage 6 is complete only when:

- Required local records exist.
- Required downstream records exist.
- Synchronization is verified.
- No critical provisioning exception remains open.

---

## Stage 7 — Data Migration Assessment & Migration

Purpose:

Determine whether legacy patient demographic/biographical data requires migration and execute it where applicable.

### Decision

```text
Migration required?
       │
   ┌───┴───┐
   NO      YES
   │        │
Complete   Assessment
            ↓
        Data Mapping
            ↓
        Data Cleaning
            ↓
        Migration
            ↓
        Validation
            ↓
        Sign-off
```

Migration should support:

- Source assessment.
- Data quality assessment.
- Field mapping.
- Transformation rules.
- Migration batches.
- Migration logs.
- Error records.
- Validation.
- Reconciliation.
- Migration approval.

If migration is not required, the platform should record:

`MIGRATION_NOT_REQUIRED`

and allow the lifecycle to continue.

---

## Stage 8 — System Setup, User Setup & Role Configuration

Purpose:

Configure the actual HMIS operating environment.

### System configuration

Depending on deployment scope:

- Facilities.
- Departments.
- Services.
- Wards.
- Consultation rooms.
- Theatre.
- Laboratory.
- Pharmacy.
- Inventory.
- Finance.
- Insurance.
- Reports.
- Other enabled modules.

### User lifecycle

```text
User Created
   ↓
Tenant Assigned
   ↓
Facility Assigned
   ↓
Role Assigned
   ↓
Permissions Assigned
   ↓
Account Activated
   ↓
Verified
```

The platform must prevent accidental cross-tenant assignment.

### Configuration validation

Each required configuration item should be:

- Pending
- In progress
- Complete
- Failed
- Not applicable

---

## Stage 9 — Training & Support

Purpose:

Prepare users and facility administrators for operation.

Track:

- Training sessions.
- Training dates.
- Departments trained.
- User groups.
- Trainers.
- Attendance.
- Training materials.
- Outstanding training requirements.
- Administrator training.
- Support orientation.

The platform should provide training completion status.

---

## Stage 10 — User Acceptance Testing (UAT)

Purpose:

Confirm that the hospital can operate the agreed HMIS workflows successfully.

### UAT structure

```text
UAT Plan
   ↓
Test Cases
   ↓
Execution
   ↓
Pass / Fail
   ↓
Defects
   ↓
Retest
   ↓
UAT Approval
```

### Test case states

- Not started.
- In progress.
- Passed.
- Failed.
- Blocked.
- Retest required.
- Not applicable.

### Defect severity

At minimum:

- Critical.
- High.
- Medium.
- Low.

### Go-live gate

Critical UAT defects must be resolved or explicitly approved as exceptions before go-live.

---

# Phase C — Go-Live & Stabilization

## Stage 11 — Go-Live

Purpose:

Move the hospital into production.

### Go-live readiness checklist

- Contract/authorization ✓
- Facility readiness ✓
- Required documents ✓
- Provisioning ✓
- Migration ✓ / Not Required
- System configuration ✓
- Users ✓
- Roles ✓
- Training ✓
- UAT ✓
- Critical defects = 0
- Backup verification ✓
- Monitoring ✓
- Support contacts ✓
- Go-live plan ✓
- Rollback/contingency plan ✓

The platform should calculate:

```text
READY FOR GO-LIVE
```

or:

```text
NOT READY FOR GO-LIVE
```

Go-live should require explicit approval.

### Go-live timing

The deployment record should store:

- Planned go-live date.
- Actual go-live date.
- Go-live window.
- Go-live owner.
- Go-live status.
- Rollback status if required.

---

## Stage 12 — Hypercare / Handholding

Default period:

**2–4 weeks**

The platform should automatically calculate:

- Hypercare start date.
- Hypercare end date.
- Current hypercare day.
- Remaining days.

Track:

- Incidents.
- Support requests.
- Configuration fixes.
- User issues.
- Training gaps.
- Integration issues.
- Critical incidents.
- Resolution times.

Example:

```text
Hospital ABC
Hypercare Day 11 / 21
```

---

## Stage 13 — Stabilization & Active Customer Monitoring

Typical period:

- 1 month, or
- 3 months,

depending on facility/deployment requirements.

Track:

- System health.
- Usage.
- Active users.
- Incidents.
- Support requests.
- Recurring problems.
- Integration health.
- Outstanding configuration.
- Customer feedback.
- Operational adoption.

The contracted stabilization period must be stored on the deployment rather than hard-coded.

---

# Phase D — Closure & Handover

## Stage 14 — Completion Sign-off

Purpose:

Formally confirm implementation completion.

Required conditions:

```text
UAT APPROVED
+
GO-LIVE COMPLETED
+
HYPERCARE COMPLETED
+
STABILIZATION COMPLETED
+
CRITICAL ISSUES = 0
+
REQUIRED DOCUMENTATION COMPLETE
+
CUSTOMER ACCEPTANCE
```

Then:

`COMPLETION_SIGNED_OFF`

The sign-off must record:

- Approver.
- Date/time.
- Comments.
- Outstanding non-critical items.
- Evidence/attachments where applicable.

---

## Stage 15 — Handover to Support & Customer Service

Purpose:

Transfer the hospital from implementation into normal support operations.

### Handover package

Include:

- Organization details.
- Tenant ID.
- Facility details.
- Active modules.
- User summary.
- Admin contacts.
- Configuration summary.
- Integration summary.
- Migration status.
- Known issues.
- Resolved issues.
- Outstanding non-critical issues.
- Support information.
- Contracted support period.
- Important dates.
- Deployment history.
- Relevant documentation.

### Handover process

```text
Implementation Complete
        ↓
Handover Package Generated
        ↓
Support Review
        ↓
Customer Service Review
        ↓
Handover Accepted
        ↓
Implementation Closed
        ↓
Normal Support Lifecycle
```

The monthly regular-check-in requirement should become a scheduled customer activity after handover.

---

## Stage 16 — Post-Handover Review

Purpose:

Capture lessons learned and evaluate deployment quality.

### Technical review

- System stability.
- Infrastructure problems.
- Integration stability.
- Recurring incidents.
- Performance issues.

### Operational review

- Training effectiveness.
- User adoption.
- Workflow issues.
- Missing requirements.
- Configuration gaps.

### Customer review

- Customer satisfaction.
- Outstanding requirements.
- Additional requests.
- Expansion opportunities.

### Internal review

- What went well?
- What failed?
- What caused delays?
- What should be automated?
- What should become mandatory?
- What should be removed?
- What should change in future deployments?

The review should feed improvements back into the deployment process.

---

# 5. Deployment State Machine

Recommended high-level states:

```text
DRAFT
  ↓
AUTHORIZED
  ↓
READINESS
  ↓
PREPARATION
  ↓
WORK_ORDER_APPROVAL
  ↓
IMPLEMENTATION
  ↓
UAT
  ↓
READY_FOR_GO_LIVE
  ↓
GO_LIVE
  ↓
HYPERCARE
  ↓
STABILIZATION
  ↓
READY_FOR_HANDOVER
  ↓
HANDED_OVER
  ↓
CLOSED
```

Exception states:

```text
BLOCKED
ON_HOLD
FAILED
CANCELLED
```

A deployment can enter an exception state without destroying its history.

---

# 6. Stage Gate Rules

Every stage should define:

- Entry conditions.
- Tasks.
- Required evidence.
- Validation rules.
- Approvals.
- Blocking conditions.
- Exit conditions.
- Next stage.

Example:

```text
Stage 5
Work Order Approval

Entry:
Stages 1–4 complete.

Tasks:
Create work plan.
Review scope.
Assign resources.
Set dates.

Gate:
Approval required.

Exit:
Approved → Stage 6 unlocked.
Rejected → Stage 5 remains active.
```

---

# 7. Deployment Tasks

Introduce a reusable task engine.

Each task should support:

```text
id
deployment_id
stage_id
title
description
type
status
priority
assigned_to
due_date
started_at
completed_at
completed_by
is_required
is_blocking
requires_approval
evidence
notes
created_at
updated_at
```

### Task types

- Manual.
- Automated.
- Validation.
- Approval.
- Information.
- Integration.
- Test.

### Task status

```text
PENDING
IN_PROGRESS
PASSED
FAILED
BLOCKED
NOT_APPLICABLE
COMPLETED
```

---

# 8. Automated vs Manual Controls

Every lifecycle activity should be classified.

### AUTO

Performed by the system.

Examples:

- Tenant creation.
- Core-service provisioning.
- Health checks.
- Core ID verification.
- Deployment progress calculation.
- Hypercare date calculation.
- Reminder generation.

### MANUAL

Performed by an implementation team member.

Examples:

- Facility physical readiness.
- Training.
- Client kickoff.
- Data assessment.

### VALIDATION

System verifies a condition.

Examples:

- Core organization exists.
- User has tenant assignment.
- Required configuration exists.
- UAT critical defects are zero.

### APPROVAL

Requires explicit human authorization.

Examples:

- Deployment authorization.
- Work order.
- UAT.
- Go-live.
- Completion sign-off.
- Handover.

---

# 9. Blocking Rules

The platform must distinguish between:

### Blocking issue

Prevents stage progression.

Examples:

- Missing deployment authorization.
- Failed facility readiness.
- Missing mandatory documents.
- Failed provisioning.
- Critical migration failure.
- Missing mandatory users.
- Critical UAT defect.
- Failed go-live readiness check.

### Non-blocking issue

Can remain open while the deployment progresses.

Examples:

- Low-priority configuration issue.
- Minor documentation update.
- Non-critical training follow-up.

Every issue should explicitly indicate:

```text
blocking = true / false
```

---

# 10. Deployment Progress

The platform should calculate progress from stage/task completion rather than allowing an operator to manually type a percentage.

Example:

```text
Deployment Progress: 74%

Stage 1  ✓
Stage 2  ✓
Stage 3  ✓
Stage 4  ✓
Stage 5  ✓
Stage 6  80%
Stage 7  Pending
Stage 8  Pending
...
```

Progress should distinguish:

- Stage completion.
- Task completion.
- Blocking issues.
- Approval status.

---

# 11. Deployment Dashboard

Each deployment should have a command-center view.

```text
HOSPITAL ABC
Deployment: DEP-2026-0042

Status:
IMPLEMENTATION

Current Stage:
Organization Provisioning

Progress:
74%

Current blockers:
2

Critical issues:
0

Next actions:
- Complete laboratory configuration
- Assign remaining user roles

Target Go-Live:
14 September 2026

Hypercare:
Not started

Stabilization:
Not started
```

---

# 12. Hospital Detail Page

The existing hospital detail page should be extended rather than replaced.

Existing capabilities such as:

- Facilities.
- Hospital admins.
- Core-service provisioning.
- Provisioning retry.
- Core IDs.

should remain.

Add:

- Deployment status.
- Current lifecycle stage.
- Progress.
- Timeline.
- Tasks.
- Readiness.
- Documents.
- Migration.
- Configuration.
- Training.
- UAT.
- Go-live.
- Hypercare.
- Stabilization.
- Sign-off.
- Handover.
- Post-handover review.

---

# 13. Deployment Timeline

Every important action should create a timeline event.

Example:

```text
21 Aug 2026 09:30
Deployment authorized

21 Aug 2026 10:15
Facility readiness completed

22 Aug 2026 14:20
Work order approved

23 Aug 2026 08:05
Tenant provisioned

23 Aug 2026 08:07
Core-service synchronization verified

27 Aug 2026 15:30
UAT approved

01 Sep 2026 08:00
Go-live completed
```

Timeline events must be immutable audit records.

---

# 14. Notifications & Escalations

The platform should generate notifications for:

- Stage unlocked.
- Task assigned.
- Task overdue.
- Readiness failure.
- Provisioning failure.
- Migration failure.
- UAT failure.
- Critical defect.
- Go-live blocked.
- Hypercare ending.
- Stabilization ending.
- Sign-off required.
- Handover required.
- Monthly customer check-in due.

Notifications can support:

- In-app.
- Email.
- Future SMS/other channels.

---

# 15. Scheduled Activities

The platform should automatically schedule:

### Hypercare

```text
Go-live date
     +
Configured hypercare period
     =
Hypercare end date
```

### Stabilization

```text
Hypercare end
     +
Configured stabilization period
     =
Stabilization end
```

### Post-handover

Create recurring customer check-ins according to the contracted schedule.

---

# 16. Audit Trail

Every lifecycle transition must record:

- Who performed it.
- Previous state.
- New state.
- Date/time.
- Reason.
- Comments.
- Related task.
- Related approval.
- Related evidence.

Examples:

```text
Stage changed:
UAT → READY_FOR_GO_LIVE

Performed by:
platform user

Reason:
All UAT cases passed.
```

Audit history must not be editable through normal UI actions.

---

# 17. Evidence Management

Tasks and approvals may require evidence.

Examples:

- Facility readiness photos.
- Connectivity test results.
- Signed documents.
- Work order.
- Migration report.
- UAT evidence.
- Training attendance.
- Go-live approval.
- Completion sign-off.
- Handover document.

Evidence should be associated with:

```text
Deployment
Stage
Task
Approval
```

---

# 18. Data Model

Recommended core entities:

```text
deployments
deployment_stages
deployment_tasks
deployment_assignments
deployment_documents
deployment_issues
deployment_approvals
deployment_events
deployment_checklists
deployment_uat_cases
deployment_uat_defects
deployment_migrations
deployment_training_sessions
deployment_go_live
deployment_hypercare
deployment_stabilization
deployment_signoffs
deployment_handovers
deployment_reviews
```

The existing:

```text
organizations
facilities
users
user_role_assignments
```

remain the source entities for the actual hospital/tenant.

---

# 19. Important Relationship

The relationship should be:

```text
Organization
    │
    └── Deployment
          │
          ├── Stages
          ├── Tasks
          ├── Issues
          ├── Approvals
          ├── Documents
          ├── UAT
          ├── Go-Live
          ├── Hypercare
          ├── Stabilization
          ├── Handover
          └── Review
```

Do not duplicate hospital identity data unnecessarily inside the deployment.

The deployment references the organization.

---

# 20. API Direction

Recommended API structure:

```text
GET    /deployments
POST   /deployments
GET    /deployments/{id}
PATCH  /deployments/{id}

GET    /deployments/{id}/stages
GET    /deployments/{id}/tasks
POST   /deployments/{id}/tasks
PATCH  /deployments/{id}/tasks/{task}

GET    /deployments/{id}/readiness
POST   /deployments/{id}/readiness/checks

GET    /deployments/{id}/documents
POST   /deployments/{id}/documents

GET    /deployments/{id}/migration
PATCH  /deployments/{id}/migration

GET    /deployments/{id}/training
POST   /deployments/{id}/training

GET    /deployments/{id}/uat
POST   /deployments/{id}/uat/cases
PATCH  /deployments/{id}/uat/cases/{case}

POST   /deployments/{id}/stages/{stage}/complete
POST   /deployments/{id}/stages/{stage}/approve

POST   /deployments/{id}/go-live/readiness
POST   /deployments/{id}/go-live/approve
POST   /deployments/{id}/go-live

GET    /deployments/{id}/hypercare
GET    /deployments/{id}/stabilization

POST   /deployments/{id}/completion-signoff
POST   /deployments/{id}/handover
POST   /deployments/{id}/post-handover-review
```

Existing hospital provisioning endpoints remain available and should be invoked by Stage 6 where appropriate.

---

# 21. Frontend Structure

Recommended navigation:

```text
Manage Platform
│
├── Dashboard
├── Hospitals
├── Deployments
│   ├── All
│   ├── Preparation
│   ├── Implementation
│   ├── UAT
│   ├── Go-Live
│   ├── Hypercare
│   ├── Stabilization
│   └── Handover
│
├── Tasks
├── UAT
├── Issues
├── Documents
└── Reports
```

Deployment detail:

```text
Overview
Timeline
Stages
Tasks
Readiness
Documents
Provisioning
Migration
Configuration
Training
UAT
Go-Live
Hypercare
Stabilization
Sign-off
Handover
Review
Audit
```

---

# 22. Roles & Permissions

The lifecycle must use role-based access.

Examples:

### Platform Administrator

Can:

- Create deployments.
- Manage configuration.
- Override where explicitly permitted.
- View all deployments.
- Approve administrative gates where authorized.

### Deployment/Implementation User

Can:

- Work assigned tasks.
- Complete readiness checks.
- Configure deployment.
- Record training.
- Execute UAT.
- Manage implementation issues.

### Technical User

Can:

- Execute technical checks.
- View provisioning.
- Retry failed provisioning.
- Review integrations.
- Perform technical validation.

### Approver

Can:

- Approve work orders.
- Approve UAT.
- Approve go-live.
- Approve completion.
- Approve handover.

### Support

Can:

- Receive handed-over deployments.
- View deployment history.
- Manage post-handover support.
- Record customer check-ins.

Permissions must be enforced server-side.

---

# 23. Exception & Override Model

Do not allow administrators to silently bypass gates.

If an authorized user must override a gate:

```text
Override requested
       ↓
Reason required
       ↓
Approver required where applicable
       ↓
Override recorded
       ↓
Audit event created
       ↓
Stage allowed to continue
```

An override should never erase the failed check.

It should remain visible as:

`OVERRIDDEN`

with the original failure preserved.

---

# 24. Backward Compatibility

The implementation must preserve existing functionality.

Do not break:

- Hospital registration.
- Facility registration.
- Hospital admin creation.
- Core-service provisioning.
- HMAC authentication.
- Core ID synchronization.
- Provisioning failure notification.
- Organization provisioning retry.
- Admin provisioning retry.
- Hospital detail view.
- Tenant authorization.
- Soft deletion.

The new deployment layer should consume and orchestrate these capabilities.

---

# 25. Migration Strategy

Implement incrementally.

## Phase 1 — Deployment foundation

Create:

- Deployment entity.
- Deployment stages.
- Deployment status.
- Stage transitions.
- Timeline/audit events.

Do not change core provisioning behavior yet.

## Phase 2 — Existing provisioning integration

Connect Stage 6 to:

- Existing hospital creation.
- Existing core-service provisioning.
- Existing retry mechanisms.
- Existing provisioning failure handling.

## Phase 3 — Readiness & preparation

Implement:

- Facility readiness.
- Client information.
- Documents.
- Team assignment.
- Work plans.
- Work-order approval.

## Phase 4 — Implementation controls

Implement:

- Migration.
- Configuration.
- Users/roles.
- Training.

## Phase 5 — UAT

Implement:

- Test cases.
- Execution.
- Defects.
- Retesting.
- UAT approval.

## Phase 6 — Go-live lifecycle

Implement:

- Go-live readiness.
- Approval.
- Go-live recording.
- Hypercare.
- Stabilization.

## Phase 7 — Closure

Implement:

- Completion sign-off.
- Handover.
- Customer check-ins.
- Post-handover review.

## Phase 8 — Automation

Add:

- Automated health checks.
- Automatic reminders.
- Scheduled activities.
- Escalations.
- Deployment metrics.
- Dashboards.

---

# 26. Acceptance Criteria

The implementation is successful when:

- A deployment cannot progress through required stages without satisfying its gates.
- Stage 5 cannot activate until Stages 1–4 are complete.
- Stage 6 uses the existing provisioning engine.
- Partial provisioning is visible as a deployment exception.
- Existing provisioning repair mechanisms remain functional.
- Migration can be marked not required.
- Users and roles are tracked as deployment work.
- UAT has structured test cases and defects.
- Critical UAT defects can block go-live.
- Go-live requires explicit readiness and approval.
- Hypercare dates are automatically calculated.
- Stabilization periods are configurable.
- Completion sign-off is controlled.
- Handover creates a support-ready package.
- Post-handover reviews are recorded.
- All lifecycle transitions are auditable.
- Overrides require a reason and preserve the original failed condition.
- Tenant isolation and server-side authorization remain enforced.
- Existing hospital provisioning functionality continues to work.

---

# 27. Final Target

The final Manage Platform should provide a single operational view of every hospital deployment:

```text
                    MANAGE PLATFORM
                           │
                    DEPLOYMENT CONTROL
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   PREPARATION        IMPLEMENTATION       OPERATIONS
        │                  │                  │
 Authorization       Provisioning          Go-Live
 Readiness            Migration             Hypercare
 Kickoff              Configuration         Stabilization
 Documents            Users/Roles
 Team                 Training
 Work Order           UAT
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                       CLOSURE
                           │
                 Sign-off → Handover
                           │
                  Post-Handover Review
                           │
                       CLOSED
```

The objective is not simply to show whether a hospital has been provisioned.

The objective is to make Manage Platform capable of answering, at any point:

> **Where is this hospital in its deployment lifecycle?**
>
> **What has been completed?**
>
> **What has failed?**
>
> **What is blocking progression?**
>
> **Who is responsible?**
>
> **What evidence exists?**
>
> **What approval is required?**
>
> **What happens next?**
>
> **Is this hospital actually ready to go live or be handed over?**

