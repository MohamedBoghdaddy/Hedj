import { useMemo, useState } from "react";
import { AdminSidebar } from "../Components/AdminShell";
import "../Styles/admin-premium.css";

const avatars = {
  Marcus:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB6yiVtfGu1f7RN6E4YMqAcUTClTUVM9Zx2SXOjbm7jiQbGYy_1c-qcikileZKyutf4n-AMNbQGu6DZmeVUbsBp3ipB_yg9WOPu7YxLPR-peSsNhqiW1OWRV_AY-La2PZ0J1uU8vUJBvbGqRMr2Prjsxx7ofkMkjO8-z89A86JjLa8RRNMcSfTncYp1poo276T_XKbqrYZsSIFlWnQno9Qw5FmrFdr6wbjclNizU4hpi2LLixVDkeL4G23OuUcQN7dyafYS6zH6-JF5",
  Sarah:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBL3ZJtFCfzjsEzxYQwD1addG6FaZ7pDSMNGHk_rXYF2yguaGv7ouqA1zjiOui0Qa2rHsovjea8OOvfPqURfOIhWXXQQLGy07b3T5U7JqDKYAReYnpwuAAwvevOsJQggnHfSyDS05g2IoBwz2iTRDR4zppTdptuScyBDh4Ft6jksVTe-JMsIlCcGmiLxYTUS4NXDzm3otTR5Eo1mt8pGNWjNX69lHpsp8PPkIqwhUnd0uQPy0zMcTindIPgf0QcgS7TsLb8aRsAWWEJ",
  Julianne:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDfoQ4o2f9DLQV3wgrHDTOxvChISoZxM8WCCv2IGftbQXig9-SvH8PsNyB0VafkJnJOHQ7nV1WgRW7Fv4IAlnRS2pMggIfVkwMdO6gDb8Rm721MP-K63VFL5xqS57JCqS1XSNH286ausm0y8VEGvvWQgWQtqF4ZcHWjV9qIsea6VVvBfRGyBJL4Zs5196-Kf0dX0TSh0VKRitCSDXQWkfwisysjT7SCONz8N180x_t5ZyBh-m2P7iqsrYskfpfXQjpszfxok6FPyVzn",
};

const drawerImages = {
  hero:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHghfPFXJp9Db29vHk8OhK2D0-T3zYt7JNFCC7CgMHikTTqXXvZ4pRjeEVLWKFmj5r0gDvxWWr8blwhgrCcmFJ1VZ25WMslZuUVD_bmYygzbpKGyvSx8WIjAkHJzZk4GN0GzMbBd5KEvnWwRBwes1d9gB5gi-0UslJGWTVCpjcFKfBHg5Kfr-mmRWWzVxhSY5N4ZvJWq9K_u1wW1FCsLZbYi17Jmd0QCb4MPxq3nUORSFe9FVEIDIk7-DpmFKq-2QhD5XPpHzd5Z2",
  desk:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBVPBbbaQtZu69oGV6iS68ijxbaV4r8xXxELbT0zjnst8oZ4wZsGq-a9fXMUuCHmEoAOgW7gG4uIn2QlIexOYM5E7ekd2JTJFcQ8oaLnjcRABH8JW-DMdY8E6qIEfo7DquRafHJoRzQU16ScQDOJBaQZb5oD2FZztR0LveMHePytCRBMimt1WUPaVmPYMqKSiHCs3bhHhTloOnuqGO-9wJ1Gj-uVDVgqbQnKTpXRmZF60pjerMuFIvJjl_HKOcT7t0kdkDpyAG81hjh",
  chair:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLZOP9sFjt1E7PHPvGDkv9tW2FfOrOee8DslfBrODTJbLh66hgPMs8b0BQ9GbdBUE-4dITzGjDDxLCMXoNITHqm5t-t_ZN3v7C6b3XFJ9NUZYhY22Eb--QSf3-65fIO_uqEN0PaWcAOgBMNbqBjGeax8o8AqVSVpIDYPV8Dd5ZO3SpbLZGJ9xz89Uha3Op__wvm9qijPkE2gil-T533Imo6EGP-ovSIGig2yahTKtqSSQHbV5PrH_rkpQhBU6sBk_OtF5SF4qze3S",
};

