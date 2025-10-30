export type RequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'SupervisorApproved'
  | 'SupervisorChangesRequested'
  | 'SupervisorRejected'
  | 'ManagerApproved'
  | 'ManagerChangesRequested'
  | 'ManagerRejected'

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  const allowed: Record<RequestStatus, RequestStatus[]> = {
    Draft: ['Submitted'],
    Submitted: ['SupervisorApproved', 'SupervisorChangesRequested', 'SupervisorRejected'],
    SupervisorApproved: ['ManagerApproved', 'ManagerChangesRequested', 'ManagerRejected'],
    SupervisorChangesRequested: ['Submitted'],
    SupervisorRejected: [],
    ManagerApproved: [],
    ManagerChangesRequested: ['Submitted'],
    ManagerRejected: [],
  }
  return allowed[from]?.includes(to) ?? false
}


