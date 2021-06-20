const removeAlert = () => {
  setTimeout(() => {
    document.querySelector('.alert').remove();
  }, 3000);
};

// @params 'type': can be 'error' or 'success'
// @params 'message': String (any)
export const showAlert = (type, message) => {
  const markup = `
    <div class='alert alert--${type}'>
      <h1>${message}</h1>
    </div>
  `;
  document.body.insertAdjacentHTML('beforebegin', markup);
  removeAlert();
};