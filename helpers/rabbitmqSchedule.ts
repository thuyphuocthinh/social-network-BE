import * as cron from "node-cron";
import * as amqp from "amqplib";
import Reminders from '../models/reminders.model';
import Tasks from "../models/tasks.model";

// get task to be reminded
const getListTaskReminded = async (userId: string) => {
    const currentTime: Date = new Date();

    const tasksReminded = await Tasks.find({
        deleted: false,
        reminderId: { $exists: true, $ne: "" },
        createdBy: userId
    });

    const dueReminders = tasksReminded.map(async (task) => {
        try {
            const reminder = await Reminders.findOne({
                _id: task.reminderId,
                deleted: false,
                createdBy: userId,
                createdAt: {$lte: currentTime}
            });

            if (!reminder) {
                return;
            }

            await Promise.all([
                Tasks.updateOne({ _id: task._id, deleted: false }, { reminderId: "" }),
                Reminders.updateOne({ _id: reminder._id, deleted: false }, { deleted: true })
            ]);

            return reminder;

        } catch (err) {
            console.error(`Error processing reminder for task ${task._id}:`, err);
        }
    });

    return dueReminders;
};

// Send reminder message to RabbitMQ
const sendReminderToQueue = (userId: string, reminder: any) => {
    amqp.connect(process.env.AMQP_URL, (err: Error, conn: any) => {
      conn.createChannel((err: Error, ch: any) => {
        const queueName = `reminders_${userId}`;  // A unique queue per user
        ch.assertQueue(queueName, { durable: false });
        ch.sendToQueue(queueName, Buffer.from(JSON.stringify(reminder)));
        console.log(`Reminder sent to queue: ${reminder.note}`);
      });
    });
}

// task schedule
const scheduling = (userId: string) => {
    cron.schedule('* * * * *', async () => {
        const dueReminders = await getListTaskReminded(userId);  // Fetch reminders that are due
        dueReminders.forEach((reminder: any) => {
          sendReminderToQueue(reminder.userId, reminder);  // Send reminder to RabbitMQ
        });
    });
}

export const startProducer = (userId: string) => {
    scheduling(userId);
}