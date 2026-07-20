"use client";

import { useEffect, useMemo, useState } from "react";

type Trip = {
  id: number;
  passenger: string;
  initials: string;
  route: string;
  airports: string;
  date: string;
  time: string;
  airline: string;
  locator: string;
  status: "Confirmada" | "Pendente";
  color: string;
  surname?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
};

const airlines = ["LATAM", "GOL", "Azul", "TAP", "Iberia", "American", "Copa"];
const colors: Record<string,string> = { LATAM:"#5b2d91", GOL:"#f28c00", Azul:"#2087d4", TAP:"#118541", Iberia:"#d71920", American:"#1474a8", Copa:"#17477c" };
const formatDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { day:"2-digit", month:"short", year:"numeric", timeZone:"UTC" }).format(new Date(`${value}T00:00:00Z`)).replaceAll(" de "," ").toUpperCase();

function reservationUrl(trip: Trip) {
  const pnr=encodeURIComponent(trip.locator), surname=encodeURIComponent(trip.surname || trip.passenger.split(" ").at(-1) || ""), origin=encodeURIComponent(trip.origin || "");
  if(trip.airline==="Azul") return `https://www.voeazul.com.br/br/pt/home/minhas-viagens/confirmacao?pnr=${pnr}&origin=${origin}`;
  if(trip.airline==="TAP") return `https://myb.flytap.com/my-bookings/details/${pnr}/${surname}?market=br&language=pt`;
  if(trip.airline==="American") return `https://www.aa.com/reservation/view/find-your-trip?recordLocator=${pnr}&lastName=${surname}`;
  if(trip.airline==="Copa") return `https://mytrips.copaair.com/trip-detail/${pnr}/${surname}`;
  if(trip.airline==="Iberia") return "https://www.iberia.com/br/gesta-o-reservas/?language=pt&market=br&channel=COM#!/ibdash";
  if(trip.airline==="GOL") return "https://b2c.voegol.com.br/minhas-viagens/encontrar-viagem";
  return "https://www.latamairlines.com/br/pt/minhas-viagens";
}

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="nav-icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("Visão geral");
  const [selected, setSelected] = useState<Trip | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrips() {
    setLoading(true); setError("");
    try {
      const response=await fetch("/api/trips",{cache:"no-store"}); const data=await response.json();
      if(!response.ok) throw new Error(data.error);
      setTrips(data.trips.map((row: any) => ({ id:row.id, passenger:row.passenger, initials:row.passenger.split(/\s+/).slice(0,2).map((p:string)=>p[0]).join("").toUpperCase(), route:`${row.origin} → ${row.destination}`, airports:`${row.origin} • ${row.destination}`, date:formatDate(row.departureDate), time:row.departureTime||"A confirmar", airline:row.airline, locator:row.locator, status:row.status, color:colors[row.airline]||"#6747e8", surname:row.surname, origin:row.origin, destination:row.destination, departureDate:row.departureDate })));
    } catch(err) { setError(err instanceof Error?err.message:"Não foi possível carregar as viagens."); }
    finally { setLoading(false); }
  }
  useEffect(()=>{void loadTrips()},[]);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return trips;
    return trips.filter((trip) => `${trip.passenger} ${trip.route} ${trip.airline} ${trip.locator}`.toLowerCase().includes(term));
  }, [query]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">V</span>
          <div><strong>Viajou</strong><small>gestão de viagens</small></div>
        </div>

        <nav aria-label="Menu principal">
          {["Visão geral", "Viagens", "Passageiros", "Companhias", "Relatórios"].map((item, index) => (
            <button key={item} className={active === item ? "nav-item active" : "nav-item"} onClick={() => setActive(item)}>
              <Icon>{["⌂", "✈", "♙", "◉", "▥"][index]}</Icon>{item}
              {item === "Viagens" && <span className="nav-count">{trips.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item"><Icon>⚙</Icon>Configurações</button>
          <div className="profile"><span>AC</span><div><strong>Ana Carolina</strong><small>Administradora</small></div><b>⋯</b></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar passageiro, localizador ou destino..." /></div>
          <button className="icon-button" aria-label="Notificações">♢<i /></button>
          <button className="primary-button" onClick={() => setShowImport(true)}><span>＋</span> Nova viagem</button>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><p className="eyebrow">DOMINGO, 19 DE JULHO</p><h1>{active}</h1><p>Acompanhe reservas, passageiros e próximos embarques em um só lugar.</p></div>
            <button className="secondary-button" onClick={() => window.print()}>⇩ Exportar relatório</button>
          </div>

          <section className="metrics">
            <article><div className="metric-icon purple">✈</div><div><span>VIAGENS ATIVAS</span><strong>{trips.length}</strong><small className="positive">reservas cadastradas</small></div></article>
            <article><div className="metric-icon blue">♙</div><div><span>PASSAGEIROS</span><strong>{new Set(trips.map(t=>t.passenger.toLowerCase())).size}</strong><small>viajantes únicos</small></div></article>
            <article><div className="metric-icon orange">◷</div><div><span>PRÓXIMO EMBARQUE</span><strong>{trips[0]?.date||"—"}</strong><small>{trips[0]?.route||"Nenhuma viagem"}</small></div></article>
            <article><div className="metric-icon green">✓</div><div><span>CONFIRMADAS</span><strong>{trips.length?`${Math.round(trips.filter(t=>t.status==="Confirmada").length/trips.length*100)}%`:"0%"}</strong><small className="positive">{trips.filter(t=>t.status==="Confirmada").length} de {trips.length} reservas</small></div></article>
          </section>

          <section className="panel trips-panel">
            <div className="panel-heading"><div><h2>Próximas viagens</h2><p>Reservas com embarque nos próximos 30 dias</p></div><button onClick={() => setActive("Viagens")}>Ver todas →</button></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>PASSAGEIRO</th><th>ROTA</th><th>DATA E HORA</th><th>COMPANHIA</th><th>LOCALIZADOR</th><th>STATUS</th><th /></tr></thead>
                <tbody>
                  {filtered.map((trip) => (
                    <tr key={trip.id} onClick={() => setSelected(trip)}>
                      <td><div className="passenger"><span>{trip.initials}</span><strong>{trip.passenger}</strong></div></td>
                      <td><strong>{trip.route}</strong><small>{trip.airports}</small></td>
                      <td><strong>{trip.date}</strong><small>{trip.time}</small></td>
                      <td><span className="airline-dot" style={{ background: trip.color }}>{trip.airline[0]}</span><strong>{trip.airline}</strong></td>
                      <td><code>{trip.locator}</code></td>
                      <td><span className={`status ${trip.status === "Confirmada" ? "confirmed" : "pending"}`}>● {trip.status}</span></td>
                      <td><button className="row-action" aria-label={`Abrir viagem de ${trip.passenger}`}>›</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <div className="empty">Carregando viagens...</div>}
              {error && <div className="empty">{error}</div>}
              {!loading && !error && !filtered.length && <div className="empty">Nenhuma viagem cadastrada. Clique em “Nova viagem” para começar.</div>}
            </div>
          </section>

          <div className="lower-grid">
            <section className="panel airlines-panel"><div className="panel-heading"><div><h2>Companhias conectadas</h2><p>Links rápidos para consultar reservas</p></div></div><div className="airline-list">{airlines.map((name, index) => <button key={name}><span className={`airline-logo logo-${index}`}>{name.slice(0, 2).toUpperCase()}</span><strong>{name}</strong><small>Conectada</small><b>↗</b></button>)}</div></section>
            <section className="panel activity-panel"><div className="panel-heading"><div><h2>Resumo do sistema</h2><p>Dados atualizados automaticamente</p></div></div><ul><li><span className="activity-icon">✓</span><div><strong>{trips.filter(t=>t.status==="Confirmada").length} reservas confirmadas</strong><p>Prontas para embarque</p><small>Agora</small></div></li><li><span className="activity-icon blue">＋</span><div><strong>{new Set(trips.map(t=>t.passenger.toLowerCase())).size} passageiros</strong><p>Cadastrados no sistema</p><small>Agora</small></div></li></ul></section>
          </div>
        </div>
      </section>

      {(selected || showImport) && <div className="overlay" onMouseDown={() => { setSelected(null); setShowImport(false); }}>
        <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
          <button className="close" onClick={() => { setSelected(null); setShowImport(false); }}>×</button>
          {selected ? <Ticket trip={selected} onDeleted={()=>{setSelected(null);void loadTrips()}} /> : <ImportForm onDone={() => {setShowImport(false);void loadTrips()}} />}
        </aside>
      </div>}
    </main>
  );
}

function ImportForm({ onDone }: { onDone: () => void }) {
  const [form,setForm]=useState({airline:"",locator:"",passenger:"",surname:"",origin:"",destination:"",departureDate:"",departureTime:"",status:"Confirmada"});
  const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  const update=(key:string,value:string)=>setForm(prev=>({...prev,[key]:value}));
  async function submit(){setSaving(true);setError("");try{const response=await fetch("/api/trips",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});const data=await response.json();if(!response.ok)throw new Error(data.error);onDone();}catch(err){setError(err instanceof Error?err.message:"Erro ao salvar viagem.")}finally{setSaving(false)}}
  return <div className="drawer-content"><p className="eyebrow">NOVA RESERVA</p><h2>Adicionar viagem</h2><p className="drawer-subtitle">Preencha os dados da reserva. A importação automática do e-ticket será ativada na próxima etapa.</p><label className="upload"><span>⇧</span><strong>Importar e-ticket em breve</strong><small>PDF, PNG ou JPG</small></label><div className="divider"><span>cadastro manual</span></div><div className="form-grid"><label>Companhia aérea<select value={form.airline} onChange={e=>update("airline",e.target.value)}><option value="">Selecione...</option>{airlines.map(a=><option key={a}>{a}</option>)}</select></label><label>Localizador<input value={form.locator} onChange={e=>update("locator",e.target.value)} placeholder="Ex.: ABC123" maxLength={8}/></label><label className="full">Nome do passageiro<input value={form.passenger} onChange={e=>update("passenger",e.target.value)} placeholder="Nome como consta no bilhete"/></label><label>Sobrenome<input value={form.surname} onChange={e=>update("surname",e.target.value)} placeholder="Para consultar a reserva"/></label><label>Status<select value={form.status} onChange={e=>update("status",e.target.value)}><option>Confirmada</option><option>Pendente</option></select></label><label>Origem<input value={form.origin} onChange={e=>update("origin",e.target.value)} placeholder="CWB" maxLength={3}/></label><label>Destino<input value={form.destination} onChange={e=>update("destination",e.target.value)} placeholder="GRU" maxLength={3}/></label><label>Data<input type="date" value={form.departureDate} onChange={e=>update("departureDate",e.target.value)}/></label><label>Horário<input type="time" value={form.departureTime} onChange={e=>update("departureTime",e.target.value)}/></label></div>{error&&<p style={{color:"#c5414c",fontSize:10}}>{error}</p>}<button className="primary-button submit" disabled={saving} onClick={submit}>{saving?"Salvando...":"Adicionar e gerar bilhete"}</button></div>;
}

function Ticket({ trip,onDeleted }: { trip: Trip;onDeleted:()=>void }) {
  const [deleting,setDeleting]=useState(false); async function remove(){if(!confirm("Excluir esta viagem?"))return;setDeleting(true);await fetch(`/api/trips?id=${trip.id}`,{method:"DELETE"});onDeleted()}
  return <div className="drawer-content"><p className="eyebrow">DETALHES DA VIAGEM</p><h2>{trip.route}</h2><p className="drawer-subtitle">Reserva {trip.locator} • {trip.airline}</p><div className="ticket"><div className="ticket-head"><span className="ticket-airline" style={{ background: trip.color }}>{trip.airline[0]}</span><div><strong>{trip.airline}</strong><small>CONFIRMAÇÃO DE VIAGEM</small></div><code>{trip.locator}</code></div><div className="ticket-route"><div><strong>{trip.airports.split("•")[0].trim()}</strong><small>Origem</small></div><span><i>✈</i></span><div><strong>{trip.airports.split("•")[1].trim()}</strong><small>Destino</small></div></div><div className="ticket-info"><div><small>PASSAGEIRO</small><strong>{trip.passenger}</strong></div><div><small>DATA</small><strong>{trip.date}</strong></div><div><small>HORÁRIO</small><strong>{trip.time}</strong></div><div><small>STATUS</small><strong className="green-text">{trip.status}</strong></div></div><div className="barcode">|||| || | |||| | | || ||| | |||| || |</div></div><button className="primary-button submit" onClick={() => window.print()}>⇩ Baixar bilhete em PDF</button><button className="secondary-button full-button" onClick={()=>window.open(reservationUrl(trip),"_blank")}>↗ Consultar no site da companhia</button><button onClick={remove} disabled={deleting} style={{width:"100%",height:40,marginTop:14,border:0,background:"transparent",color:"#c5414c",fontSize:10,fontWeight:700}}>{deleting?"Excluindo...":"Excluir viagem"}</button></div>;
}
