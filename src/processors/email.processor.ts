import { Job, Worker } from "bullmq";
import { NotificationDto } from "../dto/notification.dto";
import { MAILER_QUEUE } from "../queues/mailer.queue";
import { getRedisConnObject } from "../config/redis.config";
import { MAILER_PAYLOAD } from "../producers/email.producer";
import { sendMail } from "../services/mailer.service";
import { renderMailTemplate } from "../templates/templates.handler";
import logger from "../config/logger.config";

export const setupMailerWorker = () => {
  const emailProcessor = new Worker<NotificationDto>(
    MAILER_QUEUE,
    async (job: Job) => {
      if (job.name != MAILER_PAYLOAD) {
        throw new Error("Invalid job name");
      }
      const payload = job.data;
      console.log(`Processing email for :${JSON.stringify(payload)}`);
      const emailContent = await renderMailTemplate(
        payload.templateId,
        payload.params,
      );
      await sendMail(payload.to, payload.subject, emailContent);
      logger.info(
        `Email send to ${payload.to} with subject ${payload.subject}`,
      );
    },
    { connection: getRedisConnObject() },
  );

  emailProcessor.on("failed", () => {
    console.log("Email processing failed");
  });

  emailProcessor.on("completed", () => {
    console.log("Email processing completed successfully");
  });
};
