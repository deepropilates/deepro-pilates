import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const fmt = (d)=>{ const dt=new Date(d); return dt.toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"short"}); };

function Avatar({user, size=36}){
  const colors={admin:"#c0392b",instructor:"#6b8f71",member:"#5a7fa8"};
  const bg = user?.color || colors[user?.role] || "#888";
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:600,flexShrink:0}}>{user?.name?.charAt(0)||"?"}</div>;
}

function StarRating({value, onChange}){
  return <div style={{display:"flex",gap:4}}>
    {[1,2,3,4,5].map(s=>(
      <span key={s} onClick={()=>onChange&&onChange(s)} style={{fontSize:20,cursor:onChange?"pointer":"default",color:s<=value?"#f0c040":"#ddd"}}>★</span>
    ))}
  </div>;
}

export default function PilatesPro() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [filterMember, setFilterMember] = useState("all");
  const [calMonth, setCalMonth] = useState(new Date());

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user ?? null);
      if(session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user ?? null);
      if(session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return ()=>subscription.unsubscribe();
  },[]);

  async function fetchProfile(uid){
    const {data} = await supabase.from('profiles').select('*').eq('id',uid).single();
    setProfile(data);
    setLoading(false);
    if(data){ fetchRecords(data); fetchMembers(); }
  }

  async function fetchRecords(prof){
    let query = supabase.from('records').select('*').order('date',{ascending:false});
    if(prof?.role==='member') query = query.eq('member_id', prof.id);
    if(prof?.role==='instructor') query = query.eq('instructor_id', prof.id);
    const {data} = await query;
    setRecords(data||[]);
  }

  async function fetchMembers(){
    const {data} = await supabase.from('profiles').select('*').eq('role','member');
    setMembers(data||[]);
  }

  async function logout(){
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setPage("dashboard");
  }

  if(loading) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#2a1f18"}}>
      <div style={{color:"#d4b896",fontSize:14}}>로딩 중...</div>
    </div>
  );

  if(!user) return <LoginPage/>;

  const myRecords = records
    .filter(r=> filterMember==="all" ? true : r.member_id===filterMember)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  return(
    <div style={{fontFamily:"'Noto Serif KR','Georgia',serif",minHeight:"100vh",background:"#f7f5f2",color:"#2c2c2c",display:"flex",flexDirection:"column"}}>
      <GlobalStyles/>
      <Header profile={profile} logout={logout} page={page} setPage={setPage}/>
      <div style={{flex:1,maxWidth:900,width:"100%",margin:"0 auto",padding:"24px 16px"}}>
        {page==="dashboard" && <DashboardPage profile={profile} records={myRecords} members={members} setPage={setPage} setFilterMember={setFilterMember}/>}
        {page==="records" && !selectedRecord && !showNewRecord && (
          <RecordList profile={profile} records={myRecords} members={members} filterMember={filterMember} setFilterMember={setFilterMember}
            onSelect={r=>setSelectedRecord(r)} onNew={()=>setShowNewRecord(true)}/>
        )}
        {page==="records" && selectedRecord && (
          <RecordDetail profile={profile} record={selectedRecord} onBack={()=>setSelectedRecord(null)} onRefresh={()=>fetchRecords(profile)}/>
        )}
        {page==="records" && showNewRecord && (
          <NewRecordForm profile={profile} members={members}
            onSave={async()=>{ await fetchRecords(profile); setShowNewRecord(false); }}
            onCancel={()=>setShowNewRecord(false)}/>
        )}
        {page==="members" && profile?.role!=="member" && <MembersPage members={members} records={records} setPage={setPage} setFilterMember={setFilterMember} onRefresh={fetchMembers}/>}
        {page==="tickets" && <TicketsPage profile={profile} members={members} onRefresh={fetchMembers}/>}
        {page==="calendar" && <CalendarPage profile={profile} records={records} calMonth={calMonth} setCalMonth={setCalMonth} setSelectedRecord={setSelectedRecord} setPage={setPage}/>}
        {page==="addmember" && profile?.role==="admin" && <AddMemberPage onSave={async()=>{ await fetchMembers(); setPage("members"); }} onCancel={()=>setPage("members")}/>}
      </div>
    </div>
  );
}

