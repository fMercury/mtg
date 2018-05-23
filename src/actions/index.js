import Web3 from 'web3';
import contract from 'truffle-contract';
import TodosContract from '../..//build/contracts/MTG.json';
export const WEB3_CONNECTED = 'WEB3_CONNECTED';
export const WEB3_DISCONNECTED = 'WEB3_DISCONNECTED';
export const MTG_CARDS_CONTRACT_INSTANTIATED = 'MTG_CARDS_CONTRACT_INSTANTIATED';
export const MTG_CARDS_FETCHED = 'MTG_CARDS_FETCHED';
export const MTG_CARD_ADDED = 'MTG_CARD_ADDED';

export const defaultState = {
  web3: null,
  todos: []
};

export function web3connect() {
  return (dispatch) => {
    const web3 = window.web3;

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      dispatch({
        type: WEB3_CONNECTED,
        payload: new Web3(web3.currentProvider)
      });
    } else {
      dispatch({
        type: WEB3_CONNECTED,
        payload: new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
      });
    }
  };
}

export function instantiateMTGCardsContract() {
  return (dispatch, getState) => {
    const web3 = getState().web3;
    const todos = contract(TodosContract);
    todos.setProvider(web3.currentProvider);
    return todos.deployed().then((todosContract) => {
      dispatch({
        type: MTG_CARDS_CONTRACT_INSTANTIATED,
        payload: todosContract
      });
    });
  };
}

export function fetchCards() {
  return (dispatch, getState) => {
    const state = getState();
    const web3 = state.web3;
    const todosContract = state.todosContract;
    todosContract.getTodos().then((todos) => {
      dispatch({
        type: MTG_CARDS_FETCHED,
        payload: todos.map((todo) => web3.toAscii(todo))
      });
    });
  };
}

export function buyCard(payload) {
  return (dispatch, getState) => {
    const web3 = getState().web3;
    const todosContract = getState().todosContract;
    web3.eth.getAccounts((err, accounts) => {
      todosContract.addTodo(web3.fromAscii(payload), {
        from: accounts[0]
      }).then((results) => {
        dispatch({
          type: MTG_CARD_ADDED,
          payload
        });
      });
    });
  };
}