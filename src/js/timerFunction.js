/* eslint-disable no-param-reassign */
export default function timerFunction(/* timer */minutes, secondes) {
  const sec = (+secondes.innerText + 1) % 60;
  if (sec < 10) secondes.innerText = `0${sec}`;
  if (sec >= 10) secondes.innerText = sec;
  if (sec === 0) {
    const min = +minutes.innerText + 1;
    if (min < 10) minutes.innerText = `0${min}`;
    if (min >= 10) minutes.innerText = min;
  }
}
