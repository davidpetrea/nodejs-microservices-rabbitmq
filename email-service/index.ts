import express, { Request, Response } from 'express';
import amqplib, { Channel } from 'amqplib';
import 'dotenv/config';

let channel: Channel;

async function connect() {
  const connection = await amqplib.connect(
    process.env.RABBITMQ_URL ?? 'amqp://localhost:5672/'
  );
  channel = await connection.createChannel();
}

connect().then(() => {
  channel.consume('EmailQueue', (data: any) => {
    const parsedData = JSON.parse(data.content);

    //Send email to user
    console.log('Email service received new message:', parsedData);
    console.log('Sending email...');

    //Ack message after email has been sent
    channel.ack(data);

    //Send message to client service queue
    channel.sendToQueue(
      'ClientResponseQueue',
      Buffer.from(JSON.stringify({ msg: `Email was sent!` }))
    );
  });
});

const app = express();

// default to port 5000 if no env PORT is specified
const PORT = process.env.EMAIL_SERVICE_PORT || 5001;

app.get('/api/hello', (req, res) => {
  res.status(200).json({ msg: 'Hello from EMAIL SERVICE' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Email service listening on port ${PORT}`);
});
