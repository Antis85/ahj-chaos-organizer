export default class PopupMessage {
  constructor() {
    this.container = document.querySelector('.main_container');
  }

  showMessage() {
    if (this.container.querySelector('[data-modal=modal]')) return;
    const modalHtml = `
    <div data-modal="modal" class="modal">
      <div data-id="modalNotification" class="modal_content modal_notification">
        <div>
          <p>Что-то пошло не так</p>
          <p>К сожалению, не удалось ничего записать,
           пожалуйста, дайте разрешение на использование записи,
           либо воспользуйтесь другим браузером</p>          
        </div>
        <button type="submit" data-id="modalButtonOk" class="modal_button button_ok">Ок</button> 
      </div>
    </div>
    `;

    this.container.insertAdjacentHTML('afterBegin', modalHtml);
    const modalPopup = this.container.querySelector('[data-modal=modal]');
    const modalButtonOK = modalPopup.querySelector('[data-id=modalButtonOk]');
    modalButtonOK.addEventListener('click', (event) => {
      event.preventDefault();
      modalPopup.remove();
    });
  }
}
