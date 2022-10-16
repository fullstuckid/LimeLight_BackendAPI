import Nodemailer from "nodemailer";
import { getTemplate } from "../helpers";

export interface SendMailPropTypes<T> {
  templateName: string
  to: string | string[]
  subject: string
  data: T
}

/**
 * Send email function
 * @param param0 - send mail props
 * @example
 * ```ts
 * await sendEmail({
 *   templateName: "default-template",
 *   to: "hi@anfa.my.id",
 *   subject: "Verify your email",
 *   data: {
 *     title: "Verify your email",
 *     name: "Andrian Fadhilla"
 *   }
 * })
 * ```
 */
export async function sendEmail<T = any>({
  templateName,
  to,
  subject,
  data,
}: SendMailPropTypes<T>): Promise<boolean> {
  const transporter = Nodemailer.createTransport({
    host: process.env.MAILER_HOST as string,
    port: process.env.MAILER_PORT as unknown as number || 465,
    auth: {
      user: process.env.MAILER_USER as string,
      pass: process.env.MAILER_PASS as string,
    },
  });

  const info = await transporter.sendMail({
    from: "\"noreply\" <limelight@mail.fullstuck.my.id>",
    to,
    subject,
    html: getTemplate(templateName)(data),
  });

  if (info.accepted.length === 0) {
    return false;
  }

  return true;
}
