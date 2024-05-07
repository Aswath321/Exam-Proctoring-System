# from flask import Flask, jsonify,request
# import datetime
# from head_pose_estimation import main_model
# from eye_tracker import eye_track
# from pymongo import MongoClient


# # Initializing Flask app
# app = Flask(__name__)


# # Initialize MongoDB client
# client = MongoClient('mongodb://localhost:27017/') 
# db = client['exam'] 
# collection_question = db['questions']  
# collection_login = db['login'] 



# @app.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')

#     user = collection_login.find_one({"user": username})
#     if user:
#         stored_password = user.get('password')
#         if password == stored_password:
#             return jsonify({"success": True}), 200
#         else:
#             return jsonify({"success": False, "message": "Incorrect password"}), 401
#     else:
#         return jsonify({"success": False, "message": "User not found"}), 404




# @app.route('/questions')
# def get_questions():
#     questions = [doc['question'] for doc in collection_question.find()]
#     return jsonify(questions)
#     #qs=["Capital of India ?","prime MINISTER OF india?"]
#     #return jsonify(qs)



# @app.route('/submit_answers', methods=['POST'])
# def submit_answers():
#     submitted_answers = []
#     data = request.get_json()
#     answers = data.get('answers', [])
#     submitted_answers.append(answers)
#     print("Submitted Answers:", answers)
#     return jsonify({'message': 'Answers submitted successfully'})

# @app.route('/head_pose')
# def get_pose():
#     #eye_track()
#     #main_model()
#     print(1)
    

 
# # Running app
# if __name__ == '__main__':
#     app.run(debug=True,port=5012)




#working
# from flask import Flask, jsonify, request
# from pymongo import MongoClient

# app = Flask(__name__)

# # Initialize MongoDB client
# client = MongoClient('mongodb://localhost:27017/') 
# db = client['exam'] 
# collection_question = db['questions']  
# collection_login = db['login'] 

# @app.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')

#     user = collection_login.find_one({"user": username})
#     print(db['login'].find_one().get('password'))
#     if user:
#         stored_password = user.get('password')
#         if password == stored_password:
#             return jsonify({"success": True}), 200
#         else:
#             return jsonify({"success": False, "message": "Incorrect password"}), 401
#     else:
#         return jsonify({"success": False, "message": "User not found"}), 404

# @app.route('/questions')
# def get_questions():
#     questions = list(collection_question.find({}, {"_id": 0}))
#     return jsonify(questions)

# @app.route('/submit_answers', methods=['POST'])
# def submit_answers():
#     data = request.get_json()
#     answers = data.get('answers', [])
#     print(answers)
#     submitted_answers = []
#     for user_answer, question in zip(answers, collection_question.find()):
#         correct_answer = question.get('correct_answer')
#         print(user_answer,correct_answer)
#         if user_answer == correct_answer:
#             submitted_answers.append(user_answer)
    
#     # Calculate marks based on the submitted answers
#     marks = len(submitted_answers)
#     return jsonify({'marks': marks}), 200


# @app.route('/head_pose')
# def get_pose():
#     # Your logic for head_pose() goes here
#     pass

# if __name__ == '__main__':
#     app.run(debug=True, port=5012)





#working2
# from flask import Flask, jsonify, request
# from pymongo import MongoClient

# app = Flask(__name__)

# # Initialize MongoDB client
# client = MongoClient('mongodb://localhost:27017/') 
# db = client['exam'] 
# collection_question = db['questions']  
# collection_login = db['login'] 

# @app.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')

#     user = collection_login.find_one({"user": username})
#     if user:
#         stored_password = user.get('password')
#         if password == stored_password:
#             return jsonify({"success": True}), 200
#         else:
#             return jsonify({"success": False, "message": "Incorrect password"}), 401
#     else:
#         return jsonify({"success": False, "message": "User not found"}), 404

# @app.route('/questions')
# def get_questions():
#     questions = list(collection_question.find({}, {"_id": 0}))
#     return jsonify(questions)

# @app.route('/submit_answers', methods=['POST'])
# def submit_answers():
#     data = request.get_json()
#     answers = data.get('answers', [])
#     submitted_answers = []
#     for index, answer in enumerate(answers):
#         question = collection_question.find_one({'index': index})
#         correct_answer = question.get('correct_answer')
#         submitted_answers.append({'index': index, 'answer': answer})
    
#     # Calculate marks based on the submitted answers
#     marks = 0
#     for submitted_answer in submitted_answers:
#         index = submitted_answer['index']
#         if submitted_answer['answer'] == collection_question.find_one({'index': index})['correct_answer']:
#             marks += 1

#     return jsonify({'marks': marks}), 200

# if __name__ == '__main__':
#     app.run(debug=True, port=5012)


from head_pose_estimation import hp_model,stop_hp_model
from eye_tracker import eye_track
from flask import Flask, jsonify, request
from pymongo import MongoClient
from anti_spoof_face_recognition import anti_spoof_model,stop_anti_spoof_model
from anti_spoof import spoof_model,stop_spoof_model
from person_and_phone import pp_model,stop_pp_model
from bson import ObjectId
from flask import jsonify

app = Flask(__name__)

# Initialize MongoDB client
client = MongoClient('mongodb://localhost:27017/') 
db = client['exam'] 
collection_question = db['questions']  
collection_login_student = db['login'] 
collection_login_teacher = db['login'] 
collection_results = db['results']
collection_test_names = db['test_names']
collection_test_questions = db['test_questions']
detection_flag = True

