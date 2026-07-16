# CAT Email Agent - Architecture Diagram

## System Architecture

```mermaid
graph TB
 User[" User Command<br/>Natural Language"]
 
 User -->|"delete spam emails"| Agent[" Email Agent<br/>Claude AI Orchestrator"]
 
 Agent -->|"Privacy Check"| Guards[" Privacy Guardrails<br/>Validation Layer"]
 
 Guards -->|"Valid Operation"| SessionClear[" Session Clear<br/>Remove Old Data"]
 Guards -->|"Invalid"| Blocked[" Blocked<br/>Export/Scraping/3rd-party"]
 
 SessionClear --> Claude[" Claude Model<br/>Anthropic API<br/>Language Understanding"]
 
 Claude -->|"Tool Selection"| ToolRouter[" Tool Router<br/>Route to Appropriate Tool"]
 
 ToolRouter --> Tools[" Tool Execution Layer"]
 
 Tools -->|"Search"| SearchTool[" Search Emails"]
 Tools -->|"Delete"| DeleteTool[" Delete Emails"]
 Tools -->|"Send"| SendTool[" Send Email"]
 Tools -->|"Archive"| ArchiveTool[" Archive"]
 Tools -->|"Classify"| ClassifyTool[" Spam Classifier"]
 Tools -->|"Block"| BlockTool[" Block Sender"]
 Tools -->|"Remember"| TemplateTool[" Reply Template"]
 
 SearchTool --> DataHandler[" Data Handler<br/>In-Memory Processing"]
 DeleteTool --> DataHandler
 SendTool --> DataHandler
 ArchiveTool --> DataHandler
 ClassifyTool --> DataHandler
 
 DataHandler -->|"Read/Write"| VolatileStorage[" Volatile Storage<br/>30s Auto-Cleanup"]
 
 BlockTool --> PrefsManager[" Preferences Manager<br/>Local Storage Only"]
 TemplateTool --> PrefsManager
 
 VolatileStorage -->|"Operations Only"| Gmail[" Gmail API<br/>User's Credentials<br/>OAuth 2.0"]
 
 Gmail --> GmailServer[" Gmail Server<br/>User's Account"]
 
 PrefsManager --> LocalFS[" Local File System<br/>Never Synced<br/>User Device Only"]
 
 GmailServer -->|"Operation Result"| Gmail
 
 Gmail --> VolatileStorage
 
 VolatileStorage -->|"Format Response"| Claude
 
 Claude -->|"Generate Reply"| Response[" Response<br/>Natural Language"]
 
 Response --> AutoCleanup[" Auto-Cleanup<br/>Clear All Temp Data"]
 
 AutoCleanup --> UserOutput[" Output to User"]
 
 UserOutput -->|"Session End"| HardDelete[" Hard Delete<br/>All Memory Wiped"]
 
 HardDelete --> Baseline[" Baseline<br/>80-120 MB"]
 
 Blocked -->|"Error"| UserOutput
 
 Claude -.->|"Content-Free Logging"| AuditLog[" Audit Log<br/>Operations Only<br/>Never Email Content"]
 
 style User fill:#e1f5ff
 style Agent fill:#fff3e0
 style Guards fill:#f3e5f5
 style Claude fill:#fff9c4
 style DataHandler fill:#e8f5e9
 style PrefsManager fill:#fce4ec
 style Gmail fill:#e0f2f1
 style GmailServer fill:#c8e6c9
 style LocalFS fill:#f1f8e9
 style Response fill:#e3f2fd
 style AuditLog fill:#eeeeee
 style Blocked fill:#ffebee
 style Baseline fill:#f5f5f5
```

---

## Data Flow Sequence

