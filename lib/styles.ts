/**
 * Shared UI style tokens to keep Tailwind classNames consistent and DRY.
 */

export const sidebar = {
  // Base row used for both items in collapsed and expanded states
  rowBase: "group relative flex items-center rounded-lg transition-colors duration-200 cursor-pointer h-10",
  // Active and inactive variants
  rowActive: "bg-gray-900 text-white",
  rowInactive: "bg-white hover:bg-gray-100 text-gray-800",

  // Icon container and icon styles
  iconBoxSm: "flex items-center justify-center flex-shrink-0 w-7 h-7",
  iconBoxMd: "flex items-center justify-center flex-shrink-0 w-8 h-8",
  icon: "transition-colors duration-200 h-5 w-5",
  iconActive: "text-white",
  iconInactive: "text-gray-500 group-hover:text-gray-700",

  // Section header button
  headerButton: "w-full h-10 flex items-center justify-between px-3 text-xs font-semibold tracking-wide text-gray-700 uppercase rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors",
  headerCaret: "h-4 w-4 text-gray-500 transition-transform",
}

export const layout = {
  container: "max-w-full mx-auto px-4 sm:px-6 lg:px-8",
}

export const header = {
  shell: "bg-white shadow-sm border-b border-gray-200 flex-shrink-0",
  bar: "flex justify-between items-center h-16",
  brandTitle: "text-base font-semibold text-gray-900 group-hover:underline",
  brandSubtitle: "text-xs text-gray-500",
  brandIconBox: "w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center text-white",
  userText: "text-sm font-medium text-gray-700",
}

export const footer = {
  shell: "bg-gray-50 border-t border-gray-200 flex-shrink-0",
  bar: "flex flex-col sm:flex-row justify-between items-center py-4 space-y-2 sm:space-y-0",
  left: "flex items-center space-x-2",
  center: "flex items-center space-x-4 text-sm text-gray-500",
  right: "flex items-center space-x-4 text-sm text-gray-500",
  link: "hover:text-blue-600 transition-colors",
  smallMuted: "text-sm text-gray-600",
}


