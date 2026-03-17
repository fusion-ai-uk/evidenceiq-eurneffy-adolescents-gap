import { redirect } from "next/navigation"

export default function RootRedirect() {
  // Default landing page
  redirect("/overview")
}