```mermaid
sequenceDiagram
 participant User
 participant Agent as Email Agent
 participant Guards as Privacy Guardrails
 participant Claude as Claude AI
 participant Tools as Email Tools
 participant Handler as Data Handler
 participant Gmail as Gmail API
 participant Prefs as Preferences
 
 User->>Agent: "delete spam from last week"
 
 Agent->>Guards: Validate command
 alt Invalid (export/scraping)
 Guards->>Agent: BLOCKED
 Agent->>User: Error: Privacy violation
 else Valid
 Guards->>Agent: VALID
 Agent->>Handler: Clear old session data
 Handler->>Handler: Remove old volatiles
 
 Agent->>Claude: Process with system prompt
 Claude->>Claude: Analyze intent
 Claude->>Tools: Use search_emails tool
 
 Tools->>Handler: Store search params (volatile)
 Tools->>Gmail: Query emails via OAuth
 Gmail->>Tools: Return email list
 
 Tools->>Handler: Store results (volatile)
 Tools->>Claude: Return found emails
 
 Claude->>Tools: Use classify_emails tool
 Tools->>Handler: Load emails from volatile
 Tools->>Tools: Classify each email
 Tools->>Handler: Store classifications
 Tools->>Claude: Return spam emails
 
 Claude->>Tools: Use delete_emails tool
 Tools->>Gmail: Delete via OAuth
 Gmail->>Tools: Confirm deletion
 
 Handler->>Prefs: Check preferences (non-volatile)
 Prefs->>Handler: Return block list
 
 Claude->>Agent: Generate response text
 Agent->>AuditLog: Log operation (no content)
 AuditLog->>AuditLog: Store: "delete" "23 emails" "success"
 
 Agent->>Handler: Trigger cleanup
 Handler->>Handler: Clear all volatile data
 
 Agent->>User: "Deleted 23 spam emails"
 end
```

---

## Memory Architecture

```mermaid
graph LR
 subgraph Runtime[" Runtime Memory"]
 NodeJS["Node.js<br/>~30 MB"]
 Deps["Dependencies<br/>~20-40 MB"]
 Code["Agent Code<br/>~10 MB"]
 end
 
 Runtime -->|Baseline| Idle[" Idle State<br/>~80 MB"]
 
 subgraph Processing[" Processing Memory"]
 Volatile["Volatile Storage<br/>TTL: 30s"]
 TempData["Temp Data<br/>Email Content"]
 Results["Operation Results<br/>"]
 end
 
 Idle -->|Operation Start| Processing
 
 Processing -->|Peak| Peak[" Peak Usage<br/>150-250 MB"]
 
 Peak -->|Cleanup| AutoClean[" Auto-Cleanup<br/>GC & Clear"]
 
 AutoClean -->|Return| Idle
 
 subgraph Persistent[" Persistent Storage"]
 Prefs["Preferences<br/>Block lists<br/>Templates"]
 Logs["Audit Logs<br/>Operations only<br/>No content"]
 end
 
 Persistent -->|Local File System Only| LocalDisk[" User Device<br/>Never Synced"]
 
 style Runtime fill:#e3f2fd
 style Idle fill:#c8e6c9
 style Processing fill:#fff9c4
 style Peak fill:#ffccbc
 style AutoClean fill:#e1bee7
 style Persistent fill:#fce4ec
 style LocalDisk fill:#f1f8e9
```

---

## Privacy & Security Layers

```mermaid
graph TB
 subgraph Incoming[" Incoming Layer"]
 Cmd["User Command"]
 Validate["Privacy Validation"]
 Terms["Blocked Terms Check<br/>export, backup, scrape,<br/>share, forward, etc."]
 end
 
 Cmd --> Validate
 Validate --> Terms
 
 subgraph Processing[" Processing Layer"]
 DataH["Data Handler<br/>In-Memory Only"]
 Volatile["Volatile Storage<br/>Auto-Cleanup"]
 Session["Session Isolation<br/>Fresh per command"]
 end
 
 Terms -->|"[OK] Valid"| DataH
 Terms -->|" Invalid"| Reject[" Reject & Log"]
 
 DataH --> Volatile
 DataH --> Session
 
 subgraph Operations[" Operations Layer"]
 Search["Search (Read)"]
 Delete["Delete (Write)"]
 Send["Send (Write)"]
 Archive["Archive (Write)"]
 end
 
 Volatile --> Operations
 
 subgraph Gmail[" External Layer"]
 OAuth["OAuth 2.0<br/>Your Credentials"]
 API["Gmail API<br/>Encrypted HTTPS"]
 end
 
 Operations -->|"Read/Write Only"| OAuth
 OAuth --> API
 
 subgraph LocalStorage[" Local Storage Layer"]
 Prefs["Preferences<br/>Block lists<br/>Templates"]
 Config["Config.json<br/>Encrypted"]
 Logs["Audit Logs<br/>Operations only"]
 end
 
 Operations -.->|"Optional Memory Only"| Prefs
 Operations -.->|"Content-Free Only"| Logs
 
 subgraph Cleanup[" Cleanup Layer"]
 AutoClear["Automatic<br/>30s TTL"]
 SessionEnd["Session End<br/>Hard Delete"]
 GC["Garbage Collection<br/>V8 Engine"]
 end
 
 Volatile --> AutoClear
 Session --> SessionEnd
 AutoClear --> GC
 SessionEnd --> GC
 
 GC -->|"Back to Baseline"| Complete["[OK] Complete<br/>~80 MB"]
 Reject -->|"No Data Retained"| Complete
 
 style Incoming fill:#ffebee
 style Validate fill:#ffe0b2
 style Terms fill:#fff9c4
 style DataH fill:#e8f5e9
 style Volatile fill:#c8e6c9
 style Session fill:#b2dfdb
 style Operations fill:#e1f5fe
 style OAuth fill:#e0f2f1
 style API fill:#80deea
 style Prefs fill:#f3e5f5
 style Config fill:#e1bee7
 style Logs fill:#eeeeee
 style AutoClear fill:#f1f8e9
 style SessionEnd fill:#c8e6c9
 style GC fill:#b2ebf2
 style Complete fill:#a5d6a7
```

