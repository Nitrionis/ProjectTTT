import React from 'react';
import { serverAddress } from './sharedInclude';
import { styled } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import MainMenu from './mainMenu';
import io from 'socket.io-client';
import Timer from './Timer';


const NikeName = styled(Typography)({
    paddingLeft: 32,
    paddingRight: 0
});

type ResetTimeFunction = () => void;

interface Props {
    close: () => void,
    userName: string,
    opponentName: string
}
interface State {
    isMyTurn: boolean,
    isTimerActive: boolean,
    opponentName: string,
    isGameOverModalOpen: boolean,
    msgTop: string,
    msgBot: string
}

export default class Game extends React.Component<Props, State> {

    socket: any;
    resetTimer: ResetTimeFunction;

    constructor(props) {
        super(props);
        this.state = {
            isMyTurn: true,
            isTimerActive: false,
            opponentName: '',
            isGameOverModalOpen: false,
            msgTop: '',
            msgBot: ''
        };
        this.socket = io.connect(serverAddress);
        this.socket.emit('setupGame', {
            userName: this.props.userName,
            roomName: this.props.opponentName == null ? this.props.userName : this.props.opponentName
        });
        this.socket.on('launchGame', (data) => {
            this.setState({
                opponentName: data.opponentName,
                isTimerActive: true,
                isGameOverModalOpen: true,
                msgTop: 'GAME',
                msgBot: 'LAUNCHED'
            });
        });
        this.socket.on('userDisconnected', this.userDisconnected);
    }
    userDisconnected = (data) => {
        this.setState({
            isGameOverModalOpen: true,
            msgTop: data.msgTop,
            msgBot: data.msgBot
        });
    }
    leaveRoom = () => {
        this.props.close();
    }
    getResetFunction = (func: ResetTimeFunction) => {
        this.resetTimer = func;
    }
    getTimerText = () => {
        if (this.state.isMyTurn)
            return 'your turn';
        else
            return "opponent's turn";
    }
    closeModal = () => {
        this.setState({ isGameOverModalOpen: false });
        if (this.state.msgTop != 'GAME')
            this.leaveRoom();
    }
    gameOver = (data) => {
        setTimeout(() => {
            this.setState({
                isGameOverModalOpen: true,
                msgTop: data.msgTop,
                msgBot: data.msgBot
            });
        }, 1000);
    }
    render() {
        return (
            <div>
                <MainMenu userName={this.props.userName} leaveButtonText='Leave' onLeave={this.leaveRoom}>
                    <NikeName variant="h6">{this.props.userName}</NikeName>
                    <NikeName variant="h6">{'vs'}</NikeName>
                    <NikeName variant="h6">{this.state.opponentName}</NikeName>
                    <Timer text={this.getTimerText()} active={this.state.isTimerActive} startTime={60} reset={this.getResetFunction} />
                </MainMenu>
                <GameGrid socket={this.socket} gameOver={this.gameOver} />
                <Modal
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    open={this.state.isGameOverModalOpen}
                    onClose={this.closeModal}
                >
                    <div className='gameOverMainDiv'>
                        <div className='gameOverModal'>
                            <div className='gameOverModalLabel'>
                                <h6 className='gameOverModalText'>{this.state.msgTop}</h6>
                                <h6 className='gameOverModalText'>{this.state.msgBot}</h6>
                            </div>
                            <Button variant="contained" color="secondary" onClick={this.closeModal}>Next</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

interface GridProps {
    socket: any,
    gameOver: (data: any) => void
}
interface GridState { }

class GameGrid extends React.Component<GridProps, GridState> {

    socket: any;
    canvas: React.RefObject<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D;
    gameGrid: Array<Array<number>>;
    clickCount: number;

    constructor(props) {
        super(props);

        this.socket = this.props.socket;
        this.canvas = React.createRef();
        this.ctx = null;
        this.gameGrid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        this.clickCount = 0;

        this.socket.on('updateGrid', this.updateGrid);
        this.socket.on('gameOver', this.gameOver);
    }
    gameOver = (data) => {
        this.props.gameOver(data);
        this.updateGrid(data);
    }
    drawX(ctx: CanvasRenderingContext2D, x: number, y: number, elementSize: number) {
        ctx.beginPath();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 16;
        var len = elementSize * 0.7;
        var startX = x * elementSize + elementSize * 0.15;
        var startY = y * elementSize + elementSize * 0.15;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + len, startY + len);
        ctx.moveTo(startX + len, startY);
        ctx.lineTo(startX, startY + len);
        ctx.stroke();
    }
    drawO(ctx: CanvasRenderingContext2D, x: number, y: number, elementSize: number) {
        ctx.beginPath();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 16;
        ctx.arc((x + 0.5) * elementSize, (y + 0.5) * elementSize, elementSize / 2.6, 0, 2 * Math.PI);
        ctx.stroke();
    }
    drawDrid = () => {
        var canvas = this.canvas.current;
        var ctx = this.ctx;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();

        ctx.strokeStyle = "#f0f0f0";
        ctx.lineWidth = 3;

        ctx.moveTo(canvas.width / 3, 0);
        ctx.lineTo(canvas.width / 3, canvas.height);
        ctx.moveTo(canvas.width / 3 * 2, 0);
        ctx.lineTo(canvas.width / 3 * 2, canvas.height);

        ctx.moveTo(0, canvas.height / 3);
        ctx.lineTo(canvas.width, canvas.height / 3);
        ctx.moveTo(0, canvas.height / 3 * 2);
        ctx.lineTo(canvas.width, canvas.height / 3 * 2);

        ctx.stroke();
    }
    drawSession = () => {
        var canvas = this.canvas.current;
        var ctx = this.ctx;
        var arr = this.gameGrid;
        var elementSize = canvas.width / 3;
        for (var x = 0; x < 3; x++) {
            for (var y = 0; y < 3; y++) {
                if (arr[x][y] == 1)
                    this.drawX(ctx, x, y, elementSize);
                if (arr[x][y] == 2)
                    this.drawO(ctx, x, y, elementSize);
            }
        }
    }
    updateGrid = (data) => {
        this.gameGrid = data.grid;
        this.clickCount = data.clickCount;
        this.drawDrid();
        this.drawSession();
        console.log('clickCount' + this.clickCount);
    }
    getCanvasMousePos = (evt) => {
        var rect = this.canvas.current.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    canvasClickHandle = (e) => {
        var pos = this.getCanvasMousePos(e);
        var x = Math.floor(pos.x / (this.canvas.current.width / 3));
        var y = Math.floor(pos.y / (this.canvas.current.height / 3));
        if (this.gameGrid[x][y] == 0) {
            var grid = this.gameGrid.map(arr => arr.slice());
            grid[x][y] = this.clickCount % 2 + 1;
            this.socket.emit('changeGrid', { grid: grid });
        }
    }
    componentDidMount() {
        this.ctx = this.canvas.current.getContext('2d');
        this.drawDrid();
        this.drawSession();
    }
    componentWillUnmount() {
        this.socket.disconnect();
    }
    render() {
        return (
            <div className='tableMainDiv'>
                <canvas className='gameTable' width={600} height={600} onClick={this.canvasClickHandle} ref={this.canvas} />
            </div>
        );
    }
}
