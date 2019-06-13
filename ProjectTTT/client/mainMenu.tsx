import React from 'react';
import { styled } from '@material-ui/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

const LeaveButton = styled(Button)({
    marginRight: 0
});

const FreeSpace = styled(Typography)({
    flexGrow: 1
});

const Head = styled(AppBar)({
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
});

const Label = styled(Typography)({
    fontWeight: 600,
    fontStyle: 'italic'
});


interface Props {
    userName: string,
    leaveButtonText: string,
    onLeave: (event: React.MouseEvent<HTMLButtonElement>) => void
}
interface State {  }

export default class MainMenu extends React.Component<Props, State> {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <Head position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="Menu">
                            <MenuIcon />
                        </IconButton>
                        <Label variant="h6">Tic Tac Toe</Label>
                        {this.props.children}
                        <FreeSpace></FreeSpace>
                        <LeaveButton color="inherit" onClick={this.props.onLeave}>
                            {this.props.leaveButtonText}</LeaveButton>
                    </Toolbar>
                </Head>
            </div>
        );
    }
}