---

## Module Dependencies

```mermaid
graph LR
 Index["index.ts<br/>Entry Point"]
 
 Index --> Agent["email-agent.ts<br/>Main Orchestrator"]
 
 Agent --> Tools["email-tools.ts<br/>Tool Definitions"]
 Agent --> Guards["privacy-guardrails.ts<br/>Validation"]
 Agent --> Handler["data-handler.ts<br/>Memory Management"]
 
 Tools --> Gmail["gmail.ts<br/>Gmail API Adapter"]
 Tools --> Classifier["spam-classifier.ts<br/>Classification"]
 
 Agent --> Prefs["preferences.ts<br/>User Preferences"]
 Agent --> Logger["logger.ts<br/>Audit Logging"]
 
 Gmail --> Types["types.ts<br/>TypeScript Definitions"]
 Classifier --> Types
 
 Guards --> Types
 Handler --> Types
 Prefs --> Types
 
 Logger --> noExt["<br/>No External Deps"]
 
 style Index fill:#fff3e0
 style Agent fill:#ffe0b2
 style Tools fill:#ffcc80
 style Guards fill:#ffab91
 style Handler fill:#ef9a9a
 style Prefs fill:#f48fb1
 style Gmail fill:#ce93d8
 style Classifier fill:#ba68c8
 style Logger fill:#9575cd
 style Types fill:#7986cb
 style noExt fill:#64b5f6
```

---

## Deployment Architecture

### Linux Deployment
```mermaid
graph TB
 OS[" Linux OS"]
 Node["Node.js 18+<br/>Runtime"]
 App["CAT Agent<br/>Compiled Code"]
 Config["Config<br/>.env"]
 Prefs["Preferences<br/>Local Storage"]
 Logs["Audit Logs<br/>Local Storage"]
 
 OS --> Node
 Node --> App
 App --> Config
 App --> Prefs
 App --> Logs
 
 optSvc["Optional:<br/>Systemd Service<br/>Auto-Start"]
 optSvc -.-> App
 
 optDocker["Optional:<br/>Docker Container<br/>Isolated"]
 optDocker -.-> Node
 
 style OS fill:#e3f2fd
 style Node fill:#bbdefb
 style App fill:#90caf9
 style Config fill:#64b5f6
 style Prefs fill:#42a5f5
 style Logs fill:#2196f3
 style optSvc fill:#e8f5e9
 style optDocker fill:#f3e5f5
```

### Windows Deployment
```mermaid
graph TB
 OS[" Windows OS"]
 Node["Node.js 18+<br/>Runtime"]
 App["CAT Agent<br/>Compiled Code"]
 Config["Config<br/>.env"]
 Prefs["Preferences<br/>Local Storage"]
 Logs["Audit Logs<br/>Local Storage"]
 
 OS --> Node
 Node --> App
 App --> Config
 App --> Prefs
 App --> Logs
 
 optTask["Optional:<br/>Task Scheduler<br/>Auto-Start"]
 optTask -.-> App
 
 optDocker["Optional:<br/>Docker Desktop<br/>Isolated"]
 optDocker -.-> Node
 
 style OS fill:#fff3e0
 style Node fill:#ffe0b2
 style App fill:#ffcc80
 style Config fill:#ffab91
 style Prefs fill:#ef9a9a
 style Logs fill:#f48fb1
 style optTask fill:#e8f5e9
 style optDocker fill:#f3e5f5
```

---

## Security & Privacy Flow

