const socket = new WebSocket('ws://switch.darkshark.pro');
const levers = [...document.querySelectorAll('.input-switch input[type="checkbox"]')];

const state = {
  levers: [false, false, false, false],
  stateId: null,
}

let knownLever;
let checkingLever;
let ifAllSameFlag = true;

socket.onopen = () => console.log('Connected');
socket.onmessage = event => {
  const data = JSON.parse(event.data);

  if (data.pulled >= 0) {
    updateState(data.pulled, data.stateId);  
    checkingLever = knownLever === state.levers.length - 1 ? knownLever - 1 : knownLever + 1;
    sendQuery(knownLever, checkingLever, state.stateId);
    console.log('state', state.levers);
    if (checkAllSame()) turnOff(state.stateId);
  }

  if (data.same) {
    updateStateAfterCheck(knownLever, checkingLever);
  }

  if (data.newState === 'poweredOn') {
    ifAllSameFlag = false;
  }
  else if (data.newState === 'poweredOff') {
    socket.close();
    console.log('Token: ', data.token);
  }
}

const updateState = (pulledLever, stateId) => {
  state.levers[pulledLever] = !state.levers[pulledLever];
  state.stateId = stateId;
  knownLever = pulledLever;
  toggleLever();
}
const updateStateAfterCheck = (pulledLever, checkedLever) => {
  state.levers[checkedLever] = checkedLever !== pulledLever ? state.levers[pulledLever] : state.levers[checkedLever];
}

const toggleLever = () => {
  levers.forEach((lever, i) => lever.checked = state.levers[i])
}

const checkAllSame = () => {
  return state.levers.every( lever => lever === ifAllSameFlag );
}

const sendQuery = (lever1, lever2, stateId) => {
  const query = {
    action: 'check',
    lever1,
    lever2,
    stateId,
  }
  socket.send(JSON.stringify(query));
}

const turnOff = stateId => {
  const query = {
    action: 'powerOff',
    stateId,
  }
  socket.send(JSON.stringify(query));
}