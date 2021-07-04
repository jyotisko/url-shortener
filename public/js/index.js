import 'regenerator-runtime';
import anonymousUrlController from './controllers/createAnonymousUrl';
import loginController from './controllers/loginController';
import signupController from './controllers/signupController';
import Dashboard from './controllers/dashboard';
import { updateUserData, updatePassword } from './controllers/updateDataController';
import logoutController from './controllers/logoutController';
import { donationController, donatorController } from './controllers/donationController';

// DOM Elements
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const createAnonymousUrlForm = document.querySelector('#home-create-url');
const dashboardEl = document.querySelector('.main--dashboard');
const updateUserDataForm = document.querySelector('.form--data');
const updatePasswordForm = document.querySelector('.form--password');
const logoutBtn = document.querySelector('.nav__link--logout');
const donationSection = document.querySelector('.section--donate');
const donatorSection = document.querySelector('.section--donator');

// Delegations 
if (loginForm) {
  loginController(loginForm);
}

if (signupForm) {
  signupController(signupForm);
}

if (createAnonymousUrlForm) {
  anonymousUrlController(createAnonymousUrlForm);
}

if (dashboardEl) {
  const dashboard = new Dashboard();
  dashboard.addHandlerCreate();
  dashboard.addHandlerDelete();
  dashboard.addHandlerEdit();
  dashboard.addHandlerCopy();
}

if (updateUserDataForm) {
  updateUserData(updateUserDataForm);
}

if (updatePasswordForm) {
  updatePassword(updatePasswordForm);
}

if (donationSection) {
  donationController(donationSection)
}

if (donatorSection) {
  donatorController(donatorController);
}

if (logoutBtn) {
  logoutController(logoutBtn)
}