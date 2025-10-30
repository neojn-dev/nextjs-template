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

export const auth = {
  page: "min-h-screen bg-gray-50 flex flex-col",
  main: "h-screen flex overflow-hidden",
  card: "w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6",
  titleWrap: "mb-6 text-center",
  title: "text-2xl font-semibold text-gray-900",
  error: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700",
  success: "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700",
  dividerWrap: "relative my-6",
  dividerLine: "absolute inset-0 flex items-center",
  dividerHr: "w-full border-t border-gray-200",
  dividerTextWrap: "relative flex justify-center text-xs",
  dividerText: "px-2 bg-white text-gray-500",

  // 50/50 split layout
  split: "w-full grid grid-cols-1 lg:grid-cols-2 min-h-full",
  graphicPane: "hidden lg:block relative h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700",
  formPane: "flex items-center justify-center w-full overflow-hidden",
  formCenter: "w-full flex items-center justify-center py-10",
  formMax: "w-full max-w-md",
}


