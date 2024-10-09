
import * as amqp from "amqplib";

async function startWorker() {
  try {
    const connection = await amqp.connect(process.env.AMQP_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('notification_queue');
    console.log('Worker started, waiting for messages');
    channel.consume('notification_queue', async (msg: string | any) => {
      if (msg !== null) {
        const notification = JSON.parse(msg.content.toString());
        if (notification.channel === 'email') {
          console.log(msg);
        } else if (notification.channel === 'push') {
          console.log(msg);
        }
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

export default startWorker;

