const switchers = [...document.querySelectorAll('.input-switch input[type="checkbox"]')];
const socket = new WebSocket('ws://switch.darkshark.pro');

const levers = [false, false, false, false]
const knownLever = 0;
let checkedLever = 1;
let stateFlag = true;

const sendCompareQuery = (lever1, lever2, stateId) => {
  const query = {
    action: 'check',
    lever1,
    lever2,
    stateId,
  }

  socket.send(JSON.stringify(query));
}

const sendTurnOffQuery = stateId => {
  const query = {
    action: 'powerOff',
    stateId,
  }

  socket.send(JSON.stringify(query));
}

const checkAllSameOrNot = () => levers.every( lever => lever === stateFlag );

const toggleLevers = () => {
  switchers.forEach((switcher, i) => {
    switcher.checked = levers[i];
  })
}

socket.onopen = () => console.log('Connected');
socket.onclose = () => console.log('Disconnected');
socket.onmessage = event => {
  const data = JSON.parse(event.data);

  if (data.pulled >= 0) {
    levers[data.pulled] = !levers[data.pulled];
    toggleLevers();
    sendCompareQuery(knownLever, checkedLever, data.stateId);
  }

  if (data.newState === 'poweredOn') stateFlag = false;

  if (data.newState === 'poweredOff') {
    console.log('Token: ', data.token);
    socket.close();
  }

  if (data.same) {
    levers[checkedLever] = levers[knownLever];
    if (checkedLever < levers.length - 1) checkedLever++;
    if (checkAllSameOrNot()) sendTurnOffQuery(data.stateId);
  }
}