/**
 * TRANSFER REQUEST WORKFLOW MODULE
 * 
 * Defines the workflow state machine for transfer requests.
 * 
 * WHAT IT DOES:
 * - Defines all possible request statuses
 * - Enforces valid state transitions
 * - Prevents invalid workflow transitions
 * 
 * WORKFLOW STATES:
 * Transfer requests go through a multi-stage approval process:
 * 
 * 1. Draft: Initial state (request being created)
 * 2. Submitted: Request submitted for review
 * 3. SupervisorApproved: Approved by supervisor
 * 4. SupervisorChangesRequested: Supervisor requests changes
 * 5. SupervisorRejected: Rejected by supervisor (final state)
 * 6. ManagerApproved: Approved by manager (final state)
 * 7. ManagerChangesRequested: Manager requests changes
 * 8. ManagerRejected: Rejected by manager (final state)
 * 
 * STATE TRANSITIONS:
 * The workflow enforces valid transitions:
 * - Draft → Submitted (only transition from Draft)
 * - Submitted → SupervisorApproved/ChangesRequested/Rejected
 * - SupervisorApproved → ManagerApproved/ChangesRequested/Rejected
 * - SupervisorChangesRequested → Submitted (resubmit after changes)
 * - ManagerChangesRequested → Submitted (resubmit after changes)
 * - SupervisorRejected → (no transitions, final state)
 * - ManagerApproved → (no transitions, final state)
 * - ManagerRejected → (no transitions, final state)
 * 
 * USE CASE:
 * Validates if a status change is allowed before updating database.
 * Prevents invalid workflow transitions that could cause data inconsistencies.
 * 
 * USAGE:
 * ```typescript
 * import { canTransition, RequestStatus } from '@/lib/workflows/transfer'
 * 
 * if (canTransition('Draft', 'Submitted')) {
 *   // Allow transition
 * } else {
 *   // Reject transition
 * }
 * ```
 */

/**
 * REQUEST STATUS TYPE
 * 
 * Defines all possible states for a transfer request.
 * 
 * STATES:
 * - Draft: Initial state (request being created)
 * - Submitted: Request submitted for review
 * - SupervisorApproved: Approved by supervisor
 * - SupervisorChangesRequested: Supervisor requests changes
 * - SupervisorRejected: Rejected by supervisor (final state)
 * - ManagerApproved: Approved by manager (final state)
 * - ManagerChangesRequested: Manager requests changes
 * - ManagerRejected: Rejected by manager (final state)
 * 
 * TYPE SAFETY:
 * Using union type ensures only valid statuses can be used.
 */
export type RequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'SupervisorApproved'
  | 'SupervisorChangesRequested'
  | 'SupervisorRejected'
  | 'ManagerApproved'
  | 'ManagerChangesRequested'
  | 'ManagerRejected'

/**
 * CAN TRANSITION FUNCTION
 * 
 * Validates if a state transition is allowed.
 * 
 * WHAT IT DOES:
 * - Checks if transitioning from `from` status to `to` status is valid
 * - Returns true if transition is allowed
 * - Returns false if transition is invalid
 * 
 * WORKFLOW RULES:
 * 
 * Draft:
 * - Can only transition to: Submitted
 * 
 * Submitted:
 * - Can transition to: SupervisorApproved, SupervisorChangesRequested, SupervisorRejected
 * 
 * SupervisorApproved:
 * - Can transition to: ManagerApproved, ManagerChangesRequested, ManagerRejected
 * 
 * SupervisorChangesRequested:
 * - Can transition to: Submitted (resubmit after changes)
 * 
 * SupervisorRejected:
 * - No transitions allowed (final state)
 * 
 * ManagerApproved:
 * - No transitions allowed (final state)
 * 
 * ManagerChangesRequested:
 * - Can transition to: Submitted (resubmit after changes)
 * 
 * ManagerRejected:
 * - No transitions allowed (final state)
 * 
 * IMPLEMENTATION:
 * Uses a lookup table (Record) for O(1) validation.
 * Checks if target status is in allowed transitions array.
 * 
 * @param from - Current request status
 * @param to - Target request status
 * @returns true if transition is allowed, false otherwise
 * 
 * EXAMPLE:
 * ```typescript
 * canTransition('Draft', 'Submitted') // true
 * canTransition('Draft', 'Approved') // false
 * canTransition('Submitted', 'SupervisorApproved') // true
 * canTransition('SupervisorRejected', 'Submitted') // false (final state)
 * ```
 */
export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  /**
   * ALLOWED TRANSITIONS LOOKUP TABLE
   * 
   * Maps each status to an array of valid next statuses.
   * Empty array means no transitions allowed (final state).
   */
  const allowed: Record<RequestStatus, RequestStatus[]> = {
    Draft: ['Submitted'], // Draft can only be submitted
    Submitted: ['SupervisorApproved', 'SupervisorChangesRequested', 'SupervisorRejected'], // Supervisor decisions
    SupervisorApproved: ['ManagerApproved', 'ManagerChangesRequested', 'ManagerRejected'], // Manager decisions
    SupervisorChangesRequested: ['Submitted'], // Can resubmit after changes
    SupervisorRejected: [], // Final state (no transitions)
    ManagerApproved: [], // Final state (no transitions)
    ManagerChangesRequested: ['Submitted'], // Can resubmit after changes
    ManagerRejected: [], // Final state (no transitions)
  }
  
  /**
   * VALIDATE TRANSITION
   * 
   * Checks if target status is in allowed transitions array.
   * Uses optional chaining and nullish coalescing for safety.
   */
  return allowed[from]?.includes(to) ?? false
}


