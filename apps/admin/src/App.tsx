import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Users, Package, ShoppingBag, Cpu, Shield, LogOut } from "lucide-react";

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
    } catch (err: any) {
      setError("Failed to connect to backend API.");
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
      if (!res.ok) throw new Error(data.detail || "Login failed");
      if (data.user.role !== "admin") throw new Error("Administrator role required");
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#14233B" }}>
        <form onSubmit={handleLogin} style={{ background: "#FFF8EF", padding: 36, borderRadius: 16, width: 380, boxShadow: "0 12px 30px rgba(0,0,0,0.25)" }}>
          <h1 style={{ margin: "0 0 6px", color: "#14233B", fontSize: 24 }}>KALAINOVA Admin</h1>
          <p style={{ margin: "0 0 20px", color: "#556", fontSize: 14 }}>Platform Governance & AI Monitoring</p>
          {error && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: 10, borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Admin Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", marginBottom: 14, boxSizing: "border-box" }} />
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", marginBottom: 20, boxSizing: "border-box" }} />
          <button type="submit" style={{ width: "100%", padding: 12, background: "#E58A42", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            Sign In to Admin Console
          </button>
        </form>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(20,35,59,0.06)" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "#14233B", color: "#FFF8EF", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shield size={22} color="#E58A42" />
          <strong style={{ fontSize: 18 }}>KALAINOVA Admin Console</strong>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {(["overview", "products", "users", "models"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, background: tab === t ? "#E58A42" : "rgba(255,255,255,0.1)", color: "#fff", textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
          <button onClick={() => { localStorage.removeItem("kn_admin_token"); setToken(""); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main style={{ padding: 28, maxWidth: 1240, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {tab === "overview" && kpis && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={cardStyle}><Users color="#168C88" /><div style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>Registered Artisans</div><div style={{ fontSize: 28, fontWeight: 700 }}>{kpis.total_artisans}</div></div>
              <div style={cardStyle}><Users color="#E58A42" /><div style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>Registered Buyers</div><div style={{ fontSize: 28, fontWeight: 700 }}>{kpis.total_buyers}</div></div>
              <div style={cardStyle}><Package color="#14233B" /><div style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>Listed Products</div><div style={{ fontSize: 28, fontWeight: 700 }}>{kpis.total_products} ({kpis.approved_products} approved)</div></div>
              <div style={cardStyle}><ShoppingBag color="#168C88" /><div style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>Orders & GMV</div><div style={{ fontSize: 28, fontWeight: 700 }}>₹{kpis.total_gmv.toLocaleString()}</div></div>
            </div>

            {analytics && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div style={cardStyle}>
                  <h3 style={{ marginTop: 0 }}>SHG & Cooperatives ({kpis.total_shgs})</h3>
                  {analytics.shg_groups.map((s: any) => (
                    <div key={s.id} style={{ padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                      <strong>{s.name}</strong> — {s.district}, {s.state} ({s.member_count} members, {s.focus_craft})
                    </div>
                  ))}
                </div>
                <div style={cardStyle}>
                  <h3 style={{ marginTop: 0 }}>Category Distribution</h3>
                  {analytics.category_distribution.map((c: any) => (
                    <div key={c.category} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                      <span>{c.category}</span>
                      <strong>{c.count} products</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "products" && (
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Product Moderation Queue</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead><tr style={{ textAlign: "left", borderBottom: "2px solid #E2E8F0" }}><th style={{ padding: 10 }}>Title</th><th>Artisan</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{p.title}</td>
                    <td>{p.artisan_name}</td>
                    <td>{p.category_name}</td>
                    <td>₹{p.selling_price.toLocaleString()}</td>
                    <td><span style={{ padding: "4px 8px", borderRadius: 6, background: p.status === "approved" ? "#DCFCE7" : "#FEF3C7", fontSize: 12 }}>{p.status}</span></td>
                    <td style={{ display: "flex", gap: 8, padding: 10 }}>
                      <button onClick={() => updateProductStatus(p.id, "approved")} style={{ border: "none", background: "#168C88", color: "#fff", padding: "6px 10px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> Approve</button>
                      <button onClick={() => updateProductStatus(p.id, "rejected")} style={{ border: "none", background: "#DC2626", color: "#fff", padding: "6px 10px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><XCircle size={14} /> Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Registered Platform Users</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead><tr style={{ textAlign: "left", borderBottom: "2px solid #E2E8F0" }}><th style={{ padding: 10 }}>Name</th><th>Email / Phone</th><th>Role</th><th>Language</th><th>Demo?</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{u.full_name}</td>
                    <td>{u.email || u.phone}</td>
                    <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                    <td>{u.preferred_language}</td>
                    <td>{u.is_demo ? "Demo Seed" : "Live"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "models" && analytics && (
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}><Cpu color="#E58A42" /> AI Model Registry & Status</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead><tr style={{ textAlign: "left", borderBottom: "2px solid #E2E8F0" }}><th style={{ padding: 10 }}>Model</th><th>Source</th><th>License</th><th>Task</th><th>Hardware</th><th>Status</th></tr></thead>
              <tbody>
                {analytics.models.map((m: any) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{m.model_name} ({m.model_version})</td>
                    <td>{m.source}</td>
                    <td>{m.license}</td>
                    <td>{m.task}</td>
                    <td>{m.hardware_requirements}</td>
                    <td><span style={{ padding: "4px 8px", borderRadius: 6, background: "#E0F2FE", color: "#0369A1", fontSize: 12 }}>{m.loading_status}</span></td>
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
