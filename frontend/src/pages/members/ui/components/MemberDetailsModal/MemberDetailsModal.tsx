// frontend/src/pages/members/ui/components/MemberDetailsModal/MemberDetailsModal.tsx
import {useEffect,useMemo,useState} from "react";
import type {MemberListItem,MemberDetails} from "../../../model/members.types";
import {getMemberDetails,addStudent,removeStudent,updateStudentRemainingTrainings} from "../../../api/members.api";
import {
    Backdrop,
    ModalContainer,
    CloseButton,
    Section,
    SectionTitle,
    AboutBlock,
    StatRow,
    ErrorText,
    LoadingText,
    ActionButton,
    ControlsRow,
    NumberInput,
    SecondaryButton,
    HintText,
} from "./memberDetailsModal.styles";
import {MiniUserCard} from "../MiniUserCard/MiniUserCard";
import {useIsCoach} from "../../../model/useIsCoach";

type Props={
    open:boolean;
    member:MemberListItem|null;
    onClose:()=>void;
    onStudentChanged?:()=>void;
};

function buildPreviewMember(member:MemberListItem,details:MemberDetails|null):MemberListItem{
    if(!details){return member;}
    return{
        id:details.id,
        nickname:details.nickname,
        phone:details.phone,
        avatarUrl:details.avatarUrl,
        points:details.points,
        statusLabel:details.statusLabel,
        roleCode:details.roleCode,
        remainingTrainings:details.remainingTrainings
    };
}

