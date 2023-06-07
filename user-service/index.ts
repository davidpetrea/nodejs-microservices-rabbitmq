import express from 'express';
import amqplib, { Channel } from 'amqplib';
import 'dotenv/config';

let channel: Channel;

async function connect() {
  const connection = await amqplib.connect(
    process.env.RABBITMQ_URL ?? 'amqp://localhost:5672/'
  );
  channel = await connection.createChannel();
}

connect();

const app = express();

//Init Middleware
app.use(express.json());

// default to port 5000 if no env PORT is specified
const PORT = process.env.USER_SERVICE_PORT || 5000;

app.get('/api/hello', async (req, res) => {
  res.status(200).json({ msg: 'Hello from USER SERVICE!' });
});

app.post('/api/user', async (req, res) => {
  try {
    const { email, password } = req.body;

    //do user creation here, just log for now
    console.log(`User with email ${email} created!`);

    //Publish new message to EmailQueue
    channel.publish(
      'EmailExchange',
      'email',
      Buffer.from(
        JSON.stringify({
          action: 'new_user',
          data: {
            email,
          },
        })
      )
    );

    res
      .status(200)
      .json({ success: true, msg: 'New user created and email message sent!' });
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`User service listening on port ${PORT}`);
});
