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
    console.log(err);
  }
};