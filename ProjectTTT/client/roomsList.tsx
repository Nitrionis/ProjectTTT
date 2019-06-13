import React from 'react';
import { serverAddress } from './sharedInclude';
import { styled } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Collapse from '@material-ui/core/Collapse';
import StarBorder from '@material-ui/icons/StarBorder';
import TrashIcon from '@material-ui/icons/DeleteOutlined';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import UpdateIcon from '@material-ui/icons/Autorenew';
import Axios from 'axios';

const MainItem = styled(ListItem)({
    width: '100%',
    maxWidth: 480,
    cursor: 'default'
});

const ItemText = styled(ListItemText)({
    overflow: 'hidden',
    textOverflow: 'ellipsis'
});

const NestedItem = styled(ListItem)({
    width: '100%',
    maxWidth: 480,
    paddingLeft: '48px'
});

const Icon = styled(ListItemIcon)({
    cursor: 'pointer'
});

interface ItemProps {
    value: string,
    victories: number,
    defeats: number,
    userName: string,
    loadGame: (opponentName: string) => void
}
interface ItemState {
    isOpen: boolean
}

class RoomListItem extends React.Component<ItemProps, ItemState> {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }
    setOpen = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    connectToRoom = () => {
        // connect to the room
        this.props.loadGame(this.props.value);
    }
    render() {
        return (
            <div>
                <MainItem button>
                    <Icon onClick={this.setOpen}>
                        <AccountCircle />
                    </Icon>
                    <ItemText primary={this.props.value} />
                    <Button color="inherit" onClick={this.connectToRoom}>Join</Button>
                </MainItem>
                <Collapse in={this.state.isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <NestedItem button>
                            <ListItemIcon>
                                <StarBorder />
                            </ListItemIcon>
                            <ListItemText primary={'victories   ' + this.props.victories} />
                            <ListItemIcon>
                                <TrashIcon />
                            </ListItemIcon>
                            <ListItemText primary={'defeats   ' + this.props.defeats} />
                        </NestedItem>
                    </List>
                </Collapse>
            </div>
        );
    }
}

interface ListProps {
    userName: string,
    loadGame: (opponentName: string) => void
}
interface ListState { data: Object }

export default class RoomsList extends React.Component<ListProps, ListState> {
    constructor(props) {
        super(props);
        this.state = {
            data: null//['Dimka', 'Lenka', 'Jojo', 'Hika']
        };
    }
    updateRoomsData = () => {
        Axios.get(serverAddress + 'getRooms/', {}).then((res) => {
            console.log('getRooms');
            console.log(res.data);
            this.setState({ data: res.data });
        });
    }
    getListItems = () => {
        var arr = [];
        var index = 0;
        for (var prop in this.state.data) {
            arr.push(
                <RoomListItem
                    key={index}
                    value={prop}
                    victories={this.state.data[prop].victories}
                    defeats={this.state.data[prop].defeats}
                    userName={this.props.userName}
                    loadGame={this.props.loadGame}
                />
            );
            index++;
        }
        return arr;
    }
    createRoom = () => {
        Axios.post(serverAddress + 'createRoom/', {
            name: this.props.userName
        }).then((res) => {
            if (res.data.res) {
                this.props.loadGame(null);
            }
        });
    }
    componentDidMount() {
        this.updateRoomsData();
    }
    render() {
        return (
            <div className='roomsListCenter'>
                <div className='roomsListButtons'>
                    <div className='roomsListButton'>
                        <Fab color="secondary" aria-label="Add" onClick={this.updateRoomsData}>
                            <UpdateIcon />
                        </Fab>
                    </div>
                    <div className='roomsListButton'>
                        <Fab color="secondary" aria-label="Add" onClick={this.createRoom}>
                            <AddIcon />
                        </Fab>
                    </div>
                </div>
                <div className='roomsList'>
                    <List component="nav" aria-label="Main mailbox folders">
                        {this.getListItems()}
                    </List>
                </div>
            </div>
        );
    }
}