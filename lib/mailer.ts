import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || (user ? `Sura Warga <${user}>` : "");

  if (!user || !pass || !from) {
    throw new Error("Konfigurasi SMTP belum lengkap.");
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    from,
  };
}

export async function sendResidentAccessEmail(payload: {
  to: string;
  residentName: string;
  residentNik: string;
}) {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: payload.to,
    subject: "Akses Sistem E-Voting Sura Warga",
    text: [
      `Halo ${payload.residentName},`,
      "",
      "Berikut akses akun Anda untuk sistem E-Voting Sura Warga:",
      `Username / NIK: ${payload.residentNik}`,
      "Password default: password",
      "",
      "Silakan login menggunakan NIK sebagai username dan segera ganti mekanisme akses sesuai arahan panitia jika diperlukan.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>Halo <strong>${payload.residentName}</strong>,</p>
        <p>Berikut akses akun Anda untuk sistem <strong>E-Voting Sura Warga</strong>:</p>
        <ul>
          <li><strong>Username / NIK:</strong> ${payload.residentNik}</li>
          <li><strong>Password default:</strong> password</li>
        </ul>
        <p>Silakan login menggunakan NIK sebagai username dan segera ganti mekanisme akses sesuai arahan panitia jika diperlukan.</p>
      </div>
    `,
  });
}
