import { authenticate } from '../utils/auth';

export default loginForm => {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    await authenticate('login', {
      email: loginForm['email'].value,
      password: loginForm['password'].value
    });
  });
};