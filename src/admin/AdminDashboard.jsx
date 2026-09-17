import React, { useState, useEffect, useMemo } from 'react'
import ganpatiLogo from '../assets/ganapati-logo.jpeg'
import mandalUpiQr from '../assets/mandal-upi-qr.jpg'

export default function AdminDashboard({ 
  onBackToWebsite, 
  donations: propDonations, 
  onUpdateDonations,
  expenses: propExpenses,
  onUpdateExpenses 
}) {
  // --- AUTHENTICATION STATE ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('sym_admin_auth') === 'true'
  })
  const [adminEmail, setAdminEmail] = useState('admin@shivputr.com')
  const [adminPassword, setAdminPassword] = useState('bappa2026')
  const [loginError, setLoginError] = useState('')

  // --- ACTIVE TAB ---
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'karyakartas' | 'donations' | 'expenses' | 'vippasses' | 'livecontrol' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // --- PERSISTENT DATA STATES ---
  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem('sym_team_members')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) { }
    }
    const currentLogged = localStorage.getItem('sym_logged_user') || localStorage.getItem('sym_saved_profile_name') || 'Krunal Satote'
    const currentEmail = localStorage.getItem('sym_user_email') || 'krunal.satote@gmail.com'
    const currentPhone = localStorage.getItem('sym_user_phone') || '9820911223'
    return [
      { id: 1, name: 'Rahul Shinde', role: 'President / Adhyaksh', dept: 'Core Leadership', phone: '98201xxxxx', email: 'rahul.shinde@shivputr.com', bloodGroup: 'O+', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
      { id: 2, name: 'Amit Pawar', role: 'Vice President', dept: 'Core Leadership', phone: '98202xxxxx', email: 'amit.pawar@shivputr.com', bloodGroup: 'B+', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
      { id: 3, name: 'Suraj Jadhav', role: 'Treasurer (Khajanchi)', dept: 'Finance & Accounts', phone: '98203xxxxx', email: 'suraj.jadhav@shivputr.com', bloodGroup: 'A+', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
      { id: 4, name: 'Vicky More', role: 'General Secretary', dept: 'Core Leadership', phone: '98204xxxxx', email: 'vicky.more@shivputr.com', bloodGroup: 'AB+', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop' },
      { id: 5, name: 'Rohit Kadam', role: 'Aarti Seva Lead', dept: 'Aarti Seva', phone: '98205xxxxx', email: 'rohit.kadam@shivputr.com', bloodGroup: 'O+', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=300&auto=format&fit=crop' },
      { id: 6, name: 'Swapnil Sawant', role: 'Mahaprasad Manager', dept: 'Mahaprasad', phone: '98206xxxxx', email: 'swapnil.sawant@shivputr.com', bloodGroup: 'B+', img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop' },
      { id: 7, name: 'Pratik Deshmukh', role: 'Decor & Lights Head', dept: 'Decor & Tech', phone: '98207xxxxx', email: 'pratik.deshmukh@shivputr.com', bloodGroup: 'A+', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop' },
      { id: 8, name: 'Akash Mane', role: 'Lead Karyakarta', dept: 'Security & Crowd', phone: '98208xxxxx', email: 'akash.mane@shivputr.com', bloodGroup: 'O-', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop' },
      { id: 9, name: currentLogged, role: 'Volunteer / Karyakarta', dept: 'Mahaprasad & Seva', phone: currentPhone, email: currentEmail, bloodGroup: 'B+', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop' }
    ]
  })

  const [joinRequests, setJoinRequests] = useState(() => {
    const saved = localStorage.getItem('sym_join_requests')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { }
    }
    return [
      { id: 101, name: 'Sanket Ghadge', phone: '9876543210', role: 'Volunteer / Karyakarta', address: 'Ward 4, Near Maruti Mandir', status: 'Pending', date: '08 Sep 2026' },
      { id: 102, name: 'Mayur Joshi', phone: '9822114433', role: 'Mahaprasad Team', address: 'Bazaar Peth', status: 'Pending', date: '09 Sep 2026' },
      { id: 103, name: 'Tanmay Salunkhe', phone: '9890011223', role: 'Aarti Seva Member', address: 'Shivaji Chowk', status: 'Approved', date: '07 Sep 2026' }
    ]
  })

  const [donations, setDonations] = useState(() => {
    if (propDonations && propDonations.length > 0) return propDonations
    const saved = localStorage.getItem('sym_donations')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { }
    }
    return [
      { id: 'REC-101', name: 'Rajesh Sharma', amount: 1100, category: 'Mahaprasad & Anna Daan', mode: 'UPI (GPay)', utr: '425519283741', date: '09 Sep 2026', time: '10:30 AM', message: 'Bappa ke charno mein samarpit.' },
      { id: 'REC-102', name: 'Pooja Kulkarni', amount: 501, category: 'Mandap & Pujan Seva', mode: 'Scanner QR', utr: '425510294827', date: '09 Sep 2026', time: '11:15 AM', message: 'Sarvajanik Utsav ke liye.' },
      { id: 'REC-103', name: 'Kishore Patil', amount: 2501, category: 'Mahaprasad & Anna Daan', mode: 'Cash', utr: 'OFFLINE-CASH', date: '08 Sep 2026', time: '07:45 PM', message: 'Parivar ki taraf se Mahaprasad bhent.' },
      { id: 'REC-104', name: 'Mahesh Thorat', amount: 5100, category: 'Social Welfare Seva', mode: 'UPI Direct', utr: '425499281726', date: '08 Sep 2026', time: '02:20 PM', message: 'Garib vidyarthi kit sahayata.' }
    ]
  })

  useEffect(() => {
    if (propDonations && propDonations.length > 0) {
      setDonations(propDonations)
    }
  }, [propDonations])

  const [expenses, setExpenses] = useState(() => {
    if (propExpenses && propExpenses.length > 0) return propExpenses
    const saved = localStorage.getItem('sym_expenses')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { }
    }
    return [
      {
        id: 'EXP-101',
        title: 'Bappa Mahaprasad Laddu & Modak Samagri',
        amount: 1200,
        category: 'Mahaprasad & Anna Daan',
        mode: 'UPI',
        utr: '425519882210',
        spentBy: 'Rahul Shinde',
        date: '09 Sep 2026',
        time: '11:30 AM',
        status: 'Approved',
        approvedBy: 'Admin Board',
        remarks: '15kg Besan, Pure Ghee & Elaichi bill paid via PhonePe'
      },
      {
        id: 'EXP-102',
        title: 'Mandap Phool & Garlands (Har-Phool)',
        amount: 350,
        category: 'Mandap & Pujan Seva',
        mode: 'Cash',
        utr: 'CASH-PANDAL',
        spentBy: 'Amit Pawar',
        date: '09 Sep 2026',
        time: '04:15 PM',
        status: 'Approved',
        approvedBy: 'Admin Board',
        remarks: 'Fresh Marigold and Rose malas for evening aarti'
      },
      {
        id: 'EXP-103',
        title: 'Laddu Prasad Packaging Pouches & Boxes',
        amount: 100,
        category: 'Mahaprasad & Anna Daan',
        mode: 'UPI',
        utr: '425588392019',
        spentBy: 'Jay Patil',
        date: '10 Sep 2026',
        time: '02:40 PM',
        status: 'Pending',
        remarks: '50 pcs food grade pouches bought by Jay Patil for laddu distribution'
      }
    ]
  })

  useEffect(() => {
    if (propExpenses && propExpenses.length > 0) {
      setExpenses(propExpenses)
    }
  }, [propExpenses])

  const [vipPasses, setVipPasses] = useState(() => {
    const saved = localStorage.getItem('sym_vip_passes')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { }
    }
    return [
      { passId: 'SYM-2026-VIP-4812', name: 'Anand Kulkarni', phone: '9820011223', sewaType: 'Evening Mahā-Aarti (7:30 PM)', date: '2026-09-10', count: 4, checkedIn: false },
      { passId: 'SYM-2026-VIP-9021', name: 'Dr. Sandeep More', phone: '9819922334', sewaType: 'Morning Aarti (8:00 AM)', date: '2026-09-11', count: 2, checkedIn: true },
      { passId: 'SYM-2026-VIP-3310', name: 'Advocate Shailesh Rao', phone: '9821033445', sewaType: 'VIP Quick Darshan Slot (Anytime)', date: '2026-09-10', count: 2, checkedIn: false }
    ]
  })

  const [isAartiLive, setIsAartiLive] = useState(() => {
    return localStorage.getItem('sym_is_live') === 'true'
  })

  const [announcement, setAnnouncement] = useState(() => {
    return localStorage.getItem('sym_announcement') || '🙏 Grand Evening Mahā-Aarti begins at 7:30 PM. Prasad distribution follows.'
  })

  // UPI Configuration state
  const [upiId, setUpiId] = useState(() => {
    return localStorage.getItem('sym_mandal_upi_id') || 'kunal.satote30@okhdfcbank'
  })
  const [payeeName, setPayeeName] = useState(() => {
    return localStorage.getItem('sym_mandal_payee_name') || 'Kunal Satote'
  })

  // Group Directory Wallpaper / Banner Image
  const [groupBannerImg, setGroupBannerImg] = useState(() => {
    return localStorage.getItem('sym_group_banner_img') || ''
  })

  // Custom Mandal QR Code Image uploaded by Admin
  const [customQrImg, setCustomQrImg] = useState(() => {
    return localStorage.getItem('sym_custom_qr_code') || ''
  })
  const [qrUploadSuccessMsg, setQrUploadSuccessMsg] = useState('')

  // Save changes to localStorage so App.jsx picks them up
  useEffect(() => {
    localStorage.setItem('sym_team_members', JSON.stringify(teamMembers))
  }, [teamMembers])

  useEffect(() => {
    localStorage.setItem('sym_join_requests', JSON.stringify(joinRequests))
  }, [joinRequests])

  useEffect(() => {
    localStorage.setItem('sym_donations', JSON.stringify(donations))
    if (onUpdateDonations) onUpdateDonations(donations)
  }, [donations])

  useEffect(() => {
    localStorage.setItem('sym_expenses', JSON.stringify(expenses))
    if (onUpdateExpenses) onUpdateExpenses(expenses)
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('sym_vip_passes', JSON.stringify(vipPasses))
  }, [vipPasses])

  // Sync real-time updates from public portal (new donations, expenses, VIP passes, join requests)
  useEffect(() => {
    const handleSync = () => {
      const savedDonations = localStorage.getItem('sym_donations')
      if (savedDonations) {
        try { setDonations(JSON.parse(savedDonations)) } catch (e) { }
      }
      const savedExpenses = localStorage.getItem('sym_expenses')
      if (savedExpenses) {
        try { setExpenses(JSON.parse(savedExpenses)) } catch (e) { }
      }
      const savedPasses = localStorage.getItem('sym_vip_passes')
      if (savedPasses) {
        try { setVipPasses(JSON.parse(savedPasses)) } catch (e) { }
      }
      const savedRequests = localStorage.getItem('sym_join_requests')
      if (savedRequests) {
        try { setJoinRequests(JSON.parse(savedRequests)) } catch (e) { }
      }
      const savedMembers = localStorage.getItem('sym_team_members')
      if (savedMembers) {
        try {
          const parsed = JSON.parse(savedMembers)
          if (Array.isArray(parsed) && parsed.length > 0) setTeamMembers(parsed)
        } catch (e) { }
      }
    }
    handleSync()
    window.addEventListener('storage', handleSync)
    window.addEventListener('focus', handleSync)
    window.addEventListener('sym_donations_updated', handleSync)
    window.addEventListener('sym_expenses_updated', handleSync)
    window.addEventListener('sym_team_members_updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('focus', handleSync)
      window.removeEventListener('sym_donations_updated', handleSync)
      window.removeEventListener('sym_expenses_updated', handleSync)
      window.removeEventListener('sym_team_members_updated', handleSync)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sym_is_live', isAartiLive ? 'true' : 'false')
  }, [isAartiLive])

  useEffect(() => {
    localStorage.setItem('sym_announcement', announcement)
  }, [announcement])

  useEffect(() => {
    localStorage.setItem('sym_mandal_upi_id', upiId)
  }, [upiId])

  useEffect(() => {
    localStorage.setItem('sym_mandal_payee_name', payeeName)
  }, [payeeName])

  useEffect(() => {
    if (groupBannerImg) {
      localStorage.setItem('sym_group_banner_img', groupBannerImg)
    } else {
      localStorage.removeItem('sym_group_banner_img')
    }
    window.dispatchEvent(new Event('storage'))
  }, [groupBannerImg])

  // --- MODAL / FORM STATES ---
  // Add Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [newMemberDept, setNewMemberDept] = useState('Core Leadership')
  const [newMemberPhone, setNewMemberPhone] = useState('')
  const [newMemberBlood, setNewMemberBlood] = useState('B+')
  const [newMemberImg, setNewMemberImg] = useState('')

  // Edit Member Modal
  const [editingMember, setEditingMember] = useState(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editDept, setEditDept] = useState('Core Leadership')
  const [editPhone, setEditPhone] = useState('')
  const [editBlood, setEditBlood] = useState('B+')
  const [editImg, setEditImg] = useState('')

  // Offline Daan Modal
  const [showAddDonationModal, setShowAddDonationModal] = useState(false)
  const [newDonorName, setNewDonorName] = useState('')
  const [newDonorAmount, setNewDonorAmount] = useState('')
  const [newDonorCategory, setNewDonorCategory] = useState('Mahaprasad & Anna Daan')
  const [newDonorMode, setNewDonorMode] = useState('Cash')
  const [newDonorMsg, setNewDonorMsg] = useState('')
  const [newDonorUtr, setNewDonorUtr] = useState('')

  // VIP Pass Modal
  const [showAddPassModal, setShowAddPassModal] = useState(false)
  const [newPassName, setNewPassName] = useState('')
  const [newPassPhone, setNewPassPhone] = useState('')
  const [newPassSlot, setNewPassSlot] = useState('Evening Mahā-Aarti (7:30 PM)')
  const [newPassDate, setNewPassDate] = useState('2026-09-10')
  const [newPassCount, setNewPassCount] = useState('2')

  // Receipt Preview Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  // Status Filter for Karyakarta directory
  const [karyakartaFilter, setKaryakartaFilter] = useState('All')

  // --- EXPENSE SPREADSHEET & MODAL STATES ---
  const [expenseFilterStatus, setExpenseFilterStatus] = useState('All') // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [expenseFilterCategory, setExpenseFilterCategory] = useState('All')
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('')
  const [selectedExpenseReceipt, setSelectedExpenseReceipt] = useState(null)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [newExpenseTitle, setNewExpenseTitle] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState('')
  const [newExpenseCategory, setNewExpenseCategory] = useState('Mahaprasad & Anna Daan')
  const [newExpenseMode, setNewExpenseMode] = useState('UPI')
  const [newExpenseUtr, setNewExpenseUtr] = useState('')
  const [newExpenseSpentBy, setNewExpenseSpentBy] = useState(() => localStorage.getItem('sym_logged_user') || localStorage.getItem('sym_saved_profile_name') || 'Krunal Satote')
  const [newExpenseRemarks, setNewExpenseRemarks] = useState('')
  const [newExpenseReceiptImg, setNewExpenseReceiptImg] = useState('')

  // --- STATS COMPUTATIONS ---
  const totalDonationAmount = useMemo(() => {
    return donations.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [donations])

  const totalApprovedExpenses = useMemo(() => {
    return expenses
      .filter(e => e.status === 'Approved')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [expenses])

  const pendingExpensesCount = useMemo(() => {
    return expenses.filter(e => e.status === 'Pending').length
  }, [expenses])

  const netTreasuryBalance = useMemo(() => {
    return totalDonationAmount - totalApprovedExpenses
  }, [totalDonationAmount, totalApprovedExpenses])

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (expenseFilterStatus !== 'All' && exp.status !== expenseFilterStatus) return false
      if (expenseFilterCategory !== 'All' && exp.category !== expenseFilterCategory) return false
      if (expenseSearchQuery.trim()) {
        const query = expenseSearchQuery.toLowerCase()
        const matchTitle = (exp.title || '').toLowerCase().includes(query)
        const matchSpentBy = (exp.spentBy || '').toLowerCase().includes(query)
        const matchUtr = (exp.utr || '').toLowerCase().includes(query)
        const matchId = (exp.id || '').toLowerCase().includes(query)
        if (!matchTitle && !matchSpentBy && !matchUtr && !matchId) return false
      }
      return true
    })
  }, [expenses, expenseFilterStatus, expenseFilterCategory, expenseSearchQuery])

  const pendingRequestsCount = useMemo(() => {
    return joinRequests.filter(r => r.status === 'Pending').length
  }, [joinRequests])

  // --- AUTH HANDLERS ---
  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (adminEmail === 'admin@shivputr.com' && adminPassword === 'bappa2026') {
      setIsAdminLoggedIn(true)
      localStorage.setItem('sym_admin_auth', 'true')
      setLoginError('')
    } else {
      setLoginError('Anya credentials galat hain! Kripya sahi email aur password darj karein.')
    }
  }

  const handleLogout = () => {
    setIsAdminLoggedIn(false)
    localStorage.removeItem('sym_admin_auth')
  }

  // Helper: Image file to Base64
  const handlePhotoUpload = (e, setTargetImg) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Kripya sirf photo ya image file upload karein!')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Photo ka size 2MB se kam hona chahiye!')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result
      if (base64) {
        setTargetImg(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  // Helper: Group Wallpaper / Banner Upload
  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Kripya sirf photo ya image file upload karein!')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Banner photo ka size 3MB se kam hona chahiye!')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result
      if (base64) {
        setGroupBannerImg(base64)
        localStorage.setItem('sym_group_banner_img', base64)
        window.dispatchEvent(new Event('storage'))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleResetBanner = () => {
    if (window.confirm('Kya aap Mandal Group Banner ko default photo par reset karna chahte hain?')) {
      setGroupBannerImg('')
      localStorage.removeItem('sym_group_banner_img')
      window.dispatchEvent(new Event('storage'))
    }
  }

  // --- QR CODE PHOTO UPLOAD & RESET HANDLERS ---
  const handleQrCodeUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Kripya valid photo/image file (PNG, JPG, JPEG, WebP) hi select karein!')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('QR Code photo ka size 3MB se kam hona chahiye!')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result
      if (base64) {
        setCustomQrImg(base64)
        localStorage.setItem('sym_custom_qr_code', base64)
        window.dispatchEvent(new Event('storage'))
        setQrUploadSuccessMsg('✨ Mandal QR Code safalta-poorvak upload ho gaya! Website par ab yahi QR Code live dikhega.')
        setTimeout(() => setQrUploadSuccessMsg(''), 6000)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleResetQrCode = () => {
    if (window.confirm('Kya aap Mandal QR Code ko default standee photo par reset karna chahte hain?')) {
      setCustomQrImg('')
      localStorage.removeItem('sym_custom_qr_code')
      window.dispatchEvent(new Event('storage'))
      setQrUploadSuccessMsg('✓ Mandal QR Code default photo par reset ho gaya.')
      setTimeout(() => setQrUploadSuccessMsg(''), 4000)
    }
  }

  // --- KARYAKARTA ACTIONS ---
  const handleApproveRequest = (reqId) => {
    const request = joinRequests.find(r => r.id === reqId)
    if (!request) return

    // Update request status
    setJoinRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Approved' } : r))

    // Add to Active Team
    const newMember = {
      id: Date.now(),
      name: request.name,
      role: request.role,
      dept: request.role.includes('Aarti') ? 'Aarti Seva' : request.role.includes('Mahaprasad') ? 'Mahaprasad' : 'Volunteer Force',
      phone: request.phone,
      bloodGroup: 'B+',
      img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop'
    }
    setTeamMembers(prev => [newMember, ...prev])
  }

  const handleRejectRequest = (reqId) => {
    setJoinRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Rejected' } : r))
  }

  const handleCreateMember = (e) => {
    e.preventDefault()
    if (!newMemberName.trim() || !newMemberRole.trim()) return

    const member = {
      id: Date.now(),
      name: newMemberName,
      role: newMemberRole,
      dept: newMemberDept,
      phone: newMemberPhone || 'N/A',
      bloodGroup: newMemberBlood || 'O+',
      img: newMemberImg || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop'
    }

    setTeamMembers(prev => [member, ...prev])
    setShowAddMemberModal(false)
    setNewMemberName('')
    setNewMemberRole('')
    setNewMemberPhone('')
    setNewMemberImg('')
  }

  const openEditMemberModal = (member) => {
    setEditingMember(member)
    setEditName(member.name)
    setEditRole(member.role)
    setEditDept(member.dept || 'Core Leadership')
    setEditPhone(member.phone || '')
    setEditBlood(member.bloodGroup || 'B+')
    setEditImg(member.img || '')
  }

  const handleSaveEditMember = (e) => {
    e.preventDefault()
    if (!editingMember || !editName.trim()) return

    setTeamMembers(prev => prev.map(m => {
      if (m.id === editingMember.id) {
        return {
          ...m,
          name: editName,
          role: editRole,
          dept: editDept,
          phone: editPhone,
          bloodGroup: editBlood,
          img: editImg || m.img
        }
      }
      return m
    }))

    setEditingMember(null)
  }

  const handleDeleteMember = (memberId) => {
    if (window.confirm('Kya aap sach me iss karyakarta ko roster se hatana chahte hain?')) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberId))
    }
  }

  // --- DONATION ACTIONS ---
  const handleCreateDonation = (e) => {
    e.preventDefault()
    if (!newDonorName.trim() || !newDonorAmount) return

    const newDonation = {
      id: 'REC-' + Math.floor(1000 + Math.random() * 9000),
      name: newDonorName,
      amount: Number(newDonorAmount),
      category: newDonorCategory,
      mode: newDonorMode,
      utr: newDonorUtr || (newDonorMode === 'Cash' ? 'CASH-REC-' + Math.floor(100 + Math.random() * 900) : 'UTR-' + Date.now().toString().slice(-8)),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      message: newDonorMsg || 'Mandap bhent daan.'
    }

    setDonations(prev => [newDonation, ...prev])
    setShowAddDonationModal(false)
    setNewDonorName('')
    setNewDonorAmount('')
    setNewDonorMsg('')
    setNewDonorUtr('')
  }

  // --- VIP PASS ACTIONS ---
  const handleCreatePass = (e) => {
    e.preventDefault()
    if (!newPassName.trim() || !newPassPhone.trim()) return

    const newPass = {
      passId: 'SYM-2026-VIP-' + Math.floor(1000 + Math.random() * 9000),
      name: newPassName,
      phone: newPassPhone,
      sewaType: newPassSlot,
      date: newPassDate,
      count: Number(newPassCount),
      checkedIn: false
    }

    setVipPasses(prev => [newPass, ...prev])
    setShowAddPassModal(false)
    setNewPassName('')
    setNewPassPhone('')
  }

  const handleToggleCheckIn = (passId) => {
    setVipPasses(prev => prev.map(p => {
      if (p.passId === passId) {
        return { ...p, checkedIn: !p.checkedIn }
      }
      return p
    }))
  }

  // --- MANDAL KHARCHA & SPREADSHEET ACTIONS ---
  const handleApproveExpense = (id) => {
    const updated = expenses.map(exp => {
      if (exp.id === id) {
        return {
          ...exp,
          status: 'Approved',
          approvedBy: 'Admin (Treasury)',
          approvalDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        }
      }
      return exp
    })
    setExpenses(updated)
    localStorage.setItem('sym_expenses', JSON.stringify(updated))
    window.dispatchEvent(new Event('sym_expenses_updated'))
    window.dispatchEvent(new Event('storage'))
  }

  const handleRejectExpense = (id) => {
    const reason = window.prompt('Kharcha reject karne ka kaaran darj karein (e.g. Duplicate voucher / Bill photo missing):', 'Bill proof aspasht hai ya voucher duplicate hai')
    if (reason === null) return
    const updated = expenses.map(exp => {
      if (exp.id === id) {
        return {
          ...exp,
          status: 'Rejected',
          rejectionReason: reason || 'Rejected by Admin',
          rejectedBy: 'Admin'
        }
      }
      return exp
    })
    setExpenses(updated)
    localStorage.setItem('sym_expenses', JSON.stringify(updated))
    window.dispatchEvent(new Event('sym_expenses_updated'))
    window.dispatchEvent(new Event('storage'))
  }

  const handleDeleteExpense = (id) => {
    if (window.confirm('Kya aap iss kharche record ko sheet se delete karna chahte hain?')) {
      const updated = expenses.filter(exp => exp.id !== id)
      setExpenses(updated)
      localStorage.setItem('sym_expenses', JSON.stringify(updated))
      window.dispatchEvent(new Event('sym_expenses_updated'))
      window.dispatchEvent(new Event('storage'))
    }
  }

  const handleExpenseReceiptUploadByAdmin = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Kripya valid image file (JPG, PNG, WebP) hi upload karein!')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('Bill photo ka size 3MB se kam hona chahiye!')
      return
    }
    const reader = new FileReader()
    reader.onload = (uploadEvt) => {
      setNewExpenseReceiptImg(uploadEvt.target?.result || '')
    }
    reader.readAsDataURL(file)
  }

  const handleCreateExpenseByAdmin = (e) => {
    e.preventDefault()
    if (!newExpenseTitle.trim() || !newExpenseAmount) {
      alert('Kripya kharche ka title aur rakam darj karein!')
      return
    }

    const newEntry = {
      id: 'EXP-' + Math.floor(100 + Math.random() * 900),
      title: newExpenseTitle.trim(),
      amount: Number(newExpenseAmount),
      category: newExpenseCategory,
      mode: newExpenseMode,
      utr: newExpenseMode === 'UPI' ? (newExpenseUtr.trim() || 'UPI-ADMIN-' + Date.now().toString().slice(-6)) : 'CASH-VOUCHER',
      spentBy: newExpenseSpentBy.trim() || 'Admin Office',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Approved',
      approvedBy: 'Admin (Direct Entry)',
      receiptImg: newExpenseReceiptImg || null,
      remarks: newExpenseRemarks.trim() || 'Directly recorded in Admin Ledger'
    }

    const updated = [newEntry, ...expenses]
    setExpenses(updated)
    localStorage.setItem('sym_expenses', JSON.stringify(updated))
    window.dispatchEvent(new Event('sym_expenses_updated'))
    window.dispatchEvent(new Event('storage'))

    setShowAddExpenseModal(false)
    setNewExpenseTitle('')
    setNewExpenseAmount('')
    setNewExpenseUtr('')
    setNewExpenseRemarks('')
    setNewExpenseReceiptImg('')
  }

  const handleExportExpensesCSV = () => {
    if (expenses.length === 0) {
      alert('Sheet me export karne ke liye koi kharcha record nahi hai!')
      return
    }

    const headers = ['Voucher ID', 'Date', 'Time', 'Item / Vivaran', 'Category', 'Amount (INR)', 'Payment Mode', 'UTR / Ref No', 'Spent By', 'Approval Status', 'Approved / Rejected By', 'Remarks']
    const rows = expenses.map(exp => [
      `"${exp.id}"`,
      `"${exp.date || ''}"`,
      `"${exp.time || ''}"`,
      `"${(exp.title || '').replace(/"/g, '""')}"`,
      `"${(exp.category || '').replace(/"/g, '""')}"`,
      Number(exp.amount || 0),
      `"${exp.mode || ''}"`,
      `"${exp.utr || ''}"`,
      `"${(exp.spentBy || '').replace(/"/g, '""')}"`,
      `"${exp.status || 'Pending'}"`,
      `"${(exp.approvedBy || exp.rejectionReason || '').replace(/"/g, '""')}"`,
      `"${(exp.remarks || '').replace(/"/g, '""')}"`
    ])

    rows.push([])
    rows.push(['"--- EXPENDITURE SUMMARY ---"', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""'])
    rows.push(['"TOTAL APPROVED KHARCHA (INR)"', '""', '""', '""', '""', totalApprovedExpenses, '""', '""', '""', '"Approved Only"', '""', '""'])
    rows.push(['"TOTAL DAAN SANGRAH (INR)"', '""', '""', '""', '""', totalDonationAmount, '""', '""', '""', '""', '""', '""'])
    rows.push(['"NET TREASURY BALANCE (INR)"', '""', '""', '""', '""', netTreasuryBalance, '""', '""', '""', '""', '""', '""'])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Mandal_Kharcha_Sheet_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Filtered members for directory view
  const displayMembers = useMemo(() => {
    if (karyakartaFilter === 'All') return teamMembers
    return teamMembers.filter(m => m.dept === karyakartaFilter)
  }, [teamMembers, karyakartaFilter])

  // ==========================================
  // VIEW: IF NOT LOGGED IN -> RENDER LOGIN
  // ==========================================
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4 py-12 selection:bg-amber-400 selection:text-stone-950">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8 relative">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-400 shadow-xl bg-amber-100 flex items-center justify-center p-1 mb-4">
              <img src={ganpatiLogo} alt="Mandal Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Prabandhak / Committee Portal
            </span>
            <h2 className="text-2xl font-black text-white mt-2">Admin Login</h2>
            <p className="text-stone-400 text-xs mt-1">Shivaputr Yuvak Mandal Ganeshotsav 2026</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800 rounded-2xl text-red-200 text-xs text-center font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Mandal Admin Email</label>
              <input 
                type="email" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@shivputr.com" 
                className="w-full px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Passcode / Password</label>
              <input 
                type="password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black py-3.5 rounded-xl shadow-lg transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              <span>Verify & Unlock Dashboard</span>
              <span>🔐</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-800/80 flex flex-col gap-2">
            <button 
              type="button" 
              onClick={() => { setAdminEmail('admin@shivputr.com'); setAdminPassword('bappa2026'); }}
              className="text-[11px] text-amber-400/90 hover:text-amber-300 underline font-bold text-center"
            >
              Demo Auto-Fill (admin@shivputr.com / bappa2026)
            </button>

            <button 
              onClick={onBackToWebsite}
              className="text-stone-400 hover:text-white text-xs font-bold text-center mt-2 flex items-center justify-center gap-1"
            >
              <span>←</span>
              <span>Back to Public Devotee Website</span>
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-stone-100 flex font-sans text-stone-800 selection:bg-amber-200 selection:text-stone-900">

      {/* --- SIDEBAR FOR DESKTOP & MOBILE --- */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-950 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col border-r border-stone-800 shadow-2xl`}>
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-md flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-black flex items-center justify-center">
                <img src={ganpatiLogo} alt="Mandal Logo" className="w-full h-full object-cover scale-105" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">Shivaputr Mandal</h2>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Admin Panel 2026</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-stone-400 hover:text-white text-lg">
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto text-xs font-bold">
          <button 
            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-stone-300 hover:bg-stone-900 hover:text-white'}`}
          >
            <span className="flex items-center gap-3"><span className="text-base">📊</span> Overview & Stats</span>
          </button>

          <button 
            onClick={() => { setActiveTab('karyakartas'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeTab === 'karyakartas' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-stone-300 hover:bg-stone-900 hover:text-white'}`}
          >
            <span className="flex items-center gap-3"><span className="text-base">👥</span> Committee & Photos</span>
            {pendingRequestsCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingRequestsCount} New
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('donations'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeTab === 'donations' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-stone-300 hover:bg-stone-900 hover:text-white'}`}
          >
            <span className="flex items-center gap-3"><span className="text-base">💰</span> Daan & Accounts</span>
            <span className="bg-green-900/60 text-green-300 text-[10px] px-2 py-0.5 rounded-md">
              ₹{(totalDonationAmount / 1000).toFixed(1)}k
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('expenses'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeTab === 'expenses' ? 'bg-emerald-600 text-white font-black shadow' : 'text-stone-300 hover:bg-stone-900 hover:text-white'}`}
          >
            <span className="flex items-center gap-3"><span className="text-base">📑</span> Utsav Kharcha (Sheet)</span>
            {pendingExpensesCount > 0 ? (
              <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                {pendingExpensesCount} New
              </span>
            ) : (
              <span className="bg-emerald-900/70 text-emerald-300 text-[10px] px-2 py-0.5 rounded-md font-mono">
                ₹{(totalApprovedExpenses / 1000).toFixed(1)}k
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('vippasses'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeTab === 'vippasses' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-stone-300 hover:bg-stone-900 hover:text-white'}`}
          >
            <span className="flex items-center gap-3"><span className="text-base">🎫</span> VIP Aarti Passes</span>
            <span className="bg-stone-800 text-stone-300 text-[10px] px-2 py-0.5 rounded-md">
              {vipPasses.length}
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('livecontrol'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeTab === 'livecontrol' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-stone-300 hover:bg-stone-900 hover:text-white'}`}
          >
            <span className="flex items-center gap-3"><span className="text-base">🔴</span> Live Stream Control</span>
            <span className={`w-2 h-2 rounded-full ${isAartiLive ? 'bg-red-500 animate-ping' : 'bg-stone-600'}`}></span>
          </button>

          <button 
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeTab === 'settings' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-stone-300 hover:bg-stone-900 hover:text-white'}`}
          >
            <span className="flex items-center gap-3"><span className="text-base">⚙️</span> QR & UPI Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button 
            onClick={onBackToWebsite}
            className="w-full bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-2 border border-amber-500/20"
          >
            <span>🌐</span> View Public Website
          </button>

          <button 
            onClick={handleLogout}
            className="w-full bg-red-950/40 hover:bg-red-950 text-red-400 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-2 border border-red-900/30"
          >
            <span>🚪</span> Admin Logout
          </button>
        </div>

      </aside>

      {/* --- MAIN DASHBOARD BODY --- */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        {/* Master Top Header */}
        <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 text-lg"
            >
              ☰
            </button>
            <div>
              <h1 className="text-base lg:text-lg font-black text-stone-900 capitalize">
                {activeTab === 'overview' && 'Executive Mandal Overview'}
                {activeTab === 'karyakartas' && 'Core Leadership & Karyakarta Management'}
                {activeTab === 'donations' && 'Utsav Daan Peti & Real UPI Ledger'}
                {activeTab === 'expenses' && 'Mandal Group Kharcha & Excel Spreadsheet Ledger'}
                {activeTab === 'vippasses' && 'VIP Darshan Pass & Gate Verification'}
                {activeTab === 'livecontrol' && 'Live Aarti Darshan & Broadcast Controller'}
                {activeTab === 'settings' && 'Mandal QR & UPI Gateway Settings'}
              </h1>
              <p className="text-[11px] text-stone-500 hidden sm:block">Shivaputr Yuvak Mandal • Sarvajanik Ganeshotsav 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Stream Quick Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold">
              <span className={`w-2.5 h-2.5 rounded-full ${isAartiLive ? 'bg-red-600 animate-ping' : 'bg-stone-400'}`}></span>
              <span>{isAartiLive ? 'Stream LIVE' : 'Stream Offline'}</span>
            </div>

            {/* Quick Public Site Button */}
            <button 
              onClick={onBackToWebsite}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs px-3 py-1.5 rounded-xl transition shadow flex items-center gap-1.5"
            >
              <span>🌐</span>
              <span className="hidden sm:inline">Open Site</span>
            </button>
          </div>
        </header>

        {/* Dashboard Dynamic View Container */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          
          {/* ==========================================
              TAB 1: OVERVIEW & STATS
             ========================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-stone-500 uppercase">Total Daan Sangrah</p>
                      <h3 className="text-xl font-black text-green-700 mt-1 font-mono">
                        ₹{totalDonationAmount.toLocaleString()}
                      </h3>
                    </div>
                    <span className="p-2.5 bg-green-100 text-green-800 rounded-xl text-lg">💰</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-2">{donations.length} records in ledger</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-stone-500 uppercase">Approved Kharcha</p>
                      <h3 className="text-xl font-black text-rose-700 mt-1 font-mono">
                        ₹{totalApprovedExpenses.toLocaleString()}
                      </h3>
                    </div>
                    <span className="p-2.5 bg-rose-100 text-rose-800 rounded-xl text-lg">📑</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-2 font-bold">
                    {pendingExpensesCount > 0 ? (
                      <span className="text-amber-600">🟡 {pendingExpensesCount} bills pending</span>
                    ) : (
                      <span className="text-emerald-700">✓ All audited</span>
                    )}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-300 ring-2 ring-emerald-500/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-stone-500 uppercase">Net Treasury Balance</p>
                      <h3 className={`text-xl font-black mt-1 font-mono ${netTreasuryBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        ₹{netTreasuryBalance.toLocaleString()}
                      </h3>
                    </div>
                    <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-lg">🏦</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-2">Daan minus Approved Kharcha</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-stone-500 uppercase">Active Committee</p>
                      <h3 className="text-xl font-black text-stone-900 mt-1 font-mono">
                        {teamMembers.length}
                      </h3>
                    </div>
                    <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl text-lg">🚩</span>
                  </div>
                  <p className="text-[10px] text-stone-600 font-bold mt-2">
                    {pendingRequestsCount} join requests
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-stone-500 uppercase">Live Aarti & Passes</p>
                      <h3 className="text-base font-black text-stone-900 mt-1">
                        {isAartiLive ? 'LIVE 🔴' : 'OFFLINE ⚪'}
                      </h3>
                    </div>
                    <span className="p-2.5 bg-purple-100 text-purple-800 rounded-xl text-lg">📹</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-2">{vipPasses.length} VIP passes issued</p>
                </div>
              </div>

              {/* UPI & Scanner Banner in Overview */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 text-stone-950 flex flex-wrap items-center justify-between gap-4 shadow-lg border border-amber-400">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl p-1 shadow-md overflow-hidden flex-shrink-0">
                    <img src={mandalUpiQr} alt="Mandal UPI QR" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="bg-stone-950 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      Active Payment Gateway
                    </span>
                    <h3 className="text-lg font-black text-stone-950 mt-1">Google Pay Scanner & Direct UPI Linked</h3>
                    <p className="text-xs font-bold text-stone-900">UPI ID: <span className="font-mono bg-white/70 px-2 py-0.5 rounded">{upiId}</span> • Payee: {payeeName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('donations')}
                  className="bg-stone-950 hover:bg-stone-900 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow transition"
                >
                  View Daan Ledger →
                </button>
              </div>

              {/* Quick Actions & Recent Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Pending Expense Bills Quick Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                        <span>🧾</span> Pending Kharcha Bills ({pendingExpensesCount})
                      </h3>
                      <button 
                        onClick={() => setActiveTab('expenses')}
                        className="text-xs text-emerald-700 hover:underline font-bold"
                      >
                        Excel Sheet →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {expenses.filter(e => e.status === 'Pending').length === 0 ? (
                        <p className="text-xs text-stone-500 text-center py-6">Koi naya kharcha bill pending nahi hai.</p>
                      ) : (
                        expenses.filter(e => e.status === 'Pending').slice(0, 3).map((exp) => (
                          <div key={exp.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-stone-900 text-xs">{exp.title}</p>
                                <p className="text-[10px] text-stone-500">By: <span className="font-bold text-stone-800">{exp.spentBy}</span> • {exp.category}</p>
                              </div>
                              <span className="font-black text-rose-700 font-mono text-sm">₹{Number(exp.amount).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                              <span className="text-[10px] font-mono text-stone-600 bg-white px-1.5 py-0.5 rounded border">
                                {exp.mode}: {exp.utr || 'N/A'}
                              </span>
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => handleApproveExpense(exp.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded text-[11px] font-bold transition"
                                >
                                  Approve ✓
                                </button>
                                <button 
                                  onClick={() => handleRejectExpense(exp.id)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-200 transition"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('expenses')}
                    className="mt-4 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold py-2 rounded-xl text-xs border border-emerald-200 text-center transition"
                  >
                    Open Full Excel Kharcha Sheet 📊
                  </button>
                </div>

                {/* Pending Requests Quick Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                        <span>🤝</span> Karyakarta Requests ({pendingRequestsCount})
                      </h3>
                      <button 
                        onClick={() => setActiveTab('karyakartas')}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {joinRequests.filter(r => r.status === 'Pending').length === 0 ? (
                        <p className="text-xs text-stone-500 text-center py-6">Koi nayi join request pending nahi hai.</p>
                      ) : (
                        joinRequests.filter(r => r.status === 'Pending').slice(0, 3).map((req) => (
                          <div key={req.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
                            <div>
                              <p className="font-black text-stone-900 text-xs">{req.name}</p>
                              <p className="text-[11px] text-stone-500">{req.phone} • Role: <span className="text-red-700 font-bold">{req.role}</span></p>
                            </div>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => handleApproveRequest(req.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-xs font-bold"
                              >
                                ✓
                              </button>
                              <button 
                                onClick={() => handleRejectRequest(req.id)}
                                className="bg-stone-200 hover:bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('karyakartas')}
                    className="mt-4 w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2 rounded-xl text-xs text-center transition"
                  >
                    View All Committee Members 👥
                  </button>
                </div>

                {/* Quick Shortcuts Box */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-3">
                  <h3 className="font-black text-stone-900 text-sm">⚡ Quick Admin Actions</h3>
                  
                  <button 
                    onClick={() => { setActiveTab('expenses'); setShowAddExpenseModal(true); }}
                    className="w-full bg-emerald-50/70 hover:bg-emerald-100 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-bold transition text-left"
                  >
                    <span className="text-emerald-950">+ Record Mandal Kharcha Bill</span>
                    <span>📑</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('donations'); setShowAddDonationModal(true); }}
                    className="w-full bg-stone-50 hover:bg-amber-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs font-bold transition text-left"
                  >
                    <span>Record Cash / Offline Daan</span>
                    <span>💵</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('karyakartas'); setShowAddMemberModal(true); }}
                    className="w-full bg-stone-50 hover:bg-amber-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs font-bold transition text-left"
                  >
                    <span>Add Member & Upload Photo</span>
                    <span>📸</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('vippasses'); setShowAddPassModal(true); }}
                    className="w-full bg-stone-50 hover:bg-amber-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs font-bold transition text-left"
                  >
                    <span>Generate Guest VIP Pass</span>
                    <span>🎫</span>
                  </button>

                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    Mandal Registration: <strong className="text-stone-800">E-18294/MUM/2012</strong>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB 2: CORE LEADERSHIP COMMITTEE & PHOTOS
             ========================================== */}
          {activeTab === 'karyakartas' && (
            <div className="space-y-6">
              
              {/* Top Banner: Photo Upload Notice */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                    👑 Core Leadership & Sevak Directory
                  </span>
                  <h3 className="text-lg font-black text-stone-900 mt-2">Committee Photos & Member Management</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Admin kisi bhi karyakarta ki photo direct apne computer ya mobile se upload aur change kar sakta hai.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddMemberModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <span>📸</span>
                    <span>+ Add Member with Photo</span>
                  </button>
                </div>
              </div>

              {/* Mandal Group Wallpaper / Banner Photo Manager */}
              <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-white p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  
                  {/* Banner Preview Box */}
                  <div className="w-full md:w-5/12">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-2xl bg-stone-950 aspect-[21/9] group">
                      <img 
                        src={groupBannerImg || "/ganapti-homescreen-image.jpeg"} 
                        alt="Group Directory Banner Preview"
                        className="w-full h-full object-cover filter brightness-[0.75]"
                        onError={(e) => { e.target.src = '/ganapti-homescreen-image.jpeg' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex flex-col justify-end p-3 pointer-events-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-stone-900/90 px-2 py-0.5 rounded border border-amber-500/30 w-fit">
                          🏛️ Public Website Banner Live Preview
                        </span>
                        <p className="text-white text-xs font-bold mt-1 drop-shadow">Group Directory ({teamMembers.length} Active Members)</p>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow ${groupBannerImg ? 'bg-emerald-600' : 'bg-stone-700'}`}>
                          {groupBannerImg ? '✓ Custom Uploaded' : 'Default Preset'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Banner Controls */}
                  <div className="w-full md:w-7/12 space-y-3">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full text-amber-300 text-xs font-black">
                      <span>🖼️</span>
                      <span>Mandal Group Header Photo</span>
                    </div>

                    <h4 className="text-xl font-black text-white tracking-tight">
                      Group Directory Wallpaper & Photo
                    </h4>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      Public website ke <strong>"Group Directory ({teamMembers.length} Active Members)"</strong> section me jo upar bada banner dikhta hai, aap uska photo yahan se direct apne device (Mobile / PC) se upload ya change kar sakte hain.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg transition transform active:scale-95">
                        <span className="text-base">📁</span>
                        <span>{groupBannerImg ? 'Change Group Photo' : 'Upload Group Photo'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleBannerUpload} 
                          className="hidden" 
                        />
                      </label>

                      {groupBannerImg && (
                        <button
                          type="button"
                          onClick={handleResetBanner}
                          className="inline-flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/50 font-bold text-xs px-4 py-3 rounded-xl transition"
                        >
                          <span>🗑️</span>
                          <span>Reset to Default</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-400">
                      💡 Tip: Landscape photo (16:9 ya 21:9 aspect ratio) best dikhegi. Size limit: 3MB.
                    </p>
                  </div>

                </div>
              </div>

              {/* Department Filter Tabs */}
              <div className="flex flex-wrap gap-2 text-xs font-bold bg-white p-3 rounded-2xl border border-stone-200">
                {['All', 'Core Leadership', 'Aarti Seva', 'Mahaprasad', 'Decor & Tech', 'Security & Crowd', 'Volunteer Force'].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setKaryakartaFilter(dept)}
                    className={`px-3 py-1.5 rounded-xl transition ${karyakartaFilter === dept ? 'bg-stone-900 text-amber-300 font-black shadow' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    {dept} {dept === 'Core Leadership' && '👑'}
                  </button>
                ))}
              </div>

              {/* Active Members Grid with Photo Upload & Edit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {displayMembers.map((member) => (
                  <div key={member.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 transition flex flex-col justify-between relative group">
                    
                    {/* Delete button */}
                    <button 
                      onClick={() => handleDeleteMember(member.id)}
                      className="absolute top-3 right-3 text-stone-300 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition"
                      title="Remove Member"
                    >
                      ✕
                    </button>

                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500 shadow-md bg-stone-100">
                          {member.img ? (
                            <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-900 font-black text-xl">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        {member.dept === 'Core Leadership' && (
                          <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-950 text-xs p-1 rounded-full shadow" title="Core Leadership">
                            👑
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-stone-900 text-sm leading-snug">{member.name}</h4>
                      <p className="text-xs font-bold text-red-700 mt-0.5">{member.role}</p>
                      
                      <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                        <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                          {member.dept}
                        </span>
                        {member.bloodGroup && (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                            🩸 {member.bloodGroup}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-500 font-mono mt-2">📞 {member.phone}</p>
                    </div>

                    {/* Edit Member & Photo Button */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex gap-2">
                      <button 
                        onClick={() => openEditMemberModal(member)}
                        className="flex-1 bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 text-xs font-bold py-2 rounded-xl border border-stone-200 transition flex items-center justify-center gap-1"
                      >
                        <span>✏️</span>
                        <span>Edit / Change Photo</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Devotee Join Requests Table */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mt-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-black text-stone-900">Devotee Join Requests ({joinRequests.length})</h3>
                    <p className="text-xs text-stone-500">Website ke 'Join Mandal' form se aayi hui bhakton ki applications.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 uppercase font-black border-b border-stone-200">
                        <th className="p-3">Devotee Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Role Interest</th>
                        <th className="p-3">Address</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {joinRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-stone-50">
                          <td className="p-3 font-bold text-stone-900">{req.name}</td>
                          <td className="p-3 text-stone-600 font-mono">{req.phone}</td>
                          <td className="p-3 text-red-700 font-bold">{req.role}</td>
                          <td className="p-3 text-stone-500">{req.address}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {req.status === 'Pending' ? (
                              <>
                                <button 
                                  onClick={() => handleApproveRequest(req.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-bold"
                                >
                                  Approve ✓
                                </button>
                                <button 
                                  onClick={() => handleRejectRequest(req.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded-lg font-bold border border-red-200"
                                >
                                  Reject ✕
                                </button>
                              </>
                            ) : (
                              <span className="text-stone-400 font-bold">{req.status}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 3: REAL UPI DAAN PETI & LEDGER
             ========================================== */}
          {activeTab === 'donations' && (
            <div className="space-y-6">
              
              {/* Financial Stats & Add Daan */}
              <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase">Total Utsav Daan Collection</span>
                  <h2 className="text-3xl font-black text-green-700 font-mono">
                    ₹{totalDonationAmount.toLocaleString()}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">Verified Real UPI & Pandal Offline Daan</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddDonationModal(true)}
                    className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <span>💵</span>
                    <span>+ Record Cash / Offline Daan</span>
                  </button>
                </div>
              </div>

              {/* Active Scanner Preview Box */}
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-28 h-28 bg-white p-2 rounded-2xl border border-amber-300 shadow-md">
                    <img src={customQrImg || mandalUpiQr} alt="Mandal Google Pay QR" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      Direct Google Pay Scanner
                    </span>
                    <h4 className="text-base font-black text-stone-900 mt-1">Beneficiary: {payeeName}</h4>
                    <p className="text-xs font-mono font-bold text-stone-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200 mt-1 inline-block">
                      UPI ID: {upiId}
                    </p>
                    <p className="text-[11px] text-stone-600 mt-2">
                      Website par bhakt iss scanner ko scan karke ya Google Pay / PhonePe button se direct daan kar rahe hain.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('settings')}
                  className="bg-stone-900 hover:bg-stone-950 text-amber-300 text-xs font-bold px-4 py-2 rounded-xl transition shadow"
                >
                  Edit UPI Settings ⚙️
                </button>
              </div>

              {/* Donations Ledger Table with UTR Numbers */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-black text-stone-900">Utsav Donations & Audit Ledger ({donations.length})</h3>
                  <button 
                    onClick={() => window.print()}
                    className="text-xs text-stone-600 hover:text-stone-900 font-bold flex items-center gap-1 border px-3 py-1.5 rounded-lg"
                  >
                    <span>🖨️</span> Print Ledger
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 uppercase font-black border-b border-stone-200">
                        <th className="p-3">Receipt No</th>
                        <th className="p-3">Devotee</th>
                        <th className="p-3">Amount (₹)</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3">UTR / Transaction Ref</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">E-Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {donations.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50">
                          <td className="p-3 font-mono font-bold text-red-700">{item.id}</td>
                          <td className="p-3">
                            <p className="font-bold text-stone-900">{item.name}</p>
                            {item.phone && <p className="text-[10px] text-stone-500 font-mono">📱 {item.phone}</p>}
                          </td>
                          <td className="p-3 font-black text-green-700 font-mono text-sm">₹{Number(item.amount).toLocaleString()}</td>
                          <td className="p-3">
                            <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              {item.mode}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-stone-700 text-[11px] font-bold">
                            <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md">
                              {item.utr || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3 text-stone-500">{item.date} {item.time && `• ${item.time}`}</td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => setSelectedReceipt(item)}
                              className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg font-bold text-[11px] transition"
                            >
                              View Pavati 📄
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB: MANDAL GROUP KHARCHA & EXCEL LEDGER
             ========================================== */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              
              {/* Financial Stats Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                        Official Treasury Expense
                      </span>
                      <p className="text-xs font-bold text-stone-500 mt-2 uppercase">कुल स्वीकृत खर्च (Approved Total)</p>
                      <h3 className="text-3xl font-black text-emerald-700 mt-0.5 font-mono">
                        ₹{totalApprovedExpenses.toLocaleString()}
                      </h3>
                    </div>
                    <span className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl text-xl">✅</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-3 flex items-center gap-1 font-bold">
                    <span>•</span>
                    <span>Sirf Approved bills hi official calculation me hain</span>
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-sm bg-gradient-to-br from-amber-50/40 to-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-full">
                        Under Review
                      </span>
                      <p className="text-xs font-bold text-stone-500 mt-2 uppercase">समीक्षा बाकी (Pending Kharcha)</p>
                      <h3 className="text-2xl font-black text-amber-800 mt-0.5 font-mono">
                        ₹{expenses.filter(e => e.status === 'Pending').reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}
                      </h3>
                    </div>
                    <span className="p-3 bg-amber-100 text-amber-800 rounded-2xl text-xl">⏳</span>
                  </div>
                  <p className="text-[11px] text-amber-700 font-bold mt-3">
                    {pendingExpensesCount > 0 ? `${pendingExpensesCount} bills admin approval ke intezar me` : 'Koi pending bill nahi hai'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-full">
                        Total Inflow
                      </span>
                      <p className="text-xs font-bold text-stone-500 mt-2 uppercase">कुल जमा दान (Daan Sangrah)</p>
                      <h3 className="text-2xl font-black text-stone-900 mt-0.5 font-mono">
                        ₹{totalDonationAmount.toLocaleString()}
                      </h3>
                    </div>
                    <span className="p-3 bg-blue-100 text-blue-800 rounded-2xl text-xl">💰</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-3">{donations.length} records in Daan ledger</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sm bg-stone-950 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                        Mandal Bachat
                      </span>
                      <p className="text-xs font-bold text-stone-400 mt-2 uppercase">शुद्ध तिजोरी बाकी (Net Balance)</p>
                      <h3 className={`text-2xl font-black mt-0.5 font-mono ${netTreasuryBalance >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        ₹{netTreasuryBalance.toLocaleString()}
                      </h3>
                    </div>
                    <span className="p-3 bg-stone-900 text-amber-400 rounded-2xl text-xl">🏦</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-3">
                    Daan Sangrah minus Approved Kharcha
                  </p>
                </div>
              </div>

              {/* Excel Spreadsheet Container & Toolbar */}
              <div className="bg-white rounded-3xl shadow-sm border border-stone-300 overflow-hidden">
                
                {/* Excel Green Ribbon Header */}
                <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl p-2 flex items-center justify-center shadow-md">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30">
                          Microsoft Excel / Spreadsheet Mode
                        </span>
                        <span className="text-[10px] text-emerald-200">Auto-calculated Ledger</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        Mandal Group Vyay & Kharcha Patrak 2026
                      </h3>
                      <p className="text-xs text-emerald-100">
                        Jay Patil aur committee members dwara submit kiye gaye sabhi bills yahan audit hote hain.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Export to CSV / Excel Button */}
                    <button 
                      onClick={handleExportExpensesCSV}
                      className="bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 border border-emerald-300"
                      title="Download complete ledger as Excel CSV"
                    >
                      <span className="text-base">📥</span>
                      <span>Export to Excel (.CSV)</span>
                    </button>

                    {/* Print Kharcha Patrak */}
                    <button 
                      onClick={() => window.print()}
                      className="bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-emerald-500/30"
                      title="Print or Save PDF"
                    >
                      <span>🖨️</span>
                      <span className="hidden sm:inline">Print Patrak</span>
                    </button>

                    {/* Direct Admin Expense Entry */}
                    <button 
                      onClick={() => setShowAddExpenseModal(true)}
                      className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
                    >
                      <span>+</span>
                      <span>Add Direct Voucher</span>
                    </button>
                  </div>
                </div>

                {/* Spreadsheet Controls: Filters & Search */}
                <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  {/* Status Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200">
                    <button 
                      onClick={() => setExpenseFilterStatus('All')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${expenseFilterStatus === 'All' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'}`}
                    >
                      All ({expenses.length})
                    </button>
                    <button 
                      onClick={() => setExpenseFilterStatus('Pending')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${expenseFilterStatus === 'Pending' ? 'bg-amber-500 text-stone-950 font-black shadow-xs' : 'text-stone-600 hover:bg-stone-100'}`}
                    >
                      <span>🟡 Pending ({pendingExpensesCount})</span>
                      {pendingExpensesCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
                    </button>
                    <button 
                      onClick={() => setExpenseFilterStatus('Approved')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${expenseFilterStatus === 'Approved' ? 'bg-emerald-700 text-white font-black shadow-xs' : 'text-stone-600 hover:bg-stone-100'}`}
                    >
                      🟢 Approved ({expenses.filter(e => e.status === 'Approved').length})
                    </button>
                    <button 
                      onClick={() => setExpenseFilterStatus('Rejected')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${expenseFilterStatus === 'Rejected' ? 'bg-rose-700 text-white font-black shadow-xs' : 'text-stone-600 hover:bg-stone-100'}`}
                    >
                      🔴 Rejected ({expenses.filter(e => e.status === 'Rejected').length})
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Filter */}
                    <select 
                      value={expenseFilterCategory}
                      onChange={(e) => setExpenseFilterCategory(e.target.value)}
                      className="p-2 border border-stone-300 rounded-xl bg-white text-stone-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="All">All Categories (सभी विभाग)</option>
                      <option value="Mahaprasad & Anna Daan">Mahaprasad & Anna Daan</option>
                      <option value="Mandap & Pujan Seva">Mandap & Pujan Seva</option>
                      <option value="Sound, Lights & GenSet">Sound, Lights & GenSet</option>
                      <option value="Security, Police & Barricades">Security & Barricades</option>
                      <option value="Publicity, Posters & Flex">Publicity & Flex</option>
                      <option value="Emergency & Misc">Emergency & Misc</option>
                    </select>

                    {/* Search Input */}
                    <div className="relative">
                      <input 
                        type="text" 
                        value={expenseSearchQuery}
                        onChange={(e) => setExpenseSearchQuery(e.target.value)}
                        placeholder="Search item, karyakarta, UTR..." 
                        className="pl-8 pr-3 py-2 border border-stone-300 rounded-xl bg-white text-stone-800 text-xs w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                      <span className="absolute left-2.5 top-2.5 text-stone-400">🔍</span>
                      {expenseSearchQuery && (
                        <button 
                          onClick={() => setExpenseSearchQuery('')}
                          className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* The Spreadsheet Grid Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 uppercase font-black border-y border-stone-300 tracking-wider">
                        <th className="p-3 border-r border-stone-200 w-24">Voucher ID</th>
                        <th className="p-3 border-r border-stone-200 w-28">Tarikh & Time</th>
                        <th className="p-3 border-r border-stone-200 min-w-[200px]">Kharcha Vivaran (Item)</th>
                        <th className="p-3 border-r border-stone-200">Category</th>
                        <th className="p-3 border-r border-stone-200">Spent By (Karyakarta)</th>
                        <th className="p-3 border-r border-stone-200">Payment & UTR</th>
                        <th className="p-3 border-r border-stone-200 text-center w-24">Bill Proof</th>
                        <th className="p-3 border-r border-stone-200 text-right w-28">Amount (₹)</th>
                        <th className="p-3 border-r border-stone-200 text-center w-28">Status</th>
                        <th className="p-3 text-right w-36">Admin Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 font-sans">
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="p-12 text-center text-stone-500">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <span className="text-3xl">📋</span>
                              <p className="font-bold text-stone-700">Koi kharcha record nahi mila.</p>
                              <p className="text-[11px] text-stone-400">Filter badal kar dekhein ya upar se direct kharcha voucher jodein.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((exp, index) => {
                          const isPending = exp.status === 'Pending'
                          const isApproved = exp.status === 'Approved'
                          const isRejected = exp.status === 'Rejected'

                          return (
                            <tr 
                              key={exp.id} 
                              className={`transition hover:bg-emerald-50/40 ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'} ${isPending ? 'bg-amber-50/30' : ''}`}
                            >
                              {/* Voucher ID */}
                              <td className="p-3 border-r border-stone-200 font-mono font-black text-emerald-900">
                                {exp.id}
                              </td>

                              {/* Date & Time */}
                              <td className="p-3 border-r border-stone-200 text-stone-600 whitespace-nowrap">
                                <div className="font-bold text-stone-800">{exp.date}</div>
                                {exp.time && <div className="text-[10px] text-stone-400">{exp.time}</div>}
                              </td>

                              {/* Item Description */}
                              <td className="p-3 border-r border-stone-200">
                                <p className="font-black text-stone-900 text-xs">{exp.title}</p>
                                {exp.remarks && (
                                  <p className="text-[11px] text-stone-500 italic mt-0.5 line-clamp-2">
                                    "{exp.remarks}"
                                  </p>
                                )}
                              </td>

                              {/* Category */}
                              <td className="p-3 border-r border-stone-200 whitespace-nowrap">
                                <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-bold border border-stone-200 inline-block">
                                  {exp.category}
                                </span>
                              </td>

                              {/* Spent By */}
                              <td className="p-3 border-r border-stone-200 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] flex items-center justify-center">
                                    {exp.spentBy?.charAt(0) || 'M'}
                                  </span>
                                  <div>
                                    <p className="font-bold text-stone-900">{exp.spentBy}</p>
                                    <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">✓ Verified Member</p>
                                  </div>
                                </div>
                              </td>

                              {/* Mode & UTR */}
                              <td className="p-3 border-r border-stone-200 whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black inline-block ${exp.mode === 'UPI' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-stone-200 text-stone-700'}`}>
                                    {exp.mode}
                                  </span>
                                  {exp.utr && (
                                    <div className="font-mono text-[10px] font-bold text-stone-700 bg-white px-1.5 py-0.5 rounded border border-stone-200 mt-0.5 flex items-center justify-between gap-1">
                                      <span>{exp.utr}</span>
                                      <button 
                                        type="button" 
                                        onClick={() => { navigator.clipboard.writeText(exp.utr); alert(`UTR Copied: ${exp.utr}`); }}
                                        title="Copy UTR"
                                        className="text-stone-400 hover:text-stone-800"
                                      >
                                        📋
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Bill Photo Proof */}
                              <td className="p-3 border-r border-stone-200 text-center whitespace-nowrap">
                                {exp.receiptImg ? (
                                  <button 
                                    onClick={() => setSelectedExpenseReceipt(exp)}
                                    className="group relative inline-flex flex-col items-center"
                                  >
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-xs">
                                      <img src={exp.receiptImg} alt="Receipt" className="w-full h-full object-cover group-hover:scale-110 transition" />
                                    </div>
                                    <span className="text-[9px] text-emerald-800 font-bold mt-0.5 group-hover:underline">
                                      View Bill 🔍
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-stone-400 italic">No Photo</span>
                                )}
                              </td>

                              {/* Amount */}
                              <td className="p-3 border-r border-stone-200 text-right whitespace-nowrap font-mono font-black text-sm text-stone-900">
                                <span className={isApproved ? 'text-emerald-700' : isRejected ? 'text-stone-400 line-through' : 'text-amber-800'}>
                                  ₹{Number(exp.amount).toLocaleString()}
                                </span>
                              </td>

                              {/* Status Badge */}
                              <td className="p-3 border-r border-stone-200 text-center whitespace-nowrap">
                                {isApproved && (
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                    <span>✓</span> Approved
                                  </span>
                                )}
                                {isPending && (
                                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1 animate-pulse">
                                    <span>⏳</span> Pending
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="bg-rose-100 text-rose-800 border border-rose-300 font-black text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1" title={exp.rejectionReason || 'Rejected'}>
                                    <span>✕</span> Rejected
                                  </span>
                                )}
                              </td>

                              {/* Admin Actions */}
                              <td className="p-3 text-right whitespace-nowrap">
                                {isPending && (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button 
                                      onClick={() => handleApproveExpense(exp.id)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-xs transition active:scale-95"
                                      title="Approve expense into total ledger"
                                    >
                                      ✓ Approve
                                    </button>
                                    <button 
                                      onClick={() => handleRejectExpense(exp.id)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold px-2 py-1.5 rounded-lg transition"
                                      title="Reject with reason"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}

                                {isApproved && (
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="text-[10px] text-emerald-700 font-bold">
                                      Audited ✓
                                    </span>
                                    <button 
                                      onClick={() => handleRejectExpense(exp.id)}
                                      className="text-stone-400 hover:text-rose-600 text-xs font-bold"
                                      title="Change to Rejected"
                                    >
                                      Revert
                                    </button>
                                  </div>
                                )}

                                {isRejected && (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <span className="text-[10px] text-rose-600 italic max-w-[80px] truncate" title={exp.rejectionReason}>
                                      {exp.rejectionReason || 'Rejected'}
                                    </span>
                                    <button 
                                      onClick={() => handleApproveExpense(exp.id)}
                                      className="text-[10px] text-emerald-700 font-bold underline hover:text-emerald-900"
                                      title="Re-approve this expense"
                                    >
                                      Re-Approve
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteExpense(exp.id)}
                                      className="text-stone-400 hover:text-red-700 text-xs ml-1"
                                      title="Delete record"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </td>

                            </tr>
                          )
                        })
                      )}
                    </tbody>

                    {/* STICKY EXCEL GRAND TOTAL ROW */}
                    <tfoot>
                      <tr className="bg-emerald-950 text-white font-mono border-t-2 border-emerald-500">
                        <td colSpan="7" className="p-4 text-right font-black uppercase text-xs tracking-wider border-r border-emerald-900">
                          कुल स्वीकृत खर्च (TOTAL APPROVED EXPENDITURE):
                        </td>
                        <td className="p-4 text-right font-black text-lg text-emerald-300 whitespace-nowrap border-r border-emerald-900">
                          ₹{totalApprovedExpenses.toLocaleString()}
                        </td>
                        <td colSpan="2" className="p-4 text-stone-300 text-[11px] font-sans">
                          ✓ Sirf Approved bills counted
                        </td>
                      </tr>
                      
                      <tr className="bg-stone-900 text-stone-200 text-xs font-sans">
                        <td colSpan="10" className="px-5 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-xs font-mono">
                              <span>कुल जमा दान: <strong className="text-green-400">₹{totalDonationAmount.toLocaleString()}</strong></span>
                              <span>−</span>
                              <span>कुल स्वीकृत खर्च: <strong className="text-rose-400">₹{totalApprovedExpenses.toLocaleString()}</strong></span>
                              <span>=</span>
                              <span>शुद्ध तिजोरी बाकी: <strong className={`text-base ${netTreasuryBalance >= 0 ? 'text-amber-400' : 'text-red-400'}`}>₹{netTreasuryBalance.toLocaleString()}</strong></span>
                            </div>
                            <div className="text-[10px] text-stone-400 italic">
                              * {pendingExpensesCount} pending bills worth ₹{expenses.filter(e => e.status === 'Pending').reduce((s, x) => s + Number(x.amount || 0), 0).toLocaleString()} approve hone ke baad hi total me shamil honge.
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB 4: VIP PASS & GATE VERIFICATION
             ========================================== */}
          {activeTab === 'vippasses' && (
            <div className="space-y-6">
              
              <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div>
                  <h3 className="text-base font-black text-stone-900">VIP Darshan & Aarti Gate Passes</h3>
                  <p className="text-xs text-stone-500">Security Gate No. 2 par darshanarthi ke aane par 'Mark Checked-In' karein.</p>
                </div>

                <button 
                  onClick={() => setShowAddPassModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
                >
                  + Issue Guest VIP Pass 🎫
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vipPasses.map((pass) => (
                  <div key={pass.passId} className={`p-5 rounded-2xl border-2 transition ${pass.checkedIn ? 'bg-green-50/60 border-green-300' : 'bg-white border-amber-300 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-black text-red-700">{pass.passId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pass.checkedIn ? 'bg-green-600 text-white' : 'bg-amber-100 text-amber-900'}`}>
                        {pass.checkedIn ? '✓ Entered Mandap' : 'Pending Entry'}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-base">{pass.name}</h4>
                    <p className="text-xs text-stone-600 mt-0.5">Phone: {pass.phone}</p>
                    
                    <div className="mt-3 pt-3 border-t border-stone-200 text-xs space-y-1 text-stone-700">
                      <p><strong>Slot:</strong> {pass.sewaType}</p>
                      <p><strong>Date & Count:</strong> {pass.date} • {pass.count} Person(s)</p>
                    </div>

                    <div className="mt-4 pt-2 flex gap-2">
                      <button 
                        onClick={() => handleToggleCheckIn(pass.passId)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${pass.checkedIn ? 'bg-stone-200 text-stone-700' : 'bg-green-600 hover:bg-green-700 text-white shadow'}`}
                      >
                        {pass.checkedIn ? 'Undo Check-In' : 'Mark Checked-In ✓'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 5: LIVE STREAM & ANNOUNCEMENTS
             ========================================== */}
          {activeTab === 'livecontrol' && (
            <div className="space-y-6 max-w-3xl">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
                <h3 className="font-black text-base text-stone-900">Live Aarti Broadcasting Control</h3>
                <p className="text-xs text-stone-500">
                  Yeh switch website par live status ko ON ya OFF karta hai. ON hone par bhakt live video aur darshan screen dekh sakte hain.
                </p>

                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Live Stream Broadcast</h4>
                    <p className="text-xs text-stone-500">Current Status: <strong className={isAartiLive ? 'text-red-600' : 'text-stone-500'}>{isAartiLive ? 'LIVE NOW (Broadcasting)' : 'OFFLINE'}</strong></p>
                  </div>
                  <button 
                    onClick={() => setIsAartiLive(!isAartiLive)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow transition ${isAartiLive ? 'bg-red-600 hover:bg-red-700' : 'bg-stone-800 hover:bg-stone-900'}`}
                  >
                    {isAartiLive ? 'Turn OFF Live Stream' : 'Turn ON Live Stream 🔴'}
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
                <h3 className="font-black text-base text-stone-900">Live Website Announcement Ticker</h3>
                <p className="text-xs text-stone-500">
                  Devotees ke liye zaroori suchna (aarti timings, crowd update, mahaprasad notification).
                </p>

                <textarea 
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  rows="3"
                  className="w-full p-3 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                ></textarea>

                <button 
                  onClick={() => alert('Announcement saved and updated on public website!')}
                  className="bg-stone-900 hover:bg-stone-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow"
                >
                  Save & Publish Announcement 📢
                </button>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 6: QR & UPI GATEWAY SETTINGS
             ========================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-stone-900">Mandal UPI Gateway & Scanner Settings</h3>
                    <p className="text-xs text-stone-500">
                      Yahan se aap apna naya QR code upload kar sakte hain aur UPI details change kar sakte hain.
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full shadow-xs ${customQrImg ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                    {customQrImg ? '✓ Custom QR Live' : 'Default QR Live'}
                  </span>
                </div>

                {qrUploadSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fade-in">
                    <span className="text-base">🎉</span>
                    <span>{qrUploadSuccessMsg}</span>
                  </div>
                )}

                {/* QR Code Upload & Preview Card */}
                <div className="p-4 bg-gradient-to-b from-amber-50 to-orange-50/40 rounded-2xl border-2 border-amber-300 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    
                    {/* QR Code Box */}
                    <div className="w-32 h-32 bg-white p-2 rounded-2xl border-2 border-stone-200 shadow-md flex items-center justify-center relative shrink-0">
                      <img 
                        src={customQrImg || mandalUpiQr} 
                        alt="Active Mandal QR" 
                        className="w-full h-full object-contain rounded-lg" 
                      />
                    </div>

                    <div className="space-y-1.5 text-center sm:text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 bg-white border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black text-amber-900 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span>{customQrImg ? 'Admin Uploaded Custom Scanner' : 'Official Preset Scanner'}</span>
                      </div>
                      <h4 className="font-black text-sm text-stone-900">{payeeName}</h4>
                      <p className="text-xs font-mono font-bold text-red-700">{upiId}</p>
                      <p className="text-[11px] text-stone-500">
                        Devotees jab donation page par scan karenge toh yahi QR Code unhe dikhai dega.
                      </p>
                    </div>

                  </div>

                  {/* Upload Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/80">
                    <label className="cursor-pointer bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-2 active:scale-95">
                      <span>📸</span>
                      <span>{customQrImg ? 'Change / Upload New QR Photo' : 'Upload QR Code Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleQrCodeUpload} 
                        className="hidden" 
                      />
                    </label>

                    {customQrImg && (
                      <button 
                        type="button" 
                        onClick={handleResetQrCode}
                        className="bg-stone-200 hover:bg-red-100 hover:text-red-700 text-stone-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1"
                        title="Reset to default standee photo"
                      >
                        <span>↺</span>
                        <span>Reset to Default</span>
                      </button>
                    )}

                    <span className="text-[10px] text-stone-500 italic ml-auto">
                      Max file size: 3MB (PNG, JPG)
                    </span>
                  </div>
                </div>
                
                {/* UPI Details Form */}
                <div className="space-y-3 text-xs pt-2">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Official Beneficiary Name:</label>
                    <input 
                      type="text" 
                      value={payeeName}
                      onChange={(e) => setPayeeName(e.target.value)}
                      placeholder="e.g. Kunal Satote"
                      className="w-full p-2.5 border rounded-xl bg-stone-50 font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Official UPI ID for Daan:</label>
                    <input 
                      type="text" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. kunal.satote30@okhdfcbank"
                      className="w-full p-2.5 border rounded-xl bg-stone-50 font-mono font-bold text-red-700 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Mandal Legal Title:</label>
                    <input type="text" defaultValue="Shivaputr Yuvak Mandal Sarvajanik Ganeshotsav" className="w-full p-2.5 border rounded-xl bg-stone-50 text-stone-600" />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Trust Reg. Number:</label>
                    <input type="text" defaultValue="E-18294/MUM/2012" className="w-full p-2.5 border rounded-xl bg-stone-50 text-stone-600" />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem('sym_mandal_upi_id', upiId)
                    localStorage.setItem('sym_mandal_payee_name', payeeName)
                    window.dispatchEvent(new Event('storage'))
                    setQrUploadSuccessMsg('✅ QR Code aur UPI configuration successfully save ho gaya! All donations will now route to this ID.')
                    setTimeout(() => setQrUploadSuccessMsg(''), 5000)
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs px-5 py-3 rounded-xl transition shadow mt-2 flex items-center gap-2"
                >
                  <span>💾</span>
                  <span>Save Configuration & Publish to Website ✓</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- MODAL: ADD KARYAKARTA / COMMITTEE MEMBER WITH PHOTO --- */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setShowAddMemberModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 font-bold">✕</button>
            <h3 className="text-lg font-black text-stone-900 mb-1">Add Committee Member / Karyakarta</h3>
            <p className="text-xs text-stone-500 mb-4">Apne computer ya mobile se direct photo upload karein.</p>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              
              {/* Photo Upload Section */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 bg-white flex items-center justify-center flex-shrink-0 shadow">
                  {newMemberImg ? (
                    <img src={newMemberImg} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="font-bold block text-stone-800 mb-1">Member Photo (Upload Image)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handlePhotoUpload(e, setNewMemberImg)}
                    className="w-full text-[11px] text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-amber-500 file:text-stone-950 hover:file:bg-amber-600 cursor-pointer"
                  />
                  {newMemberImg && (
                    <button 
                      type="button" 
                      onClick={() => setNewMemberImg('')}
                      className="text-[10px] text-red-600 font-bold hover:underline mt-1 block"
                    >
                      Remove Photo ✕
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Full Name</label>
                <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="e.g. Kunal Kadam" className="w-full p-2.5 border rounded-xl" required />
              </div>

              <div>
                <label className="font-bold block mb-1">Role / Designation</label>
                <input type="text" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} placeholder="e.g. President, Secretary, Koshadhyaksh" className="w-full p-2.5 border rounded-xl" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Department</label>
                  <select value={newMemberDept} onChange={(e) => setNewMemberDept(e.target.value)} className="w-full p-2.5 border rounded-xl font-medium">
                    <option value="Core Leadership">Core Leadership 👑</option>
                    <option value="Aarti Seva">Aarti Seva</option>
                    <option value="Mahaprasad">Mahaprasad</option>
                    <option value="Decor & Tech">Decor & Tech</option>
                    <option value="Security & Crowd">Security & Crowd</option>
                    <option value="Volunteer Force">Volunteer Force</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Blood Group</label>
                  <select value={newMemberBlood} onChange={(e) => setNewMemberBlood(e.target.value)} className="w-full p-2.5 border rounded-xl font-bold">
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Mobile (WhatsApp)</label>
                <input type="tel" value={newMemberPhone} onChange={(e) => setNewMemberPhone(e.target.value)} placeholder="98XXXXXXXX" className="w-full p-2.5 border rounded-xl font-mono" />
              </div>

              <button type="submit" className="w-full bg-stone-900 hover:bg-stone-950 text-white font-bold py-3 rounded-xl shadow mt-2">
                Save Member with Photo ✓
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT MEMBER PHOTO & DETAILS --- */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setEditingMember(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 font-bold">✕</button>
            <h3 className="text-lg font-black text-stone-900 mb-1">Edit Member Photo & Profile</h3>
            <p className="text-xs text-stone-500 mb-4">{editingMember.name} ke details update karein.</p>

            <form onSubmit={handleSaveEditMember} className="space-y-3 text-xs">
              
              {/* Photo Upload & Preview */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 bg-white flex items-center justify-center flex-shrink-0 shadow">
                  {editImg ? (
                    <img src={editImg} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="font-bold block text-stone-800 mb-1">Change Photo (Upload New)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handlePhotoUpload(e, setEditImg)}
                    className="w-full text-[11px] text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-amber-500 file:text-stone-950 hover:file:bg-amber-600 cursor-pointer"
                  />
                  {editImg && (
                    <button 
                      type="button" 
                      onClick={() => setEditImg('')}
                      className="text-[10px] text-red-600 font-bold hover:underline mt-1 block"
                    >
                      Reset / Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-2.5 border rounded-xl font-bold" required />
              </div>

              <div>
                <label className="font-bold block mb-1">Role / Designation</label>
                <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full p-2.5 border rounded-xl" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Department</label>
                  <select value={editDept} onChange={(e) => setEditDept(e.target.value)} className="w-full p-2.5 border rounded-xl font-medium">
                    <option value="Core Leadership">Core Leadership 👑</option>
                    <option value="Aarti Seva">Aarti Seva</option>
                    <option value="Mahaprasad">Mahaprasad</option>
                    <option value="Decor & Tech">Decor & Tech</option>
                    <option value="Security & Crowd">Security & Crowd</option>
                    <option value="Volunteer Force">Volunteer Force</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Blood Group</label>
                  <select value={editBlood} onChange={(e) => setEditBlood(e.target.value)} className="w-full p-2.5 border rounded-xl font-bold">
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Mobile (WhatsApp)</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono" />
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-3 rounded-xl shadow mt-2">
                Save Changes to Roster ✓
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD CASH / OFFLINE DAAN --- */}
      {showAddDonationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setShowAddDonationModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 font-bold">✕</button>
            <h3 className="text-lg font-black text-stone-900 mb-4">Record Mandap / Cash Daan</h3>
            <form onSubmit={handleCreateDonation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Devotee Full Name</label>
                <input type="text" value={newDonorName} onChange={(e) => setNewDonorName(e.target.value)} placeholder="Devotee name" className="w-full p-2.5 border rounded-xl" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Amount (₹)</label>
                <input type="number" value={newDonorAmount} onChange={(e) => setNewDonorAmount(e.target.value)} placeholder="e.g. 1100" className="w-full p-2.5 border rounded-xl font-bold" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Seva Category</label>
                <select value={newDonorCategory} onChange={(e) => setNewDonorCategory(e.target.value)} className="w-full p-2.5 border rounded-xl">
                  <option value="Mahaprasad & Anna Daan">Mahaprasad & Anna Daan</option>
                  <option value="Mandap & Pujan Seva">Mandap & Pujan Seva</option>
                  <option value="Social Welfare Seva">Social Welfare Seva</option>
                  <option value="General Mandal Fund">General Mandal Fund</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Payment Mode</label>
                <select value={newDonorMode} onChange={(e) => setNewDonorMode(e.target.value)} className="w-full p-2.5 border rounded-xl">
                  <option value="Cash">Cash at Mandap Counter</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Transaction Ref / UTR (Optional)</label>
                <input type="text" value={newDonorUtr} onChange={(e) => setNewDonorUtr(e.target.value)} placeholder="e.g. 425510294827 or Cash Serial" className="w-full p-2.5 border rounded-xl font-mono" />
              </div>
              <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow mt-2">
                Record Daan & Issue Receipt ✓
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ISSUE VIP PASS --- */}
      {showAddPassModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setShowAddPassModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 font-bold">✕</button>
            <h3 className="text-lg font-black text-stone-900 mb-4">Issue Guest VIP Pass</h3>
            <form onSubmit={handleCreatePass} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Guest Name</label>
                <input type="text" value={newPassName} onChange={(e) => setNewPassName(e.target.value)} placeholder="Full name" className="w-full p-2.5 border rounded-xl" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Mobile</label>
                <input type="tel" value={newPassPhone} onChange={(e) => setNewPassPhone(e.target.value)} placeholder="Mobile number" className="w-full p-2.5 border rounded-xl" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Aarti Slot</label>
                <select value={newPassSlot} onChange={(e) => setNewPassSlot(e.target.value)} className="w-full p-2.5 border rounded-xl">
                  <option value="Morning Aarti (8:00 AM)">Morning Aarti (8:00 AM)</option>
                  <option value="Evening Mahā-Aarti (7:30 PM)">Evening Mahā-Aarti (7:30 PM)</option>
                  <option value="VIP Quick Darshan Slot (Anytime)">VIP Quick Darshan Slot (Anytime)</option>
                  <option value="Sheja Aarti (10:00 PM)">Sheja Aarti (10:00 PM)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Persons</label>
                  <select value={newPassCount} onChange={(e) => setNewPassCount(e.target.value)} className="w-full p-2.5 border rounded-xl">
                    <option value="1">1 Person</option>
                    <option value="2">2 Persons</option>
                    <option value="4">Family (4)</option>
                    <option value="6">Group (6)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Date</label>
                  <input type="date" value={newPassDate} onChange={(e) => setNewPassDate(e.target.value)} className="w-full p-2.5 border rounded-xl" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow mt-2">
                Generate & Confirm Pass 🎫
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: OFFICIAL RECEIPT PREVIEW --- */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl border-4 border-amber-400">
            <button onClick={() => setSelectedReceipt(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 font-bold">✕</button>
            <div className="text-center border-b pb-3 mb-3">
              <h4 className="font-black text-sm text-stone-900">SHIVAPUTR YUVAK MANDAL</h4>
              <p className="text-[10px] text-stone-500">Trust Reg: E-18294/MUM/2012</p>
              <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2.5 py-0.5 rounded-full mt-1 inline-block">
                OFFICIAL DAAN PAVATI
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <p><strong>Receipt No:</strong> <span className="font-mono text-red-700 font-bold">{selectedReceipt.id}</span></p>
              <p><strong>Devotee:</strong> {selectedReceipt.name}</p>
              <p><strong>Amount:</strong> <span className="text-lg font-black text-green-700 font-mono">₹{Number(selectedReceipt.amount).toLocaleString()}</span></p>
              <p><strong>Category:</strong> {selectedReceipt.category}</p>
              <p><strong>Payment Mode:</strong> {selectedReceipt.mode}</p>
              <p><strong>UTR / Ref:</strong> <span className="font-mono font-bold text-stone-700">{selectedReceipt.utr || 'N/A'}</span></p>
              <p><strong>Date:</strong> {selectedReceipt.date} {selectedReceipt.time && `• ${selectedReceipt.time}`}</p>
            </div>
            <button 
              onClick={() => window.print()}
              className="mt-4 w-full bg-stone-900 text-white py-2.5 rounded-xl text-xs font-bold"
            >
              Print Pavati 🖨️
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL: DIRECT ADMIN EXPENSE VOUCHER ENTRY --- */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowAddExpenseModal(false)} 
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xl">📑</span>
              <div>
                <h3 className="text-lg font-black text-stone-900 leading-tight">Direct Kharcha Voucher Entry</h3>
                <p className="text-xs text-stone-500">Mandal Khata (Excel Sheet) me direct approved kharcha jodein.</p>
              </div>
            </div>

            <form onSubmit={handleCreateExpenseByAdmin} className="space-y-3.5 text-xs">
              
              {/* Item Title */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Kharcha Vivaran / Item Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={newExpenseTitle} 
                  onChange={(e) => setNewExpenseTitle(e.target.value)} 
                  placeholder="e.g. ₹100 ka Laddu Prasad ya 15kg Ghee" 
                  className="w-full p-2.5 border rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  required 
                />
              </div>

              {/* Amount & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Kharcha Rakam / Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={newExpenseAmount} 
                    onChange={(e) => setNewExpenseAmount(e.target.value)} 
                    placeholder="e.g. 100" 
                    min="1"
                    className="w-full p-2.5 border rounded-xl font-mono font-black text-stone-900 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    required 
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Seva Category</label>
                  <select 
                    value={newExpenseCategory} 
                    onChange={(e) => setNewExpenseCategory(e.target.value)} 
                    className="w-full p-2.5 border rounded-xl font-bold bg-white text-stone-800"
                  >
                    <option value="Mahaprasad & Anna Daan">Mahaprasad & Anna Daan</option>
                    <option value="Mandap & Pujan Seva">Mandap & Pujan Seva</option>
                    <option value="Sound, Lights & GenSet">Sound, Lights & GenSet</option>
                    <option value="Security, Police & Barricades">Security & Barricades</option>
                    <option value="Publicity, Posters & Flex">Publicity & Flex</option>
                    <option value="Emergency & Misc">Emergency & Misc</option>
                  </select>
                </div>
              </div>

              {/* Payment Mode & UTR Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Payment Mode</label>
                  <select 
                    value={newExpenseMode} 
                    onChange={(e) => setNewExpenseMode(e.target.value)} 
                    className="w-full p-2.5 border rounded-xl font-bold bg-white text-stone-800"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Cash">Cash Voucher (रोकड़)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    {newExpenseMode === 'UPI' ? '12-Digit UPI UTR / Ref No' : 'Voucher / Bill No'}
                  </label>
                  <input 
                    type="text" 
                    value={newExpenseUtr} 
                    onChange={(e) => setNewExpenseUtr(e.target.value)} 
                    placeholder={newExpenseMode === 'UPI' ? 'e.g. 425519882210' : 'e.g. CASH-VOUCHER-01'} 
                    className="w-full p-2.5 border rounded-xl font-mono text-stone-900" 
                  />
                </div>
              </div>

              {/* Spent By */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Kisne Kharcha Kiya (Karyakarta Name)</label>
                <input 
                  type="text" 
                  value={newExpenseSpentBy} 
                  onChange={(e) => setNewExpenseSpentBy(e.target.value)} 
                  placeholder="e.g. Jay Patil ya Admin Direct" 
                  className="w-full p-2.5 border rounded-xl font-bold text-stone-900" 
                  required 
                />
              </div>

              {/* Bill Photo Proof Upload */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border border-stone-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {newExpenseReceiptImg ? (
                    <img src={newExpenseReceiptImg} alt="Receipt Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">🧾</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="font-bold text-stone-800 block mb-0.5">Attach Bill / Pavati Photo (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleExpenseReceiptUploadByAdmin} 
                    className="text-[11px] text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                  />
                </div>
                {newExpenseReceiptImg && (
                  <button 
                    type="button" 
                    onClick={() => setNewExpenseReceiptImg('')} 
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Remarks / Note (Optional)</label>
                <textarea 
                  value={newExpenseRemarks} 
                  onChange={(e) => setNewExpenseRemarks(e.target.value)} 
                  rows="2" 
                  placeholder="e.g. 50 packets for evening prasad bought from Mithai shop..." 
                  className="w-full p-2.5 border rounded-xl text-stone-800"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddExpenseModal(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-xl shadow transition"
                >
                  Record & Approve Voucher ✓
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: BILL RECEIPT PHOTO PREVIEW --- */}
      {selectedExpenseReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 relative shadow-2xl max-h-[92vh] flex flex-col">
            <button 
              onClick={() => setSelectedExpenseReceipt(null)} 
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 font-bold text-lg"
            >
              ✕
            </button>

            <div className="mb-3">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Expense Voucher Proof
              </span>
              <h3 className="text-base font-black text-stone-900 mt-1">
                {selectedExpenseReceipt.title}
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Voucher ID: <strong>{selectedExpenseReceipt.id}</strong> • Spent by: <strong>{selectedExpenseReceipt.spentBy}</strong>
              </p>
            </div>

            {/* Receipt Image / Proof */}
            <div className="flex-1 overflow-y-auto bg-stone-950 rounded-2xl p-2 flex items-center justify-center min-h-[220px]">
              {selectedExpenseReceipt.receiptImg ? (
                <img 
                  src={selectedExpenseReceipt.receiptImg} 
                  alt="Bill Proof" 
                  className="max-h-[50vh] w-auto object-contain rounded-xl"
                />
              ) : (
                <div className="text-center p-8 text-stone-400">
                  <span className="text-4xl">📄</span>
                  <p className="text-xs font-bold mt-2">Bill photo uplabdh nahi hai.</p>
                  <p className="text-[10px] text-stone-500">Karyakarta dwara direct cash ya UPI voucher darj kiya gaya hai.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-mono text-xs text-stone-600">Mode: <strong>{selectedExpenseReceipt.mode}</strong> {selectedExpenseReceipt.utr && `• UTR: ${selectedExpenseReceipt.utr}`}</p>
                <p className="font-mono font-black text-emerald-700 text-base mt-0.5">
                  Rakam: ₹{Number(selectedExpenseReceipt.amount).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                {selectedExpenseReceipt.status === 'Pending' && (
                  <button 
                    onClick={() => { handleApproveExpense(selectedExpenseReceipt.id); setSelectedExpenseReceipt(null); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow text-xs"
                  >
                    Approve Bill ✓
                  </button>
                )}
                <button 
                  onClick={() => setSelectedExpenseReceipt(null)}
                  className="bg-stone-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
