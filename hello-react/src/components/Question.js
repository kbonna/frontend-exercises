import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './Question.css';

class Question extends Component {
    render() {
        return (
            <div className="question">
                <p>{this.props.question.equation}</p>
                <div className="question__answers">
                    <button className="question__answer">
                        {this.props.question.answers[0]}
                    </button>
                    <button className="question__answer">
                        {this.props.question.answers[1]}
                    </button>
                    <button className="question__answer">
                        {this.props.question.answers[2]}
                    </button>
                    <button className="question__answer">
                        {this.props.question.answers[3]}
                    </button>
                </div>
            </div>
        );
    }
}

export default Question;
