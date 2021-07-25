import checkCoordinatesValidity from './checkCoordinatesValidity';
import recordingFunction from './recordingFunction';

export default class WidgetTimeLine {
  constructor(initialPosts) {
    this.container = document.querySelector('.main_container');
    this.initialPostsPlug = initialPosts;// temp plug
    this.lazyLoadInProgress = false;// temp
  }

  initHandlers() {
    this.hiddenFileInput = this.container.querySelector('[data-id=fileInput]');
    this.headerBar = this.container.querySelector('[data-id=headerControls]');
    // this.headerForm = this.container.querySelector('[data-id=timelineHeaderForm]');
    this.searchButton = this.container.querySelector('[data-id=timelineSearchButton]');
    this.attachButton = this.container.querySelector('[data-id=timelineAttachButton]');
    this.menuButton = this.container.querySelector('[data-id=timelineMenuButton]');
    this.postForm = this.container.querySelector('[data-id=timelineForm]');
    this.controlBar = this.container.querySelector('[data-id=timelineControls]');
    this.buttonAudio = this.container.querySelector('[data-id=timelineAudioButton]');
    this.buttonVideo = this.container.querySelector('[data-id=timelineVideoButton]');
    this.buttonSubmitRecord = this.container.querySelector('[data-id=timelineSubmitRecordButton]');
    this.buttonCancelRecord = this.container.querySelector('[data-id=timelineCancelRecordButton]');
    this.pinnedHeaderBar = this.container.querySelector('[data-id=headerPinnedBar]');
    // temp plug + lazyload
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM готов!');
      if (!this.initialPostsPlug.length) return;
      const postBoard = this.container.querySelector('.timeline_posts');
      const initialCount = 10;
      for (let i = 0; i < initialCount; i += 1) {
        if (this.initialPostsPlug[i]) {
          postBoard.insertAdjacentHTML('afterbegin', this.initialPostsPlug[i]);
        }
      }
      // прокрутка вниз страницы после загрузки
      // window.scrollTop = document.body.clientHeight;
      // window.scrollTo(0, document.body.clientHeight);
      postBoard.lastElementChild.scrollIntoView();
      // console.log('document.body.clientHeight:', document.body.clientHeight);
      this.lastLoadedPostCounter = postBoard.firstChild.dataset.counter;
      // console.log('this.lastLoadedPostCounter:', this.lastLoadedPostCounter);
      // console.log('postBoard.children.length', postBoard.children.length, postBoard.children);

      // если постов < 10, то отменяем lazyload
      if (postBoard.children.length < 10) return;

      window.addEventListener('scroll', () => {
        if (this.lazyLoadInProgress) return;
        if (+this.lastLoadedPostCounter === this.initialPostsPlug.length) return;
        const topElement = postBoard.firstChild;
        // console.log('topElement_bottom:', topElement.getBoundingClientRect().bottom);
        // когда bottom >= 0, низ последнего поста появляется вверху страницы(под хедером)
        if (topElement.getBoundingClientRect().bottom >= 74) {
          // console.log('topElement top:', Math.trunc(topElement.getBoundingClientRect().top));
          this.lazyLoadInProgress = true;
          console.log('this.lazyLoadInProgress:', this.lazyLoadInProgress);
          if (!this.initialPostsPlug.length) return;
          const startCount = +this.lastLoadedPostCounter;
          console.log('startCount:', startCount);
          if (!startCount) return;
          for (let i = startCount; i < startCount + 10; i += 1) {
            console.log('i:', i);
            if (this.initialPostsPlug[i]) {
              postBoard.insertAdjacentHTML('afterbegin', this.initialPostsPlug[i]);
            }
          }
          topElement.scrollIntoView();
          this.lastLoadedPostCounter = postBoard.firstChild.dataset.counter;
          console.log('this.lastLoadedPostCounter:', this.lastLoadedPostCounter);
          this.lazyLoadInProgress = false;
        }
      });
    });

    this.pinnedHeaderBar.addEventListener('click', ({ target, currentTarget }) => {
      console.log('target, currentTarget:', target, currentTarget);
      // при клике на "X" убираем закреп-область и снимаем закреп с поста
      const postBoard = this.container.querySelector('.timeline_posts');
      if (target && target.dataset.id === 'headerPinnedBarCloseButton') {
        console.log('this.pinnedHeaderBar_content:', this.pinnedHeaderBar.querySelector('[data-id=headerPinnedBarContent]').innerHTML);
        this.pinnedHeaderBar.querySelector('[data-id=headerPinnedBarContent]').innerHTML = '';
        this.pinnedHeaderBar.classList.add('hidden');
        console.log('this.container.querySelector_pinned:', this.container.querySelector('.pinned'));
        postBoard.querySelector('.pinned').classList.remove('pinned');
        postBoard.querySelector('.pressed').classList.add('hidden');
        postBoard.querySelector('.pressed').classList.remove('pressed');
        postBoard.style.marginTop = '';
      }
      // при клике на закреп-область делаем скролл к закрепленному посту
      if (target.dataset.id === 'headerPinnedBarContent') {
        console.log('should scroll to pinned');
        console.log(' postBoard.querySelector_.pinned:', postBoard.querySelector('.pinned'));
        postBoard.querySelector('.pinned').scrollIntoView(false);
        const deltaY = postBoard.querySelector('.pinned').clientHeight;
        // console.log('deltaY:', deltaY);
        window.scrollBy(0, deltaY);
      }
    });

    document.addEventListener('dragover', (event) => {
      event.preventDefault();
      console.log('dragover');
      // console.log('this.container.querySelector("[data-modal=modal]")');
      if (this.container.querySelector('[data-modal=modal]')) return;
      if (!this.container.querySelector('[data-id=dropZone]')) {
        const dropZoneHtml = `
        <div data-id="dropZone" class="drop_zone modal">
          <div data-id="dropBox" class="drop_box modal_content">
            <div data-id="dropText" class="drop_text">
            drop image audio video here
            </div>
          </div>
        </div>
        `;

        this.container.insertAdjacentHTML('beforeend', dropZoneHtml);
      }
    });

    document.addEventListener('dragleave', (event) => {
      console.log('dropZonePlug_dragleave');
      console.log('dropZonePlug_dragleave_event_relatedTarget', event.relatedTarget);
      if (this.container.querySelector('[data-modal=modal]')) return;
      if (!event.relatedTarget) this.container.querySelector('[data-id=dropZone]').remove();
    });

    document.addEventListener('drop', (event) => {
      event.preventDefault();
    });

    this.container.addEventListener('drop', (event) => {
      event.preventDefault();
      if (this.container.querySelector('[data-modal=modal]')) return;
      this.saveExternalFile(event.dataTransfer.files);
      this.container.querySelector('[data-id=dropZone]').remove();
    });

    this.attachButton.addEventListener('click', () => {
      console.log('attach_click');
      this.hiddenFileInput.dispatchEvent(new MouseEvent('click'));
      this.hiddenFileInput.addEventListener('change', (event) => {
        this.saveExternalFile(event.currentTarget.files);
      });
    });

    this.postForm.addEventListener('submit', (event) => {
      this.submitTextPost(event);
    });

    this.controlBar.addEventListener('click', (event) => {
      if (!event.target.closest('.timeline_button')) return;
      this.toggleControls();
    });

    this.buttonAudio.addEventListener('click', ({ target }) => {
      this.recordByMediaType(target);
    });

    this.buttonVideo.addEventListener('click', ({ target }) => {
      this.recordByMediaType(target);
    });

    this.buttonSubmitRecord.addEventListener('click', () => {
      if (this.postContent) this.checkGeoLocAPI(this.postContent);
    });

    this.buttonCancelRecord.addEventListener('click', () => {
      this.postContent = null;
    });
  }

  saveExternalFile(filesToSave) {
    // const files = Array.from(event.currentTarget.files);
    const files = Array.from(filesToSave);
    const fileType = files[0].type.replace(/\/.+/, '');
    // console.log('fileType:', fileType);
    let tagName = '';
    if (fileType === 'image') {
      tagName = 'img';
    } else if (fileType === ('audio' || 'video')) {
      tagName = `${fileType}`;
    } else return;// может сделать всплывашку, что тип файла не поддерживается?
    const fileContent = document.createElement(tagName);
    // console.log('files[0].type:', files[0].type);
    // console.log('files[0].name:', files[0].name);
    if (fileType === ('audio' || 'video')) {
      fileContent.controls = true;
    }
    fileContent.dataset.name = files[0].name;
    // fileContent.title = `Скачать ${fileContent.dataset.name}`;
    fileContent.src = URL.createObjectURL(files[0]);
    this.postContent = fileContent;
    // console.log('files[0]:', files[0], files[0].type);
    this.checkGeoLocAPI(this.postContent);
    // URL.revokeObjectURL(fileContent.src); // не дает скачивать
    // console.log('fileContent:', fileContent);
    // console.log('fileContent.src:', fileContent.src);
    // console.log('this.postContent.src:', this.postContent.src);
  }

  async recordByMediaType(eventTarget) {
    this.mediaType = undefined;
    if (eventTarget.closest('.audio_button')) this.mediaType = 'audio';
    if (eventTarget.closest('.video_button')) this.mediaType = 'video';
    const mediaRecord = await recordingFunction(`${this.mediaType}`);
    if (mediaRecord) this.postContent = mediaRecord;
    if (!this.postContent) this.toggleControls();
  }

  toggleControls() {
    this.controlBar.children.forEach(
      (constrolBarEl) => constrolBarEl.classList.toggle('hidden'),
    );
  }

  showModalManualCoords() {
    if (this.container.querySelector('[data-modal=modal]')) return;
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
      this.addPost(this.postContent);
    });

    modalForm.addEventListener('input', () => {
      if (modalForm.coords.classList.contains('invalid')) modalForm.coords.classList.remove('invalid');
    });

    modalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputValue = modalForm.coords.value.trim();
      modalForm.coords.setCustomValidity('');

      const formValidity = checkCoordinatesValidity(inputValue);
      this.coordsObj = formValidity;

      const errorMessageCoords = 'Координаты введены некорректно.';
      const errorMessageLat = 'Широта должна быть в пределах -90...+90 градусов.';
      const errorMessageLng = 'Долгота должна быть в пределах -180...+180 градусов.';
      modalForm.coords.classList.add('invalid');

      if (inputValue === '') {
        modalForm.coords.reportValidity();
        return;
      }

      if (!this.coordsObj.lng && !this.coordsObj.lat) {
        const errorMessage = `
        ${errorMessageCoords}
        ${errorMessageLat}
        ${errorMessageLng}
        `;
        modalForm.coords.setCustomValidity(errorMessage);
        modalForm.coords.reportValidity();
        return;
      }

      if (this.coordsObj.lng && !this.coordsObj.lat) {
        const errorMessage = `
        ${errorMessageCoords}
        ${errorMessageLat}
        `;
        modalForm.coords.setCustomValidity(errorMessage);
        modalForm.coords.reportValidity();
        return;
      }

      if (!this.coordsObj.lng && this.coordsObj.lat) {
        const errorMessage = `
        ${errorMessageCoords}
        ${errorMessageLng}
        `;
        modalForm.coords.setCustomValidity(errorMessage);
        modalForm.coords.reportValidity();
        return;
      }

      this.addPost(this.postContent, this.coordsObj.lat, this.coordsObj.lng);
      modalPopup.remove();
    });
  }

  init() {
    if (this.container.querySelector('[data-widget=timelineWidget]')) return;
    const widgetTimelineHtml = `
        <div data-widget="timelineWidget" class="timeline_widget">
          <input data-id="fileInput" class="hidden_file_input" type="file">
          <div data-id="timelineHeader" class="timeline_header">
            <div data-id="headerControls" class="timeline_controls header_controls">
              <div data-id="timelineSearchButton" class="timeline_button search_button">
                <span>&#128270;</span>
              </div>
              <div data-id="timelineAttachButton" class="timeline_button attach_button">
                <span>&#128206;</span>
              </div>
              <div data-id="timelineMenuButton" class="timeline_button menu_button">
                <span>&#8942;</span>            
              </div>          
            </div>
          </div>
          
          <div data-id="headerPinnedBar" class="pinned_bar hidden">
            <div data-id="headerPinnedBarContent" class="pinned_bar_content">
            </div>
            <div data-id="headerPinnedBarCloseButton" class="pinned_bar_remove">
            &times;              
            </div>
          </div>

          <div data-id="timelinePosts" class="timeline_posts">
          </div>    
          <form data-id="timelineForm" class="modal_form timeline_form">
            <input data-id="post" name="post" placeholder="Post something here..." class="timeline_input" required>   
            <div data-id="timelineControls" class="timeline_controls">
              <div data-id="timelineAudioButton" class="timeline_button audio_button">
                <span>&#127908;</span>
              </div>
              <div data-id="timelineVideoButton" class="timeline_button video_button">
                <span>&#127909;</span>
              </div>
              <div data-id="timelineSubmitRecordButton" class="hidden timeline_button submit_record_button">
                <span>&#10004;</span>
              </div>
              <div data-id="timelineRecordTime" class="hidden timeline_record_time">
                <span data-timer="timerMinutes">00</span>:<span data-timer="timerSecondes">00</span>
              </div>
              <div data-id="timelineCancelRecordButton" class="hidden timeline_button cancel_record_button">
                <span>&#10006;</span>
              </div>
            </div>
          </form>
        </div> 
      `;

    this.container.insertAdjacentHTML('afterBegin', widgetTimelineHtml);

    this.initHandlers();
  }

  submitTextPost(event) {
    event.preventDefault();
    const inputValue = this.postForm.post.value.trim();
    if (inputValue === '') return;

    if (inputValue.includes('http' || 'https')) {
      const newValue = inputValue.replace(
        /((http|https):\/\/[.\w=&?:]+)/gi,
        "<a href='$1'>$1</a>",
      );
      this.postContent = newValue;
    } else this.postContent = inputValue;

    // this.postContent = inputValue;
    this.checkGeoLocAPI(this.postContent);
    this.postForm.reset();
  }

  checkGeoLocAPI(postContent) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.addPost(postContent, latitude, longitude);
        }, (error) => {
          console.error(error);
          this.showModalManualCoords();
        },
      );
    } else {
      console.log('browser geo API - false');
      this.showModalManualCoords();
    }
  }

  addPost(postContent, latitude, longitude) {
    const postBoard = this.container.querySelector('[data-id=timelinePosts]');
    if (!postBoard) return;
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    let coordinates;
    if (latitude && longitude) {
      coordinates = `[${latitude}, ${longitude}] &#128065;`;
    } else {
      coordinates = '[-,-]';
    }

    // console.log('postContent', typeof postContent);
    // если  контент НЕ строка - добавляем в пост элемент на скачивание
    const postElement = document.createElement('div');
    const timeStampEl = document.createElement('span');
    const postContentEl = document.createElement('div');
    const postContentDownload = document.createElement('div');
    const postFooterBar = document.createElement('div');
    const coordsEl = document.createElement('div');
    const pinEl = document.createElement('div');
    const favEl = document.createElement('div');

    postElement.classList.add('post_content');
    postElement.dataset.id = 'postContent';
    timeStampEl.innerHTML = `${date} ${time}`;
    postContentEl.classList.add('content');
    postContentDownload.classList.add('hidden');
    postFooterBar.classList.add('post_footer_bar');
    coordsEl.classList.add('coordinates');
    pinEl.classList.add('hidden');
    pinEl.classList.add('pin_icon');
    favEl.classList.add('hidden');
    favEl.classList.add('fav_icon');

    coordsEl.innerHTML = `${coordinates}`;
    pinEl.innerHTML = '&#128204;';
    favEl.innerHTML = '&#9734;';
    // favEl.innerHTML = '&#9733;';

    postElement.append(timeStampEl);
    postElement.append(postContentEl);
    postElement.append(postContentDownload);
    postFooterBar.append(coordsEl);
    postFooterBar.append(pinEl);
    postFooterBar.append(favEl);
    postElement.append(postFooterBar);

    // вывести pin в отдельный метод
    pinEl.addEventListener('click', () => {
      console.log('pinEl click');
      pinEl.classList.toggle('pressed');
      // TODO: если уже есть закрепленный пост, то он открепляется
      // 1) ищем среди постов закрепленный,
      // убираем у него класс pinned,
      // добавляем класс pinned, новому посту,
      // обновляем содержимое pinned-области
      // 2) если среди постов нет класса pinned,
      // то нужно отобразить pinned-область,
      // и обновляем содержимое pinned-области
      // 3) если кликаем на уже закрепленном посте, то
      // убираем у него класс pinned,
      // удаляем содержимое pinned-области,
      // скрываем pinned-область
      const pinnedHeaderBarContent = this.pinnedHeaderBar.querySelector('[data-id=headerPinnedBarContent]');
      // 1)
      if (postBoard.querySelector('.pinned')) {
        const existPinned = postBoard.querySelector('.pinned');
        console.log('existPinned', existPinned);
        const newPinned = pinEl.closest('[data-id=postContent]');
        if (existPinned !== newPinned) {
          console.log('should new pin');
          existPinned.classList.remove('pinned');
          console.log('existPinned.querySelector_pin_icon', existPinned.querySelector('.pin_icon'));
          existPinned.querySelector('.pin_icon').classList.remove('pressed');
          existPinned.querySelector('.pin_icon').classList.add('hidden');
          newPinned.classList.add('pinned');
          this.pinnedHeaderBar.classList.remove('hidden');
          pinnedHeaderBarContent.innerHTML = newPinned.closest('[data-id=postContent]').querySelector('div').innerHTML;
          postBoard.style.marginTop = '8rem';
        }
        // 3)
        if (existPinned === newPinned) {
          console.log('should pin off');
          existPinned.classList.remove('pinned');
          this.pinnedHeaderBar.classList.add('hidden');
          pinnedHeaderBarContent.innerHTML = '';
          postBoard.style.marginTop = '';
        }
      } else { // 2)
        console.log('no exist, should new pin');
        postElement.classList.add('pinned');
        this.pinnedHeaderBar.classList.remove('hidden');
        pinnedHeaderBarContent.innerHTML = pinEl.closest('[data-id=postContent]').querySelector('div').innerHTML;
        postBoard.style.marginTop = '8rem';
        postElement.scrollIntoView();
      }
    });
    favEl.addEventListener('click', () => {
      // console.log('favEl click');
      favEl.classList.toggle('pressed');
    });
    postElement.addEventListener('mouseover', () => {
      // console.log('post mouseover');
      if (pinEl.classList.contains('hidden')) pinEl.classList.remove('hidden');
      if (favEl.classList.contains('hidden')) favEl.classList.remove('hidden');
    });
    postElement.addEventListener('mouseleave', () => {
      // console.log('post mouseleave');
      if (!pinEl.classList.contains('hidden') && !pinEl.classList.contains('pressed')) pinEl.classList.add('hidden');
      if (!favEl.classList.contains('hidden') && !favEl.classList.contains('pressed')) favEl.classList.add('hidden');
    });

    if (typeof postContent === 'string') {
      postContentEl.innerHTML = postContent;
    } else if (typeof postContent === 'object') {
      postContentEl.append(postContent);
      // добавляем возможность скачивания файла
      postContentDownload.innerHTML = '&#10515; Скачать файл';
      postContentDownload.classList.add('content_download');
      postContentDownload.title = `Скачать ${postContent.dataset.name}`;
      // const contentDownloadButton = postElement.querySelector('.content_download');
      postContentDownload.classList.remove('hidden');
      postContentDownload.addEventListener('click', () => {
        console.log('click to download');
        console.log('postContent', postContent.src);
        console.log('postContent', postContent.dataset.name);
        const a = document.createElement('a');
        a.download = postContent.dataset.name;
        // a.href = URL.createObjectURL(postContent.src);
        a.href = postContent.src;
        a.rel = 'noopener';
        a.dispatchEvent(new MouseEvent('click'));
        // URL.revokeObjectURL(a.href); // не дает качать больше 1 раза
      });
    }

    if (latitude && longitude) {
      const linkAddress = `https://yandex.ru/maps/?text=${latitude},${longitude}`;
      const a = document.createElement('a');
      a.href = linkAddress;
      a.target = 'blank';
      coordsEl.replaceWith(a);
      a.innerHTML = `${coordinates}`;
      coordsEl.addEventListener('click', () => {
        a.dispatchEvent(new MouseEvent('click'));
      });
    }

    postBoard.append(postElement);
    this.postContent = null;
    postBoard.lastElementChild.scrollIntoView();
  }
}
