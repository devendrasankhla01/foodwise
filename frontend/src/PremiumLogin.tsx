import React,{useContext,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {
  Leaf,Check,Eye,EyeOff,Loader2,ArrowRight,ArrowUpRight,
  Utensils,HeartHandshake,Truck,ShieldCheck,Moon
} from 'lucide-react';
import {api,post} from './api';
import type {DataRow} from './components';
import './premium-login.css';

type Props={
  setUser:(user:DataRow)=>void;
};

export default function PremiumLogin({setUser}:Props){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [showPassword,setShowPassword]=useState(false);

  const navigate=useNavigate();
  const queryClient=useQueryClient();

  const settings=useQuery({
    queryKey:['auth-config'],
    queryFn:()=>api('/auth/config')
  });

  async function login(loginEmail=email,loginPassword=password){
    setError('');
    setBusy(true);

    try{
      const response=await post<{token:string;user:DataRow}>('/auth/login',{
        email:loginEmail,
        password:loginPassword
      });

      sessionStorage.setItem('foodwise-token',response.token);
      queryClient.clear();
      setUser(response.user);
      navigate('/');
    }catch(err){
      setError((err as Error).message);
    }finally{
      setBusy(false);
    }
  }

  const demoRoles=[
    ['institution',Utensils,'Institution'],
    ['recipient',HeartHandshake,'Recipient'],
    ['logistics',Truck,'Logistics'],
    ['admin',ShieldCheck,'Admin']
  ];

  return (
    <main className="premium-login">
      <section className="premium-login-visual">
        <div className="login-grid-pattern"/>
        <div className="login-orb login-orb-one"/>
        <div className="login-orb login-orb-two"/>

        <div className="visual-inner">
          <div className="premium-brand">
            <span><Leaf size={22}/></span>
            foodwise<i>.</i>
          </div>

          <div className="visual-copy">
            <div className="login-kicker">
              <span/>
              INTELLIGENT FOOD OPERATIONS
            </div>

            <h1>
              Good food deserves
              <em>a smarter journey.</em>
            </h1>

            <p>
              Predict demand, prevent waste, and move surplus food where it creates meaningful impact.
            </p>
          </div>

          <div className="impact-preview">
            <div className="impact-preview-head">
              <div>
                <small>LIVE NETWORK IMPACT</small>
                <strong>Today’s momentum</strong>
              </div>
              <span className="live-dot">Live</span>
            </div>

            <div className="impact-chart">
              <i style={{height:'34%'}}/>
              <i style={{height:'52%'}}/>
              <i style={{height:'45%'}}/>
              <i style={{height:'70%'}}/>
              <i style={{height:'61%'}}/>
              <i style={{height:'86%'}}/>
              <i style={{height:'76%'}}/>
            </div>

            <div className="impact-stats">
              <div><strong>92%</strong><span>forecast confidence</span></div>
              <div><strong>4×</strong><span>impact pathways</span></div>
              <div><strong>One</strong><span>connected ecosystem</span></div>
            </div>
          </div>

          <footer className="visual-footer">
            <span>FOODWISE · SIH 26234</span>
            <span>TEAM ANVAY — CONNECTED TO CREATE</span>
          </footer>
        </div>
      </section>

      <section className="premium-login-panel">
        <div className="login-panel-top">
          <span><Check size={14}/> Secure workspace access</span>
          <small>v1.0</small>
        </div>

        <div className="login-card">
          <div className="login-card-heading">
            <small>WELCOME BACK</small>
            <h2>Sign in to FoodWise</h2>
            <p>Use your organisation credentials to continue.</p>
          </div>

          <form
            className="premium-login-form"
            onSubmit={(event)=>{
              event.preventDefault();
              void login();
            }}
          >
            <label>
              Work email
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event)=>setEmail(event.target.value)}
                placeholder="name@organization.com"
              />
            </label>

            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword?'text':'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event)=>setPassword(event.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={()=>setShowPassword(!showPassword)}
                  aria-label="Show or hide password"
                >
                  {showPassword?<EyeOff size={18}/>:<Eye size={18}/>}
                </button>
              </div>
            </label>

            {error&&<div className="premium-error">{error}</div>}

            <button className="premium-submit" type="submit" disabled={busy}>
              {busy
                ? <Loader2 size={18} className="spin"/>
                : <>Continue to workspace <ArrowRight size={18}/></>
              }
            </button>
          </form>

          {settings.data?.demo&&(
            <>
              <div className="premium-divider"><span>QUICK DEMO ACCESS</span></div>

              <div className="premium-demo-grid">
                {demoRoles.map(([role,Icon,label])=>{
                  const RoleIcon=Icon as React.ElementType;

                  return (
                    <button
                      key={String(role)}
                      disabled={busy}
                      onClick={()=>void login(`${role}@foodwise.demo`,'FoodWise@2026')}
                    >
                      <b><RoleIcon size={18}/></b>
                      <span>{String(label)}</span>
                      <ArrowUpRight size={15}/>
                    </button>
                  );
                })}
              </div>

              <button
                className="after-hours-link"
                disabled={busy}
                onClick={()=>void login('night@foodwise.demo','FoodWise@2026')}
              >
                <Moon size={15}/>
                Explore after-hours recipient flow
                <ArrowRight size={14}/>
              </button>
            </>
          )}
        </div>

        <p className="login-privacy">
          Protected access for verified food ecosystem partners.
        </p>
      </section>
    </main>
  );
}