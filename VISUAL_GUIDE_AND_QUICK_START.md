# 📊 VISUAL WORKFLOW & QUICK START GUIDE

## 🎯 System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPONSORSHIP WORKFLOW SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                          REQUESTOR                               │
├──────────────────────────────────────────────────────────────────┤
│  1. Create Request (Draft)                                       │
│  2. Edit & Save Draft                                            │
│  3. Submit for Approval → PendingManagerApproval                 │
│  4. View Status & History                                        │
│  5. Cancel (if not approved)                                     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │    MANAGER      │
                    ├─────────────────┤
                    │  Review Request │
                    │  - Approve      │→ PendingFinanceReview
                    │  - Reject       │→ Rejected
                    └─────────────────┘
                              ↓ (if approved)
                    ┌─────────────────┐
                    │  FINANCE ADMIN  │
                    ├─────────────────┤
                    │  Final Review   │
                    │  - Approve      │→ Approved ✓
                    │  - Reject       │→ Rejected ✗
                    └─────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  SYSTEM ADMIN   │
                    ├─────────────────┤
                    │  View All       │
                    │  View History   │
                    │  Export Data    │
                    └─────────────────┘
```

---

## 🔄 Data Flow Diagram

```
FRONTEND (Angular)                 BACKEND (.NET 10)
━━━━━━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━

┌─────────────────┐                ┌──────────────┐
│  Components     │                │  Endpoints   │
│  Dashboard      │────────────────│  GET/POST    │
│  Form           │   HTTP/REST    │  PUT/DELETE  │
│  Approval List  │────────────────│              │
│  Detail         │                └──────┬───────┘
│  Admin View     │                       │
└────────┬────────┘                       ↓
         │                        ┌──────────────────┐
         │                        │ MediatR Pipeline │
         │                        │ - Validators     │
         │                        │ - Behaviors      │
         │                        │ - Handlers       │
         │                        └──────┬───────────┘
         │                               ↓
         │                        ┌──────────────────┐
         ↓                        │ Application      │
    ┌─────────────┐              │ Commands/Queries │
    │ RxJS        │              └──────┬───────────┘
    │ Services    │                     ↓
    │ TypeScript  │              ┌──────────────────┐
    └─────────────┘              │ Domain Logic     │
                                 │ Entity Framework │
                                 │ Repositories     │
                                 └──────┬───────────┘
                                        ↓
                                 ┌──────────────────┐
                                 │ PostgreSQL DB    │
                                 │ - Requests       │
                                 │ - Approvals      │
                                 │ - Types          │
                                 └──────────────────┘
```

---

## 🗺️ File Structure Map

```
TechAssessment/
├── src/
│   ├── Domain/                          (Domain Layer)
│   │   ├── Entities/
│   │   │   ├── SponsorshipRequest.cs       [NEW]
│   │   │   ├── SponsorshipRequestApproval.cs [NEW]
│   │   │   └── SponsorshipType.cs          [NEW]
│   │   └── Enums/
│   │       ├── SponsorshipRequestStatus.cs [NEW]
│   │       └── ApprovalAction.cs           [NEW]
│   │
│   ├── Application/                    (Application Layer)
│   │   └── SponsorshipRequests/         [NEW]
│   │       ├── Commands/                [NEW]
│   │       │   ├── CreateSponsorshipRequest/
│   │       │   ├── SubmitSponsorshipRequest/
│   │       │   ├── ApproveRequest/
│   │       │   ├── RejectRequest/
│   │       │   ├── CancelRequest/
│   │       │   └── UpdateSponsorshipRequest/
│   │       └── Queries/                 [NEW]
│   │           ├── GetMyRequests/
│   │           ├── GetPendingApprovals/
│   │           ├── GetRequestDetail/
│   │           ├── GetAllRequests/
│   │           └── GetSponsorshipTypes/
│   │
│   ├── Infrastructure/                 (Infrastructure Layer)
│   │   └── Data/
│   │       └── Configurations/
│   │           ├── SponsorshipRequestConfiguration.cs [NEW]
│   │           ├── SponsorshipRequestApprovalConfiguration.cs [NEW]
│   │           └── SponsorshipTypeConfiguration.cs [NEW]
│   │
│   ├── Web/                            (Web/API Layer)
│   │   ├── Endpoints/
│   │   │   ├── SponsorshipRequests.cs   [NEW]
│   │   │   ├── ManagerApprovals.cs      [NEW]
│   │   │   ├── FinanceApprovals.cs      [NEW]
│   │   │   ├── AdminRequests.cs         [NEW]
│   │   │   └── SponsorshipTypes.cs      [NEW]
│   │   └── ClientApp/                   (Angular Frontend)
│   │       └── src/
│   │           └── app/
│   │               ├── sponsorship/     [NEW MODULE]
│   │               │   ├── sponsorship-dashboard/
│   │               │   ├── sponsorship-form/
│   │               │   ├── sponsorship-detail/
│   │               │   ├── approval-list/
│   │               │   ├── approval-review/
│   │               │   ├── admin-dashboard/
│   │               │   ├── workflow-history/
│   │               │   ├── sponsorship.module.ts
│   │               │   └── sponsorship-routing.module.ts
│   │               ├── models/
│   │               │   ├── sponsorship-request.model.ts
│   │               │   ├── sponsorship-type.model.ts
│   │               │   └── workflow-status.model.ts
│   │               └── services/
│   │                   ├── sponsorship.service.ts
│   │                   ├── approval.service.ts
│   │                   ├── sponsorship-type.service.ts
│   │                   └── workflow.service.ts
│   │
│   └── tests/                          (Test Projects)
│       ├── Application.UnitTests/
│       ├── Infrastructure.IntegrationTests/
│       └── Web.AcceptanceTests/

