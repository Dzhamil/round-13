import { useCallback } from "react";
import { useLocation, useMatches, useNavigate } from "react-router-dom";

export type BackNavigationState = {
    backTo?: string;
};

type AppRouteHandle = {
    backTo?: string;
};

type RouteMatch = {
    handle?: unknown;
};

type ResolveBackNavigationTargetParams = {
    state: unknown;
    routeBackTo?: string;
    pathname: string;
    fallback?: string;
};

type UseBackNavigationOptions = {
    fallback?: string;
};

export function readBackTo(state: unknown): string | undefined {
    if (!state || typeof state !== "object") return undefined;

    const { backTo } = state as BackNavigationState;
    return typeof backTo === "string" ? backTo : undefined;
}

function normalizeBackTarget(target: string | undefined, pathname: string): string | undefined {
    const normalized = target?.trim();

    if (!normalized || normalized === pathname) {
        return undefined;
    }

    return normalized;
}

export function resolveBackNavigationTarget({
    state,
    routeBackTo,
    pathname,
    fallback,
}: ResolveBackNavigationTargetParams): string | undefined {
    return (
        normalizeBackTarget(readBackTo(state), pathname) ??
        normalizeBackTarget(routeBackTo, pathname) ??
        normalizeBackTarget(fallback, pathname)
    );
}

function readCurrentRouteBackTo(matches: RouteMatch[]): string | undefined {
    const currentMatch = matches[matches.length - 1];
    const handle = currentMatch?.handle as AppRouteHandle | undefined;

    return typeof handle?.backTo === "string" ? handle.backTo : undefined;
}

export function useBackNavigation(options: UseBackNavigationOptions = {}) {
    const navigate = useNavigate();
    const location = useLocation();
    const matches = useMatches();
    const routeBackTo = readCurrentRouteBackTo(matches);

    const target = resolveBackNavigationTarget({
        state: location.state,
        routeBackTo,
        pathname: location.pathname,
        fallback: options.fallback,
    });

    const navigateBack = useCallback(() => {
        if (!target) {
            return;
        }

        navigate(target, { replace: true });
    }, [navigate, target]);

    return {
        canNavigateBack: Boolean(target),
        navigateBack,
        target,
    };
}
