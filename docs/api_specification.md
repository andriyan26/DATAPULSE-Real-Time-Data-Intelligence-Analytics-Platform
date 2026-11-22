# DATAPULSE API & WebSocket Specification (v1.0)

## Base URL
- REST API: `http://localhost:5000/api/v1`
- WebSocket: `ws://localhost:5000`

---

## 1. Authentication Endpoints

### `POST /auth/login`
- **Description**: Authenticate user and obtain JWT token.
- **Request Body**:
  ```json
  {
    "email": "admin@datapulse.io",
    "password": "Admin123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "usr-admin-01",
        "name": "Alex Mercer",
        "email": "admin@datapulse.io",
        "role": "super_admin",
        "avatarColor": "#10B981",
        "department": "Executive Administration",
        "organization": {
          "id": "org-datapulse-core",
          "name": "PulseCore Intelligence Corp",
          "slug": "pulsecore",
          "plan": "enterprise"
        }
      }
    }
  }
  ```

### `GET /auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: Returns current authenticated user and organization.

---

## 2. Dashboard Overview

### `GET /dashboard/overview`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  - `metrics`: `totalRecords`, `totalRevenue`, `completedTransactions`, `failedTransactions`, `liveTransactions`, `runningPipelines`, `openIncidents`, `qualityScore`.
  - `capsuleChart`: 7 daily pillar points (`day`, `label`, `value1`, `value2`, `status`, `active`).
  - `categoryDistribution`: Categories with counts and sums.
  - `pipelineRuns`: Top 5 recent pipeline runs.
  - `activeIncidents`: Unresolved alerts.
  - `teamMembers`: Organization collaborator directory.

---

## 3. Analytics Explorer

### `POST /analytics/query`
- **Request Body**:
  ```json
  {
    "datasetId": "ds-global-tx",
    "dimension": "category",
    "metric": "amount",
    "aggregation": "SUM",
    "chartType": "bar"
  }
  ```
- **Allowed Dimensions**: `category`, `region`, `status`, `transaction_date`, `customer_name`
- **Allowed Metrics**: `amount`, `quantity`, `id`
- **Allowed Aggregations**: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`

### `GET /analytics/drilldown?dimension=category&value=Enterprise%20Cloud`
- **Response**: Paginated raw underlying records matching the dimension value.

---

## 4. Datasets & Ingestion

### `GET /datasets`
- Returns catalogue of datasets with schemas, row counts, and quality scores.

### `POST /datasets/import`
- **Request Body**:
  ```json
  {
    "datasetId": "ds-global-tx",
    "fileName": "batch_q4.csv",
    "rows": [
      {
        "external_id": "TX-2026-9099",
        "transaction_date": "2026-10-30",
        "category": "Enterprise Cloud",
        "region": "North America",
        "customer_name": "Vertex Global",
        "quantity": 3,
        "amount": "12500.00",
        "status": "completed"
      }
    ],
    "duplicateStrategy": "skip"
  }
  ```

---

## 5. Smart Alerts & Incidents

### `GET /alerts/incidents`
- Lists incidents with lifecycle states: `OPEN`, `ACKNOWLEDGED`, `RESOLVED`.

### `PATCH /alerts/incidents/:id`
- Transitions incident state (`ACKNOWLEDGED` or `RESOLVED`) with user attribution.

---

## 6. AI Data Analyst

### `POST /ai/chat`
- **Request Body**:
  ```json
  {
    "message": "Kategori mana yang memberikan kontribusi pendapatan tertinggi?",
    "conversationId": "optional-id"
  }
  ```
- **Response**: Grounded explanation, executed SQL query, and chart data points.

---

## 7. WebSocket Events

### Subscribed Rooms
- `org_<organizationId>` (e.g. `org_org-datapulse-core`)

### Events Emitted
1. `record.created`: Emitted when new transaction records arrive.
2. `pipeline.completed`: Emitted on pipeline execution finish.
3. `dataset.imported`: Emitted when CSV batch ingestion completes.
4. `alert.resolved`: Emitted when an incident status updates.
5. `stream.status_changed`: Broadcasts pause/resume state.

