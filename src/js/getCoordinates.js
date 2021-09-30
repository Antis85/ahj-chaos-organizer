import Modal from './Modal';

export default function getCoordinates(postContentObj = {}, networkAPI) {
  console.log('getCoordinates()_postContentObj:', postContentObj);
  const postContent = { ...postContentObj };
  const popup = new Modal();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        postContent.coordinates = {
          latitude: latitude.toFixed(5),
          longitude: longitude.toFixed(5),
        };
        // console.log('getCoordinates_postContent:', postContent);
        networkAPI.sendPostContent(postContent);
      }, (error) => {
        console.error(error);
        popup.showModalManualCoords(postContent, networkAPI);
      },
    );
  } else {
    console.log('geo API - false');
    popup.showModalManualCoords(postContent, networkAPI);
  }
}
