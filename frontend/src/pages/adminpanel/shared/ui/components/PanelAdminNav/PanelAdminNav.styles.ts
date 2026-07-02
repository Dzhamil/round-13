import styled from "styled-components";
import { NavLink } from "react-router-dom";

const TEXT = "var(--tg-theme-text-color, #e6edf3)";
const HINT = "var(--tg-theme-hint-color, rgba(230, 237, 243, 0.68))";

export const Root = styled.nav`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;
`;

export const Link = styled(NavLink)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);
    color: ${HINT};
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
    text-decoration: none;
    white-space: nowrap;

    &.active {
        border-color: rgba(90, 174, 255, 0.46);
        background: rgba(90, 174, 255, 0.14);
        color: ${TEXT};
    }
`;
