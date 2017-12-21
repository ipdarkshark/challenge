const socket = new WebSocket('ws://switch.darkshark.pro');
const levers = [...document.querySelectorAll('.input-switch input[type="checkbox"]')];

const state = {
  levers: [false, false, false, false],
}

let knownLever;
let checkingLever;
let firstPullFlag = true;
let allSame = true;

socket.onopen = () => console.log('Connected');
socket.onerror = error => console.log('Error', error);
socket.onmessage = event => {
  const data = JSON.parse(event.data);

  if (data.hasOwnProperty('pulled')) {
    // toggleLever(data.pulled);
    updateState(data.pulled, data.stateId);

    console.log(JSON.stringify(state.levers))

    // if (checkAllSame()) {
    //   turnOff(data.stateId);
    // }

    let checkingLeverIndex = state.levers.indexOf(!allSame);
    if (checkingLeverIndex !== -1) {
      checkingLever = checkingLeverIndex;
      checkSame(knownLever, checkingLeverIndex, data.stateId);
    }
  }

  if (data.hasOwnProperty('same')) {
    updateStateAfterCheckSame(knownLever, checkingLever, data.same);
  }

  if (checkAllSame()) {
    turnOff(data.stateId);
  }

  if (data.newState === 'poweredOn') {
    console.log(JSON.stringify(state.levers))
    allSame = false;
  }

  if (data.newState === 'poweredOff') {
    console.log('Token: ', data.token)
    socket.close();
  }
}

const toggleLever = leverID => {
  levers[leverID].checked ? levers[leverID].checked = false : levers[leverID].checked = true;
}

const updateState = (pulledLever) => {
  state.levers[pulledLever] = !state.levers[pulledLever];
  knownLever = pulledLever;
}

const updateStateAfterCheckSame = (pulledLever, checkedLever, same) => {
  if (same) {
    state.levers[checkedLever] = state.levers[pulledLever];
  }
}

const checkSame = (l1, l2, id) => {
  const query = {
    action: "check",
    lever1: l1,
    lever2: l2,
    stateId: id,
  }
  socket.send(JSON.stringify(query));
}

const checkAllSame = () => {
  console.log(allSame)
  return state.levers.every( lever => lever === allSame );
}

const turnOff = stateId => {
  const query = {
    action: 'powerOff',
    stateId: stateId,
  }
  socket.send(JSON.stringify(query));
}