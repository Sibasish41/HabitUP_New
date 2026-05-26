import { useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const demoAccounts = [
  { role: 'Member', apiRole: 'USER', name: 'Aarav Mehta', email: 'user@habitup.app', password: 'password123' },
  { role: 'Doctor', apiRole: 'DOCTOR', name: 'Dr. Riya Sharma', email: 'doctor@habitup.app', password: 'password123' },
  { role: 'Coach', apiRole: 'COACH', name: 'Kabir Sethi', email: 'coach@habitup.app', password: 'password123' },
  { role: 'Admin', apiRole: 'ADMIN', name: 'HabitUP Admin', email: 'admin@habitup.app', password: 'password123' },
]

const fallbackPlatform = {
  subscriptions: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      cadence: 'month',
      features: ['Habit tracking', 'Daily thoughts', 'Basic progress insights'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 799,
      cadence: 'month',
      features: ['Advanced analytics', 'Coach messaging', 'Guided programs'],
    },
    {
      id: 'care',
      name: 'Care Plus',
      price: 1999,
      cadence: 'month',
      features: ['Doctor consultations', 'Personal plan', 'Family reports'],
    },
  ],
  thoughts: [
    {
      id: 'local_001',
      title: 'Small wins compound',
      category: 'Habits',
      author: 'HabitUP Editorial',
      content: 'Track the small wins closely. They are proof your identity is already changing.',
    },
    {
      id: 'local_002',
      title: 'Rest is training',
      category: 'Sleep',
      author: 'Dr. Riya Sharma',
      content: 'Recovery is not a pause from growth. It is the condition that lets growth continue.',
    },
  ],
  providers: [
    { id: 'doc_001', name: 'Dr. Riya Sharma', role: 'DOCTOR', plan: 'Provider' },
    { id: 'coa_001', name: 'Kabir Sethi', role: 'COACH', plan: 'Provider' },
  ],
}

