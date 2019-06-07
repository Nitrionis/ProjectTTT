import React from 'react';
import Button from '@material-ui/core/Button';

import { styled } from '@material-ui/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Collapse from '@material-ui/core/Collapse';
import StarBorder from '@material-ui/icons/StarBorder';
import TrashIcon from '@material-ui/icons/DeleteOutlined';

const MainItem = styled(ListItem)({
    width: '100%',
    maxWidth: 480,
});

const NestedItem = styled(ListItem)({
    width: '100%',
    maxWidth: 480,
    paddingLeft: '48px'
});

interface ItemProps {
    value: string,
    victories: number,
    defeats: number
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
    render() {
        return (
            <div>
                <MainItem button onClick={this.setOpen}>
                    <ListItemIcon>
                        <AccountCircle />
                    </ListItemIcon>
                    <ListItemText primary={this.props.value} />
                    <Button color="inherit">Join</Button>
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

interface ListProps { }
interface ListState { data: ReadonlyArray<string> }

export default class RoomsList extends React.Component<ListProps, ListState> {
    constructor(props) {
        super(props);
        this.state = {
            data: ['Dimka', 'Lenka', 'Jojo', 'Hika']
        };
    }
    getListItems = () => {
        return this.state.data.map((v, i) => {
            return (
                <RoomListItem
                    key={i}
                    value={v}
                    victories={0}
                    defeats={0}
                />
            );
        });
    }
    render() {
        return (
            <div className='roomsListCenter'>
                <div className='roomsList'>
                    <List component="nav" aria-label="Main mailbox folders">
                        {this.getListItems()}
                    </List>
                </div>
            </div>
        );
    }
}