import { showAlert } from '../utils/showAlert';
import { donate } from '../utils/stripe.js';

export const donationController = donationSection => {
  donationSection.addEventListener('click', e => {
    if (!e.target.closest('.card')?.classList?.contains('card')) return;
    const amount = +(e.target.closest('.card').querySelector('.card__price').textContent.slice(1));
    document.querySelector('.amount-selected').textContent = amount;
  });

  const donateBtn = donationSection.querySelector('.btn--donate');
  donateBtn.addEventListener('click', async e => {
    try {
      const amount = +(donationSection.querySelector('.amount-selected').textContent);
      if (!amount || amount <= 0) return showAlert('error', 'Please select an amount to donate!', 2);

      donateBtn.textContent = 'Processing...';
      donateBtn.classList.add('btn--disabled');
      await donate(amount);
      donateBtn.textContent = 'Donate';
      donateBtn.classList.remove('btn--disabled');

    } catch (err) {
      showAlert('error', `Something went wrong! ${err?.response?.data?.message || err.message}`);
      donateBtn.textContent = 'Donate';
      donateBtn.classList.remove('btn--disabled');
    }
  });
};