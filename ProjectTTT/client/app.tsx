declare var require: any

import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';

export class Hello extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Button variant="contained" color="primary">Hello World</Button>
        );
    }
}

ReactDOM.render(<Hello />, document.getElementById('root'));