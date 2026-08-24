import { STATUS_OPTIONS } from '@/constants/statusOptions';

export function useAdmissionInvoicePdf() {
  const fmtDate = (raw?: string | null): string => {
    if (!raw) return 'N/A';
    try {
      return new Date(raw).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return raw;
    }
  };

  const fmtCur = (v?: number | null): string => `$${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const billTypeLabel = (t: number): string =>
    (
      ({
        0: 'Surgery',
        1: 'Pharmacy',
        2: 'Consultation',
        3: 'Admission',
        4: 'Lab Test',
        5: 'Other',
      }) as Record<number, string>
    )[t] ?? 'General Charge';

  const generateInvoiceHtml = (admission: any, bills: any[]): string => {
    const patientName = admission?.patient ? `${admission.patient.firstName || ''} ${admission.patient.lastName || ''}`.trim() : 'N/A';
    const doctorName = admission?.attendingDoctor?.name || 'N/A';
    const wardName = admission?.ward?.name || 'N/A';
    const bedNum = admission?.wardBed?.bedNumber || 'N/A';
    const statusName = STATUS_OPTIONS.ADMISSION.find((s) => s.id === admission?.status)?.name || 'Discharged';

    const total = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const paid = bills.reduce((s, b) => s + (b.isPaid ? b.totalAmount : b.paidAmount || 0), 0);
    const due = Math.max(0, total - paid);
    const isFullyPaid = due <= 0;

    const rowsHtml = bills.length
      ? bills
          .map((b, i) => {
            const reasonHtml = String(b.reason || '')
              .split('|')
              .map((l: string) => `<div style="margin-bottom:2px">&#8226; ${l.trim()}</div>`)
              .join('');
            const paidStyle = b.isPaid ? 'background:#d1fae5;color:#065f46;border:1px solid #a7f3d0' : 'background:#fef3c7;color:#92400e;border:1px solid #fde68a';
            return `<tr>
            <td style="border:1px solid #e5e7eb;padding:10px;text-align:center">${i + 1}</td>
            <td style="border:1px solid #e5e7eb;padding:10px;font-weight:600">${billTypeLabel(b.billType)}</td>
            <td style="border:1px solid #e5e7eb;padding:10px">${reasonHtml}</td>
            <td style="border:1px solid #e5e7eb;padding:10px;text-align:right;font-weight:600">${fmtCur(b.totalAmount)}</td>
            <td style="border:1px solid #e5e7eb;padding:10px;text-align:center">
              <span style="display:inline-block;padding:3px 8px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:uppercase;${paidStyle}">${b.isPaid ? 'PAID' : 'UNPAID'}</span>
            </td>
          </tr>`;
          })
          .join('')
      : `<tr><td colspan="5" style="border:1px solid #e5e7eb;padding:16px;text-align:center;color:#6b7280;font-style:italic">No charges recorded for this admission.</td></tr>`;

    const stampStyle = isFullyPaid ? 'background:#ecfdf5;color:#047857;border:2px dashed #10b981' : 'background:#fff1f2;color:#be123c;border:2px dashed #f43f5e';
    const stampText = isFullyPaid ? '&#10003; FULLY PAID &amp; SETTLED' : '&#9888; OUTSTANDING BALANCE DUE';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Admission Invoice #${admission?.id || ''}</title>
