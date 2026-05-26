import React, { useState } from 'react';
import { useState, useRef, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────
const USERS = {
  admin:      { id:"admin",   name:"센터장 이나연", role:"admin",      avatar:"이", pass:"1234" },
  inst1:      { id:"inst1",   name:"박지현 강사",   role:"instructor", avatar:"박", pass:"1234", color:"#6b8f71" },
  inst2:      { id:"inst2",   name:"김수아 강사",   role:"instructor", avatar:"김", color:"#7a6fa8", pass:"1234" },
  member1:    { id:"member1", name:"김지수",        role:"member",     avatar:"지", pass:"1234", instructor:"inst1", ticket:12, usedTicket:8 },
  member2:    { id:"member2", name:"이미래",        role:"member",     avatar:"미", pass:"1234", instructor:"inst1", ticket:20, usedTicket:11 },
  member3:    { id:"member3", name:"최서윤",        role:"member",     avatar:"서", pass:"1234", instructor:"inst2", ticket:8,  usedTicket:3 },
  member4:    { id:"member4", name:"정하나",        role:"member",     avatar:"하", pass:"1234", instructor:"inst2", ticket:16, usedTicket:14 },
};

const MEMBERS = Object.values(USERS).filter(u=>u.role==="member");
const INSTRUCTORS = Object.values(USERS).filter(u=>u.role==="instructor");

const GOALS = {
  member1: [
    { id:1, text:"코어 강화", done:true },
    { id:2, text:"척추 측만 교정", done:false },
    { id:3, text:"유연성 향상", done:false },
  ],
  member2: [
    { id:1, text:"체중 감량 -5kg", done:false },
    { id:2, text:"어깨 통증 완화", done:true },
  ],
};

const RECORDS_INIT = [
  {
    id:1, date:"2026-05-20", memberId:"member1", instructorId:"inst1",
    classRecord:"리포머 기초 - 풋워크, 레그 서클, 스트레칭 시퀀스 진행. 골반 중립 자세 교정 집중.",
    feedback:"코어 안정성이 많이 향상되었어요! 왼쪽 고관절 유연성이 아직 부족하니 신경 써주세요.",
    homework:"고양이 자세 스트레칭 하루 2회, 브릿지 운동 10회 x 3세트",
    exercises:[{name:"풋워크",sets:3,reps:10},{name:"레그 서클",sets:2,reps:8},{name:"브릿지",sets:3,reps:12}],
    rating:5, media:[],
    comments:[
      {id:1,authorId:"member1",text:"숙제 열심히 할게요! 고관절 스트레칭 따로 더 있을까요?",time:"2026-05-20 18:30"},
      {id:2,authorId:"inst1",text:"네! 비둘기 자세도 추가해보세요 😊",time:"2026-05-20 19:10"},
    ],
  },
  {
    id:2, date:"2026-05-15", memberId:"member1", instructorId:"inst1",
    classRecord:"체어 응용 동작 - 싱글 레그 푸시, 사이드 스트레치. 상체 정렬 개선 훈련.",
    feedback:"상체 정렬이 지난번보다 확실히 좋아졌어요. 호흡 패턴을 더 의식해보세요.",
    homework:"흉식 호흡 연습 매일 5분, 숄더 롤 세트",
    exercises:[{name:"싱글 레그 푸시",sets:3,reps:8},{name:"사이드 스트레치",sets:2,reps:10}],
    rating:4, media:[],comments:[],
  },
  {
    id:3, date:"2026-05-22", memberId:"member2", instructorId:"inst1",
    classRecord:"바렐 스트레칭 집중. 흉추 가동성 운동, 힙 플렉서 스트레칭.",
    feedback:"유연성이 눈에 띄게 좋아졌어요! 꾸준히 해주셔서 감사해요.",
    homework:"폼롤러 흉추 스트레칭, 햄스트링 스트레치",
    exercises:[{name:"흉추 확장",sets:2,reps:10},{name:"힙 플렉서",sets:3,reps:12}],
    rating:5, media:[],comments:[],
  },
  {
    id:4, date:"2026-05-18", memberId:"member3", instructorId:"inst2",
    classRecord:"TRX 코어 루틴. 플랭크 변형, 사이드 플랭크, 데드버그.",
    feedback:"코어 지구력이 아직 부족해요. 집에서 매일 5분씩 플랭크 해보세요.",
    homework:"플랭크 30초 x 3세트, 데드버그 10회 x 2세트",
    exercises:[{name:"플랭크",sets:3,reps:30},{name:"사이드 플랭크",sets:2,reps:20},{name:"데드버그",sets:2,reps:10}],
    rating:4, media:[],comments:[],
  },
  {
    id:5, date:"2026-05-10", memberId:"member1", instructorId:"inst1",
    classRecord:"기초 매트 필라테스. 헌드레드, 롤업, 레그 서클.",
    feedback:"호흡 연습이 많이 늘었어요. 내전근 강화 필요.",
    homework:"클램쉘 운동 15회 x 3세트",
    exercises:[{name:"헌드레드",sets:1,reps:100},{name:"롤업",sets:3,reps:8},{name:"레그 서클",sets:2,reps:10}],
    rating:4, media:[],comments:[],
  },
  {
    id:6, date:"2026-05-05", memberId:"member1", instructorId:"inst1",
    classRecord:"리포머 중급 - 롱 스트레치, 다운 스트레치, 엘리펀트.",
    feedback:"균형감각이 많이 향상됐어요! 다음 달엔 고급 동작 시도해봐요.",
    homework:"밸런스 보드 5분, 싱글 레그 스쿼트 연습",
    exercises:[{name:"롱 스트레치",sets:3,reps:8},{name:"엘리펀트",sets:2,reps:10}],
    rating:5, media:[],comments:[],
  },
];

const NOTIFS_INIT = [
  {id:1, to:"member1", type:"lesson",    text:"내일 오전 10시 레슨이 예정되어 있어요!", time:"오늘 09:00", read:false},
  {id:2, to:"member1", type:"feedback",  text:"박지현 강사님이 새 피드백을 남기셨어요.", time:"어제 18:30", read:false},
  {id:3, to:"member1", type:"ticket",    text:"수강권이 4회 남았어요. 재등록을 고려해보세요.", time:"3일 전", read:true},
  {id:4, to:"inst1",   type:"member",    text:"이미래 회원님이 레슨 기록에 댓글을 남겼어요.", time:"오늘 11:00", read:false},
  {id:5, to:"admin",   type:"ticket",    text:"정하나 회원 수강권 2회 남음 — 재등록 안내 필요", time:"오늘 08:00", read:false},
  {id:6, to:"admin",   type:"member",    text:"신규 회원 '오수정'님이 등록 대기 중이에요.", time:"어제", read:true},
];

const MESSAGES_INIT = [
  { id:1, from:"member1", to:"inst1", text:"선생님 다음 수업 일정 확인하고 싶어요!", time:"2026-05-20 10:00", read:true },
  { id:2, from:"inst1", to:"member1", text:"네! 이번 주 목요일 오전 10시 어떠세요?", time:"2026-05-20 10:15", read:true },
  { id:3, from:"member1", to:"inst1", text:"좋아요! 확인했습니다 감사해요 😊", time:"2026-05-20 10:20", read:false },
];

const PROGRESS_DATA = {
  member1: [
    { month:"1월", attendance:3, core:40, flex:35, balance:30 },
    { month:"2월", attendance:4, core:48, flex:42, balance:38 },
    { month:"3월", attendance:4, core:55, flex:50, balance:45 },
    { month:"4월", attendance:5, core:63, flex:58, balance:55 },
    { month:"5월", attendance:4, core:72, flex:65, balance:62 },
  ],
  member2: [
    { month:"1월", attendance:2, core:30, flex:55, balance:40 },
    { month:"2월", attendance:3, core:38, flex:60, balance:45 },
    { month:"3월", attendance:4, core:45, flex:68, balance:50 },
    { month:"4월", attendance:4, core:52, flex:74, balance:57 },
    { month:"5월", attendance:3, core:60, flex:80, balance:63 },
  ],
};

const RADAR_DATA = {
  member1:[
    {subject:"코어",value:72},{subject:"유연성",value:65},{subject:"균형",value:62},
    {subject:"지구력",value:58},{subject:"자세",value:70},{subject:"호흡",value:68},
  ],
  member2:[
    {subject:"코어",value:60},{subject:"유연성",value:80},{subject:"균형",value:63},
    {subject:"지구력",value:45},{subject:"자세",value:68},{subject:"호흡",value:55},
  ],
};

const SCHEDULE = [
  {id:1, date:"2026-05-26", time:"10:00", memberId:"member1", instructorId:"inst1", type:"개인"},
  {id:2, date:"2026-05-26", time:"14:00", memberId:"member2", instructorId:"inst1", type:"개인"},
  {id:3, date:"2026-05-27", time:"11:00", memberId:"member3", instructorId:"inst2", type:"개인"},
  {id:4, date:"2026-05-28", time:"09:00", memberId:"member4", instructorId:"inst2", type:"개인"},
  {id:5, date:"2026-05-29", time:"10:00", memberId:"member1", instructorId:"inst1", type:"개인"},
  {id:6, date:"2026-06-02", time:"10:00", memberId:"member1", instructorId:"inst1", type:"개인"},
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (d)=>{ const dt=new Date(d); return dt.toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"short"}); };
const fmtM = (d)=>{ const dt=new Date(d); return `${dt.getMonth()+1}월 ${dt.getDate()}일`; };

