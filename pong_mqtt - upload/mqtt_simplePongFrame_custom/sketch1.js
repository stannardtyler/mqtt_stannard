
let mqtt;
let mainTopicName = "pong_template_frame";
let myClientName;
let st_topic_path;
let d_topic_path;

let nodeList =[];
let serverNodeObject;
let nodeobject;

let playerNum;
let isFirstPlayer;
let defineplayNumber = 'false';

let playState = false;
let label1;
let resultlabel;
let clientInput;
let submitBtn1;
let submitBtn2;

let ballX;
let ballY;
let speedX;
let speedY;
let play1X;
let play1Y;
let play2X;
let play2Y;

function setup() {

  createCanvas(500,500);
  background(50);
  fill(20);
  startandChooseServerOrClient();
  nodeobject = {"nodeName":"","nodeNumber":"","ts":""};
  serverNodeObject = nodeobject;

  isFirstPlayer = 0;
  playerNum = 0;
  ballX =  width/2;
  ballY = height/2;
  speedX = 0;
  speedY = 0;
  play1X= ballX;
  play1Y= ballY;
  play2X= ballX;
  play2Y= ballY;
  console.log("flag");

}

function startandChooseServerOrClient() {
  label1 = createP("Choose either of Judge Bot or Player");
  label1.size(300,30);
  label1.style('color', '#FFF');
  label1.style('font-size', '18px');
  label1.position(100 + width/2-130,220);
  submitBtn1 = createButton("Judge Bot or Server" );
  submitBtn1.style('font-size', '18px');
  submitBtn1.style('background-color', '#888');
  submitBtn1.size(200,30);
  submitBtn1.position(100 + width/2-100,350);
  submitBtn1.mousePressed(startServerMQTT);
  submitBtn2 = createButton("Player 1 or 2 or Client" );
  submitBtn2.style('font-size', '18px');
  submitBtn2.style('background-color', '#888');
  submitBtn2.size(200,30);
  submitBtn2.position(100 + width/2-100,400);
  submitBtn2.mousePressed(startClientMQTT);
}

function startServerMQTT() {
   myClientName = "mserver";
   playerNum = 0;
   st_topic_path = mainTopicName + '/' + myClientName + '/' + "st";
   d_topic_path = mainTopicName + '/' + myClientName + '/' + "d";
   console.log(st_topic_path + " " + d_topic_path);
   MQTTconnect(myClientName);
}

function startClientMQTT() {
   myClientName = "player" + floor(random(10000)); // easy way to create uniquename
   st_topic_path = mainTopicName + '/' + myClientName + '/' + "st";
   d_topic_path = mainTopicName + '/' + myClientName + '/' + "d";
   console.log(d_topic_path);
   MQTTconnect(myClientName);
}

function AfterStartServer() {
  speedX = 4 - random(1,8) ;
  speedY = 4 - random(1,8) ;
  console.log("Server Up");
  label1.html("This is the Server View");
  label1.position(100 + width/2-80,200);
  label1.size(300,30);
  resultlabel = createP();
  resultlabel.size(300,50);
  resultlabel.style('color', '#5F5');
  resultlabel.style('font-size', '14px');
  //resultlabel.position(100 + width/2-80,520);
  submitBtn1.style('visibility', 'hidden');
  submitBtn2.style('visibility', 'hidden');
  printResult("--result --");
}


function AfterStartClient() {
  console.log("Client UP with " + myClientName);
  label1.html("Move your paddle around, then  hit the  ball");
  label1.position(100 + width/2-150,180);
  label1.size(450,30);
  submitBtn1.style('visibility', 'hidden');
  submitBtn2.style('visibility', 'hidden');
  resultlabel = createP();
  resultlabel.size(300,30);
  resultlabel.style('color', '#5F5');
  resultlabel.style('font-size', '14px');
  //resultlabel.position(100 + width/2-80,520);
  printResult("--result --");

}

function setUpClientSide () {
  let clientText = clientInput.value();
}


function printResult(msg) {
      resultlabel.html(msg);
}