Deleted:
✗ Todo-related folders
✗ Weather components
✗ Counter component
```

---

## 📱 Frontend Route Map

```
                        /sponsorship
                             |
        ┌────────────────────┼────────────────────┐
        |                    |                    |
    [Root]             [/list]              [/create]
   Dashboard           My Requests          New Form
        |                                        |
        ├─ [/:id] ─────────────────────────────→ Detail View
        |                                        |
        ├─ [/edit/:id]                     Edit Draft
        |
        ├─ [/approvals/manager]
        |       ├─ [Manager Pending List]
        |       └─ [/:id]
        |           └─ Review & Approve/Reject
        |
        ├─ [/approvals/finance]
        |       ├─ [Finance Pending List]
        |       └─ [/:id]
        |           └─ Review & Approve/Reject
        |
        └─ [/admin]
                ├─ [Admin Dashboard]
                │   ├─ View All Requests
                │   ├─ Filter by Status/Department
                │   └─ Export to CSV
                └─ [/history/:id]
                    └─ View Approval History
```

---

## 📊 API Endpoint Map

```
BASE URL: /api/

REQUESTOR ENDPOINTS:
POST   /sponsorship-requests              → Create request
GET    /sponsorship-requests              → Get my requests
GET    /sponsorship-requests/{id}         → Get request detail
PUT    /sponsorship-requests/{id}         → Update draft
POST   /sponsorship-requests/{id}/submit  → Submit request
POST   /sponsorship-requests/{id}/cancel  → Cancel request

MANAGER ENDPOINTS:
GET    /manager-approvals                 → Get pending
POST   /manager-approvals/{id}/approve    → Approve
POST   /manager-approvals/{id}/reject     → Reject

FINANCE ENDPOINTS:
GET    /finance-approvals                 → Get pending
POST   /finance-approvals/{id}/approve    → Approve
POST   /finance-approvals/{id}/reject     → Reject

ADMIN ENDPOINTS:
GET    /admin/requests                    → Get all requests
GET    /admin/requests/{id}/history       → Get workflow history

LOOKUP ENDPOINTS:
GET    /sponsorship-types                 → Get types
```

---

## 🔐 Authorization Matrix

```
                    Requestor  Manager  Finance  Admin
────────────────────────────────────────────────────────
Create Request         ✓         ✗        ✗       ✗
View Own Requests      ✓         ✗        ✗       ✗
View All Requests      ✗         ✗        ✗       ✓
Submit Request         ✓         ✗        ✗       ✗
Cancel Request         ✓         ✗        ✗       ✗
Manager Approvals      ✗         ✓        ✗       ✗
Finance Approvals      ✗         ✗        ✓       ✓
View Workflow History  ✗         ✗        ✗       ✓
Export Data            ✗         ✗        ✗       ✓
```

---

## 💾 Database Schema Overview

```
sponsorship_requests
├── id (PK)
├── requestor_id (FK → AspNetUsers)
├── title, department, event_name
├── sponsorship_type_id (FK → sponsorship_types)
├── event_date, requested_amount
├── purpose, business_benefit, supporting_document_url
├── status (enum: Draft, Pending Manager, Pending Finance, Approved, Rejected, Cancelled)
├── manager_approval_remarks, finance_approval_remarks
├── cancelled_reason, cancelled_at
├── created_at, created_by, last_modified_at, last_modified_by
└── Indexes: status, requestor_id, created_at

