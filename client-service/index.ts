import express from 'express';
import amqplib, { Channel } from 'amqplib';
import 'dotenv/config';

let channel: Channel;

async function connect() {
  const connection = await amqplib.connect(
    process.env.RABBITMQ_URL ?? 'amqp://localhost:5672/'
  );
  channel = await connection.createChannel();
  // Create an exchange with direct routing
  await channel.assertExchange('EmailExchange', 'direct');
  // Create the EmailQueue
  await channel.assertQueue('EmailQueue');
  // Bind the EmailQueue to the EmailExchange with pattern 'email'
  await channel.bindQueue('EmailQueue', 'EmailExchange', 'email');

  // Create the ClientResponseQueue
  await channel.assertQueue('ClientResponseQueue');
}

connect().then(() => {
  channel.consume('ClientResponseQueue', (data: any) => {
    const parsedData = JSON.parse(data.content);
    channel.ack(data);

    console.log('Client received:', parsedData);
  });
});

const app = express();

//Init Middleware
app.use(express.json());

// default to port 5000 if no env PORT is specified
const PORT = process.env.CLIENT_SERVICE_PORT || 3027;

app.get('/api/create-user', async (req, res) => {
  try {
    //Get email and password from request body
    const { email, password } = req.body;

    const payload = {
      email,
      password,
    };

    //Send request to user service
    const response = await fetch('http://usersvc:5000/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log('response', responseData);

    res.status(200).json({
      msg: 'Hello from CLIENT SERVICE!',
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Client service listening on port ${PORT}`);
});