function draw() {
 background(50);
  //playState = 0;
  if (playState) {
    if (myClientName != "mserver") {  // The players loop
        //  console.log("playing player");
      if (mouseIsPressed) {
        fill(255,130);
        ellipse(mouseX,mouseY,10,10); //optional
        publishMausMsg();
      }

      noStroke();
      fill(255,0,0);
      ellipse(ballX, ballY,30,30);
      strokeWeight(5);
      stroke(0,155,30);
      fill(180);
      ellipse(play1X, play1Y,60,60);
      stroke(0,30,155);
      fill(180);
      ellipse(play2X, play2Y,60,60);

  } else {  // The server update loop
       // ballX = floor(ballX);
       // ballY = floor(ballY);
        //    console.log(ballX + " " + ballY);
        ballX += speedX;
        ballY += speedY;

       // simple interaction code with the ball and player 1
       if(dist(ballX, ballY, play1X, play1Y) < 40) {
           speedX += random(-2,2);
           speedY += random(-2,2);
           speedX = -speedX;
           speedY = -speedY;
       }

        // simple interaction code with the ball and player 2
       if(dist(ballX, ballY, play2X, play2Y) < 40) {
           speedX += random(-2,2);
           speedY += random(-2,2);
           speedX = -speedX;
           speedY = -speedY;
       }


        if (ballX < 5 || ballX > width-5) {
          speedX = -speedX;
          //speedX = random(-4,4);
        }
        if (ballY < 5 || ballY > height-5) {
          speedY = -speedY;
        }

    publishServerMsg(playerNum,ballX,ballY,play1X,play1Y,play2X,play2Y);

        if (ballX >= 495) {
          console.log("player1 point")
        }

        if (ballX <= 5) {
          console.log("player2 point")
        }

   }
  }

}


// send out when client starts up, to get its client Number
function publishClientStartupMsg(n) {
  let message = new Paho.MQTT.Message(n.nodeName + "_" + n.nodeNumber + "_" + n.ts);
  console.log(st_topic_path);
  message.destinationName = st_topic_path;
  console.log("send start");
  message.retained=false;
  mqtt.send(message);
}

// what the server sends back to confirm and set the client number and name
function publishServerResponseMsg(n) {
  let message = new Paho.MQTT.Message(n.nodeName + "_" + n.nodeNumber + "_" + n.ts);
  console.log(st_topic_path);
  message.destinationName = st_topic_path;
  console.log("starting server response");
  message.retained=false;
  mqtt.send(message);
}

// sending  the X and Y info based on mousemovements
function publishMausMsg() {
  console.log(playerNum);
  let message = new Paho.MQTT.Message(playerNum + "_" + floor(mouseX) + "_" + floor(mouseY));
  message.destinationName = d_topic_path;
  message.retained=false;
  mqtt.send(message);
}

// The server 'broadcast' to all players so they get the same thing.
function publishServerMsg(theplayer,bxx,byy,p1x,p1y,p2x,p2y) {
  //console.log("server msg sent" + topic_path);
  let message = new Paho.MQTT.Message(playerNum + "_" + bxx + "_" + byy + "_" + p1x + "_" + p1y + "_" + p2x + "_" + p2y);
  message.destinationName = d_topic_path;
  message.retained=false;
  mqtt.send(message);
}

/////////////////////////////////////////////////////

function onMessageArrived(msg) {
    //console.log("incoming");
   var tempArr = split(msg.payloadString,"_");
   var tempTopicArr = split(msg.destinationName,"/");

if (tempTopicArr[2] == "st") {   // just for client talking to server the first time

      if (tempTopicArr[1] != "mserver") {  // For the server
        playerNum++;  // this creates the playerCount
        nodeobject.nodeName = tempArr[0];
        nodeobject.nodeNumber = playerNum;
        nodeobject.ts = tempArr[2];
        console.log(tempTopicArr);
        console.log(nodeobject);
        nodeList.push(serverNodeObject);
        publishServerResponseMsg(nodeList[playerNum]);
      } else {  // For the client from the server_subsribe
        if (defineplayNumber == 'false') {
          defineplayNumber = 'true';
        nodeobject.nodeName = tempArr[0];
        nodeobject.nodeNumber = tempArr[1];
        playerNum = tempArr[1];
        nodeobject.ts = tempArr[2];
        console.log("server has spoken");
        console.log(nodeobject);
      }


      }





} else

  {
  // Server Data coming into Player
  if (tempTopicArr[1] == "mserver" && myClientName != "mserver") {
    // console.log("server incoming" + tempbdArr);
            //isFirstPlayer++;
            ballX  =tempArr[1];
            ballY  =tempArr[2];
            play1X =tempArr[3];
            play1Y =tempArr[4];
            play2X =tempArr[5];
            play2Y =tempArr[6];
          // showing the data coming from server
          printResult(playerNum + " " + ballX + " " + ballY);

  }

  // Player Data coming into Server
  if (tempTopicArr[1] != "mserver" && myClientName == "mserver") {
    //server can see what was sent
    console.log("hi");
    printResult(tempArr[0] + " " + ballX + " " + ballX);

     if (tempArr[0] == 1 ) {
      playerNum = 1;
      play1X = tempArr[1];
      play1Y = tempArr[2];
    } else {
      play2X = tempArr[1];
      play2Y = tempArr[2];

    }
  }

  }

}
