import checkCoordinatesValidity from './checkCoordinatesValidity';

export default class Modal {
  constructor() {
    this.container = document.querySelector('.main_container');
    this.postContent = {};
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

  showModalManualCoords(postContent, networkAPI) {
    if (this.container.querySelector('[data-modal=modal]')) return;

    this.postContent = { ...postContent };

    const modalManualCoordsHtml = `
    <div data-modal="modal" class="modal">
      <div data-id="modalManualCoords" class="modal_content modal_manual_coords">
        <div>
          <p>Что-то пошло не так</p>
          <p>К сожалению, нам не удалось определить ваше местоположение, пожалуйста, дайте разрешение на использование геолокации, либо введите координаты вручную</p>
          <p>Широта и долгота через запятую</p>
        </div>
        <form data-id="modalForm" class="modal_form">
          <input data-id="modalInput" name="coords" class="modal_input" placeholder="Введите координаты, например: -90.12345, 180.12345" required>
          <div class="modal_footer">
            <span class="modal_footer_string hidden">
            </span>
          </div> 
          <div class="modal_form_controls"> 
            <button type="reset" data-id="modalButtonCancel" class="modal_button button_cancel">Отмена</button> 
            <button type="submit" data-id="modalButtonOk" class="modal_button button_ok">Ок</button> 
          </div>
        </form>       
      </div>
    </div>
    `;

    this.container.insertAdjacentHTML('afterBegin', modalManualCoordsHtml);

    const modalPopup = this.container.querySelector('[data-modal=modal]');
    const modalForm = modalPopup.querySelector('[data-id=modalForm]');
    modalForm.setAttribute('novalidate', true);

    modalForm.addEventListener('reset', () => {
      modalForm.closest('[data-modal=modal]').remove();
      networkAPI.sendPostContent(this.postContent);
    });

    modalForm.addEventListener('input', () => {
      if (modalForm.coords.classList.contains('invalid')) modalForm.coords.classList.remove('invalid');
    });

    modalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputValue = modalForm.coords.value.trim();
      modalForm.coords.setCustomValidity('');
      this.postContent.coordinates = checkCoordinatesValidity(inputValue);
      const errorMessageCoords = 'Координаты введены некорректно.';
      const errorMessageLat = 'Широта должна быть в пределах -90...+90 градусов.';
      const errorMessageLng = 'Долгота должна быть в пределах -180...+180 градусов.';
      modalForm.coords.classList.add('invalid');

      if (inputValue === '') {
        modalForm.coords.reportValidity();
        return;
      }

      if (!this.postContent.coordinates.longitude && !this.postContent.coordinates.latitude) {
        const errorMessage = `
        ${errorMessageCoords}
        ${errorMessageLat}
        ${errorMessageLng}
        `;
        modalForm.coords.setCustomValidity(errorMessage);
        modalForm.coords.reportValidity();
        return;
      }

      if (this.postContent.coordinates.longitude && !this.postContent.coordinates.latitude) {
        const errorMessage = `
        ${errorMessageCoords}
        ${errorMessageLat}
        `;
        modalForm.coords.setCustomValidity(errorMessage);
        modalForm.coords.reportValidity();
        return;
      }

      if (!this.postContent.coordinates.longitude && this.postContent.coordinates.latitude) {
        const errorMessage = `
        ${errorMessageCoords}
        ${errorMessageLng}
        `;
        modalForm.coords.setCustomValidity(errorMessage);
        modalForm.coords.reportValidity();
        return;
      }
      networkAPI.sendPostContent(this.postContent);
      modalPopup.remove();
    });
  }
}
