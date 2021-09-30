export function setPinElementHandlers(
  postElement,
  pinEl,
  setPostPinned,
  postID,
) {
  pinEl.addEventListener('click', () => {
    // console.log('pinEl click');
    const container = document.querySelector('.main_container');
    const postBoard = container.querySelector('[data-id=timelinePosts]');
    const pinnedHeaderBar = container.querySelector('[data-id=headerPinnedBar]');
    pinEl.classList.toggle('active');
    const pinnedHeaderBarContent = pinnedHeaderBar.querySelector('[data-id=headerPinnedBarContent]');
    // ищем среди постов закрепленный, убираем у него класс pinned,
    // добавляем класс pinned, новому посту, обновляем содержимое pinned-области
    if (postBoard.querySelector('.pinned')) {
      const existPinned = postBoard.querySelector('.pinned');
      // console.log('existPinned', existPinned);
      const newPinned = pinEl.closest('[data-name=postContent]');
      if (existPinned !== newPinned) {
        // console.log('should new pin');
        existPinned.classList.remove('pinned');
        existPinned.querySelector('.pin_icon').classList.remove('active');
        existPinned.querySelector('.pin_icon').classList.add('hidden');
        newPinned.classList.add('pinned');
        pinnedHeaderBar.classList.remove('hidden');
        pinnedHeaderBarContent.innerHTML = newPinned.closest('[data-name=postContent]').querySelector('div').innerHTML;
        postBoard.style.marginTop = '8rem';
      }
      // если кликаем на уже закрепленном посте, то убираем у него класс pinned,
      // удаляем содержимое pinned-области, скрываем pinned-область
      if (existPinned === newPinned) {
        // console.log('should pin off');
        existPinned.classList.remove('pinned');
        pinnedHeaderBar.classList.add('hidden');
        pinnedHeaderBarContent.innerHTML = '';
        postBoard.style.marginTop = '';
        // existPinned.scrollIntoView();
      }
    } else {
    // если среди постов нет класса pinned,
    // то нужно отобразить pinned-область,
    // и обновляем содержимое pinned-области
      // console.log('no exist, should new pin');
      postElement.classList.add('pinned');
      pinnedHeaderBar.classList.remove('hidden');
      pinnedHeaderBarContent.innerHTML = pinEl.closest('[data-name=postContent]').querySelector('div').innerHTML;
      postBoard.style.marginTop = '8rem';
      postElement.scrollIntoView();
    }

    setPostPinned(postID);
  });
}

export function setFavoriteElementHandlers(favEl, setPostFavorite, postID) {
  favEl.addEventListener('click', () => {
    // console.log('favEl click');
    favEl.classList.toggle('active');
    setPostFavorite(postID);
  });
}

export function setPostElementHandlers(postElement, pinEl, favEl) {
  postElement.addEventListener('mouseover', () => {
    // console.log('post mouseover');
    if (pinEl.classList.contains('hidden')) pinEl.classList.remove('hidden');
    if (favEl.classList.contains('hidden')) favEl.classList.remove('hidden');
  });

  postElement.addEventListener('mouseleave', () => {
    // console.log('post mouseleave');
    if (!pinEl.classList.contains('hidden') && !pinEl.classList.contains('active')) pinEl.classList.add('hidden');
    if (!favEl.classList.contains('hidden') && !favEl.classList.contains('active')) favEl.classList.add('hidden');
  });
}