const fallbackDashboard = {
  role: 'USER',
  stats: [
    { label: 'Current streak', value: '18 days', trend: '+3' },
    { label: 'Weekly completion', value: '81%', trend: '+9%' },
    { label: 'Coach check-ins', value: '2', trend: 'This week' },
    { label: 'Wellness score', value: '74', trend: '+5' },
  ],
  habits: [
    { id: 'hab_001', title: 'Morning breathwork', category: 'Mindfulness', streak: 18, target: '10 min', completion: 86 },
    { id: 'hab_002', title: 'Evening walk', category: 'Fitness', streak: 11, target: '30 min', completion: 74 },
    { id: 'hab_003', title: 'Sleep journal', category: 'Sleep', streak: 7, target: '1 entry', completion: 64 },
  ],
  consultations: [
    {
      id: 'con_001',
      user: 'Aarav Mehta',
      provider: 'Dr. Riya Sharma',
      type: 'Doctor',
      topic: 'Stress and sleep review',
      status: 'Scheduled',
      startsAt: '2026-05-28T10:30:00.000Z',
    },
  ],
}

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('habitup_token')
    const user = localStorage.getItem('habitup_user')
    return token && user ? { token, user: JSON.parse(user) } : null
  })
  const [platform, setPlatform] = useState(fallbackPlatform)

  useEffect(() => {
    fetch(`${API_URL}/platform`)
      .then((response) => response.json())
      .then(setPlatform)
      .catch(() => setPlatform(fallbackPlatform))
  }, [])

  const saveAuth = (payload) => {
    localStorage.setItem('habitup_token', payload.token)
    localStorage.setItem('habitup_user', JSON.stringify(payload.user))
    setAuth(payload)
  }

  const logout = () => {
    localStorage.removeItem('habitup_token')
    localStorage.removeItem('habitup_user')
    setAuth(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing platform={platform} auth={auth} logout={logout} />} />
        <Route path="/login" element={<AuthPage mode="login" saveAuth={saveAuth} />} />
        <Route path="/signup" element={<AuthPage mode="signup" saveAuth={saveAuth} />} />
        <Route
          path="/app"
          element={
            <Protected auth={auth}>
              <Dashboard auth={auth} logout={logout} platform={platform} />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function Landing({ platform, auth, logout }) {
  return (
    <main className="app-shell">
      <Nav auth={auth} logout={logout} />
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">HabitUP Wellness Platform</span>
          <h1>Guided habits, expert care, and content that keeps members moving.</h1>
          <p>
            A full wellness operating system for members, doctors, coaches, admins,
            subscriptions, consultations, and daily thought-led engagement.
          </p>
          <div className="hero-actions">
            <Link className="primary-btn" to={auth ? '/app' : '/signup'}>Start platform</Link>
            <Link className="secondary-btn" to="/login">View demo roles</Link>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/assets/backgroundimage.png" alt="HabitUP wellness meditation space" />
          <div className="hero-panel">
            <div className="panel-header">
              <span>Today</span>
              <strong>81% completion</strong>
            </div>
            {fallbackDashboard.habits.map((habit) => (
              <ProgressRow key={habit.id} item={habit} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-grid" id="programs">
        <FeatureCard title="Members" text="Habit plans, streaks, progress scoring, wellness content, and care subscriptions." />
        <FeatureCard title="Doctors and Coaches" text="Provider dashboards for assigned members, follow-ups, consultations, and content contribution." />
        <FeatureCard title="Admin Operations" text="Role approvals, subscription visibility, content review, growth metrics, and support queues." />
      </section>

      <section className="care-section" id="care">
        <div>
          <span className="eyebrow">Care Network</span>
          <h2>Members can move from habits to human support without leaving HabitUP.</h2>
        </div>
        <div className="provider-grid">
          {platform.providers.map((provider) => (
            <article className="provider-card" key={provider.id}>
              <div className="avatar">{provider.name.slice(0, 1)}</div>
              <div>
                <strong>{provider.name}</strong>
                <span>{provider.role === 'DOCTOR' ? 'Doctor consultation' : 'Coach accountability'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band" id="content">
        <div>
          <span className="eyebrow">Daily Thoughts</span>
          <h2>Content that feels part of the habit loop.</h2>
        </div>
        <div className="thought-grid">
          {platform.thoughts.map((thought) => (
            <article className="thought-card" key={thought.id}>
              <span>{thought.category}</span>
              <h3>{thought.title}</h3>
              <p>{thought.content}</p>
              <small>{thought.author}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div>
          <span className="eyebrow">Subscriptions</span>
          <h2>Plans ready for payments integration.</h2>
        </div>
        <div className="pricing-grid">
          {platform.subscriptions.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
    </main>
  )
}

function Nav({ auth, logout }) {
  return (
    <header className="top-nav">
      <Link to="/" className="brand">HabitUP.</Link>
      <nav>
        <a href="#programs">Programs</a>
        <a href="#care">Care</a>
        <a href="#pricing">Pricing</a>
        {auth ? (
          <>
            <Link to="/app">Dashboard</Link>
            <button className="text-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link className="nav-cta" to="/login">Login</Link>
        )}
      </nav>
    </header>
  )
}

function AuthPage({ mode, saveAuth }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: 'user@habitup.app',
    password: 'password123',
    role: 'USER',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.message || 'Authentication failed.')
      }

      saveAuth(payload)
      navigate('/app')
    } catch (err) {
      const demoAccount = demoAccounts.find(
        (account) => account.email === form.email && account.password === form.password,
      )

      if (mode === 'login' && demoAccount) {
        saveAuth({
          token: 'local-demo-token',
          user: {
            id: `demo_${demoAccount.apiRole.toLowerCase()}`,
            name: demoAccount.name,
            email: demoAccount.email,
            role: demoAccount.apiRole,
            status: 'ACTIVE',
            plan: demoAccount.apiRole === 'USER' ? 'Premium' : 'Provider',
          },
        })
        navigate('/app')
        return
      }

      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-layout">
      <Link to="/" className="brand">HabitUP.</Link>
      <section className="auth-card">
        <div>
          <span className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create account'}</span>
          <h1>{mode === 'login' ? 'Login to your wellness workspace.' : 'Join the HabitUP platform.'}</h1>
        </div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label>
                Name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </label>
              <label>
                Role
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                  <option value="USER">Member</option>
                  <option value="COACH">Coach</option>
                  <option value="DOCTOR">Doctor</option>
                </select>
              </label>
            </>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        {mode === 'login' && (
          <div className="demo-box">
            <strong>Demo accounts</strong>
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => setForm({ ...form, email: account.email, password: account.password })}
              >
                {account.role}
              </button>
            ))}
          </div>
        )}

        <p className="switch-auth">
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
          <Link to={mode === 'login' ? '/signup' : '/login'}>
            {mode === 'login' ? 'Sign up' : 'Login'}
          </Link>
        </p>
      </section>
    </main>
  )
}

function Protected({ auth, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />
  }

  return children
}

function Dashboard({ auth, logout, platform }) {
  const [dashboard, setDashboard] = useState(fallbackDashboard)
  const role = auth.user.role

  useEffect(() => {
    fetch(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then((response) => response.json())
      .then(setDashboard)
      .catch(() => setDashboard({ ...fallbackDashboard, role }))
  }, [auth.token, role])

  const title = useMemo(() => {
    if (role === 'ADMIN') return 'Admin Console'
    if (role === 'DOCTOR') return 'Doctor Workbench'
    if (role === 'COACH') return 'Coach Workbench'
    return 'Member Dashboard'
  }, [role])

  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <Link to="/" className="brand">HabitUP.</Link>
        <a href="#overview">Overview</a>
        <a href="#habits">Habits</a>
        <a href="#consultations">Consultations</a>
        <a href="#content">Thoughts</a>
        <a href="#plans">Subscriptions</a>
        {role === 'ADMIN' && <a href="#admin">Admin</a>}
        <button className="text-btn" onClick={logout}>Logout</button>
      </aside>

      <section className="workspace">
        <div className="workspace-header">
          <div>
            <span className="eyebrow">{auth.user.role}</span>
            <h1>{title}</h1>
            <p>Daily operations, care activity, and progress signals in one workspace.</p>
          </div>
          <div className="user-pill">{auth.user.name}</div>
        </div>

        <div className="metric-grid" id="overview">
          {dashboard.stats?.map((stat) => (
            <MetricCard key={stat.label} stat={stat} />
          ))}
        </div>

        {role === 'ADMIN' ? (
          <AdminView dashboard={dashboard} platform={platform} />
        ) : ['COACH', 'DOCTOR'].includes(role) ? (
          <ProviderView dashboard={dashboard} />
        ) : (
          <MemberView dashboard={dashboard} platform={platform} />
        )}
      </section>
    </main>
  )
}

function MemberView({ dashboard, platform }) {
  return (
    <>
      <section className="workspace-section" id="habits">
        <div className="section-heading">
          <h2>Habit Plan</h2>
          <button className="secondary-btn">Add habit</button>
        </div>
        <div className="habit-list">
          {dashboard.habits?.map((habit) => <ProgressRow key={habit.id} item={habit} />)}
        </div>
      </section>

      <section className="two-column">
        <ConsultationPanel consultations={dashboard.consultations || []} />
        <ThoughtPanel thoughts={platform.thoughts} />
      </section>
    </>
  )
}

function ProviderView({ dashboard }) {
  return (
    <section className="workspace-section" id="consultations">
      <div className="section-heading">
        <h2>Care Queue</h2>
        <button className="secondary-btn">Create note</button>
      </div>
      <ConsultationTable consultations={dashboard.consultations || []} />
    </section>
  )
}

function AdminView({ dashboard, platform }) {
  return (
    <div className="two-column">
      <section className="workspace-section" id="admin">
        <div className="section-heading">
          <h2>Operations Queue</h2>
          <button className="secondary-btn">Review</button>
        </div>
        <ul className="queue-list">
          {dashboard.queue?.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="workspace-section">
        <div className="section-heading">
          <h2 id="plans">Plans</h2>
          <button className="secondary-btn">Edit pricing</button>
        </div>
        <div className="mini-plan-list">
          {platform.subscriptions.map((plan) => (
            <div key={plan.id}>
              <strong>{plan.name}</strong>
              <span>Rs. {plan.price}/{plan.cadence}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function MetricCard({ stat }) {
  return (
    <article className="metric-card">
      <span>{stat.label}</span>
      <strong>{stat.value}</strong>
      <small>{stat.trend}</small>
    </article>
  )
}

function ProgressRow({ item }) {
  return (
    <article className="progress-row">
      <div>
        <strong>{item.title}</strong>
        <span>{item.category} | {item.target} | {item.streak} day streak</span>
      </div>
      <div className="progress-track">
        <div style={{ width: `${item.completion}%` }} />
      </div>
      <b>{item.completion}%</b>
    </article>
  )
}

function ConsultationPanel({ consultations }) {
  return (
    <section className="workspace-section" id="consultations">
      <div className="section-heading">
        <h2>Consultations</h2>
        <button className="secondary-btn">Book</button>
      </div>
      <ConsultationTable consultations={consultations} />
    </section>
  )
}

function ConsultationTable({ consultations }) {
  return (
    <div className="table-list">
      {consultations.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.topic}</strong>
            <span>{item.user} with {item.provider}</span>
          </div>
          <span>{item.status}</span>
        </article>
      ))}
      {consultations.length === 0 && <p>No consultations scheduled yet.</p>}
    </div>
  )
}

function ThoughtPanel({ thoughts }) {
  return (
    <section className="workspace-section" id="content">
      <div className="section-heading">
        <h2>Thoughts</h2>
        <button className="secondary-btn">Submit</button>
      </div>
      {thoughts.slice(0, 2).map((thought) => (
        <article className="compact-thought" key={thought.id}>
          <span>{thought.category}</span>
          <strong>{thought.title}</strong>
          <p>{thought.content}</p>
        </article>
      ))}
    </section>
  )
}

function FeatureCard({ title, text }) {
  return (
    <article className="feature-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function PlanCard({ plan }) {
  return (
    <article className={`plan-card ${plan.id === 'premium' ? 'featured-plan' : ''}`}>
      <span>{plan.name}</span>
      <strong>Rs. {plan.price}<small>/{plan.cadence}</small></strong>
      <ul>
        {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
      </ul>
      <button className="secondary-btn">Choose plan</button>
    </article>
  )
}

export default App
