# Sponsorship Request Approval Workflow – Technical Assessment

## Overview
- **Role:** Senior Full Stack .NET Developer
- **Submission Deadline:** 4 Days
- **Estimated Duration:** 6 hours
- **Tech Stack:** .NET 8 / .NET 10 (preferred), React / Angular / Vue / Blazor
- **Database:** MySQL / PostgreSQL
- **Hosting:** Must provide live testing URL

## Objective
Build a simplified Sponsorship Request Form with an approval workflow to evaluate:
- Workflow-based enterprise module design
- Approval logic implementation
- Role-based access control (RBAC)
- Frontend–backend integration
- Clean backend APIs
- Clear architecture explanation

---

## Business Scenario
A company receives sponsorship requests from internal staff. Each request must go through an approval process before approval or rejection.

### Workflow Stages
1. **Draft** – Request created but not submitted  
2. **Pending Manager Approval** – Submitted, awaiting manager decision  
3. **Pending Finance Review** – Manager approved, awaiting finance review  
4. **Approved** – Fully approved  
5. **Rejected** – Rejected by manager or finance  
6. **Cancelled** – Cancelled by requestor before approval  

---

## User Roles & Responsibilities
- **Requestor** – Submit sponsorship request  
- **Manager** – Review and approve/reject request  
- **Finance Admin** – Final review and approval  
- **System Admin** – View all requests, manage settings  

---

## Form Fields
### Basic Information
- Request Title  
- Requestor Name  
- Department  
- Sponsorship Type  
- Event / Organisation Name  
- Event Date  
- Requested Amount  
- Purpose / Justification  

### Optional Fields
- Supporting Document Upload  
- Expected Business Benefit  
- Remarks  

---

## Functional Requirements
### 1. Login & Role Access
- Roles: Requestor, Manager, Finance Admin, System Admin  
- Each role sees different actions  

### 2. Requestor Functions
- Create sponsorship request  
- Save as draft  
- Submit request  
- View own requests  
- Cancel request if not yet approved  

### 3. Manager Functions
- View pending approvals  
- Approve / Reject request  
- Add approval remarks  

### 4. Finance Admin Functions
- View pending finance reviews  
- Approve / Reject request  
- Add finance remarks  

### 5. System Admin Functions
- View all requests  
- View workflow history  
- Manage sponsorship types  

---

## Deliverables
1. **Git Repository**  
   - Source code  
   - Proper commits  
   - README  

2. **Working Application**  
   - Backend API  
   - Frontend UI  
   - Database setup  

3. **Setup Guide (README)**  
   - Run backend  
   - Run frontend  
   - Database setup  
   - Test login accounts  

4. **Architecture Explanation**  
   - Backend architecture  
   - Frontend structure  
   - Workflow logic  
   - RBAC logic  
   - Database design  
   - Assumptions/tradeoffs  

5. **Hosting Requirement**  
   - Frontend testing URL  
   - Backend API URL  
   - Swagger / API documentation URL  
   - Test login accounts  
   - Git repository link  
   - Deployment notes  

---

## Notes
- Not expected to be a full production system.  
- Assessment focuses on:  
  - Solution structure  
  - Thought process  
  - Communication clarity  
  - Tradeoff management  
  - Workflow-based enterprise design  
- Time extension requests may be submitted via email with justification.
