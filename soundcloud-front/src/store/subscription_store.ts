// Стан підписки PRO.
// Бекенд поки не має підписок, тому план зберігається лише в localStorage.
// Реальну оплату не підключено: "Buy" одразу активує план (демо-режим).
import { create } from "zustand";

export type PlanId = "free" | "1m" | "3m" | "6m" | "12m";

export interface IPlan {
    id: PlanId;
    title: string;
    months: number;
    price: string;
    features: string[];
    popular?: boolean;
}

const PRO_FEATURES = [
    "No ads.",
    "No download delay.",
    "No download restrictions.",
    "The unique status of Pro.",
];

export const PLANS: IPlan[] = [
    {
        id: "free",
        title: "WITHOUT PRO",
        months: 0,
        price: "FREE",
        features: [
            "Advertising is present.",
            "Delay for downloading.",
            "Download restrictions.",
            "Normal status.",
        ],
    },
    { id: "1m", title: "1 MONTH PRO", months: 1, price: "1.50 USD", features: PRO_FEATURES },
    { id: "3m", title: "3 MONTH PRO", months: 3, price: "4.50 USD", features: PRO_FEATURES, popular: true },
    { id: "6m", title: "6 MONTH PRO", months: 6, price: "8.0 USD", features: PRO_FEATURES },
    { id: "12m", title: "12 MONTH PRO", months: 12, price: "16.0 USD", features: PRO_FEATURES },
];

// Демо-промокоди: код -> скільки місяців PRO дає.
const PROMO_CODES: Record<string, PlanId> = {
    ALLURE: "1m",
    ALLURE2026: "3m",
};

const STORAGE_KEY = "allure_subscription";

interface IStoredSubscription {
    plan: PlanId;
    expiresAt: string | null;
    usedPromoCodes: string[];
}

const readStored = (): IStoredSubscription => {
    const empty: IStoredSubscription = { plan: "free", expiresAt: null, usedPromoCodes: [] };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return empty;
        const data = JSON.parse(raw) as IStoredSubscription;
        // План закінчився -> повертаємось на безкоштовний
        if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
            return { ...empty, usedPromoCodes: data.usedPromoCodes ?? [] };
        }
        return { ...empty, ...data };
    } catch {
        return empty;
    }
};

const save = (data: IStoredSubscription) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        /* localStorage недоступний — стан живе до перезавантаження */
    }
};

const addMonths = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString();
};

export type PromoResult = "ok" | "empty" | "invalid" | "used";

interface SubscriptionState extends IStoredSubscription {
    isPro: () => boolean;
    activatePlan: (plan: PlanId) => void;
    applyPromoCode: (code: string) => PromoResult;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    ...readStored(),

    isPro: () => get().plan !== "free",

    activatePlan: (plan) => {
        const months = PLANS.find((p) => p.id === plan)?.months ?? 0;
        const next: IStoredSubscription = {
            plan,
            expiresAt: months ? addMonths(months) : null,
            usedPromoCodes: get().usedPromoCodes,
        };
        save(next);
        set(next);
    },

    applyPromoCode: (raw) => {
        const code = raw.trim().toUpperCase();
        if (!code) return "empty";
        const plan = PROMO_CODES[code];
        if (!plan) return "invalid";
        if (get().usedPromoCodes.includes(code)) return "used";
        const months = PLANS.find((p) => p.id === plan)?.months ?? 0;
        const next: IStoredSubscription = {
            plan,
            expiresAt: addMonths(months),
            usedPromoCodes: [...get().usedPromoCodes, code],
        };
        save(next);
        set(next);
        return "ok";
    },
}));