const initialOrders = [
  {
    id: "HJ-20941",
    lane: "new",
    customer: "Eleanor Sterling",
    value: 12450,
    desc: "Aurelius Oak Dining Set, 8x Velvet Armchairs",
    assignee: "Marcus",
    badge: "Est. 14 Days",
  },
  {
    id: "HJ-20942",
    lane: "new",
    customer: "The Ritz Carlton (S01)",
    value: 84000,
    desc: "24x Custom Lobby Loungers, Marble Pedestals",
    assignee: "Sarah",
    badge: "Est. 60 Days",
  },
  {
    id: "HJ-20944",
    lane: "confirmed",
    customer: "Sebastian Thorne",
    value: 5200,
    desc: "Obsidian Glass Desk, Aeron Executive Chair",
    assignee: "Julianne",
    badge: "Dep. Paid",
  },
  {
    id: "HJ-20945",
    lane: "production",
    customer: "Modernist Loft",
    value: 18900,
    desc: "Custom Walnut Library Shelving",
    progress: 65,
  },
  {
    id: "HJ-20946",
    lane: "production",
    customer: "Clara Monfort",
    value: 3400,
    desc: "Brutalist Coffee Table",
    progress: 15,
  },
  {
    id: "HJ-20947",
    lane: "ready",
    customer: "Dr. Aris Thorne",
    value: 9700,
    desc: "QC Passed / Wrapped / Warehouse A-12",
    badge: "Schedule",
  },
  {
    id: "HJ-20948",
    lane: "delivered",
    customer: "The Soho Gallery",
    value: 0,
    desc: "Completed yesterday",
    badge: "Done",
  },
];

const lanes = [
  ["new", "New", "#94a3b8", 3],
  ["confirmed", "Confirmed", "#60a5fa", 1],
  ["production", "In Production", "#f59e0b", 4],
  ["ready", "Ready For Delivery", "#22c55e", 2],
  ["delivered", "Delivered", "#000000", 12],
];

const money = (value) => `$${Number(value || 0).toLocaleString()}`;

