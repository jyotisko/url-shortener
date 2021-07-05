import axios from 'axios';
import validator from 'validator';
import swal from 'sweetalert';
import { authenticate } from '../utils/auth';
import { showAlert } from '../utils/showAlert';

export default loginForm => {
  const loginSubmitBtn = document.querySelector('.btn--submit-login');

  loginForm.addEventListener('submit', async e => {
    try {
      e.preventDefault();
      loginSubmitBtn.classList.add('btn--disabled');
      loginSubmitBtn.textContent = 'Please wait...';

      await authenticate('login', {
        email: loginForm['email'].value,
        password: loginForm['password'].value
      });

      loginSubmitBtn.classList.remove('btn--disabled');
      loginSubmitBtn.textContent = 'Login';

    } catch (err) {
      showAlert('error', `Something went wrong! ${err.response.data.message || ''}`);
      loginSubmitBtn.classList.remove('btn--disabled');
      loginSubmitBtn.textContent = 'Login';
    }
  });

  loginForm.querySelector('.form__forgot-password').addEventListener('click', async () => {
    try {
      const email = await swal({
        text: 'Enter your email. We will send a verification email to this email.',
        content: 'input',
        button: {
          text: 'Send verification email!',
          closeModal: false,
        },
      });

      if (!email) return swal.stopLoading();
      if (!validator.isEmail(email)) {
        showAlert('error', 'Please enter a valid email address!', 4);
        return swal.close();
      };
      const res = await axios({
        method: 'POST',
        url: '/api/v1/users/forgotPassword',
        data: {
          email: email
        }
      });

      if (res.data.status === 'success') showAlert('success', 'We have sent you the password reset link at the email address', 8);
      swal.close();

    } catch (err) {
      showAlert('error', `Something went wrong! ${err?.response?.data?.message || err.message}`, 5);
      swal.close();
    }
  });
};