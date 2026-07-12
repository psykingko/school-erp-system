import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import MainCard from "./MainCard";
import { Eye, EyeOff, Copy, Check, Lock, BookOpen, Mail } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

// Accent configs using the new palette
const accentMap = {
  emerald: {
    borderTop: "border-t-4",
    borderColor: "#00b4d8",
    iconBg: "#00b4d820",
    iconColor: "#00b4d8",
    labelColor: "#0077b6",
    inputRingColor: "#00b4d8",
    badgeBg: "#0077b615",
    badgeColor: "#0077b6",
    badgeBorderColor: "#0077b640",
  },
  blue: {
    borderTop: "border-t-4",
    borderColor: "#0077b6",
    iconBg: "#0077b620",
    iconColor: "#0077b6",
    labelColor: "#03045e",
    inputRingColor: "#0077b6",
    badgeBg: "#0077b615",
    badgeColor: "#0077b6",
    badgeBorderColor: "#0077b640",
  },
};

function CopyButton({ value, accent, label }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement("textarea");
      el.value = value;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileTap={{ scale: 0.92 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors duration-150"
      style={
        copied
          ? {
              backgroundColor: "#00b4d820",
              color: "#00b4d8",
              borderColor: "#00b4d840",
            }
          : {
              backgroundColor: "#caf0f8",
              color: "#03045e",
              borderColor: "#00b4d840",
            }
      }
      aria-label={copied ? t("aria.copied", { label: t(label) }) : t("aria.copy", { label: t(label) })}
    >
      {copied ? (
        <>
          <Check size={17} aria-hidden="true" />
          <span>{t("btn.copied")}</span>
        </>
      ) : (
        <>
          <Copy size={17} aria-hidden="true" />
          <span>{t("btn.copy")}</span>
        </>
      )}
    </motion.button>
  );
}

function CredentialField({ label, value, isPassword, accent }) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <span
        className="text-xs font-bold uppercase tracking-wide"
        style={{ color: accent.labelColor }}
      >
        {t(label)}
      </span>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type={isPassword && !showPassword ? "password" : "text"}
            value={value}
            readOnly
            className="w-full px-3 py-2 rounded-xl text-sm font-mono font-semibold outline-none select-all cursor-default border"
            style={{
              backgroundColor: "#caf0f8",
              borderColor: "#00b4d840",
              color: "#03045e",
            }}
            aria-label={label}
          />
        </div>
        {isPassword && (
          <motion.button
            onClick={() => setShowPassword((prev) => !prev)}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl border transition-colors duration-150"
            style={{
              backgroundColor: "#caf0f8",
              borderColor: "#00b4d840",
              color: "#03045e",
            }}
            aria-label={showPassword ? t("aria.hide", { label: t(label) }) : t("aria.show", { label: t(label) })}
          >
            {showPassword ? (
              <EyeOff size={21} aria-hidden="true" />
            ) : (
              <Eye size={21} aria-hidden="true" />
            )}
          </motion.button>
        )}
        <CopyButton value={value} accent={accent} label={label} />
      </div>
    </div>
  );
}

function CredentialsCard({
  type,
  title,
  primaryLabel,
  primaryValue,
  passwordLabel,
  passwordValue,
  accentColor = "emerald",
  index = 0,
}) {
  const { t } = useLanguage();
  const accent = accentMap[accentColor] ?? accentMap.emerald;
  const IconComponent = type === "library" ? BookOpen : Mail;

  return (
    <MainCard
      custom={index}
      variants={cardVariants}
      className="h-full"
      aria-label={t("aria.credentials", { title: t(title) }) || `${t(title)} credentials`}
    >
      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl"
              style={{ backgroundColor: accent.iconBg }}
            >
              <IconComponent
                size={29}
                style={{ color: accent.iconColor }}
                aria-hidden="true"
              />
            </div>
            <div>
              <h3
                className="text-base font-extrabold leading-tight"
                style={{ color: "#03045e" }}
              >
                {t(title)}
              </h3>
              <span
                className="text-xs font-semibold"
                style={{ color: accent.labelColor }}
              >
                {type === "library" ? t("credentials.library") : t("credentials.email")}
              </span>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold"
            style={{
              backgroundColor: accent.badgeBg,
              color: accent.badgeColor,
              borderColor: accent.badgeBorderColor,
            }}
            aria-label={t("aria.secure")}
          >
            <Lock size={16} aria-hidden="true" />
            <span>{t("status.secure")}</span>
          </div>
        </div>

        <div
          className="border-t"
          style={{ borderColor: "#caf0f8" }}
          aria-hidden="true"
        />

        <CredentialField
          label={primaryLabel}
          value={primaryValue}
          isPassword={false}
          accent={accent}
        />
        <CredentialField
          label={passwordLabel}
          value={passwordValue}
          isPassword={true}
          accent={accent}
        />
      </div>
    </MainCard>
  );
}

export default CredentialsCard;