export function MemberDetailsModal({open,member,onClose,onStudentChanged}:Props){

    const[details,setDetails]=useState<MemberDetails|null>(null);
    const[loading,setLoading]=useState(false);
    const[error,setError]=useState<string|null>(null);
    const[remainingDraft,setRemainingDraft]=useState("");
    const[savingRemaining,setSavingRemaining]=useState(false);

    const isCoach=useIsCoach();

    useEffect(()=>{
        if(!open){
            document.body.style.overflow="auto";
            return;
        }
        document.body.style.overflow="hidden";
        return()=>{document.body.style.overflow="auto";};
    },[open]);

    useEffect(()=>{
        if(!open||!member){
            setDetails(null);
            setError(null);
            setLoading(false);
            return;
        }
        let alive=true;
        setLoading(true);
        setError(null);
        setDetails(null);

        getMemberDetails(member.id)
            .then((res)=>{
                if(!alive)return;
                setDetails(res);
            })
            .catch((e:any)=>{
                if(!alive)return;
                setError(e?.message??"Не удалось загрузить карточку участника");
            })
            .finally(()=>{
                if(!alive)return;
                setLoading(false);
            });

        return()=>{alive=false;};
    },[open,member]);

    useEffect(()=>{
        if(!details?.myStudent){
            setRemainingDraft("");
            return;
        }
        setRemainingDraft(String(details.remainingTrainings ?? 0));
    },[details?.id,details?.myStudent,details?.remainingTrainings]);

    const preview=useMemo(()=>{
        if(!member)return null;
        return buildPreviewMember(member,details);
    },[member,details]);

    async function handleAddStudent(){
        if(!details)return;
        try{
            await addStudent(details.id);
            setDetails({...details,myStudent:true,remainingTrainings:0});
            onStudentChanged?.();
        }catch(e:any){
            setError(e?.message??"Не удалось добавить ученика");
        }
    }

    async function handleRemoveStudent(){
        if(!details)return;
        try{
            await removeStudent(details.id);
            setDetails({...details,myStudent:false,remainingTrainings:null});
            onStudentChanged?.();
        }catch(e:any){
            setError(e?.message??"Не удалось удалить ученика");
        }
    }

    async function handleSaveRemainingTrainings(){
        if(!details||!details.myStudent){
            return;
        }

        const parsed=Number.parseInt(remainingDraft,10);
        if(!Number.isInteger(parsed)||parsed<0){
            setError("Остаток тренировок должен быть целым числом от 0");
            return;
        }

        try{
            setSavingRemaining(true);
            setError(null);
            await updateStudentRemainingTrainings(details.id,parsed);
            setDetails({...details,remainingTrainings:parsed});
            onStudentChanged?.();
        }catch(e:any){
            setError(e?.message??"Не удалось обновить остаток тренировок");
        }finally{
            setSavingRemaining(false);
        }
    }

    if(!open||!member||!preview){return null;}

    return(
        <Backdrop onClick={onClose}>
            <ModalContainer onClick={(e)=>e.stopPropagation()}>
                <CloseButton onClick={onClose}>✕</CloseButton>
                <MiniUserCard member={preview}/>
                {loading&&<LoadingText>Загрузка…</LoadingText>}
                {error&&<ErrorText>{error}</ErrorText>}

                {!loading&&!error&&details&&(
                    <>

                        <Section>
                            <SectionTitle>Статистика</SectionTitle>

                            <StatRow>
                                <span>Стаж</span>
                                <span>{details.tenureMonths ?? 0} мес.</span>
                            </StatRow>

                            <StatRow>
                                <span>Очки</span>
                                <span>{details.points ?? 0}</span>
                            </StatRow>

                            {details.roleCode !== "COACH" && details.roleCode !== "ADMIN" && (
                                <StatRow>
                                    <span>Посещено тренировок</span>
                                    <span>{details.trainingsAttendedCount ?? 0}</span>
                                </StatRow>
                            )}

                            {details.remainingTrainings != null && (
                                <StatRow>
                                    <span>Осталось тренировок</span>
                                    <span>{details.remainingTrainings}</span>
                                </StatRow>
                            )}

                            {details.roleCode === "COACH" && (
                                <StatRow>
                                    <span>Проведено тренировок</span>
                                    <span>{details.trainingsConductedCount ?? 0}</span>
                                </StatRow>
                            )}

                            <StatRow>
                                <span>Боёв</span>
                                <span>{details.fightsCount ?? 0}</span>
                            </StatRow>

                            <StatRow>
                                <span>Побед</span>
                                <span>{details.winsCount ?? 0}</span>
                            </StatRow>

                            {details.roleCode === "COACH" && (
                                <StatRow>
                                    <span>Учеников</span>
                                    <span>{details.studentsCount ?? 0}</span>
                                </StatRow>
                            )}

                        </Section>

                        {details.aboutMe&&(
                            <Section>
                                <SectionTitle>О себе</SectionTitle>
                                <AboutBlock>{details.aboutMe}</AboutBlock>
                            </Section>
                        )}

                        {isCoach&&details.myStudent&&details.roleCode!=="COACH"&&details.roleCode!=="ADMIN"&&(
                            <Section>
                                <SectionTitle>Остаток тренировок</SectionTitle>
                                <ControlsRow>
                                    <NumberInput
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={remainingDraft}
                                        onChange={(e)=>setRemainingDraft(e.target.value)}
                                        inputMode="numeric"
                                    />
                                    <SecondaryButton
                                        type="button"
                                        onClick={handleSaveRemainingTrainings}
                                        disabled={savingRemaining||remainingDraft===String(details.remainingTrainings ?? 0)}
                                    >
                                        {savingRemaining?"Сохранение…":"Сохранить"}
                                    </SecondaryButton>
                                </ControlsRow>
                                <HintText>Тренер может вручную обновить остаток для ученика. Историю изменений добавим следующей итерацией.</HintText>
                            </Section>
                        )}

                        {isCoach&&details.roleCode!=="COACH"&&details.roleCode!=="ADMIN"&&(
                            <Section>
                                {details.myStudent?(
                                    <ActionButton $danger onClick={handleRemoveStudent}>
                                        Убрать из учеников
                                    </ActionButton>
                                ):(
                                    <ActionButton onClick={handleAddStudent}>
                                        Добавить в ученики
                                    </ActionButton>
                                )}
                            </Section>
                        )}

                    </>
                )}

            </ModalContainer>
        </Backdrop>
    );
}
