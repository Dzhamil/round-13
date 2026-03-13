// frontend/src/app/router.tsx
import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";
import { AppShell } from "./AppShell";
import type { AppShellContentVariant } from "./AppShell";
import { AuthPage } from "../features/auth/ui/AuthPage";
import { HomePage } from "../pages/home/HomePage";
import { SchedulePage } from "../pages/schedule/SchedulePage";
import { ShopPage } from "../pages/shop/ui/pages/ShopPage/ShopPage";
import { ProfilePage, CompleteProfilePage, UserProfilePage } from "../pages/profile/ui";
import { RulesPage } from "../pages/rules/RulesPage";
import { AdminRulesPage } from "../pages/rules/admin";
import { AboutPage } from "../pages/about/AboutPage";
import { ShopItemPage } from "../pages/shop/ui/pages/ShopItemPage/ShopItemPage";
import { ShopCategoryPage } from "../pages/shop/ui/pages/ShopCategoryPage/ShopCategoryPage";
import AdminLoginPageContainer from "../pages/adminpanel/auth/ui/pages/AdminLoginPage.container";
import AdminUsersPageContainer from "../pages/adminpanel/users/ui/pages/AdminUsersPage.container";
import AdminGuard from "../pages/adminpanel/shared/ui/AdminGuard/AdminGuard";
import { ClubMembersPage } from "../pages/members/ui/pages/ClubMembersPage";
import { TimetablePageContainer } from "../pages/timetable/ui/pages/TimetablePage/TimetablePage.container";
import { DayPageContainer } from "../pages/timetable/ui/pages/DayPage/DayPage.container";

function PrivateShell({ shellTitle, contentVariant, children }: { shellTitle?: string; contentVariant?: AppShellContentVariant; children: ReactNode; }) {
    return (
        <AuthGuard>
            <AppShell title={shellTitle} contentVariant={contentVariant}>
                {children}
            </AppShell>
        </AuthGuard>
    );
}

export const router = createBrowserRouter([
    {
        path: "/auth",
        element: <AuthPage />,
    },
    {
        path: "/",
        element: (
            <PrivateShell contentVariant="fullBleed">
                <HomePage />
            </PrivateShell>
        ),
    },
    {
        path: "/schedule",
        element: (
            <PrivateShell shellTitle="Афиша">
                <SchedulePage />
            </PrivateShell>
        ),
    },
    {
        path: "/timetable",
        element: (
            /*
             * Страница тренировок (бывшее расписание) показывает календарь месяца
             * и дневной/недельный вид. Заменяем заголовок «Расписание» на
             * «Тренировки». Раздел Афиша остаётся без изменений.
             */
            <PrivateShell shellTitle="Тренировки" contentVariant="fullBleed">
                <TimetablePageContainer />
            </PrivateShell>
        ),
    },
    {
        path: "/timetable/day/:date",
        element: (
            <PrivateShell shellTitle="" contentVariant="fullBleed">
                <DayPageContainer />
            </PrivateShell>
        ),
    },
    {
        path: "/shop",
        element: (
            <PrivateShell shellTitle="Магазин">
                <ShopPage />
            </PrivateShell>
        ),
    },
    {
        path: "/members",
        element: (
            <PrivateShell shellTitle="Участники">
                <ClubMembersPage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile",
        element: (
            <PrivateShell shellTitle="Профиль">
                <ProfilePage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile/complete",
        element: (
            <PrivateShell shellTitle="Профиль">
                <CompleteProfilePage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile/:id",
        element: (
            <PrivateShell shellTitle="Профиль">
                <UserProfilePage />
            </PrivateShell>
        ),
    },
    {
        path: "/rules",
        element: (
            <PrivateShell shellTitle="Правила">
                <RulesPage />
            </PrivateShell>
        ),
    },
    {
        path: "/admin/rules",
        element: (
            <PrivateShell shellTitle="Админ · Правила">
                <AdminRulesPage />
            </PrivateShell>
        ),
    },
    {
        path: "/about",
        element: (
            <PrivateShell shellTitle="О нас">
                <AboutPage />
            </PrivateShell>
        ),
    },
    {
        path: "/shop/:code",
        element: (
            <PrivateShell shellTitle="Магазин">
                <ShopItemPage />
            </PrivateShell>
        ),
    },
    {
        path: "/shop/category/:categoryId",
        element: (
            <PrivateShell>
                <ShopCategoryPage />
            </PrivateShell>
        ),
    },
    {
        path: "/admin",
        element: <AdminLoginPageContainer />,
    },
    {
        path: "/panel",
        element: <AdminLoginPageContainer />,
    },
    {
        path: "/admin/login",
        element: <AdminLoginPageContainer />,
    },
    {
        path: "/admin/users",
        element: (
            <AdminGuard>
                <AdminUsersPageContainer />
            </AdminGuard>
        ),
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);