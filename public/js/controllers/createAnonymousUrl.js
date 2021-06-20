import validator from 'validator';
import { showAlert } from '../utils/showAlert';
import { createAnonymousUrl, createUrlForLoggedInUser } from '../utils/manageUrls';

export default createAnonymousUrlForm => {
  const copyBtn = document.querySelector('.create-url__btn--copy');
  const urlToShortenEl = document.querySelector('#url-input');
  const createUrlBtn = document.querySelector('.create-url__btn--shorten');

  createAnonymousUrlForm.addEventListener('submit', async e => {
    try {
      e.preventDefault();
      if (!urlToShortenEl.value) return;
      if (!validator.isURL(urlToShortenEl.value)) return showAlert('error', 'Please enter a valid URL!');
      if (urlToShortenEl.value.includes(window.location.hostname)) return showAlert('error', 'Already a valid Su.ly URL!');
      createUrlBtn.value = 'Shortening';

      let res;
      if (!createAnonymousUrlForm.dataset.user) res = await createAnonymousUrl(urlToShortenEl.value);
      if (createAnonymousUrlForm.dataset.user) res = await createUrlForLoggedInUser(urlToShortenEl.value, createAnonymousUrlForm.dataset.user);

      copyBtn.classList.toggle('hidden');
      createUrlBtn.classList.toggle('hidden');
      urlToShortenEl.value = `${window.location.hostname}:${window.location.port}/c/${res.data.url.shortCode}`;
      createUrlBtn.value = 'Shorten!';
    } catch (err) {
      showAlert('error', `Something went wrong. ${err.response.data.message}`);
    }
  });

  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(`${urlToShortenEl.value}`)
      .then(
        () => showAlert('success', 'Copied to clipboard!'),
        () => showAlert('error', 'Something went wrong, unable to copy to clipboard!')
      );
  });

  urlToShortenEl.addEventListener('input', () => {
    copyBtn.classList.add('hidden');
    createUrlBtn.classList.remove('hidden');
  });
};