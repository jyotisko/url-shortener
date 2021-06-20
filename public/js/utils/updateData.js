import axios from 'axios';
import { showAlert } from './showAlert';

const updateData = async (type, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe',
      data: data,
      contentType: 'application/json'
    });

    if (res.data.status === 'success') showAlert('success', `${type[0].toUpperCase()}${type.slice(1)} updated successfully!`);
    return res.data;

  } catch (err) {
    throw err;
  }
};

export default updateData;
