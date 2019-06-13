import React from 'react';
import ReactDOM from 'react-dom';
import Game from './game';
import LobbyMenu from './lobbyMenu';
import Authorization from './authorization';

const modeAuthentication = 0;
const modeLobbyMenu = 1;
const modeGame = 2;

interface Props {  }
interface State {
    userName: string,
    opponentName: string,
    mode: number
}

export class App extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            userName: 'AirAce',
            opponentName: 'AirAceOpponent',
            mode: modeAuthentication
        };
    }
    closeAuthorization = (name: string) => {
        this.setState({
            mode: modeLobbyMenu,
            userName: name
        });
    }
    closeGame = () => {
        this.setState({
            mode: modeLobbyMenu
        });
    }
    openGame = (opponentName: string) => {
        this.setState({
            opponentName: opponentName,
            mode: modeGame
        });
    }
    render() {
        if (this.state.mode == modeLobbyMenu)
            return <LobbyMenu userName={this.state.userName} openGame={this.openGame} />;
        if (this.state.mode == modeAuthentication)
            return <Authorization close={this.closeAuthorization} />
        if (this.state.mode == modeGame)
            return <Game userName={this.state.userName} opponentName={this.state.opponentName} close={this.closeGame} />
    }
}

ReactDOM.render(<App />, document.getElementById('root'));