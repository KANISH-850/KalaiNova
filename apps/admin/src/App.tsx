import React, { useEffect, useState } from "react";
import { Check, X, LayoutDashboard, Package, Users, Cpu, LogOut } from "lucide-react";
import { ADMIN_THEME as T } from "./theme";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface DashboardKPIs {
  total_artisans: number;
  total_buyers: number;
  total_products: number;
  approved_products: number;
  total_orders: number;
  total_shgs: number;
  total_gmv: number;
  total_recorded_income: number;
}

export default function App() {
  const [token, setToken] = useState<string>(localStorage.getItem("kn_admin_token") || "");
  const [email, setEmail] = useState("admin@kalainova.demo");
  const [password, setPassword] = useState("Kalai@123");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "products" | "users" | "models">("overview");

  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAll = async (authToken: string) => {
    const headers = { Authorization: `Bearer ${authToken}` };
    try {
      const [dRes, pRes, uRes, aRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard`, { headers }),
        fetch(`${API_URL}/admin/products`, { headers }),
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/analytics`, { headers }),
      ]);
      if (dRes.status === 401 || dRes.status === 403) {
        setToken("");
        localStorage.removeItem("kn_admin_token");
        return;
      }
      setKpis(await dRes.json());
      setProducts(await pRes.json());
      setUsers(await uRes.json());
      setAnalytics(await aRes.json());
    } catch {
      setError("Could not reach the backend server.");
    }
  };

  useEffect(() => {
    if (token) fetchAll(token);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Sign in failed");
      if (data.user.role !== "admin") throw new Error("Administrator account required");
      localStorage.setItem("kn_admin_token", data.access_token);
      setToken(data.access_token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateProductStatus = async (productId: number, status: string) => {
    await fetch(`${API_URL}/admin/products/${productId}/status?status=${status}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAll(token);
  };

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, padding: 24 }}>
        <form onSubmit={handleLogin} style={{ background: T.surface, padding: 32, borderRadius: 12, border: `1px solid ${T.border}`, width: 380 }}>
          <h1 style={{ margin: "0 0 8px", fontFamily: T.serif, color: T.text, fontSize: 26 }}>KALAINOVA Admin</h1>
          <p style={{ margin: "0 0 24px", color: T.textSecondary, fontSize: 16 }}>Sign in to review crafts, artisans, and orders.</p>
          {error && <div style={{ background: "#FDECEC", color: T.error, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 15 }}>{error}</div>}
          <label style={{ display: "block", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", minHeight: 48, padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 16, boxSizing: "border-box", fontSize: 16, background: T.surface }} />
          <label style={{ display: "block", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", minHeight: 48, padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 24, boxSizing: "border-box", fontSize: 16, background: T.surface }} />
          <button type="submit" style={{ width: "100%", minHeight: 48, background: T.primary, color: T.surface, border: "none", borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Craft Listings", icon: Package },
    { id: "users", label: "Artisans & Buyers", icon: Users },
    { id: "models", label: "Model Status", icon: Cpu },
  ] as const;

  const boxStyle: React.CSSProperties = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: 20,
  };

  const maxCatCount = Math.max(...(analytics?.category_distribution || []).map((c: any) => c.count), 1);

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: T.bg, color: T.text }}>
      {/* Sidebar layout */}
      <aside style={{ width: 248, background: T.surface, borderRight: `1px solid ${T.border}`, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.primary, marginBottom: 4 }}>KALAINOVA</div>
          <div style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24 }}>Craft Ledger Console</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={{
                    minHeight: 48,
                    padding: "0 14px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 16,
                    fontWeight: active ? 600 : 500,
                    background: active ? T.primary : "transparent",
                    color: active ? T.surface : T.text,
                    textAlign: "left",
                  }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("kn_admin_token");
            setToken("");
          }}
          style={{
            minHeight: 48,
            padding: "0 14px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: T.text,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 16,
          }}
        >
          <LogOut size={18} strokeWidth={1.75} /> Sign out
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32, maxWidth: 1120 }}>
        {tab === "overview" && kpis && (
          <>
            <h1 style={{ fontFamily: T.serif, fontSize: 26, margin: "0 0 20px" }}>Platform Overview</h1>

            {/* Compact summary strip instead of large gradient KPI cards */}
            <div style={{ ...boxStyle, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              <div><div style={{ fontSize: 14, color: T.textSecondary }}>Artisans</div><div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 700 }}>{kpis.total_artisans}</div></div>
              <div><div style={{ fontSize: 14, color: T.textSecondary }}>Buyers</div><div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 700 }}>{kpis.total_buyers}</div></div>
              <div><div style={{ fontSize: 14, color: T.textSecondary }}>Approved Crafts</div><div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 700 }}>{kpis.approved_products} / {kpis.total_products}</div></div>
              <div><div style={{ fontSize: 14, color: T.textSecondary }}>Order Volume</div><div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 700, color: T.primary }}>₹{kpis.total_gmv.toLocaleString()}</div></div>
            </div>

            {analytics && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={boxStyle}>
                  <h2 style={{ fontFamily: T.serif, fontSize: 20, margin: "0 0 14px" }}>Crafts by Category</h2>
                  {analytics.category_distribution.map((c: any) => (
                    <div key={c.category} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, marginBottom: 4 }}>
                        <span>{c.category}</span>
                        <strong>{c.count}</strong>
                      </div>
                      <div style={{ height: 8, background: T.surfaceAlt, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((c.count / maxCatCount) * 100)}%`, height: "100%", background: T.primary }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={boxStyle}>
                  <h2 style={{ fontFamily: T.serif, fontSize: 20, margin: "0 0 14px" }}>SHG & Cooperatives ({kpis.total_shgs})</h2>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                    <thead><tr style={{ textAlign: "left", borderBottom: `1px solid ${T.border}`, color: T.textSecondary }}><th style={{ padding: "8px 0" }}>Group</th><th>District</th><th>Members</th></tr></thead>
                    <tbody>
                      {analytics.shg_groups.map((s: any) => (
                        <tr key={s.id} style={{ borderBottom: `1px solid ${T.surfaceAlt}` }}>
                          <td style={{ padding: "10px 0", fontWeight: 600 }}>{s.name}</td>
                          <td>{s.district}</td>
                          <td>{s.member_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "products" && (
          <div style={boxStyle}>
            <h1 style={{ fontFamily: T.serif, fontSize: 24, margin: "0 0 16px" }}>Craft Listings</h1>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <thead><tr style={{ textAlign: "left", borderBottom: `1px solid ${T.border}`, color: T.textSecondary }}><th style={{ padding: 10 }}>Craft</th><th>Artisan</th><th>Category</th><th>Price</th><th>Status</th><th>Review</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${T.surfaceAlt}` }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{p.title}</td>
                    <td>{p.artisan_name}</td>
                    <td>{p.category_name}</td>
                    <td>₹{p.selling_price.toLocaleString()}</td>
                    <td style={{ textTransform: "capitalize" }}>{p.status}</td>
                    <td style={{ display: "flex", gap: 8, padding: 10 }}>
                      <button onClick={() => updateProductStatus(p.id, "approved")} style={{ minHeight: 36, border: "none", background: T.success, color: T.surface, padding: "0 10px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Check size={14} strokeWidth={1.75} /> Approve</button>
                      <button onClick={() => updateProductStatus(p.id, "rejected")} style={{ minHeight: 36, border: "none", background: T.error, color: T.surface, padding: "0 10px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><X size={14} strokeWidth={1.75} /> Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div style={boxStyle}>
            <h1 style={{ fontFamily: T.serif, fontSize: 24, margin: "0 0 16px" }}>Artisans & Buyers</h1>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <thead><tr style={{ textAlign: "left", borderBottom: `1px solid ${T.border}`, color: T.textSecondary }}><th style={{ padding: 10 }}>Name</th><th>Contact</th><th>Role</th><th>Language</th><th>Source</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${T.surfaceAlt}` }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{u.full_name}</td>
                    <td>{u.email || u.phone}</td>
                    <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                    <td>{u.preferred_language}</td>
                    <td>{u.is_demo ? "Demo" : "Live"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "models" && analytics && (
          <div style={boxStyle}>
            <h1 style={{ fontFamily: T.serif, fontSize: 24, margin: "0 0 16px" }}>Model Status</h1>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <thead><tr style={{ textAlign: "left", borderBottom: `1px solid ${T.border}`, color: T.textSecondary }}><th style={{ padding: 10 }}>Model</th><th>Source</th><th>Task</th><th>Hardware</th><th>Status</th></tr></thead>
              <tbody>
                {analytics.models.map((m: any) => (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${T.surfaceAlt}` }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{m.model_name} ({m.model_version})</td>
                    <td>{m.source}</td>
                    <td>{m.task}</td>
                    <td>{m.hardware_requirements}</td>
                    <td>{m.loading_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
