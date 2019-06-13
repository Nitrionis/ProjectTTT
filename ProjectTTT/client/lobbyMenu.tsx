import React from 'react';
import { serverAddress } from './sharedInclude';
import { styled } from '@material-ui/styles';
import MainMenu from './mainMenu';
import RoomsList from './roomsList';
import RecordsList from './recordsTable';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

const NikeName = styled(Typography)({
    paddingLeft: 32,
    paddingRight: 32
});

const MainTab = styled(Tab)({
    fontSize: '1em'
});

interface Props {
    userName: string,
    openGame: (opponentName: string) => void
}
interface State {
    isRecordsActive: boolean,
    mode: number
}

export default class LobbyMenu extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            isRecordsActive: false,
            mode: 0
        };
    }
    toggleMode = (mode) => {
        this.setState({
            isRecordsActive: mode
        });
    }
    getRecordsOrRooms = () => {
        if (this.state.isRecordsActive)
            return <RecordsList />;
        else
            return <RoomsList userName={this.props.userName} loadGame={this.props.openGame} />;
    }
    onLeave = () => {

    }
    handleChangeMode = (event, newValue) => {
        this.setState({ mode: newValue, isRecordsActive: newValue });
    }
    render() {
        return (
            <div>
                <MainMenu userName={this.props.userName} leaveButtonText='Sign out' onLeave={this.onLeave}>
                    <NikeName variant="h6">{this.props.userName}</NikeName>
                    <Tabs value={this.state.mode} onChange={this.handleChangeMode}>
                        <MainTab label="Rooms" />
                        <MainTab label="Records" />
                    </Tabs>
                </MainMenu>
                {this.getRecordsOrRooms()}
            </div>
        );
    }
}