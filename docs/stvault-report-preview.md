# StVault report preview provenance

- Source repository: https://github.com/Musyg/stvault-audit
- Source commit: `5558eba7d33808c56fcd83f95ea0f043af56f0d0`, checked 2026-09-12.
- PDF: `StVault_Security_Review.pdf` at that commit.
- PDF SHA256: `1836A7F13AB5538407D32DEE3423F781740F3BEDF698FF4FF828BB6FAA8222D5`.
- Public preview: `public/stvault-report-cover.png`.
- Preview SHA256: `2455D96387BAD36A01E3D29C06BD90B34FF1FD1F23C1A63977A8587C189679E0`.
- Rendering: Poppler `pdftoppm -f 1 -singlefile -scale-to 960 -png`; 679 x 960 pixels.

This is a raster rendering of page one, not a redesigned or generated report.
CSS clips only the blank outer printer margin (1%). Original report colors and
text are preserved. The surrounding site retains its exact #005EFF accent.
The PDF and text links are pinned to the same commit as the preview.

The source README describes StVault as a deliberately vulnerable demonstration,
not a client engagement. Both locales retain this distinction in adjacent context
and image alt text. Platform names in the original cover do not imply they commissioned
this demonstration. No private report or operational reproduction instructions
are added to the portfolio. The PDF itself is not copied into the website assets.
