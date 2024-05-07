#working
import cv2
import numpy as np

pp_flag = True
a1=[]

def pp_model():
    global a1
    net = cv2.dnn.readNet('/Users/aswath/Desktop/AI-Exam-Proctoring-System-main/app1/backend/yolo-weights/yolov3.weights', '/Users/aswath/Desktop/AI-Exam-Proctoring-System-main/app1/backend/yolo-weights/yolov3.cfg')

    classes = []
    with open("/Users/aswath/Desktop/AI-Exam-Proctoring-System-main/app1/backend/yolo-weights/yolov3.txt", "r") as f:
        classes = f.read().splitlines()

    font = cv2.FONT_HERSHEY_PLAIN
    colors = np.random.uniform(0, 255, size=(len(classes), 3))

    cap = cv2.VideoCapture(0)  # 0 for the default camera, you can change it if you have multiple cameras

    while pp_flag:
        ret, img = cap.read()
        if not ret:
            break

        height, width, _ = img.shape

        blob = cv2.dnn.blobFromImage(img, 1/255, (416, 416), (0,0,0), swapRB=True, crop=False)
        net.setInput(blob)
        output_layers_names = net.getUnconnectedOutLayersNames()
        layerOutputs = net.forward(output_layers_names)

        boxes = []
        confidences = []
        class_ids = []

        for output in layerOutputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > 0.2:
                    center_x = int(detection[0]*width)
                    center_y = int(detection[1]*height)
                    w = int(detection[2]*width)
                    h = int(detection[3]*height)

                    x = int(center_x - w/2)
                    y = int(center_y - h/2)

                    boxes.append([x, y, w, h])
                    confidences.append((float(confidence)))
                    class_ids.append(class_id)

        indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.2, 0.4)

        if len(indexes) > 0:
            for i in indexes.flatten():
                x, y, w, h = boxes[i]
                label = str(classes[class_ids[i]])
                confidence = str(round(confidences[i],2))
                color = colors[class_ids[i]]
                cv2.rectangle(img, (x,y), (x+w, y+h), color, 2)
                cv2.putText(img, label + " " + confidence, (x, y+20), font, 1, (255,255,255), 2)
                print(label,confidence)
                a1.append([label,confidence])

        cv2.imwrite('Image.jpg', img)
        key = cv2.waitKey(1)
        if key == ord('q'):  # Stop when 'q' is pressed
            break

    cap.release()
    cv2.destroyAllWindows()


def stop_pp_model():
    global pp_flag,a1
    pp_flag = False
    return a1
    