// Synthetic fixtures. This file also works when index.html is opened directly.
window.CRM_DEMO_DATA = {
  users: ['Ana Torres', 'Luis Medina', 'Sofia Rios'],
  clients: [
    {id:1,name:'Agro Horizonte Demo',contact:'Patricia Demo',email:'patricia@example.com',zone:'Norte'},
    {id:2,name:'Taller Delta Demo',contact:'Marcos Demo',email:'marcos@example.com',zone:'Este'},
    {id:3,name:'Industrial Andina Demo',contact:'Elena Demo',email:'elena@example.com',zone:'Sur'},
    {id:4,name:'Servicios Rivera Demo',contact:'Carlos Demo',email:'carlos@example.com',zone:'Centro'},
    {id:5,name:'Campo Verde Demo',contact:'Lucia Demo',email:'lucia@example.com',zone:'Norte'}
  ],
  opportunities: [
    {id:'DEMO-001',client:1,title:'Sistema de riego',owner:'Ana Torres',date:'2026-10-01',stage:'Propuesta',amount:28500,proformas:2,items:[{name:'Equipo de riego demo',quantity:1,price:28500}]},
    {id:'DEMO-002',client:2,title:'Repuestos de mantenimiento',owner:'Luis Medina',date:'2026-10-02',stage:'Ganada',amount:6200,proformas:1,items:[{name:'Kit de mantenimiento demo',quantity:2,price:3100}]},
    {id:'DEMO-003',client:3,title:'Inspeccion de maquinaria',owner:'Sofia Rios',date:'2026-10-03',stage:'Negociacion',amount:12400,proformas:3,items:[{name:'Servicio de inspeccion demo',quantity:1,price:12400}]},
    {id:'DEMO-004',client:4,title:'Servicio preventivo',owner:'Ana Torres',date:'2026-10-05',stage:'Ganada',amount:8400,proformas:2,items:[{name:'Mantenimiento preventivo demo',quantity:3,price:2800}]},
    {id:'DEMO-005',client:5,title:'Implementos agricolas',owner:'Luis Medina',date:'2026-10-06',stage:'Contacto',amount:42000,proformas:0,items:[{name:'Implemento agricola demo',quantity:1,price:42000}]},
    {id:'DEMO-006',client:3,title:'Capacitacion tecnica',owner:'Sofia Rios',date:'2026-10-07',stage:'Ganada',amount:3600,proformas:1,items:[{name:'Capacitacion demo',quantity:1,price:3600}]}
  ],
  planning:[
    {date:'2026-10-08',time:'09:00',owner:'Ana Torres',client:1,activity:'Visita comercial',status:'Pendiente'},
    {date:'2026-10-08',time:'11:00',owner:'Luis Medina',client:2,activity:'Entrega de repuestos',status:'Completada'},
    {date:'2026-10-09',time:'10:30',owner:'Sofia Rios',client:3,activity:'Inspeccion tecnica',status:'Pendiente'},
    {date:'2026-10-10',time:'14:00',owner:'Ana Torres',client:4,activity:'Seguimiento de servicio',status:'Pendiente'}
  ],
  emails:[
    {id:1,from:'Patricia Demo',address:'patricia@example.com',subject:'Solicitud de propuesta de riego',body:'Buen dia. Nos interesa conocer las opciones para el proyecto de riego. Este mensaje es ficticio y forma parte de la demostracion.',date:'2026-10-07',folder:'Recibidos'},
    {id:2,from:'Marcos Demo',address:'marcos@example.com',subject:'Confirmacion del mantenimiento',body:'Confirmamos la visita para revisar los equipos. Todos los datos de este correo son inventados.',date:'2026-10-06',folder:'Recibidos'},
    {id:3,from:'Ana Torres',address:'ana@example.com',subject:'Seguimiento de propuesta',body:'Compartimos el resumen del seguimiento comercial de demostracion. No se ha enviado ningun correo real.',date:'2026-10-05',folder:'Enviados'}
  ]
};
