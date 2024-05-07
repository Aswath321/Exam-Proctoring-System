import React, { useState } from "react";


function QuestionNav({ questions, currentIndex, setCurrentIndex }) {
    return (
        <div className="question-nav">
            {questions.map((_, index) => (
                <button 
                    key={index} 
                    onClick={() => setCurrentIndex(index)}
                    className={currentIndex === index ? "active" : ""}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    );
}

export default QuestionNav;
