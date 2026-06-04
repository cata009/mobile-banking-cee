export type TypographyTokenId =
  | "h1"
  | "h2"
  | "l1"
  | "l2"
  | "l3"
  | "p1"
  | "p2"
  | "n1"
  | "n2-strong"
  | "n2"
  | "n3"
  | "n4-strong"
  | "n4"
  | "n5-strong"
  | "n5";

export type TypographyToken = {
  id: TypographyTokenId;
  label: string;
  className: string;
  family: "UniCredit";
  weight: "Regular" | "Bold";
  fontSize: number;
  usage: string;
  sample: string;
};

export const TYPOGRAPHY_TOKENS: readonly TypographyToken[] = [
  {
    id: "h1",
    label: "H1",
    className: "uc-type-h1",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 28,
    usage: "Page header",
    sample: "Page header",
  },
  {
    id: "h2",
    label: "H2",
    className: "uc-type-h2",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 18,
    usage: "Section subtitle",
    sample: "Section subtitle",
  },
  {
    id: "l1",
    label: "L1",
    className: "uc-type-l1",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 24,
    usage: "Card title",
    sample: "Card title",
  },
  {
    id: "l2",
    label: "L2",
    className: "uc-type-l2",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 18,
    usage: "Card subtitle",
    sample: "Card subtitle",
  },
  {
    id: "l3",
    label: "L3",
    className: "uc-type-l3",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 14,
    usage: "Card label",
    sample: "Card label",
  },
  {
    id: "p1",
    label: "P1",
    className: "uc-type-p1",
    family: "UniCredit",
    weight: "Regular",
    fontSize: 18,
    usage: "Body",
    sample: "Body",
  },
  {
    id: "p2",
    label: "P2",
    className: "uc-type-p2",
    family: "UniCredit",
    weight: "Regular",
    fontSize: 14,
    usage: "Micro text / Icon support",
    sample: "Micro text / Icon support",
  },
  {
    id: "n1",
    label: "N1",
    className: "uc-type-n1",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 30,
    usage: "Numeric headline",
    sample: "30",
  },
  {
    id: "n2-strong",
    label: "N2 / Bold",
    className: "uc-type-n2-strong",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 20,
    usage: "Amount / emphasis",
    sample: "20 Bold",
  },
  {
    id: "n2",
    label: "N2 / Regular",
    className: "uc-type-n2",
    family: "UniCredit",
    weight: "Regular",
    fontSize: 20,
    usage: "Amount / regular",
    sample: "20 Regular",
  },
  {
    id: "n3",
    label: "N3",
    className: "uc-type-n3",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 24,
    usage: "Numeric title",
    sample: "24",
  },
  {
    id: "n4-strong",
    label: "N4 / Bold",
    className: "uc-type-n4-strong",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 16,
    usage: "Label / control emphasis",
    sample: "16 Bold",
  },
  {
    id: "n4",
    label: "N4 / Regular",
    className: "uc-type-n4",
    family: "UniCredit",
    weight: "Regular",
    fontSize: 16,
    usage: "Label / body compact",
    sample: "16 Regular",
  },
  {
    id: "n5-strong",
    label: "N5 / Bold",
    className: "uc-type-n5-strong",
    family: "UniCredit",
    weight: "Bold",
    fontSize: 14,
    usage: "Micro emphasis / uppercase labels",
    sample: "14 Bold",
  },
  {
    id: "n5",
    label: "N5 / Regular",
    className: "uc-type-n5",
    family: "UniCredit",
    weight: "Regular",
    fontSize: 14,
    usage: "Micro body / helper",
    sample: "14 Regular",
  },
] as const;
