# 📊 Firebase NoSQL Schema Architecture

To support the high-fidelity UI and ensure instant performance, we will structure the Firebase Firestore database using a heavily denormalized, read-optimized document model.

---

### 1. `lots` Collection
This stores all production batches. We embed the `sizes` and `processes` directly into the document since they are always fetched together and have a fixed, small size.

```json
{
  "id": "lot_8a9b2",                 // Document ID
  "brand": "KS4U",
  "lotNumber": "102",
  "designNo": "DSN-884",
  "date": "2026-05-06T00:00:00Z",    // Firestore Timestamp
  "status": "active",                // 'active' | 'completed' | 'archived'
  "sizes": {
    "S": 100,
    "M": 200,
    "L": 150
  },
  "processes": [
    {
      "id": "screening",
      "name": "Screening",
      "pieces": 450,
      "pricePerPc": 1.5,
      "isDone": true,
      "billNumber": "B-1022",       // Reference / Bill #
      "notes": "Color adjustment required.",
      "numButtons": 0
    },
    {
      "id": "button",
      "name": "Button",
      "pieces": 450,
      "pricePerPc": 0.5,
      "numButtons": 4,               // Hardware per piece
      "billNumber": "",
      "isDone": false,
      "notes": ""
    }
  ],
  "stages": [                        // The Standard 8-Stage Pipeline
    "Screening", "Embroidery", "Cutting", "Stitching", 
    "Interlock", "Diamond", "Button", "Steam Press"
  ],
  "sampleImage": "https://storage.googleapis.com/.../img.jpg", // Stored in Firebase Storage
  "itemImage": "https://storage.googleapis.com/.../design.jpg",
  "notes": "General production observations here.",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

### 2. `workers` Collection
The master record for the professional workforce.

```json
{
  "id": "wrk_9f8d1",                 // Document ID
  "name": "Rahul Verma",
  "phone": "9876543210",
  "address": "Block C, Textile Hub",
  "status": "active",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

### 3. `transactions` Collection (Sub-collection vs Root)
*We will store this at the **Root** level (not as a sub-collection under workers) to allow for easy global querying (e.g., "Total pieces done today across all workers").*

```json
{
  "id": "tx_7x6c5",                  // Document ID
  "workerId": "wrk_9f8d1",           // Ref to workers collection
  "type": "work",                    // 'work' | 'advance'
  "date": "2026-05-06T00:00:00Z",
  "pieces": 50,                      // Nullable if type == 'advance'
  "rate": 2.5,                       // Nullable if type == 'advance'
  "amount": 125.0,                   // Pre-calculated: pieces * rate (or manual for advance)
  "status": "active",                // 'active' | 'settled'
  "settlementId": null,              // Filled when settled
  "createdAt": "Timestamp"
}
```

---

### 4. `settlements` Collection
Stores historical payment records. Keeping this separate from transactions keeps the `transactions` queries fast.

```json
{
  "id": "stl_2b4a1",                 // Document ID
  "workerId": "wrk_9f8d1",
  "date": "2026-05-10T00:00:00Z",
  "amountPaid": 2500.0,
  "txIds": [                         // Array of transaction IDs covered by this settlement
    "tx_7x6c5",
    "tx_8y9d2"
  ],
  "createdAt": "Timestamp"
}
```

---

### ⚡ Optimization Notes for Later (As Requested):
1. **Caching (SWR / React Query)**: We need to implement client-side caching so that navigating between Lot Dashboard and Worker Directory doesn't re-fetch from Firebase every single time.
2. **Pagination**: The `transactions` query needs to be limited (e.g., `limit(50)`) with a "Load More" cursor, otherwise the app will freeze after 6 months of daily data entry.
3. **Data Denormalization**: We might want to store `totalActiveBalance` directly on the `worker` document using Firebase Cloud Functions, so we don't have to calculate it on the fly every time the directory loads.
