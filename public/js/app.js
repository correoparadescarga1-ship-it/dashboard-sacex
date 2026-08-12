const state={user:null,pages:[],permissions:[],socket:null};

function esc(v){return $('<div>').text(v??'').html();}
function hasPermission(p){return state.permissions.includes(p);}
async function api(url,options={}){
 options.credentials='include';
 options.headers=Object.assign({'Content-Type':'application/json'},options.headers||{});
 if(!['GET','HEAD'].includes((options.method||'GET').toUpperCase())){
  const csrf=document.cookie.split('; ').find(x=>x.startsWith('csrf_token='))?.split('=')[1];
  if(csrf) options.headers['X-CSRF-Token']=decodeURIComponent(csrf);
 }
 let r=await fetch(url,options);
 if(r.status===401 && !url.includes('/auth/refresh')){
  const rr=await fetch('/api/auth/refresh',{method:'POST',credentials:'include'});
  if(rr.ok){r=await fetch(url,options);}
 }
 if(!r.ok){let d={};try{d=await r.json()}catch{};throw new Error(d.message||'No fue posible completar la operación.');}
 return r.status===204?null:r.json();
}

$(async function(){
 $('#showRegister').on('click',e=>{e.preventDefault();$('#loginView').addClass('hidden');$('#registerView').removeClass('hidden')});
 $('#showLogin').on('click',e=>{e.preventDefault();$('#registerView').addClass('hidden');$('#loginView').removeClass('hidden')});
 $('#loginForm').on('submit',async e=>{e.preventDefault();try{
   const d=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:$('#loginEmail').val(),password:$('#loginPassword').val()})});
   await startApp(d.user);
 }catch(err){$.messager.alert('Acceso',err.message,'error')}});
 $('#registerForm').on('submit',async e=>{e.preventDefault();try{
   const d=await api('/api/auth/registro',{method:'POST',body:JSON.stringify({fullName:$('#regName').val(),email:$('#regEmail').val(),phone:$('#regPhone').val(),password:$('#regPassword').val()})});
   $.messager.alert('Registro',d.mensaje,'info');$('#showLogin').click();
 }catch(err){$.messager.alert('Registro',err.message,'error')}});
 $('#logoutBtn').on('click',async()=>{await api('/api/auth/logout',{method:'POST'});location.reload()});
 $('#toggleMenu').on('click',()=>$('#sidebar').toggleClass('collapsed'));
 $('#sendStatus').on('click',sendStatusRequest);
 try{const d=await api('/api/auth/me');await startApp(d.user,d);}catch{}
});

