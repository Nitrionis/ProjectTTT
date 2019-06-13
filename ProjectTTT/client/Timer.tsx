import React from 'react';

type ResetTimeFunction = () => void;

interface Props {
    text: string
    startTime: number,
    active: boolean,
    reset: (ResetTimeFunction) => void
}
interface State {
    time: number
}

export default class Timer extends React.Component<Props, State> {
    timerId: number;
    constructor(props) {
        super(props);
        this.state = {
            time: this.props.startTime
        };
        this.timerId = setInterval(this.tick, 1000);
        this.props.reset(this.reset);
    }
    reset = () => {
        this.setState({ time: this.props.startTime });
    }
    tick = () => {
        if (this.state.time > 0 && this.props.active)
            this.setState({ time: this.state.time - 1 });
    }
    componentWillUnmount() {
        clearInterval(this.timerId);
    }
    render() {
        return (
            <div>
                <h1 className='timerText'>{this.props.text} {this.state.time}</h1>
            </div>
        );
    }
}