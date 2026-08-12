import type { IPatientLabs, ILabTestEntry } from '@/services/PatientLabs/PatientLabs.interface';

/**
 * Generates, downloads and prints a client-side lab result report built from the
 * already-loaded PatientLabs data (no backend file storage is required).
 *
 * The report is produced as a styled HTML document:
 *  - opened in a new window for a print preview
 *  - downloaded as an .html file through a Blob anchor
 *
 * A real PDF/A4 variant (downloadPdfReport) renders the same HTML to a canvas
 * via html2canvas and embeds it into a jsPDF document. html2canvas and jspdf
 * are dynamically imported only when a PDF is requested, so they never bloat
 * the main bundle.
 */
export function useLabReport() {
  const formatDate = (raw?: string | null) => {
    if (!raw) return '—';
    try {
      return new Date(raw).toLocaleString();
    } catch {
      return raw;
    }
  };

  const safe = (v: unknown) => (v === null || v === undefined ? '—' : v);

  const generateReportHtml = (lab: IPatientLabs): string => {
    const entries: ILabTestEntry[] = lab.report ?? [];

    const rows = entries
      .map((e) => {
        const outOfRange =
          e.recordedValue !== undefined && e.normalMinValue !== undefined && e.normalMaxValue !== undefined && (e.recordedValue < e.normalMinValue || e.recordedValue > e.normalMaxValue);
        return `
        <tr class="${outOfRange ? 'out-of-range' : ''}">
          <td class="entity">${safe(e.entity)}</td>
          <td class="num">${safe(e.normalMinValue)}</td>
          <td class="num">${safe(e.normalMaxValue)}</td>
          <td class="num"><strong>${safe(e.recordedValue)}</strong></td>
          <td class="flag">${outOfRange ? '⚠ Out of range' : '✓ Normal'}</td>
        </tr>`;
      })
      .join('');

    const hasAnyResults = entries.length > 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Lab Report - ${safe(lab.labTestName) ?? 'Lab Test'}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; color: #111; }
    .page { width: 210mm; margin: 16px auto; padding: 20px 24px; border: 1px solid #e5e7eb; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0d6efd; padding-bottom: 12px; margin-bottom: 16px; }
    .logo { font-size: 22px; }
    .title { font-size: 22px; font-weight: 700; margin: 0 0 2px; }
    .subtitle { font-size: 13px; color: #6b7280; margin: 0; }
    .meta { display: grid; grid-template-columns: 140px 1fr; gap: 6px 14px; margin-bottom: 18px; font-size: 13.5px; }
    .meta .label { color: #6b7280; font-weight: 600; }
    .meta .value { }
    .note { font-size: 13px; color: #374151; margin: 10px 0 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13.5px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
    th { background: #f3f4f6; font-weight: 700; }
    td.num { text-align: right; }
    td.flag { text-align: center; font-size: 12px; }
    tr.out-of-range td:nth-child(-n+4) { background: #fff5f5; }
    .empty { color: #6b7280; font-style: italic; font-size: 13px; }
    .footer { font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div><div class="logo">🧪</div></div>
      <div style="text-align: right;">
        <div class="title">${safe(lab.labTestName) ?? 'Lab Test'}</div>
        <div class="subtitle">Lab Result Report</div>
      </div>
    </div>

    <div class="meta">
      <div class="label">Patient:</div><div class="value">${safe(lab.patientName)}</div>
      <div class="label">Lab Test:</div><div class="value">${safe(lab.labTestName) ?? 'Lab Test #' + safe(lab.labTestId)}</div>
      <div class="label">Status:</div><div class="value">${safe(lab.status)}</div>
      <div class="label">Reported:</div><div class="value">${formatDate(lab.reportTime)}</div>
      <div class="label">Created:</div><div class="value">${formatDate(lab.createdAt)}</div>
    </div>

    <p class="note">${safe(lab.details) ? 'Notes: ' + lab.details : 'No notes provided.'}</p>

    ${
      hasAnyResults
        ? `<table>
        <thead>
          <tr><th>Parameter</th><th>Min</th><th>Max</th><th>Result</th><th>Flag</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`
        : '<p class="empty">No test entries recorded for this lab order.</p>'
    }

    <div class="footer">
      Report generated on ${new Date().toLocaleString()} • HMS Lab Results
    </div>
  </div>
</body>
</html>`;
  };

  const downloadReport = (lab: IPatientLabs): void => {
    if (!lab) return;
    const html = generateReportHtml(lab);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const patient = (lab.patientName || 'Patient').replace(/[^a-z0-9]/gi, '_') || 'patient';
    const stamp = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LabReport_${patient}_${stamp}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReport = (lab: IPatientLabs): void => {
    if (!lab) return;
    const html = generateReportHtml(lab);
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  /**
   * Exports a real A4 PDF of the lab report. The styled HTML is rendered to a
   * canvas with html2canvas and embedded into a jsPDF document, paginated
   * across multiple A4 pages when the report overflows a single page.
   */
  const downloadPdfReport = async (lab: IPatientLabs): Promise<void> => {
    if (!lab) return;
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const html = generateReportHtml(lab);

    // Mount the styled report off-screen but laid out so html2canvas can read it.
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '-2048px';
    wrapper.style.width = '800px';
    wrapper.style.background = '#f3f4f6';
    wrapper.style.padding = '0';
    wrapper.style.margin = '0';
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    const reportEl = wrapper.querySelector('.page') as HTMLElement | null;
    if (!reportEl) {
      document.body.removeChild(wrapper);
      throw new Error('Lab report content could not be rendered.');
    }
    // Capture the border-box only (a margin would be clipped by html2canvas).
    reportEl.style.margin = '0';
    reportEl.style.background = '#ffffff';

    // Let any images / fonts settle before capturing.
    await new Promise((resolve) => window.setTimeout(resolve, 500));

    // Heavy PDF deps are loaded on demand so the main bundle stays lean.
    const html2canvas = (await import('html2canvas' as unknown as string)).default as (el: HTMLElement | SVGElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;

    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(reportEl, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
    });

    document.body.removeChild(wrapper);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const ratio = canvas.width / canvas.height;
    const pdfHeight = pageWidth / ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pdfHeight);

    // Continue across extra A4 pages when the report is taller than one page.
    let heightLeft = pdfHeight - pageHeight;
    let position = 0;
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const patient = (lab.patientName || 'Patient').replace(/[^a-z0-9]/gi, '_') || 'patient';
    const stamp = new Date().toISOString().slice(0, 10);
    pdf.save(`LabReport_${patient}_${stamp}.pdf`);
  };

  return { generateReportHtml, downloadReport, downloadPdfReport, printReport };
}
