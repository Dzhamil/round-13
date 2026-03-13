import type { ProfileStatsView } from "../../../model/profile.stats";
import { profileStatsBlockStyles as s } from "./profileStatsBlock.styles";

type Props = ProfileStatsView;

export function ProfileStatsBlock({
                                      periodLabel,
                                      trainingsVisited,
                                      trainingsMissed,
                                      sparringsTotal,
                                      wins,
                                      defeats,
                                  }: Props) {
    return (
        <div style={s.root}>
            <div style={s.caption}>{periodLabel}</div>

            <div style={s.grid}>
                <div style={s.row}>
                    <span style={s.rowLabel}>Посещено тренировок</span>
                    <span style={s.rowValue}>{trainingsVisited}</span>
                </div>

                <div style={s.row}>
                    <span style={s.rowLabel}>Пропущено тренировок</span>
                    <span style={s.rowValue}>{trainingsMissed}</span>
                </div>

                <div style={s.row}>
                    <span style={s.rowLabel}>Всего спаррингов</span>
                    <span style={s.rowValue}>{sparringsTotal}</span>
                </div>

                <div style={s.row}>
                    <span style={s.rowLabel}>Победы</span>
                    <span style={s.rowValue}>{wins}</span>
                </div>

                <div style={s.row}>
                    <span style={s.rowLabel}>Поражения</span>
                    <span style={s.rowValue}>{defeats}</span>
                </div>
            </div>
        </div>
    );
}
