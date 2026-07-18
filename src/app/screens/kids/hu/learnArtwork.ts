/**
 * HU Kids Learn artwork registry and topic/lesson progress helpers.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3). The Learn
 * PNG imports move with it, so the dispatcher no longer carries them.
 */
import type { CSSProperties } from "react";
import huLearnAskHelpSrc from "@/assets/kids/learn/hu-learn-ask-help.png";
import huLearnBalanceSrc from "@/assets/kids/learn/hu-learn-balance.png";
import huLearnBoostSrc from "@/assets/kids/learn/hu-learn-boost.png";
import huLearnCardFreezeSrc from "@/assets/kids/learn/hu-learn-card-freeze.png";
import huLearnCardPaySrc from "@/assets/kids/learn/hu-learn-card-pay.png";
import huLearnCardPrivateSrc from "@/assets/kids/learn/hu-learn-card-private.png";
import huLearnMoneyCheckSrc from "@/assets/kids/learn/hu-learn-money-check.png";
import huLearnPauseSrc from "@/assets/kids/learn/hu-learn-pause.png";
import huLearnPrivateCodesSrc from "@/assets/kids/learn/hu-learn-private-codes.png";
import huLearnReportSafetySrc from "@/assets/kids/learn/hu-learn-report-safety.png";
import huLearnRequestAmountSrc from "@/assets/kids/learn/hu-learn-request-amount.png";
import huLearnRequestReasonSrc from "@/assets/kids/learn/hu-learn-request-reason.png";
import huLearnRequestWaitSrc from "@/assets/kids/learn/hu-learn-request-wait.png";
import huLearnSpendTodaySrc from "@/assets/kids/learn/hu-learn-spend-today.png";
import huLearnTargetSrc from "@/assets/kids/learn/hu-learn-target.png";
import huLearnTopicCardConfidenceSrc from "@/assets/kids/learn/hu-learn-topic-card-confidence.png";
import huLearnTopicMoneyBasicsSrc from "@/assets/kids/learn/hu-learn-topic-money-basics.png";
import huLearnTopicOnlineSafetySrc from "@/assets/kids/learn/hu-learn-topic-online-safety.png";
import huLearnTopicRequestMoneySrc from "@/assets/kids/learn/hu-learn-topic-request-money.png";
import huLearnTopicSavingGoalsSrc from "@/assets/kids/learn/hu-learn-topic-saving-goals.png";
import type {
  HuLearnArtVariant,
  HuLearnArtworkKey,
  HuLearnLesson,
  HuLearnTopic,
} from "./types";

export function getHuLearnCompletedLessonsCount(topic: HuLearnTopic, completedLessonIds: string[]) {
  return topic.lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
}

export function getHuLearnTopicProgress(topic: HuLearnTopic, completedLessonIds: string[]) {
  if (topic.lessons.length === 0) {
    return 0;
  }

  return Math.round((getHuLearnCompletedLessonsCount(topic, completedLessonIds) / topic.lessons.length) * 100);
}

export const HU_LEARN_CARD_SURFACE_STYLE = {
  background: "var(--hu-learn-card-bg)",
  borderColor: "var(--hu-learn-card-border)",
  boxShadow: "var(--hu-learn-card-shadow)",
} as CSSProperties;

// Logical PNG slots are intentionally stable so final learning artwork can be swapped without relayout.
export const HU_LEARN_ART_SLOT_CLASS: Record<HuLearnArtVariant, string> = {
  "topic-card": "right-[6px] top-[8px] h-[92px] w-[98px] rounded-[22px]",
  "topic-featured": "right-[10px] top-[6px] h-[122px] w-[140px] rounded-[28px]",
  "topic-hero": "right-[12px] top-[8px] h-[146px] w-[166px] rounded-[32px]",
  "lesson-row": "right-[8px] top-[10px] h-[88px] w-[100px] rounded-[22px]",
  "lesson-hero": "bottom-[2px] right-[-8px] h-[230px] w-[250px] rounded-[42px]",
};

