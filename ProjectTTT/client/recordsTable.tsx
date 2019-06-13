import React from 'react';
import { serverAddress } from './sharedInclude';
import { styled } from '@material-ui/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountCircle from '@material-ui/icons/AccountCircle';
import StarBorder from '@material-ui/icons/StarBorder';
import TrashIcon from '@material-ui/icons/DeleteOutlined';

const MainItem = styled(ListItem)({
    width: '100%',
    maxWidth: 700,
});

const ItemIcon = styled(ListItemIcon)({
    minWidth: 35
});

const OffsetItemText = styled(ListItemText)({
    width: '40%',
    textOverflow: 'ellipsis'
});

const RecordsPosText = styled(ListItemText)({
    minWidth: 32,
    maxWidth: 32
});

const WLText = styled(ListItemText)({
    minWidth: 116,
    maxWidth: 116
});

interface ItemProps {
    pos: number,
    value: string,
    victories: number,
    defeats: number
}
interface ItemState {
    isOpen: boolean
}

class RecordsListItem extends React.Component<ItemProps, ItemState> {
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
                    <RecordsPosText primary={this.props.pos} />
                    <ListItemIcon>
                        <AccountCircle />
                    </ListItemIcon>
                    <OffsetItemText primary={
                        <div className='recordsListName'>
                            {this.props.value}
                        </div>
                    } />
                    <ItemIcon>
                        <StarBorder />
                    </ItemIcon>
                    <WLText primary={'victories   ' + this.props.victories} />
                    <ItemIcon>
                        <TrashIcon />
                    </ItemIcon>
                    <WLText primary={'defeats   ' + this.props.defeats} />
                </MainItem>
            </div>
        );
    }
}

interface ListProps { }
interface ListState { data: ReadonlyArray<string> }

export default class RecordsList extends React.Component<ListProps, ListState> {
    constructor(props) {
        super(props);
        this.state = {
            data: ['Dimka', 'Lenka', 'Jojo', 'Hika', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa']
        };
    }
    getListItems = () => {
        return this.state.data.map((v, i) => {
            return (
                <RecordsListItem
                    key={i}
                    pos={i + 1}
                    value={v}
                    victories={0}
                    defeats={0}
                />
            );
        });
    }
    render() {
        return (
            <div className='recordsListCenter'>
                <div className='recordsList'>
                    <List component="nav" aria-label="Main mailbox folders">
                        {this.getListItems()}
                    </List>
                </div>
            </div>
        );
    }
}