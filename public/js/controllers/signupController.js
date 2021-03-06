import { authenticate } from '../utils/auth';
import { showAlert } from '../utils/showAlert';

export default signupForm => {
  const signupSumbitBtn = document.querySelector('.btn--submit-signup');

  signupForm.addEventListener('submit', async e => {
    try {
      e.preventDefault();
      if (signupForm['password'].value !== signupForm['passwordConfirm'].value) return showAlert('error', 'The passwords do not match!');

      signupSumbitBtn.classList.add('btn--disabled');
      signupSumbitBtn.textContent = 'Please wait...';

      await authenticate('signup', {
        name: signupForm['name'].value,
        email: signupForm['email'].value,
        password: signupForm['password'].value,
        passwordConfirm: signupForm['passwordConfirm'].value,
      });

      signupSumbitBtn.classList.remove('btn--disabled');
      signupSumbitBtn.textContent = 'Signup';

    } catch (err) {
      showAlert('error', `Something went wrong! ${err.response.data.message || ''}`);
      signupSumbitBtn.classList.remove('btn--disabled');
      signupSumbitBtn.textContent = 'Signup';
    }
  });
};