const HU_LEARN_ARTWORK_SRC: Record<HuLearnArtworkKey, string> = {
  "topic-money-basics": huLearnTopicMoneyBasicsSrc,
  "topic-saving-goals": huLearnTopicSavingGoalsSrc,
  "topic-online-safety": huLearnTopicOnlineSafetySrc,
  "topic-request-money": huLearnTopicRequestMoneySrc,
  "topic-card-confidence": huLearnTopicCardConfidenceSrc,
  balance: huLearnBalanceSrc,
  "spend-today": huLearnSpendTodaySrc,
  "money-check": huLearnMoneyCheckSrc,
  target: huLearnTargetSrc,
  boost: huLearnBoostSrc,
  "ask-help": huLearnAskHelpSrc,
  pause: huLearnPauseSrc,
  "private-codes": huLearnPrivateCodesSrc,
  "report-safety": huLearnReportSafetySrc,
  "request-reason": huLearnRequestReasonSrc,
  "request-amount": huLearnRequestAmountSrc,
  "request-wait": huLearnRequestWaitSrc,
  "card-pay": huLearnCardPaySrc,
  "card-freeze": huLearnCardFreezeSrc,
  "card-private": huLearnCardPrivateSrc,
};

const HU_LEARN_TOPIC_ARTWORK: Record<string, HuLearnArtworkKey> = {
  "money-basics": "topic-money-basics",
  "saving-goals": "topic-saving-goals",
  "online-safety": "topic-online-safety",
  "request-money": "topic-request-money",
  "card-confidence": "topic-card-confidence",
  "smart-budgeting": "money-check",
  "earning-money": "boost",
  "digital-security": "private-codes",
  "family-banking": "ask-help",
};

const HU_LEARN_LESSON_ARTWORK: Record<string, HuLearnArtworkKey> = {
  "money-basics-balance": "balance",
  "money-basics-today": "spend-today",
  "money-basics-check": "money-check",
  "saving-goals-target": "target",
  "saving-goals-boost": "boost",
  "saving-goals-share": "ask-help",
  "saving-goals-priority": "target",
  "saving-goals-celebrate": "boost",
  "online-safety-pause": "pause",
  "online-safety-private": "private-codes",
  "online-safety-report": "report-safety",
  "request-money-reason": "request-reason",
  "request-money-amount": "request-amount",
  "request-money-wait": "request-wait",
  "request-money-thanks": "request-reason",
  "request-money-plan": "request-amount",
  "request-money-frequency": "request-wait",
  "request-money-no": "request-reason",
  "card-confidence-pay": "card-pay",
  "card-confidence-freeze": "card-freeze",
  "card-confidence-details": "card-private",
  "card-confidence-lost": "card-freeze",
  "budgeting-categories": "balance",
  "budgeting-tracking": "spend-today",
  "budgeting-adjust": "card-freeze",
  "budgeting-savings": "money-check",
  "budgeting-surprises": "spend-today",
  "earning-work": "boost",
  "earning-rewards": "target",
  "earning-hustle": "card-pay",
  "earning-save-rewards": "target",
  "earning-grow": "boost",
  "earning-generosity": "card-pay",
  "security-biometric": "card-private",
  "security-phishing": "pause",
  "security-wifi": "report-safety",
  "security-updates": "pause",
  "family-decisions": "ask-help",
  "family-trust": "request-wait",
  "family-goals": "request-reason",
};

function getHuLearnArtworkSrc(key?: HuLearnArtworkKey) {
  return key ? HU_LEARN_ARTWORK_SRC[key] : undefined;
}

export function getHuLearnTopicImageSrc(topic?: HuLearnTopic | null) {
  return getHuLearnArtworkSrc(topic ? HU_LEARN_TOPIC_ARTWORK[topic.id] : undefined);
}

export function getHuLearnLessonImageSrc(lesson?: HuLearnLesson | null) {
  return getHuLearnArtworkSrc(lesson ? HU_LEARN_LESSON_ARTWORK[lesson.id] : undefined);
}
