import path from "path";
import fs from "fs";
import Handlebars from "handlebars";

/**
 * Function to get email template
 * @param templateName - template name without extension
 * @example
 * ```ts
 * getTemplate('default-template')({
 *   title: "Hello World",
 * })
 * ```
 */
export function getTemplate(templateName: string): HandlebarsTemplateDelegate {
  const templatePath = path.resolve(__dirname, "../templates");
  const filePath = path.resolve(templatePath, `${templateName}.html`);

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template folder does not exists");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }

  const fileContent = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  return Handlebars.compile(fileContent);
}
