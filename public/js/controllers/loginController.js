import { authenticate } from '../utils/auth';
import { showAlert } from '../utils/showAlert';

export default loginForm => {
  const loginSubmitBtn = document.querySelector('.btn--submit-login');

  loginForm.addEventListener('submit', async e => {
    try {
      e.preventDefault();
      loginSubmitBtn.classList.add('btn--disabled');

      await authenticate('login', {
        email: loginForm['email'].value,
        password: loginForm['password'].value
      });

      loginSubmitBtn.classList.remove('btn--disabled');

    } catch (err) {
      loginSubmitBtn.classList.remove('btn--disabled');
      showAlert('error', `Something went wrong! ${err.response.data.message || ''}`);
    }
  });
};