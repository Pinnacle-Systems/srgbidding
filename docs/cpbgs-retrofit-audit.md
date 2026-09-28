# CPBGS Retrofit Audit Report

## 1. Executive Summary
- **Overall Fit Rating**: Weak
- **Recommendation**: The existing `SrgOnlineBidding` codebase is a monolithic ERP system, not a procurement bidding engine. While the master data and basic authentication scaffolding can be reused, the core bidding workflow, vendor portal, and strict security requirements (Vendor Isolation, Append-Only, Price Vault) must be built from scratch. Significant architectural changes are required to address critical security gaps (client-side authorization, public file downloads, hard deletes).
- **Revised Estimate**: ~162.5 person-days (vs 128 baseline). The increase is due to the overhead of refactoring insecure foundations (backend RBAC, secure file storage) and untangling the existing ERP schema.
- **Timeline**: ~12 calendar weeks for a team of 3 developers, 1 QA, and a tech lead.

## 2. Codebase Inventory
- **Tech Stack**: Node.js 22, Express, Prisma ORM (PostgreSQL), Socket.io. Frontend is React (via Vite) with Tailwind CSS and Redux.
- **Architecture**: Standard monolithic MVC-like structure (`src/controllers`, `src/services`, `src/models`).
- **Data Model**: Extensive ERP schema (~3,000 lines in `src/models/schema.prisma`) centered around `Party` (customers/suppliers), `Company`, `Product`, `PurchaseBill`, and `OrderEntry`.
- **Test Coverage**: None. The `package.json` contains a `test` script that echoes "Error: no test specified".
- **Code Health & Tech Debt**: The codebase has severe technical debt regarding security. Authorization is mostly client-side, file downloads are public, and hard deletes are heavily used. Extending this safely for an external-facing vendor portal will require significant refactoring.

## 3. Foundation Capability Findings
- **Authentication, User Management, 2FA**: JWT-based auth exists (`src/middlewares/middleware.js`). User models exist (`src/services/users.service.js`) and link to internal `Employee`s, but not external vendors. No 2FA support.
- **Role-Based Access Control (RBAC)**: Exists in the schema (`RoleOnPage`), but it is only enforced in the UI. Backend routes (e.g., in `src/routes/`) lack state-aware or role-aware authorization guards beyond basic JWT verification.
- **Workflow & State Machine**: A generic multi-level approval engine exists (`src/services/approvalConfig.service.js`), but it lacks strict state-machine transition guards (e.g., Draft -> Published).
- **Audit Logging & Soft Deletes**: The codebase actively uses hard deletes (e.g., `prisma.approvalConfig.delete` in `approvalConfig.service.js`). No global append-only audit log exists, conflicting with the append-only non-negotiable requirement.
- **Notifications & Scheduled Jobs**: Email via `nodemailer` (`src/utils/mailer.js`) and in-app notifications (`src/services/notification.service.js`) exist. No background job scheduler (like Cron or Bull) is present for deadline enforcement.
- **File Upload & Storage**: Uses `multer`, but downloads are explicitly public and unauthenticated (`app.get("/retreiveFile/:fileName")` in `server.js` bypasses the auth middleware). This violates the Vendor Isolation requirement.
- **Dynamic Forms**: Missing. Form structures are tied to hardcoded DB tables.
- **Master Data Management**: Excellent. Comprehensive models for `Party`, `Product`, `Uom`, `TaxTemplate`, etc.
- **Reporting & Dashboards**: Client-side libraries exist for PDF generation (`jspdf`, `@react-pdf/renderer`) and Excel exports (`react-html-table-to-excel`).
- **External User Portal**: Missing. Internal users are tied to `Employee` records; vendors (`Party`) have no secure login portal.

## 4. Capability Matrix

