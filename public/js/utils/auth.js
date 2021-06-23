import axios from 'axios';
import { showAlert } from './showAlert';

// @params'type': can be 'login' or 'signup'
// @params 'data': Object
export const authenticate = async (type, data) => {
  try {
    const url = type === 'login' ? '/api/v1/users/login' : '/api/v1/users/signup';
    const res = await axios({
      method: 'POST',
      url: url,
      data: data,
      contentType: 'application/json'
    });

    if (res.data.status === 'success') {
      showAlert('success', 'You are successfully logged in!');
      setTimeout(() => {
        window.location.assign('/');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', `Something went wrong. ${err.response.data.message}`);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      showAlert('success', 'You have been successfully logged out!');
      setTimeout(() => {
        window.location.assign('/');
      }, 2000);
    }

  } catch (err) {
    throw err;
  }
};