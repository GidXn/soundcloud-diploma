import React, { useState } from "react";
import { PLANS, PlanId, PromoResult, useSubscriptionStore } from "../../store/subscription_store.ts";
import "../../styles/subscription_page/layout.css";

const PROMO_MESSAGES: Record<Exclude<PromoResult, "ok">, string> = {
    empty: "Enter a promo code.",
    invalid: "This promo code is not valid.",
    used: "This promo code has already been used.",
};

const CheckIcon: React.FC = () => (
    <svg className="subscribe_check" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6.24 12.25 1.99 8l1.06-1.06 3.19 3.18 6.95-6.87L14.25 4.3z" fill="#6E6E6E" />
    </svg>
);

const SubscriptionPage: React.FC = () => {
    const plan = useSubscriptionStore((s) => s.plan);
    const expiresAt = useSubscriptionStore((s) => s.expiresAt);
    const activatePlan = useSubscriptionStore((s) => s.activatePlan);
    const applyPromoCode = useSubscriptionStore((s) => s.applyPromoCode);

    const [promo, setPromo] = useState("");
    const [promoStatus, setPromoStatus] = useState<{ ok: boolean; text: string } | null>(null);

    const onPromoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = applyPromoCode(promo);
        if (result === "ok") {
            setPromo("");
            setPromoStatus({ ok: true, text: "Promo code activated. Enjoy Allure PRO!" });
        } else {
            setPromoStatus({ ok: false, text: PROMO_MESSAGES[result] });
        }
    };

    const onSelect = (id: PlanId) => {
        if (id === plan) return;
        // Демо: реальна оплата не підключена, план активується одразу.
        activatePlan(id);
        setPromoStatus(null);
    };

    return (
        <main className="subscribe_page">
            <section className="subscribe_promo">
                <h1 className="subscribe_title">Activate your promo code</h1>
                <form className="subscribe_promo_form" onSubmit={onPromoSubmit}>
                    <input
                        className="subscribe_promo_input"
                        type="text"
                        placeholder="Promo code"
                        value={promo}
                        onChange={(e) => {
                            setPromo(e.target.value);
                            setPromoStatus(null);
                        }}
                        aria-label="Promo code"
                    />
                    <button type="submit" className="subscribe_btn subscribe_btn_continue">
                        Continue
                    </button>
                </form>
                {promoStatus && (
                    <p
                        className={`subscribe_promo_status ${promoStatus.ok ? "is_ok" : "is_error"}`}
                        role="status"
                    >
                        {promoStatus.text}
                    </p>
                )}
            </section>

            <section className="subscribe_plans">
                {PLANS.map((p) => {
                    const active = p.id === plan;
                    return (
                        <article
                            key={p.id}
                            className={`subscribe_card${p.popular ? " is_popular" : ""}`}
                        >
                            {p.popular && <span className="subscribe_ribbon">Popular</span>}
                            <div className="subscribe_card_inner">
                                <div className="subscribe_card_top">
                                    <h2 className="subscribe_card_title">{p.title}</h2>
                                    <ul className="subscribe_features">
                                        {p.features.map((f) => (
                                            <li key={f} className="subscribe_feature">
                                                <CheckIcon />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="subscribe_card_bottom">
                                    <span className="subscribe_price">{p.price}</span>
                                    <button
                                        type="button"
                                        className={`subscribe_btn subscribe_btn_plan${active ? " is_active" : ""}`}
                                        onClick={() => onSelect(p.id)}
                                        aria-pressed={active}
                                        title={
                                            active && expiresAt
                                                ? `Active until ${new Date(expiresAt).toLocaleDateString()}`
                                                : undefined
                                        }
                                    >
                                        {active ? "Actively" : "Buy"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>
        </main>
    );
};

export default SubscriptionPage;
