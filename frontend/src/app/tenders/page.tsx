"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Lock
} from "lucide-react";
import { Tender, TenderStats } from "@/types/tender.types";
import { authService } from "@/services/auth.service";

export default function TendersPage() {
  const [role, setRole] = useState<string>("client");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [stats, setStats] = useState<TenderStats>({
    totalTenders: 0,
    relevantTenders: 0,
    ministriesCount: 0,
    departmentsCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; bidNumber: string } | null>(null);

  // Lock and Premium Payment States
  const [unlocked, setUnlocked] = useState(false);
  const [checkingUnlock, setCheckingUnlock] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  // Filter States
  const [activeTab, setActiveTab] = useState<"all" | "relevant">("all");
  const [search, setSearch] = useState("");
  const [ministry, setMinistry] = useState("");
  const [department, setDepartment] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Syncing State
  const [syncing, setSyncing] = useState(false);

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
        department
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
    if (typeof window !== "undefined") {
      const isUnlocked = localStorage.getItem("tenders_unlocked") === "true";
      setUnlocked(isUnlocked);
      if (isUnlocked) {
        fetchStats();
      }
    }
    setCheckingUnlock(false);

    const storedUser = authService.getStoredUser();
    if (storedUser && storedUser.role) {
      setRole(storedUser.role.toLowerCase());
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      fetchTenders();
    }
  }, [unlocked, page, activeTab, search, ministry, department]);

  const handleTabChange = (tab: "all" | "relevant") => {
    setActiveTab(tab);
    setPage(1); // Reset to page 1 on tab switch
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleMinistryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinistry(e.target.value);
    setPage(1);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartment(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setMinistry("");
    setDepartment("");
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const totalPages = Math.ceil(total / limit);

  const handleViewTender = (e: React.MouseEvent, bidNumber: string) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bidNumber).then(() => {
        setToast({
          message: "Bid Number copied to clipboard!",
          bidNumber: bidNumber
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

  if (checkingUnlock) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C9A96E]"></div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0E8] font-sans pb-20">
        {/* Navbar / Header */}
        <header className="border-b border-[#C9A96E]/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href={`/dashboard/${role}`} className="flex items-center gap-1">
              <Image src={logo} alt="Logo" className="h-15 w-15" />
              <p className="text-6xl font-bold text-white">N</p>
              <div className="leading-none">
                <p className="text-3xl font-bold text-white">OD</p>
                <p className="text-[14px]  text-white">IGHT OWL DESIGNERS</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-white hover:text-black transition-colors">
                Home
              </Link>
            </div>
          </div>
        </header>

        {/* Lock Screen main content */}
        <main className="mx-auto max-w-4xl px-6 mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-[#1A1714] border border-[#C9A96E]/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute -top-24 -left-24 h-48 w-48 bg-[#C9A96E]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-[#C9A96E]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-center mb-6 relative">
              <div className="p-5 bg-[#C9A96E]/10 rounded-full border border-[#C9A96E]/20 text-[#C9A96E] animate-pulse">
                <Lock className="h-10 w-10" />
              </div>
              <div className="absolute top-0 right-1/2 translate-x-12 -translate-y-1 bg-[#C9A96E] text-[#0D0D0D] text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold">
                Premium
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-light text-[#F5F0E8] tracking-wide mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Live Tanders Discovery Pipeline
            </h1>
            
            <p className="text-sm text-[#8B7355] leading-relaxed max-w-lg mx-auto mb-8">
              Unlock real-time engineering, custom fabrication, and architectural government contracts sourced live from Government e-Marketplace India. Get a competitive edge with keyword filters and sync alerts.
            </p>

            {/* Features list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto text-left mb-8 border-t border-b border-[#C9A96E]/10 py-6">
              <div className="flex items-center gap-2.5 text-xs text-[#F5F0E8]/90">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"></span>
                <span>Live Government Contract Sync</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#F5F0E8]/90">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"></span>
                <span>CNC & Fabrication Matcher</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#F5F0E8]/90">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"></span>
                <span>Keyword & Category Filtering</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#F5F0E8]/90">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"></span>
                <span>Copy & Deep Link to Portal</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs text-[#8B7355] uppercase tracking-wider block">One-Time Activation</span>
                <span className="text-4xl font-light text-white font-serif">₹499</span>
              </div>

              <button
                onClick={() => setPaymentModalOpen(true)}
                className="w-full max-w-sm py-4 rounded-full bg-[#C9A96E] hover:bg-[#B8944F] text-[#0D0D0D] font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-[#C9A96E]/10"
              >
                Unlock Access Now
              </button>
              
              <p className="text-[10px] text-[#6B5A42]">
                Secure payment simulation. No actual credit card details required.
              </p>
            </div>
          </div>
        </main>

        {/* Dummy Payment Modal */}
        {paymentModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-[#C9A96E]/30 bg-[#111111] p-6 space-y-6 shadow-2xl text-[#F5F0E8]">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-light font-serif text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Secure Payment Gateway
                </h3>
                <p className="text-[10px] text-[#8B7355] tracking-wider uppercase font-semibold">
                  Tanders Pipeline Unlock
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#C9A96E]/15 bg-[#1B1917]/50 space-y-4">
                <div className="flex justify-between text-xs text-[#8B7355]">
                  <span>Premium Feature Activation</span>
                  <span className="font-semibold text-white">₹499.00</span>
                </div>
                <div className="flex justify-between text-xs text-[#8B7355]">
                  <span>Platform Fees</span>
                  <span className="text-emerald-500 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#C9A96E]/20">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#C9A96E]">Total Payable</span>
                  <span className="text-2xl font-light text-white font-serif">₹499.00</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Sandbox/Test Mode</span>
                </div>
                <p className="text-[10px] text-[#8B7355]">
                  Click "Pay Securely" to trigger the sandbox payment handler and instantly unlock Tanders.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  disabled={paying}
                  className="w-1/2 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#8B7355] border border-[#C9A96E]/20 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setPaying(true);
                    await new Promise(r => setTimeout(r, 1500));
                    localStorage.setItem("tenders_unlocked", "true");
                    setUnlocked(true);
                    setPaymentModalOpen(false);
                    setPaying(false);
                  }}
                  disabled={paying}
                  className="w-1/2 py-3 rounded-full bg-[#C9A96E] hover:bg-[#B8944F] text-[#0D0D0D] text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#0D0D0D]/20 border-t-[#0D0D0D] rounded-full animate-spin" />
                      Securing...
                    </>
                  ) : (
                    "Pay Securely"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0E8] font-sans pb-20">
      {/* Navbar / Header */}
      <header className="border-b border-[#C9A96E]/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href={`/dashboard/${role}`} className="flex items-center gap-1">
            <Image src={logo} alt="Logo" className="h-15 w-15" />
            <p className="text-6xl font-bold text-white">N</p>
            <div className="leading-none">
              <p className="text-3xl font-bold text-white">OD</p>
              <p className="text-[14px]  text-white">IGHT OWL DESIGNERS</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-white hover:text-black transition-colors">
              Home
            </Link>
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-full border border-[#C9A96E]/50 bg-[#C9A96E]/50 px-4 py-2 text-xs text-white hover:bg-[#C9A96E] transition-colors disabled:opacity-50"
            >
              <RotateCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing Live Tanders..." : "Sync Live Tanders"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-6 mt-8">

        {/* Title Hero */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-cormorant font-bold text-[#F5F0E8] tracking-wide mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Government Tender Discovery
          </h1>
          <p className="text-sm text-[#8B7355] max-w-2xl">
            Browse and discover engineering, design, fabrication, and manufacturing opportunities sourced live from Government e-Marketplace (Tanders) India.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Tenders */}
          <div className="bg-[#1A1714] border border-[#C9A96E]/15 rounded-xl p-5 relative overflow-hidden transition-all hover:border-[#C9A96E]/30 shadow-lg">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 bg-[#C9A96E]/5 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8B7355] uppercase tracking-wider">Total Tenders</p>
                <h3 className="text-3xl font-semibold mt-1 font-cormorant text-[#C9A96E]">
                  {stats.totalTenders}
                </h3>
              </div>
              <div className="bg-[#C9A96E]/10 p-3 rounded-lg text-[#C9A96E]">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] text-[#8B7355]">
              <TrendingUp className="h-3 w-3 text-[#C9A96E] mr-1" />
              <span>Live database sync active</span>
            </div>
          </div>

          {/* Card 2: Relevant CNC Tenders */}
          <div className="bg-[#1A1714] border border-[#C9A96E]/15 rounded-xl p-5 relative overflow-hidden transition-all hover:border-[#C9A96E]/30 shadow-lg">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 bg-[#C9A96E]/5 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8B7355] uppercase tracking-wider">CNC & Fab Tenders</p>
                <h3 className="text-3xl font-semibold mt-1 font-cormorant text-[#C9A96E]">
                  {stats.relevantTenders}
                </h3>
              </div>
              <div className="bg-[#C9A96E]/10 p-3 rounded-lg text-[#C9A96E]">
                <Cpu className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] text-[#C9A96E]">
              <span>Matching core custom keywords</span>
            </div>
          </div>

          {/* Card 3: Ministries */}
          <div className="bg-[#1A1714] border border-[#C9A96E]/15 rounded-xl p-5 relative overflow-hidden transition-all hover:border-[#C9A96E]/30 shadow-lg">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 bg-[#C9A96E]/5 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8B7355] uppercase tracking-wider">Ministries</p>
                <h3 className="text-3xl font-semibold mt-1 font-cormorant text-[#C9A96E]">
                  {stats.ministriesCount}
                </h3>
              </div>
              <div className="bg-[#C9A96E]/10 p-3 rounded-lg text-[#C9A96E]">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] text-[#8B7355]">
              <span>Active bidding agencies</span>
            </div>
          </div>

          {/* Card 4: Departments */}
          <div className="bg-[#1A1714] border border-[#C9A96E]/15 rounded-xl p-5 relative overflow-hidden transition-all hover:border-[#C9A96E]/30 shadow-lg">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 bg-[#C9A96E]/5 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8B7355] uppercase tracking-wider">Departments</p>
                <h3 className="text-3xl font-semibold mt-1 font-cormorant text-[#C9A96E]">
                  {stats.departmentsCount}
                </h3>
              </div>
              <div className="bg-[#C9A96E]/10 p-3 rounded-lg text-[#C9A96E]">
                <Layers className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] text-[#8B7355]">
              <span>Procurement segments</span>
            </div>
          </div>
        </div>

        {/* Tab System & Search Controls */}
        <div className="bg-[#1A1714] border border-[#C9A96E]/10 rounded-2xl p-6 mb-8 shadow-md">
          {/* Search and Filters grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative col-span-1 md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B7355]" />
              <input
                type="text"
                placeholder="Search by tender title or bid number..."
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#F5F0E8] focus:outline-none focus:border-[#C9A96E]/50 transition-colors placeholder-[#5A4A35]"
              />
            </div>

            {/* Ministry */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B7355]" />
              <input
                type="text"
                placeholder="Filter by Ministry..."
                value={ministry}
                onChange={handleMinistryChange}
                className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#F5F0E8] focus:outline-none focus:border-[#C9A96E]/50 transition-colors placeholder-[#5A4A35]"
              />
            </div>

            {/* Department */}
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B7355]" />
              <input
                type="text"
                placeholder="Filter by Department..."
                value={department}
                onChange={handleDepartmentChange}
                className="w-full bg-[#0D0D0D] border border-[#C9A96E]/15 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#F5F0E8] focus:outline-none focus:border-[#C9A96E]/50 transition-colors placeholder-[#5A4A35]"
              />
            </div>
          </div>

          {/* Filter Footer Actions */}
          {(search || ministry || department) && (
            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="text-xs text-[#C9A96E] hover:text-[#F5F0E8] transition-colors flex items-center gap-1.5"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Tenders Grid / List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-[#1A1714] border border-[#C9A96E]/10 rounded-xl p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-4 bg-[#C9A96E]/15 rounded w-1/4"></div>
                  <div className="h-4 bg-[#C9A96E]/15 rounded w-16"></div>
                </div>
                <div className="h-6 bg-[#C9A96E]/15 rounded w-3/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                  <div className="h-4 bg-[#C9A96E]/15 rounded w-2/3"></div>
                  <div className="h-4 bg-[#C9A96E]/15 rounded w-1/2"></div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#C9A96E]/5">
                  <div className="h-4 bg-[#C9A96E]/15 rounded w-1/3"></div>
                  <div className="h-8 bg-[#C9A96E]/15 rounded w-24"></div>
                </div>
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
            <h4 className="font-semibold text-lg text-[#F5F0E8] mb-2">No Tenders Found</h4>
            <p className="text-xs text-[#8B7355] mb-6">
              {activeTab === "relevant"
                ? "No tenders match the CNC, fabrication, or manufacturing keywords right now."
                : "No government tenders match your active search terms or filters."}
            </p>
            {(search || ministry || department) && (
              <button
                onClick={clearFilters}
                className="rounded-full border border-[#C9A96E] px-6 py-2 text-xs text-[#C9A96E] hover:bg-[#C9A96E]/10 transition-colors"
              >
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-[#1A1714] border border-[#C9A96E]/10 rounded-xl p-6 hover:border-[#C9A96E]/30 transition-all shadow-md group relative overflow-hidden"
              >
                {/* Tenders Tag Badge */}
                <div className="absolute top-0 right-0 bg-[#C9A96E]/10 border-l border-b border-[#C9A96E]/15 px-3 py-1 rounded-bl-lg text-[9px] text-[#C9A96E] font-semibold tracking-wider uppercase">
                  {tender.source === "GeM" ? "Tanders" : (tender.source || "Tanders")}
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
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
                    <h3 className="text-base font-semibold text-[#F5F0E8] mt-1.5 mb-3 group-hover:text-[#C9A96E] transition-colors leading-snug">
                      {tender.title}
                    </h3>

                    {/* Organization details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1.5 gap-x-4 text-xs text-[#8B7355]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#F5F0E8]/50">Ministry:</span>
                        <span className="truncate">{tender.ministry}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#F5F0E8]/50">Department:</span>
                        <span className="truncate">{tender.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Info */}
                  <div className="flex flex-row md:flex-col md:items-end justify-between md:justify-start gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#C9A96E]/5 mt-2 md:mt-0">
                    <div className="text-[10px] text-[#8B7355] text-left md:text-right">
                      <p>Start: <span className="text-[#F5F0E8]">{formatDate(tender.startDate)}</span></p>
                      <p className="mt-0.5">End: <span className="text-[#F5F0E8]">{formatDate(tender.endDate)}</span></p>
                    </div>

                    <button
                      onClick={(e) => handleViewTender(e, tender.bidNumber)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9A96E]/30 bg-[#C9A96E]/5 px-4 py-2 text-xs text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#0D0D0D] transition-all font-semibold"
                    >
                      View Tender
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

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    // Display sliding window of page numbers
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
      </main>

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
                Paste this into the Tanders search bar to find your tender.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
