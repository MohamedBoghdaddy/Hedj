import { AdminShell } from "../Components/AdminShell";
import "../Styles/admin-premium.css";

const textureImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBA9DnpZlKE8mE55QCBqq4rvYqRgRIj7YyEW9N8u8MGfM2mbOuzQ9ZFl2IW1cF7CspSyhhh3XsNaFmLvXE0jKgweWBMZHGb1JwkFZldGIMDpY0kDgM07s7OBOMPFvSiIoS_-4irVkq3w2QWBC4cgd78-cmiKAUdVRjIFjDZCdD8vEH3TR5BWASiXeoAKR36A8PZsdURhGdJEpArO37sfJJ71P8rAamdpZdnjGSIG2c1UBvAbKv_U57Ac1lnleQgQY1YW1q-MZDrxENJ";

const bars = [
  ["Seating", 85],
  ["Tables", 60],
  ["Lighting", 95],
  ["Storage", 40],
  ["Decor", 70],
  ["Outdoor", 55],
];

const rows = [
  ["#ORD-98421", "Mid-Century Modern", "1,240", "42.5%", "1.2 Days", "Active"],
  ["#ORD-98422", "Industrial Luxe", "890", "38.2%", "3.4 Days", "In Review"],
  ["#ORD-98423", "Scandinavian Minimal", "2,105", "51.0%", "0.8 Days", "Active"],
  ["#ORD-98424", "Heritage Oak", "450", "29.5%", "5.2 Days", "Flagged"],
];

const AdminAnalytics = () => (
  <AdminShell
    active="Reports"
    title="Analytics Dashboard"
    subtitle="Detailed performance metrics for Hedj Commerce OS"
    profileName="Marcus Hedj"
    role="System Admin"
    actions={
      <>
        <button className="admin-premium-button" type="button">
          <span className="material-symbols-outlined">file_download</span>
          Export CSV Data
        </button>
        <button className="admin-premium-button primary" type="button">
          <span className="material-symbols-outlined">picture_as_pdf</span>
          Export Full Report
        </button>
      </>
    }
  >
    <section className="admin-filter-card">
      <div className="admin-filter-grid">
        <AdminField label="Custom Date Range">
          <input defaultValue="Jan 01, 2024 - Mar 31, 2024" />
        </AdminField>
        <AdminField label="Collection">
          <select defaultValue="All Collections">
            <option>All Collections</option>
            <option>Mid-Century Modern</option>
            <option>Scandinavian Minimal</option>
            <option>Industrial Luxe</option>
          </select>
        </AdminField>
        <AdminField label="Region">
          <select defaultValue="Global Reach">
            <option>Global Reach</option>
            <option>North America</option>
            <option>Europe (EMEA)</option>
            <option>Asia Pacific</option>
          </select>
        </AdminField>
        <button className="admin-premium-button" type="button">
          Apply Filters
        </button>
      </div>
    </section>

    <section className="admin-metrics-grid">
      <Metric title="Order Velocity" value="142 orders/day" badge="+12.4%" progress={75} />
      <Metric title="Inventory Turnover" value="4.2x" badge="Optimal" />
      <Metric title="CAC Avg" value="$45.20" badge="+$12" />
      <Metric title="Retention Rate" value="68%" badge="Trending" progress={50} />
    </section>

    <section className="admin-analytics-grid">
      <div className="admin-chart-card">
        <div className="admin-card-header">
          <h2>Sales by Category</h2>
          <span className="admin-card-kicker">Revenue / Forecast</span>
        </div>
        <div className="admin-bar-chart">
          {bars.map(([label, height]) => (
            <div className="admin-bar" key={label}>
              <div className="admin-bar-fill" style={{ height: `${height}%` }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="admin-insights-card">
        <img src={textureImage} alt="Subtle dark marble texture" />
        <div className="admin-insights-content">
          <h2>Strategic Insights</h2>
          <p>
            Inventory turnover in Lighting has peaked. High-margin items in Seating are
            showing early signs of seasonal slowdown. Consider reallocating budget to
            Scandinavian Minimal.
          </p>
          <p>
            <span className="material-symbols-outlined">warning</span> Stock Warning:
            2 products below safety threshold.
          </p>
          <p>
            <span className="material-symbols-outlined">check_circle</span> LTV
            Optimization: loyalty campaign active.
          </p>
        </div>
      </aside>
    </section>

    <section className="admin-table-card">
      <div className="admin-card-header">
        <h2>Granular Performance Log</h2>
      </div>
      <div className="admin-premium-table-wrap">
        <table className="admin-premium-table">
          <thead>
            <tr>
              <th>Reference ID</th>
              <th>Collection Category</th>
              <th>Units Sold</th>
              <th>Gross Margin</th>
              <th>Fulfillment Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.slice(0, 5).map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
                <td>
                  <span
                    className={`status-pill ${
                      row[5] === "Active"
                        ? "status-active"
                        : row[5] === "Flagged"
                          ? "status-flagged"
                          : "status-review"
                    }`}
                  >
                    {row[5]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </AdminShell>
);

const AdminField = ({ label, children }) => (
  <div className="admin-field">
    <label>{label}</label>
    {children}
  </div>
);

const Metric = ({ title, value, badge, progress }) => (
  <div className="admin-metric-card">
    <p className="admin-card-kicker">{title}</p>
    <span>{badge}</span>
    <h3>{value}</h3>
    {progress && (
      <div className="mini-progress">
        <span style={{ width: `${progress}%` }} />
      </div>
    )}
  </div>
);

export default AdminAnalytics;
