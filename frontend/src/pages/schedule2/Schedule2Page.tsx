import { useCallback, useEffect, useMemo, useState } from "react";
import { loadTraining, loadTrainings, saveAttendance, type Participant, type Training, type TrainingDetail } from "./schedule2.api";
import styles from "./Schedule2Page.module.css";
import { IncomingVerification } from "./IncomingVerification";

type View="day"|"week"|"month";
const typeNames:Record<string,string>={GROUP:"Групповая",PERSONAL:"Персональная",OPEN:"Открытая"};
const iso=(date:Date)=>date.toISOString().slice(0,10);
const localDate=(value:string)=>value.slice(0,10);
const monday=(date:Date)=>{const d=new Date(date);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d};
const addDays=(date:Date,n:number)=>{const d=new Date(date);d.setDate(d.getDate()+n);return d};

export function Schedule2Page() {
    const [view,setView]=useState<View>("day");
    const [selected,setSelected]=useState(iso(new Date()));
    const [trainings,setTrainings]=useState<Training[]>([]);
    const [detail,setDetail]=useState<TrainingDetail|null>(null);
    const [draft,setDraft]=useState<Participant[]>([]);
    const [loading,setLoading]=useState(false);
    const [saving,setSaving]=useState(false);
    const [error,setError]=useState<string|null>(null);
    const range=useMemo(()=>{const current=new Date(selected+"T12:00:00");if(view==="day")return [selected,selected];if(view==="week"){const start=monday(current);return [iso(start),iso(addDays(start,6))]}return [iso(new Date(current.getFullYear(),current.getMonth(),1,12)),iso(new Date(current.getFullYear(),current.getMonth()+1,0,12))]},[selected,view]);
    const refresh=useCallback(async()=>{setLoading(true);setError(null);try{setTrainings(await loadTrainings(range[0],range[1]))}catch{setError("Не удалось загрузить расписание") }finally{setLoading(false)}},[range]);
    useEffect(()=>{void refresh()},[refresh]);
    async function open(item:Training){setLoading(true);try{const value=await loadTraining(item.id);setDetail(value);setDraft(value.participants.map(p=>({...p})))}catch{setError("Не удалось открыть тренировку")}finally{setLoading(false)}}
    function toggle(id:string){setDraft(list=>list.map(p=>p.participationId===id?{...p,attendanceStatus:p.attendanceStatus==="PRESENT"?"ABSENT":"PRESENT"}:p))}
    async function apply(){if(!detail)return;setSaving(true);setError(null);try{const value=await saveAttendance(detail.training.id,draft);setDetail(value);setDraft(value.participants.map(p=>({...p})))}catch{setError("Не удалось сохранить посещаемость. Обновите тренировку и повторите.")}finally{setSaving(false)}}
    if(detail)return <TrainingDetails detail={detail} draft={draft} saving={saving} error={error} onBack={()=>{setDetail(null);void refresh()}} onToggle={toggle} onApply={apply}/>;
    return <section className={styles.page} aria-labelledby="schedule-2-title">
        <h1 id="schedule-2-title" className={styles.title}>Расписание 2.0</h1>
        <IncomingVerification />
        <div className={styles.tabs} role="tablist">{(["day","week","month"] as View[]).map(v=><button key={v} className={view===v?styles.activeTab:""} onClick={()=>setView(v)}>{v==="day"?"День":v==="week"?"Неделя":"Месяц"}</button>)}</div>
        <input className={styles.dateInput} type={view==="month"?"month":"date"} value={view==="month"?selected.slice(0,7):selected} onChange={e=>setSelected(view==="month"?e.target.value+"-01":e.target.value)}/>
        {error&&<p className={styles.error}>{error}</p>}{loading&&<p>Загрузка…</p>}
        {!loading&&view==="day"&&<Day date={selected} trainings={trainings} onOpen={open}/>}
        {!loading&&view==="week"&&<Week selected={selected} trainings={trainings} onSelect={date=>{setSelected(date);setView("day")}}/>}
        {!loading&&view==="month"&&<Month selected={selected} trainings={trainings} onSelect={date=>{setSelected(date);setView("day")}}/>}
    </section>;
}

