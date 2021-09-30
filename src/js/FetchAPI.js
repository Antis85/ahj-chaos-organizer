export default class Fetch {
  constructor(url, socket) {
    this.url = url;
    // console.log('this.url: ', this.url);
    this.socket = socket;
  }

  sendPostContent(postContent) {
    // console.log('FetchAPI_postContent: ', postContent);
    const formData = new FormData();
    formData.append('file', postContent.file);
    formData.append('fileType', postContent.fileType);
    if (postContent.coordinates && postContent.coordinates.latitude) formData.append('lat', postContent.coordinates.latitude);
    if (postContent.coordinates && postContent.coordinates.longitude) formData.append('lng', postContent.coordinates.longitude);
    // for (const [name, value] of formData) {
    //   console.log(`FetchAPI_formData: ${name} = ${value}`);
    // }
    this.post(formData);
  }

  sendFileHttp(formData) {
    // console.log('FetchAPI_post_running');
    return fetch(this.url, {
      body: formData,
      method: 'POST',
      // headers: this.contentTypeHeader,
    });
  }

  async post(formData) {
    const response = await this.sendFileHttp(formData);
    // console.log('fetch result: ', response);
    if (response.ok) {
      const postID = await response.text();
      // console.log('fetch result_data: ', postID);
      this.socket.sendPostID(postID); // передаем id в WS для синхронизации
    } else {
      console.log('fetch result fail');
    }
  }
}
