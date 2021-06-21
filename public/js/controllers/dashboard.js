import validator from 'validator';
import swal from 'sweetalert';
import { showAlert } from '../utils/showAlert';
import { createUrlForLoggedInUser, deleteUrl, updateUrl } from '../utils/manageUrls';

class Dashboard {
  constructor() {
    this.createUrlForm = document.querySelector('#create-url-dashboard');
    this.tableBody = document.querySelector('.table__body');
    this.urls = [];
    this.init();
  }

  generateAndRenderMarkup() {
    const markup = this.urls.map((url, i) => {
      const shortUrl = `${window.location.host}/c/${url.shortCode} `;
      return `
        <tr data-id='${url._id}' class='table__row table__data-row'>
          <td>${i + 1}</td>
          <td> 
            <a href='http://${shortUrl}' class='table__link'>${shortUrl}</a>
          </td>
          <td> 
            <a href='http://${url.originalUrl.replace(/(^\w+:|^)\/\//, '')}' class='table__link'>${url.originalUrl}</a>
          </td>
          <td>${url.clicks}</td>
          <td class='table__options'>
            <i class='icon icon--delete far fa-trash-alt'></i>
            <i class='icon icon--edit far fa-edit'></i>
          </td>
        </tr>
      `;
    }).join('');

    this.tableBody.innerHTML = markup;
  };

  init() {
    this.urls = JSON.parse(this.tableBody.dataset.urls);
    this.generateAndRenderMarkup();
  }

  addHandlerCreate() {
    this.createUrlForm.addEventListener('click', async e => {
      try {
        e.preventDefault();
        const originalUrl = this.createUrlForm['url'].value;
        if (!originalUrl) return;
        if (!validator.isURL(originalUrl)) return showAlert('error', 'Please enter a valid URL!');
        if (originalUrl.includes(window.location.hostname)) return showAlert('error', 'Already a valid Su.ly URL!');

        const { data } = await createUrlForLoggedInUser(originalUrl, this.createUrlForm.dataset.user);
        this.urls.unshift(data.url);
        this.generateAndRenderMarkup();
        this.createUrlForm['url'].value = '';
      } catch (err) {
        let msg = '';
        if (err.message.includes('429')) msg = 'Too many requests from the same IP. Please try again in an hour.';
        showAlert('error', `Something went wrong. ${msg || err.response.data.message}`);
      }
    });
  }

  addHandlerDelete() {
    this.tableBody.addEventListener('click', async e => {
      try {
        if (!e.target.classList.contains('icon--delete')) return;
        const id = e.target.closest('.table__data-row').dataset.id;
        e.target.classList.add('icon--disabled')
        await deleteUrl(id);
        showAlert('success', 'Successfully deleted!');
        this.urls = this.urls.filter(url => url._id !== id);
        this.generateAndRenderMarkup();

      } catch (err) {
        showAlert('error', 'Something went wrong. Please try again later.');
      }
    });
  }

  addHandlerEdit() {
    this.tableBody.addEventListener('click', async e => {
      try {
        if (!e.target.classList.contains('icon--edit')) return;
        const id = e.target.closest('.table__data-row').dataset.id;

        await swal({
          text: 'Enter the short custom code. It should be unique. Special characters are not allowed The shorter, the better!',
          content: 'input',
          button: {
            text: 'Update!',
            closeModal: false,
          }
        }).then(async code => {
          if (!code) throw null;
          if (code.match(/\W|_/g) && code.match(/\W|_/g).length > 0) {
            swal.close();
            showAlert('error', 'Code must not contain special character!');
            throw null;
          }
          const { data } = await updateUrl(id, code);
          this.urls = this.urls.map(url => {
            if (url._id === id) return data.url;
            return url;
          });
          this.generateAndRenderMarkup();
          swal.close();
        }).catch(err => {
          if (err) {
            return swal('Oh no!', 'Something went wrong. Probably this code is already in use by another user', 'error');
          } else {
            swal.stopLoading();
            swal.close();
          }
        });

      } catch (err) {
        showAlert('error', err);
      }
    });
  }
};

export default Dashboard;