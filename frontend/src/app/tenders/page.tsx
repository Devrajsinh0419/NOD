import { Metadata } from "next"
import TendersPage from "./TendersClient"

export const metadata: Metadata = {
  title: "Government Tender Marketplace | Discover Latest Bid Opportunities",
  description: "Browse and discover active central and state government construction, architecture, interior design, and planning tenders in India. Filter by budget, category, state, and source.",
  keywords: [
    "Government Tenders India",
    "CPWD Tenders",
    "CPPP Tenders",
    "Active Bid Opportunities",
    "Construction Tenders",
    "Architectural Tenders",
  ],
  alternates: {
    canonical: "https://nod-live.vercel.app/tenders",
  },
  openGraph: {
    type: "website",
    title: "Government Tender Marketplace | Night Owl Designers",
    description: "Browse and discover active government construction, architecture, interior design, and planning tenders in India.",
    url: "https://nod-live.vercel.app/tenders",
  }
}

export default function Page() {
  return <TendersPage />
}