async function startApp(user,existing){
 state.user=user;$('#loginView,#registerView').addClass('hidden');$('#appView').removeClass('hidden');$('#currentUser').text(`${user.fullName} · ${user.roles.join(', ')}`);
 const data=existing||await api('/api/auth/me');state.pages=data.pages;state.permissions=data.permissions;buildMenu();connectSocket();loadDashboard();
}
function buildMenu(){
 const groups={};
 state.pages.forEach(p=>(groups[p.menuGroup]??=[]).push(p));
 let html='';
 Object.entries(groups).forEach(([g,pages])=>{html+=`<div class="menu-section"><div class="menu-title">${esc(g)}</div>`;pages.forEach(p=>html+=`<div class="menu-item" data-route="${esc(p.route)}"><span class="${esc(p.icon||'icon-page')}"></span><span>${esc(p.name)}</span></div>`);html+='</div>'});
 $('#menuContainer').html(html).on('click','.menu-item',function(){loadRoute($(this).data('route'));$('.menu-item').removeClass('active');$(this).addClass('active')});
}
async function loadRoute(route){
 if(route==='/')return loadDashboard();
 if(route==='/usuarios')return loadUsers();
 if(route==='/roles')return loadRoles();
 if(route==='/paginas')return loadPages();
 if(route==='/clientes')return loadClients();
 if(route==='/solicitudes')return loadRequests();
 if(route==='/autorizaciones')return loadApprovals();
 if(route==='/auditoria')return loadAudit();
}
async function loadDashboard(){
 const d=await api('/api/dashboard/resumen');
 $('#pageContent').html(`<h1 class="page-title">Dashboard</h1><div class="cards">
 <div class="metric"><div class="label">USUARIOS</div><div class="value">${d.users}</div></div>
 <div class="metric"><div class="label">PENDIENTES DE APROBACIÓN</div><div class="value">${d.pendingUsers}</div></div>
 <div class="metric"><div class="label">CLIENTES</div><div class="value">${d.clients}</div></div>
 <div class="metric"><div class="label">SOLICITUDES</div><div class="value">${d.requests}</div></div>
 <div class="metric"><div class="label">AUTORIZACIONES PENDIENTES</div><div class="value">${d.pendingChanges}</div></div>
 </div><div class="content-card"><h3>Actividad reciente</h3><table id="activityGrid"></table></div>`);
 $('#activityGrid').datagrid({fitColumns:true,rownumbers:true,singleSelect:true,data:d.recent.map(x=>({fecha:new Date(x.createdAt).toLocaleString('es-CO'),accion:x.action,entidad:x.entity,usuario:x.actor?.fullName||'Sistema'})),columns:[[{field:'fecha',title:'Fecha',width:180},{field:'accion',title:'Acción',width:120},{field:'entidad',title:'Entidad',width:120},{field:'usuario',title:'Usuario',width:180}]]});
}
async function loadUsers(){
 const rows=await api('/api/usuarios');let toolbar='';
 if(hasPermission('USUARIOS_APROBAR'))toolbar+=`<a class="easyui-linkbutton" onclick="approveSelected()">Aprobar</a>`;
 $('#pageContent').html(`<h1 class="page-title">Usuarios</h1><div class="content-card"><div class="toolbar">${toolbar}</div><table id="usersGrid"></table></div>`);
 $('#usersGrid').datagrid({fit:true,fitColumns:true,singleSelect:true,rownumbers:true,data:rows.map(x=>({...x,rolesTxt:x.roles.map(r=>r.role.name).join(', ')})),columns:[[{field:'fullName',title:'Nombre',width:180},{field:'email',title:'Correo',width:200},{field:'rolesTxt',title:'Roles',width:150},{field:'status',title:'Estado',width:110},{field:'createdAt',title:'Registro',width:150,formatter:v=>new Date(v).toLocaleDateString('es-CO')}]],onDblClickRow:(i,row)=>userActions(row)});
}
function approveSelected(){const r=$('#usersGrid').datagrid('getSelected');if(!r)return $.messager.alert('Usuarios','Seleccione un usuario.');approveUser(r.id)}
async function approveUser(id){try{await api(`/api/usuarios/${id}/aprobar`,{method:'PATCH'});$.messager.alert('Usuarios','Usuario aprobado.');loadUsers();}catch(e){$.messager.alert('Usuarios',e.message,'error')}}
function userActions(row){if(row.status==='PENDING'&&hasPermission('USUARIOS_APROBAR'))approveUser(row.id);else $.messager.alert('Usuario',`${row.fullName}<br>Estado: ${row.status}<br>Roles: ${esc(row.rolesTxt)}`)}
async function loadRoles(){
 const [roles,perms]=await Promise.all([api('/api/roles'),api('/api/roles/permisos')]);
 $('#pageContent').html(`<h1 class="page-title">Roles y permisos</h1><div class="content-card"><table id="rolesGrid"></table></div>`);
 $('#rolesGrid').datagrid({fit:true,fitColumns:true,singleSelect:true,rownumbers:true,data:roles.map(r=>({name:r.name,description:r.description||'',users:r._count.users,permissions:r.permissions.length,pages:r.pages.length})),columns:[[{field:'name',title:'Rol',width:180},{field:'description',title:'Descripción',width:300},{field:'users',title:'Usuarios',width:90},{field:'permissions',title:'Permisos',width:90},{field:'pages',title:'Páginas',width:90}]]});
}
async function loadPages(){
 const rows=await api('/api/paginas');
 $('#pageContent').html(`<h1 class="page-title">Páginas</h1><div class="content-card"><table id="pagesGrid"></table></div>`);
 $('#pagesGrid').datagrid({fit:true,fitColumns:true,rownumbers:true,data:rows,columns:[[{field:'name',title:'Página',width:180},{field:'route',title:'Ruta',width:180},{field:'menuGroup',title:'Grupo',width:140},{field:'menuOrder',title:'Orden',width:80},{field:'active',title:'Activa',width:80,formatter:v=>v?'Sí':'No'}]]});
}
async function loadClients(){
 const rows=await api('/api/clientes');
 $('#pageContent').html(`<h1 class="page-title">Clientes</h1><div class="content-card"><div class="toolbar">${hasPermission('CLIENTES_CREAR')?'<a id="newClient" class="easyui-linkbutton">Nuevo cliente</a>':''}</div><table id="clientsGrid"></table></div>`);
 $('#clientsGrid').datagrid({fit:true,fitColumns:true,rownumbers:true,pagination:true,data:rows,columns:[[{field:'code',title:'Código',width:100},{field:'name',title:'Cliente',width:240},{field:'document',title:'Documento',width:120},{field:'email',title:'Correo',width:220},{field:'city',title:'Ciudad',width:120},{field:'status',title:'Estado',width:100}]]});
}
async function loadRequests(){
 const rows=await api('/api/solicitudes');
 $('#pageContent').html(`<h1 class="page-title">Solicitudes</h1><div class="content-card"><div class="toolbar">${hasPermission('SOLICITUDES_CREAR')?'<a id="newRequest" class="easyui-linkbutton">Nueva solicitud</a>':''}</div><table id="requestsGrid"></table></div>`);
 $('#requestsGrid').datagrid({fit:true,fitColumns:true,singleSelect:true,rownumbers:true,data:rows,columns:[[{field:'code',title:'Código',width:100},{field:'title',title:'Título',width:240},{field:'client',title:'Cliente',width:200,formatter:v=>v?v.name:''},{field:'priority',title:'Prioridad',width:100},{field:'status',title:'Estado',width:120}]],onDblClickRow:(i,r)=>openStatus(r)});
}
function openStatus(row){if(!hasPermission('CAMBIOS_SOLICITAR'))return $.messager.alert('Solicitud','No tiene permiso para solicitar cambios.');$('#statusTarget').val(row.id);$('#statusDialog').dialog('open');}
async function sendStatusRequest(){try{await api(`/api/solicitudes/${$('#statusTarget').val()}/cambio-estado`,{method:'POST',body:JSON.stringify({toStatus:$('#statusNew').val(),reason:$('#statusReason').val()})});$('#statusDialog').dialog('close');$('#statusReason').textbox('clear');$.messager.alert('Autorización','La solicitud de cambio fue enviada al administrador.');loadRequests();}catch(e){$.messager.alert('Autorización',e.message,'error')}}
async function loadApprovals(){
 const rows=await api('/api/solicitudes/autorizaciones');
 $('#pageContent').html(`<h1 class="page-title">Autorizaciones de estado</h1><div class="content-card"><table id="approvalsGrid"></table></div>`);
 $('#approvalsGrid').datagrid({fit:true,fitColumns:true,rownumbers:true,singleSelect:true,data:rows,columns:[[{field:'request',title:'Solicitud',width:220,formatter:v=>v.code+' · '+v.title},{field:'fromStatus',title:'Estado actual',width:120},{field:'toStatus',title:'Nuevo estado',width:120},{field:'requestedBy',title:'Solicitó',width:160,formatter:v=>v.fullName},{field:'reason',title:'Motivo',width:280}]],onDblClickRow:(i,r)=>approvalActions(r)});
}
function approvalActions(row){$.messager.confirm('Autorizar cambio',`¿Aprobar ${esc(row.request.code)}: ${esc(row.fromStatus)} → ${esc(row.toStatus)}?`,ok=>{if(ok)resolveApproval(row.id,true)})}
async function resolveApproval(id,ok){try{await api(`/api/solicitudes/autorizaciones/${id}/${ok?'aprobar':'rechazar'}`,{method:'POST'});$.messager.alert('Autorizaciones',ok?'Cambio aprobado.':'Cambio rechazado.');loadApprovals();}catch(e){$.messager.alert('Autorizaciones',e.message,'error')}}
async function loadAudit(){
 const rows=await api('/api/auditoria');
 $('#pageContent').html(`<h1 class="page-title">Auditoría</h1><div class="content-card"><table id="auditGrid"></table></div>`);
 $('#auditGrid').datagrid({fit:true,fitColumns:true,rownumbers:true,pagination:true,data:rows,columns:[[{field:'createdAt',title:'Fecha',width:170,formatter:v=>new Date(v).toLocaleString('es-CO')},{field:'action',title:'Acción',width:140},{field:'entity',title:'Entidad',width:130},{field:'actor',title:'Usuario',width:180,formatter:v=>v?v.fullName:'Sistema'}]]});
}
function connectSocket(){
 try{state.socket=io({withCredentials:true});state.socket.on('status.approved',()=>{ $.messager.show({title:'Tiempo real',msg:'Un cambio de estado fue autorizado.'});loadDashboard(); });state.socket.on('user.approved',()=>$.messager.show({title:'Tiempo real',msg:'Un usuario fue aprobado.'}));}catch{}
}