function LoginPage(){
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(){
    if(!phone||!pass){setError("전화번호와 비밀번호를 입력해주세요.");return;}
    setLoading(true); setError("");
    const email = `${phone}@deepropilates.com`;
    const {error} = await supabase.auth.signInWithPassword({email, password:pass});
    if(error) setError("전화번호 또는 비밀번호가 올바르지 않습니다.");
    setLoading(false);
  }

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#2a1f18 0%,#3d3028 50%,#4a3a2e 100%)",padding:20}}>
      <GlobalStyles/>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:13,letterSpacing:"0.25em",color:"#d4b896",marginBottom:8}}>PILATES PRO</div>
        <div style={{fontSize:32,color:"#fff",fontWeight:300}}>레슨 관리 플랫폼</div>
        <div style={{color:"#b8a898",fontSize:14,marginTop:8}}>회원, 강사, 관리자 통합 시스템</div>
      </div>
      <div style={{background:"#fff",borderRadius:16,padding:32,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:11,color:"#9c8a7a",marginBottom:6}}>전화번호 (010 제외 8자리)</div>
        <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="예: 12345678" style={{marginBottom:14,width:"100%",border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none"}}/>
        <div style={{fontSize:11,color:"#9c8a7a",marginBottom:6}}>비밀번호</div>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="비밀번호" style={{marginBottom:20,width:"100%",border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none"}} onKeyDown={e=>e.key==="Enter"&&login()}/>
        {error&&<div style={{color:"#e74c3c",fontSize:13,marginBottom:12,textAlign:"center"}}>{error}</div>}
        <button style={{width:"100%",padding:14,fontSize:15,background:"#3d3028",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}} onClick={login} disabled={loading}>
          {loading?"로그인 중...":"로그인"}
        </button>
      </div>
    </div>
  );
}

function Header({profile, logout, page, setPage}){
  const [menuOpen,setMenuOpen]=useState(false);
  const navItems=[
    {id:"dashboard",label:"홈",icon:"🏠"},
    {id:"records",label:"레슨기록",icon:"📋"},
    {id:"calendar",label:"캘린더",icon:"📅"},
    {id:"tickets",label:"수강권",icon:"💳"},
    ...(profile?.role!=="member"?[{id:"members",label:"회원관리",icon:"👥"}]:[]),
  ];
  return(
    <>
      <div style={{background:"#2a1f18",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 12px rgba(0,0,0,0.25)"}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"0 16px",height:56,display:"flex",alignItems:"center",gap:12}}>
          <div style={{color:"#d4b896",fontSize:13,letterSpacing:"0.15em",flex:1}}>PILATES PRO</div>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:40,height:40,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}>
            {[0,1,2].map(i=><span key={i} style={{display:"block",width:18,height:2,background:"#d4b896",borderRadius:2}}/>)}
          </button>
        </div>
      </div>
      {menuOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:500,display:"flex"}} onClick={()=>setMenuOpen(false)}>
          <div style={{flex:1,background:"rgba(0,0,0,0.45)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{width:280,background:"#1e1510",height:"100%",display:"flex",flexDirection:"column"}}>
            <div style={{padding:"28px 24px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{color:"#fff",fontSize:16,fontWeight:500}}>{profile?.name||"사용자"}</div>
              <div style={{color:"#9c8a7a",fontSize:12,marginTop:4}}>{profile?.role==="admin"?"관리자":profile?.role==="instructor"?"강사":"회원"}</div>
            </div>
            <div style={{flex:1,padding:"12px 0"}}>
              {navItems.map(n=>(
                <button key={n.id} onClick={()=>{setPage(n.id);setMenuOpen(false);}} style={{width:"100%",background:page===n.id?"rgba(212,184,150,0.12)":"transparent",border:"none",borderLeft:page===n.id?"3px solid #d4b896":"3px solid transparent",padding:"14px 24px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,color:page===n.id?"#d4b896":"#e8e0d8",fontSize:15}}>
                  <span>{n.icon}</span><span>{n.label}</span>
                </button>
              ))}
            </div>
            <div style={{padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
              <button onClick={()=>{logout();setMenuOpen(false);}} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:11,color:"#b8a898",cursor:"pointer",fontSize:13}}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DashboardPage({profile, records, members, setPage, setFilterMember}){
  if(profile?.role==="member") return <MemberDashboard profile={profile} records={records} setPage={setPage}/>;
  if(profile?.role==="instructor") return <InstructorDashboard profile={profile} records={records} members={members} setPage={setPage}/>;
  return <AdminDashboard records={records} members={members} setPage={setPage} setFilterMember={setFilterMember}/>;
}

function MemberDashboard({profile, records, setPage}){
  return(
    <div className="fade-in">
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13,color:"#9c8a7a",marginBottom:4}}>MY PAGE</div>
        <div style={{fontSize:24,fontWeight:500}}>안녕하세요, {profile?.name}님 ✨</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:16}}>
          <div style={{fontSize:11,color:"#9c8a7a",marginBottom:8}}>💳 수강권 잔여</div>
          <div style={{fontSize:28,fontWeight:600,color:"#3d3028"}}>{profile?.ticket_left??0}<span style={{fontSize:14,color:"#9c8a7a"}}> 회</span></div>
        </div>
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:16}}>
          <div style={{fontSize:11,color:"#9c8a7a",marginBottom:8}}>📋 전체 레슨</div>
          <div style={{fontSize:28,fontWeight:600,color:"#3d3028"}}>{records.length}<span style={{fontSize:14,color:"#9c8a7a"}}> 회</span></div>
          <button onClick={()=>setPage("records")} style={{marginTop:8,fontSize:12,padding:"4px 10px",background:"transparent",border:"1px solid #d4ccc4",borderRadius:6,cursor:"pointer",color:"#6b5f57"}}>기록 보기 →</button>
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:20}}>
        <div style={{fontSize:11,color:"#9c8a7a",marginBottom:12}}>최근 레슨</div>
        {records.slice(0,3).map(r=>(
          <div key={r.id} style={{padding:"10px 0",borderBottom:"1px solid #f5f0eb"}}>
            <div style={{fontSize:12,color:"#9c8a7a",marginBottom:4}}>{fmt(r.date)}</div>
            <div style={{fontSize:14,color:"#3d3028",lineHeight:1.5}}>{r.class_record}</div>
          </div>
        ))}
        {records.length===0&&<div style={{color:"#b8a898",fontSize:14}}>아직 레슨 기록이 없어요</div>}
      </div>
    </div>
  );
}

function InstructorDashboard({profile, records, members, setPage}){
  const myMembers=members.filter(m=>m.instructor_id===profile?.id);
  return(
    <div className="fade-in">
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13,color:"#9c8a7a",marginBottom:4}}>INSTRUCTOR</div>
        <div style={{fontSize:24,fontWeight:500}}>안녕하세요, {profile?.name} 👋</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {[{label:"담당 회원",value:myMembers.length+"명",icon:"👥"},{label:"전체 수업",value:records.length+"회",icon:"📋"}].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:16,textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:22,fontWeight:600,color:"#3d3028"}}>{s.value}</div>
            <div style={{fontSize:12,color:"#9c8a7a"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontSize:11,color:"#9c8a7a"}}>최근 레슨 기록</div>
          <button onClick={()=>setPage("records")} style={{fontSize:12,padding:"4px 10px",background:"transparent",border:"1px solid #d4ccc4",borderRadius:6,cursor:"pointer",color:"#6b5f57"}}>전체보기</button>
        </div>
        {records.slice(0,3).map(r=>(
          <div key={r.id} style={{padding:"10px 0",borderBottom:"1px solid #f5f0eb"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:500}}>{r.member_name}</span>
              <span style={{fontSize:12,color:"#9c8a7a"}}>{fmt(r.date)}</span>
            </div>
            <div style={{fontSize:13,color:"#6b5f57",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{r.class_record}</div>
          </div>
        ))}
        {records.length===0&&<div style={{color:"#b8a898",fontSize:14}}>아직 레슨 기록이 없어요</div>}
      </div>
    </div>
  );
}

function AdminDashboard({records, members, setPage, setFilterMember}){
  return(
    <div className="fade-in">
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13,color:"#9c8a7a",marginBottom:4}}>ADMIN</div>
        <div style={{fontSize:24,fontWeight:500}}>센터 현황</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:16}}>
        {[{label:"전체 회원",value:members.length+"명",icon:"👥"},{label:"전체 레슨",value:records.length+"회",icon:"📋"}].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:16,textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:22,fontWeight:600,color:"#3d3028"}}>{s.value}</div>
            <div style={{fontSize:12,color:"#9c8a7a"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:20}}>
        <div style={{fontSize:11,color:"#9c8a7a",marginBottom:12}}>👥 회원 수강권 현황</div>
        {members.map(m=>{
          const left=m.ticket_left??0,total=m.ticket_total??0;
          const pct=total>0?Math.round(((total-left)/total)*100):0;
          return(
            <div key={m.id} style={{marginBottom:12,cursor:"pointer"}} onClick={()=>{setFilterMember(m.id);setPage("records");}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:13}}>{m.name}</span>
                <span style={{fontSize:12,color:left<=3?"#e74c3c":"#9c8a7a"}}>{left}회 남음</span>
              </div>
              <div style={{background:"#f0ebe4",borderRadius:4,height:6}}>
                <div style={{background:left<=3?"#e74c3c":"#3d3028",height:"100%",borderRadius:4,width:pct+"%"}}/>
              </div>
            </div>
          );
        })}
        {members.length===0&&<div style={{color:"#b8a898",fontSize:14,textAlign:"center",padding:20}}>
          등록된 회원이 없어요<br/>
          <button onClick={()=>setPage("addmember")} style={{marginTop:12,padding:"8px 16px",background:"#3d3028",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>+ 회원 추가</button>
        </div>}
      </div>
    </div>
  );
}

