import validator from 'validator';
import { showAlert } from '../utils/showAlert';
import updateData from '../utils/updateData';

export const updateUserData = form => {
  form.addEventListener('submit', async e => {
    try {
      e.preventDefault();
      const btn = document.querySelector('.btn--data');
      const navNameEl = document.querySelector('.nav__user-name');

      const name = form['name'].value;
      const email = form['email'].value;

      if (!validator.isEmail(email)) return showAlert('error', 'Please enter a valid email address');

      btn.textContent = 'Updating...'
      btn.classList.add('btn--disabled');

      const { data } = await updateData('data', {
        name: name,
        email: email,
      });

      navNameEl.textContent = data.user.name;
      btn.textContent = 'Update data'
      btn.classList.remove('btn--disabled');

    } catch (err) {
      showAlert('error', `Something went wrong. ${err.response.data.message}`);
      btn.textContent = 'Update data'
      btn.classList.remove('btn--disabled');
    }
  });
};

export const updatePassword = form => {
  const btn = document.querySelector('.btn--password');
  form.addEventListener('submit', async e => {
    try {
      e.preventDefault();

      if (form['password'].value !== form['passwordConfirm'].value) return showAlert('error', 'Password and confirm password do not match!');
      btn.textContent = 'Updating...';
      btn.classList.add('btn--disabled');

      await updateData('password', {
        passwordCurrent: form['passwordCurrent'].value,
        password: form['password'].value,
        passwordConfirm: form['passwordConfirm'].value
      });

      form['passwordCurrent'].value = '';
      form['password'].value = '';
      form['passwordConfirm'].value = '';
      btn.textContent = 'Update password';
      btn.classList.remove('btn--disabled');

    } catch (err) {
      showAlert('error', `Something went wrong. ${err.response.data.message}`);
      form['passwordCurrent'].value = '';
      form['password'].value = '';
      form['passwordConfirm'].value = '';
      btn.textContent = 'Update password';
      btn.classList.remove('btn--disabled');
    }
  });
};