sponsorship_request_approvals
├── id (PK)
├── sponsorship_request_id (FK → sponsorship_requests)
├── approver_id (FK → AspNetUsers)
├── approver_role (Manager, FinanceAdmin)
├── action (Approve, Reject)
├── comments
├── approved_at
└── Indexes: request_id, approver_id

sponsorship_types
├── id (PK)
├── name (UNIQUE)
├── description
├── is_active
└── Seed Data: Conference, Training, Community Event, Research
```

---

## 🧪 Workflow State Machine

```
                           START
                             |
                             ↓
                    ┌─────────────────┐
                    │     DRAFT       │ ← Requestor creates
                    │   (Requestor    │
                    │  can edit/save) │
                    └────────┬────────┘
                             |
            ┌────────────────┴────────────────┐
            |                                  |
    Requestor Submit                    Requestor Cancel
            |                                  |
            ↓                                  ↓
  ┌──────────────────┐              ┌─────────────────┐
  │ PENDING MANAGER  │              │    CANCELLED    │
  │   APPROVAL       │              │   (Terminal)    │
  │  (Manager can    │              └─────────────────┘
  │   approve/reject)│
  └────────┬─────────┘
           |
        ┌──┴──┐
        |     |
    Manager Approve    Manager Reject
        |                  |
        ↓                  ↓
  ┌──────────────────┐  ┌─────────────────┐
  │  PENDING         │  │    REJECTED     │
  │  FINANCE REVIEW  │  │   (Terminal)    │
  │ (Finance can     │  └─────────────────┘
  │  approve/reject) │
  └────────┬─────────┘
           |
        ┌──┴──┐
        |     |
   Finance  Finance
   Approve  Reject
        |     |
        ↓     ↓
  ┌──────────┐  ┌─────────────────┐
  │APPROVED  │  │   REJECTED      │
  │(Terminal)│  │  (Terminal)     │
  └──────────┘  └─────────────────┘
```

---

## 📈 Implementation Timeline

```
WEEK 1: BACKEND FOUNDATION
├─ Day 1-2: Domain Layer Setup
│  └─ Entities, Enums, DbContext updates
├─ Day 3-4: Commands & Queries
│  └─ Handlers, Validators, DTOs
└─ Day 5: Infrastructure & Endpoints
   └─ Configurations, Seeding, Endpoints

WEEK 2: FRONTEND
├─ Day 1-2: Models & Services
│  └─ DTOs, API Integration
├─ Day 3-4: Components
│  └─ Dashboard, Forms, Approvals, Admin
└─ Day 5: Routing & Integration
   └─ Module, Guards, Navigation

WEEK 3: TESTING & DEPLOYMENT
├─ Day 1-2: Integration Testing
├─ Day 3-4: Deployment Setup
└─ Day 5: Live Testing & Documentation
```

---

## 🎯 Quick Start (First 30 Minutes)

```
1. Read Documentation [10 min]
   └─ README_DOCUMENTATION_INDEX.md

2. Understand Architecture [15 min]
   └─ IMPLEMENTATION_GUIDE.md (first 20%)

3. Review Checklist [5 min]
   └─ IMPLEMENTATION_SUMMARY.md (checklist section)

RESULT: Clear understanding of what to build
NEXT: Follow BACKEND_CHECKLIST_PART1.md
```

---

## 🚀 Implementation Velocity

### Phase Estimates:
```
Domain Layer:        2 hours   (3 entities, 2 enums)
Commands:            3 hours   (6 commands with validation)
Queries:             2 hours   (5 queries)
Infrastructure:      1 hour    (configurations, seeding)
Endpoints:           1 hour    (5 endpoint groups)
Frontend Models:     1 hour    (3 models, 4 services)
Components:          3 hours   (7 components)
Routing:             1 hour    (module, guards, navigation)
Testing:             2 hours   (scenario testing)
Deployment:          1 hour    (database, hosting)
────────────────────────────
TOTAL:              17-20 hours
```

---

## 📞 Documentation Quick Links

| Task | Document | Time |
|------|----------|------|
| Understand System | IMPLEMENTATION_GUIDE.md | 30 min |
| Quick Reference | IMPLEMENTATION_SUMMARY.md | ongoing |
| Build Domain | BACKEND_CHECKLIST_PART1.md | 2 hrs |
| Build Commands | BACKEND_CHECKLIST_PART1.md | 3 hrs |
| Build Queries | BACKEND_CHECKLIST_PART2.md | 2 hrs |
| Setup Infrastructure | BACKEND_CHECKLIST_PART2.md | 1 hr |
| Create Endpoints | BACKEND_CHECKLIST_PART2.md | 1 hr |
| Build Frontend | FRONTEND_IMPLEMENTATION_PART1.md | 4 hrs |
| Setup Routing | FRONTEND_MODULE_ROUTING.md | 1 hr |
| Deploy | IMPLEMENTATION_SUMMARY.md | 1 hr |

---

## ✅ Verification Checklist (Every Hour)

```
☐ Code compiles without errors
☐ New files are in correct locations
☐ Namespaces are correct
☐ Using statements are imported
☐ Endpoints registered in Program.cs
☐ Services registered in DI container
☐ Routes configured correctly
☐ Authorization attributes in place
☐ Database migrations created
☐ Test data seeded
```

---

## 🎉 Success Indicators

When each phase is complete, you should have:

```
Domain Layer Complete:
✓ 3 new entity types in IDE
✓ 2 enums compile
✓ DbContext references 3 new DbSets