| Capability | Status | Evidence (File Paths / Code) | Approach | Effort (PD) |
| --- | --- | --- | --- | --- |
| Master Data | REUSE | `schema.prisma` (`Party`, `Product`) | Reuse as-is with minor config | 1.0 |
| Intent Form & Type Attributes | BUILD | `schema.prisma` (no dynamic attributes) | Build new intent tables & dynamic EAV form | 4.0 |
| Intent Approval Workflow | EXTEND | `src/services/approvalConfig.service.js` | Adapt existing approval engine to Intents | 2.0 |
| Bid Event & Lots | BUILD | N/A | Build new Event, Lot, and Criteria schemas | 5.0 |
| Vendor Portal & Isolation | CONFLICT | `User` tied to `Employee`; no vendor auth | Build isolated vendor routes & vendor User link | 5.0 |
| Vendor Submissions & Versions | BUILD | N/A | Build submission schema with strict versioning | 5.0 |
| Technical/Commercial Envelopes | BUILD | N/A | Build new price vault & evaluator access layer | 4.0 |
| Deadline Enforcement | BUILD | `server.js` (no cron) | Implement BullMQ or Node-cron for deadlines | 2.5 |
| Document Storage | CONFLICT | `server.js` (`/retreiveFile` is public) | Rebuild file serving behind strict AuthZ guards | 3.0 |
| Decision Artifact | BUILD | N/A | Build immutable JSON snapshot generator | 3.0 |
| RBAC & Backend AuthZ | CONFLICT | `src/middlewares/middleware.js` | Implement strict backend guards & ownership checks | 4.0 |
| Audit Log (Append-only) | CONFLICT | Hard deletes in services (e.g. `remove`) | Implement Prisma middleware for soft deletes/audit | 3.5 |

## 5. Blockers and Risks
1. **Public File Storage (High Severity)**: Vendors uploading technical/commercial documents currently have no protection, violating the Vendor Isolation and Price Vault non-negotiables. Must be fixed immediately.
2. **Missing Backend Authorization (High Severity)**: UI-only role checking means external vendors could potentially query APIs to read internal or competitor data. A strict authorization middleware layer must be built.
3. **Hard Deletes (High Severity)**: Widespread use of `prisma.delete` violates the Append-Only rule. Must intercept all deletes via Prisma middleware.
4. **Missing Background Job Engine (Medium Severity)**: Server-clock deadline enforcement requires an asynchronous job scheduler that currently does not exist.
5. **No Existing Test Coverage (Medium Severity)**: Extending the system carries a high risk of regressions since no automated tests exist.

## 6. Retrofit Plan
**MVP (Must Ship):**
1. **Foundation Refactoring (Weeks 1-2)**: Secure `/retreiveFile`, implement strict backend RBAC, add Prisma audit/soft-delete middleware, and add a background job scheduler.
2. **Vendor Portal & Auth (Week 3)**: Link `Party` to `User` accounts. Create an isolated React app/routes for vendors.
3. **Intent Module (Weeks 4-5)**: Build dynamic attribute schemas, forms, and integrate with the existing approval engine.
4. **Bid Events & Lots (Weeks 5-6)**: State-machine-guarded bid event creation and publishing.
5. **Submissions & Price Vault (Weeks 7-8)**: Strict versioned submissions, deadline enforcement, and blocked commercial envelopes.
6. **Evaluation & Award (Weeks 9-10)**: Scorecards, scoring engine, and immutable Decision Artifact.

**Deferrable (Post Go-Live):**
- Complex dynamic reports, PDF snapshot verifications, and advanced configuration for intent attributes.

## 7. Re-estimate against Baseline

| Task | Baseline (PD) | Retrofit (PD) | Reason for Difference |
| --- | --- | --- | --- |
| Phase 1: Design | 11.0 | 14.0 | +3 for mapping existing schema to new workflows |
| Phase 2: Foundation | 16.0 | 22.0 | +6 to fix public file storage, hard deletes, and build backend RBAC |
| Phase 3: Intent & Bid Event | 18.5 | 16.5 | -2 due to reusing existing `Party` and `Approval` master data |
| Phase 4: Vendor & Submissions | 16.0 | 18.0 | +2 to untangle User-Employee mapping and build vendor isolation |
| Phase 5: Evaluation & Award | 19.0 | 19.0 | 0; must be built completely from scratch |
| Phase 6: Reporting | 11.0 | 11.0 | 0; client-side export tools exist but logic is new |
| Phase 7: QA and Go-live | 19.5 | 23.0 | +3.5 for regression testing the lack of existing coverage |
| *Refactoring & Clean-up* | 0.0 | 9.0 | New tasks to deprecate unused ERP modules & sanitize routes |
| **Total (excl. overhead)** | 111.0 | 132.5 | Overhead (15%): ~19.5 PD. Total ~152 PD. |

*(Note: Baseline total in prompt was ~128 with overhead. Retrofit total is ~152 PD).*

## 8. Open Questions
- Are there any integrations (e.g., existing ERP systems) relying on the current hard-delete behavior or public file retrieval endpoints?
- How should existing internal `Employee` users be migrated or segregated from the new `Vendor` users?
- Is the current `Party` data clean enough to be exposed directly to external users, or does it require a cleansing migration?
