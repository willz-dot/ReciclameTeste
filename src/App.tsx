import { useState, useEffect } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:          "#F6F4EC",
  card:        "#FDFCF7",
  green:       "#2F4A3A",
  greenMid:    "#3D6050",
  sage:        "#C8D9C0",
  sagePale:    "#E8EFE3",
  sageDim:     "#A6BDAB",
  terra:       "#B86A3E",
  terraLight:  "#F0DDD0",
  text:        "#2A3028",
  textMuted:   "#6E7D6B",
  border:      "#E0E4D8",
  borderLight: "#ECEEE7",
};

type Screen = "home" | "admin" | "resident";

// ─── Data ─────────────────────────────────────────────────────────────────────
const BAIRROS = [
  "Jardim Primavera","Vila Nova","Centro Histórico",
  "Bosque das Palmeiras","Parque Ecológico","Santa Clara","Alto da Serra",
];

const SCHEDULE: Record<string,{day:string;type:string;dot:string}[]> = {
  "Jardim Primavera": [
    {day:"Segunda e Quinta",type:"Resíduos Comuns",dot:C.green},
    {day:"Terça e Sexta",  type:"Recicláveis",    dot:C.greenMid},
    {day:"Sábado",         type:"Orgânicos",       dot:C.terra},
  ],
  "Vila Nova": [
    {day:"Terça e Sexta",  type:"Resíduos Comuns",dot:C.green},
    {day:"Quarta",         type:"Recicláveis",     dot:C.greenMid},
    {day:"Sábado",         type:"Orgânicos",       dot:C.terra},
  ],
  "Centro Histórico": [
    {day:"Segunda a Sexta",type:"Resíduos Comuns",dot:C.green},
    {day:"Quarta e Sábado",type:"Recicláveis",    dot:C.greenMid},
    {day:"Domingo",        type:"Orgânicos",       dot:C.terra},
  ],
  "Bosque das Palmeiras": [
    {day:"Segunda e Quarta",type:"Resíduos Comuns",dot:C.green},
    {day:"Quinta",          type:"Recicláveis",    dot:C.greenMid},
    {day:"Sábado",          type:"Orgânicos",      dot:C.terra},
  ],
  "Parque Ecológico": [
    {day:"Terça e Quinta",  type:"Resíduos Comuns",dot:C.green},
    {day:"Segunda e Sexta", type:"Recicláveis",    dot:C.greenMid},
    {day:"Domingo",         type:"Orgânicos",      dot:C.terra},
  ],
  "Santa Clara": [
    {day:"Quarta e Sábado",type:"Resíduos Comuns",dot:C.green},
    {day:"Terça e Quinta", type:"Recicláveis",    dot:C.greenMid},
    {day:"Domingo",        type:"Orgânicos",      dot:C.terra},
  ],
  "Alto da Serra": [
    {day:"Seg, Qua e Sex",type:"Resíduos Comuns",dot:C.green},
    {day:"Terça e Quinta",type:"Recicláveis",    dot:C.greenMid},
    {day:"Sáb e Dom",     type:"Orgânicos",      dot:C.terra},
  ],
};

const RESIDENTS = [
  {id:1, name:"Ana Lima",       bairro:"Jardim Primavera",   coletas:12,ultima:"28/08/2026",status:"Ativo"},
  {id:2, name:"Carlos Mendes", bairro:"Vila Nova",           coletas:8, ultima:"27/08/2026",status:"Ativo"},
  {id:3, name:"Fernanda Costa",bairro:"Centro Histórico",    coletas:15,ultima:"29/08/2026",status:"Ativo"},
  {id:4, name:"João Souza",    bairro:"Bosque das Palmeiras",coletas:3, ultima:"25/08/2026",status:"Irregular"},
  {id:5, name:"Maria Oliveira",bairro:"Parque Ecológico",    coletas:20,ultima:"30/08/2026",status:"Ativo"},
  {id:6, name:"Pedro Alves",   bairro:"Santa Clara",         coletas:6, ultima:"26/08/2026",status:"Ativo"},
  {id:7, name:"Sofia Ribeiro", bairro:"Alto da Serra",       coletas:0, ultima:"—",         status:"Inativo"},
  {id:8, name:"Lucas Ferreira",bairro:"Jardim Primavera",    coletas:11,ultima:"28/08/2026",status:"Ativo"},
  {id:9, name:"Beatriz Nunes", bairro:"Vila Nova",           coletas:9, ultima:"27/08/2026",status:"Ativo"},
  {id:10,name:"Rafael Dias",   bairro:"Centro Histórico",    coletas:4, ultima:"22/08/2026",status:"Irregular"},
];