const AdminOrdersPipeline = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState("HJ-20944");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const selected = useMemo(
    () => orders.find((order) => order.id === selectedId) || orders[0],
    [orders, selectedId]
  );

  const moveSelectedToProduction = () => {
    if (!selected) return;
    setOrders((current) =>
      current.map((order) =>
        order.id === selected.id ? { ...order, lane: "production", progress: 5 } : order
      )
    );
  };

  return (
    <div className="orders-premium-page">
      <AdminSidebar active="Orders" />

      <main className="admin-premium-main">
        <header className="admin-premium-topbar">
          <div className="admin-premium-actions">
            <h1>Orders Pipeline</h1>
            <button className="admin-premium-button primary" type="button">
              <span className="material-symbols-outlined">view_kanban</span>
              Pipeline
            </button>
            <button className="admin-premium-button" type="button">
              <span className="material-symbols-outlined">table_chart</span>
              Table
            </button>
          </div>

          <div className="admin-premium-actions">
            <button className="admin-premium-button" type="button">
              <span className="material-symbols-outlined">filter_alt</span>
              Status
            </button>
            <button className="admin-premium-button" type="button">
              <span className="material-symbols-outlined">calendar_today</span>
              Date
            </button>
            <button className="admin-premium-button primary" type="button">
              <span className="material-symbols-outlined">add</span>
              Create Order
            </button>
          </div>
        </header>

        <div className="orders-premium-workspace">
          <section className="orders-premium-board" aria-label="Orders pipeline board">
            <div className="orders-premium-lanes">
              {lanes.map(([key, title, color, count]) => (
                <div className="orders-lane" key={key}>
                  <div className="orders-lane-header">
                    <span>
                      <i className="orders-dot" style={{ background: color }} />
                      {title} ({count})
                    </span>
                    <span className="material-symbols-outlined">more_horiz</span>
                  </div>

                  {orders
                    .filter((order) => order.lane === key)
                    .map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        selected={order.id === selected?.id}
                        onSelect={() => {
                          setSelectedId(order.id);
                          setDrawerOpen(true);
                        }}
                      />
                    ))}
                </div>
              ))}
            </div>
          </section>

          {selected && drawerOpen && (
            <OrderDrawer
              order={selected}
              onClose={() => setDrawerOpen(false)}
              onMove={moveSelectedToProduction}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const OrderCard = ({ order, selected, onSelect }) => (
  <button
    type="button"
    className={`orders-card ${selected ? "selected" : ""}`}
    onClick={onSelect}
  >
    {order.progress != null && (
      <div className="orders-progress">
        <span style={{ width: `${order.progress}%` }} />
      </div>
    )}

    <div className="orders-card-top">
      <h3>{order.customer}</h3>
      {order.value > 0 && <span className="orders-value">{money(order.value)}</span>}
    </div>

    <p className="orders-desc">{order.desc}</p>

    <div className="orders-card-bottom">
      {order.assignee && (
        <div className="orders-assignee">
          <img src={avatars[order.assignee]} alt={`${order.assignee} assignee`} />
          <span>{order.assignee}</span>
        </div>
      )}
      {order.badge && <span className="orders-badge">{order.badge}</span>}
    </div>
  </button>
);

const OrderDrawer = ({ order, onClose, onMove }) => (
  <aside className="orders-drawer">
    <div className="orders-drawer-header">
      <div>
        <span>ORDER #{order.id}</span>
        <h2>{order.customer}</h2>
      </div>
      <button
        className="admin-premium-button"
        type="button"
        aria-label="Close details"
        onClick={onClose}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>

    <div className="orders-drawer-body">
      <div className="orders-drawer-hero">
        <img src={drawerImages.hero} alt="Selected order furniture detail" />
      </div>

      <section className="orders-drawer-section">
        <p className="orders-label">Logistics Status</p>
        <div className="orders-timeline">
          <div className="orders-timeline-item active">
            <strong>Order Confirmed</strong>
            <p>Oct 12, 2023 - 09:45 AM</p>
          </div>
          <div className="orders-timeline-item">
            <strong>Production Kickoff</strong>
            <p>Estimated Oct 18, 2023</p>
          </div>
        </div>
      </section>

      <section className="orders-drawer-section">
        <p className="orders-label">Inventory Items</p>
        <div className="orders-items">
          <DrawerItem
            image={drawerImages.desk}
            name="Obsidian Glass Desk"
            meta="Custom Size: 180x90cm"
            price="$3,800.00"
          />
          <DrawerItem
            image={drawerImages.chair}
            name="Aeron Executive Chair"
            meta="Midnight Leather / Polished Alum"
            price="$1,400.00"
          />
        </div>
      </section>

      <section className="orders-drawer-section">
        <div className="orders-address">
          <p className="orders-label">Delivery Address</p>
          <p>
            The Penthouse, West Tower
            <br />
            888 Elysium Drive, Suite 402
            <br />
            Chicago, IL 60601
            <br />
            United States
          </p>
        </div>
      </section>
    </div>

    <div className="orders-drawer-actions">
      <div className="orders-total-row">
        <span>Total Value</span>
        <strong>{money(order.value)}</strong>
      </div>
      <button className="admin-premium-button primary" type="button" onClick={onMove}>
        <span className="material-symbols-outlined">rocket_launch</span>
        Move To Production
      </button>
    </div>
  </aside>
);

const DrawerItem = ({ image, name, meta, price }) => (
  <div className="orders-item">
    <div className="orders-item-image">
      <img src={image} alt={name} />
    </div>
    <div>
      <strong>{name}</strong>
      <p>{meta}</p>
      <span className="orders-value">{price}</span>
    </div>
  </div>
);

export default AdminOrdersPipeline;
