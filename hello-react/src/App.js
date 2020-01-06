import React, { Component } from 'react';
import './App.css';

import Question from './components/Question.js';

class App extends Component {
    state = {
        currentQuestion: 0,
        questions: [
            { id: 0, equation: '2 + 7', answers: ['5', '2', '9', '11'] },
            { id: 1, equation: '3 * 3', answers: ['5', '2', '9', '11'] },
            { id: 2, equation: '7 - 2', answers: ['5', '2', '9', '11'] },
            { id: 3, equation: '5 + 6', answers: ['5', '2', '9', '11'] }
        ]
    };

    render() {
        console.log(this.state);
        return (
            <div className="wrapper">
                <Question
                    question={this.state.questions[this.state.currentQuestion]}
                />
            </div>
        );
    }
}

export default App;