<style>
*{box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif}
body{margin:0;padding:0;background:#fff;color:#1f2937}
.page{width:210mm;margin:0 auto;padding:28px 32px;background:#fff}
.hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:20px}
.bt{font-size:22px;font-weight:800;color:#1e3a8a;margin:0}
.bs{font-size:12px;color:#4b5563;margin-top:2px}
.dt{font-size:20px;font-weight:800;color:#2563eb;margin:0;text-transform:uppercase;text-align:right}
.dn{font-size:13px;font-weight:600;color:#4b5563;text-align:right;margin-top:4px}
.gr{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.cd{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px}
.ct{font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:.5px;margin:0 0 10px;border-bottom:1px solid #cbd5e1;padding-bottom:6px}
.rw{display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px}
.lb{color:#64748b;font-weight:500}.vl{color:#0f172a;font-weight:600;text-align:right}
table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px}
th{background:#f1f5f9;color:#334155;font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:.5px;border:1px solid #cbd5e1;padding:10px;text-align:left}
.sm{display:flex;justify-content:space-between;align-items:flex-start;margin-top:20px}
.stamp{padding:12px 20px;border-radius:8px;font-weight:800;font-size:16px;letter-spacing:1px;text-transform:uppercase;text-align:center}
.tb{width:260px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:14px}
.tr_{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
.tr_.gd{border-top:2px solid #2563eb;margin-top:6px;padding-top:8px;font-size:15px;font-weight:800;color:#1e3a8a}
.ft{border-top:1px solid #e2e8f0;margin-top:36px;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end;font-size:11px;color:#64748b}
.sg{width:180px;text-align:center;border-top:1px solid #94a3b8;padding-top:4px;font-size:11px;font-weight:600;color:#334155}
</style>
</head>
<body>
<div class="page">
<div class="hd">
  <div>
    <h1 class="bt">HOSPITAL MANAGEMENT SYSTEM</h1>
    <div class="bs">Official Inpatient Admission Ledger &amp; Invoice Statement</div>
  </div>
  <div>
    <h2 class="dt">ADMISSION INVOICE</h2>
    <div class="dn">Invoice #: ADM-INV-${admission?.id || '000'}</div>
    <div style="font-size:11px;color:#64748b;text-align:right;margin-top:2px">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
</div>
<div class="gr">
  <div class="cd">
    <h3 class="ct">Patient Details</h3>
    <div class="rw"><span class="lb">Patient Name:</span><span class="vl">${patientName}</span></div>
    <div class="rw"><span class="lb">Patient ID:</span><span class="vl">#${admission?.patientId || 'N/A'}</span></div>
    <div class="rw"><span class="lb">Gender / Age:</span><span class="vl">${admission?.patient?.gender || 'N/A'} / ${admission?.patient?.age || 'N/A'}</span></div>
    <div class="rw"><span class="lb">Phone:</span><span class="vl">${admission?.patient?.phone || 'N/A'}</span></div>
  </div>
  <div class="cd">
    <h3 class="ct">Admission Record</h3>
    <div class="rw"><span class="lb">Admission ID:</span><span class="vl">#${admission?.id || 'N/A'}</span></div>
    <div class="rw"><span class="lb">Status:</span><span class="vl">${statusName}</span></div>
    <div class="rw"><span class="lb">Admission Date:</span><span class="vl">${fmtDate(admission?.admissionDate)}</span></div>
    <div class="rw"><span class="lb">Discharge Date:</span><span class="vl">${fmtDate(admission?.dischargeDate || new Date().toISOString())}</span></div>
    <div class="rw"><span class="lb">Ward / Bed:</span><span class="vl">${wardName} (Bed #${bedNum})</span></div>
    <div class="rw"><span class="lb">Attending Doctor:</span><span class="vl">${doctorName}</span></div>
  </div>
</div>
<h3 style="font-size:14px;font-weight:700;color:#1e293b;text-transform:uppercase;margin-bottom:10px">Itemized Charge &amp; Bill Ledger</h3>
<table>
  <thead><tr>
    <th style="width:40px;text-align:center">#</th>
    <th style="width:130px">Category</th>
    <th>Description &amp; Charge Details</th>
    <th style="width:110px;text-align:right">Amount</th>
    <th style="width:90px;text-align:center">Status</th>
  </tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>
<div class="sm">
  <div style="flex:1;padding-right:20px">
    <div class="stamp" style="${stampStyle}">${stampText}</div>
    <p style="font-size:11px;color:#64748b;margin-top:10px;line-height:1.4">This official statement reflects all charges accumulated during this hospital stay.</p>
  </div>
  <div class="tb">
    <div class="tr_"><span class="lb">Subtotal Charges:</span><span class="vl">${fmtCur(total)}</span></div>
    <div class="tr_"><span class="lb">Total Paid:</span><span class="vl" style="color:#059669">${fmtCur(paid)}</span></div>
    <div class="tr_ gd"><span>Balance Due:</span><span>${fmtCur(due)}</span></div>
  </div>
</div>
<div class="ft">
  <div>Generated on ${new Date().toLocaleString()} &bull; Official Computer Generated Invoice</div>
  <div class="sg">Authorized Signature / Cashier</div>
</div>
</div>
</body>
</html>`;
  };

  const downloadAdmissionInvoicePdf = async (admission: any, bills: any[] = []): Promise<void> => {
    if (!admission || typeof document === 'undefined') return;

    const html = generateInvoiceHtml(admission, bills);
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      position: 'fixed',
      top: '0',
      left: '-4000px',
      width: '800px',
      background: '#fff',
    });
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    const pageEl = wrapper.querySelector('.page') as HTMLElement | null;
    if (!pageEl) {
      document.body.removeChild(wrapper);
      return;
    }
    pageEl.style.margin = '0';

    await new Promise((r) => window.setTimeout(r, 300));

    const h2c = (await import('html2canvas' as unknown as string)).default as (el: HTMLElement | SVGElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
    const { jsPDF } = await import('jspdf');

    const canvas = await h2c(pageEl, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
    });
    document.body.removeChild(wrapper);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const pdfH = pw / ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, pw, pdfH);
    let hl = pdfH - ph;
    let pos = 0;
    while (hl > 0) {
      pos = hl - pdfH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, pos, pw, pdfH);
      hl -= ph;
    }

    const patStr = admission?.patient ? `${admission.patient.firstName}_${admission.patient.lastName}`.replace(/[^a-z0-9]/gi, '_') : 'Patient';
    pdf.save(`Admission_Invoice_${admission.id}_${patStr}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return { generateInvoiceHtml, downloadAdmissionInvoicePdf };
}
