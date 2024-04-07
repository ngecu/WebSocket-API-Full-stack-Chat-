const moment = require('moment');
const axios = require('axios');

async function addMessage(id, username, room,message) {
  const body = { id, username, room,message };
  try {
    const response = await axios.post('http://localhost:3000/messages', body);
    console.log("response data is ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

async function getRoomMessages(room) {
  try {
    const response = await axios.get('http://localhost:3000/messages', {
      params: {
        room: room
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting room messages:', error);
  }
}

function formatMessage(username, text,type) {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    type
  };
}

module.exports = {formatMessage,getRoomMessages,addMessage};
