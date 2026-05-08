# Insight World System Architecture
## Technical Blueprint and System Specification

---

## 1. Project Vision and Architectural Essence
**Insight World** is a high-fidelity Content Management Engine designed to replicate the operational environment of a professional digital newsroom. Engineered during an intensive internship at Imark Pvt Ltd, it bridges the gap between academic theory and enterprise-grade software engineering, prioritizing institutional trust and high-performance news delivery.

### Core Strategic Pillars
*   **System Security**: Implements a stateless JWT (JSON Web Token) architecture with granular Role-Based Access Control (RBAC) and bcrypt-hashed credential persistence.
*   **Editorial Integrity**: A rigid, state-machine driven workflow ensures that all content undergoes administrative review before public dissemination.
*   **Institutional Design**: A premium Glassmorphic UI leveraging depth, blur effects, and high-impact typography (900-weight All-Caps headlines) for a professional, authoritative user experience.
*   **Real-time Intelligence**: Integrated analytical dashboards that aggregate cross-collection metrics (Views, Likes, Trends) using non-blocking concurrent aggregation pipelines.
*   **Global Reach**: Native, bi-directional translation support for English and Nepali, ensuring multi-lingual accessibility for a diverse audience.

---

## 2. Layered Architecture Design
The system is built upon a decoupled layered architecture, ensuring separation of concerns and protecting the integrity of business logic.

### 2.1 Presentation Layer (The "Discovery Universe")
*   **Reactive Framework**: Developed with React.js (v18), utilizing a modular component-based architecture for high reusability.
*   **Universe Explorer Logic**: A sophisticated discovery engine that synchronizes local state with URL search parameters, ensuring every filtered news view is shareable and persistent.
*   **Institutional Typography**: Standardized journalistic styling using Extra Bold weights and title-case/uppercase transformations to maintain an authoritative editorial voice.
*   **Soft Paywall Mechanism**: A strategic content-hydration layer that detects authentication states to provide either full access or masked, high-conversion previews to visitors.

### 2.2 Application Logic Layer
*   **System Orchestrator**: Developed using Node.js and Express, this layer enforces all business rules and content workflows.
*   **Authorization Guards**: Every request is intercepted by RBAC middleware. Attempted privilege escalation (e.g., a Publisher attempting administrative approvals) is blocked at the logic level.
*   **Workflow Transparency**: The codebase is documented with "Workflow Overviews"—natural-language descriptions of complex logic blocks—to ensure architectural clarity for maintainers.

### 2.3 Data Persistence Layer
*   **Storage**: MongoDB (Atlas) for flexible document management.
*   **Schemas**: Mongoose modeling for complex author-content relations.

---

## 3. Comprehensive API Registry

### 3.1 Authentication & Identity (`/api/auth`)
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/register` | POST | Guest | New user onboarding with encrypted hashing. |
| `/login` | POST | Guest | Identity validation and JWT issuance. |
| `/me` | GET | Auth | Returns session-active user profile data. |
| `/update-profile` | PUT | Auth | Modifies biographical and contact metadata. |
| `/change-password`| PUT | Auth | Secure high-entropy credential rotation. |

### 3.2 Content & Discovery (`/api/articles`)
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/` | GET | Guest | Primary feed with search, category & pagination. |
| `/:id` | GET | Guest | Deep-fetch logic with soft-paywall masking. |
| `/` | POST | Pub/Admin| Strategic creation of multimedia news assets. |
| `/:id` | PUT | Pub/Admin| Editorial revision of existing news resources. |
| `/:id/like` | POST | Reader | Real-time audience engagement toggle. |
| `/trending` | GET | Guest | Fetches high-velocity content based on views. |

### 3.3 Intelligence & Analytics (`/api/analytics`)
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/dashboard` | GET | Admin | Platform-wide aggregation of system health. |
| `/categories` | GET | Admin | Content saturation metrics by category. |
| `/publisher` | GET | Pub/Admin| Personalized creator reach and trend analysis. |
| `/trends` | GET | Admin | 7-day velocity tracking for system growth. |

### 3.4 Administrative Oversight (`/api/admin`)
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/articles` | GET | Admin | Master queue for pending editorial review. |
| `/articles/:id/approve` | PUT | Admin | The formal publication trigger. |
| `/staff` | GET | Admin | Comprehensive staff directory management. |
| `/staff/:id/role`| PUT | Admin | Privilege escalation/de-escalation logic. |

---

## 4. Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime Engine** | Node.js | Provides non-blocking I/O for efficient handling of concurrent requests. |
| **API Framework** | Express.js | A minimalist framework facilitating clean RESTful endpoint design. |
| **Persistence** | MongoDB | Handles diverse metadata, multi-lingual fragments, and media assets seamlessly. |
| **Security** | JWT & Bcrypt | Enables stateless authentication with high-entropy cryptographic hashing. |
| **Frontend** | React.js | Virtual DOM optimization and a robust modular component ecosystem. |
| **Analytics** | Chart.js | Orchestrates real-time data visualization for the Control Center. |

---

## 4. Comprehensive System Directory Structure

```bash
intern_newsportal/
├── backend/                # Server-side logic & REST API
│   ├── controllers/        # Business logic & request handling
│   ├── middleware/         # Auth, RBAC & Multer security guards
│   ├── models/             # Mongoose Schema Definitions (User, Article, Category)
│   ├── routes/             # Modular API traffic control
│   ├── uploads/            # Physical media repository (with Fallback system)
│   ├── seeder.js           # Secure system reset and data initialization
│   └── server.js           # Application Entry Point & Orchestration
├── client/                 # React Client Ecosystem (Frontend)
│   ├── src/
│   │   ├── components/     # High-fidelity UI building blocks (Layout, Common)
│   │   ├── contexts/       # Global state management (Auth, Theme, Bookmarks)
│   │   ├── pages/          # Domain-specific modules (Home, Articles, Categories, Admin)
│   │   └── index.css       # Core Design System (Glassmorphism & Typography)
│   └── package.json        # Frontend-specific dependencies
├── package.json            # Root orchestrator (Concurrently)
└── systemarchitecture.md   # This documentation
```

---

## 5. Content Lifecycle (The "Editorial Pulse")
The system enforces strict editorial discipline through a monitored pipeline:
1.  **Draft**: A private environment for the Publisher. Invisible to the public and administration.
2.  **Pending**: The review stage. The article is locked and submitted for administrative oversight.
3.  **Published**: The final state. The article becomes visible to Readers and triggers subscriber alerts.
4.  **Discovery**: High-impact headlines and premium badges ensure content is surfaced effectively to the relevant audience.

---

## 6. Future Roadmap
*   **Automated Moderation**: Implementation of NLP-based safety checks for automated content filtering.
*   **Media Cloud Migration**: Transitioning from local `uploads/` to a professional CDN (e.g., Cloudinary).
*   **Engagement Gamification**: Rewarding top publishers based on verified analytics and audience retention.
