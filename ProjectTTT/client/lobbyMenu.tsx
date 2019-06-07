import React from 'react';
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

interface Props {
    userName: string
}
interface State {
    isRecordsActive: boolean,
    mode: number
}

export default class LobbyMenu extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            isRecordsActive: true,
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
            return <RoomsList />;
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
                        <Tab label="Rooms" />
                        <Tab label="Records" />
                    </Tabs>
                </MainMenu>
                {this.getRecordsOrRooms()}
            </div>
        );
    }
}