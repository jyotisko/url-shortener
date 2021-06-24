const removeAlert = duration => {
  setTimeout(() => {
    document.querySelector('.alert').remove();
  }, duration * 1000);
};

// @params 'type': can be 'error' or 'success'
// @params 'message': String (any)
export const showAlert = (type, message, duration = 5) => {
  const markup = `
    <div class='alert alert--${type}'>
      <h1>${message}</h1>
    </div>
  `;
  document.body.insertAdjacentHTML('beforebegin', markup);
  removeAlert(duration);
};