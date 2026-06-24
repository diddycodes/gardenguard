// Project structure and key source code for the Open Source transparency page

export const techStack = [
  { name: "React 18", category: "Framework" },
  { name: "Vite", category: "Build Tool" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Framer Motion", category: "Animation" },
  { name: "React Router", category: "Routing" },
  { name: "Base44 BaaS", category: "Backend" },
  { name: "Lucide Icons", category: "Icons" },
  { name: "shadcn/ui", category: "UI Components" },
];

export const projectTree = [
  {
    folder: "src/",
    files: [
      { name: "App.jsx", desc: "Root router — defines all routes, auth guards, and providers" },
      { name: "main.jsx", desc: "Vite entry point" },
      { name: "index.css", desc: "Design tokens, theme colors, global styles" },
    ],
  },
  {
    folder: "src/pages/",
    files: [
      { name: "Home.jsx", desc: "Landing page with stats and CTA" },
      { name: "Reports.jsx", desc: "Searchable, filterable scammer watchlist" },
      { name: "ReportDetail.jsx", desc: "Full report view with evidence and comments" },
      { name: "SubmitReport.jsx", desc: "Report submission form with evidence upload" },
      { name: "Chat.jsx", desc: "Real-time global community chat" },
      { name: "Profile.jsx", desc: "User profile and password management" },
      { name: "AdminPanel.jsx", desc: "Admin dashboard for report review" },
      { name: "OpenSource.jsx", desc: "This page — full transparency" },
      { name: "Login.jsx", desc: "Login with email + Google OAuth" },
      { name: "Register.jsx", desc: "Registration with OTP verification" },
      { name: "ForgotPassword.jsx", desc: "Password reset request" },
      { name: "ResetPassword.jsx", desc: "Password reset form" },
    ],
  },
  {
    folder: "src/components/",
    files: [
      { name: "Layout.jsx", desc: "App shell — navbar, background, footer, outlet" },
      { name: "Navbar.jsx", desc: "Navigation bar with auth state" },
      { name: "ReportCard.jsx", desc: "Single report card in the watchlist grid" },
      { name: "ChatMessage.jsx", desc: "Chat message bubble with admin shield" },
      { name: "ReportComments.jsx", desc: "Comment thread on report details" },
      { name: "TopScammers.jsx", desc: "Featured scammers on home page" },
      { name: "ProtectedRoute.jsx", desc: "Auth guard for protected pages" },
      { name: "AnimatedBackground.jsx", desc: "Animated gradient background" },
      { name: "Footer.jsx", desc: "Site footer" },
      { name: "BackToTop.jsx", desc: "Scroll-to-top button" },
      { name: "ScrollToTop.jsx", desc: "Auto scroll reset on route change" },
    ],
  },
  {
    folder: "src/entities/",
    files: [
      { name: "ScammerReport.json", desc: "Scam reports with RLS — approved reports are public, pending are private to owner + admins" },
      { name: "ChatMessage.json", desc: "Chat messages with RLS — public read, owner/admin delete" },
      { name: "ReportComment.json", desc: "Report comments with RLS" },
      { name: "SiteMessage.json", desc: "Admin-only broadcast messages" },
      { name: "AdminActivityLog.json", desc: "Admin audit log — admin only" },
      { name: "User.json", desc: "User profiles — built-in, admin-managed" },
    ],
  },
];

// Key source code snippets shown for transparency
export const codeSnippets = [
  {
    title: "ScammerReport — Row Level Security",
    file: "src/entities/ScammerReport.json",
    language: "json",
    description: "Only approved reports are visible to everyone. Pending reports are private to the reporter and admins. Only the reporter or an admin can edit or delete.",
    code: `"rls": {
  "create": { "created_by_id": "{{user.id}}" },
  "read": {
    "$or": [
      { "data.status": "approved" },
      { "created_by_id": "{{user.id}}" },
      { "user_condition": { "role": "admin" } }
    ]
  },
  "update": {
    "$or": [
      { "created_by_id": "{{user.id}}" },
      { "user_condition": { "role": "admin" } }
    ]
  },
  "delete": {
    "$or": [
      { "created_by_id": "{{user.id}}" },
      { "user_condition": { "role": "admin" } }
    ]
  }
}`
  },
  {
    title: "ChatMessage — Row Level Security",
    file: "src/entities/ChatMessage.json",
    language: "json",
    description: "Chat is public to read. Only the message author or an admin can edit or delete messages.",
    code: `"rls": {
  "create": { "created_by_id": "{{user.id}}" },
  "read": {},
  "update": {
    "$or": [
      { "created_by_id": "{{user.id}}" },
      { "user_condition": { "role": "admin" } }
    ]
  },
  "delete": {
    "$or": [
      { "created_by_id": "{{user.id}}" },
      { "user_condition": { "role": "admin" } }
    ]
  }
}`
  },
  {
    title: "AdminActivityLog — Admin Only",
    file: "src/entities/AdminActivityLog.json",
    language: "json",
    description: "The admin audit log is completely restricted — only admins can read, create, or modify it.",
    code: `"rls": {
  "create": { "user_condition": { "role": "admin" } },
  "read": { "user_condition": { "role": "admin" } },
  "update": { "user_condition": { "role": "admin" } },
  "delete": { "user_condition": { "role": "admin" } }
}`
  },
  {
    title: "App Router — Route Protection",
    file: "src/App.jsx",
    language: "jsx",
    description: "Protected routes (submit, profile, admin) require authentication. Admin panel is role-gated.",
    code: `<Route element={<Layout />}>
  <Route path="/" element={<Home />} />
  <Route path="/reports" element={<Reports />} />
  <Route path="/chat" element={<Chat />} />
  <Route path="/reports/:id" element={<ReportDetail />} />
  <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
    <Route path="/submit" element={<SubmitReport />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/admin" element={<AdminPanel />} />
  </Route>
</Route>`
  },
];

export const trustPoints = [
  {
    title: "Every report is verified",
    desc: "Reports stay private (pending) until an admin reviews and approves them. No unverified claims go public.",
  },
  {
    title: "Your data is protected",
    desc: "Row-Level Security (RLS) enforces who can read, edit, and delete data at the database level — not just in the UI.",
  },
  {
    title: "Admin actions are logged",
    desc: "Every approval, rejection, and deletion by an admin is recorded in an immutable audit log.",
  },
  {
    title: "No hidden tracking",
    desc: "We don't sell your data. We collect only what's needed: your display name, email, and profile picture.",
  },
  {
    title: "Open and transparent",
    desc: "The full source code and security policies are visible on this page. Review it yourself.",
  },
];