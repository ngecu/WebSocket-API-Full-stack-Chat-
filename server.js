const path = require("path");
const express = require("express");
const WebSocket = require('ws'); // Changed from 'ws' to require('ws')
const { v4: uuidv4 } = require('uuid'); // Importing uuid library

const formatMessage = require("./utils/messages");
require("dotenv").config();

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const PORT = process.env.PORT || 5000;
const app = express();
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => { // Changed 'connection' to 'ws' for WebSocket
  // Generate a unique identifier for this connection
  const userId = uuidv4();
  ws.userId = userId; // Storing the unique identifier as a property of the WebSocket object

  console.log("WebSocket connected with ID:", userId);

  ws.on("message", (message) => {
    if (message instanceof Buffer) {
      // Convert the Buffer object to a string
      message = message.toString();
    }

    message = JSON.parse(message);

    if (message.type === "joinRoom") {
      const { username, room } = message.payload;
      userJoin(ws.userId, username, room)
      .then(user => {
        ws.room = user.room; // Storing room information in the WebSocket object
        console.log("user is ",user);
        ws.send(JSON.stringify(formatMessage(botName, "Welcome to ChatCord!","message")));
        wss.clients.forEach((client) => {
       
          if (client.readyState === WebSocket.OPEN && client.room === user.room) {
            client.send(JSON.stringify(formatMessage(botName, `${user.username} has joined the chat`,"message")));
          }
        });
  
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.room === user.room) {
          getRoomUsers(user.room)
            .then(users => {
              client.send(JSON.stringify({
                type: "roomUsers",
                payload: {
                  room: user.room,
                  users
                },
              }));

            })
      
          }
        });

      })
      .catch(error => {
        console.error('Error joining user:', error);
      });

     
    } else if (message.type === "chatMessage") {

      getCurrentUser(ws.userId)
        .then(user => {

          wss.clients.forEach((client) => {
           
            if (client.readyState === WebSocket.OPEN && client.room === user.room) {
              client.send(JSON.stringify(formatMessage(user.username, message.payload, "message")));
            }
          });
        })
        .catch(error => {
          console.error('Error getting current user:', error);
        });
    }
    
  });

  ws.on("close", () => {
    console.log("WebSocket disconnected with ID:", ws.userId);
    const user = userLeave(ws.userId); // Using the generated userId to find and remove the user
    if (user) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.room === user.room) {
          client.send(JSON.stringify(formatMessage(botName, `${user.username} has left the chat`)));
        }
      });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.room === user.room) {
          client.send(JSON.stringify({
            type: "roomUsers",
            payload: {
              room: user.room,
              users: getRoomUsers(user.room),
            },
          }));
        }
      });
    }
  });
});
