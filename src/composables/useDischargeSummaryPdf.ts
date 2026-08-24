export function useDischargeSummaryPdf() {
  const fmtDate = (raw?: string | null): string => {
    if (!raw) return 'N/A';
    try {
      return new Date(raw).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return raw;
    }
  };

  const fmtDateTime = (raw?: string | null): string => {
    if (!raw) return 'N/A';
    try {
      return new Date(raw).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return raw;
    }
  };

  const generateSummaryHtml = (admission: any, labTests: any[] = [], surgeries: any[] = [], treatments: any[] = []): string => {
    const p = admission?.patient;
    const patientName = p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : 'N/A';
    const doctorName = admission?.attendingDoctor?.name || 'N/A';
    const departmentName = admission?.attendingDoctor?.department?.name || 'Inpatient Care';
    const wardName = admission?.ward?.name || 'N/A';
    const bedNum = admission?.wardBed?.bedNumber || 'N/A';
    const reasonForAdmission = admission?.reasonForAdmission || 'Not specified';

    // 1. Calculate Length of Stay
    let lengthOfStay = 'N/A';
    if (admission?.admissionDate) {
      const start = new Date(admission.admissionDate).getTime();
      const end = admission?.dischargeDate ? new Date(admission.dischargeDate).getTime() : new Date().getTime();
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      lengthOfStay = `${days} Day${days > 1 ? 's' : ''}`;
    }

    // 2. Lab Tests Rows
    const labRowsHtml =
      labTests.length > 0
        ? labTests
            .map(
              (lab, idx) => `
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; text-align: center;">${idx + 1}</td>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-weight: 600; color: #1e293b;">${lab.labTestName || 'Lab Test'}</td>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 11px;">${fmtDateTime(lab.reportTime || lab.createdAt)}</td>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; text-align: center;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
                ${lab.status || 'Completed'}
              </span>
            </td>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12px; color: #475569;">${lab.details || 'Test completed and results verified.'}</td>
          </tr>`
            )
            .join('')
        : `<tr><td colspan="5" style="border: 1px solid #e2e8f0; padding: 14px; text-align: center; color: #64748b; font-style: italic;">No laboratory investigations were conducted during this admission.</td></tr>`;

    // 3. Surgeries Rows
    const surgeryRowsHtml =
      surgeries.length > 0
        ? surgeries
            .map((s, idx) => {
              const sName = s.surgery?.name || `Surgery #${s.id}`;
              const theatreName = s.operationTheatre?.name || 'General Theatre';
              return `
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; text-align: center;">${idx + 1}</td>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-weight: 600; color: #1e293b;">${sName}</td>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 11px;">${theatreName}</td>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 11px;">${fmtDateTime(s.surgeryTime)}</td>
            <td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12px; color: #475569;">${s.notes || 'Procedure successfully completed without complications.'}</td>
          </tr>`;
            })
            .join('')
        : `<tr><td colspan="5" style="border: 1px solid #e2e8f0; padding: 14px; text-align: center; color: #64748b; font-style: italic;">No surgical procedures were performed during this admission.</td></tr>`;

    // 4. Latest Treatment Session Medications (Follow-up for next 5 days)
    // treatments is sorted descending, so treatments[0] is the latest treatment session
    const latestTreatment = treatments.length > 0 ? treatments[0] : null;
    const medicines: any[] = latestTreatment?.treatmentDetails || [];

    const medicationRowsHtml =
      medicines.length > 0
        ? medicines
            .map(
              (m, idx) => `
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 9px 10px; text-align: center; font-weight: bold;">${idx + 1}</td>
            <td style="border: 1px solid #e2e8f0; padding: 9px 10px;">
              <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${m.medicine || 'Prescribed Medicine'}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${m.doctorInstructions || 'Take as instructed'}</div>
            </td>
            <td style="border: 1px solid #e2e8f0; padding: 9px 10px; font-size: 12px; color: #334155;">
              <div>${m.dosageInstructions || '-'}</div>
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">${m.route || 'Oral'}</div>
            </td>
            <td style="border: 1px solid #e2e8f0; padding: 9px 10px; font-size: 12px; font-weight: 600; color: #2563eb;">${m.frequency || 'As directed'}</td>
            <td style="border: 1px solid #e2e8f0; padding: 9px 10px; text-align: center;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">
                5 Days
              </span>
            </td>
          </tr>`
            )
            .join('')
        : `<tr><td colspan="5" style="border: 1px solid #e2e8f0; padding: 14px; text-align: center; color: #64748b; font-style: italic;">No active follow-up medications recorded. Please consult your physician if symptoms persist.</td></tr>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Discharge Summary - ${patientName}</title>
  <style>
    * { box-sizing: border-box; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; }
    body { margin: 0; padding: 0; background: #ffffff; color: #1e293b; line-height: 1.4; }
    .page { width: 210mm; margin: 0 auto; padding: 24px 30px; background: #ffffff; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
    .hospital-name { font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0; letter-spacing: -0.5px; }
    .hospital-sub { font-size: 11.5px; color: #64748b; margin-top: 2px; }
    
    .doc-title-box { text-align: right; }
    .doc-title { font-size: 18px; font-weight: 800; color: #2563eb; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .doc-ref { font-size: 12px; font-weight: 600; color: #475569; margin-top: 3px; }
    .doc-date { font-size: 11px; color: #64748b; }

    /* Patient & Admission Grid */
    .patient-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; display: grid; grid-template-columns: 1.2fr 1fr 1fr 1.1fr; gap: 8px 14px; font-size: 12px; }
    .p-item { display: flex; flex-direction: column; }
    .p-lbl { color: #64748b; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
    .p-val { color: #0f172a; font-size: 12.5px; font-weight: 700; margin-top: 1px; }

    /* Section Cards */
    .section-block { margin-bottom: 16px; page-break-inside: avoid; }
    .sec-header { display: flex; align-items: center; justify-content: space-between; background: #f1f5f9; border-left: 4px solid #2563eb; padding: 6px 10px; margin-bottom: 8px; border-radius: 0 6px 6px 0; }
    .sec-title { font-size: 12.5px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.4px; margin: 0; }
    .sec-badge { font-size: 10px; font-weight: 700; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; }

    /* Content Boxes */
    .reason-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; font-size: 12.5px; color: #334155; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 6px; }
    th { background: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.4px; border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }

    /* Followup Banner */
    .followup-highlight { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; font-size: 11.5px; color: #1e40af; display: flex; align-items: center; justify-content: space-between; }

    /* Instructions & Signatures */
    .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 16px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; }
    .inst-box { color: #475569; }
    .inst-box p { margin: 2px 0; }
    .inst-title { font-weight: 700; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; }

    .sig-box { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; }
    .sig-line { width: 180px; border-top: 1px solid #475569; padding-top: 4px; font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 30px; }
    .sig-sub { font-size: 10px; color: #64748b; }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="hospital-name">HOSPITAL MANAGEMENT SYSTEM</h1>
        <div class="hospital-sub">Department of Inpatient Care &bull; Patient Discharge Documentation</div>
      </div>
      <div class="doc-title-box">
        <h2 class="doc-title">PATIENT DISCHARGE SUMMARY</h2>
        <div class="doc-ref">Admission Record #${admission?.id || '000'}</div>
        <div class="doc-date">Discharged: ${fmtDate(admission?.dischargeDate || new Date().toISOString())}</div>
      </div>
    </div>

    <!-- Patient & Stay Summary -->
    <div class="patient-bar">
      <div class="p-item">
        <span class="p-lbl">Patient Name</span>
        <span class="p-val">${patientName}</span>
      </div>
      <div class="p-item">
        <span class="p-lbl">Age / Gender</span>
        <span class="p-val">${p?.age || 'N/A'} yrs &bull; ${p?.gender || 'N/A'}</span>
      </div>
      <div class="p-item">
        <span class="p-lbl">Patient ID</span>
        <span class="p-val">#${p?.id || admission?.patientId || 'N/A'}</span>
      </div>
      <div class="p-item">
        <span class="p-lbl">Contact Phone</span>
        <span class="p-val">${p?.phone || 'N/A'}</span>
      </div>
      <div class="p-item">
        <span class="p-lbl">Attending Physician</span>
        <span class="p-val">${doctorName}</span>
      </div>
      <div class="p-item">
        <span class="p-lbl">Department</span>
        <span class="p-val">${departmentName}</span>
      </div>
      <div class="p-item">
        <span class="p-lbl">Ward / Allocated Bed</span>
        <span class="p-val">${wardName} (Bed #${bedNum})</span>
      </div>
      <div class="p-item">
        <span class="p-lbl">Length of Stay</span>
        <span class="p-val">${lengthOfStay} (${fmtDate(admission?.admissionDate)} &rarr; ${fmtDate(admission?.dischargeDate || new Date().toISOString())})</span>
      </div>
    </div>

    <!-- 1. Why Admitted? -->
    <div class="section-block">
      <div class="sec-header">
        <h3 class="sec-title">1. Reason for Admission (Clinical Summary)</h3>
        <span class="sec-badge">Admission Diagnosis</span>
      </div>
      <div class="reason-box">
        <strong>Primary Reason / Admission Notes:</strong>
        <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 13px;">${reasonForAdmission}</p>
      </div>
    </div>

    <!-- 2. Lab Tests During Admission -->
    <div class="section-block">
      <div class="sec-header">
        <h3 class="sec-title">2. Laboratory &amp; Diagnostic Investigations</h3>
        <span class="sec-badge">${labTests.length} Investigation${labTests.length === 1 ? '' : 's'}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">#</th>
            <th style="width: 170px;">Investigation Name</th>
            <th style="width: 120px;">Date &amp; Time</th>
            <th style="width: 90px; text-align: center;">Status</th>
            <th>Clinical Observations / Findings</th>
          </tr>
        </thead>
        <tbody>
          ${labRowsHtml}
        </tbody>
      </table>
    </div>

    <!-- 3. Surgeries Done During Admission -->
    <div class="section-block">
      <div class="sec-header">
        <h3 class="sec-title">3. Surgical Procedures &amp; Interventions</h3>
        <span class="sec-badge">${surgeries.length} Procedure${surgeries.length === 1 ? '' : 's'}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">#</th>
            <th style="width: 170px;">Procedure Name</th>
            <th style="width: 130px;">Operation Theatre</th>
            <th style="width: 120px;">Date &amp; Time</th>
            <th>Surgical Notes &amp; Outcome</th>
          </tr>
        </thead>
        <tbody>
          ${surgeryRowsHtml}
        </tbody>
      </table>
    </div>

    <!-- 4. Follow-up Medication for Next 5 Days -->
    <div class="section-block">
      <div class="sec-header">
        <h3 class="sec-title">4. Follow-up Medication &amp; Post-Discharge Prescription</h3>
        <span class="sec-badge" style="background: #dbeafe; color: #1d4ed8; font-weight: 800;">5-Day Course</span>
      </div>
      <div class="followup-highlight">
        <span><strong>Prescription Instructions:</strong> Please take all prescribed follow-up medicines regularly for the <strong>next 5 days</strong> as detailed below.</span>
        <span><strong>Duration: 5 Days</strong></span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">#</th>
            <th>Medicine Name &amp; Instructions</th>
            <th style="width: 130px;">Dosage &amp; Route</th>
            <th style="width: 110px;">Frequency</th>
            <th style="width: 90px; text-align: center;">Duration</th>
          </tr>
        </thead>
        <tbody>
          ${medicationRowsHtml}
        </tbody>
      </table>
    </div>

    <!-- Footer & Follow-up Instructions -->
    <div class="footer-grid">
      <div class="inst-box">
        <div class="inst-title">Post-Discharge Care &amp; Warning Signs:</div>
        <p>&bull; Complete the full 5-day course of prescribed medication unless advised otherwise.</p>
        <p>&bull; Seek immediate medical attention if you experience high fever, severe pain, or bleeding.</p>
        <p>&bull; Schedule a follow-up consultation with your attending physician within 5 to 7 days.</p>
      </div>
      <div class="sig-box">
        <div class="sig-line">${doctorName}</div>
        <div class="sig-sub">Attending Physician / Authorized Signature</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const downloadDischargeSummaryPdf = async (admission: any, labTests: any[] = [], surgeries: any[] = [], treatments: any[] = []): Promise<void> => {
    if (!admission || typeof document === 'undefined') return;

    const html = generateSummaryHtml(admission, labTests, surgeries, treatments);
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
    pdf.save(`Discharge_Summary_#${admission.id}_${patStr}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return { generateSummaryHtml, downloadDischargeSummaryPdf };
}
