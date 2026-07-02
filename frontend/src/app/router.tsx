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
import {
    AboutContactsPage,
    AboutNewcomersPage,
    AboutOverviewPage,
    AboutPage,
    AboutRulesPage,
} from "../pages/about/AboutPage";
import { ShopItemPage } from "../pages/shop/ui/pages/ShopItemPage/ShopItemPage";
import { ShopCategoryPage } from "../pages/shop/ui/pages/ShopCategoryPage/ShopCategoryPage";
import AdminLoginPageContainer from "../pages/adminpanel/auth/ui/pages/AdminLoginPage.container";
import AdminUsersPageContainer from "../pages/adminpanel/users/ui/pages/AdminUsersPage.container";
import AdminErrorJournalPageContainer from "../pages/adminpanel/errorjournal/ui/pages/AdminErrorJournalPage.container";
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
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Афиша">
                <SchedulePage />
            </PrivateShell>
        ),
    },
    {
        path: "/timetable",
        handle: { backTo: "/" },
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
        handle: { backTo: "/timetable" },
        element: (
            <PrivateShell shellTitle="" contentVariant="fullBleed">
                <DayPageContainer />
            </PrivateShell>
        ),
    },
    {
        path: "/shop",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Магазин">
                <ShopPage />
            </PrivateShell>
        ),
    },
    {
        path: "/members",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Участники">
                <ClubMembersPage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Профиль">
                <ProfilePage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile/complete",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Профиль">
                <CompleteProfilePage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile/:id",
        handle: { backTo: "/members" },
        element: (
            <PrivateShell shellTitle="Профиль">
                <UserProfilePage />
            </PrivateShell>
        ),
    },
    {
        path: "/rules",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Правила">
                <RulesPage />
            </PrivateShell>
        ),
    },
    {
        path: "/admin/rules",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Админ · Правила">
                <AdminRulesPage />
            </PrivateShell>
        ),
    },
    {
        path: "/about",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="О нас">
                <AboutPage />
            </PrivateShell>
        ),
        children: [
            {
                index: true,
                handle: { backTo: "/" },
                element: <AboutOverviewPage />,
            },
            {
                path: "rules",
                handle: { backTo: "/" },
                element: <AboutRulesPage />,
            },
            {
                path: "contacts",
                handle: { backTo: "/" },
                element: <AboutContactsPage />,
            },
            {
                path: "newcomers",
                handle: { backTo: "/" },
                element: <AboutNewcomersPage />,
            },
        ],
    },
    {
        path: "/shop/:code",
        handle: { backTo: "/shop" },
        element: (
            <PrivateShell shellTitle="Магазин">
                <ShopItemPage />
            </PrivateShell>
        ),
    },
    {
        path: "/shop/category/:categoryId",
        handle: { backTo: "/shop" },
        element: (
            <PrivateShell shellTitle="Магазин">
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
        path: "/admin/error-journal",
        element: (
            <AdminGuard>
                <AdminErrorJournalPageContainer />
            </AdminGuard>
        ),
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);
