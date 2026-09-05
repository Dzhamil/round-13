import { http } from "../../shared/api/http";

export type AttendanceStatus = "ABSENT" | "PRESENT";
export type Training = { id:string; title:string; type:string; startTime:string; endTime:string; timezone:string; location:string|null; trainerName:string; participantsCount:number; version:number };
export type Participant = { participationId:string; studentId:string; studentName:string; attendanceStatus:AttendanceStatus; comment:string|null; version:number };
export type TrainingDetail = { training:Training; participants:Participant[] };

export async function loadTrainings(from:string,to:string):Promise<Training[]> {
    return (await http.get<Training[]>("/schedule2/trainings",{params:{from,to}})).data;
}
export async function loadTraining(id:string):Promise<TrainingDetail> {
    return (await http.get<TrainingDetail>(`/schedule2/trainings/${id}`)).data;
}
export async function saveAttendance(id:string, participants:Participant[]):Promise<TrainingDetail> {
    return (await http.put<TrainingDetail>(`/schedule2/trainings/${id}/attendance`,{participants:participants.map(p=>({participationId:p.participationId,status:p.attendanceStatus,comment:p.comment,version:p.version}))})).data;
}