@app.route('/login_student', methods=['POST'])
def login_student():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    #print(username,password)

    user = collection_login_student.find_one({"user": username})
   # print(1,collection_login_student.find_one().get('password'))
    if user:
        stored_password = user.get('password')
        if password == stored_password:
            return jsonify({"success": True}), 200
        else:
            return jsonify({"success": False, "message": "Incorrect password"}), 401
    else:
        return jsonify({"success": False, "message": "User not found"}), 404

@app.route('/login_teacher', methods=['POST'])
def login_teacher():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    #print(username,password)

    user = collection_login_teacher.find_one({"user": username})
    #print(collection_login_teacher.find_one().get('password'))
    if user:
        stored_password = user.get('password')
        if password == stored_password:
            return jsonify({"success": True}), 200
        else:
            return jsonify({"success": False, "message": "Incorrect password"}), 401
    else:
        return jsonify({"success": False, "message": "User not found"}), 404


@app.route('/test_names', methods=['GET'])
def get_test_names():
    try:
        test_names = list(collection_test_names.find({}, {"_id": 0, "test_name": 1}))
        #print(test_names)
        return jsonify(test_names), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/test_questions', methods=['GET'])
def get_test_questions():
    test_name = request.args.get('testName')
    try:
        # Fetch questions from the corresponding collection
        test_collection = db[test_name]
        test = list(test_collection.find({}, {"_id": 0}))
        if test:
            return jsonify({"questions": test}), 200
        else:
            return jsonify({"message": "Test not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/questions')
def get_questions():
    questions = list(collection_question.find({}, {"_id": 0}))
    return jsonify(questions)



@app.route('/upload_questions', methods=['POST'])
def upload_questions():
    data = request.get_json()
    testName = data.get('testName')
    questions = data.get('questions')
   # print(1,testName,1,questions,1)
    db['test_names'].insert_one({"test_name": testName})
    try:
        # Insert questions into a collection named based on the test name
        collection_name = f"{testName.replace(' ', '_')}"  # Generate collection name from the test name
        db[collection_name].insert_many(questions)
        # Insert the test name into the test_names collection

        return jsonify({"success": True, "message": "Questions uploaded successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/submit_answers', methods=['POST'])
def submit_answers():
    data = request.get_json()
    answers = data.get('answers', [])
    
    submitted_answers = []
    for index, answer in enumerate(answers):
        question = collection_question.find_one({'index': index})
        correct_answer = question.get('correct_answer')
        submitted_answers.append({'index': index, 'answer': answer})
    
    # Calculate marks based on the submitted answers
    marks = 0
    for submitted_answer in submitted_answers:
        index = submitted_answer['index']
        if submitted_answer['answer'] == collection_question.find_one({'index': index})['correct_answer']:
            marks += 1

    return jsonify({'marks': marks}), 200


@app.route('/submit_test_results', methods=['POST'])
def submit_test_results():
    data = request.get_json()
    username = data.get('username')
    marks = data.get('marks')
    questions = data.get('questions', [])
    cheating = data.get('cheating')
    testname=data.get('testname')

    try:
        # Insert test results into the 'results' collection
        result_id = collection_results.insert_one({
            'username': username,
            'marks': marks,
            'testname':testname,
            'questions': questions,
            'cheating': cheating,
        }).inserted_id

        return jsonify({"success": True, "message": "Test results submitted successfully", "result_id": str(result_id)}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


from flask import jsonify

@app.route('/view_results', methods=['GET'])
def view_results():
    try:
        results = collection_results.find()
        # Convert MongoDB cursor to list of dictionaries
        results_list = []
        for result in results:
            # Convert ObjectId to string
            result['_id'] = str(result['_id'])
            results_list.append(result)
        print(results_list)
        return jsonify(results_list),200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500




#moved yoloweight and yolo h5




@app.route('/view_results_student', methods=['GET'])
def view_results_student():
    user_id = request.args.get('userId')
    #print(user_id)
    if user_id:
        # Query the database for results specific to the user ID
        results = collection_results.find({'username': user_id})

        # Convert MongoDB cursor to list of dictionaries
        results_list = []
        for result in results:
            # Convert ObjectId to string
            result['_id'] = str(result['_id'])
            results_list.append(result)

        return jsonify(results_list)
    else:
        return jsonify({'error': 'User ID is required'})


import threading

stop_signal = threading.Event()


def run_model(model_func, stop_signal):
    while not stop_signal.is_set():
        model_func()
        stop_signal.wait(0.1)

@app.route('/head_pose')
def get_pose():
    global model_threads

    model_funcs = {
        'hp_model': hp_model,
        'pp_model': pp_model,
        'spoof_model': spoof_model,
        'anti_spoof_model': anti_spoof_model,
        # Add other models here with their corresponding functions
    }
    
    model_threads = {}
    for model_name, model_func in model_funcs.items():
        model_threads[model_name] = threading.Thread(target=run_model, args=(model_func, stop_signal))
        model_threads[model_name].start()
    
    return "Detection started", 200

@app.route('/stop_detection')


def stop_detection():
    global model_threads
    stop_signal.set()  # Set the stop signal to stop the model threads
    # Call the stop functions for each model to ensure they stop
    a=stop_hp_model()
    b=stop_pp_model()
    c=stop_spoof_model()
    d=stop_anti_spoof_model()
    for thread in model_threads.values():
        thread.join()  # Wait for all model threads to finish
    print(a,b,c,d)
    return "cheater", 200


if __name__ == '__main__':
    app.run(debug=True, port=5012)