function Avatar({user, size=36}){
  const colors={admin:"#c0392b",instructor:"#6b8f71",member:"#5a7fa8"};
  const bg = user.color || colors[user.role] || "#888";
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:600,flexShrink:0}}>{user.avatar}</div>;
}

function StarRating({value, onChange}){
  return <div style={{display:"flex",gap:4}}>
    {[1,2,3,4,5].map(s=>(
      <span key={s} onClick={()=>onChange&&onChange(s)} style={{fontSize:20,cursor:onChange?"pointer":"default",color:s<=value?"#f0c040":"#ddd",transition:"color 0.1s"}}>★</span>
    ))}
  </div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function PilatesPro() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [records, setRecords] = useState(RECORDS_INIT);
  const [notifs, setNotifs] = useState(NOTIFS_INIT);
  const [messages, setMessages] = useState(MESSAGES_INIT);
  const [goals, setGoals] = useState(GOALS);
  const [showNotifs, setShowNotifs] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [msgWith, setMsgWith] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date(2026,4,1));
  const [filterMember, setFilterMember] = useState("all");
  const [showNewRecord, setShowNewRecord] = useState(false);

  const myNotifs = notifs.filter(n=>n.to===user?.id);
  const unread = myNotifs.filter(n=>!n.read).length;

  function login(uid, pass){
    const u = USERS[uid];
    if(u && u.pass===pass){ setUser(u); setPage("dashboard"); }
    else alert("비밀번호가 올바르지 않습니다.");
  }

  function logout(){ setUser(null); setPage("dashboard"); setShowNewRecord(false); setSelectedRecord(null); }

  function readAllNotifs(){ setNotifs(notifs.map(n=>n.to===user.id?{...n,read:true}:n)); }

  const myRecords = records.filter(r=>
    user?.role==="member" ? r.memberId===user.id :
    user?.role==="instructor" ? r.instructorId===user.id :
    true
  ).filter(r=> filterMember==="all" ? true : r.memberId===filterMember)
   .sort((a,b)=>new Date(b.date)-new Date(a.date));

  if(!user) return <LoginPage onLogin={login}/>;

  return (
    <div style={{fontFamily:"'Noto Serif KR','Georgia',serif",minHeight:"100vh",background:"#f7f5f2",color:"#2c2c2c",display:"flex",flexDirection:"column"}}>
      <GlobalStyles/>
      <Header user={user} unread={unread} showNotifs={showNotifs} setShowNotifs={setShowNotifs}
        myNotifs={myNotifs} readAllNotifs={readAllNotifs} logout={logout} page={page} setPage={setPage}/>

      <div style={{flex:1,maxWidth:900,width:"100%",margin:"0 auto",padding:"24px 16px"}}>

        {page==="dashboard" && (
          user.role==="admin" ? <AdminDashboard records={records} schedule={SCHEDULE} setPage={setPage} setFilterMember={setFilterMember}/> :
          user.role==="instructor" ? <InstructorDashboard user={user} records={myRecords} schedule={SCHEDULE} setPage={setPage}/> :
          <MemberDashboard user={user} records={myRecords} schedule={SCHEDULE} goals={goals} setGoals={setGoals} setPage={setPage}/>
        )}

        {page==="records" && !selectedRecord && !showNewRecord && (
          <RecordList user={user} records={myRecords} filterMember={filterMember} setFilterMember={setFilterMember}
            onSelect={r=>{setSelectedRecord(r);}} onNew={()=>setShowNewRecord(true)}/>
        )}

        {page==="records" && selectedRecord && (
          <RecordDetail user={user} record={selectedRecord} users={USERS}
            onBack={()=>setSelectedRecord(null)}
            onComment={(text)=>{
              const updated=records.map(r=>r.id===selectedRecord.id?{...r,comments:[...r.comments,{id:Date.now(),authorId:user.id,text,time:new Date().toLocaleString("ko-KR")}]}:r);
              setRecords(updated); setSelectedRecord(updated.find(r=>r.id===selectedRecord.id));
            }}
            onRate={(v)=>{
              const updated=records.map(r=>r.id===selectedRecord.id?{...r,rating:v}:r);
              setRecords(updated); setSelectedRecord(updated.find(r=>r.id===selectedRecord.id));
            }}
          />
        )}

        {page==="records" && showNewRecord && (
          <NewRecordForm user={user} onSave={(rec)=>{setRecords([rec,...records]);setShowNewRecord(false);}}
            onCancel={()=>setShowNewRecord(false)}/>
        )}

        {page==="progress" && <ProgressPage user={user} records={records}/>}
        {page==="calendar" && <CalendarPage user={user} schedule={SCHEDULE} records={records} calMonth={calMonth} setCalMonth={setCalMonth} setSelectedRecord={setSelectedRecord} setPage={setPage}/>}
        {page==="messages" && <MessagesPage user={user} messages={messages} setMessages={setMessages} msgWith={msgWith} setMsgWith={setMsgWith}/>}
        {page==="members" && user.role!=="member" && <MembersPage user={user} records={records} goals={goals} setPage={setPage} setFilterMember={setFilterMember}/>}
        {page==="tickets" && <TicketsPage user={user}/>}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({onLogin}){
  const [uid,setUid]=useState("member1");
  const [pass,setPass]=useState("1234");
  const demos=[
    {uid:"admin",label:"👑 센터장 (관리자)"},
    {uid:"inst1",label:"🌿 박지현 강사"},
    {uid:"inst2",label:"💜 김수아 강사"},
    {uid:"member1",label:"👤 김지수 (회원)"},
    {uid:"member2",label:"👤 이미래 (회원)"},
  ];
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#2a1f18 0%,#3d3028 50%,#4a3a2e 100%)",padding:20}}>
      <GlobalStyles/>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:13,letterSpacing:"0.25em",color:"#d4b896",fontFamily:"'DM Mono',monospace",marginBottom:8}}>PILATES PRO</div>
        <div style={{fontSize:32,color:"#fff",fontWeight:300}}>레슨 관리 플랫폼</div>
        <div style={{color:"#b8a898",fontSize:14,marginTop:8}}>회원, 강사, 관리자 통합 시스템</div>
      </div>
      <div style={{background:"#fff",borderRadius:16,padding:32,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div className="section-label" style={{marginBottom:8}}>계정 선택</div>
        <select value={uid} onChange={e=>setUid(e.target.value)} style={{marginBottom:16,width:"100%"}}>
          {demos.map(d=><option key={d.uid} value={d.uid}>{d.label}</option>)}
        </select>
        <div className="section-label" style={{marginBottom:8}}>비밀번호</div>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="비밀번호 (데모: 1234)" style={{marginBottom:20,width:"100%"}} onKeyDown={e=>e.key==="Enter"&&onLogin(uid,pass)}/>
        <button className="btn btn-primary" style={{width:"100%",padding:14,fontSize:15}} onClick={()=>onLogin(uid,pass)}>로그인</button>
        <div style={{textAlign:"center",marginTop:16,fontSize:12,color:"#b8a898"}}>데모 비밀번호: 1234</div>
      </div>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({user,unread,showNotifs,setShowNotifs,myNotifs,readAllNotifs,logout,page,setPage}){
  const [menuOpen,setMenuOpen]=useState(false);
  const navItems=[
    {id:"dashboard", label:"홈",      icon:"🏠", desc:"센터 현황 한눈에 보기"},
    {id:"records",   label:"레슨기록", icon:"📋", desc:"수업 내용·피드백·숙제"},
    {id:"calendar",  label:"캘린더",   icon:"📅", desc:"월별 레슨 일정 확인"},
    {id:"progress",  label:"통계",     icon:"📊", desc:"진도 그래프·역량 분석"},
    ...(user.role!=="member"?[{id:"members",label:"회원관리",icon:"👥",desc:"담당 회원 현황·목표"}]:[]),
    {id:"tickets",   label:"수강권",   icon:"💳", desc:"잔여 횟수·만료 알림"},
    {id:"messages",  label:"메시지",   icon:"💬", desc:"강사·회원 1:1 대화"},
  ];

  function go(id){ setPage(id); setMenuOpen(false); }

  const roleLabel = user.role==="admin"?"관리자":user.role==="instructor"?"강사":"회원";
  const roleColor = user.role==="admin"?"#c0392b":user.role==="instructor"?"#6b8f71":"#5a7fa8";

  return(
    <>
      {/* ── 상단바 ── */}
      <div style={{background:"#2a1f18",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 12px rgba(0,0,0,0.25)"}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"0 16px",height:56,display:"flex",alignItems:"center",gap:12}}>

          {/* 로고 */}
          <div style={{color:"#d4b896",fontFamily:"'DM Mono',monospace",fontSize:13,letterSpacing:"0.15em",flex:1}}>
            PILATES PRO
          </div>

          {/* 현재 페이지 이름 */}
          <div style={{color:"#c8bfb5",fontSize:13}}>
            {navItems.find(n=>n.id===page)?.icon} {navItems.find(n=>n.id===page)?.label}
          </div>

          {/* 알림 */}
          <div style={{position:"relative"}}>
            <button onClick={()=>{setShowNotifs(!showNotifs);setMenuOpen(false);if(!showNotifs)readAllNotifs();}}
              style={{background:"transparent",border:"none",color:"#c8bfb5",cursor:"pointer",fontSize:20,position:"relative",lineHeight:1,padding:"4px"}}>
              🔔
              {unread>0&&<span style={{position:"absolute",top:0,right:0,background:"#e74c3c",color:"#fff",borderRadius:"50%",width:15,height:15,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{unread}</span>}
            </button>
            {showNotifs&&(
              <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",background:"#fff",border:"1px solid #e8e2da",borderRadius:12,width:300,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",zIndex:400}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid #f0ebe4",fontSize:13,fontWeight:500}}>🔔 알림</div>
                {myNotifs.length===0&&<div style={{padding:20,textAlign:"center",color:"#b8a898",fontSize:13}}>알림이 없어요</div>}
                {myNotifs.slice(0,5).map(n=>(
                  <div key={n.id} style={{padding:"12px 16px",borderBottom:"1px solid #f9f7f5",opacity:n.read?0.55:1,background:n.read?"transparent":"#fffbf7"}}>
                    <div style={{fontSize:13,lineHeight:1.5}}>{n.text}</div>
                    <div style={{fontSize:11,color:"#b8a898",marginTop:3,fontFamily:"'DM Mono',monospace"}}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 햄버거 버튼 */}
          <button onClick={()=>{setMenuOpen(!menuOpen);setShowNotifs(false);}}
            style={{background:menuOpen?"#d4b896":"rgba(255,255,255,0.08)",border:"none",borderRadius:8,width:40,height:40,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,transition:"background 0.2s",flexShrink:0}}>
            <span style={{display:"block",width:18,height:2,background:menuOpen?"#2a1f18":"#d4b896",borderRadius:2,transition:"all 0.25s",transform:menuOpen?"rotate(45deg) translate(5px,5px)":"none"}}/>
            <span style={{display:"block",width:18,height:2,background:menuOpen?"#2a1f18":"#d4b896",borderRadius:2,transition:"all 0.25s",opacity:menuOpen?0:1}}/>
            <span style={{display:"block",width:18,height:2,background:menuOpen?"#2a1f18":"#d4b896",borderRadius:2,transition:"all 0.25s",transform:menuOpen?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
          </button>
        </div>
      </div>

      {/* ── 풀스크린 메뉴 오버레이 ── */}
      {menuOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:500,display:"flex"}} onClick={()=>setMenuOpen(false)}>
          {/* 왼쪽 어두운 배경 (클릭 닫기) */}
          <div style={{flex:1,background:"rgba(0,0,0,0.45)"}}/>

          {/* 오른쪽 드로어 */}
          <div onClick={e=>e.stopPropagation()}
            style={{width:300,background:"#1e1510",height:"100%",display:"flex",flexDirection:"column",boxShadow:"-8px 0 40px rgba(0,0,0,0.4)",animation:"slideIn 0.25s ease"}}>

            {/* 드로어 헤더 — 프로필 */}
            <div style={{padding:"28px 24px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                <Avatar user={user} size={48}/>
                <div>
                  <div style={{color:"#fff",fontSize:16,fontWeight:500}}>{user.name}</div>
                  <span style={{display:"inline-block",marginTop:4,background:roleColor,color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:11,fontFamily:"'DM Mono',monospace"}}>{roleLabel}</span>
                </div>
              </div>
            </div>

            {/* 메뉴 항목들 */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 0"}}>
              {navItems.map((n,i)=>{
                const isActive=page===n.id;
                return(
                  <button key={n.id} onClick={()=>go(n.id)}
                    style={{width:"100%",background:isActive?"rgba(212,184,150,0.12)":"transparent",border:"none",borderLeft:isActive?"3px solid #d4b896":"3px solid transparent",padding:"14px 24px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"all 0.15s",animation:`fadeInItem 0.3s ease ${i*0.04}s both`}}>
                    <span style={{fontSize:22,lineHeight:1}}>{n.icon}</span>
                    <div style={{textAlign:"left"}}>
                      <div style={{color:isActive?"#d4b896":"#e8e0d8",fontSize:15,fontFamily:"'Noto Serif KR',serif",fontWeight:isActive?500:400}}>{n.label}</div>
                      <div style={{color:"#7a6a5a",fontSize:11,marginTop:2,fontFamily:"'DM Mono',monospace"}}>{n.desc}</div>
                    </div>
                    {isActive&&<span style={{marginLeft:"auto",color:"#d4b896",fontSize:16}}>›</span>}
                  </button>
                );
              })}
            </div>

            {/* 드로어 하단 — 로그아웃 */}
            <div style={{padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
              <button onClick={()=>{logout();setMenuOpen(false);}}
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"11px",color:"#b8a898",cursor:"pointer",fontFamily:"'Noto Serif KR',serif",fontSize:13,transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn{from{transform:translateX(100%);}to{transform:translateX(0);}}
        @keyframes fadeInItem{from{opacity:0;transform:translateX(12px);}to{opacity:1;transform:translateX(0);}}
      `}</style>
    </>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({records,schedule,setPage,setFilterMember}){
  const today=new Date().toISOString().split("T")[0];
  const todayLessons=schedule.filter(s=>s.date===today);
  const thisMonth=records.filter(r=>r.date.startsWith("2026-05"));
  const avgRating=(records.filter(r=>r.rating).reduce((a,b)=>a+b.rating,0)/records.filter(r=>r.rating).length).toFixed(1);
  const monthlyData=[
    {name:"1월",lessons:12},{name:"2월",lessons:16},{name:"3월",lessons:18},
    {name:"4월",lessons:22},{name:"5월",lessons:thisMonth.length},
  ];
  return(
    <div className="fade-in">
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13,color:"#9c8a7a",fontFamily:"'DM Mono',monospace",marginBottom:4}}>ADMIN DASHBOARD</div>
        <div style={{fontSize:24,fontWeight:500}}>센터 현황</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {[
          {label:"전체 회원",value:MEMBERS.length+"명",icon:"👥",color:"#5a7fa8"},
          {label:"이번달 수업",value:thisMonth.length+"회",icon:"📋",color:"#6b8f71"},
          {label:"오늘 예약",value:todayLessons.length+"건",icon:"📅",color:"#c0792a"},
          {label:"평균 만족도",value:"★ "+avgRating,icon:"⭐",color:"#9c6bad"},
        ].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px",textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:22,fontWeight:600,color:s.color}}>{s.value}</div>
            <div style={{fontSize:12,color:"#9c8a7a"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px"}}>
          <div className="section-label" style={{marginBottom:12}}>📈 월별 수업 현황</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} barSize={24}>
              <XAxis dataKey="name" tick={{fontSize:11,fontFamily:"'DM Mono',monospace"}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip contentStyle={{fontFamily:"'Noto Serif KR',serif",fontSize:13,borderRadius:8,border:"1px solid #e8e2da"}}/>
              <Bar dataKey="lessons" fill="#3d3028" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px"}}>
          <div className="section-label" style={{marginBottom:12}}>👥 회원 수강권 현황</div>
          {MEMBERS.map(m=>{
            const pct=Math.round((m.usedTicket/m.ticket)*100);
            const left=m.ticket-m.usedTicket;
            return(
              <div key={m.id} style={{marginBottom:12,cursor:"pointer"}} onClick={()=>{setFilterMember(m.id);setPage("records");}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:13}}>{m.name}</span>
                  <span style={{fontSize:12,color:left<=3?"#e74c3c":"#9c8a7a",fontFamily:"'DM Mono',monospace"}}>{left}회 남음</span>
                </div>
                <div style={{background:"#f0ebe4",borderRadius:4,height:6}}>
                  <div style={{background:left<=3?"#e74c3c":"#3d3028",height:"100%",borderRadius:4,width:pct+"%",transition:"width 0.5s"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px"}}>
        <div className="section-label" style={{marginBottom:12}}>📅 오늘의 레슨</div>
        {todayLessons.length===0?<div style={{color:"#b8a898",fontSize:14}}>오늘 예정된 레슨이 없어요</div>:
        todayLessons.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #f5f0eb"}}>
            <div style={{background:"#f0ebe4",borderRadius:8,padding:"6px 12px",fontFamily:"'DM Mono',monospace",fontSize:13,color:"#3d3028",minWidth:60,textAlign:"center"}}>{s.time}</div>
            <Avatar user={USERS[s.memberId]} size={32}/>
            <div>
              <div style={{fontSize:14,fontWeight:500}}>{USERS[s.memberId].name}</div>
              <div style={{fontSize:12,color:"#9c8a7a"}}>{USERS[s.instructorId].name}</div>
            </div>
            <span className="pill" style={{marginLeft:"auto",background:"#f0ebe4",color:"#6b5f57"}}>{s.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INSTRUCTOR DASHBOARD ──────────────────────────────────────────────────────
function InstructorDashboard({user,records,schedule,setPage}){
  const mySchedule=schedule.filter(s=>s.instructorId===user.id);
  const upcomingSchedule=mySchedule.filter(s=>s.date>="2026-05-26").slice(0,3);
  const myMembers=[...new Set(records.map(r=>r.memberId))].map(id=>USERS[id]);
  return(
    <div className="fade-in">
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13,color:"#9c8a7a",fontFamily:"'DM Mono',monospace",marginBottom:4}}>INSTRUCTOR</div>
        <div style={{fontSize:24,fontWeight:500}}>안녕하세요, {user.name} 👋</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {[
          {label:"담당 회원",value:myMembers.length+"명",icon:"👥"},
          {label:"이번달 수업",value:records.filter(r=>r.date.startsWith("2026-05")).length+"회",icon:"📋"},
        ].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px",textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:22,fontWeight:600,color:"#3d3028"}}>{s.value}</div>
            <div style={{fontSize:12,color:"#9c8a7a"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div className="section-label">📅 예정 레슨</div>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"4px 10px"}} onClick={()=>setPage("calendar")}>전체보기</button>
        </div>
        {upcomingSchedule.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #f5f0eb"}}>
            <div style={{background:"#f0ebe4",borderRadius:8,padding:"6px 12px",fontFamily:"'DM Mono',monospace",fontSize:12,color:"#3d3028",textAlign:"center",minWidth:60}}>
              <div>{fmtM(s.date)}</div><div>{s.time}</div>
            </div>
            <Avatar user={USERS[s.memberId]} size={32}/>
            <div style={{fontSize:14}}>{USERS[s.memberId].name}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div className="section-label">최근 레슨 기록</div>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"4px 10px"}} onClick={()=>setPage("records")}>전체보기</button>
        </div>
        {records.slice(0,3).map(r=>(
          <div key={r.id} style={{padding:"10px 0",borderBottom:"1px solid #f5f0eb"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:500}}>{USERS[r.memberId]?.name}</span>
              <span style={{fontSize:12,color:"#9c8a7a",fontFamily:"'DM Mono',monospace"}}>{fmt(r.date)}</span>
            </div>
            <div style={{fontSize:13,color:"#6b5f57",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{r.classRecord}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MEMBER DASHBOARD ─────────────────────────────────────────────────────────
function MemberDashboard({user,records,schedule,goals,setGoals,setPage}){
  const mySchedule=schedule.filter(s=>s.memberId===user.id);
  const next=mySchedule.filter(s=>s.date>="2026-05-26")[0];
  const myGoals=goals[user.id]||[];
  const left=user.ticket-user.usedTicket;
  const pct=Math.round((user.usedTicket/user.ticket)*100);
  function toggleGoal(gid){
    setGoals({...goals,[user.id]:myGoals.map(g=>g.id===gid?{...g,done:!g.done}:g)});
  }
  return(
    <div className="fade-in">
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13,color:"#9c8a7a",fontFamily:"'DM Mono',monospace",marginBottom:4}}>MY PAGE</div>
        <div style={{fontSize:24,fontWeight:500}}>안녕하세요, {user.name}님 ✨</div>
      </div>
      {next&&(
        <div style={{background:"linear-gradient(135deg,#3d3028,#5a4a3c)",borderRadius:14,padding:"20px",marginBottom:16,color:"#fff"}}>
          <div style={{fontSize:11,letterSpacing:"0.12em",color:"#d4b896",fontFamily:"'DM Mono',monospace",marginBottom:8}}>NEXT LESSON</div>
          <div style={{fontSize:20,fontWeight:500,marginBottom:4}}>{fmtM(next.date)} {next.time}</div>
          <div style={{fontSize:14,color:"#c8bfb5"}}>{USERS[next.instructorId].name}</div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px"}}>
          <div className="section-label" style={{marginBottom:8}}>💳 수강권</div>
          <div style={{fontSize:24,fontWeight:600,color:"#3d3028",marginBottom:6}}>{left}<span style={{fontSize:14,fontWeight:400,color:"#9c8a7a"}}> 회</span></div>
          <div style={{background:"#f0ebe4",borderRadius:4,height:6,marginBottom:4}}>
            <div style={{background:left<=3?"#e74c3c":"#3d3028",height:"100%",borderRadius:4,width:pct+"%"}}/>
          </div>
          <div style={{fontSize:11,color:"#b8a898"}}>전체 {user.ticket}회 중 {user.usedTicket}회 사용</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px"}}>
          <div className="section-label" style={{marginBottom:8}}>📋 전체 레슨</div>
          <div style={{fontSize:24,fontWeight:600,color:"#3d3028"}}>{records.length}<span style={{fontSize:14,fontWeight:400,color:"#9c8a7a"}}> 회</span></div>
          <button className="btn btn-ghost" style={{marginTop:8,fontSize:12,padding:"4px 10px"}} onClick={()=>setPage("records")}>기록 보기 →</button>
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px",marginBottom:16}}>
        <div className="section-label" style={{marginBottom:12}}>🏆 나의 목표</div>
        {myGoals.map(g=>(
          <div key={g.id} onClick={()=>toggleGoal(g.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:"1px solid #f5f0eb"}}>
            <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${g.done?"#6b8f71":"#d4ccc4"}`,background:g.done?"#6b8f71":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,flexShrink:0}}>{g.done?"✓":""}</div>
            <span style={{fontSize:14,textDecoration:g.done?"line-through":"none",color:g.done?"#b8a898":"#2c2c2c"}}>{g.text}</span>
          </div>
        ))}
        <button className="btn btn-ghost" style={{marginTop:12,fontSize:12,padding:"6px 14px"}} onClick={()=>setPage("progress")}>진도 통계 보기 →</button>
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px"}}>
        <div className="section-label" style={{marginBottom:12}}>최근 레슨</div>
        {records.slice(0,2).map(r=>(
          <div key={r.id} style={{padding:"10px 0",borderBottom:"1px solid #f5f0eb"}}>
            <div style={{fontSize:12,color:"#9c8a7a",fontFamily:"'DM Mono',monospace",marginBottom:4}}>{fmt(r.date)}</div>
            <div style={{fontSize:14,color:"#3d3028",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{r.classRecord}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RECORD LIST ──────────────────────────────────────────────────────────────
function RecordList({user,records,filterMember,setFilterMember,onSelect,onNew}){
  return(
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:500}}>레슨 기록</div>
        {user.role!=="member"&&<button className="btn btn-primary" onClick={onNew}>+ 새 기록</button>}
      </div>
      {user.role!=="member"&&(
        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
          {[{id:"all",name:"전체"},...MEMBERS].map(m=>(
            <button key={m.id} className={`tab ${filterMember===m.id?"active":""}`} onClick={()=>setFilterMember(m.id)}>{m.name||m.id}</button>
          ))}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {records.length===0&&<div style={{textAlign:"center",padding:60,color:"#b8a898"}}>기록이 없어요</div>}
        {records.map(r=>(
          <div key={r.id} className="card" style={{padding:"18px 20px"}} onClick={()=>onSelect(r)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:12,color:"#9c8a7a",fontFamily:"'DM Mono',monospace",marginBottom:3}}>{fmt(r.date)}</div>
                {user.role!=="member"&&<div style={{fontSize:16,fontWeight:500}}>{USERS[r.memberId]?.name}</div>}
              </div>
              <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                {r.rating&&<StarRating value={r.rating}/>}
                {r.comments.length>0&&<span style={{fontSize:12,color:"#9c8a7a"}}>💬 {r.comments.length}</span>}
              </div>
            </div>
            <div style={{fontSize:14,color:"#6b5f57",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{r.classRecord}</div>
            {r.exercises.length>0&&(
              <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                {r.exercises.filter(e=>e.name).map((e,i)=>(
                  <span key={i} className="pill" style={{background:"#f5f0eb",color:"#7a6558",border:"1px solid #ece6de"}}>{e.name}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RECORD DETAIL ────────────────────────────────────────────────────────────
function RecordDetail({user,record,users,onBack,onComment,onRate}){
  const [text,setText]=useState("");
  const member=users[record.memberId];
  const instructor=users[record.instructorId];
  return(
    <div className="fade-in">
      <button className="btn btn-ghost" style={{marginBottom:20,fontSize:13}} onClick={onBack}>← 목록으로</button>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,color:"#9c8a7a",fontFamily:"'DM Mono',monospace",marginBottom:6}}>{fmt(record.date)}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:22,fontWeight:500}}>{member?.name}</div>
          <span className="pill" style={{background:"#3d3028",color:"#d4b896",padding:"5px 14px"}}>{instructor?.name}</span>
        </div>
      </div>
      {record.rating&&(
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"#9c8a7a"}}>레슨 만족도</span>
          <StarRating value={record.rating} onChange={user.role==="member"?onRate:null}/>
        </div>
      )}
      {!record.rating&&user.role==="member"&&(
        <div style={{background:"#fffbf5",border:"1px solid #f0dfc0",borderRadius:12,padding:"14px 18px",marginBottom:12}}>
          <div style={{fontSize:13,color:"#9c8a7a",marginBottom:6}}>이번 레슨 어떠셨나요?</div>
          <StarRating value={0} onChange={onRate}/>
        </div>
      )}
      {[
        {label:"📋 수업 기록",content:record.classRecord},
        {label:"💡 피드백",content:record.feedback},
        {label:"📝 숙제",content:record.homework},
      ].map(s=>s.content&&(
        <div key={s.label} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px 20px",marginBottom:12}}>
          <div className="section-label" style={{marginBottom:8}}>{s.label}</div>
          <div style={{fontSize:15,lineHeight:1.75,color:"#3d3028"}}>{s.content}</div>
        </div>
      ))}
      {record.exercises.filter(e=>e.name).length>0&&(
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px 20px",marginBottom:12}}>
          <div className="section-label" style={{marginBottom:12}}>🏃 운동 횟수</div>
          {record.exercises.filter(e=>e.name).map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f0eb",fontSize:14}}>
              <span style={{fontWeight:500}}>{e.name}</span>
              <span style={{color:"#9c8a7a",fontFamily:"'DM Mono',monospace"}}>{e.sets}세트 × {e.reps}회</span>
            </div>
          ))}
        </div>
      )}
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px 20px"}}>
        <div className="section-label" style={{marginBottom:16}}>💬 댓글 {record.comments.length>0&&`(${record.comments.length})`}</div>
        {record.comments.length===0&&<div style={{textAlign:"center",padding:"16px 0",color:"#c0b8af",fontSize:14}}>첫 댓글을 남겨주세요!</div>}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
          {record.comments.map(c=>{
            const author=users[c.authorId];
            const isMine=c.authorId===user.id;
            return(
              <div key={c.id} style={{display:"flex",flexDirection:"column",alignItems:isMine?"flex-end":"flex-start"}}>
                <div style={{fontSize:11,color:"#b8a898",marginBottom:4,fontFamily:"'DM Mono',monospace"}}>{author?.name} · {c.time}</div>
                <div style={{borderRadius:12,padding:"10px 14px",maxWidth:"80%",background:isMine?"#3d3028":"#f0ebe4",color:isMine?"#fff":"#2c2c2c",fontSize:14,lineHeight:1.6,borderBottomRightRadius:isMine?4:12,borderBottomLeftRadius:isMine?12:4}}>
                  {c.text}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:8}}>
          <textarea rows={2} value={text} onChange={e=>setText(e.target.value)} placeholder="댓글 입력..." style={{flex:1,resize:"none"}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(text.trim()){onComment(text);setText("");}}}}/>
          <button className="btn btn-primary" style={{alignSelf:"flex-end"}} onClick={()=>{if(text.trim()){onComment(text);setText("");}}}>전송</button>
        </div>
      </div>
    </div>
  );
}

// ─── NEW RECORD FORM ──────────────────────────────────────────────────────────
function NewRecordForm({user,onSave,onCancel}){
  const mediaRef=useRef();
  const [form,setForm]=useState({
    date:new Date().toISOString().split("T")[0],
    memberId:MEMBERS[0].id,
    instructorId:user.role==="instructor"?user.id:INSTRUCTORS[0].id,
    classRecord:"",feedback:"",homework:"",
    exercises:[{name:"",sets:"",reps:""}],
    media:[],
  });
  function updateEx(i,f,v){const ex=[...form.exercises];ex[i][f]=v;setForm({...form,exercises:ex});}
  function save(){
    if(!form.classRecord.trim())return;
    onSave({id:Date.now(),...form,rating:null,comments:[]});
  }
  return(
    <div className="fade-in">
      <button className="btn btn-ghost" style={{marginBottom:20,fontSize:13}} onClick={onCancel}>← 취소</button>
      <div style={{fontSize:20,fontWeight:500,marginBottom:20}}>새 레슨 기록</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div><div className="section-label" style={{marginBottom:6}}>날짜</div><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
        <div><div className="section-label" style={{marginBottom:6}}>회원</div>
          <select value={form.memberId} onChange={e=>setForm({...form,memberId:e.target.value})}>
            {MEMBERS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        {user.role==="admin"&&<div><div className="section-label" style={{marginBottom:6}}>강사</div>
          <select value={form.instructorId} onChange={e=>setForm({...form,instructorId:e.target.value})}>
            {INSTRUCTORS.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>}
      </div>
      {[
        {key:"classRecord",label:"📋 수업 기록",ph:"오늘 수업 내용..."},
        {key:"feedback",label:"💡 피드백",ph:"회원에게 전달할 피드백..."},
        {key:"homework",label:"📝 숙제",ph:"집에서 할 운동..."},
      ].map(f=>(
        <div key={f.key} style={{marginBottom:14}}>
          <div className="section-label" style={{marginBottom:6}}>{f.label}</div>
          <textarea rows={2} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>
        </div>
      ))}
      <div style={{marginBottom:14}}>
        <div className="section-label" style={{marginBottom:10}}>🏃 운동 횟수</div>
        {form.exercises.map((ex,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 32px",gap:8,marginBottom:8,alignItems:"center"}}>
            <input type="text" placeholder="운동명" value={ex.name} onChange={e=>updateEx(i,"name",e.target.value)}/>
            <input type="text" placeholder="세트" value={ex.sets} onChange={e=>updateEx(i,"sets",e.target.value)}/>
            <input type="text" placeholder="횟수" value={ex.reps} onChange={e=>updateEx(i,"reps",e.target.value)}/>
            <button onClick={()=>setForm({...form,exercises:form.exercises.filter((_,j)=>j!==i)})} style={{background:"#f5f0eb",border:"none",borderRadius:6,cursor:"pointer",color:"#9c8a7a",fontSize:16}}>×</button>
          </div>
        ))}
        <button className="btn btn-ghost" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setForm({...form,exercises:[...form.exercises,{name:"",sets:"",reps:""}]})}>+ 추가</button>
      </div>
      <div style={{marginBottom:20}}>
        <div className="section-label" style={{marginBottom:8}}>📎 사진 / 동영상</div>
        <div onClick={()=>mediaRef.current.click()} style={{border:"2px dashed #d4ccc4",borderRadius:10,padding:20,textAlign:"center",cursor:"pointer",color:"#9c8a7a",fontSize:14}}>
          클릭하여 파일 선택
        </div>
        <input ref={mediaRef} type="file" accept="image/*,video/*" multiple style={{display:"none"}} onChange={e=>{
          const files=Array.from(e.target.files);
          const prev=files.map(f=>({name:f.name,type:f.type,url:URL.createObjectURL(f)}));
          setForm({...form,media:[...form.media,...prev]});
        }}/>
        {form.media.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
          {form.media.map((m,i)=>(
            <div key={i} style={{width:72,height:72,borderRadius:8,overflow:"hidden",border:"1px solid #e0d9d0"}}>
              {m.type.startsWith("image")?<img src={m.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:
              <div style={{width:"100%",height:"100%",background:"#3d3028",display:"flex",alignItems:"center",justifyContent:"center",color:"#d4b896",fontSize:24}}>▶</div>}
            </div>
          ))}
        </div>}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button className="btn btn-primary" style={{flex:1}} onClick={save}>저장</button>
        <button className="btn btn-ghost" onClick={onCancel}>취소</button>
      </div>
    </div>
  );
}

// ─── PROGRESS PAGE ────────────────────────────────────────────────────────────
function ProgressPage({user,records}){
  const [selectedMember,setSelectedMember]=useState(user.role==="member"?user.id:"member1");
  const data=PROGRESS_DATA[selectedMember]||PROGRESS_DATA["member1"];
  const radar=RADAR_DATA[selectedMember]||RADAR_DATA["member1"];
  const memberRecords=records.filter(r=>r.memberId===selectedMember);
  const avgRating=memberRecords.filter(r=>r.rating).length>0
    ?(memberRecords.filter(r=>r.rating).reduce((a,b)=>a+b.rating,0)/memberRecords.filter(r=>r.rating).length).toFixed(1)
    :"—";
  return(
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:500}}>진도 통계</div>
        {user.role!=="member"&&(
          <select value={selectedMember} onChange={e=>setSelectedMember(e.target.value)} style={{width:"auto"}}>
            {MEMBERS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[
          {label:"총 레슨",value:memberRecords.length+"회"},
          {label:"이번달",value:memberRecords.filter(r=>r.date.startsWith("2026-05")).length+"회"},
          {label:"평균 만족도",value:"★ "+avgRating},
        ].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"14px",textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:600,color:"#3d3028"}}>{s.value}</div>
            <div style={{fontSize:11,color:"#9c8a7a"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px",marginBottom:14}}>
        <div className="section-label" style={{marginBottom:12}}>📈 월별 출석 현황</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} barSize={28}>
            <XAxis dataKey="month" tick={{fontSize:11,fontFamily:"'DM Mono',monospace"}} axisLine={false} tickLine={false}/>
            <YAxis hide/>
            <Tooltip contentStyle={{fontFamily:"'Noto Serif KR',serif",fontSize:12,borderRadius:8,border:"1px solid #e8e2da"}}/>
            <Bar dataKey="attendance" fill="#3d3028" radius={[4,4,0,0]} name="수업횟수"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px",marginBottom:14}}>
        <div className="section-label" style={{marginBottom:12}}>💪 역량 발전 추이</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <XAxis dataKey="month" tick={{fontSize:11,fontFamily:"'DM Mono',monospace"}} axisLine={false} tickLine={false}/>
            <YAxis hide domain={[0,100]}/>
            <Tooltip contentStyle={{fontFamily:"'Noto Serif KR',serif",fontSize:12,borderRadius:8,border:"1px solid #e8e2da"}}/>
            <Line type="monotone" dataKey="core" stroke="#3d3028" strokeWidth={2} dot={{r:4}} name="코어"/>
            <Line type="monotone" dataKey="flex" stroke="#6b8f71" strokeWidth={2} dot={{r:4}} name="유연성"/>
            <Line type="monotone" dataKey="balance" stroke="#7a6fa8" strokeWidth={2} dot={{r:4}} name="균형"/>
          </LineChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:8}}>
          {[{c:"#3d3028",l:"코어"},{c:"#6b8f71",l:"유연성"},{c:"#7a6fa8",l:"균형"}].map(i=>(
            <div key={i.l} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"#6b5f57"}}>
              <div style={{width:12,height:3,borderRadius:2,background:i.c}}/>
              {i.l}
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px"}}>
        <div className="section-label" style={{marginBottom:12}}>🕸️ 현재 역량 레이더</div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radar} cx="50%" cy="50%">
            <PolarGrid stroke="#f0ebe4"/>
            <PolarAngleAxis dataKey="subject" tick={{fontSize:12,fontFamily:"'Noto Serif KR',serif",fill:"#6b5f57"}}/>
            <Radar name="역량" dataKey="value" stroke="#3d3028" fill="#3d3028" fillOpacity={0.15} strokeWidth={2}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── CALENDAR PAGE ────────────────────────────────────────────────────────────
function CalendarPage({user,schedule,records,calMonth,setCalMonth,setSelectedRecord,setPage}){
  const year=calMonth.getFullYear(), month=calMonth.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const mySchedule=user.role==="member"?schedule.filter(s=>s.memberId===user.id):
                   user.role==="instructor"?schedule.filter(s=>s.instructorId===user.id):schedule;
  const myRecords=user.role==="member"?records.filter(r=>r.memberId===user.id):
                  user.role==="instructor"?records.filter(r=>r.instructorId===user.id):records;
  function hasEvent(d){
    const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return mySchedule.some(s=>s.date===ds)||myRecords.some(r=>r.date===ds);
  }
  function getEvents(d){
    const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const sc=mySchedule.filter(s=>s.date===ds);
    const rc=myRecords.filter(r=>r.date===ds);
    return{schedule:sc,records:rc};
  }
  const [selectedDay,setSelectedDay]=useState(null);
  const dayEvents=selectedDay?getEvents(selectedDay):{schedule:[],records:[]};
  return(
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:500}}>{year}년 {month+1}월</div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-ghost" style={{padding:"6px 14px"}} onClick={()=>setCalMonth(new Date(year,month-1,1))}>‹</button>
          <button className="btn btn-ghost" style={{padding:"6px 14px"}} onClick={()=>setCalMonth(new Date(year,month+1,1))}>›</button>
        </div>
      </div>
      <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,overflow:"hidden",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#f7f5f2",borderBottom:"1px solid #e8e2da"}}>
          {["일","월","화","수","목","금","토"].map((d,i)=>(
            <div key={d} style={{textAlign:"center",padding:"10px 0",fontSize:12,color:i===0?"#e74c3c":i===6?"#5a7fa8":"#9c8a7a",fontFamily:"'DM Mono',monospace"}}>{d}</div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i} style={{aspectRatio:"1",borderRight:"1px solid #f5f0eb",borderBottom:"1px solid #f5f0eb"}}/>)}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const d=i+1;
            const ev=hasEvent(d);
            const isSelected=selectedDay===d;
            const isToday=year===2026&&month===4&&d===26;
            return(
              <div key={d} onClick={()=>setSelectedDay(d===selectedDay?null:d)} style={{aspectRatio:"1",borderRight:"1px solid #f5f0eb",borderBottom:"1px solid #f5f0eb",padding:"6px",cursor:"pointer",background:isSelected?"#f0ebe4":"transparent",transition:"background 0.1s",position:"relative",display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:isToday?"#3d3028":"transparent",color:isToday?"#fff":"#2c2c2c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:isToday?600:400}}>{d}</div>
                {ev&&<div style={{width:5,height:5,borderRadius:"50%",background:"#d4b896",marginTop:2}}/>}
              </div>
            );
          })}
        </div>
      </div>
      {selectedDay&&(dayEvents.schedule.length>0||dayEvents.records.length>0)&&(
        <div style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"16px 20px",animation:"fadeIn 0.2s ease"}}>
          <div className="section-label" style={{marginBottom:12}}>{month+1}월 {selectedDay}일 일정</div>
          {dayEvents.schedule.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f0eb"}}>
              <span style={{background:"#3d3028",color:"#d4b896",borderRadius:6,padding:"3px 8px",fontSize:12,fontFamily:"'DM Mono',monospace"}}>{s.time}</span>
              <Avatar user={USERS[s.memberId]} size={28}/>
              <span style={{fontSize:14}}>{USERS[s.memberId].name}</span>
              <span className="pill" style={{marginLeft:"auto",background:"#f0ebe4",color:"#6b5f57"}}>예정</span>
            </div>
          ))}
          {dayEvents.records.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f0eb",cursor:"pointer"}} onClick={()=>{setSelectedRecord(r);setPage("records");}}>
              <Avatar user={USERS[r.memberId]} size={28}/>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>{USERS[r.memberId]?.name}</div>
                <div style={{fontSize:12,color:"#9c8a7a",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:200}}>{r.classRecord}</div>
              </div>
              <span className="pill" style={{marginLeft:"auto",background:"#6b8f71",color:"#fff"}}>완료</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MESSAGES PAGE ────────────────────────────────────────────────────────────
function MessagesPage({user,messages,setMessages,msgWith,setMsgWith}){
  const [text,setText]=useState("");
  const contacts=user.role==="member"
    ?[USERS[MEMBERS.find(m=>m.id===user.id)?.instructor||"inst1"]]
    :user.role==="instructor"
    ?MEMBERS.filter(m=>m.instructor===user.id)
    :[...MEMBERS,...INSTRUCTORS].filter(u=>u.id!==user.id);
  const thread=msgWith?messages.filter(m=>(m.from===user.id&&m.to===msgWith.id)||(m.from===msgWith.id&&m.to===user.id)):[];
  function send(){
    if(!text.trim()||!msgWith)return;
    setMessages([...messages,{id:Date.now(),from:user.id,to:msgWith.id,text,time:new Date().toLocaleString("ko-KR"),read:false}]);
    setText("");
  }
  return(
    <div className="fade-in" style={{display:"flex",gap:16,height:"calc(100vh - 160px)",maxHeight:560}}>
      <div style={{width:200,flexShrink:0,background:"#fff",border:"1px solid #e8e2da",borderRadius:12,overflow:"auto"}}>
        <div style={{padding:"14px 16px",borderBottom:"1px solid #f0ebe4",fontSize:13,fontWeight:500,color:"#3d3028"}}>메시지</div>
        {contacts.map(c=>{
          const unread=messages.filter(m=>m.from===c.id&&m.to===user.id&&!m.read).length;
          return(
            <div key={c.id} onClick={()=>setMsgWith(c)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",cursor:"pointer",background:msgWith?.id===c.id?"#f0ebe4":"transparent",borderBottom:"1px solid #f9f7f5",transition:"background 0.1s"}}>
              <Avatar user={c} size={32}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.name}</div>
                <div style={{fontSize:11,color:"#9c8a7a"}}>{c.role==="instructor"?"강사":"회원"}</div>
              </div>
              {unread>0&&<div style={{background:"#e74c3c",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</div>}
            </div>
          );
        })}
      </div>
      <div style={{flex:1,background:"#fff",border:"1px solid #e8e2da",borderRadius:12,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {!msgWith?<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#b8a898",fontSize:14}}>대화 상대를 선택하세요</div>:(
          <>
            <div style={{padding:"14px 16px",borderBottom:"1px solid #f0ebe4",display:"flex",alignItems:"center",gap:10}}>
              <Avatar user={msgWith} size={32}/>
              <div style={{fontSize:14,fontWeight:500}}>{msgWith.name}</div>
            </div>
            <div style={{flex:1,overflow:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:10}}>
              {thread.length===0&&<div style={{textAlign:"center",color:"#b8a898",fontSize:13,marginTop:20}}>대화를 시작해보세요</div>}
              {thread.map(m=>{
                const isMine=m.from===user.id;
                return(
                  <div key={m.id} style={{display:"flex",justifyContent:isMine?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"75%",borderRadius:12,padding:"10px 14px",background:isMine?"#3d3028":"#f0ebe4",color:isMine?"#fff":"#2c2c2c",fontSize:14,lineHeight:1.5,borderBottomRightRadius:isMine?4:12,borderBottomLeftRadius:isMine?12:4}}>
                      <div>{m.text}</div>
                      <div style={{fontSize:10,marginTop:4,opacity:0.6,textAlign:isMine?"right":"left"}}>{m.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{padding:"12px 16px",borderTop:"1px solid #f0ebe4",display:"flex",gap:8}}>
              <input type="text" value={text} onChange={e=>setText(e.target.value)} placeholder="메시지 입력..." onKeyDown={e=>e.key==="Enter"&&send()} style={{flex:1}}/>
              <button className="btn btn-primary" onClick={send}>전송</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MEMBERS PAGE ─────────────────────────────────────────────────────────────
function MembersPage({user,records,goals,setPage,setFilterMember}){
  return(
    <div className="fade-in">
      <div style={{fontSize:20,fontWeight:500,marginBottom:20}}>회원 관리</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {MEMBERS.map(m=>{
          const mRec=records.filter(r=>r.memberId===m.id);
          const left=m.ticket-m.usedTicket;
          const mGoals=goals[m.id]||[];
          const doneGoals=mGoals.filter(g=>g.done).length;
          return(
            <div key={m.id} className="card" style={{padding:"18px 20px",cursor:"pointer"}} onClick={()=>{setFilterMember(m.id);setPage("records");}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <Avatar user={m} size={44}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:500}}>{m.name}</div>
                  <div style={{fontSize:12,color:"#9c8a7a"}}>{USERS[m.instructor]?.name}</div>
                </div>
                <span className="pill" style={{background:left<=3?"#fdf0f0":"#f0ebe4",color:left<=3?"#e74c3c":"#6b5f57"}}>수강권 {left}회</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,background:"#faf9f7",borderRadius:8,padding:"10px"}}>
                {[
                  {label:"총 수업",value:mRec.length+"회"},
                  {label:"목표 달성",value:`${doneGoals}/${mGoals.length}`},
                  {label:"평균 만족도",value:mRec.filter(r=>r.rating).length>0?"★ "+(mRec.filter(r=>r.rating).reduce((a,b)=>a+b.rating,0)/mRec.filter(r=>r.rating).length).toFixed(1):"—"},
                ].map(s=>(
                  <div key={s.label} style={{textAlign:"center"}}>
                    <div style={{fontSize:15,fontWeight:600,color:"#3d3028"}}>{s.value}</div>
                    <div style={{fontSize:10,color:"#b8a898"}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TICKETS PAGE ─────────────────────────────────────────────────────────────
function TicketsPage({user}){
  const members=user.role==="member"?[user]:MEMBERS;
  return(
    <div className="fade-in">
      <div style={{fontSize:20,fontWeight:500,marginBottom:20}}>수강권 관리</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {members.map(m=>{
          const left=m.ticket-m.usedTicket;
          const pct=Math.round((m.usedTicket/m.ticket)*100);
          return(
            <div key={m.id} style={{background:"#fff",border:"1px solid #e8e2da",borderRadius:12,padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <Avatar user={m} size={36}/>
                  <div style={{fontSize:16,fontWeight:500}}>{m.name}</div>
                </div>
                <span className="pill" style={{background:left<=3?"#e74c3c":"#3d3028",color:"#fff",padding:"5px 14px",fontSize:13}}>
                  잔여 {left}회
                </span>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,color:"#6b5f57"}}>사용 현황</span>
                  <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#9c8a7a"}}>{m.usedTicket} / {m.ticket}회</span>
                </div>
                <div style={{background:"#f0ebe4",borderRadius:6,height:10}}>
                  <div style={{background:left<=3?"#e74c3c":"#3d3028",height:"100%",borderRadius:6,width:pct+"%",transition:"width 0.6s ease"}}/>
                </div>
              </div>
              {left<=3&&(
                <div style={{background:"#fdf5f5",border:"1px solid #f0d0d0",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#c0392b",marginTop:12}}>
                  ⚠️ 수강권이 {left}회 남았어요. 재등록을 문의해주세요.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
function GlobalStyles(){
  return(
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;700&family=DM+Mono:wght@300;400&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:4px;height:4px;}
      ::-webkit-scrollbar-thumb{background:#c8bfb5;border-radius:2px;}
      .card{background:#fff;border:1px solid #e8e2da;border-radius:12px;transition:all 0.2s;cursor:pointer;}
      .card:hover{border-color:#b8a898;box-shadow:0 4px 20px rgba(0,0,0,0.07);transform:translateY(-2px);}
      .pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:0.05em;}
      .btn{padding:9px 18px;border-radius:8px;border:none;cursor:pointer;font-family:'Noto Serif KR',serif;font-size:13px;transition:all 0.15s;}
      .btn-primary{background:#3d3028;color:#fff;}
      .btn-primary:hover{background:#2a1f18;}
      .btn-ghost{background:transparent;border:1px solid #d4ccc4;color:#6b5f57;}
      .btn-ghost:hover{background:#f5f0eb;}
      textarea,input[type=text],input[type=date],input[type=password],select{font-family:'Noto Serif KR',serif;border:1px solid #e0d9d0;border-radius:8px;padding:9px 12px;font-size:14px;background:#faf9f7;color:#2c2c2c;outline:none;transition:border 0.15s;width:100%;}
      textarea:focus,input:focus,select:focus{border-color:#9c8a7a;}
      .section-label{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9c8a7a;font-family:'DM Mono',monospace;}
      .fade-in{animation:fadeIn 0.3s ease;}
      @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
      .tab{padding:5px 14px;border-radius:20px;border:none;background:transparent;cursor:pointer;font-family:'Noto Serif KR',serif;font-size:12px;color:#9c8a7a;transition:all 0.15s;white-space:nowrap;}
      .tab.active{background:#3d3028;color:#fff;}
    `}</style>
  );
}
