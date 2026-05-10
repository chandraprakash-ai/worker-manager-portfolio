# 🎓 Amrut Fashion: Developer & Architecture Handbook

This document serves as a specialized knowledge base for the **Amrut Fashion Management System**. It contains the core logic, best practices, and "lessons learned" during the transition from a local prototype to a professional cloud-based SaaS product.

---

## 🏛️ 1. The NoSQL Philosophy (Firestore)
**Lesson:** In NoSQL, the database serves the UI, not the other way around.

### ✅ Best Practices:
- **Schema Flexibility:** Documents in the same collection don't need the same fields. 
  - *Tip:* Use this to evolve your app without "Migrations." If you need a `lotGiverName` tomorrow, just start saving it.
- **Graceful Defaults:** Always use the OR operator (`||`) when displaying data.
  - *Code:* `lot.giverName || 'Direct'` (Prevents `undefined` or blank spaces for old data).
- **Denormalization:** It’s okay to duplicate data if it makes the app faster. We save the `pieces` and `rate` inside the transaction even though the total `amount` is also there. This provides a clear audit trail.

---

## 🔢 2. Data Integrity & Type Safety
**Lesson:** The browser is "loose," but the database must be "strict."

### 💡 The "Casting" Trick:
HTML inputs always return strings (`"10"`). Always cast them to numbers at the **Boundary** (the moment you click "Save").
- **Do this:** `const amount = Number(inputAmount) || 0;`
- **Why?** Prevents "String Concatenation" (`"10" + "10" = "1010"`) and ensures your balance calculations are 100% accurate.

### 🧹 Conditional Persistence:
Don't save "Trash" or empty fields. If an entry is an **Advance**, don't even create the `pieces` or `rate` fields in the database. It keeps your console clean and your data "lean."

---

## 🛡️ 3. Cloud Architecture (BaaS)
**Lesson:** You are talking directly to the database. Security happens at the Gate, not in the Code.

### 🔑 Security Architecture:
- **Client-Side:** Your React code is public. Never store "Secrets" or "Admin Passwords" inside the Javascript files.
- **Server-Side (Firebase Rules):** The database itself validates the data. 
- **Production Tip:** Once testing is done, use the `hasOnly()` rule to "Freeze" the schema. This prevents anyone from adding unauthorized "trash" fields to your documents.

---

## ⚡ 4. Professional UI/UX Tips
**Lesson:** High-fidelity apps feel "Alive."

- **Haptic Feedback:** Use the `haptic('medium')` or `haptic('heavy')` functions on buttons. It makes the digital app feel like a physical tool.
- **Loading States:** Use meaningful loading text like *"Decrypting Ledger..."* or *"Syncing Production..."* instead of a boring spinner. It builds user trust in the data.
- **Defensive Rendering:** If a transaction has no `type`, default it to the "Safest" option (Red/Advance) so you notice the error immediately.

---

## 🛠️ 5. Debugging "Ghost" Data
If you see entries that are **Red** but have no label:
1. It means they are missing the `type` field.
2. In our UI logic, anything that isn't `type: 'work'` defaults to Red.
3. **The "Sweep" Mystery:** These entries are marked as "Settled" in the DB because the settlement logic sweeps up everything marked as `active`, even if it doesn't have a type.
4. **Fix:** Use the Firebase Console to manually add the field or delete the test entry.

---

## 🌊 6. Database Hydration
**Lesson:** Data in the cloud doesn't exist in the app until you "Ask" for it.

- **The Issue:** We saw that Settlement History was in the DB but not on the screen.
- **The Solution:** We updated `initializeData` to fetch EVERYTHING at startup. 
- **Pro Tip:** In a large app, you don't fetch everything. You fetch "just enough" for the current screen to keep the app fast.

---

## ⚡ 7. Validation at the "Boundary"
**Lesson:** Don't trust the Form; trust the Sanitizer.

- **Bulk Entry Bug:** We found that Bulk Entry was sending raw strings to the DB.
- **The Fix:** We created a `sanitizedRows` mapping that explicitly converts every row to a `Number` before calling the database.
- **Rule of Thumb:** Your Database Service should be the "Filter" that catches bad data before it's saved forever.

---

> [!TIP]
> **Pro Developer Move:** Always check your Firebase Console after implementing a new feature. If you see fields with `""` (empty strings) or `null`, ask yourself: "Do I really need this field, or can I omit it?"

*This handbook is a living document. Add your own notes here as you learn more!*
