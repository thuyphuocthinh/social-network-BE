import { io } from "..";
import Reminders from "../models/reminders.model";
import Tasks from "../models/tasks.model";

// Keep track of tasks that have already been scheduled
const activeReminders = new Set();
const reminderTimeouts = new Map();


export const getListTaskReminded = async (userId: string) => {
    const tasksReminded = await Tasks.find({
        deleted: false,
        reminderId: { $exists: true, $ne: "" },
        createdBy: userId
    });

    tasksReminded.map(async (task) => {
        try {
            const reminder = await Reminders.findOne({
                _id: task.reminderId,
                deleted: false,
                createdBy: userId
            });

            if (!reminder) {
                return;
            }

            // Avoid scheduling the same task reminder multiple times
            if (activeReminders.has(task.id)) {
                console.log(`Reminder for task ${task._id} is already scheduled`);
                return; // Skip if the task is already scheduled
            }

            const difference = reminder.remindedAt.valueOf() - Date.now();
            console.log(`Difference between ${reminder.remindedAt} and ${new Date()} is ${difference} ms`);

            activeReminders.add(task.id); // Mark this task as scheduled
            console.log("activeReminders: ", activeReminders);

            if (difference <= 0) {
                // Trigger reminder immediately if it's due
                await handleReminder(task, reminder);
            } else {
                // Schedule reminder in the future
                const timeOutId = setTimeout(async () => {
                    await handleReminder(task, reminder);
                }, difference);
                reminderTimeouts.set(task.id, timeOutId);
            }
        } catch (err) {
            console.error(`Error processing reminder for task ${task._id}:`, err);
        }
    });
};

// add reminder
export const addReminder = (taskId: string, userId: string) => {
    // Avoid scheduling the same task reminder multiple times
    if (activeReminders.has(taskId)) {
        console.log(`Reminder for task ${taskId} is already scheduled`);
        return; // Skip if the task is already scheduled
    }
    getListTaskReminded(userId);
}

// delete reminder
export const deleteReminder = (taskId: string, userId: string) => {
    // Avoid scheduling the same task reminder multiple times
    if (activeReminders.has(taskId)) {
        activeReminders.delete(taskId);
  
        // Clear the scheduled timeout if it exists
        if (reminderTimeouts.has(taskId)) {
          clearTimeout(reminderTimeouts.get(taskId)); // Cancel the reminder
          reminderTimeouts.delete(taskId); // Remove the reference
        }
    }
    getListTaskReminded(userId);
}


// Helper function to handle reminder notification and updates
const handleReminder = async (task, reminder) => {
    try {
        // Emit the reminder to the clients
        io.emit("remind_event", task.title);

        // Update task and reminder to mark them as handled
        await Promise.all([
            Tasks.updateOne({ _id: task._id, deleted: false }, { reminderId: "" }),
            Reminders.updateOne({ _id: reminder._id, deleted: false }, { deleted: true })
        ]);

        console.log(`Reminder sent for task ${task.title}`);

        // Remove task from activeReminders once handled
        activeReminders.delete(task.id);       
        reminderTimeouts.delete(task.id);  
    } catch (err) {
        console.error(`Error handling reminder for task ${task._id}:`, err);
    }
};

