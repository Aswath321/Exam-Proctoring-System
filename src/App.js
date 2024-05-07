import React, { useState, useEffect } from "react";
import "./App.css";
import Login from './login/Login';
import QuestionForm from "./questionform/QuestionForm";
import QuestionNav from "./questionnav/QuestionNav"
import './questionform/QuestionForm.css';

function App() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [testOver, setTestOver] = useState(false);
    const [marks, setMarks] = useState(0);
    const [testStarted, setTestStarted] = useState(false);
    const [dashboard, setDashboard] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [userType, setUserType] = useState(null);
    const [loggedInTeacher, setLoggedInTeacher] = useState(false);
    const [numQuestions, setNumQuestions] = useState(0);
    const [usernameForResults, setUsernameForResults] = useState("");
    const [results, setResults] = useState([]);
    const [showUploadTest, setShowUploadTest] = useState(false);
    const [showViewResults, setShowViewResults] = useState(false);
    const [studentLogged, setStudentLogged] = useState(false);
    const [testNames, setTestNames] = useState([]);
    const [namesRetrived, setNamesRetrived] = useState(false);
    const [testName, setTestName] = useState("");
    const [proceed, setProceed] = useState(false);
    const [view, setView] = useState(false);
    const [backtohome,setBacktohome] = useState(true);
    const [cheat,setCheat] = useState("");


    useEffect(() => {        
        if (testStarted) {

            fetch('/head_pose')
            .then(response => {
                console.log('starting');
            })
            .catch(error => {
                console.error('Error fetching head pose:', error);
            });


            const handleVisibilityChange = () => {
                if (document.visibilityState === "hidden") {
                    alert("You are not allowed to switch tabs during the test.");
                    document.getSelection().removeAllRanges(); // Deselect text if any is selected
                }
            };

            document.addEventListener("visibilitychange", handleVisibilityChange);

            const testDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
            const startTime = Date.now();
            const timeoutId = setTimeout(() => {
                handleEndTest();
            }, testDuration);

            const timerId = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(testDuration - elapsedTime, 0);
                setTimeLeft(remainingTime);
            }, 1000);

            return () => {
                document.removeEventListener("visibilitychange", handleVisibilityChange);
                clearTimeout(timeoutId); // Cleanup the timeout
                clearInterval(timerId); // Cleanup the timer
            };

            
        }
    }, [testStarted]);

    useEffect(() => {
        if (timeLeft === 0) {
            handleEndTest();
        }
    }, [timeLeft]);


    function fetchQuestions() {
        fetch('/test_names')
            .then((res) => res.json())
            .then((data) => {
               // setQuestions(data);
                //setCurrentIndex(0);
                //setUserAnswers(new Array(data.length).fill(''));
                //setTestOver(false);
                //setTestStarted(true);
                setNamesRetrived(true);
                setTestNames(data);
            });
    };

    
    const handleTestNameClick = (testName) => {
        // Fetch questions for the selected test name
        fetch(`/test_questions?testName=${testName}`)
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data.questions);
                setCurrentIndex(0);
                setUserAnswers(new Array(data.questions.length).fill(''));
                setTestOver(false);
                setTestStarted(true);
                setTestName(testName);
            })
            .catch((error) => {
                console.error("Error fetching questions for test:", error);
            });
    };


    const fetchDashBoard=(userId)=> {
        setDashboard(true);
        
        // Fetch results from the backend
        
    };

    function studentLogin(){
        setStudentLogged(true);
        // <button onClick={fetchQuestions}>Questions</button>;
        // <button>Dashboard</button>;
    }

    function handleAnswer(option) {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentIndex] = option;
        setUserAnswers(updatedAnswers);
    }

    const handleUserType = (type) => {
                setUserType(type);
         };
        

    function handleEndTest() {
        setTestOver(true);
        setMarks(calculateMarks());
        setBacktohome(true);
        // Call the function to send test results to the server
       
        fetch('/stop_detection')
            .then(response => response.text()) // Extract the response content as text
            .then(data => {
                // Store the response content in a state variable for further use
                
                console.log('Detection stopped:', data);
                setCheat(data);
                setTimeout(() => {
                  console.log("cheater a?", cheat);
                  sendTestResultsToServer();
              }, 3000);
            })
            .catch(error => {
                console.error('Error fetching head pose:', error);
            });
        
    }

    function sendTestResultsToServer() {
        // Assuming you have an endpoint to handle test results on the server
        fetch('/submit_test_results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: usernameForResults,
                cheating:cheat,
                marks: marks,
                testname:testName,
                questions: questions.map(question => ({
                    question: question.question,
                    correct_answer: question.correct_answer,
                    options: question.answer,
                    user_answer: userAnswers[questions.indexOf(question)]
                    
                }))
            }),
            
        })
        .then((res) => res.json())
        .then((data) => {
            console.log("Test results submitted successfully:", data);
        })
        .catch((error) => {
            console.error("Error submitting test results:", error);
        });
    }

    function calculateMarks() {
        let marks = 0;
        for (let i = 0; i < questions.length; i++) {
            if (userAnswers[i] === questions[i].correct_answer) {
                marks++;
            }
        }
        return marks;
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    const handleTeacherLogin = async (username, password) => {
        setLoggedInTeacher(true);
    };

   
    const handleTestNameChange = (event) => {
        setTestName(event.target.value); // Define handleTestNameChange function
    };

    const handleUploadQuestionsPrior = async () => {
        setProceed(true);
    };

    const handleUploadQuestions = async () => {
        const newQuestions = [];
        for (let i = 0; i < numQuestions; i++) {
            // Assuming you have input fields for question, options, and correct answer in your component
            const question = document.getElementById(`question-${i}`).value;
            const option1 = document.getElementById(`option1-${i}`).value;
            const option2 = document.getElementById(`option2-${i}`).value;
            const option3 = document.getElementById(`option3-${i}`).value;
            const option4 = document.getElementById(`option4-${i}`).value;
            const correctAnswer = document.getElementById(`correctAnswer-${i}`).value;
            newQuestions.push({ question, answer: [option1, option2, option3, option4], correct_answer: correctAnswer });
        }
    

        // Now you can send newQuestions and the testName to the backend
        fetch('/upload_questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ testName: testName, questions: newQuestions }),
        })
        .then((res) => res.json())
        .then((data) => {
            alert("Uploaded Successfully")
            console.log("Questions uploaded successfully:", data);
        })
        .catch((error) => {
            console.error("Error uploading questions:", error);
        });
        setShowUploadTest(false);
        setProceed(false);
        
    };
    const handleUploadClick = async () => {
        setShowUploadTest(true);
        setShowViewResults(false);
    };
    
    

    const handleViewResults = () => {
        setShowViewResults(true);
        setShowUploadTest(false);
        // Fetch results from the backend
        fetch('/view_results')
            .then((res) => res.json())
            .then((data) => {
                setResults(data);
            })
            .catch((error) => {
                console.error("Error fetching results:", error);
            });
    };
    const testOverCall = () => {
        setDashboard(false);
        setTestStarted(false);
        setNamesRetrived(false);
        setBacktohome(false)
        
    };


    const handleViewResultsStudent = (userId) => {
        setShowViewResults(true);
        setShowUploadTest(false);
        // Fetch results for the specific user from the backend
        fetch(`/view_results_student?userId=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                setResults(data);
            })
            .catch((error) => {
                console.error("Error fetching results:", error);
            });
        setView(true);
    };


    return (
        <div className="App">
            <header className="App-header">
                {userType === null && (
                    <div>
                        
                        <div className="button-container">
                        {/* <h2>Select User Type</h2> */}
                        <button onClick={() => handleUserType('teacher')} className='btn-teacher'>Teacher</button>
                        <button onClick={() => handleUserType('student')} className='btn-student'>Student</button>
                        </div>
                    </div>
                )}
                {userType === 'teacher' && !loggedInTeacher && (
                    <Login onLogin={handleTeacherLogin} userType={userType} setUsernameForResults={setUsernameForResults}/>
                )}
                {userType === 'teacher' && loggedInTeacher && (
                    <>
                        {!showUploadTest && !showViewResults && (
                            <div className="button-container">
                                <button onClick={handleUploadClick} className="btn-uploadtest">Upload Test</button>
                                <button onClick={handleViewResults} className="btn-viewresults">View Student Results</button>
                            </div>
                        )}
                        {showUploadTest && !proceed &&(
                            <div className="upload-form">
                                <label>Number of Questions</label>
                                <input 
                                    type="number" 
                                    value={numQuestions} 
                                    onChange={(e) => setNumQuestions(e.target.value)} 
                                />
                                <label>Test Name</label>
                                <input 
                                    type="text" 
                                    value={testName} 
                                    onChange={(e) => setTestName(e.target.value)} 
                                />
                               
                                <button onClick={handleUploadQuestionsPrior}>Proceed</button>
                            </div>
                        )}
                        {showUploadTest && proceed &&(
                            <div>
                                <QuestionForm numQuestions={numQuestions}  handleTestNameChange={handleTestNameChange} />
                                <button onClick={handleUploadQuestions} className="btn-teacher">Upload Test</button>

                            </div>
                        )}                       
                                {showViewResults && (
                                    <div className="results-container">
                                    <h2>Results</h2>
                                    {Array.isArray(results) && results.length > 0 ? (
                                      <table>
                                        <thead>
                                          <tr>
                                            <th>Username</th>
                                            <th>Marks</th>
                                            <th>Cheater</th>
                                            <th>TestName</th>
                                            <th>Question</th>
                                            <th>Correct Answer</th>
                                            <th>Options</th>
                                            <th>User Answer</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {results.map((result, index) => (
                                            result.questions && result.questions.map((question, questionIndex) => (
                                              <tr key={`${index}-${questionIndex}`}>
                                                {questionIndex === 0 && (
                                                  <>
                                                    <td rowSpan={result.questions.length}>{result.username}</td>
                                                    <td rowSpan={result.questions.length}>{result.marks}</td>
                                                    <td rowSpan={result.questions.length}>{result.cheating}</td>
                                                    <td rowSpan={result.questions.length}>{result.testname}</td>
                                                  </>
                                                )}
                                                <td>{question.question}</td>
                                                <td>{question.correct_answer}</td>
                                                <td>{question.options.join(', ')}</td>
                                                <td>{question.user_answer || 'No answer provided'}</td>
                                              </tr>
                                            ))
                                          ))}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <p>No results available</p>
                                    )}
                                  </div>
                                  
                                  )}
                    </>
                )}

                {userType === 'student' && !dashboard && !testStarted && !studentLogged && (
                    <>
                    <Login onLogin={studentLogin} userType={userType} setUsernameForResults={setUsernameForResults} />
                    <h1>{dashboard}</h1>
                    </>
                )}

                {userType === 'student'  && studentLogged && !dashboard && !testStarted && !namesRetrived &&(
                    <div className="button-container"> 
                    <button onClick={fetchQuestions} className="btn-teacher">Take Test</button>
                    <button onClick={fetchDashBoard} className="btn-student">View Dashboard</button>
                    </div>
                )}

                {
                userType === 'student' &&
                    !dashboard &&
                    studentLogged &&
                    !testStarted &&
                    namesRetrived && (
                    <>
                        
                        <div className="test-names">
                        <h2>Choose a Test</h2>
                        {testNames.map((test, index) => (
                            <button key={index} onClick={() => handleTestNameClick(test.test_name)} className="test-button">
                            {test.test_name}
                            </button>
                        ))}
                        </div>
                    </>
                    )
                }


                    
                {userType === 'student' && testStarted && !testOver && (
                    <div className="test-container">
  <div className="question-wrapper">
    <h2>Question {currentIndex + 1}</h2>
    <p className="question-text">{questions[currentIndex]?.question}</p>
  </div>
  <div className="options-wrapper">
    <ul className="options-list">
      {questions[currentIndex]?.answer.map((option, index) => (
        <button 
          key={index} 
          onClick={() => handleAnswer(option)}
          className={userAnswers[currentIndex] === option ? "option-button selected" : "option-button"}
        >
          {option}
        </button>
      ))}
    </ul>
  </div>
  <QuestionNav 
    questions={questions} 
    currentIndex={currentIndex} 
    setCurrentIndex={setCurrentIndex} 
  />
  <div className="navigation-buttons">
    <button className="previous" onClick={() => setCurrentIndex(currentIndex === 0 ? questions.length - 1 : currentIndex - 1)}>Previous</button>
    <button className="next" onClick={() => setCurrentIndex(currentIndex === questions.length - 1 ? 0 : currentIndex + 1)}>Next</button>
    <button className="end" onClick={handleEndTest}>End Test</button>
  </div>
  {timeLeft !== null && <p className="time-left">Time Left: {formatTime(timeLeft)}</p>}
</div>



                )}



                

{userType === 'student' && testOver && backtohome &&(
  <div className="test-over-container">
    <h2>Test Over</h2>
    <p>Total Marks Obtained: {marks}</p>
    <button onClick={testOverCall}>Home Page</button>
  </div>
)}

                
                {userType === 'student' && dashboard && studentLogged && !testStarted && !view &&(
                    <> 
                    <div className="button-container">
                    <button  className="btn-student" onClick={() => handleViewResultsStudent(usernameForResults)}>Previous Results</button>
                    </div>
                    </>
                )
                }
                {
  userType === 'student' &&
    dashboard &&
    studentLogged &&
    !testStarted &&
    showViewResults &&
    view && (
      <div className="results-container">
  <h2>Results</h2>
  {Array.isArray(results) && results.length > 0 ? (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Marks</th>
          <th>TestName</th>
          <th>Question</th>
          <th>Correct Answer</th>
          <th>Options</th>
          <th>User Answer</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, index) => (
          result.questions && result.questions.map((question, questionIndex) => (
            <tr key={`${index}-${questionIndex}`}>
              {questionIndex === 0 && (
                <>
                  <td rowSpan={result.questions.length}>{result.username}</td>
                  <td rowSpan={result.questions.length}>{result.marks}</td>
                  <td rowSpan={result.questions.length}>{result.testname}</td>
                </>
              )}
              <td>{question.question}</td>
              <td>{question.correct_answer}</td>
              <td>{question.options.join(', ')}</td>
              <td>{question.user_answer || 'No answer provided'}</td>
            </tr>
          ))
        ))}
      </tbody>
    </table>
  ) : (
    <p>No results available</p>
  )}
</div>

    )
}




            </header>
        </div>
    );
}
          
export default App;


