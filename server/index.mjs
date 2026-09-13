import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import {
  configuration,
  createContactService,
  smtpOptions,
} from "./contact.mjs";
import { portfolioServer } from "./http.mjs";

const config = configuration(process.env);
const transport = config
  ? nodemailer.createTransport(smtpOptions(config))
  : null;
const contact = createContactService({
  config,
  sendMail: (message) => transport.sendMail(message),
});
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid PORT");
const server = await portfolioServer({
  dist: fileURLToPath(new URL("../dist/", import.meta.url)),
  contact,
});
server.listen(port, process.env.HOST ?? "127.0.0.1");
