import amqplib from 'amqplib';

const EXCHANGE_NAME = 'MICROSERVICES-TEMPLATE';
const QUEUE_NAME = 'CLIENT_QUEUE';
const ROUTING_KEY = 'CLIENT_ROUTING_KEY';

export const createChannel = async () => {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);

    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'direct');
    return channel;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const publishMessage = async (channel, routingKey, message) => {
  console.log('Publishing message...');
  try {
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(message));
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const subscribeMessage = async (channel) => {
  const queue = await channel.assertQueue(QUEUE_NAME);
  channel.bindQueue(queue.queue, EXCHANGE_NAME, ROUTING_KEY);
  channel.consume(queue.queue, (data) => {
    if (data) {
      console.log('Consumer received data!');
      const cleanData = data.content.toString();
      channel.ack(cleanData);
    }
  });
};
