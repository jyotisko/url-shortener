import { logout } from '../utils/auth';
import { showAlert } from '../utils/showAlert';

const logoutController = logoutBtn => {
  logoutBtn.addEventListener('click', async () => {
    try {
      logoutBtn.classList.add('btn--disabled');
      await logout();

    } catch (err) {
      showAlert('error', `Something went wrong! ${err.response.data.message}`);
    }
  });
};

export default logoutController;