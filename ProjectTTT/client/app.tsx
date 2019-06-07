import React from 'react';
import ReactDOM from 'react-dom';
import Game from './game';
import LobbyMenu from './lobbyMenu';

const modeAuthentication = 0;
const modeLobbyMenu = 1;
const modeGame = 0;

interface Props {  }
interface State {
    userName: string,
    mode: number
}

export class App extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            userName: 'AirAce',
            mode: modeLobbyMenu
        };
    }
    render() {
        if (this.state.mode == modeLobbyMenu)
            return <LobbyMenu userName={this.state.userName} />;
    }
}

ReactDOM.render(<App />, document.getElementById('root'));