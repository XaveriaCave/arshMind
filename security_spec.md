# Security Specification - ArshMind

## 1. Data Invariants
- A UserProfile must belong to the authenticated user (`userId` matches `request.auth.uid`).
- A UserProfile must have a valid `name`.
- `ScenarioSettings` are private to the user.
- Timestamps `createdAt` and `updatedAt` must be server-generated.
- Users must have a verified email to perform writes.

## 2. The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Create a profile with `userId` of another user.
2. **Shadow Field Injection**: Add `isAdmin: true` to a profile.
3. **Malicious ID**: Use a 2KB string as a document ID.
4. **Timestamp Fraud**: Send a client-calculated `updatedAt` string.
5. **Unverified Write**: Attempt to write with `email_verified: false`.
6. **Constraint Violation**: Set `age: -5` or `age: 200`.
7. **Resource Poisoning**: Send a 1MB string for `extraContext`.
8. **Orphaned Write**: Create settings without an existing parent user profile.
9. **Outcome Locking Bypass**: Try to modify immutable `createdAt` after creation.
10. **Type Confusion**: Send a string for `salary` instead of a number.
11. **Negative Balance**: Set `bankBalance: -1000`.
12. **Anonymous Escalation**: Attempt write as an anonymous user (if not allowed).

## 3. Test Runner (Conceptual)
The following tests verify that all "Dirty Dozen" payloads return `PERMISSION_DENIED`.
(Note: Real `firestore.rules.test.ts` would use `@firebase/rules-unit-testing`)
