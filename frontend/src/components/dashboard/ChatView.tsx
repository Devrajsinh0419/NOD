"use client"

import { useEffect, useState, useRef } from "react"
import { chatService, Meeting } from "@/services/chat.service"
import type { ChatRoom, ChatMessage } from "@/types/chat.types"
import { getMediaUrl } from "@/lib/api"
import { projectService } from "@/services/project.service"
import EscrowPaymentModal from "@/components/dashboard/EscrowPaymentModal"
import {
  MessageSquare,
  Video,
  FileText,
  Paperclip,
  Download,
  AlertTriangle,
  Plus,
  Play,
  Square,
  Loader2
} from "lucide-react"

interface Props {
  role: "client" | "designer" | "architect" | "contractor"
}

type TabType = "chat" | "meetings" | "files"

export default function ChatView({ role }: Props) {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState("")

  // New features state variables
  const [activeTab, setActiveTab] = useState<TabType>("chat")
  const [warningsCount, setWarningsCount] = useState(0)
  const [isRestricted, setIsRestricted] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loadingMeetings, setLoadingMeetings] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sendingFile, setSendingFile] = useState(false)

  // Escrow payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [requestingCompletion, setRequestingCompletion] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load chat rooms
  useEffect(() => {
    loadRooms()
    return () => {
      stopPolling()
    }
  }, [])

  // Poll messages and info when active room changes
  useEffect(() => {
    if (activeRoom) {
      loadRoomData(activeRoom, true)
      startPolling(activeRoom)
    } else {
      setMessages([])
      setMeetings([])
      setWarningsCount(0)
      setIsRestricted(false)
      stopPolling()
    }
  }, [activeRoom])

  async function loadRooms() {
    setLoadingRooms(true)
    setError("")
    try {
      const data = await chatService.getRooms()
      setRooms(data)
      // Auto select first room if none is selected
      if (data.length > 0 && !activeRoom) {
        setActiveRoom(data[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chats")
    } finally {
      setLoadingRooms(false)
    }
  }

  const normalizeMsg = (msg: any, room: ChatRoom): ChatMessage => {
    const senderId = msg.sender_id || msg.sender?.id
    const senderName = msg.sender_name || msg.sender?.full_name || "System"
    const isOther = senderId === room.other_user?.id

    return {
      id: msg.id,
      content: msg.content || msg.message,
      is_system_message: msg.is_system_message || msg.message_type === "SYSTEM" || msg.is_flagged,
      message_type: msg.message_type || "TEXT",
      is_flagged: msg.is_flagged || false,
      attachment: msg.attachment,
      created_at: msg.created_at,
      sender: {
        id: senderId,
        full_name: senderName,
        role: isOther ? room.other_user?.role || "Member" : role,
        profile_photo: isOther ? room.other_user?.profile_photo || null : null
      }
    }
  }

  async function loadRoomData(room: ChatRoom | null, shouldScroll = false) {
    if (!room) return

    // 1. Fetch Warnings
    if (room.project) {
      try {
        const warnData = await chatService.getProjectWarnings(room.project.id)
        setWarningsCount(warnData.warning_count)
        setIsRestricted(warnData.restricted)
      } catch (err) {
        console.error("Failed to load project warnings:", err)
      }
    } else {
      setWarningsCount(0)
      setIsRestricted(false)
    }

    // 2. Fetch Messages
    try {
      if (room.project) {
        // Use project-specific moderated discussion room messages
        const data = await chatService.getProjectMessages(room.project.id)
        setMessages(data.map((m) => normalizeMsg(m, room)))
      } else {
        // Fallback to room standard messages
        const data = await chatService.getMessages(room.id)
        setMessages(data.map((m) => normalizeMsg(m, room)))
      }
      if (shouldScroll) {
        setTimeout(scrollToBottom, 50)
      }
    } catch (err) {
      console.error("Failed to load messages:", err)
    }

    // 3. Fetch Meetings
    if (room.project) {
      setLoadingMeetings(true)
      try {
        const meetData = await chatService.getProjectMeetings(room.project.id)
        setMeetings(meetData)
      } catch (err) {
        console.error("Failed to load project meetings:", err)
      } finally {
        setLoadingMeetings(false)
      }
    } else {
      setMeetings([])
    }
  }

  function startPolling(room: ChatRoom) {
    stopPolling()
    pollIntervalRef.current = setInterval(() => {
      // Quiet poll update
      loadRoomData(room, false)
    }, 4000)
  }

  function stopPolling() {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRoom) return
    if (!newMessage.trim() && !selectedFile) return

    const content = newMessage
    const file = selectedFile

    setNewMessage("") // Clear input instantly
    setSelectedFile(null)

    try {
      let sentMsg: ChatMessage
      if (activeRoom.project) {
        setSendingFile(true)
        const rawMsg = await chatService.sendProjectMessage(activeRoom.project.id, content, file || undefined)
        sentMsg = normalizeMsg(rawMsg, activeRoom)
      } else {
        const rawMsg = await chatService.sendMessage(activeRoom.id, content)
        sentMsg = normalizeMsg(rawMsg, activeRoom)
      }

      setMessages((prev) => [...prev, sentMsg])
      setTimeout(scrollToBottom, 50)

      // Update last message in the sidebar room item
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.id === activeRoom.id
            ? {
              ...r,
              last_message: {
                content: sentMsg.content,
                created_at: sentMsg.created_at,
              },
            }
            : r
        )
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
      // Quietly reload data to fetch latest warnings count/restriction status
      loadRoomData(activeRoom, false)
    } finally {
      setSendingFile(false)
    }
  }

  // Handle local file selection and format validation
  const handleFileClick = () => {
    if (isRestricted) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".docx"]
    if (!allowed.includes(ext)) {
      alert("Invalid file format. Allowed formats: PDF, PNG, JPG, JPEG, DOCX.")
      return
    }

    // Limit file size to 20MB
    if (file.size > 20 * 1024 * 1024) {
      alert("Maximum file size allowed is 20MB.")
      return
    }

    setSelectedFile(file)
  }

  // Meetings scheduling logic
  const handleScheduleMeeting = async () => {
    if (!activeRoom || !activeRoom.project || isRestricted) return
    try {
      const newMeeting = await chatService.createProjectMeeting(activeRoom.project.id)
      setMeetings((prev) => [newMeeting, ...prev])
      alert("Meeting scheduled successfully! Joining URL generated: " + newMeeting.meeting_url)
      loadRoomData(activeRoom, false)
    } catch (err) {
      alert("Failed to schedule meeting: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleStartMeeting = async (meeting: Meeting) => {
    try {
      await chatService.startMeeting(meeting.id)
      window.open(meeting.meeting_url, "_blank")
      loadRoomData(activeRoom, false)
    } catch (err) {
      alert("Failed to start meeting: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleEndMeeting = async (meeting: Meeting) => {
    try {
      await chatService.endMeeting(meeting.id)
      alert("Meeting completed and logged.")
      loadRoomData(activeRoom, false)
    } catch (err) {
      alert("Failed to end meeting: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  // Project Completed Clicked (Client view only)
  const handleCompleteProject = () => {
    if (!activeRoom || !activeRoom.project) return
    setPaymentModalOpen(true)
  }

  const handlePaymentSuccess = (result: any) => {
    setPaymentModalOpen(false)
    if (activeRoom && activeRoom.project) {
      const updatedProj = { ...activeRoom.project, status: "completed" } as any
      setActiveRoom({ ...activeRoom, project: updatedProj })
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id ? { ...r, project: updatedProj } : r
        )
      )
      loadRoomData(activeRoom, true)
    }
  }

  // Professional requests project completion
  const handleRequestCompletion = async () => {
    if (!activeRoom || !activeRoom.project) return
    try {
      setRequestingCompletion(true)
      const res = await projectService.requestProjectCompletion(activeRoom.project.id)
      alert(res.message || "Project completion requested. Client has been notified to make final payment.")

      // Update room local status
      const updatedProj = { ...activeRoom.project, status: "AWAITING_CLIENT_APPROVAL" } as any
      setActiveRoom({ ...activeRoom, project: updatedProj })
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id ? { ...r, project: updatedProj } : r
        )
      )
      loadRoomData(activeRoom, true)
    } catch (err) {
      alert("Failed to request completion: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setRequestingCompletion(false)
    }
  }

  // Filter rooms list
  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.toLowerCase()
    const nameMatch = room.name.toLowerCase().includes(query)
    const otherUserMatch = room.other_user?.full_name.toLowerCase().includes(query) || false
    const projectMatch = room.project?.title.toLowerCase().includes(query) || false
    return nameMatch || otherUserMatch || projectMatch
  })

  // Extract shared files from messages list
  const sharedFiles = messages.filter(
    (msg) => msg.message_type === "FILE" || (msg.attachment && msg.attachment !== null)
  )

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col px-4 md:px-0">
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 rounded-3xl border border-[#C9A96E]/60 bg-[#1A1714] overflow-hidden">

        {/* Left Column: Room List */}
        <div className="border-r border-[#C9A96E]/12 flex flex-col h-full bg-[#111111]">
          {/* Header */}
          <div className="p-5 border-b border-[#C9A96E]/6 space-y-3">
            <h3 className="text-lg font-light text-[#F5F0E8] tracking-wide font-serif" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Project Chats
            </h3>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-[#C9A96E]/5 border border-[#C9A96E]/6 px-4 py-2.5 text-xs text-black placeholder-black/80 focus:border-[#C9A96E]/12 outline-none"
              />
            </div>
          </div>

          {/* Room Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingRooms ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="w-5 h-5 text-[#C9A96E] animate-spin" />
                <span className="text-[10px] text-[#6B5A42]">Loading rooms...</span>
              </div>
            ) : filteredRooms.length === 0 ? (
              <p className="text-[11px] text-[#6B5A42] text-center py-8 italic">No active conversations found.</p>
            ) : (
              filteredRooms.map((room) => {
                const isActive = activeRoom?.id === room.id
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${isActive
                      ? "bg-[#C9A96E] text-[#0D0D0D] border-white font-bold"
                      : "bg-[#C9A96E]/3 text-black border-[#C9A96E]/6 hover:bg-[#C9A96E]/5 hover:border-[#C9A96E]/15"
                      }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center border border-[#C9A96E]/20">
                      {room.other_user?.profile_photo ? (
                        <img
                          src={getMediaUrl(room.other_user.profile_photo)}
                          alt={room.other_user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className={`text-xs ${isActive ? "text-black" : "text-[#8B7355]"}`}>
                          {room.other_user?.full_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-semibold truncate leading-none">
                          {room.other_user?.full_name || room.name}
                        </h4>
                      </div>
                      <p className={`text-[10px] truncate mt-1.5 ${isActive ? "text-black/70" : "text-[#8B7355]"}`}>
                        {room.last_message?.content || "No messages yet"}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat/Discussion Window */}
        <div className="md:col-span-2 flex flex-col h-full bg-[#1A1714]">
          {activeRoom ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#C9A96E]/12 flex items-center justify-between bg-[#111111] shrink-0 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center border border-[#C9A96E]/20">
                    {activeRoom.other_user?.profile_photo ? (
                      <img
                        src={getMediaUrl(activeRoom.other_user.profile_photo)}
                        alt={activeRoom.other_user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-[#8B7355]">
                        {activeRoom.other_user?.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-black leading-none truncate">
                      {activeRoom.other_user?.full_name || activeRoom.name}
                    </h4>
                    <p className="text-[10px] text-[#8B7355] mt-1 uppercase tracking-wider truncate">
                      {role === "client"
                        ? activeRoom.other_user?.role || "Lead Architect"
                        : activeRoom.project?.title || "Modern Villa"}
                    </p>
                  </div>
                </div>

                {/* Right Side Info & Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Warnings Strike Counter Badge */}
                  {activeRoom.project && (
                    <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${warningsCount >= 3
                      ? "border-red-500/20 bg-red-500/5 text-red-500"
                      : warningsCount > 0
                        ? "border-amber-500/20 bg-amber-500/5 text-amber-500 animate-pulse"
                        : "border-[#C9A96E]/20 bg-[#C9A96E]/5 text-[#C9A96E]"
                      }`}>
                      <AlertTriangle className="w-3 h-3" />
                      <span>Strikes: {warningsCount}/3</span>
                    </div>
                  )}

                  {/* Completion Action Buttons */}
                  {role === "client" && activeRoom.project?.status === "AWAITING_CLIENT_APPROVAL" && (
                    <button
                      onClick={handleCompleteProject}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-bold uppercase tracking-wider transition-colors"
                    >
                      Release Payout (30%)
                    </button>
                  )}

                  {role === "client" && activeRoom.project?.status === "ADVANCE_PAID" && (
                    <span className="px-2.5 py-1.5 rounded-lg border border-[#C9A96E]/20 bg-[#C9A96E]/5 text-[#C9A96E] text-[9px] uppercase font-semibold">
                      In Progress
                    </span>
                  )}

                  {role !== "client" && activeRoom.project?.status === "ADVANCE_PAID" && (
                    <button
                      onClick={handleRequestCompletion}
                      disabled={requestingCompletion}
                      className="px-3 py-1.5 rounded-lg bg-[#C9A96E] hover:bg-[#B8944F] text-black text-[9px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {requestingCompletion ? "Submitting..." : "Request Completion"}
                    </button>
                  )}

                  {role !== "client" && activeRoom.project?.status === "AWAITING_CLIENT_APPROVAL" && (
                    <span className="px-2.5 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[9px] uppercase font-semibold">
                      Awaiting Release
                    </span>
                  )}

                  {activeRoom.project?.status === "completed" && (
                    <span className="px-2.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[9px] uppercase font-semibold">
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Action Tabs */}
              <div className="flex border-b border-[#C9A96E]/12 bg-[#111111] px-5 py-2.5 shrink-0 gap-6">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`pb-1 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${activeTab === "chat"
                    ? "text-[#C9A96E] border-[#C9A96E]"
                    : "text-[#8B7355] border-transparent hover:text-[#C9A96E]/80"
                    }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab("meetings")}
                  className={`pb-1 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${activeTab === "meetings"
                    ? "text-[#C9A96E] border-[#C9A96E]"
                    : "text-[#8B7355] border-transparent hover:text-[#C9A96E]/80"
                    }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Meetings
                </button>
                <button
                  onClick={() => setActiveTab("files")}
                  className={`pb-1 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${activeTab === "files"
                    ? "text-[#C9A96E] border-[#C9A96E]"
                    : "text-[#8B7355] border-transparent hover:text-[#C9A96E]/80"
                    }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Shared Files ({sharedFiles.length})
                </button>
              </div>

              {/* Viewport Content */}
              {activeTab === "chat" && (
                <>
                  {/* Messages viewport */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => {
                      const isSystem = msg.message_type === "SYSTEM" || msg.is_system_message
                      if (isSystem) {
                        return (
                          <div key={msg.id} className="flex justify-center my-3">
                            <div className="px-4 py-2 rounded-full border border-[#C9A96E]/20 bg-white/2 text-[10px] text-[#6B5A42] tracking-wide text-center">
                              {msg.content}
                            </div>
                          </div>
                        )
                      }

                      const isMe = msg.sender.id !== activeRoom.other_user?.id

                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[70%] space-y-1.5">
                            {/* Name/Role */}
                            <div className={`flex items-baseline gap-2 text-[9px] uppercase tracking-wider text-[#6B5A42] ${isMe ? "justify-end" : "justify-start"}`}>
                              <span className="font-semibold text-[#6B5A42]">{msg.sender.full_name}</span>
                              <span>•</span>
                              <span>{msg.sender.role}</span>
                            </div>

                            {/* Bubble */}
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${isMe
                                ? "bg-[#1A1714] text-[#F5F0E8] border border-[#C9A96E]/12 rounded-tr-none"
                                : "bg-[#C9A96E] text-[#0D0D0D] rounded-tl-none"
                                } ${msg.is_flagged ? "border-red-500/50 text-red-400 bg-red-950/20" : ""}`}
                            >
                              {msg.content}

                              {/* Attachment layout inside message bubble */}
                              {msg.attachment && (
                                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-3 bg-black/10 rounded-lg p-2">
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span className="truncate text-[10px]">Open Attachment</span>
                                  </div>
                                  <a
                                    href={getMediaUrl(msg.attachment)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 rounded bg-white/10 hover:bg-white/20 transition-all shrink-0 text-inherit"
                                  >
                                    <Download className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input box */}
                  <div className="p-5 border-t border-[#C9A96E]/12 shrink-0 bg-[#111111]">
                    {isRestricted ? (
                      <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-center rounded-2xl flex flex-col items-center gap-1">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                        <span className="font-bold text-xs uppercase tracking-wider">Communication privileges restricted</span>
                        <p className="text-[10px] opacity-80">Strikes: 3/3. Sharing personal contact information has disabled communication. Contact admin.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSendMessage} className="relative rounded-2xl border border-[#C9A96E]/20 bg-[#C9A96E]/3 p-4 flex flex-col gap-3">
                        {/* File preview badge */}
                        {selectedFile && (
                          <div className="flex items-center justify-between bg-[#C9A96E]/15 border border-[#C9A96E]/20 rounded-xl px-3 py-1.5 text-[10px] text-black">
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-3.5 h-3.5 text-black shrink-0" />
                              <span className="truncate font-semibold">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedFile(null)}
                              className="text-black font-bold ml-2 cursor-pointer hover:scale-110"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        <textarea
                          rows={1}
                          placeholder={sendingFile ? "Uploading file..." : "Start The Conversation"}
                          value={newMessage}
                          disabled={sendingFile}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage(e)
                            }
                          }}
                          className="w-full bg-transparent text-xs text-black placeholder-[#C9A96E] resize-none outline-none disabled:opacity-50"
                        />
                        <div className="flex justify-between items-center pt-2 border-t border-[#C9A96E]/20">
                          <div className="flex gap-3 text-[#8B7355]">
                            <button
                              type="button"
                              onClick={handleFileClick}
                              className="hover:text-black transition-colors text-sm cursor-pointer"
                              title="Attach PDF, PNG, JPG, JPEG, DOCX"
                            >
                              <Paperclip className="w-4 h-4" />
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".pdf,.png,.jpg,.jpeg,.docx"
                              className="hidden"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={(!newMessage.trim() && !selectedFile) || sendingFile}
                            className="w-8 h-8 rounded-full bg-white border border-[#C9A96E] hover:bg-[#B8944F] text-black flex items-center justify-center text-xs font-bold transition-all disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                          >
                            {sendingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "↑"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </>
              )}

              {activeTab === "meetings" && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Start / Schedule Section */}
                  <div className="flex justify-between items-center border-b border-[#C9A96E]/12 pb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[#F5F0E8]">Project Video Meetings</h3>
                      <p className="text-[10px] text-[#8B7355] mt-0.5">Start a dynamic session using the NOD secure video meet pipeline.</p>
                    </div>
                    {activeRoom.project ? (
                      <button
                        onClick={handleScheduleMeeting}
                        disabled={isRestricted}
                        className="px-3.5 py-2 bg-[#C9A96E] hover:bg-[#B8944F] text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Schedule Meeting
                      </button>
                    ) : null}
                  </div>

                  {/* Meetings List */}
                  {loadingMeetings ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Loader2 className="w-6 h-6 text-[#C9A96E] animate-spin" />
                      <span className="text-[10px] text-[#6B5A42]">Loading meetings history...</span>
                    </div>
                  ) : meetings.length === 0 ? (
                    <div className="text-center py-12 border border-[#C9A96E]/12 rounded-2xl bg-white/2 space-y-1">
                      <Video className="w-8 h-8 text-[#8B7355] mx-auto opacity-30" />
                      <p className="text-xs text-[#8B7355] font-semibold">No meetings scheduled yet</p>
                      <p className="text-[10px] text-[#6B5A42]">Click the Schedule button to initiate a secure meeting room.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meetings.map((meet) => {
                        const isCompleted = meet.status === "COMPLETED"
                        const isActive = meet.status === "ACTIVE"

                        return (
                          <div
                            key={meet.id}
                            className="p-4 border border-[#C9A96E]/12 rounded-2xl bg-[#111111] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#C9A96E]/20 transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#F5F0E8]">Meeting #{meet.id}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${isCompleted
                                  ? "bg-white/5 text-[#8B7355]"
                                  : isActive
                                    ? "bg-emerald-500/10 text-emerald-400 animate-pulse border border-emerald-500/20"
                                    : "bg-blue-500/10 text-blue-400"
                                  }`}>
                                  {meet.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#8B7355]">
                                Created on: {new Date(meet.created_at).toLocaleString()}
                              </p>
                              {isCompleted && (
                                <p className="text-[10px] text-emerald-400/80">
                                  Duration: {Math.floor(meet.duration / 60)}m {meet.duration % 60}s
                                </p>
                              )}
                            </div>

                            {/* Meeting Action Controls */}
                            <div className="flex gap-2 shrink-0">
                              {!isCompleted && (
                                <>
                                  <button
                                    onClick={() => handleStartMeeting(meet)}
                                    disabled={isRestricted}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-black" />
                                    {isActive ? "Join" : "Start"}
                                  </button>
                                  {isActive && (
                                    <button
                                      onClick={() => handleEndMeeting(meet)}
                                      className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-red-500/20 cursor-pointer"
                                    >
                                      <Square className="w-3 h-3 fill-red-500" />
                                      End
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "files" && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F0E8]">Shared Design Files</h3>
                    <p className="text-[10px] text-[#8B7355] mt-0.5">Access uploaded images, drawings, and documents for this project.</p>
                  </div>

                  {sharedFiles.length === 0 ? (
                    <div className="text-center py-12 border border-[#C9A96E]/12 rounded-2xl bg-white/2 space-y-1">
                      <FileText className="w-8 h-8 text-[#8B7355] mx-auto opacity-30" />
                      <p className="text-xs text-[#8B7355] font-semibold">No shared files found</p>
                      <p className="text-[10px] text-[#6B5A42]">Use the attachment clip inside the chat viewport to share project files.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sharedFiles.map((msg) => {
                        const filename = msg.attachment
                          ? msg.attachment.substring(msg.attachment.lastIndexOf("/") + 1)
                          : "Attachment"

                        return (
                          <div
                            key={msg.id}
                            className="p-4 border border-[#C9A96E]/12 rounded-2xl bg-[#111111] hover:border-[#C9A96E]/20 transition-all flex items-start justify-between gap-3 min-w-0"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-[#C9A96E] shrink-0" />
                                <h4 className="text-xs font-semibold truncate text-[#F5F0E8]">{filename}</h4>
                              </div>
                              <p className="text-[9px] text-[#8B7355] truncate">
                                Shared by: {msg.sender.full_name}
                              </p>
                              <p className="text-[9px] text-[#6B5A42]">
                                Date: {new Date(msg.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            {msg.attachment && (
                              <a
                                href={getMediaUrl(msg.attachment)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-[#C9A96E]/5 hover:bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/20 flex items-center justify-center shrink-0 cursor-pointer"
                                title="Download File"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-2">
              <MessageSquare className="w-8 h-8 text-[#8B7355] opacity-20" />
              <p className="text-xs text-[#6B5A42]">Select a project conversation to start chatting.</p>
            </div>
          )}
        </div>

      </div>

      {activeRoom?.project && (
        <EscrowPaymentModal
          isOpen={paymentModalOpen}
          mode="complete_project"
          targetId={activeRoom.project.id}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
