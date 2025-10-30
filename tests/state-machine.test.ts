import { describe, it, expect } from 'vitest'
import { canTransition } from '@/lib/workflows/transfer'

describe('TransferRequest state machine', () => {
  it('allows Submitted -> SupervisorApproved', () => {
    expect(canTransition('Submitted', 'SupervisorApproved')).toBe(true)
  })
  it('blocks Submitted -> ManagerApproved', () => {
    expect(canTransition('Submitted', 'ManagerApproved')).toBe(false)
  })
  it('allows SupervisorApproved -> ManagerApproved', () => {
    expect(canTransition('SupervisorApproved', 'ManagerApproved')).toBe(true)
  })
  it('allows SupervisorChangesRequested -> Submitted', () => {
    expect(canTransition('SupervisorChangesRequested', 'Submitted')).toBe(true)
  })
})