```mermaid
graph LR
 Request[" User Request"]
 
 Request --> Barrier1[" Barrier 1<br/>Command Validation<br/>Blocks: export, scrape,<br/>share, backup"]
 
 Barrier1 -->|Blocked| Error1[" Error<br/>Privacy Violation"]
 Barrier1 -->|Passed| DataMin[" Barrier 2<br/>Data Minimization<br/>Only fields needed"]
 
 DataMin --> Barrier3[" Barrier 3<br/>No Third-Party<br/>Only: Gmail, Local"]
 
 Barrier3 --> Barrier4[" Barrier 4<br/>In-Memory Only<br/>Volatile Storage"]
 
 Barrier4 --> Ops[" Execute Operations"]
 
 Ops --> Barrier5[" Barrier 5<br/>Auto-Cleanup<br/>30s TTL"]
 
 Barrier5 --> Barrier6[" Barrier 6<br/>Hard Delete<br/>Session End"]
 
 Barrier6 --> Done["[OK] Complete<br/>No Data Retained"]
 
 Error1 --> Done
 
 style Request fill:#e3f2fd
 style Barrier1 fill:#ffebee
 style Barrier2 fill:#fff9c4
 style Barrier3 fill:#f3e5f5
 style Barrier4 fill:#e8f5e9
 style Barrier5 fill:#e1f5fe
 style Barrier6 fill:#ffe0b2
 style Done fill:#a5d6a7
 style Error1 fill:#ef5350
```

---

## External Dependencies

```mermaid
graph LR
 CAT[" CAT Agent<br/>Core Application"]
 
 Anthropic[" Anthropic API<br/>Claude AI<br/>- Language Understanding<br/>- Tool Routing<br/>- Response Generation"]
 
 Gmail[" Gmail API<br/>User OAuth 2.0<br/>- Read Emails<br/>- Delete Emails<br/>- Send Emails<br/>- Archive/Label"]
 
 Node[" Node.js<br/>Runtime Only<br/>- V8 Engine<br/>- Event Loop<br/>- GC"]
 
 NPM[" NPM Dependencies<br/>- googleapis (Gmail SDK)<br/>- anthropic (Claude SDK)<br/>- dotenv (Config)<br/>- typescript (Dev only)"]
 
 CAT -->|"API Calls"| Anthropic
 CAT -->|"OAuth 2.0<br/>User Credentials"| Gmail
 CAT -->|"Runs On"| Node
 CAT -->|"Uses"| NPM
 
 style CAT fill:#fff3e0
 style Anthropic fill:#fff9c4
 style Gmail fill:#e0f2f1
 style Node fill:#e3f2fd
 style NPM fill:#f3e5f5
```

---

## NZ Privacy Act Alignment

```mermaid
graph TB
 PPs["13 Privacy Principles<br/>NZ Privacy Act 2020"]
 
 subgraph PP1to5["Principles 1-5<br/>Collection & Use"]
 PP1["PP1: Collect only<br/>during operation"]
 PP2["PP2: Use only for<br/>requested purpose"]
 PP3["PP3: Access via<br/>Gmail OAuth"]
 PP4["PP4: Accuracy<br/>No stored data"]
 PP5["PP5: Retention<br/>In-memory only"]
 end
 
 subgraph PP6to9["Principles 6-9<br/>Information & Access"]
 PP6["PP6: Information<br/>Full disclosure"]
 PP7["PP7: Identifiers<br/>None created"]
 PP8["PP8: Participation<br/>User control"]
 PP9["PP9: Access Rights<br/>Via Gmail"]
 end
 
 subgraph PP10to13["Principles 10-13<br/>Safety & Openness"]
 PP10["PP10: Correction<br/>No stored data"]
 PP11["PP11: Safety<br/>No risk data"]
 PP12["PP12: Openness<br/>Transparent"]
 PP13["PP13: Accuracy<br/>Pass-through"]
 end
 
 CAT["CAT Architecture<br/>Privacy-First"]
 
 PPs --> PP1to5
 PPs --> PP6to9
 PPs --> PP10to13
 
 PP1to5 --> CAT
 PP6to9 --> CAT
 PP10to13 --> CAT
 
 CAT -->|"Proof:"| Code["Source Code<br/>Auditable"]
 CAT -->|"Proof:"| Docs["Documentation<br/>PRIVACY_NOTICE.md"]
 CAT -->|"Proof:"| Logs["Audit Logs<br/>Operations only"]
 
 style PPs fill:#fff3e0
 style PP1to5 fill:#e1f5fe
 style PP6to9 fill:#e8f5e9
 style PP10to13 fill:#f3e5f5
 style CAT fill:#fce4ec
 style Code fill:#b2dfdb
 style Docs fill:#c8e6c9
 style Logs fill:#f1f8e9
```

---

**Last Updated**: July 14, 2026 
**Format**: Mermaid Diagrams 
**Status**: [OK] Complete Architecture Documentation
