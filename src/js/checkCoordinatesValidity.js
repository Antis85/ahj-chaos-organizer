export default function checkCoordinatesValidity(inputValue) {
  let newValue;
  const validObj = {};

  if (inputValue.startsWith('[') && inputValue.endsWith(']')) {
    newValue = inputValue.slice(1, inputValue.length - 1).split(',');
  } else {
    newValue = inputValue.split(',');
  }

  if (newValue.length !== 2) return validObj;
  const lat = parseFloat(newValue[0].trim());
  const lng = parseFloat(newValue[1].trim());

  if (!Number.isNaN(lat) && Math.abs(lat) <= 90) {
    validObj.lat = lat;
  }

  if (!Number.isNaN(lng) && Math.abs(lng) <= 180) {
    validObj.lng = lng;
  }

  return validObj;
}