function AddMemberPage({onSave, onCancel}){
  const [form, setForm] = useState({name:"", phone:"", role:"member", ticket_total:10, ticket_left:10});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(){
    if(!form.name||!form.phone){setError("이름과 전화번호를 입력해주세요.");return;}
    setSaving(true); setError("");
    const email = `${form.phone}@deepropilates.com`;
    const password = form.phone.slice(-4);
    
    const {data, error:authError} = await supabase.auth.admin.createUser({
      email, password, email_confirm: true
    });

    if(authError){
      const {data:signupData, error:signupError} = await supabase.auth.signUp({email, password});
      if(signupError){setError("계정 생성 실패: "+signupError.message);setSaving(false);return;}
      if(signupData?.user){
        await supabase.from('profiles').insert({
          id: signupData.user.id,
          name: form.name,
          phone: form.phone,
          role: form.role,
          ticket_total: form.ticket_total,
          ticket_left: form.ticket_left,
        });
      }
    } else if(data?.user){
      await supabase.from('profiles').insert({
        id: data.user.id,
        name: form.name,
        phone: form.phone,
        role: form.role,
        ticket_total: form.ticket_total,
        ticket_left: form.ticket_left,
      });
    }
    setSaving(false);
    onSave();
  }

  return(
    <div className="fade-in">
      <button onClick={onCancel} style={{marginBottom:20,fontSize:13,background:"transparent",border:"1px solid #d4ccc4",borderRadius:8,padding:"9px 18px",cursor:"pointer",color:"#6b5f57"}}>← 취소</button>
      <div style={{fontSize:20,fontWeight:500,marginBottom:20}}>회원 추가</div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:24}}>
        {[
          {key:"name",label:"이름",ph:"홍길동",type:"text"},
          {key:"phone",label:"전화번호 (010 제외)",ph:"12345678",type:"text"},
        ].map(f=>(
          <div key={f.key} style={{marginBottom:16}}>
            <div style={{fontSize:11,color:"#9c8a7a",marginBottom:6}}>{f.label}</div>
            <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={{width:"100%",border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none"}}/>
          </div>
        ))}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#9c8a7a",marginBottom:6}}>역할</div>
          <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{width:"100%",border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none"}}>
            <option value="member">회원</option>
            <option value="instructor">강사</option>
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div>
            <div style={{fontSize:11,color:"#9c8a7a",marginBottom:6}}>수강권 총 횟수</div>
            <input type="number" value={form.ticket_total} onChange={e=>setForm({...form,ticket_total:parseInt(e.target.value),ticket_left:parseInt(e.target.value)})} style={{width:"100%",border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none"}}/>
          </div>
          <div>
            <div style={{fontSize:11,color:"#9c8a7a",marginBottom:6}}>잔여 횟수</div>
            <input type="number" value={form.ticket_left} onChange={e=>setForm({...form,ticket_left:parseInt(e.target.value)})} style={{width:"100%",border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none"}}/>
          </div>
        </div>
        <div style={{background:"#f7f5f2",borderRadius:8,padding:12,marginBottom:16,fontSize:13,color:"#6b5f57"}}>
          💡 초기 비밀번호는 전화번호 뒷 4자리예요
        </div>
        {error&&<div style={{color:"#e74c3c",fontSize:13,marginBottom:12}}>{error}</div>}
        <button onClick={save} disabled={saving} style={{width:"100%",padding:14,background:"#3d3028",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:15}}>
          {saving?"추가 중...":"회원 추가"}
        </button>
      </div>
    </div>
  );
}

function RecordList({profile, records, members, filterMember, setFilterMember, onSelect, onNew}){
  return(
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:500}}>레슨 기록</div>
        {profile?.role!=="member"&&<button onClick={onNew} style={{padding:"9px 18px",background:"#3d3028",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>+ 새 기록</button>}
      </div>
      {profile?.role!=="member"&&(
        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
          <button className={`tab ${filterMember==="all"?"active":""}`} onClick={()=>setFilterMember("all")}>전체</button>
          {members.map(m=><button key={m.id} className={`tab ${filterMember===m.id?"active":""}`} onClick={()=>setFilterMember(m.id)}>{m.name}</button>)}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {records.length===0&&<div style={{textAlign:"center",padding:60,color:"#b8a898"}}>기록이 없어요</div>}
        {records.map(r=>(
          <div key={r.id} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"18px 20px",cursor:"pointer"}} onClick={()=>onSelect(r)}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div>
                <div style={{fontSize:12,color:"#9c8a7a",marginBottom:3}}>{fmt(r.date)}</div>
                {profile?.role!=="member"&&<div style={{fontSize:16,fontWeight:500}}>{r.member_name}</div>}
              </div>
              {r.rating&&<StarRating value={r.rating}/>}
            </div>
            <div style={{fontSize:14,color:"#6b5f57",lineHeight:1.6}}>{r.class_record}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecordDetail({profile, record, onBack, onRefresh}){
  const [comment,setComment]=useState("");

  async function addComment(){
    if(!comment.trim()) return;
    const comments=[...(record.comments||[]),{author:profile?.name,text:comment,time:new Date().toLocaleString("ko-KR")}];
    await supabase.from('records').update({comments}).eq('id',record.id);
    setComment(""); onRefresh();
  }

  async function rate(v){
    await supabase.from('records').update({rating:v}).eq('id',record.id);
    onRefresh();
  }

  return(
    <div className="fade-in">
      <button onClick={onBack} style={{marginBottom:20,fontSize:13,background:"transparent",border:"1px solid #d4ccc4",borderRadius:8,padding:"9px 18px",cursor:"pointer",color:"#6b5f57"}}>← 목록으로</button>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,color:"#9c8a7a",marginBottom:6}}>{fmt(record.date)}</div>
        <div style={{fontSize:22,fontWeight:500}}>{record.member_name||"회원"}</div>
      </div>
      {[{label:"📋 수업 기록",content:record.class_record},{label:"💡 피드백",content:record.feedback},{label:"📝 숙제",content:record.homework}].map(s=>s.content&&(
        <div key={s.label} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px 20px",marginBottom:12}}>
          <div style={{fontSize:11,color:"#9c8a7a",marginBottom:8}}>{s.label}</div>
          <div style={{fontSize:15,lineHeight:1.75,color:"#3d3028"}}>{s.content}</div>
        </div>
      ))}
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:13,color:"#9c8a7a"}}>만족도</span>
        <StarRating value={record.rating||0} onChange={profile?.role==="member"?rate:null}/>
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px 20px"}}>
        <div style={{fontSize:11,color:"#9c8a7a",marginBottom:16}}>💬 댓글</div>
        {(record.comments||[]).map((c,i)=>(
          <div key={i} style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"#b8a898",marginBottom:4}}>{c.author} · {c.time}</div>
            <div style={{background:"#f0ebe4",borderRadius:8,padding:"8px 12px",fontSize:14}}>{c.text}</div>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <input type="text" value={comment} onChange={e=>setComment(e.target.value)} placeholder="댓글 입력..." style={{flex:1,border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none"}} onKeyDown={e=>e.key==="Enter"&&addComment()}/>
          <button onClick={addComment} style={{padding:"9px 18px",background:"#3d3028",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>전송</button>
        </div>
      </div>
    </div>
  );
}

function NewRecordForm({profile, members, onSave, onCancel}){
  const [form,setForm]=useState({date:new Date().toISOString().split("T")[0],member_id:members[0]?.id||"",class_record:"",feedback:"",homework:""});
  const [saving,setSaving]=useState(false);

  async function save(){
    if(!form.class_record.trim()) return;
    setSaving(true);
    const member=members.find(m=>m.id===form.member_id);
    await supabase.from('records').insert({...form,instructor_id:profile.id,member_name:member?.name||"",comments:[]});
    setSaving(false); onSave();
  }

  return(
    <div className="fade-in">
      <button onClick={onCancel} style={{marginBottom:20,fontSize:13,background:"transparent",border:"1px solid #d4ccc4",borderRadius:8,padding:"9px 18px",cursor:"pointer",color:"#6b5f57"}}>← 취소</button>
      <div style={{fontSize:20,fontWeight:500,marginBottom:20}}>새 레슨 기록</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div>
          <div style={{fontSize:11,color:"#9c8a7a",marginBottom:6}}>날짜</div>
          <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{width:"100%",border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none"}}/>
        </div>
        <div>
          <div style={{fontSize:11,color:"#9c8a7a",marginBottom:6}}>회원</div>
          <select value={form.member_id} onChange={e=>setForm({...form,member_id:e.target.value})} style={{width:"100%",border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none"}}>
            {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      {[{key:"class_record",label:"📋 수업 기록",ph:"오늘 수업 내용..."},{key:"feedback",label:"💡 피드백",ph:"회원에게 전달할 피드백..."},{key:"homework",label:"📝 숙제",ph:"집에서 할 운동..."}].map(f=>(
        <div key={f.key} style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"#9c8a7a",marginBottom:6}}>{f.label}</div>
          <textarea rows={2} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={{width:"100%",border:"1px solid #e0d9d0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none",resize:"none"}}/>
        </div>
      ))}
      <div style={{display:"flex",gap:10,marginTop:8}}>
        <button onClick={save} disabled={saving} style={{flex:1,padding:14,background:"#3d3028",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:15}}>{saving?"저장 중...":"저장"}</button>
        <button onClick={onCancel} style={{padding:"9px 18px",background:"transparent",border:"1px solid #d4ccc4",borderRadius:8,cursor:"pointer",color:"#6b5f57",fontSize:13}}>취소</button>
      </div>
    </div>
  );
}

function MembersPage({members, records, setPage, setFilterMember, onRefresh}){
  return(
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:500}}>회원 관리</div>
        <button onClick={()=>setPage("addmember")} style={{padding:"9px 18px",background:"#3d3028",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>+ 회원 추가</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {members.map(m=>{
          const mRec=records.filter(r=>r.member_id===m.id);
          const left=m.ticket_left??0;
          return(
            <div key={m.id} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"18px 20px",cursor:"pointer"}} onClick={()=>{setFilterMember(m.id);setPage("records");}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <Avatar user={m} size={44}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:500}}>{m.name}</div>
                  <div style={{fontSize:12,color:"#9c8a7a"}}>{m.phone}</div>
                </div>
                <span style={{background:left<=3?"#fdf0f0":"#f0ebe4",color:left<=3?"#e74c3c":"#6b5f57",padding:"3px 10px",borderRadius:20,fontSize:11}}>수강권 {left}회</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,background:"#faf9f7",borderRadius:8,padding:10}}>
                {[{label:"총 수업",value:mRec.length+"회"},{label:"수강권 잔여",value:left+"회"}].map(s=>(
                  <div key={s.label} style={{textAlign:"center"}}>
                    <div style={{fontSize:15,fontWeight:600,color:"#3d3028"}}>{s.value}</div>
                    <div style={{fontSize:10,color:"#b8a898"}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {members.length===0&&<div style={{textAlign:"center",padding:60,color:"#b8a898"}}>등록된 회원이 없어요</div>}
      </div>
    </div>
  );
}

function TicketsPage({profile, members, onRefresh}){
  const list=profile?.role==="member"?[profile]:members;
  return(
    <div className="fade-in">
      <div style={{fontSize:20,fontWeight:500,marginBottom:20}}>수강권 관리</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {list.map(m=>{
          const left=m.ticket_left??0,total=m.ticket_total??0;
          const pct=total>0?Math.round(((total-left)/total)*100):0;
          return(
            <div key={m.id} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:20}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{fontSize:16,fontWeight:500}}>{m.name}</div>
                <span style={{background:left<=3?"#e74c3c":"#3d3028",color:"#fff",padding:"5px 14px",borderRadius:20,fontSize:11}}>잔여 {left}회</span>
              </div>
              <div style={{background:"#f0ebe4",borderRadius:6,height:10,marginBottom:6}}>
                <div style={{background:left<=3?"#e74c3c":"#3d3028",height:"100%",borderRadius:6,width:pct+"%"}}/>
              </div>
              <div style={{fontSize:12,color:"#9c8a7a"}}>{total-left} / {total}회 사용</div>
              {left<=3&&<div style={{background:"#fdf5f5",border:"1px solid #f0d0d0",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#c0392b",marginTop:12}}>⚠️ 수강권이 {left}회 남았어요.</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarPage({profile, records, calMonth, setCalMonth, setSelectedRecord, setPage}){
  const year=calMonth.getFullYear(),month=calMonth.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const [selectedDay,setSelectedDay]=useState(null);

  function getRecords(d){
    const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return records.filter(r=>r.date===ds);
  }

  return(
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:500}}>{year}년 {month+1}월</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setCalMonth(new Date(year,month-1,1))} style={{padding:"6px 14px",background:"transparent",border:"1px solid #d4ccc4",borderRadius:8,cursor:"pointer",color:"#6b5f57"}}>‹</button>
          <button onClick={()=>setCalMonth(new Date(year,month+1,1))} style={{padding:"6px 14px",background:"transparent",border:"1px solid #d4ccc4",borderRadius:8,cursor:"pointer",color:"#6b5f57"}}>›</button>
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,overflow:"hidden",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#f7f5f2",borderBottom:"1px solid #e8e2da"}}>
          {["일","월","화","수","목","금","토"].map((d,i)=>(
            <div key={d} style={{textAlign:"center",padding:"10px 0",fontSize:12,color:i===0?"#e74c3c":i===6?"#5a7fa8":"#9c8a7a"}}>{d}</div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i} style={{aspectRatio:"1",borderRight:"1px solid #f5f0eb",borderBottom:"1px solid #f5f0eb"}}/>)}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const d=i+1,hasRec=getRecords(d).length>0,isSelected=selectedDay===d;
            return(
              <div key={d} onClick={()=>setSelectedDay(d===selectedDay?null:d)} style={{aspectRatio:"1",borderRight:"1px solid #f5f0eb",borderBottom:"1px solid #f5f0eb",padding:6,cursor:"pointer",background:isSelected?"#f0ebe4":"transparent",display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{d}</div>
                {hasRec&&<div style={{width:5,height:5,borderRadius:"50%",background:"#d4b896",marginTop:2}}/>}
              </div>
            );
          })}
        </div>
      </div>
      {selectedDay&&getRecords(selectedDay).length>0&&(
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px 20px"}}>
          <div style={{fontSize:11,color:"#9c8a7a",marginBottom:12}}>{month+1}월 {selectedDay}일 레슨</div>
          {getRecords(selectedDay).map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f0eb",cursor:"pointer"}} onClick={()=>{setSelectedRecord(r);setPage("records");}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500}}>{r.member_name}</div>
                <div style={{fontSize:12,color:"#9c8a7a"}}>{r.class_record?.substring(0,40)}...</div>
              </div>
              <span style={{background:"#6b8f71",color:"#fff",padding:"3px 10px",borderRadius:20,fontSize:11}}>완료</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GlobalStyles(){
  return(
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      .fade-in{animation:fadeIn 0.3s ease;}
      @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
      .tab{padding:5px 14px;border-radius:20px;border:none;background:transparent;cursor:pointer;font-size:12px;color:#9c8a7a;white-space:nowrap;}
      .tab.active{background:#3d3028;color:#fff;}
    `}</style>
  );
}