function Day({date,trainings,onOpen}:{date:string;trainings:Training[];onOpen:(t:Training)=>void}){const list=trainings.filter(t=>localDate(t.startTime)===date);return <div className={styles.list}>{list.length===0&&<p className={styles.empty}>На этот день тренировок нет</p>}{list.map(t=><button className={styles.training} key={t.id} onClick={()=>onOpen(t)}><strong>{new Date(t.startTime).toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"})}–{new Date(t.endTime).toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"})}</strong><span>{t.title} · {typeNames[t.type]??t.type}</span><span>{t.location||"Место не указано"} · {t.participantsCount} уч.</span></button>)}</div>}
function Week({selected,trainings,onSelect}:{selected:string;trainings:Training[];onSelect:(d:string)=>void}){const start=monday(new Date(selected+"T12:00:00"));return <div className={styles.calendarList}>{Array.from({length:7},(_,i)=>addDays(start,i)).map(d=>{const key=iso(d),count=trainings.filter(t=>localDate(t.startTime)===key).length;return <button key={key} onClick={()=>onSelect(key)}><span>{d.toLocaleDateString("ru",{weekday:"long",day:"numeric",month:"short"})}</span><b>{count>0?`● ${count}`:"—"}</b></button>})}</div>}
function Month({selected,trainings,onSelect}:{selected:string;trainings:Training[];onSelect:(d:string)=>void}){const base=new Date(selected+"T12:00:00"),first=new Date(base.getFullYear(),base.getMonth(),1,12),offset=(first.getDay()+6)%7,days=new Date(base.getFullYear(),base.getMonth()+1,0).getDate();return <div className={styles.month}><div className={styles.weekdays}>{["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(x=><span key={x}>{x}</span>)}</div><div className={styles.grid}>{Array.from({length:offset},(_,i)=><span key={"e"+i}/>)}{Array.from({length:days},(_,i)=>{const d=new Date(base.getFullYear(),base.getMonth(),i+1,12),key=iso(d),count=trainings.filter(t=>localDate(t.startTime)===key).length;return <button className={count?styles.hasTraining:""} key={key} onClick={()=>onSelect(key)}>{i+1}{count>0&&<small>{count}</small>}</button>})}</div></div>}
function TrainingDetails({detail,draft,saving,error,onBack,onToggle,onApply}:{detail:TrainingDetail;draft:Participant[];saving:boolean;error:string|null;onBack:()=>void;onToggle:(id:string)=>void;onApply:()=>void}){const t=detail.training,dirty=draft.some((p,i)=>p.attendanceStatus!==detail.participants[i]?.attendanceStatus);return <section className={styles.page}><button className={styles.back} onClick={onBack}>← К расписанию</button><div className={styles.meta}><h1>{t.title}</h1><p>{new Date(t.startTime).toLocaleDateString("ru")} · {new Date(t.startTime).toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"})}–{new Date(t.endTime).toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"})}</p><p>{typeNames[t.type]??t.type} · {t.location||"Место не указано"} · {t.trainerName}</p><p>{t.participantsCount} участников</p></div><h2>Посещаемость</h2><div className={styles.students}>{draft.map(p=><button key={p.participationId} aria-pressed={p.attendanceStatus==="PRESENT"} className={p.attendanceStatus==="PRESENT"?styles.present:""} onClick={()=>onToggle(p.participationId)}><span>{p.studentName}</span><b>{p.attendanceStatus==="PRESENT"?"✓ Был":"Не был"}</b></button>)}</div>{error&&<p className={styles.error}>{error}</p>}<button className={styles.apply} disabled={!dirty||saving} onClick={onApply}>{saving?"Сохранение…":"Подтвердить посещаемость"}</button></section>}
