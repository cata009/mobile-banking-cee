import { useEffect, useState } from "react";
import { AppIcon } from "@/app/components/icons";
import advisorImage from "figma:asset/e693dd6eed452da6c4cda0e69dbdd3f45039c9f2.png";

export type PrimeMailApp = "gmail" | "mail";

export interface PrimeMailPreferences {
  askEveryTime: boolean;
  preferredApp: PrimeMailApp | null;
}

type InitialAction = "call" | "email";
type FlowScreen = "call-confirm" | "call-active" | "email-chooser" | "email-compose" | "email-sent";

interface PrimeContactActionFlowProps {
  initialAction: InitialAction;
  advisorName: string;
  phoneNumber: string;
  emailAddress: string;
  mailPreferences: PrimeMailPreferences;
  onMailPreferencesChange: (preferences: PrimeMailPreferences) => void;
  onClose: () => void;
  text: (key: string, fallback: string) => string;
}

export function PrimeContactActionFlow({
  initialAction,
  advisorName,
  phoneNumber,
  emailAddress,
  mailPreferences,
  onMailPreferencesChange,
  onClose,
  text,
}: PrimeContactActionFlowProps) {
  const initialScreen: FlowScreen = initialAction === "call"
    ? "call-confirm"
    : !mailPreferences.askEveryTime && mailPreferences.preferredApp
      ? "email-compose"
      : "email-chooser";
  const [screen, setScreen] = useState<FlowScreen>(initialScreen);
  const [selectedMailApp, setSelectedMailApp] = useState<PrimeMailApp>(mailPreferences.preferredApp ?? "gmail");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [callConnected, setCallConnected] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [enabledCallControls, setEnabledCallControls] = useState<string[]>([]);
  const [keypadOpen, setKeypadOpen] = useState(false);

  useEffect(() => {
    if (screen !== "call-active") return;
    const connectionTimer = window.setTimeout(() => setCallConnected(true), 1200);
    return () => window.clearTimeout(connectionTimer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "call-active" || !callConnected) return;
    const interval = window.setInterval(() => setCallSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, [screen, callConnected]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const formatCallTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const chooseMailApp = (app: PrimeMailApp) => {
    setSelectedMailApp(app);
    if (!mailPreferences.askEveryTime) onMailPreferencesChange({ askEveryTime: false, preferredApp: app });
    setScreen("email-compose");
  };
  const toggleMailPreference = () => onMailPreferencesChange({
    ...mailPreferences,
    askEveryTime: !mailPreferences.askEveryTime,
  });
  const toggleCallControl = (control: string) => {
    setEnabledCallControls((current) => current.includes(control)
      ? current.filter((entry) => entry !== control)
      : [...current, control]);
  };

  if (screen === "call-confirm") {
    return (
      <div className="absolute inset-0 z-50 grid place-items-center bg-black/45 px-[24px]" data-contact-action-simulation="call-confirm">
        <button type="button" aria-label={text("close", "Close")} className="absolute inset-0" onClick={onClose} />
        <section role="dialog" aria-modal="true" aria-labelledby="call-confirm-title" className="relative w-full max-w-[320px] overflow-hidden rounded-[16px] bg-[#f4f4f8] text-center text-[#17171a] shadow-[0_18px_48px_rgb(0_0_0_/_0.32)]">
          <div className="px-[24px] pb-[20px] pt-[24px]">
            <h2 id="call-confirm-title" className="uc-type-n4-strong text-[18px] leading-[22px]">{text("prime.advisor.callConfirmationTitle", `Call ${advisorName}?`)}</h2>
            <p className="mt-[8px] uc-type-n5 text-[#45454a]">{text("prime.advisor.callConfirmationBody", `Call ${phoneNumber} using your phone?`)}</p>
          </div>
          <div className="grid grid-cols-2 border-t border-[#d5d5db]">
            <button type="button" onClick={onClose} className="h-[50px] border-r border-[#d5d5db] uc-type-n4 text-[#007aff]">{text("prime.advisor.cancel", "Cancel")}</button>
            <button type="button" onClick={() => setScreen("call-active")} className="h-[50px] uc-type-n4-strong text-[#007aff]">{text("prime.advisor.call", "Call")}</button>
          </div>
        </section>
      </div>
    );
  }

  if (screen === "call-active") {
    const callControls = [
      { id: "mute", label: text("prime.advisor.mute", "Mute"), icon: "mic" },
      { id: "keypad", label: text("prime.advisor.keypad", "Keypad"), icon: "keypad" },
      { id: "speaker", label: text("prime.advisor.speaker", "Speaker"), icon: "speaker" },
      { id: "add-call", label: text("prime.advisor.addCall", "Add call"), icon: "add" },
      { id: "video", label: text("prime.advisor.video", "Video"), icon: "video" },
      { id: "contacts", label: text("prime.advisor.contacts", "Contacts"), icon: "person" },
    ];
    return (
      <div role="dialog" aria-modal="true" aria-labelledby="call-screen-title" className="absolute inset-0 z-50 flex flex-col bg-[#151518] px-[28px] text-white" data-contact-action-simulation="call-active" style={{ paddingTop: "calc(var(--uc-phone-top-reserve, 54px) + 24px)", paddingBottom: "calc(var(--uc-phone-bottom-reserve, 34px) + 20px)" }}>
        <div className="flex-1">
          <div className="flex flex-col items-center pt-[36px] text-center">
            <img src={advisorImage} alt={advisorName} className="size-[104px] rounded-full border border-white/20 object-cover" />
            <h1 id="call-screen-title" className="mt-[22px] uc-type-h1 text-white">{advisorName}</h1>
            <p className="mt-[8px] uc-type-n4 text-white/70">{phoneNumber}</p>
            <p className="mt-[14px] h-[22px] uc-type-n5 text-white/70">{callConnected ? formatCallTime(callSeconds) : text("prime.advisor.calling", "Calling…")}</p>
          </div>

          {keypadOpen ? (
            <div className="mx-auto mt-[38px] grid max-w-[250px] grid-cols-3 gap-x-[18px] gap-y-[12px]" aria-label={text("prime.advisor.keypad", "Keypad")}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => (
                <button key={digit} type="button" aria-label={`${text("prime.advisor.dial", "Dial")} ${digit}`} className="grid size-[64px] place-items-center rounded-full bg-white/10 uc-type-h2 text-white active:bg-white/20">{digit}</button>
              ))}
            </div>
          ) : (
            <div className="mt-[38px] grid grid-cols-3 gap-x-[14px] gap-y-[28px]">
              {callControls.map((control) => {
                const enabled = enabledCallControls.includes(control.id);
                return (
                  <button key={control.id} type="button" aria-pressed={enabled} onClick={() => {
                    if (control.id === "keypad") setKeypadOpen(true);
                    else toggleCallControl(control.id);
                  }} className="flex flex-col items-center gap-[8px] text-center">
                    <span className={`grid size-[64px] place-items-center rounded-full ${enabled ? "bg-white text-[#17171a]" : "bg-[#3b3b40] text-white"}`}>
                      <CallControlIcon name={control.icon} />
                    </span>
                    <span className="uc-type-n5 text-white">{control.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-[18px]">
          {keypadOpen ? (
            <button type="button" onClick={() => setKeypadOpen(false)} className="grid size-[64px] place-items-center rounded-full bg-[#3b3b40] text-white" aria-label={text("prime.advisor.closeKeypad", "Close keypad")}>
              <AppIcon name="close-x" size={24} color="white" />
            </button>
          ) : null}
          <button type="button" onClick={onClose} aria-label={text("prime.advisor.endCall", "End call")} className="grid size-[72px] place-items-center rounded-full bg-[#ff3b30] text-white shadow-lg active:bg-[#d92b23]">
            <CallControlIcon name="hangup" />
          </button>
        </div>
      </div>
    );
  }

  if (screen === "email-chooser") {
    return (
      <div className="absolute inset-0 z-50 flex items-end bg-black/55" data-contact-action-simulation="email-chooser">
        <button type="button" aria-label={text("close", "Close")} className="absolute inset-0" onClick={onClose} />
        <section role="dialog" aria-modal="true" aria-labelledby="mail-chooser-title" className="relative w-full rounded-t-[28px] bg-[#202024] px-[20px] pb-[20px] pt-[10px] text-white shadow-[0_-18px_48px_rgb(0_0_0_/_0.3)]" style={{ paddingBottom: "calc(var(--uc-phone-bottom-reserve, 34px) + 20px)" }}>
          <div className="mx-auto mb-[22px] h-[5px] w-[36px] rounded-full bg-white/35" />
          <h2 id="mail-chooser-title" className="mb-[20px] px-[4px] uc-type-n4 text-white">{text("prime.advisor.createMailWith", "Create mail with")}</h2>
          <div className="flex flex-col gap-[8px]">
            <MailAppOption app="gmail" title="Gmail" subtitle="Google" onClick={() => chooseMailApp("gmail")} text={text} />
            <MailAppOption app="mail" title={text("prime.advisor.defaultMailApp", "Default mail app")} subtitle={text("prime.advisor.configureMailSettings", "Configure in iOS settings")} onClick={() => chooseMailApp("mail")} text={text} />
          </div>
          <div className="mt-[22px] flex items-center justify-between gap-[16px] px-[4px]">
            <span className="uc-type-n5 text-white/80">{text("prime.advisor.askMailEveryTime", "Ask me which app to use every time")}</span>
            <button type="button" role="switch" aria-checked={mailPreferences.askEveryTime} aria-label={text("prime.advisor.askMailEveryTime", "Ask me which app to use every time")} onClick={toggleMailPreference} className={`relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors ${mailPreferences.askEveryTime ? "bg-[#0a84ff]" : "bg-[#616166]"}`}>
              <span className={`absolute top-[3px] size-[24px] rounded-full bg-white shadow transition-transform ${mailPreferences.askEveryTime ? "left-[25px]" : "left-[3px]"}`} />
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (screen === "email-compose") {
    const appName = selectedMailApp === "gmail" ? "Gmail" : text("prime.advisor.defaultMailApp", "Mail");
    return (
      <div role="dialog" aria-modal="true" aria-labelledby="email-compose-title" className="absolute inset-0 z-50 flex flex-col bg-[#f8f8fa] px-[20px] text-[#202124]" data-contact-action-simulation="email-compose" style={{ paddingTop: "calc(var(--uc-phone-top-reserve, 54px) + 12px)", paddingBottom: "calc(var(--uc-phone-bottom-reserve, 34px) + 16px)" }}>
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[var(--uc-phone-top-reserve,54px)] bg-[#151518]" />
        <div className="flex h-[48px] shrink-0 items-center justify-between">
          <button type="button" onClick={onClose} className="uc-type-n4 text-[#007aff]">{text("prime.advisor.cancel", "Cancel")}</button>
          <h1 id="email-compose-title" className="uc-type-n4-strong">{text("prime.advisor.newMessage", "New Message")}</h1>
          <button type="button" onClick={() => setScreen("email-sent")} className="uc-type-n4-strong text-[#007aff]">{text("prime.advisor.send", "Send")}</button>
        </div>
        <div className="mt-[20px] shrink-0 rounded-[14px] bg-white px-[16px]">
          <MailField label={text("prime.advisor.to", "To")} value={emailAddress} />
          <div className="h-px bg-[#e4e4e8]" />
          <div className="flex min-h-[48px] items-center gap-[10px]">
            <span className="w-[58px] shrink-0 uc-type-n5 text-[#74747a]">{text("prime.advisor.subject", "Subject")}</span>
            <input aria-label={text("prime.advisor.subject", "Subject")} value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} placeholder={text("prime.advisor.noSubject", "No subject")} className="min-w-0 flex-1 bg-transparent uc-type-n4 text-[#202124] outline-none placeholder:text-[#8e8e93]" />
          </div>
        </div>
        <div className="mt-[22px] flex min-h-0 flex-1 flex-col">
          <p className="mb-[8px] uc-type-n5 text-[#74747a]">{text("prime.advisor.from", "From")} · {appName}</p>
          <textarea aria-label={text("prime.advisor.messageBody", "Message")} value={emailBody} onChange={(event) => setEmailBody(event.target.value)} placeholder={text("prime.advisor.writeEmail", "Write your email…")} className="min-h-0 flex-1 resize-none bg-transparent uc-type-n4 leading-[22px] text-[#202124] outline-none placeholder:text-[#8e8e93]" />
        </div>
        <button type="button" onClick={() => setScreen("email-sent")} className="mt-[16px] flex h-[48px] shrink-0 items-center justify-center gap-[8px] rounded-[12px] bg-[#007a91] uc-type-n4-strong text-white active:bg-[#00687a]">
          <AppIcon name="prime-email" size={20} color="white" />
          {text("prime.advisor.send", "Send")}
        </button>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="email-sent-title" className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--uc-surface)] px-[24px] text-[var(--uc-text)]" data-contact-action-simulation="email-sent" style={{ paddingTop: "var(--uc-phone-top-reserve, 54px)", paddingBottom: "var(--uc-phone-bottom-reserve, 34px)" }}>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[var(--uc-phone-top-reserve,54px)] bg-[#151518]" />
      <div className="grid size-[88px] place-items-center rounded-full bg-[#e4f4f5] text-[#007a91]">
        <svg aria-hidden="true" width="44" height="44" viewBox="0 0 44 44" fill="none"><path d="M11 22.5 18.5 30 33 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h1 id="email-sent-title" className="mt-[24px] uc-type-h2 text-center">{text("prime.advisor.messageSent", "Message sent")}</h1>
      <p className="mt-[8px] uc-type-n4 text-center text-[var(--uc-text-muted)]">{text("prime.advisor.messageSentTo", `Your message to ${emailAddress} was sent.`)}</p>
      <button type="button" onClick={onClose} className="mt-[32px] h-[48px] w-full rounded-[12px] bg-[#007a91] uc-type-n4-strong text-white">{text("prime.advisor.done", "Done")}</button>
    </div>
  );
}

function MailAppOption({ app, title, subtitle, onClick, text }: {
  app: PrimeMailApp;
  title: string;
  subtitle: string;
  onClick: () => void;
  text: (key: string, fallback: string) => string;
}) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[82px] w-full items-center gap-[16px] rounded-[20px] bg-[#111114] px-[16px] text-left active:bg-[#303035]">
      <span className="grid size-[56px] shrink-0 place-items-center rounded-[14px] bg-white">
        {app === "gmail" ? <GmailMark /> : <MailMark />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block uc-type-n4-strong text-white">{title}</span>
        <span className="mt-[2px] block uc-type-n5 text-white/65">{subtitle}</span>
      </span>
      <AppIcon name="chevron-right" size={20} color="#a3a3a8" />
      <span className="sr-only">{text("prime.advisor.openMailApp", "Open email app")}</span>
    </button>
  );
}

function GmailMark() {
  return (
    <svg aria-hidden="true" width="38" height="32" viewBox="0 0 38 32" fill="none">
      <path d="M5 27V7l14 11L33 7v20" stroke="#4285F4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8 10 12" stroke="#EA4335" strokeWidth="5" strokeLinecap="round" />
      <path d="M28 12 33 8" stroke="#34A853" strokeWidth="5" strokeLinecap="round" />
      <path d="M5 8v19" stroke="#EA4335" strokeWidth="5" strokeLinecap="round" />
      <path d="M33 8v19" stroke="#FBBC04" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function MailMark() {
  return (
    <svg aria-hidden="true" width="38" height="32" viewBox="0 0 38 32" fill="none">
      <rect x="3" y="5" width="32" height="22" rx="3" stroke="#737378" strokeWidth="3" />
      <path d="m5 8 14 11L33 8" stroke="#737378" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-[48px] items-center gap-[10px]">
      <span className="w-[58px] shrink-0 uc-type-n5 text-[#74747a]">{label}</span>
      <span className="min-w-0 flex-1 truncate uc-type-n4 text-[#202124]">{value}</span>
    </div>
  );
}

function CallControlIcon({ name }: { name: string }) {
  const base = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 2 };
  if (name === "mic") return <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" {...base}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8" /></svg>;
  if (name === "keypad") return <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" {...base}><circle cx="6" cy="5" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="18" cy="5" r="1" /><circle cx="6" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="18" cy="12" r="1" /><circle cx="6" cy="19" r="1" /><circle cx="12" cy="19" r="1" /><circle cx="18" cy="19" r="1" /></svg>;
  if (name === "speaker") return <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" {...base}><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="M17 9a5 5 0 0 1 0 6m2.5-9a9 9 0 0 1 0 12" /></svg>;
  if (name === "add") return <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" {...base}><circle cx="9" cy="8" r="4" /><path d="M3 21v-1a6 6 0 0 1 12 0v1m4-12v8m-4-4h8" /></svg>;
  if (name === "video") return <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" {...base}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>;
  if (name === "person") return <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  return <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.56 3.57.56.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.19 2.45.56 3.57.11.36.02.76-.25 1.03l-2.19 2.19Z" /></svg>;
}
