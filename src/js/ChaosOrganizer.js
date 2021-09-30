import recordingFunction from './recordingFunction';
import getCoordinates from './getCoordinates';

export default class ChaosOrganizer {
  constructor(fetch, socket) {
    this.container = document.querySelector('.main_container');
    this.lazyLoadInProgress = false;
    this.fetch = fetch;
    this.socket = socket;
    this.postContent = {};
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
    this.postBoard = this.container.querySelector('[data-id=timelinePosts]');

    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('scroll', async () => {
        if (this.lazyLoadInProgress) return;
        const lastLoadedPost = this.postBoard.firstElementChild;
        // console.log('lazyLoad_scroll_lastLoadedPost: ', lastLoadedPost);
        if (!lastLoadedPost) return;
        this.lastLoadedPostID = lastLoadedPost.dataset.id;
        // console.log('lazyLoad_scroll');
        // console.log('topElement_bottom:', topElement.getBoundingClientRect().bottom);
        // когда bottom >= 0, низ последнего поста появляется вверху страницы(под хедером)
        if (lastLoadedPost.getBoundingClientRect().top > 0) {
          if (this.lastLoadedPostID === this.prevLastLoadedPostID) return;
          // console.log('lazyLoad_this.lastLoadedPostID: ', this.lastLoadedPostID);
          this.lazyLoadInProgress = true;
          // console.log('lazyLoad_this.lazyLoadInProgress: ', this.lazyLoadInProgress);
          // document.body.style.overflow = 'hidden';
          await this.socket.getInitialPosts(this.lastLoadedPostID);
          lastLoadedPost.scrollIntoView();
          // document.body.style.overflow = '';
          this.prevLastLoadedPostID = this.lastLoadedPostID;
          // console.log('lazyLoad_scroll_prevLastLoadedPostID:', this.prevLastLoadedPostID);
          // if (newlastLoadedPostID === lastLoadedPostID) return;
          this.lazyLoadInProgress = false;
        }
      });
    });

    this.pinnedHeaderBar.addEventListener('click', ({ target, currentTarget }) => {
      console.log('target, currentTarget:', target, currentTarget);
      // при клике на "X" убираем закреп-область и снимаем закреп с поста
      const postBoard = this.container.querySelector('.timeline_posts');
      if (target && target.dataset.id === 'headerPinnedBarCloseButton') {
        this.pinnedHeaderBar.querySelector('[data-id=headerPinnedBarContent]').innerHTML = '';
        this.pinnedHeaderBar.classList.add('hidden');
        const pinnedPost = postBoard.querySelector('.pinned');
        const postID = pinnedPost.dataset.id;
        // console.log('this.pinnedHeaderBar_postID:', postID);
        pinnedPost.classList.remove('pinned');
        pinnedPost.querySelector('.pin_icon').classList.add('hidden');
        pinnedPost.querySelector('.pin_icon').classList.remove('active');
        postBoard.style.marginTop = '';
        this.socket.setPostPinned(postID);
      }
      // при клике на закреп-область делаем скролл к закрепленному посту
      if (target.dataset.id === 'headerPinnedBarContent') {
        // console.log('should scroll to pinned');
        // console.log(' postBoard.querySelector_.pinned:', postBoard.querySelector('.pinned'));
        postBoard.querySelector('.pinned').scrollIntoView(false);
        const deltaY = postBoard.querySelector('.pinned').clientHeight + 32;
        window.scrollBy(0, deltaY);
      }
    });

    document.addEventListener('dragover', (event) => {
      event.preventDefault();
      // console.log('dragover');
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
      // console.log('dropZonePlug_dragleave');
      // console.log('dropZonePlug_dragleave_event_relatedTarget', event.relatedTarget);
      if (this.container.querySelector('[data-modal=modal]')) return;
      if (!event.relatedTarget) this.container.querySelector('[data-id=dropZone]').remove();
    });

    document.addEventListener('drop', (event) => {
      event.preventDefault();
    });

    this.container.addEventListener('drop', (event) => {
      event.preventDefault();
      if (this.container.querySelector('[data-modal=modal]')) return;
      this.attachFile(event.dataTransfer.files);
      this.container.querySelector('[data-id=dropZone]').remove();
    });

    this.attachButton.addEventListener('click', () => {
      // console.log('attach_click');
      this.hiddenFileInput.dispatchEvent(new MouseEvent('click'));
      this.hiddenFileInput.addEventListener('change', (event) => {
        this.attachFile(event.currentTarget.files);
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

    // this.buttonSubmitRecord.addEventListener('click', () => {
    // });

    // this.buttonCancelRecord.addEventListener('click', () => {
    //   this.postContent = {};
    // });
  }

  attachFile(filesToSave) {
    const files = Array.from(filesToSave);
    const fileType = files[0].type.replace(/\/.+/, '');
    if (fileType !== ('image' || 'audio' || 'video')) {
      return;// тип файла не поддерживается
    }
    [this.postContent.file] = files;
    this.postContent.fileType = fileType;
    getCoordinates(this.postContent, this.fetch);
  }

  recordByMediaType(eventTarget) {
    if (eventTarget.closest('.audio_button')) this.postContent.type = 'audio';
    if (eventTarget.closest('.video_button')) this.postContent.type = 'video';
    recordingFunction(`${this.postContent.type}`, this.fetch);
  }

  toggleControls() {
    this.controlBar.children.forEach(
      (constrolBarEl) => constrolBarEl.classList.toggle('hidden'),
    );
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
                <span data-timer="timerMinutes">00</span>:<span data-timer="timerSeconds">00</span>
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
    this.postContent.type = 'text';
    this.postContent.text = inputValue;
    getCoordinates(this.postContent, this.socket);
    this.postForm.reset();
    this.postContent = {};
  }

  submitMediaPost() {
    this.postContent.type = 'file';
    getCoordinates(this.postContent, this.fetch);
    this.postContent = {};
  }
}
