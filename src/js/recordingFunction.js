import timerFunction from './timerFunction';
import getCoordinates from './getCoordinates';
import Modal from './Modal';

export default async function recordingFunction(mediaType, fetch) {
  if (!navigator.mediaDevices) {
    console.log('navigator.mediaDevices not available');
    return false;
  }

  const mediaContent = {};

  try {
    if (!window.MediaRecorder) {
      console.log('window.MediaRecorder not available');
      return false;
    }

    const container = document.querySelector('.main_container');
    const timer = container.querySelector('[data-id=timelineRecordTime]');
    const minutes = timer.querySelector('[data-timer=timerMinutes]');
    const seconds = timer.querySelector('[data-timer=timerSeconds]');
    minutes.innerText = '00';
    seconds.innerText = '00';
    const submitButton = container.querySelector('[data-id=timelineSubmitRecordButton]');
    const cancelButton = container.querySelector('[data-id=timelineCancelRecordButton]');
    const widgetTimelineForm = container.querySelector('[data-id=timelineForm]');
    let timerId;
    const media = document.createElement(`${mediaType}`);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mediaType === 'video' });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    const videoPlayer = document.createElement('div');
    if (mediaType === 'video') {
      videoPlayer.classList.add('video_player');
      media.srcObject = stream;
      media.play();
      media.controls = true;
      media.muted = 'muted';
      videoPlayer.append(media);
      widgetTimelineForm.before(videoPlayer);
    }

    const finishRecord = () => {
      clearInterval(timerId);
      // stream.getTracks().forEach((track) => track.stop());
      media.srcObject = null;
      videoPlayer.remove();
    };

    const saveRecord = () => {
      const extFile = chunks[0].type.replace(/;.+/, '').split('/')[1];
      mediaContent.file = new File(chunks, `${mediaType}record_${+new Date()}.${extFile}`);
      mediaContent.type = 'file';
      mediaContent.fileType = mediaType;
      getCoordinates(mediaContent, fetch);
    };

    const submitRecord = () => {
      recorder.stop();
      submitButton.removeEventListener('click', submitRecord);
    };

    const cancelRecord = () => {
      finishRecord();
      cancelButton.removeEventListener('click', cancelRecord);
    };

    recorder.addEventListener('start', () => {
      // console.log('recording started');
      timerId = setInterval(() => timerFunction(minutes, seconds), 1000);
    });

    recorder.addEventListener('dataavailable', (evt) => {
      // console.log('data available');
      chunks.push(evt.data);
      if (evt.data.size > 0) saveRecord();
    });

    submitButton.addEventListener('click', submitRecord);
    cancelButton.addEventListener('click', cancelRecord);
    recorder.addEventListener('stop', () => {
      stream.getTracks().forEach((track) => track.stop());
      finishRecord();
    });

    recorder.start();
  } catch (e) {
    console.error(e);
    const popup = new Modal();
    popup.showMessage();
  }

  return false;
}
