import React from "react";
import './QuestionForm.css';

const QuestionForm = ({ numQuestions }) => {
    return (
        <div className="question-form">
            {Array.from({ length: numQuestions }, (_, i) => (
                <div key={i}>
                    <label>Question {i + 1}</label>
                    <input type="text" id={`question-${i}`} />
                    <label>Option 1</label>
                    <input type="text" id={`option1-${i}`} />
                    <label>Option 2</label>
                    <input type="text" id={`option2-${i}`} />
                    <label>Option 3</label>
                    <input type="text" id={`option3-${i}`} />
                    <label>Option 4</label>
                    <input type="text" id={`option4-${i}`} />
                    <label>Correct Answer</label>
                    <input type="text" id={`correctAnswer-${i}`} />
                </div>
            ))}
        </div>
    );
};

export default QuestionForm;