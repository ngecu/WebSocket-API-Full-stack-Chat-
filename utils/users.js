const axios = require('axios');

// Join user to chat
async function userJoin(id, username, room) {
  const user = { id, username, room };
  try {
    const response = await axios.post('http://localhost:3000/users', user);
    console.log("response data is ",response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

// Get current user
async function getCurrentUser(id) {
  try {
    const response = await axios.get(`http://localhost:3000/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
  }
}

// User leaves chat
async function userLeave(id) {
  try {
    const response = await axios.delete(`http://localhost:3000/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// Get room users
async function getRoomUsers(room) {
  try {
    const response = await axios.get('http://localhost:3000/users', {
      params: {
        room: room
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting room users:', error);
  }
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};