// ─── Calendar ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                     "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS_SHORT = ["D","S","T","Q","Q","S","S"];
const WEEKDAYS_LONG  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function buildCalendar(y:number,m:number){
  const first=new Date(y,m,1).getDay();
  const days =new Date(y,m+1,0).getDate();
  const cells:(number|null)[]=Array(first).fill(null);
  for(let d=1;d<=days;d++) cells.push(d);
  while(cells.length%7) cells.push(null);
  return cells;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const sv={fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};

const ILeaf    = ()=><svg width="18" height="18" viewBox="0 0 24 24" {...sv}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IArrow   = ()=><svg width="16" height="16" viewBox="0 0 24 24" {...sv}><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const ITruck   = ()=><svg width="18" height="18" viewBox="0 0 24 24" {...sv}><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IRecycle = ()=><svg width="18" height="18" viewBox="0 0 24 24" {...sv}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></svg>;
const ISearch  = ()=><svg width="16" height="16" viewBox="0 0 24 24" {...sv}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const ICalendar= ()=><svg width="16" height="16" viewBox="0 0 24 24" {...sv}><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IPin     = ()=><svg width="14" height="14" viewBox="0 0 24 24" {...sv}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IUsers   = ()=><svg width="18" height="18" viewBox="0 0 24 24" {...sv}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IInfo    = ()=><svg width="16" height="16" viewBox="0 0 24 24" {...sv}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
const IChevron = ({d="down"}:{d?:"left"|"right"|"up"|"down"})=>{
  const r={left:90,right:-90,up:180,down:0}[d];
  return <svg width="14" height="14" viewBox="0 0 24 24" {...sv} style={{transform:`rotate(${r}deg)`,transition:"transform .2s"}}><path d="m6 9 6 6 6-6"/></svg>;
};
const IMenu = ()=><svg width="20" height="20" viewBox="0 0 24 24" {...sv}><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
const IClose= ()=><svg width="20" height="20" viewBox="0 0 24 24" {...sv}><path d="M18 6 6 18M6 6l12 12"/></svg>;

// ─── Shared components ────────────────────────────────────────────────────────
function Card({children,className="",style={}}:{children:React.ReactNode;className?:string;style?:React.CSSProperties}){
  return(
    <div className={`rounded-2xl ${className}`} style={{
      background:C.card,border:`1px solid ${C.borderLight}`,
      boxShadow:"0 1px 4px rgba(42,48,40,.05),0 4px 16px rgba(42,48,40,.04)",...style,
    }}>{children}</div>
  );
}

function Badge({label,variant="sage"}:{label:string;variant?:"sage"|"terra"|"muted"}){
  const styles={
    sage: {background:C.sagePale,color:C.greenMid},
    terra:{background:C.terraLight,color:C.terra},
    muted:{background:C.borderLight,color:C.textMuted},
  };
  return(
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={styles[variant]}>{label}</span>
  );
}

function Blobs(){
  return(
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="blob absolute -top-20 -left-20 w-64 h-64 opacity-40" style={{background:C.sage}}/>
      <div className="blob absolute top-1/2 -right-24 w-52 h-52 opacity-20"
        style={{background:C.sagePale,borderRadius:"40% 60% 55% 45% / 60% 45% 55% 40%"}}/>
      <div className="blob absolute bottom-10 left-1/3 w-40 h-40 opacity-15"
        style={{background:C.sage,borderRadius:"50% 50% 40% 60% / 45% 55% 45% 55%"}}/>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({active,set}:{active:Screen;set:(s:Screen)=>void}){
  const [open,setOpen]=useState(false);

  // close drawer on screen change
  useEffect(()=>{ setOpen(false); },[active]);
  // lock body scroll when drawer is open
  useEffect(()=>{
    document.body.style.overflow=open?"hidden":"";
    return ()=>{ document.body.style.overflow=""; };
  },[open]);

  const links:[Screen,string][]=[
    ["home","Início"],
    ["resident","Minha Coleta"],
    ["admin","Painel Admin"],
  ];

  const navBtn=(id:Screen,label:string,mobile=false)=>(
    <button
      key={id}
      onClick={()=>set(id)}
      className="touch-target font-medium transition-all rounded-full"
      style={mobile
        ? {
            width:"100%",justifyContent:"flex-start",padding:"0 20px",
            fontSize:"1.125rem",
            background:active===id?C.sagePale:"transparent",
            color:active===id?C.green:C.text,
          }
        : {
            padding:"0 16px",fontSize:"0.875rem",
            background:active===id?C.green:"transparent",
            color:active===id?"#fff":C.textMuted,
          }
      }
    >{label}</button>
  );

  return(
    <>
      <header style={{background:C.card,borderBottom:`1px solid ${C.border}`}} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* logo */}
          <button onClick={()=>set("home")} className="touch-target gap-2 flex items-center" style={{paddingLeft:0,paddingRight:8}}>
            <span style={{color:C.green}}><ILeaf /></span>
            <span style={{fontFamily:"Fraunces,Georgia,serif",color:C.green,fontWeight:600,fontSize:"1.1rem",letterSpacing:"-0.01em"}}>
              Recicla&#8209;me
            </span>
          </button>

          {/* desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(([id,label])=>navBtn(id,label))}
          </nav>

          {/* hamburger */}
          <button
            className="touch-target md:hidden rounded-xl"
            style={{color:C.green,background:"transparent",border:"none"}}
            onClick={()=>setOpen(o=>!o)}
            aria-label={open?"Fechar menu":"Abrir menu"}
          >
            {open ? <IClose /> : <IMenu />}
          </button>
        </div>
      </header>

      {/* mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{background:"rgba(42,48,40,0.35)"}}
          onClick={()=>setOpen(false)}
        />
      )}

      {/* mobile drawer panel */}
      <div
        className="fixed top-16 left-0 right-0 z-50 md:hidden transition-all"
        style={{
          background:C.card,
          borderBottom:`1px solid ${C.border}`,
          boxShadow:"0 8px 24px rgba(42,48,40,.1)",
          transform:open?"translateY(0)":"translateY(-110%)",
          transition:"transform .25s ease",
          padding:"12px 16px 20px",
        }}
      >
        <nav className="flex flex-col gap-1">
          {links.map(([id,label])=>navBtn(id,label,true))}
        </nav>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════════════════════════
function HomeScreen({set}:{set:(s:Screen)=>void}){
  return(
    <div style={{background:C.bg}} className="min-h-screen relative overflow-x-hidden">
      <Blobs />

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 md:px-8 pt-14 md:pt-24 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Text — always first in DOM so mobile shows text before image */}
          <div className="order-1">
            <span
              className="inline-flex items-center gap-1.5 font-medium uppercase mb-6 md:mb-8 px-3 rounded-full"
              style={{background:C.sagePale,color:C.greenMid,fontSize:"0.7rem",letterSpacing:"0.1em",height:32}}
            >
              <ILeaf /> Gestão de Resíduos · 2026
            </span>

            <h1
              style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,lineHeight:1.05,letterSpacing:"-0.02em",
                      fontSize:"clamp(2.4rem, 7vw, 4.5rem)",marginBottom:"1.25rem"}}
            >
              Recicla&#8209;me<br/>
              <em style={{color:C.green,fontStyle:"italic",fontWeight:400}}>Se For Capaz</em>
            </h1>

            <p style={{fontSize:"1rem",lineHeight:1.7,color:C.textMuted,maxWidth:440,marginBottom:"2rem"}}>
              Consulte os dias de coleta do seu bairro, acompanhe o calendário semanal e contribua com a cidade de forma simples e consciente.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={()=>set("resident")}
                className="touch-target inline-flex items-center gap-2 rounded-full font-medium transition-all hover:opacity-85"
                style={{paddingLeft:24,paddingRight:24,background:C.green,color:"#fff",fontSize:"1rem"}}
              >
                Ver minha coleta <IArrow />
              </button>
              <button
                onClick={()=>set("admin")}
                className="touch-target inline-flex items-center gap-2 rounded-full font-medium border transition-all hover:bg-white/60"
                style={{paddingLeft:20,paddingRight:20,borderColor:C.border,color:C.text,background:"transparent",fontSize:"1rem"}}
              >
                Painel admin
              </button>
            </div>

            {/* mini stats */}
            <div className="flex gap-8 mt-10 pt-8 border-t" style={{borderColor:C.border}}>
              {[{n:"7",l:"bairros"},{n:"1.240",l:"moradores"},{n:"94%",l:"adesão"}].map(s=>(
                <div key={s.l}>
                  <p style={{fontFamily:"Fraunces,Georgia,serif",color:C.green,fontSize:"1.75rem",fontWeight:600,lineHeight:1}}>{s.n}</p>
                  <p style={{fontSize:"0.8rem",color:C.textMuted,marginTop:3}}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image — order-2 so always below text on mobile */}
          <div className="order-2 relative">
            <div className="rounded-3xl p-2.5 shadow-sm" style={{background:"#fff",border:`1px solid ${C.border}`}}>
              <div className="rounded-2xl overflow-hidden" style={{aspectRatio:"4/5",background:C.sagePale}}>
                <img
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=720&h=900&fit=crop&auto=format"
                  alt="Reciclagem e sustentabilidade urbana"
                  style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                />
              </div>
            </div>

            {/* floating — next collection */}
            <div
              className="absolute -bottom-4 -left-3 md:-bottom-5 md:-left-6 flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{background:C.card,border:`1px solid ${C.border}`,boxShadow:"0 4px 20px rgba(42,48,40,.08)"}}
            >
              <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{background:C.sagePale,color:C.green}}><ITruck /></span>
              <div>
                <p style={{fontSize:"0.75rem",color:C.textMuted}}>Próxima coleta</p>
                <p style={{fontSize:"0.875rem",fontWeight:600,color:C.text}}>Amanhã · Recicláveis</p>
              </div>
            </div>

            {/* floating — volume */}
            <div
              className="absolute -top-3 -right-3 md:-top-4 md:-right-4 px-4 py-2.5 rounded-2xl flex items-center gap-2"
              style={{background:C.terraLight,border:"1px solid #E8C9B5"}}
            >
              <span style={{color:C.terra}}><IRecycle /></span>
              <span style={{fontSize:"0.8rem",fontWeight:500,color:C.terra}}>3,8 t / mês</span>
            </div>
          </div>
        </div>
      </section>

      {/* Próximas coletas */}
      <section className="relative max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p style={{fontSize:"0.7rem",fontWeight:500,letterSpacing:"0.1em",color:C.terra,textTransform:"uppercase",marginBottom:6}}>Calendário</p>
            <h2 style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontWeight:600,letterSpacing:"-0.015em",
                        fontSize:"clamp(1.6rem,5vw,2.25rem)"}}>
              Próximas coletas
            </h2>
          </div>
          <button
            onClick={()=>set("resident")}
            className="hidden md:inline-flex touch-target items-center gap-1.5 font-medium transition-opacity hover:opacity-60 rounded-full"
            style={{color:C.green,fontSize:"0.875rem",paddingLeft:8,paddingRight:8}}
          >
            Ver calendário <IArrow />
          </button>
        </div>

        {/* single-column on mobile, 3-col on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[
            {date:"Seg, 01 Set",bairro:"Jardim Primavera",type:"Recicláveis",    icon:<IRecycle />,badge:"sage" as const, items:["Papel e papelão","Plástico","Vidro","Metal"]},
            {date:"Ter, 02 Set",bairro:"Vila Nova",       type:"Orgânicos",       icon:<ILeaf />,  badge:"terra" as const,items:["Restos de alimentos","Borra de café","Cascas de frutas"]},
            {date:"Qua, 03 Set",bairro:"Centro Histórico",type:"Resíduos Comuns",icon:<ITruck />, badge:"muted" as const,items:["Rejeitos domésticos","Embalagens sujas","Materiais mistos"]},
          ].map(c=>(
            <Card key={c.bairro} className="p-5 md:p-6 flex flex-col gap-4 md:gap-5">
              <div className="flex items-start justify-between">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:c.badge==="terra"?C.terraLight:C.sagePale,
                          color:c.badge==="terra"?C.terra:C.green}}>{c.icon}</span>
                <Badge label={c.type} variant={c.badge} />
              </div>
              <div>
                <p style={{fontSize:"0.8rem",color:C.textMuted,marginBottom:2}}>{c.date}</p>
                <p style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontSize:"1.15rem",fontWeight:600}}>{c.bairro}</p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {c.items.map(i=>(
                  <li key={i} className="flex items-center gap-2" style={{fontSize:"0.9375rem",color:C.textMuted}}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{background:c.badge==="terra"?C.terra:C.greenMid}} />{i}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* mobile "ver calendário" link */}
        <div className="md:hidden mt-5 text-center">
          <button
            onClick={()=>set("resident")}
            className="touch-target inline-flex items-center gap-1.5 font-medium rounded-full"
            style={{color:C.green,fontSize:"1rem",paddingLeft:12,paddingRight:12}}
          >
            Ver calendário completo <IArrow />
          </button>
        </div>
      </section>

      {/* Orientações */}
      <section className="relative py-14 md:py-20" style={{background:C.sagePale}}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <p style={{fontSize:"0.7rem",fontWeight:500,letterSpacing:"0.1em",color:C.terra,textTransform:"uppercase",marginBottom:6}}>Como participar</p>
            <h2 style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontWeight:600,letterSpacing:"-0.015em",
                        fontSize:"clamp(1.6rem,5vw,2.25rem)"}}>
              Orientações de descarte
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {[
              {n:"01",title:"Separe os resíduos",  desc:"Divida em orgânicos, recicláveis e rejeitos antes do descarte."},
              {n:"02",title:"Lave as embalagens",  desc:"Lave e seque embalagens recicláveis para evitar contaminação."},
              {n:"03",title:"Consulte o calendário",desc:"Verifique os dias de coleta por tipo no seu bairro."},
              {n:"04",title:"Coloque na calçada",  desc:"Disponibilize os resíduos até as 7h no dia da coleta."},
            ].map(t=>(
              <Card key={t.n} className="p-5 md:p-6">
                <span style={{fontFamily:"Fraunces,Georgia,serif",color:C.sage,fontSize:"2.25rem",fontWeight:700,lineHeight:1,display:"block",marginBottom:"0.875rem"}}>{t.n}</span>
                <h3 style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontSize:"1rem",fontWeight:600,marginBottom:"0.5rem"}}>{t.title}</h3>
                <p style={{fontSize:"0.9375rem",lineHeight:1.65,color:C.textMuted}}>{t.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <div
          className="rounded-3xl px-7 py-12 md:px-16 md:py-14 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 justify-between"
          style={{background:C.green}}
        >
          <div>
            <h2 style={{fontFamily:"Fraunces,Georgia,serif",color:"#fff",fontWeight:600,letterSpacing:"-0.015em",
                        marginBottom:8,fontSize:"clamp(1.4rem,4vw,2rem)"}}>
              Consulte o calendário do seu bairro
            </h2>
            <p style={{color:C.sage,fontSize:"0.9375rem",lineHeight:1.65,maxWidth:360}}>
              Descubra os dias e tipos de coleta para a sua região em segundos.
            </p>
          </div>
          <button
            onClick={()=>set("resident")}
            className="touch-target flex-shrink-0 inline-flex items-center gap-2 rounded-full font-medium transition-all hover:opacity-90 whitespace-nowrap"
            style={{paddingLeft:28,paddingRight:28,background:C.card,color:C.green,fontSize:"1rem"}}
          >
            Consultar agora <IArrow />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8" style={{borderTop:`1px solid ${C.border}`}}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2" style={{color:C.green}}>
            <ILeaf />
            <span style={{fontFamily:"Fraunces,Georgia,serif",fontWeight:600}}>Recicla-me</span>
          </div>
          <p style={{fontSize:"0.8rem",color:C.textMuted,textAlign:"center"}}>
            © 2026 Recicla-me Se For Capaz — Gestão Sustentável de Resíduos
          </p>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
const STATUS_BADGE:{[k:string]:"sage"|"terra"|"muted"}={Ativo:"sage",Irregular:"terra",Inativo:"muted"};

function AdminScreen(){
  const [search,setSearch]           = useState("");
  const [filterStatus,setFilterStatus] = useState("Todos");

  const filtered=RESIDENTS.filter(r=>{
    const ms=r.name.toLowerCase().includes(search.toLowerCase())||r.bairro.toLowerCase().includes(search.toLowerCase());
    const mf=filterStatus==="Todos"||r.status===filterStatus;
    return ms&&mf;
  });

  const kpis=[
    {label:"Total de moradores",     value:"1.240",sub:"+8 este mês",  icon:<IUsers />,  bg:C.sagePale, ic:C.green},
    {label:"Coletas realizadas/mês", value:"2.184",sub:"Setembro 2026",icon:<ITruck />,  bg:C.terraLight,ic:C.terra},
    {label:"Taxa de adesão",         value:"94%",  sub:"Meta: 90%",   icon:<IRecycle />,bg:C.sagePale, ic:C.greenMid},
    {label:"Bairros ativos",         value:"7",    sub:"de 7 setores", icon:<IPin />,    bg:C.sagePale, ic:C.green},
  ];

  return(
    <div style={{background:C.bg}} className="min-h-screen relative overflow-x-hidden">
      <Blobs />
      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">

        {/* header */}
        <div className="mb-8 md:mb-12">
          <p style={{fontSize:"0.7rem",fontWeight:500,letterSpacing:"0.1em",color:C.terra,textTransform:"uppercase",marginBottom:6}}>Painel Administrativo</p>
          <h1 style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontWeight:600,letterSpacing:"-0.02em",
                      fontSize:"clamp(2rem,6vw,2.75rem)"}}>
            Gestão de coletas
          </h1>
          <p style={{fontSize:"0.9375rem",color:C.textMuted,marginTop:6}}>Setembro 2026 · 7 bairros monitorados</p>
        </div>

        {/* KPIs — 2-col on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
          {kpis.map(k=>(
            <Card key={k.label} className="p-4 md:p-5">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{background:k.bg,color:k.ic}}>{k.icon}</span>
              <p style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontSize:"clamp(1.5rem,4vw,2rem)",fontWeight:600,lineHeight:1}}>{k.value}</p>
              <p style={{fontSize:"0.8rem",color:C.textMuted,marginTop:3,lineHeight:1.4}}>{k.label}</p>
              <p style={{fontSize:"0.75rem",fontWeight:500,color:k.ic,marginTop:2}}>{k.sub}</p>
            </Card>
          ))}
        </div>

        {/* Volume bars */}
        <Card className="p-5 md:p-6 mb-6 md:mb-8">
          <h2 style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontSize:"1.15rem",fontWeight:600,marginBottom:"1.125rem"}}>
            Volume por tipo de resíduo
          </h2>
          <div className="flex flex-col gap-4 md:gap-5">
            {[
              {label:"Recicláveis",    pct:68,color:C.green},
              {label:"Orgânicos",      pct:45,color:C.terra},
              {label:"Resíduos Comuns",pct:82,color:C.greenMid},
            ].map(b=>(
              <div key={b.label}>
                <div className="flex justify-between mb-2">
                  <span style={{fontSize:"0.9375rem",fontWeight:500,color:C.text}}>{b.label}</span>
                  <span style={{fontSize:"0.9375rem",color:C.textMuted}}>{b.pct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{background:C.borderLight}}>
                  <div className="h-full rounded-full" style={{width:`${b.pct}%`,background:b.color}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Search + filter */}
        <Card>
          <div className="px-4 md:px-6 py-4 md:py-5 flex flex-col gap-4 border-b" style={{borderColor:C.borderLight}}>
            <h2 style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontSize:"1.15rem",fontWeight:600}}>
              Moradores e coletas
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:C.textMuted}}><ISearch /></span>
                <input
                  type="text"
                  placeholder="Buscar morador ou bairro…"
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  style={{
                    height:44,width:"100%",paddingLeft:34,paddingRight:12,
                    borderRadius:12,border:`1px solid ${C.border}`,background:C.bg,
                    color:C.text,fontSize:"1rem",outline:"none",
                  }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={e=>setFilterStatus(e.target.value)}
                style={{
                  height:44,paddingLeft:14,paddingRight:14,
                  borderRadius:12,border:`1px solid ${C.border}`,
                  background:C.bg,color:C.text,fontSize:"1rem",outline:"none",
                }}
              >
                {["Todos","Ativo","Irregular","Inativo"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* ── Desktop table (hidden on mobile) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" style={{fontSize:"0.9375rem"}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.borderLight}`}}>
                  {["#","Morador","Bairro","Coletas","Última coleta","Status"].map(h=>(
                    <th key={h} className="text-left px-6 py-3"
                      style={{fontSize:"0.7rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",color:C.textMuted}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r,i)=>(
                  <tr key={r.id} style={{borderBottom:`1px solid ${C.borderLight}`}}
                    onMouseEnter={e=>(e.currentTarget.style.background=C.sagePale)}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                  >
                    <td className="px-6 py-4" style={{fontFamily:"monospace",fontSize:"0.75rem",color:C.textMuted}}>{String(i+1).padStart(2,"0")}</td>
                    <td className="px-6 py-4" style={{fontWeight:500,color:C.text}}>{r.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1" style={{fontSize:"0.875rem",color:C.textMuted}}><IPin />{r.bairro}</span>
                    </td>
                    <td className="px-6 py-4" style={{fontWeight:600,color:C.green}}>{r.coletas}</td>
                    <td className="px-6 py-4" style={{color:C.textMuted}}>{r.ultima}</td>
                    <td className="px-6 py-4"><Badge label={r.status} variant={STATUS_BADGE[r.status]}/></td>
                  </tr>
                ))}
                {filtered.length===0&&(
                  <tr><td colSpan={6} className="px-6 py-12 text-center" style={{color:C.textMuted}}>Nenhum morador encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards list (hidden on md+) ── */}
          <div className="md:hidden flex flex-col divide-y" style={{borderColor:C.borderLight}}>
            {filtered.length===0&&(
              <p className="px-4 py-10 text-center" style={{color:C.textMuted,fontSize:"1rem"}}>Nenhum morador encontrado.</p>
            )}
            {filtered.map((r,i)=>(
              <div key={r.id} className="px-4 py-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span style={{fontWeight:600,color:C.text,fontSize:"1rem"}}>{r.name}</span>
                  <Badge label={r.status} variant={STATUS_BADGE[r.status]} />
                </div>
                <div className="flex items-center gap-1" style={{fontSize:"0.875rem",color:C.textMuted}}>
                  <IPin />{r.bairro}
                </div>
                <div className="flex gap-6">
                  <div>
                    <p style={{fontSize:"0.75rem",color:C.textMuted,marginBottom:1}}>Coletas</p>
                    <p style={{fontWeight:600,color:C.green,fontSize:"1rem"}}>{r.coletas}</p>
                  </div>
                  <div>
                    <p style={{fontSize:"0.75rem",color:C.textMuted,marginBottom:1}}>Última coleta</p>
                    <p style={{fontSize:"1rem",color:C.text}}>{r.ultima}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 md:px-6 py-3 border-t" style={{borderColor:C.borderLight,background:C.bg,borderRadius:"0 0 1rem 1rem"}}>
            <p style={{fontSize:"0.8rem",color:C.textMuted}}>{filtered.length} resultado{filtered.length!==1?"s":""}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESIDENT
// ═══════════════════════════════════════════════════════════════════════════════
function ResidentScreen(){
  const [bairro,setBairro]       = useState("");
  const [calMonth,setCalMonth]   = useState(8);
  const [calYear,setCalYear]     = useState(2026);
  const [selectedDay,setSelectedDay] = useState<number|null>(null);

  const schedule=bairro?SCHEDULE[bairro]:[];
  const cells=buildCalendar(calYear,calMonth);
  const collectionDays=new Set([2,5,9,12,16,19,23,26,30]);

  function prev(){if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);}
  function next(){if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);}

  return(
    <div style={{background:C.bg}} className="min-h-screen relative overflow-x-hidden">
      <Blobs />
      <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">

        {/* header */}
        <div className="mb-8 md:mb-10">
          <p style={{fontSize:"0.7rem",fontWeight:500,letterSpacing:"0.1em",color:C.terra,textTransform:"uppercase",marginBottom:6}}>Consulta do Morador</p>
          <h1 style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontWeight:600,letterSpacing:"-0.02em",
                      fontSize:"clamp(2rem,6vw,2.75rem)"}}>
            Minha coleta
          </h1>
          <p style={{fontSize:"0.9375rem",color:C.textMuted,marginTop:6}}>Selecione seu bairro para visualizar o calendário de coletas</p>
        </div>

        {/* bairro selector */}
        <Card className="p-4 md:p-6 mb-6 md:mb-8">
          <p style={{fontSize:"0.75rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",color:C.textMuted,marginBottom:12}}>
            Selecione seu bairro
          </p>
          <div className="flex flex-wrap gap-2">
            {BAIRROS.map(b=>(
              <button
                key={b}
                onClick={()=>{setBairro(b);setSelectedDay(null);}}
                className="touch-target rounded-full font-medium border transition-all"
                style={{
                  paddingLeft:16,paddingRight:16,fontSize:"0.9375rem",
                  ...(bairro===b
                    ?{background:C.green,color:"#fff",borderColor:C.green}
                    :{background:"transparent",color:C.textMuted,borderColor:C.border}),
                }}
              >{b}</button>
            ))}
          </div>
        </Card>

        {bairro?(
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-7">

            {/* Calendar */}
            <Card className="lg:col-span-3 p-4 md:p-7">
              <div className="flex items-center justify-between mb-5 md:mb-6">
                <button onClick={prev}
                  className="touch-target rounded-full border"
                  style={{borderColor:C.border,color:C.green,background:"transparent"}}>
                  <IChevron d="left" />
                </button>
                <h3 style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontSize:"1.1rem",fontWeight:600}}>
                  {MONTH_NAMES[calMonth]} {calYear}
                </h3>
                <button onClick={next}
                  className="touch-target rounded-full border"
                  style={{borderColor:C.border,color:C.green,background:"transparent"}}>
                  <IChevron d="right" />
                </button>
              </div>

              {/* day headers — short on mobile */}
              <div className="grid grid-cols-7 mb-1">
                {(window.innerWidth<640?WEEKDAYS_SHORT:WEEKDAYS_LONG).map((d,i)=>(
                  <div key={i} className="text-center py-2"
                    style={{fontSize:"0.75rem",fontWeight:600,color:C.textMuted}}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                {cells.map((day,idx)=>{
                  if(day===null) return <div key={idx}/>;
                  const isToday=day===1&&calMonth===8&&calYear===2026;
                  const hasCol=collectionDays.has(day);
                  const isSel=selectedDay===day;
                  return(
                    <button
                      key={idx}
                      onClick={()=>setSelectedDay(isSel?null:day)}
                      className="relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all touch-target"
                      style={{
                        fontWeight:isToday||isSel?600:400,
                        background:isSel?C.green:isToday?C.sagePale:"transparent",
                        color:isSel?"#fff":isToday?C.green:C.text,
                        fontSize:"0.875rem",
                        minWidth:0,minHeight:0, // let aspect-ratio control size
                      }}
                    >
                      {day}
                      {hasCol&&(
                        <span className="absolute bottom-1 w-1 h-1 rounded-full"
                          style={{background:isSel?C.sage:C.terra}}/>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t" style={{borderColor:C.borderLight}}>
                <span className="flex items-center gap-1.5" style={{fontSize:"0.8rem",color:C.textMuted}}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:C.terra}}/> Dia com coleta
                </span>
                <span className="flex items-center gap-1.5" style={{fontSize:"0.8rem",color:C.textMuted}}>
                  <span className="w-5 h-5 rounded-lg flex items-center justify-center text-xs"
                    style={{background:C.sagePale,color:C.green}}>·</span> Hoje
                </span>
              </div>
            </Card>

            {/* Sidebar */}
            <div className="lg:col-span-2 flex flex-col gap-4 md:gap-5">

              {/* Schedule */}
              <Card className="p-4 md:p-6">
                <h3 style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontSize:"1.05rem",fontWeight:600,marginBottom:4}}>
                  Calendário semanal
                </h3>
                <p className="flex items-center gap-1 mb-4" style={{fontSize:"0.875rem",color:C.textMuted}}>
                  <IPin />{bairro}
                </p>
                <div className="flex flex-col gap-2.5">
                  {schedule.map(s=>(
                    <div key={s.type} className="flex items-start gap-3 rounded-xl p-3.5" style={{background:C.bg}}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{background:s.dot}}/>
                      <div>
                        <p style={{fontSize:"0.9375rem",fontWeight:600,color:C.text,marginBottom:2}}>{s.type}</p>
                        <p style={{fontSize:"0.875rem",color:C.textMuted}}>{s.day}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Próximas coletas */}
              <div className="rounded-2xl p-4 md:p-6" style={{background:C.green}}>
                <h3 style={{fontFamily:"Fraunces,Georgia,serif",color:"#fff",fontSize:"1.05rem",fontWeight:600,marginBottom:"0.875rem"}}>
                  Próximas coletas
                </h3>
                <div className="flex flex-col gap-2.5">
                  {[
                    {date:"Seg, 01 Set",type:"Resíduos Comuns"},
                    {date:"Ter, 02 Set",type:"Recicláveis"},
                    {date:"Sáb, 06 Set",type:"Orgânicos"},
                  ].map(nc=>(
                    <div key={nc.date} className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{background:"rgba(200,217,192,0.15)"}}>
                      <div>
                        <p style={{fontSize:"0.8rem",color:C.sageDim}}>{nc.date}</p>
                        <p style={{fontSize:"0.9375rem",fontWeight:500,color:"#fff"}}>{nc.type}</p>
                      </div>
                      <span style={{color:C.sageDim}}><ICalendar /></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="rounded-2xl p-4 flex gap-3" style={{background:C.terraLight,border:`1px solid #E2BFA5`}}>
                <span style={{color:C.terra,flexShrink:0,paddingTop:2}}><IInfo /></span>
                <p style={{fontSize:"0.9375rem",lineHeight:1.65,color:"#8A4E2E"}}>
                  Coloque os resíduos na calçada até as <strong>7h</strong> no dia da coleta para garantir o recolhimento.
                </p>
              </div>
            </div>
          </div>
        ):(
          <div className="rounded-3xl flex flex-col items-center justify-center py-20 text-center"
            style={{border:`2px dashed ${C.border}`}}>
            <span className="mb-4 block" style={{color:C.sage,transform:"scale(2)",transformOrigin:"center"}}><IPin /></span>
            <p style={{fontFamily:"Fraunces,Georgia,serif",color:C.text,fontSize:"1.4rem",fontWeight:600,marginBottom:8}}>
              Selecione um bairro
            </p>
            <p className="max-w-xs mx-auto" style={{fontSize:"0.9375rem",color:C.textMuted,lineHeight:1.65}}>
              Escolha seu bairro acima para visualizar o calendário e os horários de coleta da sua região.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState<Screen>("home");
  return(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100%"}}>
      <Nav active={screen} set={setScreen} />
      <main style={{flex:1,minWidth:0}}>
        {screen==="home"     && <HomeScreen     set={setScreen} />}
        {screen==="admin"    && <AdminScreen />}
        {screen==="resident" && <ResidentScreen />}
      </main>
    </div>
  );
}
