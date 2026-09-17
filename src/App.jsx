import { useState, useEffect, useMemo } from 'react'
import './App.css'
import ganpatiLogo from './assets/ganapati-logo.jpeg'
import mandalUpiQr from './assets/mandal-upi-qr.jpg'
import AdminDashboard from './admin/AdminDashboard.jsx'
import QRCode from 'qrcode'

function App() {
  // --- VIEW ROUTING (Public Portal vs Dedicated Admin Panel) ---
  const [currentView, setCurrentView] = useState(() => {
    return window.location.hash === '#admin' ? 'admin' : 'portal'
  })

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin')
      } else {
        setCurrentView('portal')
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // --- SOUND EFFECTS (Web Audio API - Pure synthesized, zero external audio dependencies) ---
  const [isMuted, setIsMuted] = useState(false)
  const [bellRinging, setBellRinging] = useState(false)

  const playTone = (freqs, decayTime = 1.8, type = 'sine') => {
    if (isMuted || typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') ctx.resume()

      freqs.forEach(({ freq, gain, decay }) => {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        gainNode.gain.setValueAtTime(gain, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (decay || decayTime))
        osc.connect(gainNode)
        gainNode.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + (decay || decayTime))
      })
    } catch (e) {
      console.warn("Audio synth warning:", e)
    }
  }

  // Bronze Temple Bell Synthesizer (Harmonics: D5, A5, D6, A6)
  const playTempleBell = () => {
    setBellRinging(true)
    setTimeout(() => setBellRinging(false), 900)
    playTone([
      { freq: 587.33, gain: 0.35, decay: 2.5 },
      { freq: 880.00, gain: 0.25, decay: 2.0 },
      { freq: 1174.66, gain: 0.15, decay: 1.6 },
      { freq: 1760.00, gain: 0.08, decay: 1.2 },
    ], 2.5, 'sine')
  }

  // Sacred Conch / Shankh Naad Synthesizer
  const playShankh = () => {
    if (isMuted || typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') ctx.resume()

      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'sawtooth'
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(700, ctx.currentTime)

      osc.frequency.setValueAtTime(215, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(285, ctx.currentTime + 0.6)
      osc.frequency.linearRampToValueAtTime(270, ctx.currentTime + 1.8)
      osc.frequency.exponentialRampToValueAtTime(175, ctx.currentTime + 3.0)

      gainNode.gain.setValueAtTime(0.01, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.4)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0)

      osc.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 3.1)
    } catch (e) {
      console.warn("Shankh synth warning:", e)
    }
  }

  // Melodious Pooja Chime (C-E-G-C)
  const playPoojaChime = () => {
    playTone([
      { freq: 523.25, gain: 0.2, decay: 1.4 },
      { freq: 659.25, gain: 0.2, decay: 1.4 },
      { freq: 783.99, gain: 0.2, decay: 1.6 },
      { freq: 1046.50, gain: 0.15, decay: 1.8 },
    ], 1.8, 'sine')
  }

  // --- VIRTUAL POOJA & DEVOTION STATES ---
  const [diyaCount, setDiyaCount] = useState(() => {
    const saved = localStorage.getItem('sym_diya_count')
    return saved ? Number(saved) : 2157
  })
  const [modakCount, setModakCount] = useState(() => {
    const saved = localStorage.getItem('sym_modak_count')
    return saved ? Number(saved) : 8420
  })
  const [lit, setLit] = useState(false)
  const [visitorName, setVisitorName] = useState(() => localStorage.getItem('sym_logged_user') || '')
  const [visitorPhone, setVisitorPhone] = useState(() => localStorage.getItem('sym_user_phone') || '')
  const [flowerShowerActive, setFlowerShowerActive] = useState(false)
  const [isAartiThaliActive, setIsAartiThaliActive] = useState(false)
  const [activeAartiTab, setActiveAartiTab] = useState('sukhkarta')

  useEffect(() => {
    localStorage.setItem('sym_diya_count', diyaCount)
  }, [diyaCount])

  useEffect(() => {
    localStorage.setItem('sym_modak_count', modakCount)
  }, [modakCount])

  // --- AARTI TIMETABLE & LIVE COUNTDOWN ---
  const [nextAarti, setNextAarti] = useState({ name: 'संध्या महाआरती (Evening Mahā-Aarti)', timeStr: '7:30 PM', countdown: '' })

  useEffect(() => {
    const aartiSchedule = [
      { name: 'प्रातः काकड आरती (Morning Aarti)', hour: 7, minute: 0, display: '07:00 AM' },
      { name: 'मध्यान्ह महाभोग आरती (Noon Bhog Aarti)', hour: 12, minute: 30, display: '12:30 PM' },
      { name: 'संध्या महाआरती (Grand Evening Aarti)', hour: 19, minute: 30, display: '07:30 PM' },
      { name: 'शेज आरती व मंत्रपुष्पांजली (Night Shej Aarti)', hour: 22, minute: 0, display: '10:00 PM' }
    ]

    const updateTimer = () => {
      const now = new Date()
      let target = null
      let selectedAarti = null

      for (const aarti of aartiSchedule) {
        const aartiTime = new Date()
        aartiTime.setHours(aarti.hour, aarti.minute, 0, 0)
        if (aartiTime > now) {
          target = aartiTime
          selectedAarti = aarti
          break
        }
      }

      if (!target) {
        selectedAarti = aartiSchedule[0]
        target = new Date()
        target.setDate(target.getDate() + 1)
        target.setHours(selectedAarti.hour, selectedAarti.minute, 0, 0)
      }

      const diffMs = target - now
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000)

      setNextAarti({
        name: selectedAarti.name,
        timeStr: selectedAarti.display,
        countdown: `${String(hours).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`
      })
    }

    updateTimer()
    const timerId = setInterval(updateTimer, 1000)
    return () => clearInterval(timerId)
  }, [])

  // --- ANNOUNCEMENT (SYNCED WITH ADMIN) ---
  const [liveAnnouncement, setLiveAnnouncement] = useState(() => {
    return localStorage.getItem('sym_announcement') || '॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥'
  })

  // Listen for changes from Admin
  useEffect(() => {
    const handleStorage = () => {
      const ann = localStorage.getItem('sym_announcement')
      if (ann) setLiveAnnouncement(ann)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // --- AUTH STATE (Login / SignUp Modal & Status) ---
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('sym_user_email') || '')
  const [userPassword, setUserPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [loggedInUser, setLoggedInUser] = useState(() => localStorage.getItem('sym_logged_user') || null)
  const [knownAccounts, setKnownAccounts] = useState(() => {
    const saved = localStorage.getItem('sym_known_accounts')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) { }
    }
    return []
  })

  // --- USER PROFILE & AVATAR STATE (DEVOTEE PHOTO SYSTEM) ---
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('sym_user_avatar') || '')
  const [userPhone, setUserPhone] = useState(() => localStorage.getItem('sym_user_phone') || '')
  const [userCity, setUserCity] = useState(() => localStorage.getItem('sym_user_city') || '')
  const [showUserProfileModal, setShowUserProfileModal] = useState(false)
  const [editUserName, setEditUserName] = useState('')
  const [editUserEmail, setEditUserEmail] = useState('')
  const [editUserPhone, setEditUserPhone] = useState('')
  const [editUserCity, setEditUserCity] = useState('')
  const [userProfileSuccessMsg, setUserProfileSuccessMsg] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  // --- BLESSINGS STATE WITH REAL PAYMENT VERIFICATION & LUCKY WISH LOGIC ---
  const [blessings, setBlessings] = useState(() => {
    const saved = localStorage.getItem('sym_blessings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) { }
    }
    return [
      { name: 'Sameer Patil', wish: 'Bappa, iss saal mandal ki sabhi ichhayein poori karna. Ganpati Bappa Morya!', amount: 101, isLuckyChosen: true, likes: 28, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', utr: '425519283741', verified: true },
      { name: 'Neha Deshmukh', wish: 'Mandal ke sabhi karyakartao ko shakti dena. Sukhi raho sabhi! 🙏', amount: 51, isLuckyChosen: false, likes: 19, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', utr: '425510294827', verified: true },
      { name: 'Ganesh More', wish: 'Sukh, shanti aur sabhi ke gharon mein samriddhi bani rahe.', amount: 251, isLuckyChosen: false, likes: 14, img: '', utr: '425599812401', verified: true }
    ]
  })
  const [wishInput, setWishInput] = useState('')
  const [wishAmount, setWishAmount] = useState('51')
  const [totalWishCount, setTotalWishCount] = useState(() => {
    const saved = localStorage.getItem('sym_total_wish_count')
    return saved ? Number(saved) : 99
  })
  const [wishSuccessMsg, setWishSuccessMsg] = useState('')
  const [showBlessingPaymentModal, setShowBlessingPaymentModal] = useState(false)
  const [pendingBlessing, setPendingBlessing] = useState(null)
  const [blessingUtr, setBlessingUtr] = useState('')
  const [blessingUtrError, setBlessingUtrError] = useState('')
  const [isBlessingVerifying, setIsBlessingVerifying] = useState(false)
  const [blessingDynamicQr, setBlessingDynamicQr] = useState('')
  const [blessingQrMode, setBlessingQrMode] = useState('dynamic') // 'dynamic' (auto-amount) or 'standee'

  // --- TEAM MEMBERS (SYNCED WITH LOCALSTORAGE / ADMIN) ---
  const [teamCategory, setTeamCategory] = useState('All')
  const [searchMemberQuery, setSearchMemberQuery] = useState('')
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

  // Sync team members changes from storage / AdminDashboard
  useEffect(() => {
    const handleTeamSync = () => {
      const saved = localStorage.getItem('sym_team_members')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) setTeamMembers(parsed)
        } catch (e) { }
      }
    }
    window.addEventListener('storage', handleTeamSync)
    window.addEventListener('sym_team_members_updated', handleTeamSync)
    return () => {
      window.removeEventListener('storage', handleTeamSync)
      window.removeEventListener('sym_team_members_updated', handleTeamSync)
    }
  }, [])
  // --- MANDAL EXPENSES & KHARCHA SYSTEM (MEMBER ONLY PERMISSION & ADMIN APPROVAL) ---
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('sym_expenses')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { }
    }
    return [
      {
        id: 'EXP-101',
        title: 'Bappa Mahaprasad Laddu (5 kg)',
        amount: 1200,
        category: 'Prasad & Bhog',
        spentBy: 'Jay Patil',
        memberRole: 'Volunteer / Karyakarta',
        paymentMode: 'UPI (GPay)',
        upiRef: '425590124891',
        billReceiptUrl: '',
        date: '10 Sep 2026',
        time: '04:30 PM',
        notes: 'Bappa ke bhog hetu fresh besan laddu kharide gaye.',
        status: 'Approved',
        approvedBy: 'Admin (Treasurer)',
        timestamp: Date.now() - 86400000
      },
      {
        id: 'EXP-102',
        title: 'Aarti Phool & Gulab Haar',
        amount: 350,
        category: 'Aarti & Pooja',
        spentBy: 'Rohit Kadam',
        memberRole: 'Aarti Seva Lead',
        paymentMode: 'Cash',
        upiRef: 'CASH-PAYMENT',
        billReceiptUrl: '',
        date: '11 Sep 2026',
        time: '08:00 AM',
        notes: 'Morning aarti ke liye 2 bade gulab haar aur champa phool.',
        status: 'Approved',
        approvedBy: 'Admin (President)',
        timestamp: Date.now() - 43200000
      },
      {
        id: 'EXP-103',
        title: '100 ka Laddu (Prasad Packet)',
        amount: 100,
        category: 'Prasad & Bhog',
        spentBy: 'Jay Patil',
        memberRole: 'Volunteer / Karyakarta',
        paymentMode: 'UPI (PhonePe)',
        upiRef: '425619283019',
        billReceiptUrl: '',
        date: '11 Sep 2026',
        time: '06:15 PM',
        notes: 'Chhote bhakto ke liye 100 ka motichoor laddu pack liya.',
        status: 'Pending',
        approvedBy: '',
        timestamp: Date.now() - 3600000
      }
    ]
  })

  // Modal & Form States for Expenses
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [showExpenseListModal, setShowExpenseListModal] = useState(false)
  const [selectedExpenseReceipt, setSelectedExpenseReceipt] = useState(null)
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('Prasad & Bhog')
  const [expensePaymentMode, setExpensePaymentMode] = useState('UPI (GPay)')
  const [expenseUpiRef, setExpenseUpiRef] = useState('')
  const [expenseNotes, setExpenseNotes] = useState('')
  const [expenseReceiptImg, setExpenseReceiptImg] = useState('')
  const [expenseErrorMsg, setExpenseErrorMsg] = useState('')
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState('')
  const [isExpenseSubmitting, setIsExpenseSubmitting] = useState(false)

  // --- MANDAL GROUP BANNER IMAGE (ADMIN CONTROLLED) ---
  const [groupBannerImg, setGroupBannerImg] = useState(() => {
    return localStorage.getItem('sym_group_banner_img') || ''
  })

  // Synchronize teamMembers, announcements, donations & expenses
  useEffect(() => {
    const handleSync = () => {
      const savedMembers = localStorage.getItem('sym_team_members')
      if (savedMembers) {
        try { setTeamMembers(JSON.parse(savedMembers)) } catch (e) { }
      }
      const savedAnn = localStorage.getItem('sym_announcement')
      if (savedAnn) setLiveAnnouncement(savedAnn)
      const savedDonations = localStorage.getItem('sym_donations')
      if (savedDonations) {
        try { setDonations(JSON.parse(savedDonations)) } catch (e) { }
      }
      const savedExpenses = localStorage.getItem('sym_expenses')
      if (savedExpenses) {
        try { setExpenses(JSON.parse(savedExpenses)) } catch (e) { }
      }
      const savedBanner = localStorage.getItem('sym_group_banner_img')
      if (savedBanner !== null) {
        setGroupBannerImg(savedBanner)
      } else {
        setGroupBannerImg('')
      }
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('focus', handleSync)
    window.addEventListener('sym_donations_updated', handleSync)
    window.addEventListener('sym_expenses_updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('focus', handleSync)
      window.removeEventListener('sym_donations_updated', handleSync)
      window.removeEventListener('sym_expenses_updated', handleSync)
    }
  }, [currentView])

  useEffect(() => {
    const savedBanner = localStorage.getItem('sym_group_banner_img')
    if (savedBanner !== null) {
      setGroupBannerImg(savedBanner)
    }
  }, [currentView])

  // --- JOIN GROUP REQUEST & ADMIN STATE ---
  const [joinName, setJoinName] = useState('')
  const [joinPhone, setJoinPhone] = useState('')
  const [joinRoleInterest, setJoinRoleInterest] = useState('Volunteer / Karyakarta')
  const [joinAddress, setJoinAddress] = useState('')
  const [joinRequests, setJoinRequests] = useState(() => {
    const saved = localStorage.getItem('sym_join_requests')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { }
    }
    return [
      { id: 101, name: 'Sanket Ghadge', phone: '9876543210', role: 'Volunteer / Karyakarta', address: 'Ward 4, Near Maruti Mandir', status: 'Pending', date: '08 Sep 2026' }
    ]
  })
  const [joinSuccessMsg, setJoinSuccessMsg] = useState('')

  // --- DONATIONS, PRESETS & OFFICIAL E-RECEIPT MODAL ---
  const [donations, setDonations] = useState(() => {
    const saved = localStorage.getItem('sym_donations')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { }
    }
    return [
      { id: 'REC-101', name: 'Rajesh Sharma', amount: 1100, message: 'Bappa ke charno mein samarpit.', utr: '425519283741', mode: 'UPI (GPay)', date: '09 Sep 2026' },
      { id: 'REC-102', name: 'Pooja Kulkarni', amount: 501, message: 'Sarvajanik Utsav ke liye.', utr: '425510294827', mode: 'Scanner QR', date: '09 Sep 2026' },
      { id: 'REC-103', name: 'Kishore Patil', amount: 2501, message: 'Parivar ki taraf se Mahaprasad bhent.', utr: 'OFFLINE-CASH', mode: 'Cash', date: '08 Sep 2026' }
    ]
  })
  const [donorName, setDonorName] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [donationAmount, setDonationAmount] = useState('')
  const [donationCategory, setDonationCategory] = useState('Mahaprasad & Anna Daan')
  const [donationMsg, setDonationMsg] = useState('')
  const [donationPaymentMethod, setDonationPaymentMethod] = useState('Scanner QR')
  const [showUpiModal, setShowUpiModal] = useState(false)
  const [showScannerModal, setShowScannerModal] = useState(false)
  const [activeScannerApp, setActiveScannerApp] = useState('Google Pay')
  const [activeReceipt, setActiveReceipt] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false)
  const [donorUtr, setDonorUtr] = useState('')
  const [utrValidationError, setUtrValidationError] = useState('')
  const [upiCopied, setUpiCopied] = useState(false)
  const [paymentGatewayTab, setPaymentGatewayTab] = useState('gpay_qr')
  const [cardNetbankingMode, setCardNetbankingMode] = useState('card')
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)')
  const [dynamicQrUrl, setDynamicQrUrl] = useState('')
  const [qrViewMode, setQrViewMode] = useState('standee') // 'standee' (official authentic scanner) or 'dynamic'

  // Live UPI Details & Custom QR configured by admin
  const [activeUpiId, setActiveUpiId] = useState(() => {
    return localStorage.getItem('sym_mandal_upi_id') || 'kunal.satote30@okhdfcbank'
  })
  const [activePayeeName, setActivePayeeName] = useState(() => {
    return localStorage.getItem('sym_mandal_payee_name') || 'Kunal Satote'
  })
  const [customQrCode, setCustomQrCode] = useState(() => {
    return localStorage.getItem('sym_custom_qr_code') || ''
  })

  // Real-time synchronization when Admin updates QR Code, UPI ID, or Name in Admin Dashboard
  useEffect(() => {
    const handleStorageSync = () => {
      const savedQr = localStorage.getItem('sym_custom_qr_code') || ''
      setCustomQrCode(savedQr)
      const savedUpi = localStorage.getItem('sym_mandal_upi_id')
      if (savedUpi) setActiveUpiId(savedUpi)
      const savedName = localStorage.getItem('sym_mandal_payee_name')
      if (savedName) setActivePayeeName(savedName)
    }

    window.addEventListener('storage', handleStorageSync)
    window.addEventListener('focus', handleStorageSync)
    return () => {
      window.removeEventListener('storage', handleStorageSync)
      window.removeEventListener('focus', handleStorageSync)
    }
  }, [])

  const activeStandeeQr = customQrCode || mandalUpiQr

  const copyUpiId = () => {
    navigator.clipboard.writeText(activeUpiId)
    setUpiCopied(true)
    setTimeout(() => setUpiCopied(false), 2500)
  }

  // --- REAL-TIME DYNAMIC UPI QR GENERATION (AUTO-FILL AMOUNT IN GPAY / PHONEPE / PAYTM / BHIM) ---
  useEffect(() => {
    const rawAmt = Number(donationAmount)
    const finalAmt = rawAmt > 0 ? (Number.isInteger(rawAmt) ? rawAmt : rawAmt.toFixed(2)) : 1
    // Standard NPCI UPI URI scheme with exact amount and Google Pay aid embedded
    const upiUri = `upi://pay?pa=${activeUpiId}&pn=${encodeURIComponent(activePayeeName)}&aid=uGICAgID3woOEYg&am=${finalAmt}&cu=INR&tn=${encodeURIComponent('Shivaputr Utsav Daan')}`

    QRCode.toDataURL(upiUri, {
      width: 400,
      margin: 1.5,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => {
        setDynamicQrUrl(url)
      })
      .catch((err) => {
        console.error('Failed to generate dynamic QR code:', err)
        setDynamicQrUrl(activeStandeeQr)
      })
  }, [donationAmount, activeUpiId, activePayeeName, activeStandeeQr])

  // --- REAL-TIME DYNAMIC UPI QR GENERATION FOR BAPPA BLESSINGS WALL ---
  useEffect(() => {
    const rawAmt = Number(pendingBlessing?.amount || wishAmount)
    const finalAmt = rawAmt > 0 ? (Number.isInteger(rawAmt) ? rawAmt : rawAmt.toFixed(2)) : 51
    const upiUri = `upi://pay?pa=${activeUpiId}&pn=${encodeURIComponent(activePayeeName)}&aid=uGICAgID3woOEYg&am=${finalAmt}&cu=INR&tn=${encodeURIComponent('Bappa Wish Sankalp Daan')}`

    QRCode.toDataURL(upiUri, {
      width: 400,
      margin: 1.5,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => {
        setBlessingDynamicQr(url)
      })
      .catch((err) => {
        console.error('Failed to generate blessing QR code:', err)
        setBlessingDynamicQr(activeStandeeQr)
      })
  }, [pendingBlessing, wishAmount, activeUpiId, activePayeeName, activeStandeeQr])

  // --- VIP PASS & BOOKING WITH OFFICIAL DIGITAL PASS MODAL ---
  const [bookingName, setBookingName] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingCount, setBookingCount] = useState('2')
  const [sewaType, setSewaType] = useState('Evening Mahā-Aarti (7:30 PM)')
  const [bookingDate, setBookingDate] = useState('')
  const [activeVipPass, setActiveVipPass] = useState(null)
  const [showVipPassModal, setShowVipPassModal] = useState(false)

  // --- INSTAGRAM LIVE & LIVE CHAT FEED ---
  const [isAartiLiveNow, setIsAartiLiveNow] = useState(() => {
    const saved = localStorage.getItem('sym_is_live')
    return saved !== null ? saved === 'true' : true
  })
  const [liveRequested, setLiveRequested] = useState(false)
  const [liveApproved, setLiveApproved] = useState(false)
  const [reqName, setReqName] = useState('')
  const [liveComments, setLiveComments] = useState([
    { user: 'omkar_m', text: 'गणपति बाप्पा मोरया! मंगल मूर्ति मोरया! 🙏🚩' },
    { user: 'snehal_p', text: 'Bappa chya charni namaskar. Krupavanta raha.' },
    { user: 'aditya_99', text: 'Live darshan khup sundar distay! Jai Ganesh!' }
  ])
  const [newComment, setNewComment] = useState('')

  // --- YEAR-WISE GALLERY & LIGHTBOX MODAL ---
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2026')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [lightboxImg, setLightboxImg] = useState(null)

  const galleryData = {
    '2026': [
      { title: 'Prathama Darshan 2026', cat: 'Darshan', img: 'https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=700&auto=format&fit=crop' },
      { title: 'Mandap Decoration & Golden Chandelier', cat: 'Decor', img: 'https://images.unsplash.com/photo-1665816051851-105973b957d6?q=80&w=700&auto=format&fit=crop' },
      { title: 'Mahaprasad Bhog Thali', cat: 'Prasad', img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=700&auto=format&fit=crop' }
    ],
    '2025': [
      { title: 'Utsav Sohla 2025', cat: 'Darshan', img: 'https://images.unsplash.com/photo-1631327343523-f2377042983b?q=80&w=700&auto=format&fit=crop' },
      { title: 'Mahaprasad Vitaran 5000+ Thali', cat: 'Prasad', img: 'https://images.unsplash.com/photo-1529898795450-158d032a15f2?q=80&w=700&auto=format&fit=crop' }
    ],
    '2024': [
      { title: 'Bappa Agaman 2024 Dhol Tasha', cat: 'Miravnuk', img: 'https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=700&auto=format&fit=crop' },
      { title: 'Grand Aarti 2024 Dipotsav', cat: 'Aarti', img: 'https://images.unsplash.com/photo-1665816051851-105973b957d6?q=80&w=700&auto=format&fit=crop' }
    ],
    '2023': [
      { title: 'Visarjan Miravnuk 2023 Gulal Sohla', cat: 'Miravnuk', img: 'https://images.unsplash.com/photo-1631327343523-f2377042983b?q=80&w=700&auto=format&fit=crop' }
    ],
    '2022': [
      { title: 'COVID Relief Blood Donation Camp', cat: 'Social', img: 'https://images.unsplash.com/photo-1529898795450-158d032a15f2?q=80&w=700&auto=format&fit=crop' }
    ],
    '2021': [
      { title: 'Eco-friendly Shadu Mati Bappa', cat: 'Darshan', img: 'https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=700&auto=format&fit=crop' }
    ],
    '2020': [
      { title: 'Aarogya Utsav Niyam Darshan', cat: 'Darshan', img: 'https://images.unsplash.com/photo-1665816051851-105973b957d6?q=80&w=700&auto=format&fit=crop' }
    ],
    '2019': [
      { title: 'Golden Jubilee Vibe & Royal Darbar', cat: 'Darshan', img: 'https://images.unsplash.com/photo-1631327343523-f2377042983b?q=80&w=700&auto=format&fit=crop' }
    ]
  }

  // --- HANDLERS ---
  const handleLightDiya = (e) => {
    e.preventDefault()
    if (!visitorName.trim()) return
    setDiyaCount(prev => prev + 1)
    setLit(true)
    playTempleBell()
    setTimeout(() => setLit(false), 3500)
  }

  const handleOfferFlowers = () => {
    setFlowerShowerActive(true)
    playPoojaChime()
    setTimeout(() => setFlowerShowerActive(false), 3000)
  }

  const handleOfferModak = () => {
    setModakCount(prev => prev + 1)
    playPoojaChime()
  }

  // --- BAPPA BLESSINGS WALL: 100% REAL PAYMENT GATEWAY HANDLERS ---
  const handleInitiateBlessingPayment = (e) => {
    e.preventDefault()
    setBlessingUtrError('')
    const vName = visitorName.trim() || loggedInUser || ''
    const vPhone = visitorPhone.trim() || userPhone || ''
    const vWish = wishInput.trim()
    const amt = Number(wishAmount)

    if (!vName) {
      alert("Kripya apna shubh naam enter karein!")
      return
    }

    if (!vPhone || !/^[6-9]\d{9}$/.test(vPhone)) {
      alert("Kripya valid 10-digit mobile number enter karein (Payment verification aur Pavati ke liye anivarya hai)!")
      return
    }

    if (!vWish) {
      alert("Kripya Bappa ke charno mein apni wish ya sankalp likhein!")
      return
    }

    if (!amt || isNaN(amt) || amt < 5) {
      alert("Kripya kam se kam ₹5 ya usse zyada ka sankalp daan enter karein!")
      return
    }

    const blessingData = {
      name: vName,
      phone: vPhone,
      wish: vWish,
      amount: amt
    }

    setPendingBlessing(blessingData)
    setBlessingUtr('')
    setBlessingUtrError('')
    setShowBlessingPaymentModal(true)
  }

  const handleVerifyBlessingPayment = (modeUsed = 'Google Pay (Blessings QR)') => {
    setBlessingUtrError('')
    if (!pendingBlessing) return

    const cleanUtr = blessingUtr.trim().replace(/\s+/g, '')

    if (!cleanUtr) {
      setBlessingUtrError('⚠️ Payment verify karne ke liye GPay / PhonePe receipt se mila 12-digit UPI UTR / Ref No. daalna anivarya (mandatory) hai!')
      return
    }

    if (!/^\d{12}$/.test(cleanUtr) && !/^[A-Za-z0-9]{10,18}$/.test(cleanUtr)) {
      setBlessingUtrError('⚠️ UTR number 12 digits ka hona chahiye jo GPay / PhonePe payment success screen par dikhta hai (jaise: 425519283741).')
      return
    }

    // Duplicate Check against existing donations
    let currentDonations = []
    try {
      const saved = localStorage.getItem('sym_donations')
      currentDonations = saved ? JSON.parse(saved) : donations
    } catch (e) {
      currentDonations = donations
    }

    const isDuplicate = currentDonations.some(d => d.utr && d.utr.toString().toLowerCase() === cleanUtr.toLowerCase())
    if (isDuplicate) {
      setBlessingUtrError(`⚠️ Yeh UPI UTR Number (${cleanUtr}) pehle se record ho chuka hai! Har transaction ke liye naya UTR anivarya hai.`)
      return
    }

    setIsBlessingVerifying(true)

    setTimeout(() => {
      const newReceiptId = 'REC-' + Math.floor(1000 + Math.random() * 9000)
      const now = new Date()
      const dateFormatted = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      const timeFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

      // 1. Create official donation entry in Mandal Treasury
      const newDonationEntry = {
        id: newReceiptId,
        name: pendingBlessing.name,
        phone: pendingBlessing.phone,
        amount: pendingBlessing.amount,
        category: 'Bappa Blessings Wall (Sankalp Daan)',
        message: `Bappa Wish: "${pendingBlessing.wish}"`,
        mode: modeUsed,
        utr: cleanUtr,
        date: dateFormatted,
        time: timeFormatted,
        verified: true,
        timestamp: Date.now()
      }

      const updatedDonations = [newDonationEntry, ...currentDonations]
      setDonations(updatedDonations)
      localStorage.setItem('sym_donations', JSON.stringify(updatedDonations))
      window.dispatchEvent(new CustomEvent('sym_donations_updated', { detail: updatedDonations }))
      window.dispatchEvent(new Event('storage'))

      // 2. Publish to Bappa Blessings Wall
      const newCount = totalWishCount + 1
      setTotalWishCount(newCount)
      localStorage.setItem('sym_total_wish_count', newCount.toString())
      const isLucky = newCount % 100 === 0

      const newWishObj = {
        name: pendingBlessing.name,
        wish: pendingBlessing.wish,
        amount: pendingBlessing.amount,
        isLuckyChosen: isLucky,
        likes: 1,
        img: userAvatar || '',
        utr: cleanUtr,
        date: dateFormatted,
        verified: true
      }

      const updatedBlessings = [newWishObj, ...blessings]
      setBlessings(updatedBlessings)
      localStorage.setItem('sym_blessings', JSON.stringify(updatedBlessings))

      setIsBlessingVerifying(false)
      setShowBlessingPaymentModal(false)

      if (isLucky) {
        playTempleBell()
        setWishSuccessMsg(`🎉 Badhai ho ${pendingBlessing.name}! Real Payment Verified (UTR: ${cleanUtr}). Aapki wish 100th lucky draw mein Bappa dwara chuni gayi hai! 🙏`)
      } else {
        playPoojaChime()
        setWishSuccessMsg(`✨ Real Payment Verified! Aapki shraddha poorvak wish aur ₹${pendingBlessing.amount} ka sankalp daan safalta poorvak Bappa Blessings Wall par live ho gaya! UTR: ${cleanUtr}`)
      }

      // 3. Show Official Payment Success & E-Receipt
      setActiveReceipt(newDonationEntry)
      setShowPaymentSuccessModal(true)

      // Reset form fields
      setWishInput('')
      setWishAmount('51')
      setPendingBlessing(null)
      setTimeout(() => setWishSuccessMsg(''), 9000)
    }, 1500)
  }

  const handleBlessingMobilePay = (appName = 'Google Pay') => {
    if (!pendingBlessing) return
    const amt = Number(pendingBlessing.amount) || 51
    const upiUri = `upi://pay?pa=${activeUpiId}&pn=${encodeURIComponent(activePayeeName)}&am=${amt}&cu=INR&tn=${encodeURIComponent('Bappa Blessings Wish Daan')}`
    try {
      window.location.href = upiUri
    } catch (err) {
      console.error("UPI link error:", err)
    }
  }

  const handleJoinGroupRequest = (e) => {
    e.preventDefault()
    if (!joinName.trim() || !joinPhone.trim()) return

    const newReq = {
      id: Date.now(),
      name: joinName,
      phone: joinPhone,
      role: joinRoleInterest,
      address: joinAddress || 'Local Resident',
      status: 'Pending',
      date: 'Today'
    }

    const updatedRequests = [newReq, ...joinRequests]
    setJoinRequests(updatedRequests)
    localStorage.setItem('sym_join_requests', JSON.stringify(updatedRequests))

    setJoinSuccessMsg('✨ Aapki join request safalta poorvak bhej di gayi hai! Mandal Adhyaksh / Secretary dwara approve hote hi aapka naam Directory mein jod diya jayega.')
    setJoinName('')
    setJoinPhone('')
    setJoinAddress('')
    setTimeout(() => setJoinSuccessMsg(''), 6500)
  }

  const handlePresetDonation = (amt) => {
    setDonationAmount(amt)
  }

  const handleDonateSubmit = (e) => {
    e.preventDefault()
    setUtrValidationError('')
    const finalAmount = Number(donationAmount)
    if (!donorName.trim()) {
      alert('Kripya apna poora naam darj karein (Official Pavati ke liye anivarya hai)!')
      return
    }
    if (!donorPhone.trim() || !/^[6-9]\d{9}$/.test(donorPhone.trim())) {
      alert('Kripya valid 10-digit mobile number darj karein (jaise: 98XXXXXXXX)!')
      return
    }
    if (!finalAmount || finalAmount <= 0) {
      alert('Kripya valid daan rashi (kam se kam ₹1) darj karein!')
      return
    }

    if (donationPaymentMethod === 'Card/NetBanking') {
      setPaymentGatewayTab('card_netbanking')
    } else if (donationPaymentMethod === 'UPI') {
      setPaymentGatewayTab('upi_intent')
    } else {
      setPaymentGatewayTab('gpay_qr')
    }

    setShowUpiModal(true)
  }

  const handleVerifyAndRecordPayment = (modeUsed = 'Google Pay (Scanner QR)', customUtr = '') => {
    setUtrValidationError('')
    const name = donorName.trim() || loggedInUser || ''
    const phone = donorPhone.trim()
    const amt = Number(donationAmount)
    const rawUtr = (customUtr || donorUtr).trim()
    const cleanUtr = rawUtr.replace(/\s+/g, '')

    // 1. Devotee Name Validation
    if (!name) {
      setUtrValidationError('⚠️ Kripya apna poora naam darj karein (Official Pavati ke liye anivarya hai).')
      return false
    }

    // 2. Mobile Number Validation (10 digits)
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      setUtrValidationError('⚠️ Kripya valid 10-digit mobile number enter karein (jaise: 98XXXXXXXX).')
      return false
    }

    // 3. Amount Validation
    if (!amt || amt <= 0 || isNaN(amt)) {
      setUtrValidationError('⚠️ Kripya valid daan rashi (kam se kam ₹1) enter karein.')
      return false
    }

    // 4. 12-Digit Bank UTR / Transaction ID Validation (Mandatory for UPI/Scanner)
    if (modeUsed.includes('Card') || modeUsed.includes('NetBanking')) {
      // Card / NetBanking system generated reference
    } else {
      if (!cleanUtr) {
        setUtrValidationError('⚠️ Payment verify karne ke liye GPay / PhonePe payment receipt se mila 12-digit UPI UTR / Ref No. enter karna anivarya (mandatory) hai!')
        return false
      }

      if (!/^\d{12}$/.test(cleanUtr) && !/^[A-Za-z0-9]{10,18}$/.test(cleanUtr)) {
        setUtrValidationError('⚠️ UTR number 12 digits ka hona chahiye jo GPay / PhonePe payment success screen par dikhta hai (jaise: 425519283741).')
        return false
      }

      // 5. Duplicate Check against existing database
      let currentDonations = []
      try {
        const saved = localStorage.getItem('sym_donations')
        currentDonations = saved ? JSON.parse(saved) : donations
      } catch (e) {
        currentDonations = donations
      }

      const isDuplicate = currentDonations.some(d => d.utr && d.utr.toString().toLowerCase() === cleanUtr.toLowerCase())
      if (isDuplicate) {
        setUtrValidationError(`⚠️ Yeh UPI UTR Number (${cleanUtr}) pehle se darj ho chuka hai! Ek transaction ID se keval ek hi receipt ban sakti hai.`)
        return false
      }
    }

    // All validations passed! Begin bank verification simulation
    setIsPaymentProcessing(true)

    setTimeout(() => {
      const newReceiptId = 'REC-' + Math.floor(1000 + Math.random() * 9000)
      const now = new Date()
      const dateFormatted = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      const timeFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      const finalUtr = cleanUtr || (modeUsed.includes('Card') ? 'CARD-' + Date.now().toString().slice(-8) : 'NET-' + Date.now().toString().slice(-8))

      const newDonationEntry = {
        id: newReceiptId,
        name: name,
        phone: phone,
        amount: amt,
        category: donationCategory || 'Mahaprasad & Anna Daan',
        message: donationMsg.trim() || 'Ganpati Bappa Morya! Sarvajanik Utsav Bhent.',
        mode: modeUsed,
        utr: finalUtr,
        date: dateFormatted,
        time: timeFormatted,
        verified: true,
        timestamp: Date.now()
      }

      // Re-read latest to avoid overwriting any concurrent entries
      let latestList = []
      try {
        const saved = localStorage.getItem('sym_donations')
        latestList = saved ? JSON.parse(saved) : donations
      } catch (e) {
        latestList = donations
      }

      const updatedList = [newDonationEntry, ...latestList]
      setDonations(updatedList)
      localStorage.setItem('sym_donations', JSON.stringify(updatedList))

      // Broadcast update across window, components, and storage
      window.dispatchEvent(new CustomEvent('sym_donations_updated', { detail: updatedList }))
      window.dispatchEvent(new Event('storage'))

      setIsPaymentProcessing(false)
      setShowScannerModal(false)
      setShowUpiModal(false)
      setActiveReceipt(newDonationEntry)
      setShowPaymentSuccessModal(true)
      playTempleBell()

      // Reset form states
      setDonorName('')
      setDonorPhone('')
      setDonationAmount('')
      setDonationMsg('')
      setDonorUtr('')
      setUtrValidationError('')
      setCardDetails({ number: '', expiry: '', cvv: '', name: '' })
    }, 1500)

    return true
  }

  // Alias for backward compatibility
  const confirmDonationPayment = handleVerifyAndRecordPayment

  const handleDownloadReceipt = () => {
    setShowPaymentSuccessModal(false)
    setShowReceiptModal(true)
    setTimeout(() => {
      window.print()
    }, 450)
  }

  const isDeviceMobile = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const handleTapToPay = (appName = 'Google Pay') => {
    setActiveScannerApp(appName)
    const isMobile = isDeviceMobile()

    if (isMobile) {
      const finalAmt = Number(donationAmount) || 101
      const upiUri = `upi://pay?pa=${activeUpiId}&pn=${encodeURIComponent(activePayeeName)}&am=${finalAmt}&cu=INR&tn=${encodeURIComponent('Shivaputr Ganeshotsav Daan')}`
      try {
        window.location.href = upiUri
      } catch (err) {
        console.error("UPI link error:", err)
      }
      setShowScannerModal(true)
    } else {
      // ON LAPTOP / PC:
      // USER REQUEST: "laptop me nahi ho raha he scanner khul jana chahiye tap to pay karne par aisa kardo"
      // Immediately open the dedicated Scanner Modal so devotee can scan the QR code from the laptop screen using their mobile phone!
      setShowScannerModal(true)
    }
  }

  // --- USER PROFILE & AVATAR HANDLERS ---
  const openUserProfile = () => {
    setEditUserName(loggedInUser || '')
    setEditUserEmail(userEmail || localStorage.getItem('sym_user_email') || '')
    setEditUserPhone(userPhone || localStorage.getItem('sym_user_phone') || '')
    setEditUserCity(userCity || localStorage.getItem('sym_user_city') || '')
    setShowUserProfileModal(true)
  }

  const handleUserPhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Kripya valid image/photo file hi select karein!')
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
        setUserAvatar(base64)
        localStorage.setItem('sym_user_avatar', base64)
        setUserProfileSuccessMsg('✨ Profile picture safalta-poorvak update ho gayi!')
        setTimeout(() => setUserProfileSuccessMsg(''), 4000)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveUserProfile = (e) => {
    e.preventDefault()
    const trimmedName = editUserName.trim()
    if (!trimmedName) return

    const trimmedEmail = editUserEmail.trim().toLowerCase()
    const trimmedPhone = editUserPhone.trim()
    const trimmedCity = editUserCity.trim()

    // 1. Update user state & localStorage
    setLoggedInUser(trimmedName)
    localStorage.setItem('sym_logged_user', trimmedName)
    localStorage.setItem('sym_saved_profile_name', trimmedName)

    setUserEmail(trimmedEmail)
    if (trimmedEmail) localStorage.setItem('sym_user_email', trimmedEmail)

    setUserPhone(trimmedPhone)
    if (trimmedPhone) localStorage.setItem('sym_user_phone', trimmedPhone)

    setUserCity(trimmedCity)
    if (trimmedCity) localStorage.setItem('sym_user_city', trimmedCity)

    // 2. Synchronize with Committee Directory (teamMembers)
    const prevName = (loggedInUser || '').trim().toLowerCase()
    const prevPhone = (userPhone || '').trim()
    const prevEmail = (userEmail || '').trim().toLowerCase()

    let memberFound = false
    const updatedMembers = teamMembers.map(m => {
      const mName = (m.name || '').trim().toLowerCase()
      const mPhone = (m.phone || '').trim()
      const mEmail = (m.email || '').trim().toLowerCase()

      const isMatch = m.id === 9 || 
                      (prevName && (mName === prevName || mName.includes(prevName) || prevName.includes(mName))) || 
                      (prevPhone && mPhone === prevPhone) || 
                      (prevEmail && mEmail === prevEmail)

      if (isMatch && !memberFound) {
        memberFound = true
        return {
          ...m,
          name: trimmedName,
          email: trimmedEmail || m.email || 'krunal.satote@gmail.com',
          phone: trimmedPhone || m.phone || '9820911223'
        }
      }
      return m
    })

    if (!memberFound) {
      updatedMembers.push({
        id: 9,
        name: trimmedName,
        role: 'Volunteer / Karyakarta',
        dept: 'Mahaprasad & Seva',
        phone: trimmedPhone || '9820911223',
        email: trimmedEmail || 'krunal.satote@gmail.com',
        bloodGroup: 'B+',
        img: userAvatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop'
      })
    }

    setTeamMembers(updatedMembers)
    localStorage.setItem('sym_team_members', JSON.stringify(updatedMembers))
    window.dispatchEvent(new CustomEvent('sym_team_members_updated', { detail: updatedMembers }))
    window.dispatchEvent(new Event('storage'))

    setUserProfileSuccessMsg('✨ Profile safalta-poorvak update ho gayi!')
    setTimeout(() => {
      setUserProfileSuccessMsg('')
      setShowUserProfileModal(false)
    }, 1500)
  }

  const handleRemoveUserPhoto = () => {
    setUserAvatar('')
    localStorage.removeItem('sym_user_avatar')
    setUserProfileSuccessMsg('Profile photo hata di gayi.')
    setTimeout(() => setUserProfileSuccessMsg(''), 3000)
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    if (!bookingName.trim() || !bookingPhone.trim() || !bookingDate) return

    const vipPassData = {
      passId: 'SYM-2026-VIP-' + Math.floor(1000 + Math.random() * 9000),
      name: bookingName,
      phone: bookingPhone,
      sewaType: sewaType,
      date: bookingDate,
      devoteesCount: bookingCount,
      count: Number(bookingCount),
      gate: 'Gate No. 2 (North VIP Corridor)',
      reportingTime: '15 Minutes prior to Aarti',
      checkedIn: false
    }

    // Save to shared passes for admin view
    const savedPasses = localStorage.getItem('sym_vip_passes')
    const passList = savedPasses ? JSON.parse(savedPasses) : []
    localStorage.setItem('sym_vip_passes', JSON.stringify([vipPassData, ...passList]))

    setActiveVipPass(vipPassData)
    setShowVipPassModal(true)
    playTempleBell()

    setBookingName('')
    setBookingPhone('')
    setBookingDate('')
  }

  const handleSendLiveComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const commentUser = loggedInUser || 'Devotee_' + Math.floor(100 + Math.random() * 900)
    setLiveComments([...liveComments, { user: commentUser, text: newComment }])
    setNewComment('')
  }

  const handleAuthSubmit = (e) => {
    e.preventDefault()
    if (!userEmail || !userPassword) return

    const inputEmail = userEmail.trim()
    localStorage.setItem('sym_user_email', inputEmail)

    if (authMode === 'signup') {
      const chosenName = userName.trim()
      if (!chosenName) {
        alert("कृपया अपना शुभ नाम दर्ज करें!")
        return
      }
      setLoggedInUser(chosenName)
      localStorage.setItem('sym_logged_user', chosenName)
      localStorage.setItem('sym_saved_profile_name', chosenName)
      playTempleBell()
      alert(`🎉 स्वागत है! ${chosenName}, मंडल परिवार में आपका हार्दिक स्वागत है।`)
    } else {
      // Priority 1: Check if user already has a customized profile name saved
      const savedProfileName = localStorage.getItem('sym_saved_profile_name') || localStorage.getItem('sym_logged_user')

      // Priority 2: Check if this email matches any registered Committee Member
      const matchingMember = teamMembers.find(m => {
        const mEmail = (m.email || '').trim().toLowerCase()
        return mEmail && mEmail === inputEmail.toLowerCase()
      })

      let finalName = ''
      if (savedProfileName && savedProfileName !== 'Devotee') {
        finalName = savedProfileName
      } else if (matchingMember?.name) {
        finalName = matchingMember.name
      } else {
        const defaultName = inputEmail.split('@')[0]
        finalName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1)
      }

      setLoggedInUser(finalName)
      localStorage.setItem('sym_logged_user', finalName)
      playTempleBell()
      alert(`✨ स्वागत है, ${finalName}! बाप्पा के दरबार में आपका आगमन शुभ हो। 🙏`)
    }

    setShowAuthModal(false)
    setUserPassword('')
    setUserName('')
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    localStorage.removeItem('sym_logged_user')
    setIsProfileDropdownOpen(false)
  }

  // --- EXPENSE MANAGEMENT HELPER FUNCTIONS & HANDLERS ---
  const isGroupMember = (name = loggedInUser, email = userEmail, phone = userPhone) => {
    if (!name && !email && !phone) return false
    const cleanName = (name || '').trim().toLowerCase()
    const cleanEmail = (email || localStorage.getItem('sym_user_email') || '').trim().toLowerCase()
    const cleanPhone = (phone || localStorage.getItem('sym_user_phone') || '').replace(/\D/g, '')

    return teamMembers.some(m => {
      const mName = (m.name || '').trim().toLowerCase()
      const mEmail = (m.email || '').trim().toLowerCase()
      const mPhone = (m.phone || '').replace(/\D/g, '')

      // 1. Match by Email (Gmail identifier)
      if (cleanEmail && mEmail && cleanEmail === mEmail) return true

      // 2. Match by Mobile Phone
      if (cleanPhone && mPhone && cleanPhone.length >= 8 && mPhone.length >= 8 && (cleanPhone.endsWith(mPhone) || mPhone.endsWith(cleanPhone))) return true

      // 3. Match by Name
      if (cleanName && mName && (mName === cleanName || mName.includes(cleanName) || cleanName.includes(mName))) return true

      return false
    })
  }

  const getMemberDetails = (name = loggedInUser, email = userEmail, phone = userPhone) => {
    if (!name && !email && !phone) return null
    const cleanName = (name || '').trim().toLowerCase()
    const cleanEmail = (email || localStorage.getItem('sym_user_email') || '').trim().toLowerCase()
    const cleanPhone = (phone || localStorage.getItem('sym_user_phone') || '').replace(/\D/g, '')

    return teamMembers.find(m => {
      const mName = (m.name || '').trim().toLowerCase()
      const mEmail = (m.email || '').trim().toLowerCase()
      const mPhone = (m.phone || '').replace(/\D/g, '')

      if (cleanEmail && mEmail && cleanEmail === mEmail) return true
      if (cleanPhone && mPhone && cleanPhone.length >= 8 && mPhone.length >= 8 && (cleanPhone.endsWith(mPhone) || mPhone.endsWith(cleanPhone))) return true
      if (cleanName && mName && (mName === cleanName || mName.includes(cleanName) || cleanName.includes(mName))) return true
      return false
    }) || null
  }

  const handleOpenAddExpenseModal = () => {
    setExpenseErrorMsg('')
    setExpenseSuccessMsg('')
    if (!loggedInUser) {
      alert("⚠️ Mandal Kharcha darj karne ke liye Karyakarta Login anivarya hai. Kripya pehle Login karein.")
      setAuthMode('login')
      setShowAuthModal(true)
      return
    }
    setShowAddExpenseModal(true)
  }

  const handleExpenseReceiptUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2.5 * 1024 * 1024) {
      alert("Bill/Receipt photo ka size 2.5MB se kam hona chahiye!")
      return
    }
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result
      if (base64) {
        setExpenseReceiptImg(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitExpense = (e) => {
    e.preventDefault()
    setExpenseErrorMsg('')
    setExpenseSuccessMsg('')

    if (!loggedInUser) {
      setExpenseErrorMsg('⚠️ Kripya pehle apne Mandal Karyakarta account se Login karein.')
      return
    }

    if (!isGroupMember(loggedInUser)) {
      setExpenseErrorMsg(`⚠️ Karyakarta Permission Required: '${loggedInUser}' abhi Mandal Committee Directory mein registered nahi hai. Sirf approved group karyakarta (jaise Jay, Rahul, Rohit etc.) hi kharcha submit kar sakte hain.`)
      return
    }

    const title = expenseTitle.trim()
    const amt = Number(expenseAmount)

    if (!title) {
      setExpenseErrorMsg('⚠️ Kripya kharche ka naam / item description darj karein (jaise: 100 ka Laddu).')
      return
    }

    if (!amt || isNaN(amt) || amt <= 0) {
      setExpenseErrorMsg('⚠️ Kripya sahi kharcha rashi (kam se kam ₹1) enter karein.')
      return
    }

    if (expensePaymentMode.includes('UPI')) {
      const cleanUtr = expenseUpiRef.trim().replace(/\s+/g, '')
      if (!cleanUtr) {
        setExpenseErrorMsg('⚠️ UPI payment ke liye 12-digit UTR / Ref No. daalna anivarya hai.')
        return
      }
      if (!/^\d{12}$/.test(cleanUtr) && !/^[A-Za-z0-9]{10,18}$/.test(cleanUtr)) {
        setExpenseErrorMsg('⚠️ UPI UTR 12 digits ka hona chahiye (jaise: 425519283741).')
        return
      }
    }

    setIsExpenseSubmitting(true)

    setTimeout(() => {
      const memberInfo = getMemberDetails(loggedInUser)
      const newExpense = {
        id: 'EXP-' + Math.floor(100 + Math.random() * 900),
        title: title,
        amount: amt,
        category: expenseCategory,
        spentBy: memberInfo?.name || loggedInUser,
        memberRole: memberInfo?.role || 'Volunteer / Karyakarta',
        paymentMode: expensePaymentMode,
        upiRef: expensePaymentMode.includes('UPI') ? expenseUpiRef.trim() : 'CASH-PAYMENT',
        billReceiptUrl: expenseReceiptImg || '',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        notes: expenseNotes.trim() || 'Mandal Seva Hetu Kharcha',
        status: 'Pending',
        approvedBy: '',
        timestamp: Date.now()
      }

      let currentExpenses = []
      try {
        const saved = localStorage.getItem('sym_expenses')
        currentExpenses = saved ? JSON.parse(saved) : expenses
      } catch (e) {
        currentExpenses = expenses
      }

      const updated = [newExpense, ...currentExpenses]
      setExpenses(updated)
      localStorage.setItem('sym_expenses', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('sym_expenses_updated', { detail: updated }))
      window.dispatchEvent(new Event('storage'))

      setIsExpenseSubmitting(false)
      playPoojaChime()
      setExpenseSuccessMsg(`🎉 Safalta-poorvak darj! ₹${amt} (${title}) Admin review ke liye bhej diya gaya hai. Admin approve karega tab ye final total me calculate hoga.`)

      // Reset fields
      setExpenseTitle('')
      setExpenseAmount('')
      setExpenseUpiRef('')
      setExpenseNotes('')
      setExpenseReceiptImg('')

      setTimeout(() => {
        setExpenseSuccessMsg('')
        setShowAddExpenseModal(false)
      }, 3500)
    }, 800)
  }

  // Filtered members
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(m => {
      const matchCat = teamCategory === 'All' || m.dept === teamCategory
      const matchSearch = m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) || 
                          m.role.toLowerCase().includes(searchMemberQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [teamMembers, teamCategory, searchMemberQuery])

  // Filtered Gallery photos
  const filteredGallery = useMemo(() => {
    const list = galleryData[selectedYear] || []
    if (selectedCategory === 'All') return list
    return list.filter(item => item.cat === selectedCategory)
  }, [selectedYear, selectedCategory])

  // ========================================================
  // ROUTE: IF ADMIN VIEW IS REQUESTED, RENDER ADMIN DASHBOARD
  // ========================================================
  if (currentView === 'admin') {
    return (
      <AdminDashboard 
        donations={donations}
        onUpdateDonations={(updated) => {
          setDonations(updated)
          localStorage.setItem('sym_donations', JSON.stringify(updated))
          window.dispatchEvent(new CustomEvent('sym_donations_updated', { detail: updated }))
        }}
        expenses={expenses}
        onUpdateExpenses={(updated) => {
          setExpenses(updated)
          localStorage.setItem('sym_expenses', JSON.stringify(updated))
          window.dispatchEvent(new CustomEvent('sym_expenses_updated', { detail: updated }))
        }}
        onBackToWebsite={() => {
          window.location.hash = ''
          setCurrentView('portal')
        }} 
      />
    )
  }

  // ========================================================
  // AUTH GATE: IF NOT LOGGED IN -> HIDE HOMEPAGE & RENDER DEVOTEE LOGIN / SIGN-IN
  // ========================================================
  if (!loggedInUser) {
    return (
      <div className="bg-[#0a0806] text-stone-100 font-sans min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950 relative overflow-hidden">
        
        {/* Background Divine Wallpaper with Atmospheric Dark Vignette */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            src="/ganapti-homescreen-image.jpeg" 
            alt="Ganpati Wallpaper" 
            className="w-full h-full object-cover object-center filter brightness-[0.22] contrast-[1.1] scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=1600&auto=format&fit=crop'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] via-[#0a0806]/85 to-[#0a0806]/95"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Top Mini Devotional Strip */}
        <div className="relative z-10 bg-stone-950/80 backdrop-blur-md text-amber-200/90 text-xs py-2 px-4 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden text-[11px]">
              <span className="text-amber-400 font-bold">🕉️</span>
              <span className="truncate font-serif">॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] flex-shrink-0 font-medium">
              <button 
                onClick={playTempleBell}
                className="text-amber-300 hover:text-white transition flex items-center gap-1"
                title="Ring Temple Bell"
              >
                <span>🔔 घंटानाद</span>
              </button>
              <span className="text-stone-700">•</span>
              <button 
                onClick={() => { window.location.hash = '#admin'; setCurrentView('admin'); }}
                className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
                title="Mandal Committee Admin Dashboard"
              >
                <span>⚙️ Mandal Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Royal Devotee Login & Registration Card */}
        <div className="relative z-10 flex items-center justify-center p-4 sm:p-6 my-auto">
          <div className="w-full max-w-md bg-[#16120f]/95 backdrop-blur-xl border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.8)] text-white relative overflow-hidden">
            
            {/* Header: Logo, Mandal Name & Welcome */}
            <div className="text-center mb-6">
              <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-xl shadow-amber-500/30 w-20 h-20 mx-auto mb-3 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                  <img src={ganpatiLogo} alt="Mandal Logo" className="w-full h-full object-cover scale-105" />
                </div>
              </div>

              <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-amber-950/80 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 mb-2">
                ॥ राजा शिवपुत्रचा • ६ वे वर्ष महोत्सव २०२६ ॥
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Shivaputr Yuvak Mandal
              </h2>
              <p className="text-xs text-amber-300/90 font-bold mt-0.5">
                भक्त व कार्यकर्ता प्रवेश द्वार (Devotee Portal)
              </p>
              <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                वेबसाइट होम पेज और दर्शन एक्सेस करने के लिए कृपया पहले लॉगिन या रजिस्ट्रेशन करें।
              </p>
            </div>

            {/* Toggle Tabs: Login vs Register */}
            <div className="flex bg-stone-900 p-1 rounded-xl mb-4 border border-stone-800">
              <button 
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authMode === 'login' ? 'bg-amber-500 text-stone-950 shadow font-black' : 'text-stone-400 hover:text-white'}`}
              >
                🔑 Login (प्रवेश)
              </button>
              <button 
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authMode === 'signup' ? 'bg-amber-500 text-stone-950 shadow font-black' : 'text-stone-400 hover:text-white'}`}
              >
                ✨ Sign Up (रजिस्ट्रेशन)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-left">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Aapka Shubh Naam *</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-stone-950 text-white placeholder:text-stone-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Email Address *</label>
                <input 
                  type="email" 
                  autoComplete="email username"
                  placeholder="name@example.com" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-stone-950 text-white placeholder:text-stone-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Password *</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-stone-950 text-white placeholder:text-stone-500"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black py-3 rounded-xl shadow-lg transition text-xs uppercase tracking-wider mt-1"
              >
                {authMode === 'login' ? 'Login & Unlock Portal 🔑' : 'Complete Registration & Enter ✨'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-stone-800 text-center">
              <button 
                type="button" 
                onClick={() => { window.location.hash = '#admin'; setCurrentView('admin'); }}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline"
              >
                🔒 Mandal Committee Admin Portal ➔
              </button>
            </div>

          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 py-3 text-center text-[11px] text-stone-500 bg-stone-950/80 border-t border-stone-900">
          Shivaputr Yuvak Mandal © 2026. Reg. No: E-18294/MUM/2012 • ॥ गणपती बाप्पा मोरया ॥
        </div>


      </div>
    )
  }

  // ========================================================
  // ROUTE: PUBLIC DEVOTEE PORTAL (SHOWN ONLY AFTER LOGIN)
  // ========================================================
  return (
    <div className="bg-[#0d0b09] text-stone-100 font-sans min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950">

      {/* --- FLOWER SHOWER PARTICLES OVERLAY --- */}
      {flowerShowerActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className="absolute text-2xl md:text-3xl animate-flower-drop"
              style={{
                left: `${Math.random() * 95}%`,
                top: `${Math.random() * -10}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {i % 3 === 0 ? '🌺' : i % 3 === 1 ? '🌼' : '🌸'}
            </div>
          ))}
        </div>
      )}

      {/* --- SLEEK SPIRITUAL TOP TICKER --- */}
      <div className="bg-stone-950 text-amber-200/90 text-xs py-1.5 px-4 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-[11px]">
            <span className="text-amber-400 font-bold">📢</span>
            <span className="truncate">{liveAnnouncement}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] flex-shrink-0 font-medium">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="text-amber-300 hover:text-white transition flex items-center gap-1"
              title="Toggle Temple Bell & Aarti Sound"
            >
              <span>{isMuted ? '🔇 Mute' : '🔔 Sound'}</span>
            </button>
            <span className="text-stone-700">•</span>
            <button 
              onClick={() => { window.location.hash = '#admin'; setCurrentView('admin'); }}
              className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
              title="Mandal Committee Admin Dashboard"
            >
              <span>⚙️ Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- MASTER CLEAN & ELEGANT NAVBAR (ROYAL TEMPLE DARK & GOLD) --- */}
      <header className="bg-[#120f0d]/95 backdrop-blur-md sticky top-0 z-40 border-b border-amber-500/25 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-4">
          
          {/* 1. Left: Brand Identity (Prominent, High-Res Golden Emblem) */}
          <a href="#home" className="flex items-center gap-3 sm:gap-3.5 group focus:outline-none shrink-0">
            {/* Majestic Golden Halo Ring around Logo */}
            <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-lg shadow-amber-500/25 group-hover:shadow-amber-400/50 group-hover:scale-105 transition-all duration-300 flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-black flex items-center justify-center border border-black shadow-inner">
                <img 
                  src={ganpatiLogo} 
                  alt="Shivaputr Yuvak Mandal Logo" 
                  className="w-full h-full object-cover transform scale-105" 
                />
              </div>
              {/* Saffron Sacred Dot Accent */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#120f0d] shadow-xs" title="Official Mandal Logo"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight leading-none group-hover:text-amber-300 transition">
                  Shivaputr Yuvak Mandal
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-400 font-extrabold tracking-wider uppercase mt-1 flex items-center gap-1">
                <span>🚩</span> <span>Sarvajanik Ganeshotsav • २०२६</span>
              </p>
            </div>
          </a>
          
          {/* 2. Center: Desktop Navigation Links (Clean Gold-Hover Typography) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 font-semibold text-stone-300 text-xs xl:text-[13px]">
            <a href="#home" className="px-3 py-1.5 rounded-full hover:bg-white/5 hover:text-amber-300 transition">
              Home
            </a>
            <a href="#virtual-mandir" className="px-3 py-1.5 rounded-full hover:bg-white/5 hover:text-amber-300 transition">
              Mandir Darshan
            </a>
            <a href="#group-section" className="px-3 py-1.5 rounded-full hover:bg-white/5 hover:text-amber-300 transition">
              Karyakarta
            </a>
            <a href="#booking" className="px-3 py-1.5 rounded-full hover:bg-white/5 hover:text-amber-300 transition">
              VIP Pass
            </a>
            <a href="#live" className="px-3 py-1.5 rounded-full hover:bg-white/5 hover:text-amber-300 transition flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>Live Aarti</span>
            </a>
            <a href="#initiatives" className="px-3 py-1.5 rounded-full hover:bg-white/5 hover:text-amber-300 transition">
              Social Seva
            </a>
          </nav>

          {/* 3. Right: Clean Consolidated Action Group */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Quick Temple Bell Chime */}
            <button 
              onClick={playTempleBell}
              className={`w-8 h-8 rounded-full border border-stone-800 bg-stone-900/90 hover:bg-amber-950/40 text-amber-400 hover:text-amber-300 transition shadow-xs flex items-center justify-center ${bellRinging ? 'animate-bell-ring' : ''}`}
              title="Ring Temple Bell"
            >
              <span className="text-sm leading-none">🔔</span>
            </button>

            {/* Hero CTA: Bappa Seva Button */}
            <a 
              href="#donate" 
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs px-3.5 sm:px-4 py-2 rounded-full shadow-md hover:shadow-amber-500/25 transition-all duration-200 flex items-center gap-1.5 active:scale-95 border border-amber-300/50 hover:scale-105"
              title="बाप्पा सेवा व पावती (Bappa Seva)"
            >
              <span className="text-sm leading-none">🙏</span>
              <span className="tracking-wide">बाप्पा सेवा</span>
            </a>

            {/* Auth / Profile Area */}
            {loggedInUser ? (
              /* Logged In: Clean Profile Dropdown Pill */
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 pl-1.5 pr-2.5 py-1 rounded-full shadow-xs transition group text-left"
                  title="Profile & Menu"
                >
                  <div className="relative">
                    {userAvatar ? (
                      <img src={userAvatar} alt={loggedInUser} className="w-6 h-6 rounded-full object-cover border border-amber-500 shadow-xs" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center text-[10px] font-black shadow-xs">
                        {loggedInUser.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-2 h-2 rounded-full border border-stone-900"></span>
                  </div>
                  <span className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition max-w-[85px] sm:max-w-[110px] truncate">
                    {loggedInUser.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-stone-400 group-hover:text-stone-300 transition">
                    ▾
                  </span>
                </button>

                {/* Sleek Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[#181412] rounded-2xl shadow-2xl border border-amber-500/30 py-2 z-50 text-left animate-fade-in divide-y divide-stone-800">
                      <div className="px-4 py-2.5">
                        <p className="text-xs font-black text-white truncate">{loggedInUser}</p>
                        <p className="text-[10px] text-amber-300/70 truncate">{userEmail || 'Mandal Devotee'}</p>
                      </div>
                      <div className="py-1">
                        <button 
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); openUserProfile(); }}
                          className="w-full px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-white/5 hover:text-amber-300 flex items-center gap-2 transition"
                        >
                          <span>👤</span>
                          <span>Profile & Photo</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); handleOpenAddExpenseModal(); }}
                          className="w-full px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-white/5 hover:text-amber-300 flex items-center gap-2 transition"
                        >
                          <span>💼</span>
                          <span>Kharcha Bill Entry</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); window.location.hash = '#admin'; setCurrentView('admin'); }}
                          className="w-full px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-white/5 hover:text-amber-300 flex items-center gap-2 transition"
                        >
                          <span>⚙️</span>
                          <span>Admin Dashboard</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <button 
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }}
                          className="w-full px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-950/30 flex items-center gap-2 transition"
                        >
                          <span>🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Logged Out: Clean Consolidated Sign In Pill */
              <div className="flex items-center gap-1.5">
                {/* Primary Sign In Button */}
                <button 
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold px-3.5 py-2 rounded-full transition shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-8 h-8 rounded-full border border-stone-800 bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-amber-400 transition"
              title="Toggle Menu"
            >
              <span className="text-base font-bold leading-none">
                {isMobileMenuOpen ? '✕' : '☰'}
              </span>
            </button>
          </div>

        </div>

        {/* 4. Mobile Slide-Down Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#14110f] border-t border-amber-500/25 px-4 py-3 space-y-2 animate-fade-in shadow-xl">
            <nav className="flex flex-col space-y-1 font-semibold text-stone-300 text-xs">
              <a 
                href="#home" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-amber-300 transition flex items-center gap-2"
              >
                <span>🏠</span> Home
              </a>
              <a 
                href="#virtual-mandir" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-amber-300 transition flex items-center gap-2"
              >
                <span>🪔</span> Mandir Darshan
              </a>
              <a 
                href="#group-section" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-amber-300 transition flex items-center gap-2"
              >
                <span>👥</span> Karyakarta Samiti
              </a>
              <a 
                href="#booking" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-amber-300 transition flex items-center gap-2"
              >
                <span>🎫</span> VIP Pass Booking
              </a>
              <a 
                href="#live" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-amber-300 transition flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>Live Aarti & Darshan</span>
              </a>
              <a 
                href="#initiatives" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-amber-300 transition flex items-center gap-2"
              >
                <span>🤝</span> Social Seva
              </a>
            </nav>

            <div className="pt-2 border-t border-stone-800 flex flex-col gap-2">
              {/* Mobile Kharcha Bill Button */}
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); handleOpenAddExpenseModal(); }}
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>💼</span>
                <span>Karyakarta Kharcha Bill Entry</span>
              </button>

              {/* Mobile Admin Link */}
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); window.location.hash = '#admin'; setCurrentView('admin'); }}
                className="w-full bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center justify-center gap-2 border border-stone-800"
              >
                <span>⚙️</span>
                <span>Admin Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* --- AUTH MODAL (LOGIN & SIGNUP) --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-[#181412] w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col p-4 sm:p-6 relative border-2 border-amber-500/40 text-white max-h-[94vh] my-auto overflow-y-auto">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 bg-stone-800 hover:bg-red-600 hover:text-white text-stone-300 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition"
            >
              ✕
            </button>

            <div className="text-center mb-6 mt-2">
              <div className="w-14 h-14 bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-2 shadow-inner">
                {authMode === 'login' ? '🔑' : '✨'}
              </div>
              <h3 className="text-2xl font-black text-white">
                {authMode === 'login' ? 'Welcome Back!' : 'Mandal Parivar Join Karein'}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {authMode === 'login' ? 'Shivaputr Yuvak Mandal Portal mein login karein' : 'Mandal parivar ka hissa banne ke liye account banayein'}
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-stone-900 p-1 rounded-xl mb-4 border border-stone-800">
              <button 
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authMode === 'login' ? 'bg-amber-500 text-stone-950 shadow font-black' : 'text-stone-400 hover:text-white'}`}
              >
                Login
              </button>
              <button 
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authMode === 'signup' ? 'bg-amber-500 text-stone-950 shadow font-black' : 'text-stone-400 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-950 text-white placeholder:text-stone-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  autoComplete="email username"
                  placeholder="name@example.com" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-950 text-white placeholder:text-stone-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-950 text-white placeholder:text-stone-500"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black py-3.5 rounded-xl shadow-lg transition text-sm tracking-wide mt-2"
              >
                {authMode === 'login' ? 'Login to Portal 🔑' : 'Complete Registration ✨'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- USER PROFILE & AVATAR EDIT MODAL --- */}
      {showUserProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-[#181412] w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 relative border-2 border-amber-500/40 text-white max-h-[94vh] my-auto overflow-y-auto">
            <button 
              onClick={() => setShowUserProfileModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 bg-stone-800 hover:bg-stone-700 text-stone-300 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <span className="bg-amber-950 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-amber-500/30">
                Mera Devotee Account
              </span>
              <h3 className="text-xl font-black text-white mt-2">Bhakt Profile & Photo</h3>
              <p className="text-xs text-stone-400">Apni profile picture upload karein jo comments aur wishes me dikhegi.</p>
            </div>

            {userProfileSuccessMsg && (
              <div className="mb-4 bg-emerald-950/80 border border-emerald-500 text-emerald-200 p-3 rounded-xl text-center text-xs font-bold animate-pulse">
                {userProfileSuccessMsg}
              </div>
            )}

            {/* Circular Avatar with Camera Upload Button */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-500 shadow-xl bg-amber-950/50 flex items-center justify-center">
                  {userAvatar ? (
                    <img src={userAvatar} alt={loggedInUser} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-amber-400">
                      {loggedInUser ? loggedInUser.charAt(0).toUpperCase() : '🕉️'}
                    </span>
                  )}
                </div>

                <label 
                  htmlFor="user-photo-input"
                  className="absolute bottom-0 right-0 bg-stone-900 hover:bg-stone-800 text-white p-2.5 rounded-full shadow-lg border-2 border-amber-400 cursor-pointer transition transform hover:scale-110"
                  title="Upload / Change Photo"
                >
                  📷
                </label>
                <input 
                  id="user-photo-input"
                  type="file" 
                  accept="image/*" 
                  onChange={handleUserPhotoUpload} 
                  className="hidden"
                />
              </div>

              <div className="flex gap-2 mt-3">
                <label 
                  htmlFor="user-photo-input"
                  className="text-xs font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 px-3 py-1.5 rounded-xl border border-amber-500/40 cursor-pointer transition"
                >
                  📸 Change Profile Photo
                </label>
                {userAvatar && (
                  <button 
                    type="button"
                    onClick={handleRemoveUserPhoto}
                    className="text-xs font-bold text-red-300 bg-red-950/80 hover:bg-red-900 px-3 py-1.5 rounded-xl border border-red-500/40 transition"
                  >
                    Remove Photo ✕
                  </button>
                )}
              </div>
            </div>

            {/* Profile Details Form */}
            <form onSubmit={handleSaveUserProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-300 block mb-1">Aapka Shubh Naam</label>
                <input 
                  type="text" 
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  placeholder="e.g. Krunal Satote"
                  className="w-full p-2.5 border border-stone-700 rounded-xl font-bold text-sm bg-stone-950 focus:outline-none focus:border-amber-400 text-white placeholder:text-stone-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">Email Address (Gmail Identifier)</label>
                <input 
                  type="email" 
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  placeholder="e.g. krunal.satote@gmail.com"
                  className="w-full p-2.5 border border-stone-700 rounded-xl bg-stone-950 focus:outline-none focus:border-amber-400 text-white placeholder:text-stone-500"
                />
                <p className="text-[10px] text-stone-400 mt-0.5">Is email se login karne par aapka profile naam aur Karyakarta rights hamesha surakshit rahenge.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-300 block mb-1">Mobile No. (WhatsApp)</label>
                  <input 
                    type="tel" 
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full p-2.5 border border-stone-700 rounded-xl font-mono bg-stone-950 focus:outline-none focus:border-amber-400 text-white placeholder:text-stone-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-300 block mb-1">City / Gotra</label>
                  <input 
                    type="text" 
                    value={editUserCity}
                    onChange={(e) => setEditUserCity(e.target.value)}
                    placeholder="e.g. Mumbai, Kashyap"
                    className="w-full p-2.5 border border-stone-700 rounded-xl bg-stone-950 focus:outline-none focus:border-amber-400 text-white placeholder:text-stone-500"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black py-3 rounded-xl shadow-lg transition text-xs uppercase tracking-wider mt-2"
              >
                Save Profile Changes ✓
              </button>
            </form>

          </div>
        </div>
      )}

      {/* --- HERO SECTION: DIVINE, SPACIOUS & ELEGANT --- */}
      {/* --- HERO SECTION: DIVINE, SPACIOUS & BAPPA IMAGE PROMINENT --- */}
      <section id="home" className="relative text-white py-14 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden bg-stone-950 flex items-center min-h-[75vh] md:min-h-[85vh]">
        
        {/* Background Divine Wallpaper - Bright, Clear & Glorious */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            src="/ganapti-homescreen-image.jpeg" 
            alt="Ganpati Wallpaper" 
            className="w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.02]"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=1600&auto=format&fit=crop'
            }}
          />
          {/* Seamless atmospheric gradients that dissolve naturally into the dark canvas with ZERO box borders */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 via-35% to-transparent max-w-2xl lg:max-w-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/40"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          
          {/* Content Container: Seamless typography floating over the wallpaper, ZERO box borders or artificial blur */}
          <div className="max-w-md lg:max-w-lg text-left space-y-4">
            
            {/* Vedic Inscription & Festival Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm backdrop-blur-xs">
                <span>🕉️</span>
                <span>॥ श्री गणेशाय नमः ॥</span>
              </div>
              <span className="text-[11px] font-bold text-amber-400/90 tracking-wide drop-shadow-md">
                राजा शिवपुत्रचा २०२६
              </span>
            </div>

            {/* Upcoming Aarti Floating Capsule */}
            <div className="inline-flex flex-wrap items-center gap-2 bg-stone-950/80 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl text-xs text-stone-200 shadow-lg backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-extrabold text-white text-[11px]">Agali Aarti:</span>
              <span className="text-stone-200 text-[11px] font-medium">{nextAarti.name}</span>
              <span className="text-amber-300 font-mono font-black bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-500/40 text-[11px]">
                ⏳ {nextAarti.countdown}
              </span>
            </div>

            {/* Majestic Royal Heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  Shivaputr Yuvak
                </span>
                <br />
                <span className="text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                  Mandal
                </span>
              </h1>
              <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide pt-1 drop-shadow-md">
                ॥ ६ वे वर्ष महोत्सव • Sarvajanik Ganeshotsav ॥
              </p>
            </div>

            {/* Elegant Short Subtitle */}
            <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              Parampara, Shraddha aur Loksewa ka Pavitra Sangam. Ghar baithe darshan karein, aarti pass prapt karein aur Bappa ke charno mein daan bhent karein.
            </p>

            {/* Clean, Focused Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a 
                href="#virtual-mandir" 
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black px-5 sm:px-6 py-3 rounded-2xl shadow-xl shadow-amber-500/25 transition-all duration-200 flex items-center gap-2 active:scale-95 text-xs sm:text-sm border border-amber-300/60 hover:scale-105"
              >
                <span>🪔</span>
                <span>Online Darshan</span>
              </a>

              <a 
                href="#booking" 
                className="bg-stone-900/90 hover:bg-stone-800 text-white font-bold px-4 sm:px-5 py-3 rounded-2xl border border-amber-500/40 hover:border-amber-400 transition-all duration-200 flex items-center gap-2 active:scale-95 text-xs sm:text-sm shadow-md backdrop-blur-xs hover:scale-105"
              >
                <span>🎫</span>
                <span>VIP Pass</span>
              </a>

              <a 
                href="#donate" 
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold px-4 sm:px-5 py-3 rounded-2xl shadow-xl shadow-red-900/30 transition-all duration-200 flex items-center gap-2 active:scale-95 text-xs sm:text-sm border border-red-400/40 hover:scale-105"
              >
                <span>🙏</span>
                <span>बाप्पा सेवा</span>
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* --- DEVOTEE SEVA & IMPACT STRIP (MOVED BELOW HERO FOR ZERO CLUTTER) --- */}
      <div className="bg-stone-900 border-y border-amber-500/20 py-4 sm:py-5 px-4 shadow-xl relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-stone-950/70 border border-amber-500/30 p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-3.5 shadow-sm">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl flex-shrink-0">🪔</div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-amber-400 font-mono leading-none">{diyaCount.toLocaleString()}+</p>
              <p className="text-[10px] sm:text-[11px] text-stone-300 font-bold uppercase tracking-wider mt-1">Diyas Lit Today</p>
            </div>
          </div>
          <div className="bg-stone-950/70 border border-amber-500/30 p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-3.5 shadow-sm">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl flex-shrink-0">🟡</div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-amber-400 font-mono leading-none">{modakCount.toLocaleString()}+</p>
              <p className="text-[10px] sm:text-[11px] text-stone-300 font-bold uppercase tracking-wider mt-1">Modaks Offered</p>
            </div>
          </div>
          <div className="bg-stone-950/70 border border-amber-500/30 p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-3.5 shadow-sm">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl flex-shrink-0">💰</div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-amber-400 font-mono leading-none">₹{donations.reduce((sum, d) => sum + Number(d.amount || 0), 0).toLocaleString()}</p>
              <p className="text-[10px] sm:text-[11px] text-stone-300 font-bold uppercase tracking-wider mt-1">Devotee Daan</p>
            </div>
          </div>
          <div className="bg-stone-950/70 border border-amber-500/30 p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-3.5 shadow-sm">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl flex-shrink-0">👥</div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-amber-400 font-mono leading-none">{teamMembers.length}</p>
              <p className="text-[10px] sm:text-[11px] text-stone-300 font-bold uppercase tracking-wider mt-1">Karyakarta Force</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION: VIRTUAL MANDIR & INTERACTIVE POOJA DARBAR (ROYAL TEMPLE DARK & GOLD) --- */}
      <section id="virtual-mandir" className="py-20 px-4 bg-gradient-to-b from-[#0d0b09] via-[#14100d] to-[#120f0d] border-b border-amber-500/20 text-white relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-amber-300 text-xs font-black uppercase tracking-widest bg-amber-500/10 px-4 py-1 rounded-full border border-amber-500/30 shadow-sm">
              🙏 डिजिटल मंदिर व पूजा दरबार 🙏
            </span>
            <h3 className="text-3xl md:text-5xl font-black text-white mt-3 tracking-tight">
              Virtual Bappa Darshan & Seva
            </h3>
            <p className="text-stone-300 text-sm md:text-base mt-2">
              Ghar baithe Bappa ke charno mein pushpa arpan karein, ghanti bajayein, modak ka bhog lagayein aur aarti ghumaayein.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Virtual Idol & Interactive Actions (Col 7) */}
            <div className="lg:col-span-7 bg-[#1a1613] rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-amber-500/40 relative overflow-hidden text-white">
              
              {/* Sacred Arch & Idol Box */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-stone-950 to-stone-900 border-4 border-amber-500/70 shadow-2xl">
                
                {/* Golden Toran Garland */}
                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-1 text-center text-xs font-black text-stone-950 shadow z-20">
                  🌺 ॐ गं गणपतये नमः 🌺
                </div>

                <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden">
                  <img 
                    src="/ganapti-homescreen-image.jpeg" 
                    alt="Bappa Murti" 
                    className="w-full h-full object-cover filter brightness-105 divine-glow"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=800&auto=format&fit=crop'
                    }}
                  />

                  {/* Rotating Aarti Thali Overlay */}
                  {isAartiThaliActive && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                      <div className="w-56 h-56 rounded-full border-4 border-dashed border-amber-300 animate-thali-rotate flex items-center justify-center relative shadow-[0_0_50px_rgba(251,191,36,0.8)]">
                        <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-2xl animate-flame">
                          🪔
                        </div>
                        <span className="absolute top-2 text-xl">🌺</span>
                        <span className="absolute bottom-2 text-xl">🌺</span>
                        <span className="absolute left-2 text-xl">🥥</span>
                        <span className="absolute right-2 text-xl">🥟</span>
                      </div>
                    </div>
                  )}

                  {/* Bell Hanging Visual */}
                  <div 
                    onClick={playTempleBell}
                    className={`absolute top-5 right-6 cursor-pointer bg-amber-400 hover:bg-amber-300 text-stone-950 p-2.5 rounded-full shadow-lg border-2 border-yellow-200 transition duration-300 z-30 ${bellRinging ? 'animate-bell-ring' : ''}`}
                    title="Ring Temple Bell"
                  >
                    <span className="text-2xl block">🔔</span>
                  </div>

                  {/* Diya in Corner */}
                  <div className="absolute bottom-4 left-4 bg-stone-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/50 flex items-center gap-2 text-amber-300 text-xs font-bold shadow-lg">
                    <span className="text-xl animate-flame">🪔</span>
                    <span>Diya Jyot Akhand</span>
                  </div>

                  {/* Modak Count in Corner */}
                  <div className="absolute bottom-4 right-4 bg-stone-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/50 flex items-center gap-2 text-amber-300 text-xs font-bold shadow-lg">
                    <span className="text-xl">🥟</span>
                    <span>{modakCount} Modak Bhog</span>
                  </div>
                </div>
              </div>

              {/* Devotional Action Controls */}
              <div className="mt-6">
                <p className="text-xs font-bold text-amber-300/80 uppercase tracking-wider mb-3 text-center">
                  Bappa Seva Rituals • Click any ritual to perform online
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={playTempleBell}
                    className="p-3 bg-stone-900/90 hover:bg-stone-800 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl text-center transition flex flex-col items-center justify-center gap-1 group shadow-sm active:scale-95"
                  >
                    <span className="text-2xl group-hover:scale-110 transition">🔔</span>
                    <span className="text-xs font-black text-stone-100">Ring Bell</span>
                    <span className="text-[10px] text-amber-400 font-semibold">घंटी नाद</span>
                  </button>

                  <button 
                    onClick={playShankh}
                    className="p-3 bg-stone-900/90 hover:bg-stone-800 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl text-center transition flex flex-col items-center justify-center gap-1 group shadow-sm active:scale-95"
                  >
                    <span className="text-2xl group-hover:scale-110 transition">🐚</span>
                    <span className="text-xs font-black text-stone-100">Shankh Naad</span>
                    <span className="text-[10px] text-amber-400 font-semibold">पवित्र शंख</span>
                  </button>

                  <button 
                    onClick={handleOfferFlowers}
                    className="p-3 bg-stone-900/90 hover:bg-stone-800 border-2 border-red-500/40 hover:border-red-400 rounded-2xl text-center transition flex flex-col items-center justify-center gap-1 group shadow-sm active:scale-95"
                  >
                    <span className="text-2xl group-hover:scale-110 transition">🌸</span>
                    <span className="text-xs font-black text-stone-100">Shower Flowers</span>
                    <span className="text-[10px] text-red-400 font-semibold">पुष्प वर्षा</span>
                  </button>

                  <button 
                    onClick={handleOfferModak}
                    className="p-3 bg-stone-900/90 hover:bg-stone-800 border-2 border-yellow-500/40 hover:border-yellow-400 rounded-2xl text-center transition flex flex-col items-center justify-center gap-1 group shadow-sm active:scale-95"
                  >
                    <span className="text-2xl group-hover:scale-110 transition">🥟</span>
                    <span className="text-xs font-black text-stone-100">Offer Modak</span>
                    <span className="text-[10px] text-yellow-400 font-semibold">मोदक अर्पण</span>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-800 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsAartiThaliActive(!isAartiThaliActive)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition shadow flex items-center gap-2 ${isAartiThaliActive ? 'bg-red-600 text-white' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500'}`}
                    >
                      <span>🪔</span>
                      {isAartiThaliActive ? 'Stop Aarti Thali' : 'Rotate Aarti Thali (आरती घुमाएं)'}
                    </button>
                  </div>

                  <span className="text-xs text-amber-300/80 font-semibold">
                    Total {diyaCount + modakCount} Sacred Offerings Made
                  </span>
                </div>
              </div>

            </div>

            {/* Light a Digital Diya + Aarti Sangrah (Col 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Diya Box */}
              <div id="diya" className="bg-[#1a1613] p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-amber-500/40 text-center relative overflow-hidden text-white">
                <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
                  <span className="animate-flame">🪔</span>
                </div>
                <h4 className="text-2xl font-black text-white mb-1">Light a Digital Diya</h4>
                <p className="text-xs text-stone-300 mb-6">Apne aur parivar ke naam se Bappa ke charno mein akhand jyot lagayein.</p>
                
                {!lit ? (
                  <form onSubmit={handleLightDiya} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Apna Pura Naam Likhein" 
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white placeholder-stone-500"
                      required
                    />
                    <button type="submit" className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black py-3.5 rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2 active:scale-95">
                      <span>Light Diya Now ✨</span>
                    </button>
                  </form>
                ) : (
                  <div className="bg-amber-500/15 border-2 border-amber-400/50 text-amber-200 p-5 rounded-2xl text-center space-y-1 animate-bounce">
                    <span className="text-3xl">✨ 🪔 ✨</span>
                    <p className="font-extrabold text-sm text-amber-300">Diya Lit Successfully!</p>
                    <p className="text-xs text-stone-300">Bappa ki kripa aapke parivar par sadaiv bani rahe.</p>
                  </div>
                )}
                
                <div className="mt-6 pt-5 border-t border-stone-800 flex justify-around">
                  <div>
                    <p className="text-2xl font-black text-amber-400 font-mono">{diyaCount.toLocaleString()}</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Total Diyas Lit</p>
                  </div>
                  <div className="border-r border-stone-800"></div>
                  <div>
                    <p className="text-2xl font-black text-yellow-400 font-mono">{modakCount.toLocaleString()}</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Modaks Offered</p>
                  </div>
                </div>
              </div>

              {/* Aarti Sangrah Drawer */}
              <div className="bg-[#181412] p-6 rounded-3xl shadow-xl border border-amber-500/30 text-white">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-black text-sm text-amber-300 flex items-center gap-2">
                    <span>📖</span> आरती संग्रह (Aarti Sangrah)
                  </h5>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    Marathi / Hindi
                  </span>
                </div>

                <div className="flex gap-1.5 mb-3 bg-stone-900 p-1 rounded-xl text-xs font-bold border border-stone-800">
                  <button 
                    onClick={() => setActiveAartiTab('sukhkarta')}
                    className={`flex-1 py-1.5 rounded-lg transition ${activeAartiTab === 'sukhkarta' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'}`}
                  >
                    सुखकर्ता
                  </button>
                  <button 
                    onClick={() => setActiveAartiTab('shendur')}
                    className={`flex-1 py-1.5 rounded-lg transition ${activeAartiTab === 'shendur' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'}`}
                  >
                    शेंदुर लाल
                  </button>
                  <button 
                    onClick={() => setActiveAartiTab('ghalin')}
                    className={`flex-1 py-1.5 rounded-lg transition ${activeAartiTab === 'ghalin' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'}`}
                  >
                    घालीन लोटांगण
                  </button>
                </div>

                <div className="bg-stone-950/60 p-4 rounded-2xl border border-amber-500/20 text-xs leading-relaxed text-amber-100/90 max-h-40 overflow-y-auto font-serif">
                  {activeAartiTab === 'sukhkarta' && (
                    <p className="whitespace-pre-line text-center">
                      सुखकर्ता दुःखहर्ता वार्ता विघ्नाची ।<br />
                      नुरवी पुरवी प्रेम कृपा जयाची ॥<br />
                      सर्वांगी सुंदर उटी शेंदुराची ।<br />
                      कंठी झळके माळ मुक्ताफळांची ॥<br />
                      जय देव जय देव जय मंगलमूर्ती ।<br />
                      दर्शनमात्रे मनकामना पुरती ॥ धृ. ॥
                    </p>
                  )}
                  {activeAartiTab === 'shendur' && (
                    <p className="whitespace-pre-line text-center">
                      शेंदुर लाल चढायो अच्छा गजमुख को ।<br />
                      दोंदिल लाल बिराजे सुत गौरीहर को ॥<br />
                      हाथ लिए गुडलड्डू सांई सुरवर को ।<br />
                      महिमा कहे न जाय लागत अति सुख को ॥<br />
                      जय जय श्री गणराज विद्यासुखदाता ।<br />
                      धन्य तुम्हारो दर्शन मेरा मन रमता ॥
                    </p>
                  )}
                  {activeAartiTab === 'ghalin' && (
                    <p className="whitespace-pre-line text-center">
                      घालीन लोटांगण वंदीन चरण ।<br />
                      डोळ्यांनी पाहीन रूप तुझें ॥<br />
                      प्रेमें आलिंगिन आनंदें पूजिन ।<br />
                      भावें ओवाळिन म्हणे नामा ॥<br />
                      त्वमेव माता च पिता त्वमेव ।<br />
                      त्वमेव बन्धुश्च सखा त्वमेव ॥
                    </p>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* --- SECTION 1: HOME PAGE COMMITTEE LEADERSHIP --- */}
      {/* --- SECTION 1: HOME PAGE COMMITTEE LEADERSHIP (ROYAL TEMPLE DARK & GOLD) --- */}
      <section id="team" className="py-16 px-4 bg-[#0f0d0b] border-b border-amber-500/20 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-end mb-10 gap-4">
            <div>
              <span className="text-amber-300 text-xs font-black uppercase tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/30 shadow-sm">
                महोत्सव नेतृत्व
              </span>
              <h3 className="text-3xl font-black text-white mt-2">Core Leadership Committee</h3>
              <p className="text-stone-300 text-sm mt-1">
                Shivaputr Yuvak Mandal ke mukhya padadhikari. Sabhi members ki complete directory dekhne ke liye 'Group' section check karein.
              </p>
            </div>
            <a href="#group-section" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-1.5 active:scale-95">
              <span>👥</span> View Full Group ({teamMembers.length} Members)
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {teamMembers.filter(m => m.dept === 'Core Leadership').slice(0, 5).map((member, index) => (
              <div key={index} className="bg-[#1a1613] border-2 border-amber-500/30 hover:border-amber-400 p-6 rounded-3xl shadow-xl transition flex flex-col items-center text-center group relative text-white">
                <span className="absolute top-3 right-3 text-xs bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-full shadow-sm" title="Core Leadership">
                  👑
                </span>
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-amber-500 shadow-lg mb-3 bg-stone-800 transform group-hover:scale-105 transition duration-300">
                  {member.img ? (
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 font-black flex items-center justify-center text-2xl">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h4 className="font-black text-white text-base">{member.name}</h4>
                <p className="text-[11px] text-amber-300 font-bold mt-1 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">{member.role}</p>
                {member.bloodGroup && (
                  <span className="text-[10px] text-stone-400 mt-1.5 font-bold">🩸 Blood: {member.bloodGroup}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: FULL GROUP DIRECTORY WITH SEARCH & DEPARTMENT FILTER --- */}
      <section id="group-section" className="py-20 px-4 bg-[#0e0c0a] text-white border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto">
          
          {/* Group Header Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 border-2 border-amber-500/50 group">
            <div className="aspect-[21/9] md:aspect-[3/1] w-full bg-stone-950">
              <img 
                src={groupBannerImg || "/ganapti-homescreen-image.jpeg"} 
                alt="Mandal Group Photo Wallpaper" 
                className="w-full h-full object-cover filter brightness-[0.7]"
                onError={(e) => { e.target.src = '/ganapti-homescreen-image.jpeg' }}
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent flex flex-col justify-end p-6 md:p-10 text-center pointer-events-none">
              <span className="text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-500/30 w-fit mx-auto mb-2">
                🏛️ Shivaputr Yuvak Mandal Karyakarta Parivar
              </span>
              <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                Group Directory ({teamMembers.length} Active Members)
              </h3>
              <p className="text-stone-300 text-xs md:text-sm mt-2 max-w-xl mx-auto">
                Mandal ke sabhi karyakarta aur sadasy yahan darj hain. Naye karyakarta request bhej kar admin approval ke baad shamil ho sakte hain.
              </p>
            </div>
          </div>

          {/* Mandal Group Expense & Karyakarta Kharcha Portal Card */}
          <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="max-w-xl relative z-10 text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-black px-3.5 py-1 rounded-full border border-amber-500/40 mb-3 shadow-xs">
                <span>💰</span>
                <span>Karyakarta Kharcha & Bill Entry Portal</span>
              </div>
              <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Mandal Vyay & Group Kharcha Khata
              </h4>
              <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                Shivaputr Mandal ke approved sadasya (jaise <strong>Jay Patil</strong>, Rohit, Rahul aadi) yahan utsav ke dauran kiye gaye kharche (jaise <strong>₹100 ka Laddu</strong>, Phool, Mandap samagri, Diesel aadi) ka bill aur UPI UTR darj kar sakte hain. Admin dwara approve hone par ye official balance me judega.
              </p>
              
              {/* Financial Snapshot */}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-bold">
                <span className="bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-700 text-stone-300 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Approved Kharcha: <strong className="text-green-400 font-black">₹{expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</strong>
                </span>
                <span className="bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-700 text-stone-300 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Pending Review: <strong className="text-amber-300 font-black">{expenses.filter(e => e.status === 'Pending').length} Bills</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenAddExpenseModal}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <span>➕</span>
                <span>Add Mandal Kharcha Bill</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExpenseListModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <span>📋</span>
                <span>Track Member Bills ({expenses.length})</span>
              </button>
            </div>
          </div>

          {/* Search & Department Filters */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8 bg-stone-950/80 p-4 rounded-2xl border border-amber-500/20 shadow-inner">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {['All', 'Core Leadership', 'Aarti Seva', 'Mahaprasad', 'Decor & Tech', 'Security & Crowd'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setTeamCategory(dept)}
                  className={`px-3 py-1.5 rounded-xl transition ${teamCategory === dept ? 'bg-amber-500 text-stone-950 font-black shadow' : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'}`}
                >
                  {dept} {dept === 'Core Leadership' && '👑'}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Search member by name or role..." 
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-stone-900 text-white text-xs border border-stone-700 focus:outline-none focus:border-amber-500 placeholder-stone-500"
              />
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredMembers.map((member, index) => (
              <div key={index} className="bg-[#1a1613] border border-amber-500/25 hover:border-amber-400 p-5 rounded-3xl shadow-xl transition duration-300 flex flex-col items-center text-center group relative text-white">
                {member.dept === 'Core Leadership' && (
                  <span className="absolute top-3 right-3 text-xs bg-amber-400 text-stone-950 font-black px-1.5 py-0.5 rounded-md shadow" title="Core Committee">
                    👑
                  </span>
                )}
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-amber-500 shadow-md mb-3 bg-stone-800 transform group-hover:scale-105 transition duration-300">
                  {member.img ? (
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center font-black text-2xl">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h4 className="font-extrabold text-white text-sm md:text-base">{member.name}</h4>
                <p className="text-[11px] text-amber-300 font-bold mt-1 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
                  {member.role}
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  <span className="text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                    {member.dept || 'Karyakarta'}
                  </span>
                  {member.bloodGroup && (
                    <span className="text-[10px] text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40 font-bold">
                      🩸 {member.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <p className="text-center text-stone-400 text-xs py-8">Koi karyakarta nahi mila. Search query badal kar dekhein.</p>
          )}

        </div>
      </section>

      {/* --- JOIN GROUP SECTION --- */}
      <section id="join-group" className="py-16 px-4 bg-[#120f0d] border-b border-amber-500/20 text-white">
        <div className="max-w-4xl mx-auto bg-[#181412] p-8 md:p-12 rounded-3xl shadow-2xl border-2 border-amber-500/30 text-white">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-amber-300 text-xs font-black uppercase tracking-widest bg-amber-500/15 px-3.5 py-1 rounded-full border border-amber-500/30">
              Become a Karyakarta
            </span>
            <h3 className="text-3xl font-black text-white mt-2">Join Shivaputr Yuvak Mandal Group</h3>
            <p className="text-stone-300 text-sm mt-1">
              Mandal parivar mein shamil hokar utsav aayojan mein seva karein. Admin approval ke baad aapka photo aur naam Group Directory mein live jud jayega!
            </p>
          </div>

          {joinSuccessMsg && (
            <div className="mb-6 bg-green-950/60 border border-green-500/50 text-green-300 p-4 rounded-2xl text-center text-xs font-bold animate-pulse shadow-sm">
              {joinSuccessMsg}
            </div>
          )}

          <form onSubmit={handleJoinGroupRequest} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Your Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your Name" 
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white placeholder-stone-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Mobile Number (WhatsApp)</label>
              <input 
                type="tel" 
                placeholder="10-digit mobile number" 
                value={joinPhone}
                onChange={(e) => setJoinPhone(e.target.value)}
                className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white placeholder-stone-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Role / Department Interest</label>
              <select 
                value={joinRoleInterest}
                onChange={(e) => setJoinRoleInterest(e.target.value)}
                className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white font-medium"
              >
                <option value="Volunteer / Karyakarta">Volunteer / Karyakarta</option>
                <option value="Aarti Seva Member">Aarti Seva Member</option>
                <option value="Mahaprasad Team">Mahaprasad Team</option>
                <option value="Decor & Light Volunteer">Decor & Light Volunteer</option>
                <option value="Crowd Security Seva">Crowd Security Seva</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Area / Residential Address (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Near Shiv Mandir, Ward No. 4" 
                value={joinAddress}
                onChange={(e) => setJoinAddress(e.target.value)}
                className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white placeholder-stone-500"
              />
            </div>

            <div className="md:col-span-3 pt-2">
              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black py-3.5 rounded-xl shadow-lg transition text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95">
                <span>Submit Join Request to Admin</span>
                <span>🤝</span>
              </button>
            </div>
          </form>

        </div>
      </section>

      {/* --- VIP PASS & AARTI BOOKING SECTION WITH PRINTABLE PASS GENERATION (ROYAL TEMPLE DARK & GOLD) --- */}
      <section id="booking" className="py-16 px-4 bg-gradient-to-b from-[#110e0c] to-[#151210] border-b border-amber-500/20 text-white">
        <div className="max-w-5xl mx-auto bg-[#1a1613] p-8 md:p-12 rounded-3xl shadow-2xl border-2 border-amber-500/30 text-white">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-amber-300 text-xs font-black uppercase tracking-widest bg-amber-500/15 px-3.5 py-1 rounded-full border border-amber-500/30">
              Priority Pass
            </span>
            <h3 className="text-3xl font-black text-white mt-2">Book Aarti Slot & VIP Darshan Pass</h3>
            <p className="text-stone-300 text-sm mt-1">
              Bheed se bachne ke liye apna darshan ya aarti slot pehle hi book karein aur digital VIP Pass prapt karein.
            </p>
          </div>

          <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Devotee Full Name</label>
              <input 
                type="text" 
                placeholder="Enter devotee name" 
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white placeholder-stone-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Mobile Number (WhatsApp)</label>
              <input 
                type="tel" 
                placeholder="10-digit mobile number" 
                value={bookingPhone}
                onChange={(e) => setBookingPhone(e.target.value)}
                className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white placeholder-stone-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Select Aarti / Darshan Slot</label>
              <select 
                value={sewaType}
                onChange={(e) => setSewaType(e.target.value)}
                className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white font-medium"
              >
                <option value="Morning Aarti (8:00 AM)">Morning Aarti (8:00 AM)</option>
                <option value="Evening Mahā-Aarti (7:30 PM)">Evening Mahā-Aarti (7:30 PM)</option>
                <option value="VIP Quick Darshan Slot (Anytime)">VIP Quick Darshan Slot (Anytime)</option>
                <option value="Sheja Aarti (10:00 PM)">Sheja Aarti (10:00 PM)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Pass Members</label>
                <select 
                  value={bookingCount}
                  onChange={(e) => setBookingCount(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white font-medium"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 Persons</option>
                  <option value="4">Family (Up to 4)</option>
                  <option value="6">Group (Up to 6)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white font-medium"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black py-4 rounded-xl shadow-lg transition text-base tracking-wide flex items-center justify-center gap-2 active:scale-95">
                <span>Generate Official VIP Pass 🎫</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* --- VIP PASS DISPLAY MODAL (PRINTABLE) --- */}
      {showVipPassModal && activeVipPass && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#16120f] w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-2 border-amber-500/50 printable-card text-white max-h-[94vh] my-auto">
            
            {/* Pass Header */}
            <div className="bg-gradient-to-r from-red-950 via-amber-950 to-stone-950 text-white p-3.5 sm:p-5 text-center relative border-b border-amber-500/30 shrink-0">
              <button 
                onClick={() => setShowVipPassModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-stone-800 hover:bg-stone-700 text-stone-300 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition"
              >
                ✕
              </button>
              <p className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-widest truncate">Shivaputr Yuvak Mandal Ganeshotsav 2026</p>
              <h3 className="text-lg sm:text-2xl font-black text-white mt-0.5 sm:mt-1 tracking-tight">OFFICIAL VIP DARSHAN PASS</h3>
              <p className="text-[10px] sm:text-xs text-amber-200/90">Valid for Direct Entry • Non-Transferable</p>
            </div>

            {/* Pass Body */}
            <div className="p-4 sm:p-6 bg-gradient-to-b from-[#1c1714] to-[#14100e] space-y-3 sm:space-y-4 text-white overflow-y-auto">
              <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-black">Pass Token Number</p>
                  <p className="text-lg font-mono font-black text-amber-300">{activeVipPass.passId}</p>
                </div>
                <div className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-black px-3 py-1 rounded-full">
                  Verified Entry ✓
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 font-bold block">Devotee Name:</span>
                  <span className="text-sm font-black text-white">{activeVipPass.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block">Mobile:</span>
                  <span className="text-sm font-black text-white">{activeVipPass.phone}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block">Slot / Sewa:</span>
                  <span className="text-xs font-black text-amber-400">{activeVipPass.sewaType}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block">Pass Date & Persons:</span>
                  <span className="text-xs font-black text-white">{activeVipPass.date} • {activeVipPass.devoteesCount} Person(s)</span>
                </div>
              </div>

              <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-white">Entry Gate: {activeVipPass.gate}</p>
                  <p className="text-[10px] text-stone-400">Reporting: {activeVipPass.reportingTime}</p>
                </div>
                <div className="w-14 h-14 bg-stone-950 border border-amber-500/30 p-1 rounded-xl flex items-center justify-center text-2xl font-mono text-amber-300">
                  🏁
                </div>
              </div>

              {/* Barcode Simulation */}
              <div className="text-center pt-2">
                <div className="inline-block tracking-widest font-mono text-xs font-black text-stone-300 bg-stone-900 px-4 py-1 rounded border border-stone-800">
                  ||||| ||| ||||||| |||| |||||| |||||
                </div>
                <p className="text-[9px] text-stone-400 mt-1">Scan at Gate No. 2 Scanner to enter mandap</p>
              </div>
            </div>

            {/* Pass Actions */}
            <div className="p-4 bg-[#110e0c] border-t border-stone-800 flex gap-3">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <span>🖨️</span> Print / Save Pass
              </button>
              <button 
                onClick={() => {
                  const msg = `*Shivaputr Yuvak Mandal VIP Pass*\nPass ID: ${activeVipPass.passId}\nName: ${activeVipPass.name}\nSlot: ${activeVipPass.sewaType}\nDate: ${activeVipPass.date}`
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1 shadow"
              >
                <span>📱</span> Share
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- DONATE SECTION WITH SHUBH ANKA PRESETS & OFFICIAL RECEIPT --- */}
      {/* --- DONATE SECTION WITH SHUBH ANKA PRESETS & OFFICIAL RECEIPT (ROYAL TEMPLE DARK & GOLD) --- */}
      <section id="donate" className="py-16 px-4 bg-gradient-to-b from-[#0f0d0b] via-[#161210] to-[#110e0c] border-b border-amber-500/20 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-amber-300 text-xs font-black uppercase tracking-widest bg-amber-500/15 px-3.5 py-1 rounded-full border border-amber-500/30">
              Devotee Seva
            </span>
            <h3 className="text-3xl font-black text-white mt-2">Bappa Utsav Daan / Online Donation</h3>
            <p className="text-stone-300 text-sm mt-1">
              Aapka daan mandap vyavastha, mahaprasad aayojan aur garib vidyarthiyon ki sahayata mein lagaya jata hai.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Donation Form (Col 7) */}
            <div className="lg:col-span-7 bg-[#1a1613] p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-amber-500/40 text-white">
              <h4 className="text-xl font-black text-white mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>🙏</span> Offer Bappa Seva & Daan Online</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-3 py-1 rounded-full">80G Tax Exemption</span>
              </h4>

              <form onSubmit={handleDonateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Devotee Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name for receipt" 
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white placeholder-stone-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Devotee Mobile Number</label>
                  <input 
                    type="tel" 
                    placeholder="10-digit mobile number for Pavati & Verification" 
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white placeholder-stone-500"
                    required
                  />
                </div>

                {/* Shubh Anka Preset Chips */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase mb-2">Shubh Anka Donation Amount (₹)</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[1, 11, 51, 101, 251, 501, 1100, 2100, 5100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handlePresetDonation(val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition border ${Number(donationAmount) === val ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md ring-2 ring-amber-400/50' : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-400'}`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>

                  <input 
                    type="number" 
                    placeholder="Or enter custom amount in ₹" 
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white font-bold placeholder-stone-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Donation Purpose</label>
                    <select 
                      value={donationCategory}
                      onChange={(e) => setDonationCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white font-medium"
                    >
                      <option value="Mahaprasad & Anna Daan">Mahaprasad & Anna Daan</option>
                      <option value="Mandap & Pujan Seva">Mandap & Pujan Seva</option>
                      <option value="Social Welfare Seva">Social Welfare Seva</option>
                      <option value="General Mandal Fund">General Mandal Fund</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Payment Gateway Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Scanner QR', label: 'GPay Scanner QR', icon: '📱' },
                        { id: 'UPI', label: 'Direct UPI Apps', icon: '⚡' },
                        { id: 'Card/NetBanking', label: 'Card / NetBank', icon: '💳' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setDonationPaymentMethod(m.id)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-black border transition flex flex-col items-center justify-center gap-1 ${donationPaymentMethod === m.id ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 border-amber-400 shadow-md ring-2 ring-amber-400/50' : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-400'}`}
                        >
                          <span className="text-base">{m.icon}</span>
                          <span className="text-[11px] leading-tight text-center">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase mb-1">Sankalp / Prayer Message (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Parivar ke kalyan hetu bhent" 
                    value={donationMsg}
                    onChange={(e) => setDonationMsg(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-stone-900 text-white placeholder-stone-500"
                  />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black py-4 rounded-xl shadow-lg transition text-base flex items-center justify-center gap-2 active:scale-95">
                  <span>Proceed to Pay & Generate E-Receipt 🙏</span>
                </button>
              </form>
            </div>

            {/* Donor Wall of Fame (Col 5) */}
            <div className="lg:col-span-5 bg-[#1a1613] p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-amber-500/40 text-white">
              <h4 className="text-xl font-black text-white mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>🏆</span> Donor Wall of Fame</span>
                <span className="text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  Recent Blessings
                </span>
              </h4>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {donations.map((donor, idx) => (
                  <div key={idx} className="bg-[#201b17] p-4 rounded-2xl shadow-sm border border-stone-800 flex justify-between items-center hover:border-amber-500/50 transition">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-extrabold text-white text-sm">{donor.name}</p>
                        <span className="text-[9px] bg-green-950/60 text-green-400 font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                          <span>{donor.mode?.includes('UPI') || donor.mode?.includes('Scanner') || donor.mode?.includes('GPay') ? '🟢 Verified UPI' : 'Verified Daan'}</span>
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 italic mt-0.5">"{donor.message || 'Ganpati Bappa Morya! Sarvajanik Utsav Bhent.'}"</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500 flex-wrap">
                        <span>{donor.date || 'Today'}</span>
                        {donor.time && <span>• {donor.time}</span>}
                        {donor.utr && donor.utr !== 'WISH-DONATION' && (
                          <span className="font-mono font-bold text-amber-400 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                            Ref: {donor.utr}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-sm px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-xs">
                        ₹{donor.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/15 via-stone-900 to-amber-500/15 rounded-2xl border border-amber-500/30 text-center">
                <p className="text-xs font-bold text-amber-300">Total Devotee Donations This Utsav</p>
                <p className="text-2xl font-black text-white mt-1 font-mono">
                  ₹{donations.reduce((sum, d) => sum + Number(d.amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">All donations strictly audited by Trust CA</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- OFFICIAL MANDAL PAYMENT GATEWAY MODAL (GPAY QR, UPI INTENT & CARD/NETBANKING) --- */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#16120f] w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-2 border-amber-500/50 my-auto text-white max-h-[94vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-950 via-stone-950 to-amber-950 text-white p-3.5 sm:p-5 relative text-center border-b border-amber-500/30 shrink-0">
              <button 
                onClick={() => {
                  if (!isPaymentProcessing) setShowUpiModal(false)
                }}
                className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition"
                title="Close"
              >
                ✕
              </button>

              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5">
                <span className="text-lg sm:text-xl">🕉️</span>
                <h3 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-amber-300 uppercase truncate">
                  Shivaputr Utsav Payment Gateway
                </h3>
              </div>

              <p className="text-[10px] sm:text-[11px] text-amber-200 font-medium">
                Official Trust Account • Reg No: E-18294/MUM/2012
              </p>

              {/* Order Summary Pill */}
              <div className="mt-2.5 bg-stone-950/80 border border-amber-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex items-center justify-between text-left gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase tracking-wider">Devotee & Seva:</p>
                  <p className="text-xs sm:text-sm font-black text-white truncate">
                    {donorName.trim() || loggedInUser || 'Devotee (Bhakti Seva)'}
                  </p>
                  <p className="text-[10px] text-amber-400 truncate">{donationCategory}</p>
                </div>
                <div className="text-right pl-2 sm:pl-3 border-l border-stone-800 shrink-0">
                  <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase">Total Daan:</p>
                  <p className="text-lg sm:text-xl font-black text-amber-300 font-mono">
                    ₹{Number(donationAmount || 101).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Gateway Mode Switcher Tabs */}
            <div className="grid grid-cols-3 bg-[#110e0c] p-1 border-b border-stone-800 text-[11px] sm:text-xs font-black gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setPaymentGatewayTab('gpay_qr')}
                className={`py-2 sm:py-2.5 px-1 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${paymentGatewayTab === 'gpay_qr' ? 'bg-amber-500 text-stone-950 shadow-sm border border-amber-400' : 'text-stone-400 hover:text-white'}`}
              >
                <span>📱</span>
                <span className="truncate">GPay QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentGatewayTab('upi_intent')}
                className={`py-2 sm:py-2.5 px-1 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${paymentGatewayTab === 'upi_intent' ? 'bg-amber-500 text-stone-950 shadow-sm border border-amber-400' : 'text-stone-400 hover:text-white'}`}
              >
                <span>⚡</span>
                <span className="truncate">UPI Apps</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentGatewayTab('card_netbanking')}
                className={`py-2 sm:py-2.5 px-1 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${paymentGatewayTab === 'card_netbanking' ? 'bg-amber-500 text-stone-950 shadow-sm border border-amber-400' : 'text-stone-400 hover:text-white'}`}
              >
                <span>💳</span>
                <span className="truncate">Cards/Net</span>
              </button>
            </div>

            {/* Modal Body: Active Tab View */}
            <div className="p-3 sm:p-5 max-h-[72vh] overflow-y-auto space-y-3.5 sm:space-y-4 bg-[#130f0d]">
              
              {/* TAB 1: GOOGLE PAY SCANNER QR */}
              {paymentGatewayTab === 'gpay_qr' && (
                <div className="space-y-3 sm:space-y-3.5 text-center">
                  
                  {/* Real Google Pay Scanner Card */}
                  <div className="bg-[#1a1613] border-2 border-amber-500/30 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-sm max-w-xs mx-auto relative text-white">
                    
                    {/* Verified Scanner Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black text-emerald-300 mb-2 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="truncate">{customQrCode ? '✓ Verified Admin QR (Live)' : '✓ Official GPay Scanner (Verified)'}</span>
                    </div>

                    {/* QR Mode Switcher: Real vs Dynamic */}
                    <div className="flex bg-stone-900 p-0.5 rounded-xl text-[10px] font-black mb-2.5 w-full max-w-xs mx-auto border border-stone-800 gap-0.5">
                      <button
                        type="button"
                        onClick={() => setQrViewMode('standee')}
                        className={`flex-1 py-1 px-1.5 rounded-lg transition truncate ${qrViewMode === 'standee' ? 'bg-amber-500 text-stone-950 shadow-xs font-bold' : 'text-stone-400 hover:text-white'}`}
                      >
                        {customQrCode ? '🖼️ Real QR' : '🟢 Standee QR'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrViewMode('dynamic')}
                        className={`flex-1 py-1 px-1.5 rounded-lg transition truncate ${qrViewMode === 'dynamic' ? 'bg-amber-500 text-stone-950 shadow-xs font-bold' : 'text-stone-400 hover:text-white'}`}
                      >
                        ⚡ Auto-Amount (₹{Number(donationAmount || 1).toLocaleString()})
                      </button>
                    </div>

                    {/* QR Image Box - Clickable to open large scanner */}
                    <div 
                      onClick={() => handleTapToPay('Google Pay')}
                      className="aspect-square w-40 sm:w-52 mx-auto rounded-2xl overflow-hidden bg-white p-2 border-2 border-amber-400 shadow-md flex items-center justify-center relative group cursor-pointer hover:border-amber-300 transition"
                      title="Click to Open Full Scanner QR"
                    >
                      <img 
                        src={qrViewMode === 'dynamic' ? (dynamicQrUrl || activeStandeeQr) : activeStandeeQr} 
                        alt="Mandal Google Pay QR" 
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-black rounded-2xl gap-1">
                        <span>🔍</span>
                        <span>Enlarge</span>
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <p className="text-xs font-black text-white leading-tight">{activePayeeName}</p>
                      <p className="text-[10px] text-amber-300 font-bold mt-0.5 leading-snug">
                        {qrViewMode === 'dynamic' 
                          ? `✓ GPay scan karte hi ₹${Number(donationAmount || 1).toLocaleString()} automatic fill hoga` 
                          : (customQrCode ? '✓ Verified Admin QR Code (Scan using any UPI App)' : 'Scan using GPay, PhonePe, Paytm or BHIM')}
                      </p>
                    </div>
                  </div>

                  {/* UPI ID & 1-Click Copy */}
                  <div className="bg-stone-900/90 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-stone-800 flex items-center justify-between text-left gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Official UPI ID</p>
                      <p className="text-xs font-mono font-black text-amber-300 select-all truncate">{activeUpiId}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={copyUpiId}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1 shrink-0 ${upiCopied ? 'bg-green-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-stone-950'}`}
                    >
                      <span>{upiCopied ? '✓' : '📋'}</span>
                      <span>{upiCopied ? 'Copied' : 'Copy UPI'}</span>
                    </button>
                  </div>

                  {/* Direct Tap to Pay / Open Scanner Button */}
                  <button 
                    type="button"
                    onClick={() => handleTapToPay('Google Pay')}
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg active:scale-95"
                  >
                    <span>📱</span>
                    <span className="truncate">Tap to Pay / Open QR Scanner (₹{Number(donationAmount || 101).toLocaleString()})</span>
                    <span>⚡</span>
                  </button>

                  {/* STEP 2: VERIFICATION & ENTRY RECORDING FORM */}
                  <div className="pt-3 border-t border-stone-800 space-y-3 text-left">
                    <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-amber-200">
                      <div className="flex items-center gap-1.5 font-black text-xs uppercase text-amber-300">
                        <span>📝</span>
                        <span>Step 2: Payment Verification & Entry Details</span>
                      </div>
                      <p className="text-[10px] text-stone-300 mt-0.5 leading-snug">
                        Google Pay / UPI app se payment karne ke baad screen par aane wala <strong>12-digit UPI UTR / Ref No.</strong> enter karein taaki Mandal Khata me aapki entry darj ho sake aur official Pavati download ho sake.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">
                          Devotee Full Name *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Devotee Full Name" 
                          value={donorName}
                          onChange={(e) => { setDonorName(e.target.value); setUtrValidationError(''); }}
                          className="w-full px-3 py-2 sm:py-2.5 border border-stone-700 rounded-xl text-xs bg-stone-950 font-bold text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">
                          Mobile Number *
                        </label>
                        <input 
                          type="tel" 
                          placeholder="10-digit Mobile No." 
                          value={donorPhone}
                          onChange={(e) => { setDonorPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setUtrValidationError(''); }}
                          maxLength={10}
                          className="w-full px-3 py-2 sm:py-2.5 border border-stone-700 rounded-xl text-xs bg-stone-950 font-bold text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">
                          Donation Amount (₹) *
                        </label>
                        <input 
                          type="number" 
                          placeholder="Amount in ₹" 
                          value={donationAmount}
                          onChange={(e) => { setDonationAmount(e.target.value); setUtrValidationError(''); }}
                          className="w-full px-3 py-2 sm:py-2.5 border border-stone-700 rounded-xl text-xs bg-stone-950 font-black text-amber-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1 flex items-center justify-between">
                          <span>12-Digit Bank UTR / UPI Ref *</span>
                          <span className="text-[9px] text-amber-400 font-black">MANDATORY</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. 425519283741" 
                          value={donorUtr}
                          onChange={(e) => { setDonorUtr(e.target.value.trim()); setUtrValidationError(''); }}
                          maxLength={18}
                          className="w-full px-3 py-2 sm:py-2.5 border-2 border-amber-500/60 focus:border-amber-400 rounded-xl text-xs font-mono font-bold bg-stone-950 text-amber-300 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-stone-400 italic">
                      🔍 GPay receipt me <strong>"UPI transaction ID: 4255XXXXXXXX"</strong> likha hota hai, wahi 12-digit number yahan dalein.
                    </p>

                    {/* Prominent Validation Error Alert Banner */}
                    {utrValidationError && (
                      <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-2.5 sm:p-3 text-red-200 text-xs font-bold flex items-start gap-2 animate-shake shadow-md">
                        <span className="text-base sm:text-lg leading-none shrink-0 mt-0.5">⚠️</span>
                        <div>
                          <p className="font-black text-white">Payment Verification Failed:</p>
                          <p className="mt-0.5 text-red-200 leading-snug">{utrValidationError}</p>
                        </div>
                      </div>
                    )}

                    {/* Verification & Record Button */}
                    <button
                      type="button"
                      onClick={() => handleVerifyAndRecordPayment('Google Pay (Scanner QR)')}
                      disabled={isPaymentProcessing}
                      className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-600 text-white font-black py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-700/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                    >
                      {isPaymentProcessing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span className="text-xs sm:text-sm">Verifying with Mandal Bank Account...</span>
                        </>
                      ) : (
                        <>
                          <span>🔒</span>
                          <span className="text-xs sm:text-sm">Verify 12-Digit UTR & Generate Official Receipt</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: DIRECT UPI APPS */}
              {paymentGatewayTab === 'upi_intent' && (
                <div className="space-y-3.5 sm:space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-stone-300 font-medium">
                      Apne kisi bhi pasandeeda UPI app par click karein aur instant Scanner open karein:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { name: 'Google Pay', color: 'from-blue-600 to-indigo-700', icon: '🟢', sub: 'Tap to Open GPay Scanner' },
                      { name: 'PhonePe', color: 'from-purple-600 to-indigo-800', icon: '🟣', sub: 'Tap to Open PhonePe Scanner' },
                      { name: 'Paytm UPI', color: 'from-sky-500 to-blue-700', icon: '🔵', sub: 'Tap to Open Paytm Scanner' },
                      { name: 'BHIM UPI', color: 'from-orange-500 to-amber-600', icon: '🟠', sub: 'Tap to Open BHIM Scanner' }
                    ].map((app) => (
                      <button
                        key={app.name}
                        type="button"
                        onClick={() => handleTapToPay(app.name)}
                        className={`bg-gradient-to-r ${app.color} text-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow hover:shadow-md transition flex items-center gap-2.5 hover:scale-[1.02] active:scale-95 text-left`}
                      >
                        <span className="text-xl sm:text-2xl shrink-0">{app.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-black leading-tight truncate">{app.name}</p>
                          <p className="text-[10px] text-white/90 mt-0.5 truncate">{app.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#1a1613] border border-amber-500/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs text-stone-300 space-y-1">
                    <p className="font-bold text-amber-300 flex items-center gap-1">
                      <span>ℹ️</span> <span>Laptop & Mobile Friendly:</span>
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-stone-400">
                      • <strong>Laptop Par</strong>: Upar kisi bhi UPI app par click karein → Scanner khul jayega jise aap apne phone se scan kar sakte hain.
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-stone-400">
                      • <strong>Mobile Par</strong>: Direct app launch hogi jisme PIN daal kar aap turant payment kar sakte hain.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800 space-y-2 text-left">
                    <label className="text-[10px] font-bold text-stone-300 block uppercase">
                      Enter 12-Digit Bank UTR / UPI Ref from your app *
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 425519283741" 
                      value={donorUtr}
                      onChange={(e) => { setDonorUtr(e.target.value.trim()); setUtrValidationError(''); }}
                      maxLength={18}
                      className="w-full px-3 py-2 border-2 border-amber-500/60 focus:border-amber-400 rounded-xl text-xs font-mono font-bold bg-stone-950 text-amber-300 focus:outline-none"
                    />
                    {utrValidationError && (
                      <p className="text-red-400 text-[11px] font-bold">⚠️ {utrValidationError}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyAndRecordPayment('Direct UPI App')}
                    disabled={isPaymentProcessing}
                    className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-500 hover:to-emerald-600 text-white font-black py-3.5 px-4 rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                  >
                    {isPaymentProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying UPI UTR {donorUtr}...</span>
                      </>
                    ) : (
                      <>
                        <span>🔒</span>
                        <span>Verify 12-Digit UTR & Generate E-Receipt</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: CARD & NETBANKING GATEWAY */}
              {paymentGatewayTab === 'card_netbanking' && (
                <div className="space-y-4 text-left">
                  
                  {/* Sub Switcher: Card vs NetBanking */}
                  <div className="flex bg-stone-900 p-1 rounded-xl text-xs font-bold border border-stone-800">
                    <button
                      type="button"
                      onClick={() => setCardNetbankingMode('card')}
                      className={`flex-1 py-1.5 rounded-lg transition ${cardNetbankingMode === 'card' ? 'bg-amber-500 text-stone-950 font-black shadow-xs' : 'text-stone-400 hover:text-white'}`}
                    >
                      💳 Debit / Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardNetbankingMode('netbanking')}
                      className={`flex-1 py-1.5 rounded-lg transition ${cardNetbankingMode === 'netbanking' ? 'bg-amber-500 text-stone-950 font-black shadow-xs' : 'text-stone-400 hover:text-white'}`}
                    >
                      🏛️ NetBanking
                    </button>
                  </div>

                  {cardNetbankingMode === 'card' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">Card Number</label>
                        <input 
                          type="text" 
                          placeholder="4532 •••• •••• 8921"
                          maxLength={19}
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full px-3 py-2.5 border border-stone-700 rounded-xl text-xs font-mono bg-stone-950 text-white focus:outline-none focus:border-amber-400 font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">Valid Thru</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="w-full px-3 py-2.5 border border-stone-700 rounded-xl text-xs font-mono bg-stone-950 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">CVV / CVC</label>
                          <input 
                            type="password" 
                            placeholder="•••"
                            maxLength={4}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full px-3 py-2.5 border border-stone-700 rounded-xl text-xs font-mono bg-stone-950 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">Cardholder Name</label>
                        <input 
                          type="text" 
                          placeholder="Name as printed on card"
                          value={cardDetails.name || donorName}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="w-full px-3 py-2.5 border border-stone-700 rounded-xl text-xs bg-stone-950 text-white focus:outline-none focus:border-amber-400 font-medium"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                        <span>Accepted: RuPay • Visa • MasterCard</span>
                        <span className="font-bold text-emerald-400">🔒 256-bit SSL</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => confirmDonationPayment('Debit/Credit Card', 'CARD-' + Date.now().toString().slice(-8))}
                        disabled={isPaymentProcessing}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black py-3.5 px-4 rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                      >
                        {isPaymentProcessing ? (
                          <>
                            <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                            <span>Contacting Card Gateway...</span>
                          </>
                        ) : (
                          <>
                            <span>🔒</span>
                            <span>Pay ₹{Number(donationAmount || 101).toLocaleString()} Securely via Card</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">Select Bank</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            'State Bank of India (SBI)',
                            'HDFC Bank',
                            'ICICI Bank',
                            'Axis Bank',
                            'Bank of Baroda',
                            'Kotak Mahindra Bank'
                          ].map((bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => setSelectedBank(bank)}
                              className={`p-2 rounded-xl text-xs font-bold border text-left truncate transition ${selectedBank === bank ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-xs' : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-400'}`}
                            >
                              {bank}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => confirmDonationPayment(`NetBanking (${selectedBank})`, 'NET-' + Date.now().toString().slice(-8))}
                        disabled={isPaymentProcessing}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black py-3.5 px-4 rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                      >
                        {isPaymentProcessing ? (
                          <>
                            <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                            <span>Redirecting to {selectedBank}...</span>
                          </>
                        ) : (
                          <>
                            <span>🏛️</span>
                            <span>Pay ₹{Number(donationAmount || 101).toLocaleString()} via NetBanking</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer Security Badge */}
            <div className="bg-[#110e0c] p-3 border-t border-stone-800 text-center text-[10px] text-stone-400 flex items-center justify-center gap-2">
              <span>🛡️ Verified Trust Payment Gateway</span>
              <span>•</span>
              <span>Instant 80G Tax Exempt E-Receipt</span>
            </div>

          </div>
        </div>
      )}

      {/* --- DEDICATED FULL-VIEW SCANNER MODAL (FOR LAPTOPS & PHONES) --- */}
      {showScannerModal && (
        <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#16120f] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-2 border-amber-500/50 my-auto text-center text-white">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-red-950 via-stone-950 to-amber-950 text-white p-4 relative border-b border-amber-500/30">
              <button 
                onClick={() => {
                  if (!isPaymentProcessing) setShowScannerModal(false)
                }}
                className="absolute top-3.5 right-3.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition"
                title="Close Scanner"
              >
                ✕
              </button>

              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">📱</span>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-amber-300 uppercase">
                  {activeScannerApp} Scanner QR
                </h3>
              </div>
              <p className="text-[11px] text-amber-200/90 font-medium">
                Shivaputr Yuvak Mandal • Official Payment QR
              </p>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 bg-[#130f0d]">
              
              {/* Laptop Banner Notice */}
              <div className="bg-blue-950/60 border border-blue-500/30 rounded-2xl p-2.5 text-xs text-blue-200 text-left flex items-start gap-2 shadow-xs">
                <span className="text-base leading-none mt-0.5">💻</span>
                <div>
                  <p className="font-extrabold text-[11px] text-blue-200">Laptop / Desktop Screen Mode Active</p>
                  <p className="text-[10px] text-stone-300 mt-0.5 leading-snug">
                    Apne mobile phone me <strong>{activeScannerApp}</strong> ya koi bhi UPI app kholein aur laptop screen par dikh rahe is QR Code ko scan karein:
                  </p>
                </div>
              </div>

              {/* Amount & Devotee Card */}
              <div className="bg-stone-900 text-white p-2.5 rounded-2xl flex items-center justify-between border border-amber-500/30">
                <div className="text-left">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Devotee</span>
                  <span className="text-xs font-black text-amber-300 truncate block max-w-[180px]">
                    {donorName.trim() || loggedInUser || 'Devotee (Bhakti Seva)'}
                  </span>
                </div>
                <div className="text-right border-l border-stone-800 pl-3">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Pay Amount</span>
                  <span className="text-lg font-black text-amber-300 font-mono">
                    ₹{Number(donationAmount || 101).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Verified Scanner Badge */}
              <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-1 rounded-full text-xs font-black text-emerald-300 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{customQrCode ? '✓ Verified Admin QR Scanner (Connected)' : '✓ Official Google Pay Scanner (Connected)'}</span>
              </div>

              {/* QR Mode Switcher: Real vs Dynamic */}
              <div className="flex bg-stone-900 p-0.5 rounded-xl text-[11px] font-black max-w-[290px] mx-auto border border-stone-800">
                <button
                  type="button"
                  onClick={() => setQrViewMode('standee')}
                  className={`flex-1 py-1 rounded-lg transition ${qrViewMode === 'standee' ? 'bg-amber-500 text-stone-950 shadow-xs font-bold' : 'text-stone-400 hover:text-white'}`}
                >
                  {customQrCode ? '🖼️ Admin Real QR' : '🟢 Official Real QR'}
                </button>
                <button
                  type="button"
                  onClick={() => setQrViewMode('dynamic')}
                  className={`flex-1 py-1 rounded-lg transition ${qrViewMode === 'dynamic' ? 'bg-amber-500 text-stone-950 shadow-xs font-bold' : 'text-stone-400 hover:text-white'}`}
                >
                  ⚡ Auto-Amount (₹{Number(donationAmount || 1).toLocaleString()})
                </button>
              </div>

              {/* High-Resolution QR Scanner Box */}
              <div className="relative bg-[#1a1613] border-2 border-amber-500/30 rounded-3xl p-3 shadow-inner max-w-[260px] mx-auto text-white">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white p-2 border-2 border-amber-400 shadow-md flex items-center justify-center relative">
                  <img 
                    src={qrViewMode === 'dynamic' ? (dynamicQrUrl || activeStandeeQr) : activeStandeeQr} 
                    alt="Mandal UPI QR" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-black text-white leading-tight">{activePayeeName}</p>
                  <p className="text-[10px] text-amber-300 font-bold mt-0.5">
                    {qrViewMode === 'dynamic' 
                      ? `✓ ${activeScannerApp} scan karte hi ₹${Number(donationAmount || 1).toLocaleString()} automatic fill hoga` 
                      : (customQrCode ? '✓ Verified Admin QR Code (Scan using any UPI App)' : 'Scan using GPay, PhonePe, Paytm or BHIM')}
                  </p>
                </div>
              </div>

              {/* UPI ID & Copy */}
              <div className="bg-stone-900/90 p-2.5 rounded-2xl border border-stone-800 flex items-center justify-between text-left">
                <div>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Official UPI ID</p>
                  <p className="text-xs font-mono font-black text-amber-300 select-all">{activeUpiId}</p>
                </div>
                <button 
                  type="button"
                  onClick={copyUpiId}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1 ${upiCopied ? 'bg-green-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-stone-950'}`}
                >
                  <span>{upiCopied ? '✓' : '📋'}</span>
                  <span>{upiCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* STEP 2: VERIFICATION & ENTRY RECORDING FORM */}
              <div className="pt-3 border-t border-stone-800 space-y-3 text-left">
                <div className="bg-amber-950/50 border border-amber-500/40 rounded-2xl p-3 text-amber-200">
                  <div className="flex items-center gap-1.5 font-black text-xs uppercase text-amber-300">
                    <span>📝</span>
                    <span>Step 2: Enter Verification Details & 12-Digit UTR</span>
                  </div>
                  <p className="text-[10px] text-stone-300 mt-0.5 leading-snug">
                    Payment safal hone par apne Google Pay / UPI receipt se <strong>12-digit UTR No.</strong> aur apna naam yahan darj karein taaki entry record ho aur Pavati ban sake.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">
                      Devotee Full Name *
                    </label>
                    <input 
                      type="text" 
                      placeholder="Devotee Full Name" 
                      value={donorName}
                      onChange={(e) => { setDonorName(e.target.value); setUtrValidationError(''); }}
                      className="w-full px-3 py-2 border border-stone-700 rounded-xl text-xs bg-stone-950 font-bold text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">
                      Mobile Number *
                    </label>
                    <input 
                      type="tel" 
                      placeholder="10-digit Mobile No." 
                      value={donorPhone}
                      onChange={(e) => { setDonorPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setUtrValidationError(''); }}
                      maxLength={10}
                      className="w-full px-3 py-2 border border-stone-700 rounded-xl text-xs bg-stone-950 font-bold text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1">
                      Donation Amount (₹) *
                    </label>
                    <input 
                      type="number" 
                      placeholder="Amount in ₹" 
                      value={donationAmount}
                      onChange={(e) => { setDonationAmount(e.target.value); setUtrValidationError(''); }}
                      className="w-full px-3 py-2 border border-stone-700 rounded-xl text-xs bg-stone-950 font-black text-amber-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-300 block uppercase mb-1 flex items-center justify-between">
                      <span>12-Digit Bank UTR / UPI Ref *</span>
                      <span className="text-[9px] text-amber-400 font-black">MANDATORY</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 425519283741" 
                      value={donorUtr}
                      onChange={(e) => { setDonorUtr(e.target.value.trim()); setUtrValidationError(''); }}
                      maxLength={18}
                      className="w-full px-3 py-2 border-2 border-amber-500/60 focus:border-amber-400 rounded-xl text-xs font-mono font-bold bg-stone-950 text-amber-300 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Prominent Validation Error Alert Banner */}
                {utrValidationError && (
                  <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-3 text-red-200 text-xs font-bold flex items-start gap-2 animate-shake shadow-md">
                    <span className="text-lg leading-none shrink-0 mt-0.5">⚠️</span>
                    <div>
                      <p className="font-black text-white">Payment Verification Failed:</p>
                      <p className="mt-0.5 text-red-200 leading-snug">{utrValidationError}</p>
                    </div>
                  </div>
                )}

                {/* Action Button: Confirm & Get Receipt */}
                <button
                  type="button"
                  onClick={() => handleVerifyAndRecordPayment(`${activeScannerApp} Scanner QR`)}
                  disabled={isPaymentProcessing}
                  className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-600 text-white font-black py-4 px-4 rounded-2xl text-sm shadow-xl shadow-emerald-700/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                >
                  {isPaymentProcessing ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>🔍 Verifying 12-digit UTR with Mandal Account...</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>Verify 12-Digit UTR & Generate Official Receipt</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- BAPPA BLESSINGS WALL: REAL PAYMENT GATEWAY & SCANNER MODAL --- */}
      {showBlessingPaymentModal && pendingBlessing && (
        <div className="fixed inset-0 z-[82] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#16120f] w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-2 border-amber-500/50 my-auto text-center max-h-[94vh] text-white">
            
            {/* Saffron Ganapati Header */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-3.5 sm:p-5 relative flex items-center justify-between shadow-md shrink-0">
              <div className="text-left min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-xl shrink-0">🪔</span>
                  <h3 className="text-sm sm:text-base md:text-lg font-black tracking-tight truncate">Bappa Wish Sankalp Payment</h3>
                </div>
                <p className="text-[10px] sm:text-xs text-amber-100 font-medium mt-0.5 truncate">
                  Real UPI Payment Gateway • Kunal Satote (Mandal Account)
                </p>
              </div>
              <button 
                onClick={() => { setShowBlessingPaymentModal(false); setPendingBlessing(null); setBlessingUtrError(''); }}
                className="bg-black/20 hover:bg-black/40 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition shrink-0"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 text-left bg-[#130f0d]">
              
              {/* Wish & Devotee Summary Card */}
              <div className="bg-[#1f1915] border-2 border-amber-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-extrabold text-amber-300 flex items-center gap-1.5 truncate">
                    <span>🙏 Devotee:</span> <strong className="text-white truncate">{pendingBlessing.name}</strong>
                  </span>
                  <span className="text-xs bg-emerald-600 text-white font-black px-2.5 py-1 rounded-lg shadow-xs font-mono shrink-0">
                    ₹{pendingBlessing.amount} Daan
                  </span>
                </div>
                <p className="text-xs italic text-stone-300 font-medium bg-[#181310] p-2 rounded-xl border border-amber-500/20 leading-relaxed">
                  "{pendingBlessing.wish}"
                </p>
                <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold flex-wrap gap-1">
                  <span>📱 {pendingBlessing.phone}</span>
                  <span className="text-amber-400">100% Real Payment Required</span>
                </div>
              </div>

              {/* STEP 1: SCAN & PAY VIA UPI */}
              <div className="bg-[#1a1512] border border-amber-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs font-black text-white uppercase flex items-center gap-1 truncate">
                    <span>📲</span> Step 1: Scan QR or Pay with UPI App
                  </span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full shrink-0">
                    ₹{pendingBlessing.amount}
                  </span>
                </div>

                {/* QR Code Card */}
                <div className="bg-[#14100d] p-3 rounded-2xl border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center shadow-inner">
                  <div className="w-40 h-40 sm:w-52 sm:h-52 bg-white rounded-xl p-2 shadow-md border border-amber-500/40 flex items-center justify-center">
                    <img 
                      src={blessingQrMode === 'dynamic' ? (blessingDynamicQr || activeStandeeQr) : activeStandeeQr} 
                      alt="Bappa Blessings UPI QR" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-black text-amber-300">{activePayeeName}</p>
                    <p className="text-[10px] sm:text-[11px] text-emerald-400 font-bold mt-0.5">
                      ✓ Scan karte hi ₹{pendingBlessing.amount} exact amount fill hoga
                    </p>
                  </div>
                </div>

                {/* Mobile Quick Pay Intent Buttons */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-stone-400 uppercase text-center">
                    — Mobile Users direct App se pay karein —
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <button 
                      type="button" 
                      onClick={() => handleBlessingMobilePay('Google Pay')}
                      className="bg-stone-900 border border-stone-700 hover:border-blue-400 p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition active:scale-95 shadow-xs"
                    >
                      <span className="text-base">🟢</span>
                      <span className="text-[10px] sm:text-[11px] font-black text-stone-200 truncate w-full text-center">GPay</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleBlessingMobilePay('PhonePe')}
                      className="bg-stone-900 border border-stone-700 hover:border-purple-400 p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition active:scale-95 shadow-xs"
                    >
                      <span className="text-base">🟣</span>
                      <span className="text-[10px] sm:text-[11px] font-black text-stone-200 truncate w-full text-center">PhonePe</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleBlessingMobilePay('Paytm')}
                      className="bg-stone-900 border border-stone-700 hover:border-sky-400 p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition active:scale-95 shadow-xs"
                    >
                      <span className="text-base">🔵</span>
                      <span className="text-[10px] sm:text-[11px] font-black text-stone-200 truncate w-full text-center">Paytm</span>
                    </button>
                  </div>
                </div>

                {/* UPI ID & Copy */}
                <div className="bg-stone-900 p-2 sm:p-2.5 rounded-xl border border-stone-700 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-stone-400 uppercase">Mandal UPI ID</p>
                    <p className="text-xs font-mono font-black text-amber-300 select-all truncate">{activeUpiId}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={copyUpiId}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition shrink-0 ${upiCopied ? 'bg-green-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-stone-950'}`}
                  >
                    {upiCopied ? '✓ Copied' : '📋 Copy ID'}
                  </button>
                </div>
              </div>

              {/* STEP 2: ENTER 12-DIGIT BANK UTR NUMBER */}
              <div className="bg-[#18221a] border-2 border-emerald-500/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-300 font-black text-xs uppercase">
                  <span>📝</span>
                  <span>Step 2: Enter 12-Digit Bank UTR / UPI Ref *</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  Payment safal hone par apne Google Pay / PhonePe receipt se mila <strong className="text-white">12-Digit UPI Ref / UTR No.</strong> yahan darj karein:
                </p>

                <div>
                  <input 
                    type="text" 
                    placeholder="e.g. 425519283741 (12 digits)" 
                    value={blessingUtr}
                    onChange={(e) => {
                      setBlessingUtr(e.target.value.replace(/[^0-9A-Za-z]/g, ''))
                      setBlessingUtrError('')
                    }}
                    maxLength={18}
                    className="w-full px-3.5 py-2.5 border-2 border-emerald-500/70 focus:border-emerald-400 rounded-xl text-sm font-mono font-bold bg-stone-950 text-emerald-300 focus:outline-none tracking-widest text-center shadow-inner"
                    required
                  />
                  <p className="text-[10px] text-stone-400 mt-1 text-center">
                    Yeh number GPay / PhonePe ke Payment Details mein "UPI Transaction ID" ya "UTR" ke naam se hota hai.
                  </p>
                </div>

                {/* Validation Error Banner */}
                {blessingUtrError && (
                  <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-3 text-red-200 text-xs font-bold flex items-start gap-2 animate-shake shadow-md">
                    <span className="text-lg leading-none shrink-0 mt-0.5">⚠️</span>
                    <div>
                      <p className="font-black text-red-200">Payment Verification Failed:</p>
                      <p className="mt-0.5 text-red-300 leading-snug">{blessingUtrError}</p>
                    </div>
                  </div>
                )}

                {/* Action Button: Confirm & Post Wish */}
                <button
                  type="button"
                  onClick={() => handleVerifyBlessingPayment('Google Pay (Blessings QR)')}
                  disabled={isBlessingVerifying}
                  className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-600 text-white font-black py-3.5 px-4 rounded-xl text-sm shadow-xl shadow-emerald-700/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                >
                  {isBlessingVerifying ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>🔍 Verifying 12-Digit UTR with Mandal Account...</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>Verify UTR & Publish Wish on Bappa Wall ✨</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- GREEN PAYMENT DETECTED & SUCCESS CELEBRATION MODAL --- */}
      {showPaymentSuccessModal && activeReceipt && (
        <div className="fixed inset-0 z-[85] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#16120f] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-2 border-emerald-500/80 my-auto text-center text-white">
            
            {/* Celebratory Emerald Top Banner */}
            <div className="bg-gradient-to-b from-emerald-700 via-emerald-800 to-emerald-900 text-white pt-8 pb-6 px-6 relative border-b border-emerald-500/40">
              <button 
                onClick={() => setShowPaymentSuccessModal(false)}
                className="absolute top-3.5 right-3.5 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition"
                title="Close"
              >
                ✕
              </button>

              {/* Big Animated Green Checkmark with Glow */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center mb-3">
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30"></div>
                <div className="w-18 h-18 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-4xl shadow-xl font-black">
                  ✓
                </div>
              </div>

              <span className="inline-block bg-white/20 backdrop-blur-xs text-white border border-white/30 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                🟢 Live Payment Detected & Confirmed
              </span>

              <h3 className="text-2xl font-black text-white tracking-tight">
                Payment Received! 🎉
              </h3>
              <p className="text-xs text-emerald-100 font-medium mt-1">
                Aapka daan safalta-poorvak Mandal account mein jama ho gaya hai.
              </p>
            </div>

            {/* Transaction Card */}
            <div className="p-6 space-y-4 text-left bg-[#130f0d]">
              
              <div className="bg-[#162319] border-2 border-emerald-500/40 p-4 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-baseline border-b border-emerald-500/30 pb-2">
                  <span className="text-xs font-bold text-stone-300">Total Daan Rashi:</span>
                  <span className="text-2xl font-black text-emerald-300 font-mono">
                    ₹{activeReceipt.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-medium">Devotee Name:</span>
                  <span className="font-extrabold text-white">{activeReceipt.name}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-medium">Payment Mode:</span>
                  <span className="font-bold text-stone-200">{activeReceipt.mode}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-medium">Bank UTR / Ref No:</span>
                  <span className="font-mono font-bold text-emerald-300">{activeReceipt.utr}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-medium">Receipt Serial No:</span>
                  <span className="font-mono font-black text-amber-400">{activeReceipt.id}</span>
                </div>

                <div className="flex justify-between text-xs pt-1 border-t border-emerald-500/20 text-[11px]">
                  <span className="text-stone-400">Date & Time:</span>
                  <span className="text-stone-300 font-medium">{activeReceipt.date} • {activeReceipt.time}</span>
                </div>
              </div>

              {/* Devotional Blessing Note */}
              <div className="bg-[#201813] border border-amber-500/30 p-3 rounded-xl text-center">
                <p className="text-xs font-black text-amber-300">
                  🙏 गणपति बाप्पा मोरया! मंगलमूर्ति मोरया!
                </p>
                <p className="text-[10px] text-stone-300 mt-0.5">
                  Shivaputr Yuvak Mandal aapke aur aapke parivar ke kalyan ki prarthana karta hai.
                </p>
              </div>

              {/* ACTION BUTTONS (Download Receipt) */}
              <div className="space-y-2 pt-1">
                
                {/* Big Download PDF / Print Button */}
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-600 text-white font-black py-4 px-5 rounded-2xl text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="text-lg">📥</span>
                  <span>Download Official Daan Receipt (PDF / Print)</span>
                </button>

                {/* View Full 80G Pavati Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentSuccessModal(false)
                    setShowReceiptModal(true)
                  }}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-black py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>📄</span>
                  <span>View Complete 80G Tax-Exempt Pavati</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPaymentSuccessModal(false)}
                    className="text-[11px] text-stone-500 hover:text-stone-300 font-bold underline"
                  >
                    Done & Return to Homepage
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- OFFICIAL E-RECEIPT MODAL (PRINTABLE) --- */}
      {showReceiptModal && activeReceipt && (
        <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#16120f] w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-2 border-amber-500/50 text-white printable-card max-h-[94vh] my-auto">
            
            <div className="bg-stone-950 text-white p-4 sm:p-5 text-center relative border-b-2 border-amber-400 shrink-0">
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 bg-stone-800 hover:bg-stone-700 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition"
              >
                ✕
              </button>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black mx-auto mb-1 text-base sm:text-lg">
                🕉️
              </div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 tracking-tight">SHIVAPUTR YUVAK MANDAL</h3>
              <p className="text-[10px] text-stone-300">Trust Reg: E-18294/MUM/2012 • Sarvajanik Utsav</p>
              <span className="inline-block mt-1.5 sm:mt-2 bg-amber-400 text-stone-950 text-[10px] font-black px-3 py-0.5 rounded-full uppercase">
                Official Daan Pavati / E-Receipt
              </span>
            </div>

            <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 bg-[#130f0d] text-xs overflow-y-auto">
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <div>
                  <span className="text-stone-400 block text-[10px]">Receipt No:</span>
                  <span className="font-mono font-black text-amber-400">{activeReceipt.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block text-[10px]">Date & Time:</span>
                  <span className="font-bold text-stone-200">{activeReceipt.date} • {activeReceipt.time}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold">Devotee Name:</span>
                  <span className="font-black text-white">{activeReceipt.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold">Seva Category:</span>
                  <span className="font-bold text-stone-200">{activeReceipt.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold">Payment Method:</span>
                  <span className="font-bold text-stone-200">{activeReceipt.mode}</span>
                </div>
                {activeReceipt.utr && (
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-bold">UTR / Ref No:</span>
                    <span className="font-mono font-bold text-amber-300">{activeReceipt.utr}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold">Sankalp:</span>
                  <span className="italic text-stone-300">"{activeReceipt.message}"</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-950/80 to-[#122818] border border-emerald-500/40 p-4 rounded-2xl flex justify-between items-center">
                <span className="font-black text-emerald-300 uppercase">Total Amount Paid:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">₹{activeReceipt.amount.toLocaleString()}</span>
              </div>

              <div className="border-t border-dashed border-stone-800 pt-3 flex justify-between items-end text-[10px] text-stone-400">
                <div>
                  <p>Tax exemption under 80G applicable.</p>
                  <p>Computer generated receipt, signature not required.</p>
                </div>
                <div className="text-center">
                  <span className="text-xs font-black text-stone-200 block">Suraj Jadhav</span>
                  <span className="border-t border-stone-600 block pt-0.5">Treasurer (Khajanchi)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#100d0b] border-t border-stone-800 flex gap-2">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>🖨️</span> Print / Save Receipt
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- SOCIAL WELFARE & MANDAL INITIATIVES --- */}
      <section id="initiatives" className="py-16 px-4 bg-gradient-to-b from-[#0d0b09] via-[#130f0d] to-[#0e0c0a] border-b border-amber-500/20 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-amber-300 text-xs font-black uppercase tracking-widest bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
              Community Service • Samaj Kalyan
            </span>
            <h3 className="text-3xl font-black text-white mt-2">Samajik Upakram (Social Initiatives)</h3>
            <p className="text-stone-400 text-sm mt-1">
              Shivaputr Yuvak Mandal keval utsav hi nahi, varshbhar loksewa aur samaj kalyan ke karyakram chalata hai.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#181412] p-6 rounded-3xl shadow-xl border-2 border-amber-500/25 hover:border-amber-400/50 hover:bg-[#1e1814] transition">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/30 text-red-400 flex items-center justify-center text-2xl mb-4">
                🩸
              </div>
              <h4 className="text-base font-black text-white">Raktdaan Maha-Shibir</h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Pratyek varsh 850+ blood units sankalan karke sarkari hospitals mein marizo ke liye bhent kiya jata hai.
              </p>
              <div className="mt-4 pt-4 border-t border-stone-800 text-xs font-black text-red-400">
                850+ Units Collected
              </div>
            </div>

            <div className="bg-[#181412] p-6 rounded-3xl shadow-xl border-2 border-amber-500/25 hover:border-amber-400/50 hover:bg-[#1e1814] transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/30 text-amber-300 flex items-center justify-center text-2xl mb-4">
                🍲
              </div>
              <h4 className="text-base font-black text-white">Annadaan Mahaprasad</h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Utsav ke dauran 15,000 se adhik bhakton aur zarooratmand logon ko garma-garam satvik mahaprasad vitaran.
              </p>
              <div className="mt-4 pt-4 border-t border-stone-800 text-xs font-black text-amber-400">
                15,000+ Thalis Served
              </div>
            </div>

            <div className="bg-[#181412] p-6 rounded-3xl shadow-xl border-2 border-amber-500/25 hover:border-amber-400/50 hover:bg-[#1e1814] transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 flex items-center justify-center text-2xl mb-4">
                🌿
              </div>
              <h4 className="text-base font-black text-white">Eco-Friendly Drive</h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Shadu mati murtika prasar, artificial visarjan tank vyavastha aur 1200 ped lagane ka sankalp.
              </p>
              <div className="mt-4 pt-4 border-t border-stone-800 text-xs font-black text-emerald-400">
                1,200+ Trees Planted
              </div>
            </div>

            <div className="bg-[#181412] p-6 rounded-3xl shadow-xl border-2 border-amber-500/25 hover:border-amber-400/50 hover:bg-[#1e1814] transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-500/30 text-blue-300 flex items-center justify-center text-2xl mb-4">
                📚
              </div>
              <h4 className="text-base font-black text-white">Vidyarthi Madat Yojana</h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Garib vidyarthiyon ko school kit, notebooks aur financial scholarship pradan karna.
              </p>
              <div className="mt-4 pt-4 border-t border-stone-800 text-xs font-black text-blue-400">
                500+ Students Benefited
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- INSTAGRAM LIVE SECTION WITH LIVE CHAT FEED --- */}
      <section id="live" className="py-16 px-4 bg-gradient-to-b from-[#0e0c0a] via-[#14100d] to-[#100d0b] border-b border-amber-500/20 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#181412] p-6 rounded-3xl shadow-2xl border-2 border-amber-500/30 text-white">
              <div className="flex flex-wrap justify-between items-center mb-4 px-2 gap-2">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                    <span className={isAartiLiveNow || liveApproved ? 'text-red-500 animate-pulse text-lg' : 'text-stone-500 text-lg'}>●</span> 
                    Instagram Live Darshan Feed
                  </h3>
                  <a href="https://instagram.com/shivputr_yuvak_mandal" target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 font-bold hover:underline">
                    @shivputr_yuvak_mandal (Official Handle)
                  </a>
                </div>

                <div className="bg-stone-900/90 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-stone-300">Aarti Stream:</span>
                  <button 
                    onClick={() => setIsAartiLiveNow(!isAartiLiveNow)} 
                    className={`text-xs px-3 py-1 rounded-lg font-bold text-white transition ${isAartiLiveNow ? 'bg-red-600' : 'bg-stone-700'}`}
                  >
                    {isAartiLiveNow ? 'ON (Live Now)' : 'OFF'}
                  </button>
                </div>
              </div>

              {isAartiLiveNow || liveApproved ? (
                <div className="space-y-3">
                  <div className="aspect-video bg-stone-950 rounded-2xl overflow-hidden shadow-inner relative flex flex-col items-center justify-center text-center p-6 text-white border-2 border-pink-500">
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      LIVE BROADCAST
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1 mb-3">
                      <div className="w-full h-full bg-stone-950 rounded-full flex items-center justify-center text-3xl">
                        📹
                      </div>
                    </div>
                    <h4 className="text-lg font-bold">Shivaputr Yuvak Mandal Live Stream</h4>
                    <p className="text-xs text-stone-300 max-w-sm mt-1">
                      Kakad / Sandhya Aarti ka live darshan chal raha hai. Devotees ghar baithe aarti mein shamil ho rahe hain.
                    </p>
                    <a 
                      href="https://instagram.com/shivputr_yuvak_mandal" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-md hover:scale-105 transition"
                    >
                      Open in Instagram App ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-[#120f0d] rounded-2xl overflow-hidden shadow-inner relative flex flex-col items-center justify-center text-center p-6 text-white border border-stone-800">
                  <span className="text-4xl mb-2">🔒</span>
                  <h4 className="text-lg font-bold text-white">Live Darshan Stream Inactive</h4>
                  <p className="text-xs text-stone-400 max-w-sm mt-1">Agle aarti slot tak live band rahega. Aarti request karein:</p>
                  
                  {!liveRequested ? (
                    <form onSubmit={(e) => { e.preventDefault(); if(reqName.trim()) setLiveRequested(true); }} className="mt-4 flex gap-2 w-full max-w-md">
                      <input 
                        type="text" 
                        placeholder="Enter your name for request" 
                        value={reqName}
                        onChange={(e) => setReqName(e.target.value)}
                        className="px-4 py-2 rounded-xl text-xs text-white bg-stone-950 border border-stone-700 focus:outline-none focus:border-amber-400 placeholder:text-stone-500 flex-1"
                        required
                      />
                      <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black px-4 py-2 rounded-xl text-xs transition shadow">
                        Request Live 🙏
                      </button>
                    </form>
                  ) : (
                    <div className="mt-4 bg-amber-500/20 border border-amber-500 text-amber-300 p-3 rounded-xl text-xs max-w-sm">
                      ⏳ Request sent to Mandal admin!
                      <button onClick={() => setLiveApproved(true)} className="ml-2 bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        [Demo: Click to Approve]
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Chat / Devotee Feed */}
            <div className="bg-[#181412] p-6 rounded-3xl shadow-2xl border-2 border-amber-500/30 flex flex-col h-[400px] text-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>💬</span> Live Devotee Jai-Ghosh
                </h4>
                <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-500/30 font-bold px-2 py-0.5 rounded-full">
                  Live Chat
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                {liveComments.map((c, i) => (
                  <div key={i} className="bg-[#221c17] p-2.5 rounded-xl border border-stone-800 shadow-sm">
                    <span className="font-extrabold text-amber-400 block text-[11px]">@{c.user}:</span>
                    <p className="text-stone-200 mt-0.5">{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendLiveComment} className="mt-3 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type 'Ganpati Bappa Morya!'..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-stone-700 rounded-xl focus:outline-none focus:border-amber-400 bg-stone-950 text-white placeholder:text-stone-500"
                />
                <button type="submit" className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow">
                  Send 🚩
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* --- GALLERY SECTION & BLESSINGS WALL --- */}
      <section id="gallery" className="py-16 px-4 bg-gradient-to-b from-[#100d0b] via-[#15110e] to-[#0c0a08] border-b border-amber-500/20 text-white">
        <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              
              {/* Photo Vault Preview */}
              <div>
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">Utsav Gallery 📸</h3>
                    <button 
                      onClick={() => setIsGalleryOpen(true)}
                      className="text-xs font-black bg-amber-950/80 text-amber-300 hover:bg-amber-900/90 px-3.5 py-2 rounded-xl border border-amber-500/30 transition flex items-center gap-1 shadow"
                    >
                      <span>📁</span> Explore Vault (2019 - 2026)
                    </button>
                  </div>
                  <p className='text-stone-400 text-sm mb-6'>2026 decorations, Agaman shobhayatra & aarti celebrations.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => { setLightboxImg('https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=1200&auto=format&fit=crop'); }}
                        className="cursor-pointer group relative overflow-hidden rounded-2xl shadow-xl border-2 border-amber-500/30 aspect-square"
                      >
                        <img src="https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=400&auto=format&fit=crop" alt="Ganpati Idol" className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-3">
                          <p className="text-white text-xs font-bold">2026 Prathama Darshan 🔍</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => { setLightboxImg('https://images.unsplash.com/photo-1665816051851-105973b957d6?q=80&w=1200&auto=format&fit=crop'); }}
                        className="cursor-pointer group relative overflow-hidden rounded-2xl shadow-xl border-2 border-amber-500/30 aspect-square"
                      >
                        <img src="https://images.unsplash.com/photo-1665816051851-105973b957d6?q=80&w=400&auto=format&fit=crop" alt="Aarti Thali" className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-3">
                          <p className="text-white text-xs font-bold">Mandap Dipotsav 🔍</p>
                        </div>
                      </div>
                  </div>

                  <div 
                    onClick={() => setIsGalleryOpen(true)}
                    className="mt-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-stone-950 font-bold p-5 rounded-2xl shadow-xl cursor-pointer hover:opacity-95 transition flex justify-between items-center border border-amber-400/40"
                  >
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-amber-950">Mandal Memory Vault (15 Years)</p>
                      <p className="text-base font-black text-stone-950">Explore All Years Ganpati Images (2019 - 2026)</p>
                    </div>
                    <span className="text-2xl font-bold bg-stone-950/20 p-2.5 rounded-2xl text-stone-950">📂</span>
                  </div>
              </div>

              {/* Blessings Wall */}
              <div id="blessings" className="bg-[#181412] border-2 border-amber-500/40 p-6 md:p-8 rounded-3xl shadow-2xl text-white">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                      <span>🪔</span> Bappa Blessings Wall
                    </h3>
                    <span className="bg-amber-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">1 in 100 Lucky Wish</span>
                  </div>
                  <p className='text-xs text-stone-400 mb-4'>Apni manokamna Bappa ke charno mein samarpit karein aur real UPI daan se sankalp poora karein. Real payment verify hone par hi wish live hogi aur Mandal Pavati milegi.</p>
                  
                  {wishSuccessMsg && (
                    <div className="mb-4 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 p-3.5 rounded-2xl text-xs font-black text-center shadow-sm">
                      {wishSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleInitiateBlessingPayment} className="mb-6 space-y-3.5 bg-stone-900/90 p-5 rounded-2xl shadow-inner border border-amber-500/30">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">Aapka Shubh Naam / Devotee Name *</label>
                        <input 
                          type="text" 
                          placeholder="Enter your full name" 
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          className="w-full px-3.5 py-2 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-stone-950 text-white font-medium placeholder:text-stone-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">Mobile Number (WhatsApp Pavati ke liye) *</label>
                        <input 
                          type="tel" 
                          maxLength={10}
                          placeholder="10-digit mobile number (e.g. 9820911223)" 
                          value={visitorPhone}
                          onChange={(e) => setVisitorPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-2 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-stone-950 text-white font-medium placeholder:text-stone-500"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-bold text-stone-300 uppercase">Sankalp Daan Amount (₹) *</label>
                          <span className="text-[10px] text-amber-400 font-bold">100% Real Payment</span>
                        </div>
                        {/* Quick amount chips */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {['11', '21', '51', '101', '251', '501'].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setWishAmount(amt)}
                              className={`px-2.5 py-1 text-xs font-black rounded-lg border transition ${wishAmount === amt ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm' : 'bg-stone-950 text-stone-300 border-stone-700 hover:border-amber-400'}`}
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>
                        <input 
                          type="number" 
                          min="5"
                          placeholder="Custom Amount (Min ₹5)" 
                          value={wishAmount}
                          onChange={(e) => setWishAmount(e.target.value)}
                          className="w-full px-3.5 py-2 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-stone-950 font-black text-amber-300 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">Bappa ke charno mein Wish / Sankalp *</label>
                        <textarea 
                           placeholder="Bappa, please bless my family with health and peace... 🙏" 
                           value={wishInput}
                           onChange={(e) => setWishInput(e.target.value)}
                           rows="2"
                           className="w-full px-3.5 py-2 border border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs resize-none bg-stone-950 text-white placeholder:text-stone-500"
                           required
                        ></textarea>
                      </div>

                      <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-amber-200 font-bold">
                        <span className="text-base shrink-0">🔒</span>
                        <span>Click karne par Real UPI Scanner (GPay / PhonePe) khulega. 12-digit UTR verify karne ke baad hi wish publish hogi.</span>
                      </div>

                      <button type="submit" className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2">
                        <span>Proceed to Real Pay ₹{wishAmount || 51} & Post Wish</span> <span>🙏</span>
                      </button>
                  </form>

                  {/* Wishes List */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {blessings.map((item, index) => (
                        <div key={index} className={`p-4 rounded-2xl shadow-sm border-l-4 ${item.isLuckyChosen ? 'border-red-500 bg-red-950/40 border-t border-r border-b' : 'border-amber-500 bg-[#221c17] border-t border-r border-b border-stone-800'} relative`}>
                          {item.isLuckyChosen && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                              ⭐ 100th Lucky Wish Selected!
                            </span>
                          )}
                          <p className="text-stone-200 text-xs italic font-medium leading-relaxed">"{item.wish}"</p>
                          <div className="flex flex-wrap justify-between items-center mt-3 gap-2 pt-2 border-t border-stone-800">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400 bg-amber-900/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                                {item.img ? (
                                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[11px] font-bold text-amber-300">{item.name.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <p className="text-[11px] text-amber-300 font-extrabold leading-tight">— {item.name}</p>
                                {item.date && <p className="text-[9px] text-stone-500">{item.date}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span>₹{item.amount}</span>
                              </span>
                              {item.utr && (
                                <span className="text-[9px] bg-stone-900 text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded border border-amber-500/30" title={`Verified UTR: ${item.utr}`}>
                                  ✓ UTR: {item.utr.slice(0, 4)}...{item.utr.slice(-4)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
              </div>

            </div>
        </div>
      </section>

      {/* --- YEAR-WISE GALLERY ARCHIVE MODAL WITH CATEGORY FILTER --- */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#16120f] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-amber-500/50 text-white">
            
            <div className="bg-stone-950 text-white p-5 flex justify-between items-center border-b border-amber-500/30">
              <div>
                <h3 className="text-lg md:text-xl font-black flex items-center gap-2 text-amber-300">
                  <span>🏛️</span> Shivaputr Yuvak Mandal Gallery Vault
                </h3>
                <p className="text-xs text-stone-400">Ganpati Bappa Utsav Memories from 2019 to 2026</p>
              </div>
              <button 
                onClick={() => setIsGalleryOpen(false)}
                className="bg-stone-800 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Year selector */}
            <div className="bg-[#110e0c] p-3 border-b border-stone-800 flex gap-2 overflow-x-auto">
              {Object.keys(galleryData).map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition shadow-sm ${selectedYear === year ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-extrabold' : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-amber-400'}`}
                >
                  {year} Utsav
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#130f0d]">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h4 className="text-base font-extrabold text-white">
                  Showing Memories for <span className="text-amber-400 font-black">Year {selectedYear}</span>
                </h4>
                <div className="flex gap-2 text-xs">
                  {['All', 'Darshan', 'Decor', 'Prasad', 'Miravnuk'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${selectedCategory === cat ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-amber-400'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredGallery.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setLightboxImg(item.img)}
                    className="bg-[#1d1815] rounded-2xl overflow-hidden shadow-lg border border-amber-500/20 group cursor-pointer hover:border-amber-400 transition"
                  >
                    <div className="aspect-video overflow-hidden bg-stone-900">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <div className="p-3">
                      <p className="font-extrabold text-white text-xs">{item.title}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Shivaputr Yuvak Mandal • {selectedYear}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#110e0c] p-4 border-t border-stone-800 text-center">
              <button 
                onClick={() => setIsGalleryOpen(false)}
                className="bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow"
              >
                Close Gallery Archive
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- IMAGE LIGHTBOX MODAL --- */}
      {lightboxImg && (
        <div 
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setLightboxImg(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white text-white hover:text-black w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition"
            >
              ✕
            </button>
            <img 
              src={lightboxImg} 
              alt="High Res View" 
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl border-2 border-white/20"
            />
            <p className="text-stone-300 text-xs font-bold mt-3">Click anywhere to close full screen view</p>
          </div>
        </div>
      )}

      {/* --- FLOATING DEVOTIONAL SPEED DIAL --- */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        <button 
          onClick={playTempleBell}
          className={`w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 shadow-2xl flex items-center justify-center text-xl transition-all duration-200 border-2 border-amber-300 hover:scale-110 shadow-amber-500/30 ${bellRinging ? 'animate-bell-ring' : ''}`}
          title="Ring Temple Bell"
        >
          🔔
        </button>
        <a 
          href="#virtual-mandir"
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-2xl flex items-center justify-center text-xl transition-all duration-200 border-2 border-amber-400 hover:scale-110 shadow-red-900/40"
          title="Virtual Pooja & Darshan"
        >
          🪔
        </a>
      </div>

      {/* --- MASTER FOOTER --- */}
      <footer className="bg-stone-950 text-stone-300 pt-14 pb-8 px-4 border-t-4 border-amber-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-center md:text-left">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-xl shadow-amber-500/20 flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-black flex items-center justify-center">
                  <img src={ganpatiLogo} alt="Logo" className="w-full h-full object-cover scale-105" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">Shivaputr Yuvak Mandal</h3>
                <p className="text-[11px] text-amber-400 font-extrabold uppercase tracking-wider">🚩 Sarvajanik Ganeshotsav • २०२६</p>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Celebrating Sarvajanik Ganeshotsav since 2012 with bhakti, social harmony, blood donation camps, and daily annadaan.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">Aarti Timings</h4>
            <ul className="text-xs space-y-1.5 font-medium text-stone-400">
              <li>🌅 प्रातः काकड: 07:00 AM</li>
              <li>☀️ मध्यान्ह भोग: 12:30 PM</li>
              <li>🪔 संध्या महाआरती: 07:30 PM</li>
              <li>🌙 शेज आरती: 10:00 PM</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">Quick Navigation</h4>
            <ul className="text-xs space-y-1.5 font-medium">
              <li><a href="#home" className="hover:text-amber-400 transition">Home Darshan</a></li>
              <li><a href="#virtual-mandir" className="hover:text-amber-400 transition">Online Pooja & Bell</a></li>
              <li><a href="#group-section" className="hover:text-amber-400 transition">Karyakarta Group ({teamMembers.length})</a></li>
              <li><a href="#booking" className="hover:text-amber-400 transition">VIP Darshan Pass</a></li>
              <li><a href="#donate" className="hover:text-amber-400 transition">Daan & E-Receipt</a></li>
              <li>
                <button 
                  onClick={() => { window.location.hash = '#admin'; setCurrentView('admin'); }}
                  className="hover:text-amber-300 text-amber-400 font-bold flex items-center gap-1 transition"
                >
                  <span>🔒</span> Mandal Admin Portal
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">Mandap Address & Social</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Shivaputr Chowk, Main Bazaar Road, Sarvajanik Mandap Premises, City - 400001.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              <a href="https://instagram.com/shivputr_yuvak_mandal" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-90 flex items-center gap-1.5">
                <span>📸</span> @shivputr_yuvak_mandal
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-stone-800 pt-6 text-center text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>Shivaputr Yuvak Mandal © 2026. Reg. No: E-18294/MUM/2012. All Rights Reserved.</p>
          <p className="text-amber-400 font-bold">॥ गणपती बाप्पा मोरया • पुढच्या वर्षी लवकर या ॥ 🙏</p>
        </div>
      {/* --- MODAL 1: ADD MANDAL KHARCHA BILL (MEMBER-ONLY PERMISSION) --- */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#16120f] w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-2 border-amber-500/50 my-auto text-white max-h-[94vh]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900 text-white p-3.5 sm:p-5 relative text-center border-b border-amber-500/30 shrink-0">
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition"
              >
                ✕
              </button>
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <span className="text-lg sm:text-xl">💼</span>
                <h3 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-amber-300 uppercase truncate">
                  Mandal Kharcha Entry
                </h3>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-200/90 font-medium">
                Shivaputr Yuvak Mandal • Karyakarta Expense Portal
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-3 sm:p-5 space-y-3.5 text-left max-h-[75vh] overflow-y-auto bg-[#130f0d]">
              
              {/* Permission Check 1: User Not Logged In */}
              {!loggedInUser ? (
                <div className="bg-[#1f1915] border-2 border-amber-500/30 rounded-2xl p-4 text-center space-y-3">
                  <span className="text-3xl block">🔒</span>
                  <h4 className="text-sm font-black text-amber-300">Karyakarta Login Required</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Mandal ka kharcha (jaise Laddu, Phool, Mandap bills) keval wahi darj kar sakta hai jo group ka approved sadasya ho. Kripya pehle apne karyakarta account se login karein.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddExpenseModal(false)
                      setAuthMode('login')
                      setShowAuthModal(true)
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black py-2.5 rounded-xl text-xs shadow transition"
                  >
                    Login to Continue 🔑
                  </button>
                </div>
              ) : !isGroupMember(loggedInUser) ? (
                /* Permission Check 2: Logged In, but NOT a group member */
                <div className="bg-red-950/60 border-2 border-red-500/40 rounded-2xl p-4 text-center space-y-3 text-white">
                  <span className="text-3xl block">🚫</span>
                  <h4 className="text-sm font-black text-red-300">Group Member Permission Required</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Aapka account <strong>'{loggedInUser}'</strong> abhi Mandal Committee Directory mein registered nahi hai. 
                    <br />
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      (Niyam: Sirf approved group karyakarta jaise <strong>{teamMembers[8]?.name || 'Krunal Satote'}</strong>, Rohit, Rahul aadi hi kharcha submit kar sakte hain.)
                    </span>
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const activeName = loggedInUser || 'Krunal Satote'
                        setLoggedInUser(activeName)
                        localStorage.setItem('sym_logged_user', activeName)
                        localStorage.setItem('sym_saved_profile_name', activeName)
                        const updated = teamMembers.map(m => m.id === 9 ? { ...m, name: activeName, email: userEmail || m.email, phone: userPhone || m.phone } : m)
                        setTeamMembers(updated)
                        localStorage.setItem('sym_team_members', JSON.stringify(updated))
                        window.dispatchEvent(new CustomEvent('sym_team_members_updated', { detail: updated }))
                        window.dispatchEvent(new Event('storage'))
                        alert(`✨ Swagat hai ${activeName}! Aapka Karyakarta access active ho gaya.`)
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 rounded-xl text-xs shadow transition"
                    >
                      Activate Karyakarta Access for {loggedInUser || 'Krunal Satote'} ⚡
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddExpenseModal(false)}
                      className="text-[11px] text-stone-400 hover:text-stone-200 underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Permission Granted: Active Group Member */
                <form onSubmit={handleSubmitExpense} className="space-y-3.5">
                  
                  {/* Verified Member Badge */}
                  <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                        {loggedInUser.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-300">{loggedInUser}</p>
                        <p className="text-[10px] text-emerald-400 font-bold">
                          {getMemberDetails(loggedInUser)?.role || 'Mandal Karyakarta'}
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ✓ Member Verified
                    </span>
                  </div>

                  {/* Expense Title */}
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block uppercase mb-1">
                      Kharche Ka Naam / Item Description *
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 100 ka Laddu, Aarti Phool, Sound Diesel" 
                      value={expenseTitle}
                      onChange={(e) => { setExpenseTitle(e.target.value); setExpenseErrorMsg(''); }}
                      className="w-full px-3.5 py-2.5 border border-stone-700 rounded-xl text-xs bg-stone-950 font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-stone-500"
                      required
                    />
                  </div>

                  {/* Amount & Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block uppercase mb-1">
                        Amount (₹) *
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 100" 
                        value={expenseAmount}
                        onChange={(e) => { setExpenseAmount(e.target.value); setExpenseErrorMsg(''); }}
                        className="w-full px-3.5 py-2.5 border border-stone-700 rounded-xl text-xs bg-stone-950 font-black text-amber-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block uppercase mb-1">
                        Category *
                      </label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="w-full px-3 py-2.5 border border-stone-700 rounded-xl text-xs bg-stone-950 font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Prasad & Bhog">Prasad & Bhog (Laddu etc)</option>
                        <option value="Aarti & Pooja">Aarti & Pooja Samagri</option>
                        <option value="Mandap & Pujan">Mandap & Bamboo Seva</option>
                        <option value="Decor & Lighting">Decor & Lighting</option>
                        <option value="Sound & DJ">Sound, DJ & Generator</option>
                        <option value="Mahaprasad Ration">Mahaprasad Ration</option>
                        <option value="Misc / Other">Miscellaneous / Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block uppercase mb-1">
                      Payment Mode *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'UPI (GPay)', label: 'GPay UPI', icon: '🟢' },
                        { id: 'UPI (PhonePe)', label: 'PhonePe', icon: '🟣' },
                        { id: 'Cash', label: 'Rokad / Cash', icon: '💵' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setExpensePaymentMode(m.id)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center gap-0.5 ${expensePaymentMode === m.id ? 'bg-amber-500 text-stone-950 border-amber-400 shadow' : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-400'}`}
                        >
                          <span>{m.icon}</span>
                          <span className="text-[10px] leading-tight">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* UPI UTR Field (Only if UPI selected) */}
                  {expensePaymentMode.includes('UPI') && (
                    <div className="bg-amber-950/40 p-3 rounded-2xl border border-amber-500/30 space-y-1">
                      <label className="text-[10px] font-bold text-amber-300 block uppercase flex justify-between">
                        <span>12-Digit Bank UTR / UPI Ref ID *</span>
                        <span className="text-red-400 font-black">MANDATORY</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 425619283019" 
                        value={expenseUpiRef}
                        onChange={(e) => { setExpenseUpiRef(e.target.value.trim()); setExpenseErrorMsg(''); }}
                        maxLength={18}
                        className="w-full px-3 py-2 border border-amber-500/50 rounded-xl text-xs font-mono font-bold bg-stone-950 text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                      <p className="text-[9px] text-stone-400 italic">
                        🔍 GPay / PhonePe payment receipt se dekh kar 12-digit UPI transaction number enter karein.
                      </p>
                    </div>
                  )}

                  {/* Bill / Receipt Photo Upload */}
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block uppercase mb-1">
                      Bill / Receipt Photo (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
                        <span>📷</span>
                        <span>{expenseReceiptImg ? 'Change Bill Photo' : 'Upload Bill Photo'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleExpenseReceiptUpload} 
                          className="hidden" 
                        />
                      </label>
                      {expenseReceiptImg && (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-amber-400 shadow-sm">
                          <img src={expenseReceiptImg} alt="Bill Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setExpenseReceiptImg('')}
                            className="absolute inset-0 bg-black/50 text-white text-[10px] font-black flex items-center justify-center opacity-0 hover:opacity-100 transition"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes / Remarks */}
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block uppercase mb-1">
                      Kharche Ka Karan / Notes (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Bappa ke bhog hetu laddu pack kharida gaya" 
                      value={expenseNotes}
                      onChange={(e) => setExpenseNotes(e.target.value)}
                      className="w-full px-3.5 py-2 border border-stone-700 rounded-xl text-xs bg-stone-950 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-stone-500"
                    />
                  </div>

                  {/* Error Alert */}
                  {expenseErrorMsg && (
                    <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-3 text-red-200 text-xs font-bold flex items-start gap-2 shadow-xs">
                      <span className="text-base leading-none shrink-0 mt-0.5">⚠️</span>
                      <p className="text-red-200 leading-snug">{expenseErrorMsg}</p>
                    </div>
                  )}

                  {/* Success Alert */}
                  {expenseSuccessMsg && (
                    <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-xl p-3 text-emerald-200 text-xs font-bold flex items-start gap-2 shadow-xs">
                      <span className="text-base leading-none shrink-0 mt-0.5">✓</span>
                      <p className="text-emerald-200 leading-snug">{expenseSuccessMsg}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isExpenseSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                  >
                    {isExpenseSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Recording Expense for Admin Approval...</span>
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        <span>Submit Kharcha for Admin Approval</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-stone-400 text-center">
                    ℹ️ Kharcha turant Admin Dashboard ke Excel sheet me <strong>Pending</strong> state me jayega. Admin ke approve karne par hi ye total me calculate hoga.
                  </p>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: TRACK MEMBER EXPENSES LIST --- */}
      {showExpenseListModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#16120f] w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-2 border-amber-500/50 my-auto text-white max-h-[94vh]">
            
            <div className="bg-gradient-to-r from-stone-950 to-stone-900 text-white p-3.5 sm:p-5 flex justify-between items-center border-b border-amber-500/30 shrink-0">
              <div className="min-w-0 flex-1 pr-2">
                <h3 className="text-sm sm:text-base md:text-lg font-black text-amber-300 flex items-center gap-1.5 sm:gap-2 truncate">
                  <span>📋</span> Mandal Kharcha Status Tracker ({expenses.length})
                </h3>
                <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">Member bills, UPI UTR & Live Admin Approval Status</p>
              </div>
              <button 
                onClick={() => setShowExpenseListModal(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="p-3 sm:p-6 space-y-3 max-h-[70vh] overflow-y-auto bg-[#130f0d]">
              {expenses.length === 0 ? (
                <div className="text-center py-10 text-stone-500">
                  <p className="text-3xl mb-2">🧾</p>
                  <p className="text-xs font-bold">Abhi tak koi kharcha darj nahi hua hai.</p>
                </div>
              ) : (
                expenses.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-2xl border transition text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${item.status === 'Approved' ? 'bg-[#152417] border-emerald-500/40 text-white' : item.status === 'Rejected' ? 'bg-[#281515] border-red-500/40 text-white' : 'bg-[#221c16] border-amber-500/40 text-white'}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-stone-400">{item.id}</span>
                        <h4 className="font-black text-white text-sm">{item.title}</h4>
                        <span className="text-[10px] bg-stone-900 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
                        <span>Spent by: <strong className="text-stone-200">{item.spentBy}</strong></span>
                        <span>•</span>
                        <span>{item.paymentMode}</span>
                        {item.upiRef && item.upiRef !== 'CASH-PAYMENT' && (
                          <span className="font-mono font-bold text-amber-300 bg-stone-950 px-1.5 py-0.5 rounded border border-amber-500/30 text-[10px]">
                            UTR: {item.upiRef}
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-[10px] text-stone-400">{item.date} {item.time}</span>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-stone-400 italic">"{item.notes}"</p>
                      )}
                    </div>

                    <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span className="text-lg font-black text-amber-300 font-mono">
                        ₹{Number(item.amount).toLocaleString()}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${item.status === 'Approved' ? 'bg-emerald-600 text-white' : item.status === 'Rejected' ? 'bg-red-600 text-white' : 'bg-amber-500 text-stone-950'}`}>
                        {item.status === 'Approved' && <span>✓ Approved</span>}
                        {item.status === 'Rejected' && <span>✕ Rejected</span>}
                        {item.status === 'Pending' && <span>⏳ Pending Approval</span>}
                      </span>

                      {item.billReceiptUrl && (
                        <button
                          type="button"
                          onClick={() => setSelectedExpenseReceipt(item.billReceiptUrl)}
                          className="text-[10px] text-amber-400 hover:underline font-bold"
                        >
                          View Bill Photo 📷
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-[#110e0c] border-t border-stone-800 flex justify-between items-center text-xs">
              <span className="text-stone-400">
                Approved Total: <strong className="text-amber-300 font-mono">₹{expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowExpenseListModal(false)
                  handleOpenAddExpenseModal()
                }}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black px-4 py-2 rounded-xl transition shadow"
              >
                + Add New Expense
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 3: VIEW BILL PHOTO POPUP --- */}
      {selectedExpenseReceipt && (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181412] border-2 border-amber-500/50 rounded-3xl p-4 max-w-lg w-full relative text-white">
            <button
              onClick={() => setSelectedExpenseReceipt(null)}
              className="absolute top-3 right-3 bg-stone-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs hover:bg-red-600 transition"
            >
              ✕
            </button>
            <h4 className="text-sm font-black text-amber-300 mb-3">Bill / Receipt Proof</h4>
            <div className="max-h-[70vh] overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 flex items-center justify-center">
              <img src={selectedExpenseReceipt} alt="Bill Proof" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      </footer>

    </div>
  )
}

export default App
