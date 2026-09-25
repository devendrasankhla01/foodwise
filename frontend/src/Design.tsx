import { useId, useState, type FormEvent } from "react";
import {
  Leaf,
  Utensils,
  Factory,
  HeartHandshake,
  ShieldCheck,
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ChartNoAxesCombined,
  Sprout,
  Recycle,
  Loader2,
  MoveUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { Panel, Empty, type DataRow, day } from "./components";

export const flowColors = ["#4FAE70", "#39AEB3", "#E5B44C", "#D96C68"];
const format = (n: number) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: 1 });
export const workspaces = [
  {
    id: "HOTEL_RESTAURANT",
    title: "Hotel / Restaurant",
    caption: "Food institution",
    description:
      "Predict demand, prevent overproduction and manage surplus food.",
    icon: Utensils,
    demo: "institution",
  },
  {
    id: "FACTORY",
    title: "Factory",
    caption: "Food processing unit",
    description:
      "Monitor production, processing efficiency, resource usage and food losses.",
    icon: Factory,
    demo: "factory",
  },
  {
    id: "RECIPIENT",
    title: "Recipient",
    caption: "NGO · Shelter · Community",
    description: "Receive and manage suitable surplus-food offers.",
    icon: HeartHandshake,
    demo: "recipient",
  },
  {
    id: "ADMIN",
    title: "Admin",
    caption: "Platform management",
    description: "Monitor and manage the FoodWise ecosystem.",
    icon: ShieldCheck,
    demo: "admin",
  },
];
export function FoodWiseBrand() {
  return (
    <div className="fw-brand">
      <span>
        <Leaf size={25} strokeWidth={1.7} />
      </span>
      <div>
        FoodWise<small>Making Every Meal Count</small>
      </div>
    </div>
  );
}
export function Ecosystem() {
  return (
    <div
      className="eco-scene"
      role="img"
      aria-label="A connected ecosystem: predict demand, prevent overproduction, redistribute suitable surplus and recover organic waste"
    >
      <svg
        className="eco-connections"
        viewBox="0 0 640 370"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M120 88C220 65 210 150 320 145S480 190 518 260C480 354 240 310 155 280S80 180 120 88Z"
          stroke="#a5cfc1"
        />
        <path
          d="M125 100Q250 265 505 266M320 150Q300 270 158 275"
          stroke="#93c9bb"
          strokeDasharray="4 7"
        />
        {[
          [120, 88],
          [320, 145],
          [518, 260],
          [155, 280],
          [390, 330],
          [590, 127],
          [52, 199],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="10" fill="#d6eee4" opacity=".55" />
            <circle cx={x} cy={y} r="3" fill="#6eae9c" />
          </g>
        ))}
        <path
          d="m225 90 7 6-9 3m230 137 8 7-10 3m-215 161-8-3 6-7"
          stroke="#6aa18f"
          strokeWidth="2"
        />
      </svg>
      <div className="eco-node predict">
        <div className="eco-platform">
          <ChartNoAxesCombined />
        </div>
        <strong>Predict</strong>
        <small>AI demand forecasting</small>
      </div>
      <div className="eco-node prevent">
        <div className="eco-platform">
          <Sprout />
        </div>
        <strong>Prevent</strong>
        <small>Reduce overproduction</small>
      </div>
      <div className="eco-node redistribute">
        <div className="eco-platform">
          <HeartHandshake />
        </div>
        <strong>Redistribute</strong>
        <small>Connect food with people</small>
      </div>
      <div className="eco-node recover">
        <div className="eco-platform">
          <Recycle />
        </div>
        <strong>Recover</strong>
        <small>A responsible next life</small>
      </div>
      <div className="eco-kitchen">
        <svg viewBox="0 0 210 185" fill="none" aria-hidden="true">
          <ellipse cx="108" cy="154" rx="83" ry="20" fill="#537f6720" />
          <path d="m16 119 89-48 89 48v12l-89 48-89-48Z" fill="#b9cbbb" />
          <path
            d="m16 119 89-48 89 48-89 48Z"
            fill="#eff0dc"
            stroke="#c4d2be"
          />
          <path d="M16 119V51L105 3v68Z" fill="#d6e3d4" stroke="#bdcdbc" />
          <path d="m105 3 89 48v68l-89-48Z" fill="#e7ead9" stroke="#c8d2be" />
          <path d="M30 59 80 32v35l-50 27Z" fill="#f8faf0" stroke="#b7cfbe" />
          <path d="m53 47 1 35M30 76l50-27" stroke="#c5d7c5" />
          <path d="m22 99 72-39 24 13-71 39Z" fill="#fcfbec" stroke="#b9cabc" />
          <path d="M22 99v23l25 14v-24Z" fill="#afc8b7" />
          <path d="m47 112 71-39v23l-71 40Z" fill="#cedbc7" stroke="#a9c1ae" />
          <path d="m73 98 1 22m22-35v24" stroke="#a3bbaa" />
          <path d="m67 105 3-2m20-11 3-2" stroke="#678b79" strokeWidth="2" />
          <path
            d="m117 73 64 34-23 13-64-35Z"
            fill="#f7f5e3"
            stroke="#bacbba"
          />
          <path d="m158 120 23-13v24l-23 13Z" fill="#9ebba8" />
          <path d="m94 85 64 35v24L94 109Z" fill="#c7d5bf" stroke="#abc2ac" />
          <path d="m132 114 18 10v12l-18-10Z" fill="#628d80" />
          <path
            d="m127 80 28 15-18 10-29-15Z"
            fill="#b1c4b5"
            stroke="#8aa997"
          />
          <ellipse cx="126" cy="88" rx="6" ry="3" fill="#567f72" />
          <ellipse cx="141" cy="96" rx="6" ry="3" fill="#567f72" />
          <path d="M117 50v9l39 21v-9Z" fill="#9fbaa5" />
          <path d="m117 50 17-10 39 21-17 10Z" fill="#d7e1c9" />
          <path
            d="m82 121 30-16 30 16-30 17Z"
            fill="#d0b893"
            stroke="#b19d7e"
          />
          <path d="M82 121v7l30 17v-7m30-17v7l-30 17" fill="#bda685" />
          <path
            d="M87 131v15m49-15v15m-24 0v15"
            stroke="#a08f74"
            strokeWidth="3"
          />
          <ellipse
            cx="110"
            cy="119"
            rx="11"
            ry="6"
            fill="#f5f6e9"
            stroke="#b9cab6"
          />
          <ellipse cx="110" cy="119" rx="5" ry="3" fill="#86ac6e" />
          <path d="m174 116 11 5-4 15-8-4Z" fill="#bdab89" />
          <path
            d="M179 123v-23m0 12c-11 0-13-7-9-11 7 0 9 5 9 11Zm0-5c1-12 7-16 11-13 3 8-3 13-11 13Z"
            fill="#81aa79"
            stroke="#68996f"
          />
          <path
            d="M36 102v-9m-5 7c-8-3-9-9-5-11 7 1 10 5 10 13m0-5c1-9 5-13 9-10 1 7-3 11-9 10"
            fill="#97b779"
            stroke="#779f6e"
          />
          <path d="m28 102 8-4 8 4-8 5Z" fill="#e4d2ad" />
          <path d="m28 102 3 10 6 3 5-10-6 2Z" fill="#c8b58f" />
        </svg>
        <span>
          Thoughtful kitchens.
          <br />
          Connected communities.
        </span>
      </div>
    </div>
  );
}
export function LoginView({
  onLogin,
  busy,
  error,
  demo,
}: {
  onLogin: (
    email: string,
    password: string,
    workspace: string,
    remember: boolean,
  ) => void;
  busy: boolean;
  error: string;
  demo: boolean;
}) {
  const [selected, setSelected] = useState("HOTEL_RESTAURANT");
  const [email, setEmail] = useState(
    () => localStorage.getItem("foodwise-email") || "",
  );
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(
    () => !!localStorage.getItem("foodwise-email"),
  );
  const [help, setHelp] = useState(false);
  const current = workspaces.find((w) => w.id === selected)!;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(email.trim(), password, selected, remember);
  };
  return (
    <div className="fw-login">
      <section className="fw-story">
        <FoodWiseBrand />
        <div className="fw-story-heading">
          <span className="fw-kicker">
            <i /> INTELLIGENCE WITH IMPACT
          </span>
          <h1>
            Turn food waste into
            <br />
            <em>intelligent action.</em>
          </h1>
          <p>
            Predict demand. Share suitable surplus. Give resources a second life
            — through one thoughtful, connected ecosystem.
          </p>
        </div>
        <Ecosystem />
        <div className="fw-story-foot">
          <span>
            <Sprout size={16} /> Better decisions. Greater impact.
          </span>
          <small>FOODWISE · BY TEAM ANVAY</small>
        </div>
      </section>
      <section className="fw-access">
        <div className="fw-network" aria-hidden="true" />
        <div className="fw-login-card">
          <div className="fw-card-top">
            <span className="fw-kicker">YOUR IMPACT STARTS HERE</span>
            <span className="fw-mini-leaf">
              <Leaf size={18} />
            </span>
          </div>
          <h2>Welcome to FoodWise</h2>
          <p className="fw-login-sub">Choose your workspace to continue.</p>
          <fieldset className="fw-role-grid">
            <legend className="sr-only">Workspace</legend>
            {workspaces.map((w) => (
              <label
                key={w.id}
                className={"fw-role " + (selected === w.id ? "selected" : "")}
              >
                <input
                  type="radio"
                  name="workspace"
                  value={w.id}
                  checked={selected === w.id}
                  onChange={() => setSelected(w.id)}
                />
                <span className="fw-role-check">
                  {selected === w.id && <Check size={12} />}
                </span>
                <w.icon size={26} strokeWidth={1.5} />
                <strong>{w.title}</strong>
                <small>{w.caption}</small>
              </label>
            ))}
          </fieldset>
          <p className="fw-role-description" aria-live="polite">
            {current.description}
          </p>
          <form onSubmit={submit}>
            <label className="fw-field">
              Email address
              <span>
                <Mail size={17} />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.com"
                />
              </span>
            </label>
            <label className="fw-field">
              Password
              <span>
                <LockKeyhole size={17} />
                <input
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <div className="fw-form-options">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember my email
              </label>
              <button type="button" onClick={() => setHelp(!help)}>
                Forgot password?
              </button>
            </div>
            {help && (
              <p className="fw-help" role="status">
                Contact your FoodWise administrator to restore access. Password
                reset by email is not available in this prototype.
              </p>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="fw-submit" disabled={busy} type="submit">
              {busy ? (
                <>
                  <Loader2 size={19} className="spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Continue to FoodWise
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>
          {demo && (
            <div className="fw-demo">
              <button
                disabled={busy}
                onClick={() =>
                  onLogin(
                    current.demo + "@foodwise.demo",
                    "FoodWise@2026",
                    selected,
                    false,
                  )
                }
              >
                Explore {current.title.toLowerCase()} demo{" "}
                <MoveUpRight size={14} />
              </button>
              {selected === "RECIPIENT" && (
                <button
                  disabled={busy}
                  onClick={() =>
                    onLogin(
                      "night@foodwise.demo",
                      "FoodWise@2026",
                      selected,
                      false,
                    )
                  }
                >
                  After-hours recipient demo
                </button>
              )}
              <small>Synthetic records · simulations are labeled</small>
            </div>
          )}
          <div className="fw-secure">
            <ShieldCheck size={15} />
            Secure access to your FoodWise workspace
          </div>
        </div>
        <p className="fw-access-foot">
          Less waste, more possibility. Every meal counts.
        </p>
      </section>
    </div>
  );
}

export function Distribution({
  rows,
  unit = "kg",
  center = "estimated kg",
}: {
  rows: { name: string; value: number; color: string }[];
  unit?: string;
  center?: string;
}) {
  const total = rows.reduce((s, r) => s + Number(r.value || 0), 0);
  if (!total)
    return (
      <Empty
        title="Your impact starts here"
        text="Completed records will bring this chart to life."
      />
    );
  return (
    <div className="fw-distribution">
      <div className="fw-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius="72%"
              outerRadius="92%"
              paddingAngle={total ? 3 : 0}
              stroke="none"
            >
              {rows.map((r) => (
                <Cell key={r.name} fill={r.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => [`${format(v)} ${unit}`, "Quantity"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #dce9e4" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="fw-donut-center">
          <strong>{format(total)}</strong>
          <small>{center}</small>
        </div>
      </div>
      <ul className="fw-chart-key">
        {rows.map((r) => (
          <li key={r.name}>
            <span className="fw-key-title">
              <i style={{ background: r.color }} />
              {r.name}
            </span>
            <strong>
              {format(r.value)} <small>{unit}</small>
            </strong>
            <span>{format((r.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
export function FoodFlowChart({
  prevented = 0,
  redistributed = 0,
  recovered = 0,
  disposed = 0,
}: DataRow) {
  return (
    <Distribution
      rows={[
        "Food prevented",
        "Redistributed",
        "Recovered",
        "Final disposal",
      ].map((name, i) => ({
        name,
        value: [prevented, redistributed, recovered, disposed][i],
        color: flowColors[i],
      }))}
    />
  );
}
export function ImpactCharts({
  data,
  recipient = false,
}: {
  data: DataRow;
  recipient?: boolean;
}) {
  const a = data.analytics;
  const uid = useId();
  const categoryMap: Record<string, number> = {};
  data.surplus
    .filter((x: DataRow) => x.status === "completed")
    .forEach((x: DataRow) => {
      const q = Number(x.receivedQuantity ?? x.quantity);
      const mass =
        x.unit === "kg"
          ? q
          : x.unit === "grams"
            ? q / 1000
            : x.unit === "servings"
              ? q * a.methodology.kgPerServing
              : (Number(x.servings) * a.methodology.kgPerServing * q) /
                Number(x.quantity);
      categoryMap[x.category] = (categoryMap[x.category] || 0) + mass;
    });
  const categories = Object.entries(categoryMap).map(([name, value], i) => ({
    name,
    value,
    color: ["#39AEB3", "#83bd9a", "#acccc0"][i % 3],
  }));
  return (
    <div className="fw-impact-grid">
      <Panel
        title={recipient ? "Food received, by category" : "Food flow overview"}
        sub={
          recipient
            ? "Completed receipts · estimated mass"
            : "A clearer picture of your recorded impact"
        }
      >
        {recipient ? (
          <Distribution rows={categories} />
        ) : (
          <FoodFlowChart {...a} />
        )}
        <p className="fw-chart-note">
          {recipient
            ? "Based on the latest 200 visible food journeys."
            : "Prevention is estimated against baseline preparation. Other outcomes are recorded separately; this is not a physical mass balance."}
        </p>
      </Panel>
      <Panel
        title={
          recipient
            ? "Good food, going further"
            : "Waste & redistribution trend"
        }
        sub="Last 14 days · estimated kilograms"
      >
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={a.series}
              margin={{ top: 16, right: 18, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#39AEB3" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#39AEB3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#e6eeea"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                minTickGap={28}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v: number) => format(v) + " kg"} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              {!recipient && (
                <Area
                  type="monotone"
                  dataKey="surplusKg"
                  name="Unconsumed production"
                  stroke="#9fae91"
                  fill="none"
                  strokeWidth={2}
                />
              )}
              <Area
                type="monotone"
                dataKey="redistributed"
                name={recipient ? "Food received" : "Redistributed"}
                stroke="#39AEB3"
                strokeWidth={2.5}
                fill={"url(#" + uid + ")"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="fw-chart-note">
          {recipient
            ? `${a.completed} confirmed collections · ${a.active} active offers and collections`
            : "Missing production days remain gaps. Unconsumed food may later be redistributed or recovered."}
        </p>
      </Panel>
    </div>
  );
}
export const processingRows = () =>
  Array.from({ length: 7 }, (_, i) => {
    const input = 440 + i * 18,
      output = input - (20 + i * 2);
    return {
      id: String(i),
      date: day(-i),
      input,
      output,
      loss: Number((((input - output) / input) * 100).toFixed(1)),
      lossKg: input - output,
      energy: 34 + i * 1.4,
      downtime: 8 + i * 2,
    };
  }).reverse();
export function ProcessingCharts() {
  const rows = processingRows();
  return (
    <div className="fw-impact-grid">
      <Panel
        title="From input to output"
        sub="Existing processing simulation · kg per batch"
      >
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={rows}>
              <CartesianGrid vertical={false} stroke="#e6eeea" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(5)}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" />
              <Bar
                dataKey="output"
                name="Output (kg)"
                stackId="batch"
                fill="#39AEB3"
              />
              <Bar
                dataKey="lossKg"
                name="Processing loss (kg)"
                stackId="batch"
                fill="#a6b59d"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel
        title="Resource efficiency"
        sub="Simulated energy usage and processing loss"
      >
        <div className="chart">
          <ResponsiveContainer>
            <LineChart data={rows}>
              <CartesianGrid vertical={false} stroke="#e6eeea" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(5)}
                tick={{ fontSize: 11 }}
              />
              <YAxis yAxisId="energy" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="loss"
                orientation="right"
                unit="%"
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Legend iconType="circle" />
              <Line
                yAxisId="energy"
                dataKey="energy"
                name="Energy (kWh)"
                stroke="#7ba995"
                strokeWidth={2}
              />
              <Line
                yAxisId="loss"
                dataKey="loss"
                name="Loss (%)"
                stroke="#a6b59d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
export function ForecastChart({ items }: { items: DataRow[] }) {
  return (
    <Panel
      title="From demand to preparation"
      sub="Item-wise historical average, prediction and recommendation · servings"
    >
      <div className="chart">
        <ResponsiveContainer>
          <BarChart data={items}>
            <CartesianGrid vertical={false} stroke="#e6eeea" />
            <XAxis dataKey="itemName" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend iconType="circle" />
            <Bar
              dataKey="historicalAverage"
              name="Historical average"
              fill="#b4c9bf"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="predictedQuantity"
              name="Predicted demand"
              fill="#39AEB3"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="recommendedQuantity"
              name="Recommended preparation"
              fill="#4FAE70"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function RecoveryChart({
  records,
  kgPerServing,
}: {
  records: DataRow[];
  kgPerServing: number;
}) {
  const groups: Record<string, number> = {};
  records
    .filter((r) => r.status === "completed")
    .forEach((r) => {
      const kg =
        r.unit === "kg"
          ? Number(r.quantity)
          : r.unit === "grams"
            ? Number(r.quantity) / 1000
            : r.unit === "servings"
              ? Number(r.quantity) * kgPerServing
              : Number(r.servings || 0) * kgPerServing;
      groups[r.method] = (groups[r.method] || 0) + kg;
    });
  return (
    <Panel
      title="Recovery & disposal outcomes"
      sub="Completed records · converted kilograms"
    >
      <Distribution
        rows={Object.entries(groups).map(([name, value]) => ({
          name,
          value,
          color: name === "Final disposal" ? flowColors[3] : flowColors[2],
        }))}
      />
      <p className="fw-chart-note">
        Scheduled recovery is counted only after completion. Destinations are
        simulated.
      </p>
    </Panel>
  );
}
export function SustainabilityCharts({ analytics: a }: { analytics: DataRow }) {
  const series = a.series.map((r: DataRow) => ({
    ...r,
    co2: ((r.preventedKg || 0) + r.redistributed) * a.methodology.co2PerKg,
    cost: (r.preventedKg || 0) * a.methodology.costPerKg,
  }));
  return (
    <>
      <div className="fw-impact-grid">
        <Panel
          title="Sustainability impact"
          sub="Food flow · all recorded outcomes"
        >
          <FoodFlowChart {...a} />
          <p className="fw-chart-note">
            Estimated prevention and recorded outcomes; not a physical mass
            balance.
          </p>
        </Panel>
        <Panel
          title="Prevention & redistribution"
          sub="Last 14 days · estimated kilograms"
        >
          <div className="chart">
            <ResponsiveContainer>
              <LineChart data={series}>
                <CartesianGrid vertical={false} stroke="#e6eeea" />
                <XAxis
                  dataKey="label"
                  minTickGap={28}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" />
                <Line
                  dataKey="preventedKg"
                  name="Prevented (kg)"
                  stroke={flowColors[0]}
                  strokeWidth={2}
                />
                <Line
                  dataKey="redistributed"
                  name="Redistributed (kg)"
                  stroke={flowColors[1]}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <Panel
        title="Estimated environmental & cost impact"
        sub="Illustrative conversion factors · last 14 days"
      >
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={series}>
              <CartesianGrid vertical={false} stroke="#e6eeea" />
              <XAxis dataKey="label" minTickGap={28} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="co2" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="cost"
                orientation="right"
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Legend iconType="circle" />
              <Bar
                yAxisId="co2"
                dataKey="co2"
                name="Estimated CO₂e (kg)"
                fill="#8aaf93"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="cost"
                dataKey="cost"
                name="Estimated cost avoided (₹)"
                fill="#b0cfc8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="fw-chart-note">
          Prevented + redistributed kg × {a.methodology.co2PerKg} kg CO₂e.
          Prevented kg × ₹{a.methodology.costPerKg}. Estimates are not audited
          savings.
        </p>
      </Panel>
    </>
  );
}

export function FactoryFlow({ data }: { data: DataRow }) {
  const rows = processingRows();
  return (
    <div className="fw-impact-grid">
      <Panel
        title="Material flow"
        sub="Seven simulated batches · input split into output and loss"
      >
        <Distribution
          center="simulated kg"
          rows={[
            {
              name: "Production output",
              value: rows.reduce((n, r) => n + r.output, 0),
              color: "#39AEB3",
            },
            {
              name: "Processing loss",
              value: rows.reduce((n, r) => n + r.lossKg, 0),
              color: "#a6b59d",
            },
          ]}
        />
        <p className="fw-chart-note">
          Illustrative processing measurements. Actual recovery records are
          shown separately.
        </p>
      </Panel>
      <RecoveryChart
        records={data.recovery}
        kgPerServing={data.analytics.methodology.kgPerServing}
      />
    </div>
  );
}

export function NetworkCharts({ data }: { data: DataRow }) {
  const completed = data.surplus.filter(
    (r: DataRow) => r.status === "completed",
  );
  const organizations = data.organizations
    .filter((o: DataRow) => o.type === "INSTITUTION")
    .map((o: DataRow) => ({
      name: o.name,
      completed: completed.filter((r: DataRow) => r.organizationId === o.id)
        .length,
    }))
    .sort((a: DataRow, b: DataRow) => b.completed - a.completed)
    .slice(0, 5);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const entries = completed.filter((r: DataRow) =>
      String(r.completedAt || r.createdAt).startsWith(key),
    );
    return {
      month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      regular: entries.filter((r: DataRow) => !r.afterHours).length,
      afterHours: entries.filter((r: DataRow) => r.afterHours).length,
      recovery: data.recovery.filter(
        (r: DataRow) =>
          r.status === "completed" &&
          r.method !== "Final disposal" &&
          r.createdAt.startsWith(key),
      ).length,
    };
  });
  return (
    <div className="fw-impact-grid">
      <Panel
        title="Network activity"
        sub="Completed records · last six calendar months"
      >
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={months}>
              <CartesianGrid vertical={false} stroke="#e6eeea" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="regular"
                name="Regular redistribution"
                fill="#39AEB3"
              />
              <Bar
                dataKey="afterHours"
                name="After-hours redistribution"
                fill="#97c9c4"
              />
              <Bar
                dataKey="recovery"
                name="Recovery"
                fill="#E5B44C"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="fw-chart-note">
          Redistribution uses the latest 200 journeys. Recovery is grouped by
          record creation month.
        </p>
      </Panel>
      <Panel
        title="Institution comparison"
        sub="Confirmed handovers · top five institutions in visible history"
      >
        <div className="chart">
          <ResponsiveContainer>
            <BarChart
              data={organizations}
              layout="vertical"
              margin={{ right: 20 }}
            >
              <CartesianGrid horizontal={false} stroke="#e6eeea" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 10 }}
              />
              <Tooltip />
              <Bar
                dataKey="completed"
                name="Confirmed handovers"
                fill="#39AEB3"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
