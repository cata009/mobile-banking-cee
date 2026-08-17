from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle, KeepTogether

ROOT = Path(r"C:\Users\mihai\Desktop\Mobile Banking - CEE")
SOURCE = ROOT / "work" / "refer-a-friend-g1.md"
ASSETS = ROOT / "work" / "refer-a-friend-assets"
OUTPUT = Path(r"C:\Users\mihai\Documents\Codex\2026-08-13\realtime-voice-chat\outputs\mobile-banking-cee-refer-a-friend.pdf")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="DocumentTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=20.5, leading=25.5, textColor=colors.HexColor("#193C43"), spaceAfter=8))
styles.add(ParagraphStyle(name="Section", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=colors.HexColor("#193C43"), spaceBefore=12, spaceAfter=6))
styles.add(ParagraphStyle(name="Subsection", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=10.6, leading=13.2, textColor=colors.HexColor("#245662"), spaceBefore=8, spaceAfter=3))
styles.add(ParagraphStyle(name="BodySmall", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.25, leading=11.1, textColor=colors.HexColor("#263335"), spaceAfter=3.6))
styles.add(ParagraphStyle(name="List", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.1, leading=10.9, leftIndent=9, firstLineIndent=-7, textColor=colors.HexColor("#263335"), spaceAfter=2))
styles.add(ParagraphStyle(name="Meta", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.5, leading=9.5, textColor=colors.HexColor("#5E6A6C"), spaceAfter=5))
styles.add(ParagraphStyle(name="FigureCaption", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.3, leading=9.2, textColor=colors.HexColor("#465557"), alignment=1, spaceBefore=3))


def markup(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", text)
    text = re.sub(r"\[(.+?)\]\((https?://[^)]+)\)", r"<link href='\2' color='#1E5E70'>\1</link>", text)
    return text


def footer(canvas, document):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D8E0DF"))
    canvas.line(17 * mm, 12 * mm, A4[0] - 17 * mm, 12 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#657172"))
    canvas.drawString(17 * mm, 7.5 * mm, "Mobile Banking CEE - Refer a Friend - G1 DF")
    canvas.drawRightString(A4[0] - 17 * mm, 7.5 * mm, f"Page {document.page}")
    canvas.restoreState()


def figure(path: Path, caption: str):
    image = Image(str(path))
    image._restrictSize(70 * mm, 125 * mm)
    return [image, Paragraph(caption, styles["FigureCaption"])]


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=17 * mm, rightMargin=17 * mm, topMargin=15 * mm, bottomMargin=18 * mm, title="Mobile Banking CEE - Refer a Friend - G1 DF", author="Mobile Banking CEE")
    story, first_title = [], True
    for raw in SOURCE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("# "):
            if first_title:
                story.extend([Paragraph(markup(line[2:]), styles["DocumentTitle"]), Paragraph("Campaign awareness, code sharing, invite progress and referral-code application", styles["Meta"]), Spacer(1, 5)])
                first_title = False
            else:
                story.append(Paragraph(markup(line[2:]), styles["Section"]))
        elif line.startswith("## "):
            story.append(Paragraph(markup(line[3:]), styles["Section"]))
        elif line.startswith("### "):
            story.append(Paragraph(markup(line[4:]), styles["Subsection"]))
        elif line.startswith("#### "):
            story.append(Paragraph(markup(line[5:]), styles["Subsection"]))
        elif line.startswith("- "):
            story.append(Paragraph("- " + markup(line[2:]), styles["List"]))
        elif re.match(r"\d+\. ", line):
            story.append(Paragraph(markup(line), styles["List"]))
        else:
            story.append(Paragraph(markup(line), styles["BodySmall"]))

    story.append(PageBreak())
    story.append(Paragraph("Appendix A - Figma reference screens", styles["Section"]))
    story.append(Paragraph("The following unaltered exports were selected to document the representative states of the Refer a Friend flow. They are reference screens, not reconstructed visuals.", styles["BodySmall"]))
    figures = [
        (ASSETS / "01-active-invites-overview.png", "Invite detail: completed base reward and an outstanding extra-reward condition."),
        (ASSETS / "02-past-invites.png", "Past invites: historic invite status and earned-reward context."),
        (ASSETS / "03-invite-progress.png", "Referral progress detail: condition-level transparency and help route."),
        (ASSETS / "04-apply-referral-code.png", "Recipient route: apply a friend's referral code, potential reward and qualifying conditions."),
    ]
    rows = []
    for left, right in zip(figures[0::2], figures[1::2]):
        rows.append([figure(*left), figure(*right)])
    table = Table(rows, colWidths=[84 * mm, 84 * mm], hAlign="CENTER")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.HexColor("#D8E0DF")),
    ]))
    story.append(table)
    document.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    build()
