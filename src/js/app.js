import ChaosOrganizer from './ChaosOrganizer';
import Socket from './WebSocketAPI';
import Fetch from './FetchAPI';

const urlWS = 'wss://ahj-chaos-organizer.herokuapp.com';
const urlHTTP = 'https://ahj-chaos-organizer.herokuapp.com';
// const urlWS = 'ws://localhost:7070';
// const urlHTTP = 'http://localhost:7070';
const socket = new Socket(urlWS);
// socket.initWsHandlers();
const fetch = new Fetch(urlHTTP, socket);
const chaosOrganizer = new ChaosOrganizer(fetch, socket);
chaosOrganizer.init();
