"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/public/images/logo.png";
import {
  Search,
  Filter,
  TrendingUp,
  RotateCw,
  ExternalLink,
  Building2,
  Layers,
  FileText,
  Cpu,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Copy,
  CheckCircle2,
  MapPin,
  Calendar,
  IndianRupee,
  FileDown,
  SlidersHorizontal,
  X,
  LayoutGrid
} from "lucide-react";
import { Tender, TenderStats } from "@/types/tender.types";
import { authService } from "@/services/auth.service";

// Extend TenderStats type for advanced stats
interface AdvancedTenderStats extends TenderStats {
  valueBreakdown?: {
    under15L: number;
    between15L50L: number;
    above50L: number;
  };
  stateDistribution?: Array<{
    state: string;
    count: number;
  }>;
}

export default function TendersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("client");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [stats, setStats] = useState<AdvancedTenderStats>({
    totalTenders: 0,
    relevantTenders: 0,
    ministriesCount: 0,
    departmentsCount: 0,
    valueBreakdown: { under15L: 0, between15L50L: 0, above50L: 0 },
    stateDistribution: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; bidNumber: string } | null>(null);

  // Filter States
  const [activeTab, setActiveTab] = useState<"all" | "relevant">("all");
  const [search, setSearch] = useState("");
  const [ministry, setMinistry] = useState("");
  const [department, setDepartment] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // UI Control states
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Syncing State
  const [syncing, setSyncing] = useState(false);

  // Lock / Premium states
  const [unlocked, setUnlocked] = useState(false);
  const [checkingUnlock, setCheckingUnlock] = useState(true);
  const [paymentStep, setPaymentStep] = useState<"card" | "loading" | "success">("card");

  // Fetch stats once on load
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/tenders/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch tender stats:", err);
    }
  };

  // Fetch tenders list on dependency change
  const fetchTenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === "relevant" ? "/api/tenders/relevant" : "/api/tenders";
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        ministry,
        department,
        state: stateFilter,
        city: cityFilter,
        category: categoryFilter,
        source: sourceFilter.join(","),
        budget_min: budgetMin,
        budget_max: budgetMax,
        closing_date: closingDate,
        status: statusFilter
      });

      const res = await fetch(`${endpoint}?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setTenders(data.data);
        setTotal(data.total);
      } else {
        setError(data.message || "Failed to retrieve tenders.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Sync tenders trigger
  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/tenders/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        // Refresh data
        await fetchStats();
        await fetchTenders();
      } else {
        alert("Sync failed: " + data.message);
      }
    } catch (err) {
      console.error("Sync error:", err);
      alert("Failed to connect to sync endpoint.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setRole(storedUser.role.toLowerCase());
    fetchStats();

    // Check lock status
    const isUnlocked = localStorage.getItem("tenders_unlocked") === "true";
    setUnlocked(isUnlocked);
    setCheckingUnlock(false);
  }, [router]);

  useEffect(() => {
    fetchTenders();
  }, [
    page,
    activeTab,
    search,
    ministry,
    department,
    stateFilter,
    cityFilter,
    categoryFilter,
    sourceFilter,
    budgetMin,
    budgetMax,
    closingDate,
    statusFilter
  ]);

  const handleTabChange = (tab: "all" | "relevant") => {
    setActiveTab(tab);
    setPage(1); // Reset to page 1 on tab switch
  };

  const handleSourceCheckbox = (source: string) => {
    setSourceFilter(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setMinistry("");
    setDepartment("");
    setStateFilter("");
    setCityFilter("");
    setCategoryFilter("");
    setSourceFilter([]);
    setBudgetMin("");
    setBudgetMax("");
    setClosingDate("");
    setStatusFilter("");
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const totalPages = Math.ceil(total / limit);

  const handleViewTender = (e: React.MouseEvent, tender: Tender) => {
    e.preventDefault();
    if (tender.tenderUrl) {
      window.open(tender.tenderUrl, '_blank');
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tender.bidNumber).then(() => {
        setToast({
          message: "Bid Number copied to clipboard!",
          bidNumber: tender.bidNumber
        });
        setTimeout(() => {
          setToast(null);
        }, 4000);
        window.open('https://bidplus.gem.gov.in/all-bids', '_blank');
      }).catch(() => {
        window.open('https://bidplus.gem.gov.in/all-bids', '_blank');
      });
    } else {
      window.open('https://bidplus.gem.gov.in/all-bids', '_blank');
    }
  };

  const countActiveFilters = () => {
    let count = 0;
    if (search) count++;
    if (ministry) count++;
    if (department) count++;
    if (stateFilter) count++;
    if (cityFilter) count++;
    if (categoryFilter) count++;
    if (sourceFilter.length > 0) count++;
    if (budgetMin) count++;
    if (budgetMax) count++;
    if (closingDate) count++;
    if (statusFilter) count++;
    return count;
  };

  if (checkingUnlock) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A96E]/15 border-t-[#C9A96E]/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0E8] font-sans flex flex-col pb-20">
        {/* Navbar / Header */}
        <header className="border-b border-[#C9A96E]/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href={`/dashboard/${role}`} className="flex items-center gap-1">
              <Image src={logo} alt="Logo" className="h-12 w-12" />
              <p className="text-4xl font-bold text-white">N</p>
              <div className="leading-none">
                <p className="text-xl font-bold text-white">OD</p>
                <p className="text-[10px] text-white">IGHT OWL DESIGNERS</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${role}`} className="text-xs text-white/80 hover:text-white border border-white/30 rounded-full px-4 py-1.5 bg-[#C9A96E]/5 hover:bg-[#C9A96E]/10 transition-all font-semibold">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Locked Page Paywall Container */}
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden mt-10">
          {/* Glowing background blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#C9A96E]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full max-w-lg bg-[#1A1714] border border-[#C9A96E]/15 rounded-2xl p-8 relative z-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A96E]/40 to-transparent" />

            {paymentStep === "card" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 text-[10px] text-[#C9A96E] font-semibold tracking-wider uppercase mb-1">
                    🔒 Premium Feature
                  </div>
                  <h2 className="text-3xl font-cormorant font-bold tracking-wide text-[#F5F0E8]">
                    Tender Discovery Portal
                  </h2>
                  <p className="text-xs text-[#8B7355] max-w-sm mx-auto">
                    Unlock instant access to all engineering, design, and manufacturing tenders from 16+ government e-marketplaces.
                  </p>
                </div>

                {/* Features list */}
                <div className="bg-[#0D0D0D]/80 border border-[#C9A96E]/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-[11px] uppercase tracking-wider text-[#C9A96E] font-bold">Premium Features:</h3>
                  <ul className="space-y-3.5 text-xs text-[#F5F0E8]/80">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#C9A96E] font-bold">✓</span>
                      <span><strong>16+ Sourcing Portals:</strong> Hourly syncing with GeM, CPPP, IREPS, MahaTender, ONGC, NTPC, BHEL, etc.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#C9A96E] font-bold">✓</span>
                      <span><strong>State & City Sinks:</strong> Precision match on state and city filters for local and regional execution.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#C9A96E] font-bold">✓</span>
                      <span><strong>Document Links & Files:</strong> One-click downloads of official NIT (Notice Inviting Tender) PDFs and BOQ XLS sheets.</span>
                    </li>
                  </ul>
                </div>

                {/* Price and Pay button */}
                <div className="pt-4 border-t border-[#C9A96E]/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#8B7355] block">One-Time Fee</span>
                    <span className="text-3xl font-bold font-cormorant text-[#C9A96E]">₹499</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setPaymentStep("loading");
                      setTimeout(() => {
                        setPaymentStep("success");
                        setTimeout(() => {
                          localStorage.setItem("tenders_unlocked", "true");
                          setUnlocked(true);
                        }, 1500);
                      }, 2000);
                    }}
                    className="flex-1 py-3 px-5 rounded-xl bg-[#C9A96E] text-[#0D0D0D] font-bold text-xs hover:bg-[#F5F0E8] transition-all tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg"
                  >
                    Pay ₹499 & Unlock Now
                  </button>
                </div>
              </div>
            )}

            {paymentStep === "loading" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-10 h-10 border-2 border-[#C9A96E]/20 border-t-[#C9A96E] rounded-full animate-spin mb-2" />
                <h3 className="text-base font-semibold text-[#F5F0E8]">Processing Secure Payment...</h3>
                <p className="text-xs text-[#8B7355] max-w-xs">
                  Connecting to payment gateway. Please do not close or reload the page.
                </p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 flex items-center justify-center text-[#C9A96E] mb-2 animate-bounce">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#F5F0E8]">Payment Successful!</h3>
                <p className="text-xs text-[#8B7355]">
                  Premium features unlocked. Accessing Tender Discovery Portal...
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0E8] font-sans pb-20">
      {/* Navbar / Header */}
      <header className="border-b border-[#C9A96E]/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href={`/dashboard/${role}`} className="flex items-center gap-1">
            <Image src={logo} alt="Logo" className="h-12 w-12" />
            <p className="text-4xl font-bold text-white">N</p>
            <div className="leading-none">
              <p className="text-xl font-bold text-white">OD</p>
              <p className="text-[10px] text-white">IGHT OWL DESIGNERS</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-full border border-[#C9A96E]/50 bg-[#C9A96E]/30 px-4 py-2 text-xs text-white hover:bg-[#C9A96E] hover:text-[#0D0D0D] transition-all disabled:opacity-50"
            >
              <RotateCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing All Portals..." : "Sync Portals"}
            </button>
            <Link href={`/dashboard/${role}`} className="text-xs text-white border border-white/30 hover:border-[#C9A96E] rounded-full px-4 py-2 bg-[#C9A96E]/5 transition-all">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-6 mt-8">

        {/* Title Hero */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-cormorant font-bold text-[#F5F0E8] tracking-wide mb-2">
              Government Tender Sourcing
            </h1>
            <p className="text-sm text-[#8B7355] max-w-2xl">
              Unified real-time tracking across 16 federal, state, and PSU portals including GeM, CPPP, railways, and utilities.
            </p>
          </div>
          <div className="flex border-b border-[#C9A96E]/10 pb-0 gap-6 justify-center md:justify-end">
            <button
              onClick={() => handleTabChange("all")}
              className={`pb-3 text-xs font-semibold tracking-wide transition-all relative ${activeTab === "all" ? "text-[#C9A96E]" : "text-[#8B7355] hover:text-[#F5F0E8]"}`}
            >
              All Portal Tenders
              {activeTab === "all" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A96E]"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("relevant")}
              className={`pb-3 text-xs font-semibold tracking-wide transition-all relative flex items-center gap-1.5 ${activeTab === "relevant" ? "text-[#C9A96E]" : "text-[#8B7355] hover:text-[#F5F0E8]"}`}
            >
              <Cpu className="h-3.5 w-3.5" />
              My Relevant Tenders
              {activeTab === "relevant" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A96E]"></span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Tenders */}
          <div className="bg-[#1A1714] border border-[#C9A96E]/15 rounded-xl p-5 relative overflow-hidden transition-all hover:border-[#C9A96E]/30 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#8B7355] uppercase tracking-wider font-semibold">Total Ported</p>
                <h3 className="text-3xl font-semibold mt-1 font-cormorant text-[#C9A96E]">
                  {stats.totalTenders}
                </h3>
              </div>
              <div className="bg-[#C9A96E]/10 p-2.5 rounded-lg text-[#C9A96E]">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] text-[#8B7355]">
              <TrendingUp className="h-3 w-3 text-[#C9A96E] mr-1" />
              <span>Live database sync active</span>
            </div>
          </div>


          {/* Value Breakdown Chart Card */}
          <div className="bg-[#1A1714] border border-[#C9A96E]/15 rounded-xl p-5 relative overflow-hidden transition-all hover:border-[#C9A96E]/30 shadow-lg col-span-1">
            <p className="text-[10px] text-[#8B7355] uppercase tracking-wider font-semibold mb-2">Value Segments</p>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between items-center text-black/80">
                <span>Under ₹15L</span>
                <span className="font-semibold text-[#C9A96E]">{stats.valueBreakdown?.under15L || 0}</span>
              </div>
              <div className="flex justify-between items-center text-black/80">
                <span>₹15L - ₹50L</span>
                <span className="font-semibold text-[#C9A96E]">{stats.valueBreakdown?.between15L50L || 0}</span>
              </div>
              <div className="flex justify-between items-center text-black/80">
                <span>Above ₹50L</span>
                <span className="font-semibold text-[#C9A96E]">{stats.valueBreakdown?.above50L || 0}</span>
              </div>
            </div>
          </div>

          {/* Top States Distribution */}
          <div className="bg-[#1A1714] border border-[#C9A96E]/15 rounded-xl p-5 relative overflow-hidden transition-all hover:border-[#C9A96E]/30 shadow-lg col-span-1">
            <p className="text-[10px] text-[#8B7355] uppercase tracking-wider font-semibold mb-2">Top Territories</p>
            <div className="space-y-1.5 text-[10px]">
              {stats.stateDistribution && stats.stateDistribution.length > 0 ? (
                stats.stateDistribution.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-black/80">
                    <span className="truncate pr-2">{item.state}</span>
                    <span className="font-semibold text-[#C9A96E]">{item.count}</span>
                  </div>
                ))
              ) : (
                <span className="text-[#8B7355]">No distribution data</span>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-1/4 bg-[#1A1714] border border-[#C9A96E]/10 rounded-2xl p-6 sticky top-24 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#C9A96E]/10 pb-4 mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-[#C9A96E] flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filter Workspace
              </span>
              {countActiveFilters() > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                >
                  Reset ({countActiveFilters()})
                </button>
              )}
            </div>

            {/* Side Filters Block */}
            <div className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#8B7355] font-bold">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] focus:outline-none focus:border-[#C9A96E]/50"
                >
                  <option value="">All Categories</option>
                  <option value="Interior Design">Interior Design</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Building Construction">Building Construction</option>
                  <option value="Road & Highway">Road & Highway</option>
                  <option value="Electrical Works">Electrical Works</option>
                  <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                  <option value="HVAC & Mechanical">HVAC & Mechanical</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="General Construction">General Construction</option>
                </select>
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#8B7355] font-bold">State</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra, Gujarat"
                  value={stateFilter}
                  onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
                  className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] placeholder-[#5A4A35]"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#8B7355] font-bold">City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Bengaluru"
                  value={cityFilter}
                  onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                  className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] placeholder-[#5A4A35]"
                />
              </div>

              {/* Value budget range */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#8B7355] font-bold">Value Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={budgetMin}
                    onChange={(e) => { setBudgetMin(e.target.value); setPage(1); }}
                    className="w-1/2 bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] placeholder-[#5A4A35]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={budgetMax}
                    onChange={(e) => { setBudgetMax(e.target.value); setPage(1); }}
                    className="w-1/2 bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] placeholder-[#5A4A35]"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#8B7355] font-bold">Tender Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] focus:outline-none focus:border-[#C9A96E]/50"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Date Limit */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#8B7355] font-bold">Closing Before Date</label>
                <input
                  type="date"
                  value={closingDate}
                  onChange={(e) => { setClosingDate(e.target.value); setPage(1); }}
                  className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8]"
                />
              </div>

              {/* Source Checklist */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#8B7355] font-bold block mb-1">Source Portals</label>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg p-3">
                  {[
                    "GeM", "CPPP", "NProcure", "IREPS", "MahaTender",
                    "Karnataka eProcurement", "Telangana eProcurement", "Rajasthan eProcurement",
                    "Tamil Nadu Tenders", "Kerala eTender", "ONGC Tenders",
                    "NTPC Tenders", "Coal India Tenders", "BHEL Tenders", "NPCIL Tenders"
                  ].map(src => (
                    <label key={src} className="flex items-center gap-2 text-xs text-black/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sourceFilter.includes(src)}
                        onChange={() => handleSourceCheckbox(src)}
                        className="rounded border-[#C9A96E]/30 text-[#C9A96E] bg-[#0D0D0D] focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                      />
                      <span>{src}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Listing Panel */}
          <div className="flex-1 w-full space-y-4">
            {/* Search and Mobile filter triggers */}
            <div className="bg-[#1A1714] border border-[#C9A96E]/10 rounded-xl p-4 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B7355]" />
                <input
                  type="text"
                  placeholder="Search by tender title, bid number, department..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#F5F0E8] focus:outline-none focus:border-[#C9A96E]/50 transition-all placeholder-[#5A4A35]"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ministry keyword..."
                  value={ministry}
                  onChange={(e) => { setMinistry(e.target.value); setPage(1); }}
                  className="bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2.5 px-4 text-xs text-[#F5F0E8] w-full md:w-48 placeholder-[#5A4A35]"
                />

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#C9A96E]/30 bg-[#C9A96E]/5 text-xs text-[#C9A96E]"
                >
                  <Filter className="h-4 w-4" />
                  Filters {countActiveFilters() > 0 && `(${countActiveFilters()})`}
                </button>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center text-xs text-[#8B7355] px-1">
              <span>Sourced Opportunities ({total} active contracts found)</span>
              {countActiveFilters() > 0 && (
                <button onClick={clearFilters} className="text-[#C9A96E] hover:underline">Clear all filters</button>
              )}
            </div>

            {/* List */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-[#1A1714] border border-[#C9A96E]/10 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-[#C9A96E]/15 rounded w-1/4 mb-4"></div>
                    <div className="h-6 bg-[#C9A96E]/15 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-[#C9A96E]/15 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-[#1A1714]/50 border border-destructive/20 rounded-xl p-8 text-center max-w-xl mx-auto my-10">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">Error Sourcing Tenders</h4>
                <p className="text-xs text-[#8B7355] mb-6">{error}</p>
                <button
                  onClick={fetchTenders}
                  className="rounded-full bg-[#C9A96E] px-6 py-2.5 text-xs text-[#0D0D0D] font-semibold hover:bg-[#F5F0E8] transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : tenders.length === 0 ? (
              <div className="bg-[#1A1714]/30 border border-[#C9A96E]/10 rounded-2xl p-12 text-center max-w-xl mx-auto my-10">
                <Building2 className="h-12 w-12 text-[#8B7355] mx-auto mb-4 opacity-50" />
                <h4 className="font-semibold text-lg text-[#F5F0E8] mb-2">No Match Sourced</h4>
                <p className="text-xs text-[#8B7355] mb-6">
                  No tenders match your active combination of query parameter filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="rounded-full border border-[#C9A96E] px-6 py-2 text-xs text-[#C9A96E] hover:bg-[#C9A96E]/10 transition-colors"
                >
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tenders.map((tender) => (
                  <div
                    key={tender.id}
                    className="bg-[#1A1714] border border-[#C9A96E]/10 rounded-xl p-6 hover:border-[#C9A96E]/30 hover:shadow-2xl transition-all shadow-md group relative overflow-hidden"
                  >
                    {/* Top Tag Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 text-[9px] text-[#C9A96E] font-semibold uppercase tracking-wider">
                        {tender.source}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-[#F5F0E8]/70 font-semibold">
                        {tender.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border uppercase tracking-wider ${tender.status === 'active'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : tender.status === 'closed'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                        }`}>
                        {tender.status}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#C9A96E] font-mono font-semibold tracking-wide">
                              {tender.bidNumber}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(tender.bidNumber);
                                setToast({
                                  message: "Bid Number copied to clipboard!",
                                  bidNumber: tender.bidNumber
                                });
                                setTimeout(() => setToast(null), 4000);
                              }}
                              className="text-[#8B7355] hover:text-[#C9A96E] transition-colors p-0.5"
                              title="Copy Bid Number"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                          <h3 className="text-base font-semibold text-[#F5F0E8] mt-1 group-hover:text-[#C9A96E] transition-colors leading-snug">
                            {tender.title}
                          </h3>
                        </div>

                        {/* Middle info row (State, City, Department) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#8B7355]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#C9A96E]/70" />
                            <span>{tender.city}, {tender.state}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-[#C9A96E]/70" />
                            <span className="truncate" title={tender.department}>{tender.department}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold text-[#C9A96E]">
                            <IndianRupee className="h-3.5 w-3.5 text-[#C9A96E]" />
                            <span>Value: {tender.estimatedValue}</span>
                          </div>
                        </div>

                        {/* Downloadable Documents */}
                        {tender.documentUrls && tender.documentUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {tender.documentUrls.map((url, uidx) => {
                              const label = url.toLowerCase().includes('boq') ? 'BOQ spreadsheet' : 'NIT document';
                              return (
                                <a
                                  key={uidx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D0D0D] border border-[#C9A96E]/10 text-[10px] text-[#C9A96E] hover:border-[#C9A96E]/30 transition-all"
                                >
                                  <FileDown className="h-3 w-3" />
                                  <span>{label}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right Panel Actions */}
                      <div className="flex flex-row md:flex-col md:items-end justify-between md:justify-start gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#C9A96E]/5 mt-2 md:mt-0">
                        <div className="text-[10px] text-[#8B7355] text-left md:text-right space-y-0.5">
                          <p className="flex items-center md:justify-end gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Published: {formatDate(tender.startDate)}</span>
                          </p>
                          <p className="flex items-center md:justify-end gap-1 font-semibold text-[#F5F0E8]">
                            <Calendar className="h-3 w-3 text-[#C9A96E]" />
                            <span>Closing: {formatDate(tender.endDate)}</span>
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleViewTender(e, tender)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9A96E]/30 bg-[#C9A96E]/5 px-4 py-2 text-xs text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#0D0D0D] transition-all font-semibold"
                        >
                          Access Portal
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#C9A96E]/10">
                    <span className="text-xs text-[#8B7355]">
                      Showing Page {page} of {totalPages} ({total} total results)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-[#C9A96E]/20 text-[#8B7355] hover:text-[#C9A96E] hover:border-[#C9A96E]/50 disabled:opacity-30 disabled:hover:text-[#8B7355] disabled:hover:border-[#C9A96E]/20 transition-all"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        let pageNum = idx + 1;
                        if (page > 3 && totalPages > 5) {
                          pageNum = page - 3 + idx;
                          if (pageNum + (4 - idx) > totalPages) {
                            pageNum = totalPages - 4 + idx;
                          }
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${page === pageNum
                              ? "bg-[#C9A96E] text-[#0D0D0D]"
                              : "border border-[#C9A96E]/20 text-[#8B7355] hover:text-[#C9A96E] hover:border-[#C9A96E]/50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border border-[#C9A96E]/20 text-[#8B7355] hover:text-[#C9A96E] hover:border-[#C9A96E]/50 disabled:opacity-30 disabled:hover:text-[#8B7355] disabled:hover:border-[#C9A96E]/20 transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Drawer Slide-out Filter Panel */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-4/5 max-w-sm bg-[#1A1714] h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl relative">
            <div>
              <div className="flex items-center justify-between border-b border-[#C9A96E]/10 pb-4 mb-6">
                <span className="text-xs uppercase font-bold tracking-wider text-[#C9A96E] flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter Workspace
                </span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-full text-[#8B7355] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar filter list */}
              <div className="space-y-5">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-[#8B7355] font-bold">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                    className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Building Construction">Building Construction</option>
                    <option value="Road & Highway">Road & Highway</option>
                    <option value="Electrical Works">Electrical Works</option>
                    <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                    <option value="HVAC & Mechanical">HVAC & Mechanical</option>
                    <option value="Landscaping">Landscaping</option>
                    <option value="General Construction">General Construction</option>
                  </select>
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-[#8B7355] font-bold">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={stateFilter}
                    onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
                    className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] placeholder-[#5A4A35]"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-[#8B7355] font-bold">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={cityFilter}
                    onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                    className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] placeholder-[#5A4A35]"
                  />
                </div>

                {/* Budget */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-[#8B7355] font-bold">Value Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={budgetMin}
                      onChange={(e) => { setBudgetMin(e.target.value); setPage(1); }}
                      className="w-1/2 bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] placeholder-[#5A4A35]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={budgetMax}
                      onChange={(e) => { setBudgetMax(e.target.value); setPage(1); }}
                      className="w-1/2 bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8] placeholder-[#5A4A35]"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-[#8B7355] font-bold">Tender Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2 px-3 text-xs text-[#F5F0E8]"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Sources list */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-[#8B7355] font-bold block mb-1">Source Portals</label>
                  <div className="space-y-2 max-h-36 overflow-y-auto bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg p-3">
                    {[
                      "GeM", "CPPP", "NProcure", "IREPS", "MahaTender",
                      "Karnataka eProcurement", "Telangana eProcurement", "Rajasthan eProcurement",
                      "Tamil Nadu Tenders", "Kerala eTender", "ONGC Tenders",
                      "NTPC Tenders", "Coal India Tenders", "BHEL Tenders", "NPCIL Tenders"
                    ].map(src => (
                      <label key={src} className="flex items-center gap-2 text-xs text-black/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sourceFilter.includes(src)}
                          onChange={() => handleSourceCheckbox(src)}
                          className="rounded border-[#C9A96E]/30 text-[#C9A96E] bg-[#0D0D0D] h-3.5 w-3.5"
                        />
                        <span>{src}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#C9A96E]/10 flex gap-3">
              <button
                onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                className="flex-1 py-2 rounded-lg border border-[#C9A96E]/30 text-xs text-[#C9A96E]"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-2 rounded-lg bg-[#C9A96E] text-black font-semibold text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1714] border border-[#C9A96E]/30 rounded-xl p-4 shadow-2xl max-w-sm backdrop-blur-md bg-opacity-95 transition-all">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-[#C9A96E]/20 p-1.5 text-[#C9A96E]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#F5F0E8]">{toast.message}</p>
              <p className="text-[10px] text-[#C9A96E] font-mono mt-0.5">{toast.bidNumber}</p>
              <p className="text-[10px] text-[#8B7355] mt-1.5">
                Paste this into the portal's search bar to find your tender document details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