Commands Complete:
✓ 6 command classes
✓ 6 handler classes
✓ 6 validator classes
✓ All compile without errors

Queries Complete:
✓ 5 query classes
✓ 5 handler classes
✓ All compile without errors

Infrastructure Complete:
✓ 3 configuration classes
✓ Database updates seeding logic
✓ Migrations created

Endpoints Complete:
✓ 5 endpoint groups created
✓ 50+ endpoint methods
✓ Swagger shows all endpoints

Frontend Complete:
✓ 7 components with templates
✓ 4 services functional
✓ Routing configured
✓ No console errors
✓ Can navigate between pages

Testing Complete:
✓ Can create request as Requestor
✓ Can approve as Manager
✓ Can approve as Finance
✓ Can view all as Admin
✓ Role-based access working
```

---

## 🔗 Resource Map

```
NEED TO...                          SEE THIS...
────────────────────────────────────────────────────────
Understand the big picture          IMPLEMENTATION_GUIDE.md
Look up something quickly           IMPLEMENTATION_SUMMARY.md
Implement domain entities           BACKEND_CHECKLIST_PART1.md
Implement commands                  BACKEND_CHECKLIST_PART1.md
Implement queries                   BACKEND_CHECKLIST_PART2.md
Setup infrastructure                BACKEND_CHECKLIST_PART2.md
Create endpoints                    BACKEND_CHECKLIST_PART2.md
Create models                       FRONTEND_IMPLEMENTATION_PART1.md
Create services                     FRONTEND_IMPLEMENTATION_PART1.md
Create components                   FRONTEND_IMPLEMENTATION_PART1.md
Setup routing                       FRONTEND_MODULE_ROUTING.md
Test workflows                      IMPLEMENTATION_SUMMARY.md
Deploy application                  IMPLEMENTATION_SUMMARY.md
Navigate documentation              README_DOCUMENTATION_INDEX.md
```

---

## 🎓 Architecture Patterns Summary

```
┌─────────────────────────────────────────────┐
│           ARCHITECTURE PATTERNS              │
├─────────────────────────────────────────────┤
│                                              │
│  Clean Architecture                         │
│  └─ Domain → Application → Infrastructure  │
│                                              │
│  CQRS Pattern                               │
│  └─ Command & Query Separation              │
│                                              │
│  Repository Pattern                         │
│  └─ Data Access Abstraction                 │
│                                              │
│  Dependency Injection                       │
│  └─ Loose Coupling                          │
│                                              │
│  Fluent Validation                          │
│  └─ Input Validation Pipeline               │
│                                              │
│  Entity Framework Core                      │
│  └─ ORM for Data Access                     │
│                                              │
│  Angular Modules                            │
│  └─ Feature Module Pattern                  │
│                                              │
│  RxJS Observables                           │
│  └─ Reactive Programming                    │
│                                              │
│  Role-Based Access Control                  │
│  └─ Authorization Attributes & Guards       │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 📊 Code Organization

```
Backend Code:     ~5,500 lines
├─ Domain:        ~500 lines (entities, enums)
├─ Application:   ~2,500 lines (commands, queries, handlers)
├─ Infrastructure:~800 lines (configs, seeding)
└─ Web:           ~1,700 lines (endpoints)

Frontend Code:    ~3,000 lines
├─ Models:        ~200 lines
├─ Services:      ~1,000 lines
└─ Components:    ~1,800 lines (+ templates)

Total New Code:   ~8,500 lines
```

---

**This visual guide provides a complete overview of the system architecture and implementation roadmap. Combined with the 8 detailed documentation files, you have everything needed for successful implementation.**

**Happy coding! 🚀**
