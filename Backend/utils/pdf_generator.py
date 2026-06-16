"""
KisanMind PDF Generator
━━━━━━━━━━━━━━━━━━━━━━━
Converts markdown advisory reports into downloadable
PDF files using ReportLab.
"""

import os
import re
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

PDF_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "reports")


def generate_pdf(markdown_text: str, session_id: str) -> str:
    """
    Convert a markdown advisory report to a PDF file.

    Args:
        markdown_text: The full markdown report
        session_id: Session ID for the filename

    Returns:
        Absolute path to the generated PDF file
    """
    os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"kisanmind_report_{session_id[:8]}_{timestamp}.pdf"
    filepath = os.path.join(PDF_OUTPUT_DIR, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "KMTitle",
        parent=styles["Title"],
        fontSize=18,
        spaceAfter=12,
    )

    heading_style = ParagraphStyle(
        "KMHeading",
        parent=styles["Heading2"],
        fontSize=14,
        spaceAfter=8,
        spaceBefore=16,
    )

    body_style = ParagraphStyle(
        "KMBody",
        parent=styles["Normal"],
        fontSize=10,
        spaceAfter=6,
        leading=14,
    )

    bullet_style = ParagraphStyle(
        "KMBullet",
        parent=styles["Normal"],
        fontSize=10,
        leftIndent=20,
        spaceAfter=4,
        leading=14,
        bulletIndent=10,
    )

    # Parse markdown into PDF elements
    elements = []
    lines = markdown_text.split("\n")

    for line in lines:
        stripped = line.strip()

        if not stripped or stripped == "---":
            elements.append(Spacer(1, 6))
            continue

        # Sanitize for ReportLab XML parser
        safe = _sanitize_for_reportlab(stripped)

        if stripped.startswith("# "):
            text = safe[2:]
            elements.append(Paragraph(text, title_style))
        elif stripped.startswith("## "):
            text = safe[3:]
            elements.append(Paragraph(text, heading_style))
        elif stripped.startswith("### "):
            text = safe[4:]
            elements.append(Paragraph(f"<b>{text}</b>", body_style))
        elif stripped.startswith("- ") or stripped.startswith("* "):
            text = safe[2:]
            elements.append(Paragraph(f"• {text}", bullet_style))
        elif stripped.startswith("**") and stripped.endswith("**"):
            text = safe[2:-2]
            elements.append(Paragraph(f"<b>{text}</b>", body_style))
        else:
            # Convert markdown bold to ReportLab bold
            text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", safe)
            elements.append(Paragraph(text, body_style))

    doc.build(elements)
    return os.path.abspath(filepath)


def _sanitize_for_reportlab(text: str) -> str:
    """
    Sanitize text for ReportLab's XML parser.
    Replace characters that would break Paragraph parsing.
    """
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    # Restore our own bold tags
    text = text.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")
    return text
