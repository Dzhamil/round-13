// frontend/src/app/router.tsx
import type { ReactNode } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";
import { AppShell } from "./AppShell";
import type { AppShellAppearance, AppShellContentVariant } from "./AppShell";
import { AuthPage } from "../features/auth/ui/AuthPage";
import { HomePage } from "../pages/home/HomePage";
import { SchedulePage } from "../pages/schedule/SchedulePage";
import { Schedule2Page } from "../pages/schedule2/Schedule2Page";
import { ShopPage } from "../pages/shop/ui/pages/ShopPage/ShopPage";
import {
    ProfileBoxerPotentialCharacteristicPage,
    ProfileBoxerPotentialTestPage,
    ProfilePage,
    CompleteProfilePage,
    UserProfilePage,
} from "../pages/profile/ui";
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

type PrivateShellProps = {
    shellTitle?: string;
    contentVariant?: AppShellContentVariant;
    appearance?: AppShellAppearance;
    backgroundImage?: string;
    resolveBackgroundImage?: (pathname: string, search: string) => string;
    children: ReactNode;
};

function PrivateShell({
    shellTitle,
    contentVariant,
    appearance,
    backgroundImage,
    resolveBackgroundImage,
    children,
}: PrivateShellProps) {
    const location = useLocation();
    const resolvedBackgroundImage = resolveBackgroundImage
        ? resolveBackgroundImage(location.pathname, location.search)
        : backgroundImage;

    return (
        <AuthGuard>
            <AppShell
                title={shellTitle}
                contentVariant={contentVariant}
                appearance={appearance}
                backgroundImage={resolvedBackgroundImage}
            >
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
            <PrivateShell contentVariant="fullBleed" appearance="home">
                <HomePage />
            </PrivateShell>
        ),
    },
    {
        path: "/schedule",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Афиша" backgroundImage="/images/page-backgrounds/events.png">
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
            <PrivateShell shellTitle="Тренировки" contentVariant="fullBleed" backgroundImage="/images/page-backgrounds/trainings-schedule.png">
                <TimetablePageContainer />
            </PrivateShell>
        ),
    },
    {
        path: "/schedule-2",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Расписание 2.0" backgroundImage="/images/page-backgrounds/schedule-2.png">
                <Schedule2Page />
            </PrivateShell>
        ),
    },
    {
        path: "/timetable/day/:date",
        handle: { backTo: "/timetable" },
        element: (
            <PrivateShell shellTitle="" contentVariant="fullBleed" backgroundImage="/images/page-backgrounds/trainings-schedule.png">
                <DayPageContainer />
            </PrivateShell>
        ),
    },
    {
        path: "/shop",
        handle: { backTo: "/" },
        element: (
            <PrivateShell
                shellTitle="Магазин"
                resolveBackgroundImage={(_pathname, search) => {
                    const tab = new URLSearchParams(search).get("tab");
                    if (tab === "merch") return "/images/page-backgrounds/merch.png";
                    if (tab === "requests" || tab === "history") return "/images/page-backgrounds/requests.png";
                    return "/images/page-backgrounds/shop.png";
                }}
            >
                <ShopPage />
            </PrivateShell>
        ),
    },
    {
        path: "/members",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Участники" backgroundImage="/images/page-backgrounds/members.png">
                <ClubMembersPage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Профиль" backgroundImage="/images/page-backgrounds/profile.png">
                <ProfilePage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile/boxer-potential/:characteristicKey",
        handle: { backTo: "/profile" },
        element: (
            <PrivateShell shellTitle="Профиль" backgroundImage="/images/page-backgrounds/boxer-potential.png">
                <ProfileBoxerPotentialCharacteristicPage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile/boxer-potential/tests/:testKey",
        handle: { backTo: "/profile" },
        element: (
            <PrivateShell shellTitle="Профиль" backgroundImage="/images/page-backgrounds/boxer-potential.png">
                <ProfileBoxerPotentialTestPage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile/complete",
        handle: { backTo: "/" },
        element: (
            <PrivateShell shellTitle="Профиль" backgroundImage="/images/page-backgrounds/profile.png">
                <CompleteProfilePage />
            </PrivateShell>
        ),
    },
    {
        path: "/profile/:id",
        handle: { backTo: "/members" },
        element: (
            <PrivateShell shellTitle="Профиль" backgroundImage="/images/page-backgrounds/rating-achievements.png">
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
            <PrivateShell shellTitle="О нас" backgroundImage="/images/page-backgrounds/about.png">
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
            <PrivateShell shellTitle="Магазин" backgroundImage="/images/page-backgrounds/shop.png">
                <ShopItemPage />
            </PrivateShell>
        ),
    },
    {
        path: "/shop/category/:categoryId",
        handle: { backTo: "/shop" },
        element: (
            <PrivateShell shellTitle="Магазин" backgroundImage="/images/page-backgrounds/merch.png">
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
