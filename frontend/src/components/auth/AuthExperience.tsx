"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Tilt from "../Tilt";
import { useUser } from "../UserProvider";
import { ApiError } from "@/lib/api";
import { fa } from "@/lib/format";
import { haptic } from "@/lib/haptic";
import {
    normalizePhone,
    toEn,
    toFa,
    userApi,
    type OtpInfo,
    type User,
} from "@/lib/user-api";

type Step = "phone" | "code" | "name" | "done";

const CODE_LENGTH = 5;
const SLABS = Array.from({ length: 14 }, (_, index) => index);
const TURN: Record<Step, number> = { phone: 0, code: -16, name: 12, done: 0 };
const BURST = Array.from({ length: 18 }, (_, index) => {
    const angle = (index / 18) * Math.PI * 2;
    const radius = 70 + (index % 3) * 26;
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        r: (index * 47) % 360,
        c: ["#ff6b5b", "#f4ede0", "#5b7bc0", "#ffb3a6"][index % 4],
        d: `${(index % 6) * 0.03}s`,
    };
});

function safeNext(raw: string | null): string {
    if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account";
    return raw;
}

function clock(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return toFa(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
}

function LockIcon({ size = 30 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="4.5" y="10.5" width="15" height="10" rx="3" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
            <circle cx="12" cy="15.5" r="1" fill="currentColor" />
        </svg>
    );
}

function ChatIcon({ size = 30 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 5h16v11H9l-5 4z" />
            <path d="M8 9.5h8M8 12.5h5" />
        </svg>
    );
}

function UserIcon({ size = 30 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8.5" r="3.8" />
            <path d="M4.5 20.5c1.2-3.6 4-5.2 7.5-5.2s6.3 1.6 7.5 5.2" />
        </svg>
    );
}

function CheckIcon({ size = 30 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path className="auth-check" d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
    );
}

function PhoneScene({ step, filled }: { step: Step; filled: number }) {
    const stage = useRef<HTMLDivElement>(null);
    const orbit = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function move(event: PointerEvent) {
            if (!orbit.current || event.pointerType === "touch") return;
            const x = event.clientX / window.innerWidth - 0.5;
            const y = event.clientY / window.innerHeight - 0.5;
            orbit.current.style.setProperty(
                "--ry",
                `${(x * 34).toFixed(2)}deg`,
            );
            orbit.current.style.setProperty(
                "--rx",
                `${(-y * 20).toFixed(2)}deg`,
            );
        }
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
    }, []);

    const icon =
        step === "done" ? (
            <CheckIcon />
        ) : step === "code" ? (
            <ChatIcon />
        ) : step === "name" ? (
            <UserIcon />
        ) : (
            <LockIcon />
        );

    return (
        <div ref={stage} className="auth-stage" aria-hidden="true">
            <div className="auth-stage-inner">
                <div ref={orbit} className="phone-orbit relative">
                    <div className="absolute left-1/2 top-1/2 -ml-[11rem] -mt-[11rem] h-[22rem] w-[22rem]">
                        <span className="ring3d inset-0" />
                    </div>
                    <div className="absolute left-1/2 top-1/2 -ml-[8rem] -mt-[8rem] h-[16rem] w-[16rem]">
                        <span
                            className="ring3d inset-0 opacity-60"
                            style={{
                                animationDirection: "reverse",
                                animationDuration: "18s",
                            }}
                        />
                    </div>

                    <span
                        className="orb"
                        style={{
                            ["--c" as string]: "#ff6b5b",
                            width: 34,
                            height: 34,
                            left: "-4rem",
                            top: "2rem",
                            transform: "translateZ(90px)",
                        }}
                    />
                    <span
                        className="orb"
                        style={{
                            ["--c" as string]: "#f4ede0",
                            width: 22,
                            height: 22,
                            right: "-3.2rem",
                            bottom: "5rem",
                            transform: "translateZ(110px)",
                            animationDelay: "-2s",
                        }}
                    />
                    <span
                        className="orb"
                        style={{
                            ["--c" as string]: "#5b7bc0",
                            width: 16,
                            height: 16,
                            right: "-2rem",
                            top: "4rem",
                            transform: "translateZ(40px)",
                            animationDelay: "-3.4s",
                        }}
                    />

                    <div
                        className="auth-turn"
                        style={{ transform: `rotateY(${TURN[step]}deg)` }}
                    >
                        <div className="phone-sway">
                            <div
                                className="phone"
                                style={{ width: "13.5rem", height: "27rem" }}
                            >
                                {SLABS.map((index) => (
                                    <span
                                        key={index}
                                        className="phone-slab"
                                        style={{
                                            transform: `translateZ(${-index * 1.7}px)`,
                                        }}
                                    />
                                ))}
                                <div className="phone-front">
                                    <div className="phone-screen">
                                        <div className="auth-screen">
                                            <span className="absolute left-1/2 top-2.5 h-5 w-16 -translate-x-1/2 rounded-full bg-black" />
                                            <span
                                                className="auth-lock"
                                                key={step}
                                            >
                                                <span className="animate-pop">
                                                    {icon}
                                                </span>
                                            </span>
                                            <p className="text-sm font-black text-[#f4ede0]">
                                                {step === "done"
                                                    ? "خوش آمدید"
                                                    : step === "code"
                                                      ? "کد تأیید"
                                                      : step === "name"
                                                        ? "معرفی شما"
                                                        : "ورود به نوا"}
                                            </p>
                                            <div className="auth-pin">
                                                {Array.from(
                                                    { length: CODE_LENGTH },
                                                    (_, index) => (
                                                        <i
                                                            key={index}
                                                            data-on={
                                                                step ===
                                                                    "done" ||
                                                                index < filled
                                                                    ? ""
                                                                    : undefined
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                            <span className="absolute bottom-5 h-1 w-20 rounded-full bg-white/30" />
                                        </div>
                                        <span className="phone-gloss" />
                                    </div>
                                </div>

                                <span
                                    className="auth-chip"
                                    style={{
                                        insetInlineStart: "-3.4rem",
                                        bottom: "6.5rem",
                                        transform: "translateZ(90px)",
                                    }}
                                >
                                    <span className="h-2 w-2 rounded-full bg-[#ff6b5b]" />
                                    کد یک‌بارمصرف
                                </span>
                                <span
                                    className="auth-chip"
                                    style={{
                                        insetInlineEnd: "-3.6rem",
                                        top: "5rem",
                                        transform: "translateZ(70px)",
                                        animationDelay: "-2.2s",
                                    }}
                                >
                                    <span className="h-2 w-2 rounded-full bg-[#2f4272]" />
                                    بدون رمز عبور
                                </span>
                            </div>
                        </div>
                    </div>

                    <span
                        className="absolute -bottom-12 left-1/2 h-8 w-40 -translate-x-1/2 rounded-full bg-black/60 blur-xl"
                        style={{
                            transform:
                                "translateX(-50%) translateZ(-60px) rotateX(75deg)",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function AuthExperience() {
    const router = useRouter();
    const params = useSearchParams();
    const next = safeNext(params.get("next"));
    const { user, ready, login, setUser, token } = useUser();

    const [step, setStep] = useState<Step>("phone");
    const [phoneInput, setPhoneInput] = useState("");
    const [info, setInfo] = useState<OtpInfo | null>(null);
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [shaking, setShaking] = useState(false);
    const [busy, setBusy] = useState(false);
    const [resendLeft, setResendLeft] = useState(0);
    const [expireLeft, setExpireLeft] = useState(0);
    const [sms, setSms] = useState(false);
    const [welcome, setWelcome] = useState("");

    const boxes = useRef<(HTMLInputElement | null)[]>([]);
    const nameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const sessionToken = useRef<string | null>(null);
    const submitted = useRef("");

    const phone = normalizePhone(phoneInput);
    const code = digits.join("");

    useEffect(() => {
        if (ready && user && step === "phone") router.replace(next);
    }, [ready, user, step, next, router]);

    useEffect(() => {
        if (step !== "code") return;
        const timer = setInterval(() => {
            setResendLeft((value) => Math.max(0, value - 1));
            setExpireLeft((value) => Math.max(0, value - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [step]);

    useEffect(() => {
        if (step === "phone") phoneRef.current?.focus();
        if (step === "code") setTimeout(() => boxes.current[0]?.focus(), 380);
        if (step === "name") setTimeout(() => nameRef.current?.focus(), 380);
    }, [step]);

    useEffect(() => {
        if (!info?.dev_code || step !== "code") return;
        const show = setTimeout(() => setSms(true), 900);
        const hide = setTimeout(() => setSms(false), 14000);
        return () => {
            clearTimeout(show);
            clearTimeout(hide);
        };
    }, [info, step]);

    const fail = useCallback((message: string) => {
        setError(message);
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        haptic([30, 40, 30]);
    }, []);

    async function sendCode(event?: React.FormEvent) {
        event?.preventDefault();
        if (!phone || busy) return;
        setBusy(true);
        setError("");
        try {
            const result = await userApi.requestOtp(phone);
            setInfo(result);
            setDigits(Array(CODE_LENGTH).fill(""));
            submitted.current = "";
            setResendLeft(result.resend_in);
            setExpireLeft(result.expires_in);
            setSms(false);
            setStep("code");
            haptic(16);
        } catch (e) {
            fail(
                e instanceof ApiError ? e.message : "ارتباط با سرور برقرار نشد",
            );
        } finally {
            setBusy(false);
        }
    }

    const verify = useCallback(
        async (value: string) => {
            if (!phone || busy || submitted.current === value) return;
            submitted.current = value;
            setBusy(true);
            setError("");
            try {
                const result = await userApi.verify(phone, value);
                sessionToken.current = result.token;
                login(result.token, result.user);
                haptic([14, 40, 14]);
                if (!result.user.name) {
                    setStep("name");
                } else {
                    finish(result.user);
                }
            } catch (e) {
                submitted.current = "";
                setDigits(Array(CODE_LENGTH).fill(""));
                boxes.current[0]?.focus();
                fail(
                    e instanceof ApiError
                        ? e.message
                        : "ارتباط با سرور برقرار نشد",
                );
            } finally {
                setBusy(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [phone, busy, login, fail],
    );

    useEffect(() => {
        if (
            step === "code" &&
            code.length === CODE_LENGTH &&
            !digits.includes("")
        )
            verify(code);
    }, [code, digits, step, verify]);

    function finish(finalUser: User) {
        setWelcome(finalUser.name);
        setStep("done");
        haptic([20, 60, 20, 60, 40]);
        setTimeout(() => router.replace(next), 1900);
    }

    async function saveName(event?: React.FormEvent) {
        event?.preventDefault();
        const clean = name.trim();
        const activeToken = sessionToken.current ?? token;
        if (clean.length < 2 || !activeToken || busy) return;
        setBusy(true);
        setError("");
        try {
            const updated = await userApi.updateName(activeToken, clean);
            setUser(updated);
            finish(updated);
        } catch (e) {
            fail(e instanceof ApiError ? e.message : "ذخیره نام انجام نشد");
        } finally {
            setBusy(false);
        }
    }

    function skipName() {
        const current = user ?? { id: 0, phone: phone ?? "", name: "" };
        finish(current);
    }

    function setDigit(index: number, raw: string) {
        const clean = toEn(raw).replace(/\D/g, "");
        if (!clean) {
            setDigits((current) =>
                current.map((d, i) => (i === index ? "" : d)),
            );
            return;
        }
        setDigits((current) => {
            const nextDigits = [...current];
            clean
                .slice(0, CODE_LENGTH - index)
                .split("")
                .forEach((char, offset) => {
                    nextDigits[index + offset] = char;
                });
            return nextDigits;
        });
        haptic(6);
        const target = Math.min(CODE_LENGTH - 1, index + clean.length);
        boxes.current[target]?.focus();
    }

    function keyDown(
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (event.key === "Backspace" && !digits[index] && index > 0) {
            boxes.current[index - 1]?.focus();
        }
        if (event.key === "ArrowLeft" && index < CODE_LENGTH - 1)
            boxes.current[index + 1]?.focus();
        if (event.key === "ArrowRight" && index > 0)
            boxes.current[index - 1]?.focus();
    }

    function autofill() {
        if (!info?.dev_code) return;
        setSms(false);
        setDigits(info.dev_code.split(""));
        haptic(10);
    }

    function backToPhone() {
        setStep("phone");
        setError("");
        setInfo(null);
        setDigits(Array(CODE_LENGTH).fill(""));
        submitted.current = "";
    }

    const filled = digits.filter(Boolean).length;
    const showPhoneError = phoneInput.length >= 11 && !phone;

    return (
        <div className="auth-scene">
            <div
                className="auth-blob"
                style={{
                    width: 360,
                    height: 360,
                    background: "#ff6b5b",
                    top: "-6rem",
                    insetInlineStart: "-6rem",
                }}
            />
            <div
                className="auth-blob"
                style={{
                    width: 300,
                    height: 300,
                    background: "#5b7bc0",
                    bottom: "8%",
                    insetInlineEnd: "-5rem",
                    animationDelay: "-6s",
                }}
            />
            <div className="auth-dots" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] overflow-hidden opacity-70">
                <div className="grid-floor" />
            </div>

            {sms && info?.dev_code && step === "code" && (
                <button
                    type="button"
                    onClick={autofill}
                    className="auth-sms text-start"
                >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8a7c] to-[#ff6b5b] text-sm font-black text-white">
                        N
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between text-[11px] font-bold text-[#4a5673]">
                            <span>پیامک · نوا موبایل</span>
                            <span>اکنون</span>
                        </span>
                        <span className="block truncate text-sm font-extrabold">
                            کد ورود شما: {toFa(info.dev_code)}
                        </span>
                        <span className="block text-[11px] font-bold text-[#f04a38]">
                            حالت آزمایشی؛ برای پر کردن خودکار لمس کنید
                        </span>
                    </span>
                </button>
            )}

            <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
                <div className="flex items-center justify-between py-2">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5"
                        aria-label="نوا موبایل"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f4272] via-[#14213d] to-[#ff6b5b] text-lg font-black text-[#f4ede0] ring-1 ring-white/20">
                            N
                        </span>
                        <span className="text-lg font-black tracking-tight">
                            نوا موبایل
                        </span>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white/85 ring-1 ring-white/15 transition hover:bg-white/20"
                    >
                        بازگشت به فروشگاه
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m15 6-6 6 6 6" />
                        </svg>
                    </Link>
                </div>

                <div className="grid flex-1 grid-cols-[minmax(0,1fr)] items-center gap-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
                    <section className="min-w-0 text-center lg:text-start">
                        <PhoneScene step={step} filled={filled} />
                        <div className="hidden lg:block">
                            <h1 className="text-extrude text-5xl font-black leading-[1.25]">
                                یک شماره،
                                <br />
                                یک دنیا خرید هوشمند
                            </h1>
                            <p className="mt-5 max-w-md text-base font-semibold leading-8 text-white/70">
                                با شماره موبایلت وارد شو؛ سفارش‌هایت را پیگیری
                                کن، علاقه‌مندی‌ها را نگه دار و پرداخت را سریع‌تر
                                تمام کن.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                {[
                                    "ارسال رایگان بالای ۵ میلیون",
                                    "گارانتی اصالت کالا",
                                    "پشتیبانی واقعی",
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white/85 ring-1 ring-white/15"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto w-full min-w-0 max-w-md lg:max-w-lg">
                        <Tilt max={6}>
                            <div
                                className={`auth-card ${shaking ? "auth-shake" : ""}`}
                            >
                                <div key={step} className="auth-step">
                                    {step === "phone" && (
                                        <form onSubmit={sendCode} noValidate>
                                            <h2 className="text-2xl font-black">
                                                ورود یا ثبت‌نام
                                            </h2>
                                            <p className="mt-2 text-sm font-semibold leading-7 text-white/65">
                                                شماره موبایلت را وارد کن تا کد
                                                تأیید برایت پیامک شود. اگر حساب
                                                نداری، خودکار ساخته می‌شود.
                                            </p>

                                            <label className="mt-6 block">
                                                <span className="mb-2 block text-xs font-extrabold text-white/70">
                                                    شماره موبایل
                                                </span>
                                                <span
                                                    className="auth-field"
                                                    data-bad={
                                                        showPhoneError
                                                            ? ""
                                                            : undefined
                                                    }
                                                >
                                                    <input
                                                        ref={phoneRef}
                                                        value={toFa(phoneInput)}
                                                        onChange={(event) =>
                                                            setPhoneInput(
                                                                toEn(
                                                                    event.target
                                                                        .value,
                                                                )
                                                                    .replace(
                                                                        /\D/g,
                                                                        "",
                                                                    )
                                                                    .slice(
                                                                        0,
                                                                        11,
                                                                    ),
                                                            )
                                                        }
                                                        inputMode="numeric"
                                                        autoComplete="tel"
                                                        enterKeyHint="go"
                                                        dir="ltr"
                                                        placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
                                                        aria-label="شماره موبایل"
                                                        className="auth-input text-start"
                                                    />
                                                    <span
                                                        className="auth-prefix"
                                                        dir="ltr"
                                                    >
                                                        <span
                                                            className="h-3 w-[18px] overflow-hidden rounded-[3px]"
                                                            style={{
                                                                background:
                                                                    "linear-gradient(#239f40 33%, #fff 33% 66%, #da0000 66%)",
                                                            }}
                                                        />
                                                        +۹۸
                                                    </span>
                                                </span>
                                            </label>

                                            {(error || showPhoneError) && (
                                                <p
                                                    role="alert"
                                                    className="mt-3 text-sm font-bold text-[#ffb3a6]"
                                                >
                                                    {error ||
                                                        "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد"}
                                                </p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={!phone || busy}
                                                className="auth-btn mt-6"
                                            >
                                                {busy ? (
                                                    <span className="auth-spinner" />
                                                ) : (
                                                    "دریافت کد تأیید"
                                                )}
                                            </button>

                                            <p className="mt-5 text-center text-[11.5px] font-semibold leading-6 text-white/50">
                                                با ورود، شرایط استفاده و حریم
                                                خصوصی نوا موبایل را می‌پذیری.
                                            </p>
                                        </form>
                                    )}

                                    {step === "code" && (
                                        <div>
                                            <h2 className="text-2xl font-black">
                                                کد تأیید را وارد کن
                                            </h2>
                                            <p className="mt-2 text-sm font-semibold leading-7 text-white/65">
                                                کد {fa(CODE_LENGTH)} رقمی به{" "}
                                                <span
                                                    dir="ltr"
                                                    className="font-black text-white"
                                                >
                                                    {toFa(phone ?? "")}
                                                </span>{" "}
                                                ارسال شد.
                                            </p>

                                            <div
                                                className="otp-row mt-7"
                                                dir="ltr"
                                            >
                                                {digits.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        ref={(element) => {
                                                            boxes.current[
                                                                index
                                                            ] = element;
                                                        }}
                                                        value={toFa(digit)}
                                                        onChange={(event) =>
                                                            setDigit(
                                                                index,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        onKeyDown={(event) =>
                                                            keyDown(
                                                                index,
                                                                event,
                                                            )
                                                        }
                                                        onFocus={(event) =>
                                                            event.target.select()
                                                        }
                                                        inputMode="numeric"
                                                        autoComplete={
                                                            index === 0
                                                                ? "one-time-code"
                                                                : "off"
                                                        }
                                                        maxLength={CODE_LENGTH}
                                                        aria-label={`رقم ${fa(index + 1)} کد تأیید`}
                                                        data-filled={
                                                            digit
                                                                ? ""
                                                                : undefined
                                                        }
                                                        disabled={busy}
                                                        className="otp-box"
                                                    />
                                                ))}
                                            </div>

                                            {error && (
                                                <p
                                                    role="alert"
                                                    className="mt-4 text-center text-sm font-bold text-[#ffb3a6]"
                                                >
                                                    {error}
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => verify(code)}
                                                disabled={
                                                    code.length < CODE_LENGTH ||
                                                    busy
                                                }
                                                className="auth-btn mt-6"
                                            >
                                                {busy ? (
                                                    <span className="auth-spinner" />
                                                ) : (
                                                    "تأیید و ورود"
                                                )}
                                            </button>

                                            <div className="mt-5 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={backToPhone}
                                                    className="auth-link"
                                                >
                                                    ویرایش شماره
                                                </button>
                                                {resendLeft > 0 ? (
                                                    <span className="text-xs font-bold text-white/55">
                                                        ارسال مجدد تا{" "}
                                                        {clock(resendLeft)}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            sendCode()
                                                        }
                                                        disabled={busy}
                                                        className="auth-link"
                                                    >
                                                        ارسال مجدد کد
                                                    </button>
                                                )}
                                            </div>
                                            {expireLeft === 0 && (
                                                <p className="mt-3 text-center text-xs font-bold text-[#ffb3a6]">
                                                    اعتبار کد تمام شد؛ کد جدید
                                                    بگیر.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {step === "name" && (
                                        <form onSubmit={saveName}>
                                            <h2 className="text-2xl font-black">
                                                خوش آمدی! اسمت چیه؟
                                            </h2>
                                            <p className="mt-2 text-sm font-semibold leading-7 text-white/65">
                                                حساب تو ساخته شد. برای شخصی‌سازی
                                                تجربه‌ات، نامت را بنویس.
                                            </p>
                                            <label className="mt-6 block">
                                                <span className="mb-2 block text-xs font-extrabold text-white/70">
                                                    نام و نام خانوادگی
                                                </span>
                                                <span className="auth-field">
                                                    <input
                                                        ref={nameRef}
                                                        value={name}
                                                        onChange={(event) =>
                                                            setName(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        autoComplete="name"
                                                        enterKeyHint="done"
                                                        maxLength={60}
                                                        placeholder="مثلاً آرتین رحیمی"
                                                        className="auth-input is-text"
                                                    />
                                                </span>
                                            </label>
                                            {error && (
                                                <p
                                                    role="alert"
                                                    className="mt-3 text-sm font-bold text-[#ffb3a6]"
                                                >
                                                    {error}
                                                </p>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={
                                                    name.trim().length < 2 ||
                                                    busy
                                                }
                                                className="auth-btn mt-6"
                                            >
                                                {busy ? (
                                                    <span className="auth-spinner" />
                                                ) : (
                                                    "ورود به نوا موبایل"
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={skipName}
                                                className="auth-link mx-auto mt-4 block"
                                            >
                                                فعلاً رد شو
                                            </button>
                                        </form>
                                    )}

                                    {step === "done" && (
                                        <div className="relative py-6 text-center">
                                            {BURST.map((piece, index) => (
                                                <span
                                                    key={index}
                                                    className="auth-burst"
                                                    style={{
                                                        ["--x" as string]: `${piece.x}px`,
                                                        ["--y" as string]: `${piece.y}px`,
                                                        ["--r" as string]: `${piece.r}deg`,
                                                        ["--c" as string]:
                                                            piece.c,
                                                        ["--d" as string]:
                                                            piece.d,
                                                    }}
                                                />
                                            ))}
                                            <span className="auth-lock mx-auto !h-20 !w-20">
                                                <CheckIcon size={38} />
                                            </span>
                                            <h2 className="mt-7 text-2xl font-black">
                                                {welcome
                                                    ? `${welcome} عزیز، خوش آمدی`
                                                    : "خوش آمدی"}
                                            </h2>
                                            <p className="mt-2 text-sm font-semibold text-white/65">
                                                در حال انتقال به حساب کاربری…
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Tilt>
                    </section>
                </div>
            </div>
        </div>
    );
}
