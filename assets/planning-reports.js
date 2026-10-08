/* Standalone portfolio views using synthetic, shared application data. */
window.CRM_PLANNING_REPORTS = (() => {
  const viewLabels={gantt:'Diagrama de Gantt',board:'Tablero',list:'Lista',calendar:'Calendario',workload:'Carga de trabajo',people:'Personas',tasks:'Panel de tareas'};
  const sectionLabels={planning:'Planificación',indicators:'Indicadores',opportunities:'Oportunidades',funds:'Fondos',clients:'Clientes',usage:'Uso CRM'};
  function enrich(data) {
    data.planning.forEach((row,index)=>{
      row.code ||= `PL-${String(index+1).padStart(5,'0')}`;
      row.duration ??= index%2?1:2;
      row.budget ??= [150,80,250,100][index%4];
      row.type ||= row.activity.toLowerCase().includes('visita')?'Visita':row.activity.toLowerCase().includes('inspeccion')?'Inspección':'Seguimiento';
      row.notes ||= 'Coordinar con el contacto principal y registrar el resultado de la actividad.';
    });
    data.demoFunds ||= data.users.map((owner,index)=>({code:`FND-DEMO-${index+1}`,owner,date:'2026-10-08',assigned:[1300,900,1600][index],expenses:[{date:'2026-10-08',type:'Transporte',detail:'Traslado para visita comercial',amount:[150,80,250][index]},{date:'2026-10-09',type:'Alimentación',detail:'Almuerzo en jornada de campo',amount:[60,45,70][index]}]}));
  }
  function days(from,until) {
    const result=[]; const current=new Date(`${from}T12:00:00Z`),end=new Date(`${until}T12:00:00Z`);
    while(current<=end && result.length<31){result.push(current.toISOString().slice(0,10));current.setUTCDate(current.getUTCDate()+1);}
    return result;
  }
  function endTime(row) { const [hour,minute]=row.time.split(':').map(Number);const total=hour*60+minute+row.duration*60;return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`; }
  function filterForm(c,id,from='2026-10-01',until='2026-10-10') {
    return `<form class="scope-filter" id="${id}"><label>Usuario<select name="owner"><option value="">Todos los usuarios</option>${c.options(c.data.users)}</select></label><label>Desde<input name="from" type="date" value="${from}" required></label><label>Hasta<input name="until" type="date" value="${until}" required></label><button class="primary-action" type="submit">Aplicar</button><span class="scope-error" role="status"></span></form>`;
  }
  function readScope(form) {
    const fields=new FormData(form);const result={owner:fields.get('owner'),from:fields.get('from'),until:fields.get('until')};
    const error=form.querySelector('.scope-error');
    if(!result.from||!result.until||result.from>result.until){error.textContent='Revisa el rango de fechas.';return null;}
    error.textContent='';return result;
  }
  function select(rows,scope) { return rows.filter(row=>(!scope.owner||row.owner===scope.owner)&&row.date>=scope.from&&row.date<=scope.until); }
  function calendar(c,rows,scope) {
    const dates=days(scope.from,scope.until);
    if(!dates.length)return '<p class="empty">Sin días en el rango.</p>';
    const hours=Array.from({length:12},(_,index)=>index+8);
    return `<div class="agenda-scroll"><div class="agenda-grid" style="grid-template-columns:58px repeat(${dates.length},minmax(165px,1fr))"><div class="agenda-corner">Horario</div>${dates.map(date=>`<div class="agenda-day-head"><span>${new Intl.DateTimeFormat('es',{weekday:'short',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))}</span><strong>${date.slice(8)}</strong><small>${date.slice(0,7)}</small></div>`).join('')}<div class="agenda-hours">${hours.map(hour=>`<span>${String(hour).padStart(2,'0')}:00</span>`).join('')}</div>${dates.map(date=>{
      const items=rows.filter(row=>row.date===date).sort((a,b)=>a.time.localeCompare(b.time));
      const lanes=[];const arranged=items.map(row=>{const [h,m]=row.time.split(':').map(Number),start=h+m/60;let lane=lanes.findIndex(end=>end<=start);if(lane<0)lane=lanes.length;lanes[lane]=start+row.duration;return {row,lane,start};});
      return `<div class="agenda-day">${arranged.map(({row,lane,start})=>`<button class="agenda-event tone-${c.data.users.indexOf(row.owner)%3}" data-plan-detail="${c.data.planning.indexOf(row)}" style="top:${Math.max(0,(start-8)*48)}px;height:${row.duration*48-4}px;left:calc(${lane/Math.max(1,lanes.length)*100}% + 3px);width:calc(${100/Math.max(1,lanes.length)}% - 6px)"><small>${row.time} - ${endTime(row)}</small><strong>${c.esc(row.activity)}</strong><span>${c.esc(c.clientName(row.client))}</span><em>${c.esc(row.owner)}</em></button>`).join('')}</div>`;
    }).join('')}</div></div>${dates.length===31?'<p class="muted">La vista gráfica muestra hasta 31 días; el detalle incluye todo el rango.</p>':''}`;
  }
  function wireDetails(c,root) { root.querySelectorAll('[data-plan-detail]').forEach(button=>button.onclick=()=>{
    const row=c.data.planning[Number(button.dataset.planDetail)];
    c.dialog(`${row.code} · ${row.activity}`,`<div class="detail-grid"><section><small>Responsable</small><strong>${c.esc(row.owner)}</strong><span>${c.esc(row.status)}</span></section><section><small>Horario</small><strong>${row.date}</strong><span>${row.time} - ${endTime(row)} · ${row.duration} horas</span></section><section><small>Cliente</small><strong>${c.esc(c.clientName(row.client))}</strong><span>${c.esc(row.type)}</span></section><section><small>Gasto proyectado</small><strong>${c.money(row.budget)}</strong><span>Presupuesto de la actividad</span></section></div><h3>Detalle</h3><p>${c.esc(row.notes)}</p><h3>Resultado</h3><p>${row.status==='Completada'?'Actividad completada. Seguimiento comercial registrado.':'Pendiente de ejecutar y registrar resultado.'}</p>`);
  }); }
  function planTable(c,rows) { return c.table(['Fecha','Horario','Código / actividad','Usuario','Cliente','Tipo','Estado','Gasto','Acción'],rows.map(row=>`<tr><td>${row.date}</td><td>${row.time} - ${endTime(row)}</td><td><strong>${row.code}</strong><br>${c.esc(row.activity)}</td><td>${c.esc(row.owner)}</td><td>${c.esc(c.clientName(row.client))}</td><td>${c.esc(row.type)}</td><td><span class="pill ${row.status==='Completada'?'green':''}">${row.status}</span></td><td>${c.money(row.budget)}</td><td><button class="row-action" data-plan-detail="${c.data.planning.indexOf(row)}">Ver detalle</button></td></tr>`)); }
  function planning(c) {
    enrich(c.data);
    c.host.innerHTML=`<article class="panel operative-header"><div class="panel-title"><div><p class="menu-overline">Planificación</p><h2>Plan operativo del equipo</h2><p>Organiza actividades, horarios y gasto previsto.</p></div><div class="operative-actions"><button id="print-plan" class="row-action">Imprimir reporte</button><button id="create-plan" class="primary-action">Planificar día</button></div></div><div class="report-tabs planning-view-tabs">${Object.entries(viewLabels).map(([key,label])=>`<button data-planning-view="${key}" class="${key==='calendar'?'active':''}">${label}</button>`).join('')}</div></article>${filterForm(c,'planning-scope','2026-10-08','2026-10-10')}<div id="plan-metrics"></div><article class="panel"><div class="panel-title"><div><h2 id="plan-view-title">Calendario</h2><p id="plan-view-caption"></p></div><span class="visual-pill">Plan operativo</span></div><div id="plan-view"></div></article>`;
    let view='calendar',scope=readScope(c.host.querySelector('#planning-scope'));
    const draw=()=>{
      const rows=select(c.data.planning,scope),hours=rows.reduce((sum,row)=>sum+row.duration,0);
      c.host.querySelector('#plan-metrics').innerHTML=c.kpis([['Planes',rows.length,'registros en el rango','green'],['Pendientes',rows.filter(row=>row.status==='Pendiente').length,`${hours} horas planificadas`,'blue'],['Gasto proyectado',c.money(rows.reduce((sum,row)=>sum+row.budget,0)),'presupuesto del periodo','pink']]);
      c.host.querySelector('#plan-view-title').textContent=viewLabels[view];
      c.host.querySelector('#plan-view-caption').textContent=`${scope.from} al ${scope.until} · ${scope.owner||'Todos los usuarios'}`;
      const target=c.host.querySelector('#plan-view');
      if(view==='calendar')target.innerHTML=calendar(c,rows,scope);
      else if(view==='list')target.innerHTML=planTable(c,rows);
      else if(view==='board'||view==='tasks')target.innerHTML=`<div class="plan-board">${['Pendiente','Completada'].map(status=>`<section><h3>${status} <span class="pill">${rows.filter(row=>row.status===status).length}</span></h3>${rows.filter(row=>row.status===status).map(row=>`<article class="task-card"><small>${row.code} · ${row.date}</small><h4>${c.esc(row.activity)}</h4><p>${c.esc(c.clientName(row.client))}</p><p>${row.time} - ${endTime(row)} · ${c.esc(row.owner)}</p><div><button class="row-action" data-plan-detail="${c.data.planning.indexOf(row)}">Detalle</button> <button class="row-action" data-status="${c.data.planning.indexOf(row)}">${status==='Pendiente'?'Completar':'Reabrir'}</button></div></article>`).join('')||'<p class="empty">Sin actividades.</p>'}</section>`).join('')}</div>`;
      else if(view==='gantt')target.innerHTML=`<div class="table-wrap"><table class="gantt-table"><thead><tr><th>Actividad / responsable</th>${days(scope.from,scope.until).map(date=>`<th>${date.slice(5)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr><td>${c.esc(row.activity)}<br><small>${c.esc(row.owner)}</small></td>${days(scope.from,scope.until).map(date=>`<td>${row.date===date?`<button class="gantt-bar" data-plan-detail="${c.data.planning.indexOf(row)}">${row.time} · ${row.duration}h</button>`:''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      else if(view==='workload')target.innerHTML=c.table(['Usuario','Actividades','Horas','Completadas','Gasto proyectado'],c.data.users.filter(user=>!scope.owner||scope.owner===user).map(user=>{const items=rows.filter(row=>row.owner===user);return `<tr><td>${c.esc(user)}</td><td>${items.length}</td><td>${items.reduce((sum,row)=>sum+row.duration,0)} h</td><td>${items.filter(row=>row.status==='Completada').length}</td><td>${c.money(items.reduce((sum,row)=>sum+row.budget,0))}</td></tr>`;}));
      else target.innerHTML=`<div class="people-grid">${c.data.users.filter(user=>!scope.owner||scope.owner===user).map(user=>{const items=rows.filter(row=>row.owner===user);return `<article class="task-card"><span class="mail-avatar">${c.esc(user[0])}</span><h3>${c.esc(user)}</h3><p>${items.length} actividades · ${items.reduce((sum,row)=>sum+row.duration,0)} horas</p><small>${items.filter(row=>row.status==='Pendiente').length} pendientes</small></article>`;}).join('')}</div>`;
      wireDetails(c,target);
      target.querySelectorAll('[data-status]').forEach(button=>button.onclick=()=>{const row=c.data.planning[Number(button.dataset.status)];row.status=row.status==='Pendiente'?'Completada':'Pendiente';draw();});
    };
    c.host.querySelector('#planning-scope').onsubmit=event=>{event.preventDefault();const next=readScope(event.currentTarget);if(next){scope=next;draw();}};
    c.host.querySelectorAll('[data-planning-view]').forEach(button=>button.onclick=()=>{view=button.dataset.planningView;c.host.querySelectorAll('[data-planning-view]').forEach(tab=>tab.classList.toggle('active',tab===button));draw();});
    c.host.querySelector('#print-plan').onclick=()=>window.print();
    c.host.querySelector('#create-plan').onclick=()=>{
      c.dialog('Planificar día',`<form id="new-plan" class="plan-form"><label>Actividad *<input name="activity" required maxlength="100"></label><label>Usuario *<select name="owner">${c.options(c.data.users)}</select></label><label>Cliente *<select name="client">${c.data.clients.map(row=>`<option value="${row.id}">${c.esc(row.name)}</option>`).join('')}</select></label><label>Fecha *<input name="date" type="date" value="2026-10-08" required></label><label>Inicio *<input name="time" type="time" value="09:00" min="08:00" max="18:00" required></label><label>Duración en horas *<input name="duration" type="number" min="0.5" max="4" step="0.5" value="1" required></label><label>Gasto proyectado (Bs)<input name="budget" type="number" min="0" step="0.01" value="0" required></label><label>Detalle<textarea name="notes" rows="3"></textarea></label><button class="primary-action" type="submit">Guardar planificación</button></form>`);
      document.querySelector('#new-plan').onsubmit=event=>{event.preventDefault();const fields=new FormData(event.currentTarget);const row=Object.fromEntries(fields);row.client=Number(row.client);row.duration=Number(row.duration);row.budget=Number(row.budget);row.status='Pendiente';c.data.planning.push(row);enrich(c.data);document.querySelector('#detail').close();draw();};
    };
    draw();
  }
  function reports(c) {
    enrich(c.data);
    c.host.innerHTML=`<article class="panel"><h2>Reportes</h2><p>Módulo analítico por usuario y rango de fechas.</p></article><article class="panel"><h2>Secciones del reporte</h2><p>Muestra una sola área a la vez para recorrer el detalle de cada bloque.</p><div class="report-tabs crm-report-tabs">${Object.entries(sectionLabels).map(([key,label])=>`<button data-report="${key}" class="${key==='planning'?'active':''}">${label}</button>`).join('')}</div></article>${filterForm(c,'report-scope')}<article class="panel" id="report-content"></article>`;
    let section='planning',scope=readScope(c.host.querySelector('#report-scope'));
    const draw=()=>{
      const target=c.host.querySelector('#report-content'),plans=select(c.data.planning,scope),opportunities=select(c.data.opportunities,scope),sales=opportunities.filter(row=>row.stage==='Ganada');
      const proformas=opportunities.reduce((sum,row)=>sum+row.proformas,0),amount=sales.reduce((sum,row)=>sum+row.amount,0);
      const details=()=>wireDetails(c,target);
      if(section==='planning') {
        const hours=plans.reduce((sum,row)=>sum+row.duration,0),workdays=days(scope.from,scope.until).filter(date=>![0,6].includes(new Date(date+'T12:00:00Z').getUTCDay())).length;
        target.innerHTML=`<h2>Planificación</h2><p>Actividades planificadas, uso del horario 08:00 a 17:00 y detalle diario.</p><h3>Vista gráfica continua</h3>${calendar(c,plans,scope)}${c.kpis([['Actividades',plans.length,'detalles diarios','green'],['Horas usadas',hours,`${Math.round(hours/Math.max(1,workdays*9*(scope.owner?1:c.data.users.length))*100)}% de jornada disponible`,'blue'],['Monto planificado',c.money(plans.reduce((sum,row)=>sum+row.budget,0)),'periodo seleccionado','pink']])}<h3>Detalle de planificación</h3>${planTable(c,plans)}`;details();
      } else if(section==='indicators') {
        const ids=new Set(opportunities.map(row=>row.client));
        const groups=[['PRODUCTO',[['Bs',c.money(amount)]]],['CLIENTES',[['ATENDIDOS',new Set(plans.map(row=>row.client)).size],['CARTERA',ids.size],['NUEVOS',0]]],['CONTACTOS',[['LLAMADAS',0],['VISITAS',plans.filter(row=>row.type==='Visita').length],['INSPECCIONES',plans.filter(row=>row.type==='Inspección').length],['REVISIONES',0],['REPARACIONES',0],['PRODUCTIVIDAD %',`${Math.round(plans.filter(row=>row.status==='Completada').length/Math.max(1,plans.length)*100)}%`]]],['RESULTADOS COMERCIALES',[['OPORTUNIDADES',opportunities.length],['PROFORMAS',proformas],['DEMOS',0],['GANADOS',sales.length],['PERDIDOS',0]]]];
        target.innerHTML=`<h2>Indicadores</h2><p>Objetivo y resultado comercial para el periodo seleccionado.</p>${c.table(['CAT','OBJETIVO','RESULTADO','VENTA','ACTIVIDAD'],groups.flatMap(([label,rows])=>[`<tr class="indicator-group"><td colspan="5">${label}</td></tr>`,...rows.map(([name,value])=>`<tr><td>${name}</td><td>No definido</td><td>${value}</td><td>${name==='Bs'||name==='GANADOS'?c.money(amount):'-'}</td><td>${name==='Bs'?'-':value}</td></tr>`)]))}<p class="metric-definition">Atendidos: clientes con actividad planificada. Cartera: clientes relacionados con oportunidades del rango. Nuevos: sin registros nuevos en esta muestra.</p>`;
      } else if(section==='opportunities') {
        const summary=(title,items,isSale)=>`<h3>${title}</h3><p>${isSale?'Ventas generadas':'Documentos comerciales'} en el periodo seleccionado.</p>${c.data.users.filter(user=>!scope.owner||user===scope.owner).map(user=>{const rows=items.filter(row=>row.owner===user);const count=rows.reduce((sum,row)=>sum+(isSale?1:row.proformas),0);return `<details class="report-summary"><summary><strong>${c.esc(user)}</strong><span>${count} ${isSale?'ventas':'proformas'} | ${c.money(rows.reduce((sum,row)=>sum+row.amount*(isSale?1:row.proformas),0))}</span></summary>${c.table(['Fecha','Cliente','Oportunidad','Monto','Acciones'],rows.map(row=>`<tr><td>${row.date}</td><td>${c.esc(c.clientName(row.client))}</td><td>${row.id}<br>${c.esc(row.title)}</td><td>${c.money(row.amount)}</td><td><button class="row-action" data-report-op="${row.id}">Detalles oportunidad</button></td></tr>`))}</details>`;}).join('')}`;
        target.innerHTML=`<h2>Oportunidades y proformas</h2><p>Proformas realizadas, ventas y detalle comercial.</p>${summary('Resumen de ventas',sales,true)}${summary('Resumen de proformas',opportunities.filter(row=>row.proformas>0),false)}<h3>Listado general de oportunidades</h3>${c.table(['Fecha','Código','Cliente','Responsable','Estado','Proformas','Monto','Acción'],opportunities.map(row=>`<tr><td>${row.date}</td><td>${row.id}</td><td>${c.esc(c.clientName(row.client))}</td><td>${c.esc(row.owner)}</td><td>${row.stage}</td><td>${row.proformas}</td><td>${c.money(row.amount)}</td><td><button class="row-action" data-report-op="${row.id}">Detalles</button></td></tr>`))}`;
        target.querySelectorAll('[data-report-op]').forEach(button=>button.onclick=()=>c.openOpportunity(button.dataset.reportOp));
      } else if(section==='funds') {
        const funds=select(c.data.demoFunds,scope),assigned=funds.reduce((sum,row)=>sum+row.assigned,0),expenses=funds.reduce((sum,row)=>sum+row.expenses.reduce((s,item)=>s+item.amount,0),0);
        target.innerHTML=`<h2>Fondos y rendiciones</h2><p>Montos asignados, rendidos y disponibles por usuario.</p>${c.kpis([['Monto asignado',c.money(assigned),'fondos del periodo'],['Monto rendido',c.money(expenses),'gastos registrados','pink'],['Saldo disponible',c.money(assigned-expenses),'por rendir','green']])}${funds.map(row=>`<details class="report-summary"><summary><strong>${c.esc(row.owner)} · ${row.code}</strong><span>Asignado ${c.money(row.assigned)}</span></summary>${c.table(['Fecha','Tipo','Detalle','Monto'],row.expenses.map(item=>`<tr><td>${item.date}</td><td>${item.type}</td><td>${item.detail}</td><td>${c.money(item.amount)}</td></tr>`))}</details>`).join('')||'<p class="empty">Sin fondos en el rango.</p>'}`;
      } else if(section==='clients') {
        const ids=new Set([...opportunities.map(row=>row.client),...plans.map(row=>row.client)]);
        target.innerHTML=`<h2>Clientes</h2><p>Cartera y actividad vinculada al usuario y periodo.</p>${c.table(['Cliente','Contacto','Zona','Oportunidades','Actividades','Venta'],c.data.clients.filter(row=>ids.has(row.id)).map(row=>`<tr><td>${c.esc(row.name)}</td><td>${c.esc(row.contact)}</td><td>${row.zone}</td><td>${opportunities.filter(item=>item.client===row.id).length}</td><td>${plans.filter(item=>item.client===row.id).length}</td><td>${c.money(sales.filter(item=>item.client===row.id).reduce((sum,item)=>sum+item.amount,0))}</td></tr>`))}`;
      } else {
        target.innerHTML=`<h2>Uso CRM</h2><p>Registros de actividad por usuario en el periodo.</p>${c.table(['Usuario','Planes','Oportunidades','Proformas','Ventas','Último registro'],c.data.users.filter(user=>!scope.owner||user===scope.owner).map(user=>{const p=plans.filter(row=>row.owner===user),o=opportunities.filter(row=>row.owner===user);const dates=[...p,...o].map(row=>row.date).sort();return `<tr><td>${c.esc(user)}</td><td>${p.length}</td><td>${o.length}</td><td>${o.reduce((sum,row)=>sum+row.proformas,0)}</td><td>${o.filter(row=>row.stage==='Ganada').length}</td><td>${dates.at(-1)||'-'}</td></tr>`;}))}`;
      }
    };
    c.host.querySelector('#report-scope').onsubmit=event=>{event.preventDefault();const next=readScope(event.currentTarget);if(next){scope=next;draw();}};
    c.host.querySelectorAll('[data-report]').forEach(button=>button.onclick=()=>{section=button.dataset.report;c.host.querySelectorAll('[data-report]').forEach(tab=>tab.classList.toggle('active',tab===button));draw();});draw();
  }
  return {planning,reports};
})();
