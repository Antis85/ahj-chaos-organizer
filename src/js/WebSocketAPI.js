import CreatePost from './CreatePost';

export default class Socket {
  constructor(url) {
    this.url = url;
    this.container = document.querySelector('.main_container');
    this.wsResponse = {};
    this.postData = {};
    this.ws = new WebSocket(this.url);
    this.createPost = new CreatePost(
      this.setPostPinned.bind(this),
      this.setPostFavorite.bind(this),
    );
    this.initWsHandlers();
  }

  initWsHandlers() {
    this.ws.addEventListener('open', () => {
      console.log('ws_opened & readyState: ', this.ws.readyState);
      this.getInitialPosts();
    });
    this.ws.addEventListener('message', (evt) => this.parseWsResponse(evt));
    this.ws.addEventListener('message', () => this.addPostGroup());
    // this.ws.addEventListener('message', () => this.editPost());
    this.ws.addEventListener('close', (evt) => this.wsClosedHandler(evt));
    this.ws.addEventListener('error', () => {
      console.error('ws_error');
    });
  }

  sendJSONtoServer(obj) {
    if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(obj));
      // console.log('WS_sending post to server');
      this.postData = {};
    } else {
      console.log('submit_message_readyState_not_OPEN: ', this.ws.readyState);
    }
  }

  // загрузка постов
  getInitialPosts(lastPostID) {
    this.postData = { method: 'GET', request: 'posts' };
    if (lastPostID) this.postData.lastPostID = lastPostID;
    // console.log('WS_API_getInitialPosts_this.postData: ', this.postData);
    this.sendJSONtoServer(this.postData);
  }

  // отправляем текстовый пост на сервер, для загрузки поста и синхронизации
  sendPostContent(postContent) {
    this.postData = { ...postContent };
    this.postData.method = 'POST';
    this.postData.request = 'create';
    this.sendJSONtoServer(this.postData);
  }

  // отправляем id медиа поста на "ws"-сервер, для загрузки поста и синхронизации
  sendPostID(postID) {
    this.postData = { method: 'GET', request: 'create', id: postID };
    // console.log('WS_API_sendPostID_this.postData: ', this.postData);
    this.sendJSONtoServer(this.postData);
  }

  wsClosedHandler(evt) {
    // console.log('ws_closed & readyState: ', this.ws.readyState);
    if (evt.wasClean) {
      // console.log('connection closed wasClean');
    } else {
      // console.log(evt);
      // console.log(`Соединение закрыто\n код: ${evt.code}`);
      // console.log('connection lost, trying to reconnect');
      this.ws = new WebSocket(this.url);
    }
  }

  parseWsResponse(serverMessage) {
    try {
      this.wsResponse = JSON.parse(serverMessage.data);
      // console.log('serverMessage: ', serverMessage);
      // console.log('serverMessage.data: ', serverMessage.data);
      // console.log('WS_parseWsResponse_this.wsResponse: ', this.wsResponse);
    } catch (e) {
      console.log('e: ', e);
    }
  }

  addPost(wsResponseContent, lazy) {
    // console.log('WS_addPost_this.wsResponse: ', this.wsResponse);
    // console.log('WS_addPost_this.wsResponse.content: ', this.wsResponse.content);
    // console.log('WS_addPost_this.wsResponse_obj_entries: ', Object.entries(this.wsResponse));
    // console.log('WS_addPost_this.wsResponse.type: ', this.wsResponse.type);
    if (wsResponseContent.text) {
      this.createPost.addTextContent(wsResponseContent, lazy);
    }
    if (wsResponseContent.file) {
      // console.log('WS_addPost_wsResponseContent.file: ', wsResponseContent.file);
      this.createPost.addMediaContent(wsResponseContent, lazy);
    }
  }

  addPostGroup() {
    // console.log('WS_addPost_this.wsResponse: ', this.wsResponse);
    // console.log('WS_addPost_this.wsResponse.content: ', this.wsResponse.content);
    // console.log('WS_addPost_this.wsResponse_obj_entries: ', Object.entries(this.wsResponse));
    // console.log('WS_addPost_this.wsResponse.type: ', this.wsResponse.type);
    if (!this.wsResponse.type.includes('post')) return;
    if (this.wsResponse.type === 'post') {
      this.addPost(this.wsResponse.content);
    }
    if (this.wsResponse.type === 'postsArray') {
      for (const post of this.wsResponse.content) {
        if (this.wsResponse.lazyload) this.addPost(post, 'lazy');
        if (!this.wsResponse.lazyload) this.addPost(post);
      }
    }
  }

  // editPost() {
  // if (!this.wsResponse.type === ('pinned' || 'favorite')) return;
  // modify post by id + status:
  // this.wsResponse.oldPinned: {id, status}
  // this.wsResponse.newPinned: {id, status}
  // this.wsResponse.favorite: {id, status}
  // }

  setPostPinned(postID) {
    if (!postID) return;
    // console.log('WS_setPostPinned_postID: ', postID);
    // console.log('WS_setPostPinned_this: ', this);
    this.postData = { method: 'PUT', request: 'pin', id: postID };
    // console.log('WS_setPostFavorite_this.postData', this.postData);
    this.sendJSONtoServer(this.postData);
  }

  setPostFavorite(postID) {
    if (!postID) return;
    // console.log('WS_setPostFavorite_postID', postID);
    // console.log('WS_setPostFavorite_this: ', this);
    this.postData = { method: 'PUT', request: 'favorite', id: postID };
    // console.log('WS_setPostFavorite_this.postData', this.postData);
    this.sendJSONtoServer(this.postData);
  }
}
