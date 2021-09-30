export default function checkCoordinatesValidity(inputValue) {
  let newValue;
  const validObj = {};

  if (inputValue.startsWith('[') && inputValue.endsWith(']')) {
    newValue = inputValue.slice(1, inputValue.length - 1).split(',');
  } else {
    newValue = inputValue.split(',');
  }

  if (newValue.length !== 2) return validObj;
  // lat и lng - строки
  const lat = parseFloat(newValue[0].trim()).toFixed(5);
  const lng = parseFloat(newValue[1].trim()).toFixed(5);

  if (!Number.isNaN(lat) && Math.abs(lat) <= 90) {
    validObj.latitude = lat;
  }

  if (!Number.isNaN(lng) && Math.abs(lng) <= 180) {
    validObj.longitude = lng;
  }

  return validObj;
}
