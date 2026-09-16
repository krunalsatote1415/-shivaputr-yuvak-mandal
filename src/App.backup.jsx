import { useState } from 'react'
import './App.css'
import ganpatiLogo from './assets/ganapati-logo.jpeg'

function App() {
  const [diyaCount, setDiyaCount] = useState(2157)
  const [lit, setLit] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  
  // --- AUTH STATE (Login / SignUp Modal & Status) ---
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [loggedInUser, setLoggedInUser] = useState(null)

  // Blessings State with Donation & Lucky Wish Logic
  const [blessings, setBlessings] = useState([
    { name: 'Sameer Patil', wish: 'Bappa, iss saal mandal ki sabhi ichhayein poori karna. Ganpati Bappa Morya!', amount: 101, isLuckyChosen: true },
    { name: 'Neha Deshmukh', wish: 'Mandal ke sabhi karyakartao ko shakti dena. 🙏', amount: 51, isLuckyChosen: false }
  ])
  const [wishInput, setWishInput] = useState('')
  const [wishAmount, setWishAmount] = useState('')
  const [totalWishCount, setTotalWishCount] = useState(99)
  const [wishSuccessMsg, setWishSuccessMsg] = useState('')

  // All Mandal Members
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Rahul Shinde', role: 'President / Adhyaksh', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
    { name: 'Amit Pawar', role: 'Vice President', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
    { name: 'Suraj Jadhav', role: 'Treasurer (Khajanchi)', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
    { name: 'Vicky More', role: 'Secretary', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop' },
    { name: 'Akash Mane', role: 'Lead Karyakarta', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop' },
    { name: 'Rohit Kadam', role: 'Aarti Seva Lead', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=300&auto=format&fit=crop' },
    { name: 'Swapnil Sawant', role: 'Mahaprasad Manager', img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop' },
    { name: 'Pratik Deshmukh', role: 'Decor Coordinator', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop' }
  ])
  
  // --- JOIN GROUP REQUEST & ADMIN APPROVAL STATE ---
  const [joinName, setJoinName] = useState('')
  const [joinPhone, setJoinPhone] = useState('')
  const [joinRoleInterest, setJoinRoleInterest] = useState('Volunteer / Karyakarta')
  const [joinRequests, setJoinRequests] = useState([
    { id: 1, name: 'Sanket Ghadge', phone: '9876543210', role: 'Volunteer', status: 'Pending' }
  ])
  const [showAdminJoinRequestsModal, setShowAdminJoinRequestsModal] = useState(false)
  const [joinSuccessMsg, setJoinSuccessMsg] = useState('')

  // Donation State
  const [donations, setDonations] = useState([
    { name: 'Rajesh Sharma', amount: 1100, message: 'Bappa ke charno mein samarpit.' },
    { name: 'Pooja Kulkarni', amount: 501, message: 'Sarvajanik Utsav ke liye.' }
  ])
  const [donorName, setDonorName] = useState('')
  const [donationAmount, setDonationAmount] = useState('')
  const [donationMsg, setDonationMsg] = useState('')
  const [donationSuccess, setDonationSuccess] = useState(false)

  // VIP / Aarti Booking State
  const [bookingName, setBookingName] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')
  const [sewaType, setSewaType] = useState('Morning Aarti (8:00 AM)')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Instagram Live Request & Aarti Status State
  const [isAartiLiveNow, setIsAartiLiveNow] = useState(true)
  const [liveRequested, setLiveRequested] = useState(false)
  const [liveApproved, setLiveApproved] = useState(false)
  const [reqName, setReqName] = useState('')

  // Gallery Modal & Year-wise State (2019 - 2026)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2026')

  // Year-wise Gallery Data
  const galleryData = {
    '2026': [
      { title: 'Prathama Darshan 2026', img: 'https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=500&auto=format&fit=crop' },
      { title: 'Mandap Decoration', img: 'https://images.unsplash.com/photo-1665816051851-105973b957d6?q=80&w=500&auto=format&fit=crop' }
    ],
    '2025': [
      { title: 'Utsav Sohla 2025', img: 'https://images.unsplash.com/photo-1631327343523-f2377042983b?q=80&w=500&auto=format&fit=crop' },
      { title: 'Mahaprasad Vitaran', img: 'https://images.unsplash.com/photo-1529898795450-158d032a15f2?q=80&w=500&auto=format&fit=crop' }
    ],
    '2024': [
      { title: 'Bappa Agaman 2024', img: 'https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=500&auto=format&fit=crop' },
      { title: 'Grand Aarti 2024', img: 'https://images.unsplash.com/photo-1665816051851-105973b957d6?q=80&w=500&auto=format&fit=crop' }
    ],
    '2023': [
      { title: 'Visarjan Miravnuk 2023', img: 'https://images.unsplash.com/photo-1631327343523-f2377042983b?q=80&w=500&auto=format&fit=crop' }
    ],
    '2022': [
      { title: 'COVID Relief & Utsav 2022', img: 'https://images.unsplash.com/photo-1529898795450-158d032a15f2?q=80&w=500&auto=format&fit=crop' }
    ],
    '2021': [
      { title: 'Eco-friendly Bappa 2021', img: 'https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=500&auto=format&fit=crop' }
    ],
    '2020': [
      { title: 'Saade Niyam Utsav 2020', img: 'https://images.unsplash.com/photo-1665816051851-105973b957d6?q=80&w=500&auto=format&fit=crop' }
    ],
    '2019': [
      { title: 'Golden Jubilee Vibe 2019', img: 'https://images.unsplash.com/photo-1631327343523-f2377042983b?q=80&w=500&auto=format&fit=crop' }
    ]
  }

  const handleLightDiya = (e) => {
    e.preventDefault()
    if (!visitorName.trim()) return
    setDiyaCount(prev => prev + 1)
    setLit(true)
    setTimeout(() => setLit(false), 3000) 
  }

  const handleAddBlessing = (e) => {
    e.preventDefault()
    const amt = Number(wishAmount)
    if (!wishInput.trim() || !visitorName.trim() || isNaN(amt) || amt < 5) {
      alert("Kripya apna naam, wish aur kam se kam ₹5 ya usse zyada ka daan amount enter karein!")
      return
    }

    const newCount = totalWishCount + 1
    setTotalWishCount(newCount)
    const isLucky = newCount % 100 === 0

    const newWishObj = {
      name: visitorName,
      wish: wishInput,
      amount: amt,
      isLuckyChosen: isLucky
    }

    setBlessings([newWishObj, ...blessings])
    setDonations([{ name: visitorName, amount: amt, message: 'Wish Sankalp Daan' }, ...donations])

    if (isLucky) {
      setWishSuccessMsg(`🎉 Badhai ho! Aapki wish 100th lucky draw mein Bappa dwara chuni gayi hai! 🙏`)
    } else {
      setWishSuccessMsg(`✨ Aapka wish aur ₹${amt} ka daan safalurvak darj ho gaya!`)
    }

    setWishInput('')
    setWishAmount('')
    setVisitorName('')
    setTimeout(() => setWishSuccessMsg(''), 6000)
  }

  const handleJoinGroupRequest = (e) => {
    e.preventDefault()
    if (!joinName.trim() || !joinPhone.trim()) return

    const newReq = {
      id: Date.now(),
      name: joinName,
      phone: joinPhone,
      role: joinRoleInterest,
      status: 'Pending'
    }

    setJoinRequests([newReq, ...joinRequests])
    setJoinSuccessMsg(`✨ Aapki join request safalward bheji gayi hai! Mandal Admin ke approval ke baad aap Group mein shamil ho jayenge.`)
    setJoinName('')
    setJoinPhone('')
    setTimeout(() => setJoinSuccessMsg(''), 6000)
  }

  const handleApproveJoinRequest = (reqId) => {
    const reqToApprove = joinRequests.find(r => r.id === reqId)
    if (!reqToApprove) return

    const approvedMember = {
      name: reqToApprove.name,
      role: reqToApprove.role,
      img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop'
    }

    setTeamMembers([...teamMembers, approvedMember])
    setJoinRequests(joinRequests.map(r => r.id === reqId ? { ...r, status: 'Approved' } : r))
    alert(`Success! ${reqToApprove.name} ko Group directory mein jodh diya gaya hai.`)
  }

  const handleDonate = (e) => {
    e.preventDefault()
    if (!donorName.trim() || !donationAmount) return
    setDonations([{ name: donorName, amount: Number(donationAmount), message: donationMsg || 'Ganpati Bappa Morya!' }, ...donations])
    setDonorName('')
    setDonationAmount('')
    setDonationMsg('')
    setDonationSuccess(true)
    setTimeout(() => setDonationSuccess(false), 4000)
  }

  const handleBooking = (e) => {
    e.preventDefault()
    if (!bookingName.trim() || !bookingPhone.trim() || !bookingDate) return
    setBookingSuccess(true)
    setTimeout(() => setBookingSuccess(false), 5000)
    setBookingName('')
    setBookingPhone('')
    setBookingDate('')
  }

  const handleRequestLive = (e) => {
    e.preventDefault()
    if (!reqName.trim()) return
    setLiveRequested(true)
  }

  const handleAdminApprove = () => {
    setLiveApproved(true)
  }

  // --- AUTH SUBMIT HANDLER ---
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    if (!userEmail || !userPassword) return

    if (authMode === 'signup') {
      if (!userName.trim()) {
        alert("Kripya apna naam bhi enter karein!")
        return
      }
      setLoggedInUser(userName)
      alert(`🎉 Sign Up successful! Swagat hai, ${userName}`)
    } else {
      // Login mode
      const defaultName = userEmail.split('@')[0]
      setLoggedInUser(defaultName.charAt(0).toUpperCase() + defaultName.slice(1))
      alert(`✨ Login successful! Bappa ke darbar mein swagat hai.`)
    }

    setShowAuthModal(false)
    setUserEmail('')
    setUserPassword('')
    setUserName('')
  }

  return (
    <div className="bg-stone-50 text-stone-800 font-sans min-h-screen flex flex-col justify-between">

      {/* --- PERFECTLY ALIGNED NAVBAR --- */}
      <header className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-red-600">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Left: Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 shadow-sm bg-red-50 flex items-center justify-center flex-shrink-0">
              <img src={ganpatiLogo} alt="Mandal Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-extrabold text-stone-900 tracking-tight leading-snug">Shivaputr Yuvak Mandal</h1>
              <p className="text-[10px] text-red-700 uppercase font-bold tracking-wider">Sarvajanik Ganeshotsav 2026</p>
            </div>
          </div>
          
          {/* Right: Nav Links & Login grouped neatly with balanced spacing */}
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-5 text-xs font-bold text-stone-700">
              <a href="#home" className="hover:text-red-600 transition">Home</a>
              <a href="#group-section" className="text-red-600 hover:text-red-700 transition font-extrabold bg-red-50 px-2.5 py-1 rounded-full border border-red-200">Group</a>
              <a href="#live" className="hover:text-red-600 transition">Live</a>
              <a href="#donate" className="hover:text-red-600 transition">Donate</a>
            </nav>

            {/* Login / User Status Button with Modern Icons */}
            <div className="flex items-center">
              {loggedInUser ? (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-full shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-black">👤</span>
                  <span className="text-xs font-bold text-amber-900">{loggedInUser}</span>
                  <button 
                    onClick={() => setLoggedInUser(null)} 
                    className="text-[10px] text-red-600 font-bold hover:underline ml-1"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Login Button with Key/User Icon */}
                  <button 
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    className="bg-stone-900 hover:bg-stone-950 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h2a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h2m4 0V5a3 3 0 00-6 0v2m6 0H9"></path>
                    </svg>
                    Login
                  </button>

                  {/* Sign Up Button with User-Plus Icon */}
                  <button 
                    onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow hidden sm:flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                    </svg>
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* --- AUTH MODAL (LOGIN & SIGNUP) --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 bg-stone-100 hover:bg-red-600 hover:text-white text-stone-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition"
            >
              ✕
            </button>

            <div className="text-center mb-6 mt-2">
              <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-600 rounded-2xl mx-auto flex items-center justify-center text-xl mb-2 shadow-sm">
                {authMode === 'login' ? '🔑' : '✨'}
              </div>
              <h3 className="text-2xl font-black text-stone-950">
                {authMode === 'login' ? 'Welcome Back!' : 'Create Account'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {authMode === 'login' ? 'Shivaputr Yuvak Mandal Portal mein login karein' : 'Mandal parivar ka hissa banne ke liye register karein'}
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authMode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Login
              </button>
              <button 
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authMode === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-sm tracking-wide mt-2"
              >
                {authMode === 'login' ? 'Login to Account 🔑' : 'Complete Sign Up ✨'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative text-white py-24 md:py-32 px-4 overflow-hidden bg-stone-950">
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
          <img 
            src="/ganapti-homescreen-image.jpeg" 
            alt="Ganpati Wallpaper" 
            className="w-full h-full object-cover transform scale-105 filter brightness-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center md:text-left">
          <span className="inline-block bg-amber-500 text-stone-950 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-lg">
            🙏 Ganpati Bappa Morya 🙏
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 drop-shadow-2xl leading-tight text-white">
            Welcome to <span className='text-amber-300 drop-shadow-md'>Shivaputr Yuvak Mandal</span> Ganeshotsav
          </h2>
          <p className="text-lg md:text-xl text-stone-100 mb-8 max-w-2xl drop-shadow-md font-medium">
            Join our official mandal group, meet our core team, and participate in all sacred festivities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <a href="#join-group" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl transition text-center">
              Join Mandal Group 🤝
            </a>
            <a href="#group-section" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl transition text-center">
              View Group Members 👥
            </a>
          </div>
        </div>
      </section>

      {/* --- SECTION 1: HOME PAGE MAIN 5 TEAM MEMBERS --- */}
      <section id="team" className="py-16 px-4 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
            <div>
              <span className="text-red-600 text-xs font-extrabold uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-200">Leadership Parivar</span>
              <h3 className="text-3xl font-black text-stone-950 mt-2">Main Committee Members</h3>
              <p className="text-stone-600 text-sm mt-1">Yeh home page par dikhne wale mukhya karyakarta hain. Baaki sabhi sadasy 'Group' section mein hain.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {teamMembers.slice(0, 5).map((member, index) => (
              <div key={index} className="bg-stone-50 border border-stone-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center group">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-amber-500 shadow-md mb-4 bg-stone-200 transform group-hover:scale-105 transition duration-300">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-extrabold text-stone-900 text-base">{member.name}</h4>
                <p className="text-[11px] text-red-700 font-bold mt-1 bg-red-50 px-3 py-1 rounded-full border border-red-100">{member.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="#group-section" className="inline-block bg-stone-900 hover:bg-stone-950 text-white font-bold px-8 py-3 rounded-2xl text-xs shadow transition">
              View All {teamMembers.length} Members in 'Group' Section ↓
            </a>
          </div>

        </div>
      </section>

      {/* --- SECTION 2: GROUP SECTION --- */}
      <section id="group-section" className="py-20 px-4 bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto">
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 border-2 border-amber-500/50">
            <div className="aspect-[21/9] md:aspect-[3/1] w-full">
              <img 
                src="https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=1400&auto=format&fit=crop" 
                alt="Mandal Group Photo Wallpaper" 
                className="w-full h-full object-cover filter brightness-90"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex flex-col justify-end p-6 md:p-10 text-center">
              <span className="text-amber-400 text-xs font-extrabold uppercase tracking-widest bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-500/30 w-fit mx-auto mb-2">
                🏛️ Shivaputr Yuvak Mandal Full Group Directory
              </span>
              <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                Group Members ({teamMembers.length} Members)
              </h3>
              <p className="text-stone-300 text-xs md:text-sm mt-2 max-w-xl mx-auto">
                Yahan mandal ke sabhi karyakarta aur sadasy gol-gol round photos ke sath jude hue hain. Har naya member admin approval ke baad yahan add hota hai.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-stone-800 border border-stone-700/80 p-6 rounded-3xl shadow-xl hover:border-amber-500 transition duration-300 flex flex-col items-center text-center group">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-amber-500 shadow-md mb-4 bg-stone-700 transform group-hover:scale-105 transition duration-300">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-extrabold text-white text-sm md:text-base">{member.name}</h4>
                <p className="text-[11px] text-amber-300 font-bold mt-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">{member.role}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- JOIN GROUP SECTION --- */}
      <section id="join-group" className="py-16 px-4 bg-stone-100 border-b border-stone-200">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-stone-200">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-red-600 text-xs font-extrabold uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-200">Become a Member</span>
            <h3 className="text-3xl font-black text-stone-950 mt-2">Join Shivaputr Yuvak Mandal Group</h3>
            <p className="text-stone-600 text-sm mt-1">Apna naam aur mobile number darj karke Group mein shamil hone ki request bhejein. Admin approval ke baad aapka naam upar wale 'Group' section mein jud jayega!</p>
          </div>

          {joinSuccessMsg && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-900 p-4 rounded-2xl text-center text-xs font-bold animate-pulse shadow-sm">
              {joinSuccessMsg}
            </div>
          )}

          <form onSubmit={handleJoinGroupRequest} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Your Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your Name" 
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Mobile Number (WhatsApp)</label>
              <input 
                type="tel" 
                placeholder="10-digit mobile number" 
                value={joinPhone}
                onChange={(e) => setJoinPhone(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Role / Interest</label>
              <select 
                value={joinRoleInterest}
                onChange={(e) => setJoinRoleInterest(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50 font-medium"
              >
                <option value="Volunteer / Karyakarta">Volunteer / Karyakarta</option>
                <option value="Aarti Seva Member">Aarti Seva Member</option>
                <option value="Mahaprasad Team">Mahaprasad Team</option>
                <option value="General Member">General Member</option>
              </select>
            </div>

            <div className="md:col-span-3 pt-2">
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-sm tracking-wide">
                Submit Join Request to Admin 🤝
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 flex justify-between items-center">
            <p className="text-xs text-stone-500 font-medium">Are you an Admin? Manage pending join requests instantly.</p>
            <button 
              onClick={() => setShowAdminJoinRequestsModal(true)}
              className="bg-stone-900 hover:bg-stone-950 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
            >
              Open Admin Requests ({joinRequests.filter(r => r.status === 'Pending').length} Pending) ⚙️
            </button>
          </div>
        </div>
      </section>

      {/* --- ADMIN JOIN REQUESTS MODAL --- */}
      {showAdminJoinRequestsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-stone-950 text-white p-5 flex justify-between items-center border-b border-stone-800">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>🔒</span> Admin Panel: Mandal Join Requests
                </h3>
                <p className="text-xs text-stone-400">Approve requests so new members successfully join the Group directory.</p>
              </div>
              <button 
                onClick={() => setShowAdminJoinRequestsModal(false)}
                className="bg-stone-800 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-stone-50 space-y-3">
              {joinRequests.length === 0 ? (
                <p className="text-center text-xs text-stone-500 py-8">Koi pending join request nahi hai.</p>
              ) : (
                joinRequests.map((req) => (
                  <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">{req.name}</h4>
                      <p className="text-xs text-stone-600">Phone: {req.phone} • Role: <span className="text-red-600 font-bold">{req.role}</span></p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        Status: {req.status}
                      </span>
                    </div>

                    <div>
                      {req.status === 'Pending' ? (
                        <button 
                          onClick={() => handleApproveJoinRequest(req.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
                        >
                          Approve & Add to Group ✓
                        </button>
                      ) : (
                        <span className="text-xs text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                          ✓ Joined Successfully
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-stone-100 p-4 border-t border-stone-200 text-center">
              <button 
                onClick={() => setShowAdminJoinRequestsModal(false)}
                className="bg-stone-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-stone-950 transition"
              >
                Close Requests Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- INSTAGRAM LIVE SECTION --- */}
      <section id="live" className="py-16 px-4 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-stone-50 p-5 rounded-3xl shadow-xl border border-stone-200">
              <div className="flex flex-wrap justify-between items-center mb-4 px-2 gap-2">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-stone-950 flex items-center gap-2">
                    <span className={isAartiLiveNow || liveApproved ? 'text-red-600 animate-pulse' : 'text-stone-400'}>●</span> 
                    Instagram Live Darshan 
                  </h3>
                  <a href="https://instagram.com/shivputr_yuvak_mandal" target="_blank" rel="noopener noreferrer" className="text-xs text-pink-600 font-bold hover:underline">
                    @shivputr_yuvak_mandal
                  </a>
                </div>

                <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-200 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-stone-700">Aarti Live Status:</span>
                  <button 
                    onClick={() => setIsAartiLiveNow(!isAartiLiveNow)} 
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold text-white transition ${isAartiLiveNow ? 'bg-red-600' : 'bg-stone-500'}`}
                  >
                    {isAartiLiveNow ? 'ON (Live Aarti)' : 'OFF'}
                  </button>
                </div>
              </div>

              {isAartiLiveNow || liveApproved ? (
                <div className="space-y-3">
                  <div className="aspect-video bg-stone-900 rounded-2xl overflow-hidden shadow-inner relative flex flex-col items-center justify-center text-center p-6 text-white border-2 border-pink-500">
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse">
                      LIVE ON INSTAGRAM
                    </div>
                    <span className="text-5xl mb-2">📸</span>
                    <h4 className="text-lg font-bold">Shivaputr Yuvak Mandal Live Feed</h4>
                    <p className="text-xs text-stone-300 max-w-sm mt-1">Aarti / Darshan is currently active. Enjoy divine blessings directly from Instagram!</p>
                    <a 
                      href="https://instagram.com/shivputr_yuvak_mandal" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition"
                    >
                      Open in Instagram App ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-stone-900 rounded-2xl overflow-hidden shadow-inner relative flex flex-col items-center justify-center text-center p-6 text-white">
                  <span className="text-4xl mb-2">🔒</span>
                  <h4 className="text-lg font-bold">Live Darshan Not Active Right Now</h4>
                  <p className="text-xs text-stone-400 max-w-sm mt-1">Koi aarti ya live session nahi chal raha hai.</p>
                  
                  {!liveRequested ? (
                    <form onSubmit={handleRequestLive} className="mt-4 flex gap-2 w-full max-w-md">
                      <input 
                        type="text" 
                        placeholder="Enter your name for request" 
                        value={reqName}
                        onChange={(e) => setReqName(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs text-stone-900 bg-white focus:outline-none flex-1"
                        required
                      />
                      <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs transition">
                        Request Live 🙏
                      </button>
                    </form>
                  ) : (
                    <div className="mt-4 bg-amber-500/20 border border-amber-500 text-amber-300 p-3 rounded-xl text-xs max-w-sm">
                      ⏳ Request sent successfully! Waiting for admin...
                      <div className="mt-2">
                        <button onClick={handleAdminApprove} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-[10px] font-bold">
                          [Admin Demo]: Click to Approve Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div id="diya" className="bg-stone-50 p-6 md:p-8 rounded-3xl shadow-xl border border-stone-200 text-center">
                <span className="text-amber-600 text-4xl mb-2 block animate-bounce">🪔</span>
                <h4 className="text-xl font-bold text-stone-900 mb-1">Light a Digital Diya</h4>
                <p className="text-xs text-stone-600 mb-6">Contribute your devotion to the mandap glow.</p>
                
                {!lit ? (
                  <form onSubmit={handleLightDiya} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Enter your Name" 
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-white"
                      required
                    />
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow transition">
                      Light Diya Now ✨
                    </button>
                  </form>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-lg text-center space-y-1 animate-bounce">
                    <span className="text-3xl">✨</span>
                    <p className="font-bold text-sm">Diya Lit Successfully!</p>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-stone-100">
                    <p className="text-3xl font-black text-red-700">{diyaCount.toLocaleString()}</p>
                    <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Total Diyas Lit Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DONATE SECTION --- */}
      <section id="donate" className="py-16 px-4 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-amber-600 text-xs font-extrabold uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Devotee Contribution</span>
            <h3 className="text-3xl font-black text-stone-950 mt-2">Bappa Utsav Daan / Donation</h3>
            <p className="text-stone-600 text-sm mt-1">Aapka yogdaan mandap ki vyavastha aur mahaprasad aayojan mein sahayak hota hai.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="bg-stone-50 p-6 md:p-8 rounded-3xl shadow-md border border-stone-200">
              <h4 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span>💛</span> Offer Your Daan Online
              </h4>

              {donationSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-center text-sm font-semibold animate-pulse">
                  🙏 Dhanyawad! Aapka daan safal raha. Bappa ki kripa bani rahe.
                </div>
              )}

              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Devotee Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name" 
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Donation Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 501, 1100, 2100" 
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Personal Message (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Family well-being sankalp" 
                    value={donationMsg}
                    onChange={(e) => setDonationMsg(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-white"
                  />
                </div>

                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-sm">
                  Proceed to Pay & Donate 🙏
                </button>
              </form>
            </div>

            <div className="bg-stone-50 p-6 md:p-8 rounded-3xl shadow-md border border-stone-200">
              <h4 className="text-xl font-bold text-stone-900 mb-4 flex items-center justify-between">
                <span>🏆 Donor Wall of Fame</span>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">Recent Blessings</span>
              </h4>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {donations.map((donor, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-stone-900 text-sm">{donor.name}</p>
                      <p className="text-xs text-stone-500 italic mt-0.5">"{donor.message}"</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 font-black text-xs px-2.5 py-1 rounded-lg">₹{donor.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VIP PASS SECTION --- */}
      <section id="booking" className="py-16 px-4 bg-stone-50 border-b border-stone-200">
        <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-stone-200">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-red-600 text-xs font-extrabold uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-200">Priority Entry</span>
            <h3 className="text-3xl font-black text-stone-950 mt-2">Book Aarti Slot / VIP Darshan</h3>
            <p className="text-stone-600 text-sm mt-1">Bheed se bachne ke liye apna darshan ya aarti slot pehle hi book karein.</p>
          </div>

          {bookingSuccess && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl text-center text-sm font-bold shadow-sm animate-bounce">
              🎉 Aarti/VIP Slot Booked Successfully! Aapka pass SMS aur WhatsApp par bhej diya gaya hai. Bappa Morya!
            </div>
          )}

          <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Devotee Full Name</label>
              <input 
                type="text" 
                placeholder="Enter full name" 
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Mobile Number (WhatsApp)</label>
              <input 
                type="tel" 
                placeholder="10-digit mobile number" 
                value={bookingPhone}
                onChange={(e) => setBookingPhone(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Select Darshan / Aarti Type</label>
              <select 
                value={sewaType}
                onChange={(e) => setSewaType(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50 font-medium"
              >
                <option value="Morning Aarti (8:00 AM)">Morning Aarti (8:00 AM)</option>
                <option value="Evening Mahā-Aarti (7:30 PM)">Evening Mahā-Aarti (7:30 PM)</option>
                <option value="VIP Quick Darshan Slot (Anytime)">VIP Quick Darshan Pass (Anytime)</option>
                <option value="Sheja Aarti (10:00 PM)">Sheja Aarti (10:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Preferred Date</label>
              <input 
                type="date" 
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm bg-stone-50 font-medium"
                required
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition text-base tracking-wide">
                Confirm & Generate VIP Pass 🎫
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* --- GALLERY SECTION --- */}
      <section id="gallery" className="py-16 px-4 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              
              <div>
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-stone-950">Utsav Gallery 📸</h3>
                    <button 
                      onClick={() => setIsGalleryOpen(true)}
                      className="text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition"
                    >
                      View All Years (2019 - 2026) 📁
                    </button>
                  </div>
                  <p className='text-stone-600 text-sm mb-6'>Recent moments from 2026 decorations & daily aartis.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div onClick={() => setIsGalleryOpen(true)} className="cursor-pointer group relative overflow-hidden rounded-2xl shadow-md border border-stone-100 aspect-square">
                        <img src="https://images.unsplash.com/photo-1694008174756-ed6a178c2794?q=80&w=300&auto=format&fit=crop" alt="Ganpati Idol" className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                          <p className="text-white text-xs font-bold">2026 Recent Darshan</p>
                        </div>
                      </div>

                      <div onClick={() => setIsGalleryOpen(true)} className="cursor-pointer group relative overflow-hidden rounded-2xl shadow-md border border-stone-100 aspect-square">
                        <img src="https://images.unsplash.com/photo-1665816051851-105973b957d6?q=80&w=300&auto=format&fit=crop" alt="Aarti Thali" className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                          <p className="text-white text-xs font-bold">Aarti Celebrations</p>
                        </div>
                      </div>
                  </div>

                  <div 
                    onClick={() => setIsGalleryOpen(true)}
                    className="mt-4 bg-gradient-to-r from-red-600 to-amber-600 text-white p-4 rounded-2xl shadow-md cursor-pointer hover:opacity-95 transition flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-200">Mandal Memory Vault</p>
                      <p className="text-base font-black">Explore All Years Ganpati Images (2019 - 2026)</p>
                    </div>
                    <span className="text-2xl font-bold bg-white/20 p-2 rounded-xl">📂</span>
                  </div>
              </div>

              {/* Blessings Wall */}
              <div id="blessings" className="bg-stone-50 border border-stone-200 p-6 md:p-8 rounded-3xl shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xl md:text-2xl font-bold text-stone-950">💛 Bappa Blessings Wall</h3>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">1 in 100 Lucky Wish</span>
                  </div>
                  <p className='text-xs text-stone-600 mb-4'>Wish mangne ke liye kam se kam ₹5 ka daan anivarya hai.</p>
                  
                  {wishSuccessMsg && (
                    <div className="mb-4 bg-amber-100 border border-amber-300 text-amber-950 p-3 rounded-xl text-xs font-bold text-center animate-bounce">
                      {wishSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleAddBlessing} className="mb-6 space-y-3 bg-white p-4 rounded-2xl shadow-inner border border-stone-200">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Your Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter your Name" 
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Daan Amount (Min ₹5)</label>
                        <input 
                          type="number" 
                          min="5"
                          placeholder="e.g. ₹51, ₹101" 
                          value={wishAmount}
                          onChange={(e) => setWishAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Your Wish to Bappa</label>
                        <textarea 
                           placeholder="Bappa, please bless my family... 🙏"
                           value={wishInput}
                           onChange={(e) => setWishInput(e.target.value)}
                           rows="2"
                           className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs resize-none"
                           required
                        ></textarea>
                      </div>

                      <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-xs transition shadow flex items-center justify-center gap-1">
                        <span>Donate & Submit Wish</span> <span>✨</span>
                      </button>
                  </form>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {blessings.map((item, index) => (
                        <div key={index} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${item.isLuckyChosen ? 'border-red-600 bg-red-50/50' : 'border-amber-500'} border-t border-r border-b border-stone-100 relative`}>
                          {item.isLuckyChosen && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase animate-pulse">
                              ⭐ 100th Lucky Wish Selected!
                            </span>
                          )}
                          <p className="text-stone-800 text-xs italic">"{item.wish}"</p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-[11px] text-amber-900 font-bold">— {item.name}</p>
                            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-md">Daan: ₹{item.amount}</span>
                          </div>
                        </div>
                      ))}
                  </div>
              </div>

            </div>
        </div>
      </section>

      {/* --- YEAR-WISE GALLERY MODAL --- */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-stone-950 text-white p-5 flex justify-between items-center border-b border-stone-800">
              <div>
                <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <span>🏛️</span> Shivaputr Yuvak Mandal Gallery Archive
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

            <div className="bg-stone-100 p-3 border-b border-stone-200 flex gap-2 overflow-x-auto">
              {Object.keys(galleryData).map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-sm ${selectedYear === year ? 'bg-red-600 text-white shadow-md' : 'bg-white text-stone-700 hover:bg-stone-200'}`}
                >
                  {year} Utsav
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-stone-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-extrabold text-stone-900">
                  Showing Memories for <span className="text-red-600">Year {selectedYear}</span>
                </h4>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
                  {galleryData[selectedYear].length} Photos Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {galleryData[selectedYear].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 group">
                    <div className="aspect-video overflow-hidden bg-stone-900">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-stone-900 text-xs">{item.title}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">Shivaputr Yuvak Mandal • {selectedYear}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-stone-100 p-4 border-t border-stone-200 text-center">
              <button 
                onClick={() => setIsGalleryOpen(false)}
                className="bg-stone-900 hover:bg-stone-950 text-white px-6 py-2 rounded-xl text-xs font-bold transition"
              >
                Close Gallery Archive
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="bg-stone-950 text-stone-300 pt-12 pb-6 px-4 border-t-4 border-amber-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
          
          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500 bg-white flex items-center justify-center">
                <img src={ganpatiLogo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-white">Shivaputr Yuvak Mandal</h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Celebrating Sarvajanik Ganeshotsav with devotion, cultural unity, and social welfare.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Quick Links</h4>
            <ul className="text-xs space-y-1.5 font-medium">
              <li><a href="#home" className="hover:text-amber-400 transition">Home</a></li>
              <li><a href="#group-section" className="hover:text-amber-400 transition">Group (All Members)</a></li>
              <li><a href="#live" className="hover:text-amber-400 transition">Live Darshan</a></li>
              <li><a href="#donate" className="hover:text-amber-400 transition">Donate</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Connect & Social Handles</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Main Mandap Premises, Sarvajanik Chowk, City - 400001.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <a href="https://instagram.com/shivputr_yuvak_mandal" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-90">
                Instagram (@shivputr_yuvak_mandal)
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-stone-800 pt-6 text-center text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>Shivaputr Yuvak Mandal © 2026. All Rights Reserved.</p>
          <p className="text-amber-500 font-semibold">Designed with bhakti for all Bappa devotees 🙏</p>
        </div>
      </footer>

    </div>
  )
}

export default App