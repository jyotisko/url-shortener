import axios from 'axios';
import { showAlert } from './showAlert';

export const createAnonymousUrl = async urlToShorten => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/urls/anonymous',
      data: {
        originalUrl: urlToShorten
      }
    });

    if (res.data.status === 'success') showAlert('success', 'URL has been shortened!');
    return res.data;

  } catch (err) {
    throw err;
  }
};

export const createUrlForLoggedInUser = async (urlToShorten, user) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/urls',
      data: {
        originalUrl: urlToShorten,
        user: user
      }
    });

    if (res.data.status === 'success') showAlert('success', 'URL has been shortened!');
    return res.data;

  } catch (err) {
    throw err;
  }
};

export const updateUrl = async (id, code) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/urls/${id}`,
      data: {
        shortCode: code
      },
      contentType: 'application/json'
    });

    if (res.data.status === 'success') showAlert('success', 'URL has updated!');
    return res.data;

  } catch (err) {
    throw err;
  }
};

export const deleteUrl = async id => {
  try {
    await axios({
      method: 'DELETE',
      url: `/api/v1/urls/${id}`,
    });
  } catch (err) {
    throw err;
  }
};
