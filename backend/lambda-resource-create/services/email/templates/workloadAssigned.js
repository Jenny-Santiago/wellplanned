exports.workloadAssignedTemplate = (workload, clienteNombre, idCuenta) => {
  const subject = "WellPlanned - Nueva Asignación";

  const html = `
<html>
  <body style="margin:0; padding:0; font-family:'Segoe UI', Arial, Helvetica, sans-serif; background-color:#f4f6f8; color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="padding:40px 10px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:#111827; padding:30px; text-align:center; color:#fff;">
              <h1 style="margin:0; font-size:26px; color:#facc15;">WellPlanned</h1>
              <p style="margin:6px 0 0 0; font-size:16px;">Nueva carga de trabajo asignada</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <p>Hola <strong>${workload.responsable_email}</strong>,</p>
              <p>Se le ha asignado un <strong>Well-Architected Review</strong> para <strong>${clienteNombre}</strong>.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; border-radius:6px; margin-top:20px;">
                <tr><td style="padding:10px;"><strong>ID Cliente:</strong> ${idCuenta}</td></tr>
                <tr><td style="padding:10px;"><strong>SDM:</strong> ${workload.sdm}</td></tr>
                <tr><td style="padding:10px;"><strong>Fecha Inicio:</strong> ${workload.fecha_inicio}</td></tr>
                <tr><td style="padding:10px;"><strong>Fecha Fin:</strong> ${workload.fecha_fin}</td></tr>
              </table>

              <p style="color:#9ca3af; font-size:13px; text-align:center; margin-top:20px;">
                ⚠️ Este es un correo automático. Por favor no responder.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#9ca3af;">
              &copy; ${new Date().getFullYear()} WellPlanned
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = `
Hola ${workload.responsable_email},

Se le ha asignado un Well-Architected Review para el cliente ${clienteNombre}.

- ID Cliente: ${idCuenta}
- SDM: ${workload.sdm}
- Fecha Inicio: ${workload.fecha_inicio}
- Fecha Fin: ${workload.fecha_fin}

⚠️ No responder.
`;

  return { subject, html, text };
};
