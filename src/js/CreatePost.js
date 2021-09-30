import { saveAs } from 'file-saver';

import {
  setPinElementHandlers,
  setFavoriteElementHandlers,
  setPostElementHandlers,
} from './postHandlers';

export default class CreatePost {
  constructor(setPostPinned, setPostFavorite) {
    if (setPostPinned) this.setPostPinned = setPostPinned;
    if (setPostFavorite) this.setPostFavorite = setPostFavorite;
    this.postContent = {};
  }

  addTextContent(serverMessageBody, lazy = false) {
    // console.log('CreatePost_getTextContent_serverMessageBody: ', serverMessageBody);
    this.postContent = { ...serverMessageBody };
    const inputValue = this.postContent.text;
    if (inputValue.includes('http' || 'https')) {
      const newValue = inputValue.replace(
        /((http|https):\/\/[.\w=&?:/-]+)/gi,
        "<a href='$1'>$1</a>",
      );
      this.postContent.contentWrapper = newValue;
    } else this.postContent.contentWrapper = inputValue;

    this.addContentToDOM(lazy);
  }

  addMediaContent(serverMessageBody, lazy = false) {
    this.postContent = { ...serverMessageBody };
    let tagName = '';
    if (this.postContent.file.type === 'image') {
      tagName = 'img';
    } else if (this.postContent.file.type === ('audio' || 'video')) {
      tagName = `${this.postContent.file.type}`;
    } else return;// тип файла не поддерживается
    this.postContent.contentWrapper = document.createElement(tagName);
    if (this.postContent.file.type === ('audio' || 'video')) {
      this.postContent.contentWrapper.controls = true;
    }

    // this.postContent.contentWrapper.dataset.fileName = this.postContent.file.name;
    this.postContent.contentWrapper.src = this.postContent.file.url;
    this.addContentToDOM(lazy);
  }

  addContentToDOM(lazy) {
    const container = document.querySelector('.main_container');
    const postBoard = container.querySelector('[data-id=timelinePosts]');
    const timestampEl = this.createTimestampElement();
    const coordsEl = this.createCoordinatesElement();// требуется в this.createPostFooterBarElement
    const postElement = this.createPostElement();
    const postContentEl = this.createPostContentElement();
    const postContentDownloadEl = this.createPostContentDownloadElement();
    const { postFooterBarEl, pinEl, favEl } = this.createPostFooterBarElement(coordsEl);
    postElement.append(timestampEl);
    postElement.append(postContentEl);
    postElement.append(postContentDownloadEl);
    postElement.append(postFooterBarEl);

    if (this.postContent.status.pinned) {
      const pinnedHeaderBar = container.querySelector('[data-id=headerPinnedBar]');
      const pinnedHeaderBarContent = pinnedHeaderBar.querySelector('[data-id=headerPinnedBarContent]');
      pinnedHeaderBar.classList.remove('hidden');
      pinnedHeaderBarContent.append(this.postContent.contentWrapper.cloneNode());
      postBoard.style.marginTop = '8rem';
    }

    setPinElementHandlers(
      postElement,
      pinEl,
      this.setPostPinned,
      this.postContent.id,
    );
    setFavoriteElementHandlers(favEl, this.setPostFavorite, this.postContent.id);
    setPostElementHandlers(postElement, pinEl, favEl);
    // console.log('CreatePost_addContentToDOM_lazy: ', lazy);
    if (lazy) postBoard.prepend(postElement);
    if (!lazy) {
      postBoard.append(postElement);
      postBoard.lastElementChild.scrollIntoView();
    }
  }

  createPostElement() {
    const postElement = document.createElement('div');
    if (this.postContent.status.pinned) postElement.classList.add('pinned');
    postElement.classList.add('post_content');
    postElement.dataset.name = 'postContent';// используется в postHandlers.js
    postElement.dataset.id = this.postContent.id;
    return postElement;
  }

  createPostFooterBarElement(coordsEl) {
    const postFooterBarEl = document.createElement('div');
    const pinEl = document.createElement('div');
    const favEl = document.createElement('div');
    postFooterBarEl.classList.add('post_footer_bar');
    const { pinned, favorite } = this.postContent.status;
    if (pinned) pinEl.classList.add('active');
    if (!pinned) pinEl.classList.add('hidden');
    pinEl.classList.add('pin_icon');
    if (favorite) favEl.classList.add('active');
    if (!favorite) favEl.classList.add('hidden');
    favEl.classList.add('fav_icon');
    pinEl.innerHTML = '&#128204;';
    favEl.innerHTML = '&#9734;';
    postFooterBarEl.append(coordsEl);
    postFooterBarEl.append(pinEl);
    postFooterBarEl.append(favEl);
    return { postFooterBarEl, pinEl, favEl };
  }

  createPostContentDownloadElement() {
    const postContentDownloadEl = document.createElement('div');
    postContentDownloadEl.classList.add('hidden');
    if (this.postContent.file) {
      // добавляем возможность скачивания файла
      postContentDownloadEl.innerHTML = '&#10515; Скачать файл';
      postContentDownloadEl.classList.add('content_download');
      postContentDownloadEl.classList.remove('hidden');
      postContentDownloadEl.title = `Скачать ${this.postContent.file.name}`;
      postContentDownloadEl.dataset.fileName = this.postContent.file.name;
      postContentDownloadEl.dataset.downloadUrl = this.postContent.contentWrapper.src.replace(this.postContent.file.name, '');
      postContentDownloadEl.addEventListener('click', async () => {
        // console.log('download file click');
        const response = await fetch(postContentDownloadEl.dataset.downloadUrl);
        // console.log('response: ', response);
        const blob = await response.blob();
        saveAs(blob, postContentDownloadEl.dataset.fileName);
      });
    }
    return postContentDownloadEl;
  }

  createPostContentElement() {
    const postContentEl = document.createElement('div');
    postContentEl.classList.add('content');
    if (this.postContent.text) postContentEl.innerHTML = this.postContent.contentWrapper;
    if (this.postContent.file) postContentEl.append(this.postContent.contentWrapper);
    // console.log('createPostContentElement_postContentEl:', postContentEl.outerHTML);
    // console.log('createPostContentElement_postContentEl:', postContentEl.innerHTML);
    return postContentEl;
  }

  createCoordinatesElement() {
    const coordsEl = document.createElement('div');
    coordsEl.classList.add('coordinates');

    if (!this.postContent.coordinates) {
      coordsEl.innerHTML = '[-,-]';
    } else if (this.postContent.coordinates.latitude && this.postContent.coordinates.longitude) {
      const linkAddress = `https://yandex.ru/maps/?text=${this.postContent.coordinates.latitude},${this.postContent.coordinates.longitude}`;
      const link = document.createElement('a');
      link.href = linkAddress;
      link.target = 'blank';
      link.innerHTML = `[${this.postContent.coordinates.latitude}, ${this.postContent.coordinates.longitude}] &#128065;`;
      coordsEl.append(link);
      coordsEl.addEventListener('click', () => {
        link.dispatchEvent(new MouseEvent('click'));
      });
    }
    return coordsEl;
  }

  createTimestampElement() {
    const date = new Date(this.postContent.timestamp);
    const day = date.toLocaleDateString();
    const time = date.toLocaleTimeString();
    const timestampEl = document.createElement('span');
    timestampEl.innerHTML = `${day} ${time}`;
    return timestampEl;
  }
}
