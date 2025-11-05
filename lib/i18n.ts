/**
 * INTERNATIONALIZATION (i18n) MODULE
 * 
 * Provides translation strings for the application.
 * 
 * WHAT IT DOES:
 * - Defines all UI text strings
 * - Organizes strings by feature/module
 * - Enables easy translation/localization
 * 
 * CURRENT STATUS:
 * - Basic structure in place
 * - Currently only English
 * - Ready for multi-language support
 * 
 * FUTURE EXTENSIONS:
 * - Can add more languages (Spanish, French, etc.)
 * - Can use libraries like next-intl or react-i18next
 * - Can load translations dynamically
 * 
 * USAGE:
 * ```typescript
 * import { messages } from '@/lib/i18n'
 * 
 * const title = messages.workflows.title // "Transfer Requests"
 * ```
 * 
 * STRUCTURE:
 * Messages are organized by feature/module.
 * Each module has its own strings.
 */

/**
 * MESSAGES OBJECT
 * 
 * Contains all UI text strings organized by feature.
 * 
 * CURRENT MODULES:
 * - workflows: Transfer request workflow strings
 * 
 * ADDING NEW MODULES:
 * Add new properties as needed:
 * ```typescript
 * export const messages = {
 *   workflows: { ... },
 *   dashboard: { ... },
 *   users: { ... },
 * }
 * ```
 */
export const messages = {
  /**
   * WORKFLOWS MODULE MESSAGES
   * 
   * All text strings for the transfer request workflow feature.
   * 
   * STRUCTURE:
   * - title: Page title
   * - newRequest: Button text for creating new request
   * - searchPlaceholder: Search input placeholder
   * - filterStatus: Filter dropdown label
   * - tabs: Tab labels
   * - columns: Table column headers
   * - actions: Action button labels
   * - details: Detail page labels
   * - form: Form field labels and button text
   */
  workflows: {
    title: 'Transfer Requests',
    newRequest: 'New Request',
    searchPlaceholder: 'Search',
    filterStatus: 'All statuses',
    tabs: { all: 'All', new: 'New', completed: 'Completed' },
    columns: { title: 'Title', from: 'From', to: 'To', status: 'Status', created: 'Created', actions: 'Actions' },
    actions: { approve: 'Approve', requestChanges: 'Request changes', reject: 'Reject', assignManager: 'Assign manager...' },
    details: { status: 'Status', purpose: 'Purpose', attachments: 'Attachments', comments: 'Comments', back: 'Back', resubmit: 'Resubmit', cancel: 'Cancel' },
    form: { title: 'Title', from: 'From location', to: 'To location', purpose: 'Purpose', attachments: 'Attachments', supervisor: 'Supervisor', createSubmit: 'Create & Submit' },
  }
}


