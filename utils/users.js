const axios = require('axios');

// Join user to chat
async function userJoin(id, username, room) {
  // Check if the user already exists with the provided username
  try {
    const response = await axios.get(`http://localhost:3000/users?username=${username}`);
    const existingUser = response.data;
    if (existingUser) {
      console.log("User already exists:", existingUser);
      return existingUser;
    }
  } catch (error) {
    // If an error occurs, log it
    console.error('Error checking user existence:', error);
  }

  // If the user doesn't exist, add them to the database
  const user = { id, username, room };
  try {
    const response = await axios.post('http://localhost:3000/users', user);
    console.log("User added:", response.data);
    return response.data;
  } catch (error) {
    // If an error occurs, log it
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