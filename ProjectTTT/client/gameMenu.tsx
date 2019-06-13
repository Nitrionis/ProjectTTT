import React from 'react';
import { styled } from '@material-ui/styles';
import MainMenu from './mainMenu';

interface Props {
    close: () => void,
    userName: string,
    opponentName: string
}
interface State { mode: boolean }

export default class GameMenu extends React.Component<Props, State> {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div></div>
        );
    }
}