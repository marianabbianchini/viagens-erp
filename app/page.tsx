"use client";

import { useMemo, useState } from "react";

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
};

const trips: Trip[] = [
  { id: 1, passenger: "Passageiro Exemplo", initials: "PE", route: "Curitiba → São Paulo", airports: "CWB  •  GRU", date: "24 JUL 2026", time: "08:35", airline: "LATAM", locator: "EXM123", status: "Confirmada", color: "#5b2d91" },
  { id: 2, passenger: "Cliente Demonstração", initials: "CD", route: "São Paulo → Lisboa", airports: "GRU  •  LIS", date: "02 AGO 2026", time: "17:45", airline: "TAP", locator: "DEM456", status: "Confirmada", color: "#118541" },
  { id: 3, passenger: "Viajante Exemplo", initials: "VE", route: "Curitiba → Rio de Janeiro", airports: "CWB  •  GIG", date: "11 AGO 2026", time: "13:20", airline: "GOL", locator: "TST789", status: "Pendente", color: "#f28c00" },
  { id: 4, passenger: "Cliente Teste", initials: "CT", route: "Madrid → Barcelona", airports: "MAD  •  BCN", date: "19 AGO 2026", time: "10:10", airline: "Iberia", locator: "EXM829", status: "Confirmada", color: "#d71920" },
];

const airlines = ["LATAM", "GOL", "Azul", "TAP", "Iberia", "American", "Copa"];

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="nav-icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("Visão geral");
  const [selected, setSelected] = useState<Trip | null>(null);
  const [showImport, setShowImport] = useState(false);

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
              {item === "Viagens" && <span className="nav-count">4</span>}
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
            <article><div className="metric-icon purple">✈</div><div><span>VIAGENS ATIVAS</span><strong>12</strong><small className="positive">↗ 3 este mês</small></div></article>
            <article><div className="metric-icon blue">♙</div><div><span>PASSAGEIROS</span><strong>28</strong><small>6 novos em julho</small></div></article>
            <article><div className="metric-icon orange">◷</div><div><span>PRÓXIMO EMBARQUE</span><strong>5 dias</strong><small>CWB → GRU</small></div></article>
            <article><div className="metric-icon green">✓</div><div><span>CONFIRMADAS</span><strong>92%</strong><small className="positive">11 de 12 reservas</small></div></article>
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
              {!filtered.length && <div className="empty">Nenhuma viagem encontrada.</div>}
            </div>
          </section>

          <div className="lower-grid">
            <section className="panel airlines-panel"><div className="panel-heading"><div><h2>Companhias conectadas</h2><p>Links rápidos para consultar reservas</p></div></div><div className="airline-list">{airlines.map((name, index) => <button key={name}><span className={`airline-logo logo-${index}`}>{name.slice(0, 2).toUpperCase()}</span><strong>{name}</strong><small>Conectada</small><b>↗</b></button>)}</div></section>
            <section className="panel activity-panel"><div className="panel-heading"><div><h2>Atividade recente</h2><p>Últimas atualizações no sistema</p></div></div><ul><li><span className="activity-icon">✓</span><div><strong>Reserva confirmada</strong><p>LATAM • EXM123</p><small>Há 18 minutos</small></div></li><li><span className="activity-icon blue">＋</span><div><strong>Novo passageiro</strong><p>Cliente Demonstração</p><small>Hoje, 09:42</small></div></li><li><span className="activity-icon orange">⇩</span><div><strong>Bilhete gerado</strong><p>TAP • DEM456</p><small>Ontem, 16:08</small></div></li></ul></section>
          </div>
        </div>
      </section>

      {(selected || showImport) && <div className="overlay" onMouseDown={() => { setSelected(null); setShowImport(false); }}>
        <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
          <button className="close" onClick={() => { setSelected(null); setShowImport(false); }}>×</button>
          {selected ? <Ticket trip={selected} /> : <ImportForm onDone={() => setShowImport(false)} />}
        </aside>
      </div>}
    </main>
  );
}

function ImportForm({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(false);
  if (done) return <div className="success-state"><span>✓</span><h2>Reserva adicionada!</h2><p>O bilhete foi identificado e já está pronto para revisão.</p><button className="primary-button" onClick={onDone}>Voltar ao painel</button></div>;
  return <div className="drawer-content"><p className="eyebrow">NOVA RESERVA</p><h2>Adicionar viagem</h2><p className="drawer-subtitle">Preencha os dados ou envie o e-ticket para extrairmos as informações.</p><label className="upload"><span>⇧</span><strong>Enviar e-ticket</strong><small>PDF, PNG ou JPG • até 10 MB</small><input type="file" accept=".pdf,image/*" /></label><div className="divider"><span>ou preencha manualmente</span></div><div className="form-grid"><label>Companhia aérea<select><option>Selecione...</option>{airlines.map(a => <option key={a}>{a}</option>)}</select></label><label>Localizador<input placeholder="Ex.: EXM123" /></label><label className="full">Nome do passageiro<input placeholder="Nome como consta no bilhete" /></label><label>Origem<input placeholder="CWB" /></label><label>Destino<input placeholder="GRU" /></label><label>Data<input type="date" /></label><label>Sobrenome<input placeholder="Para consultar a reserva" /></label></div><button className="primary-button submit" onClick={() => setDone(true)}>Adicionar e gerar bilhete</button></div>;
}

function Ticket({ trip }: { trip: Trip }) {
  return <div className="drawer-content"><p className="eyebrow">DETALHES DA VIAGEM</p><h2>{trip.route}</h2><p className="drawer-subtitle">Reserva {trip.locator} • {trip.airline}</p><div className="ticket"><div className="ticket-head"><span className="ticket-airline" style={{ background: trip.color }}>{trip.airline[0]}</span><div><strong>{trip.airline}</strong><small>CONFIRMAÇÃO DE VIAGEM</small></div><code>{trip.locator}</code></div><div className="ticket-route"><div><strong>{trip.airports.split("•")[0].trim()}</strong><small>Origem</small></div><span><i>✈</i></span><div><strong>{trip.airports.split("•")[1].trim()}</strong><small>Destino</small></div></div><div className="ticket-info"><div><small>PASSAGEIRO</small><strong>{trip.passenger}</strong></div><div><small>DATA</small><strong>{trip.date}</strong></div><div><small>HORÁRIO</small><strong>{trip.time}</strong></div><div><small>STATUS</small><strong className="green-text">Confirmado</strong></div></div><div className="barcode">|||| || | |||| | | || ||| | |||| || |</div></div><button className="primary-button submit" onClick={() => window.print()}>⇩ Baixar bilhete em PDF</button><button className="secondary-button full-button">↗ Consultar no site da companhia</button></div>;
}
