export type SettingsItem = {
  id: string;
  title: string;
  description: string;
};

export type SettingsSection = {
  id: string;
  title: string;
  items: SettingsItem[];
};

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "mobile-app",
    title: "Mobile app",
    items: [
      {
        id: "appearance",
        title: "Appearance",
        description: "Choose light or dark mode and personalise your Home.",
      },
      {
        id: "language",
        title: "Language",
        description: "Choose the app language you want to use every day.",
      },
      {
        id: "notifications",
        title: "Notifications",
        description: "Manage push alerts for payments, cards, and activity.",
      },
      {
        id: "my-notifications",
        title: "My notifications",
        description: "Review recent app alerts and update delivery preferences.",
      },
      {
        id: "security",
        title: "Security",
        description: "Control sign-in, approvals, and device protection settings.",
      },
      {
        id: "widget-settings",
        title: "Widget settings",
        description: "Choose what account information appears in your widgets.",
      },
    ],
  },
  {
    id: "bank",
    title: "Bank",
    items: [
      {
        id: "cashback",
        title: "Cashback",
        description: "See participating merchants and cashback setup options.",
      },
      {
        id: "limits",
        title: "Limits",
        description: "Adjust card, ATM, and transfer limits for your accounts.",
      },
    ],
  },
];
