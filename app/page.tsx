import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to signin page since we only have authenticated app
  redirect('/signin')
}
