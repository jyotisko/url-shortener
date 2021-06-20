import { authenticate } from '../utils/auth';
import { showAlert } from '../utils/showAlert';

export default signupForm => {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (signupForm['password'].value !== signupForm['passwordConfirm'].value) return showAlert('error', 'The passwords do not match!');

    await authenticate('signup', {
      name: signupForm['name'].value,
      email: signupForm['email'].value,
      password: signupForm['password'].value,
      passwordConfirm: signupForm['passwordConfirm'].value,
    });
  });
};