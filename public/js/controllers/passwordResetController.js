import axios from 'axios';
import { showAlert } from '../utils/showAlert';

export const passwordResetController = passwordResetSection => {
  const query = window.location.search.slice(1);
  const user = (query.split('&')[0]).slice(2);
  const token = (query.split('&')[1]).slice(2);

  document.querySelector('.form--password-reset').addEventListener('submit', async e => {
    e.preventDefault();
    const resetBtn = document.querySelector('.btn--reset-password');
    try {
      const password = document.querySelector('#password').value;
      const passwordConfirm = document.querySelector('#passwordConfirm').value;

      if (password !== passwordConfirm) return showAlert('error', 'The passwords do not match!');

      resetBtn.classList.add('btn--disabled');
      resetBtn.textContent = 'Resetting...';

      const res = await axios({
        method: 'POST',
        url: `/api/v1/users/resetPassword/${user}/${token}`,
        data: {
          password: password,
          passwordConfirm: passwordConfirm
        }
      });

      resetBtn.classList.remove('btn--disabled');
      resetBtn.textContent = 'Reset Password';

      if (res.data.status === 'success') {
        showAlert('success', 'Password reset successful! Now, you can try to login again.');
        return setTimeout(() => window.location.assign('/login'), 3000);
      }

    } catch (err) {
      showAlert('error', `Something went wrong! ${err?.response?.data?.message || err.message}`, 8);
      resetBtn.classList.remove('btn--disabled');
      resetBtn.textContent = 'Reset Password';
    }
  });
};