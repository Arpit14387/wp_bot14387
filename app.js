"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = process.env.WP_TOKEN;
const XMLHttpRequest = require('xhr2');
const cors = require("cors")
// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
      
  app = express().use(body_parser.json()); // creates express http server
  app.use(cors());
var request_number=[]
var tokens=[]
var taskobj=[]
var id=[]
var temp=[]
var temp2=[]
var k=0;

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

const senddata=(text,from)=>{
  let data=""
  text.map((p,index)=>{
    data=data.concat(text[index] + "\n")
  })
  // if(data[0]==1)
  if(data[1]==1)
  data=data.concat("\n"+ "\n"+ "Send *Get 1/2/3...* to get that task info")
    axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/" +
          "106053765606058" +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: ""+ data },
        },
        headers: { "Content-Type": "application/json" },
      });
  taskobj=[]

  
}


app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the Incoming webhook message
  // console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      
     if(msg_body=="Tasks") 
     {  
    
         var index=request_number.indexOf(from)
         
         if(index==-1)
           {
                    request_number.push(from) 
             
                    index=request_number.length -1;
           }
       
       console.log(request_number)
      axios.get(`https://wpbot14387.herokuapp.com/data/${from}`)
    .then(data => {
        tokens[index]=data.data[0].token
         getallTeams(data.data[0].token)
        
        setTimeout(()=>{
          // console.log(temp)
          taskobj[index]=temp
          id[index]=temp2
          temp2=[]
          temp=[]
          senddata(taskobj[index],from) 
        },10000) 
                  }
         )
    .catch(err => console.log(err));
    }
      
     else if(msg_body.split(" ")[0]=="Get")
        {
          var num=msg_body.split(" ")[1]
          var index= request_number.indexOf(from)
          var req_id=id[index][num-1]
          console.log(id)
          console.log(tokens[index])
          console.log(req_id) 
          singletask(tokens[index],req_id,from)
          // setTimeout(()=>{
          //   senddata(["ndn"],from) 
          // },10000)
          
        }
      else
        {
          senddata(["Please type the keyword: Tasks"],from)
        }
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});



app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
  **/
  const verify_token = process.env.KEY;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.sendStatus(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// app.get("/:number/:id",(req,res)=>{
//   var num=req.params.number;
//   var id=req.params.id;
//   console.log(req.params)
  
//       axios({
//         method: "POST", // Required, HTTP method, a string, e.g. POST, GET
//         url:`https://wpbot14387.herokuapp.com/data/${num}/${id}`,
      
//         headers: { "Content-Type": "application/json" },
//       });
// res.send("done")
// })

app.get("/welcome/:number/:id",(req,res)=>{
  var num=req.params.number;
  var id=req.params.id
    {
    var request = new XMLHttpRequest();
    
request.open('POST', `https://api.clickup.com/api/v2/oauth/token?client_id=WNFQZ6T2POEMRL3WNJ5Q712JPIODP7SM&client_secret=XREM77MP0JT3NF4W5K7XFKYGS94SQL6TCCTH7R2OA9YW498V5CVASGD5U5823JG1&code=${id}`);

request.onreadystatechange = function () {
  if (this.readyState === 4) {
    console.log(JSON.parse(this.responseText).access_token);
    axios.post(`https://wpbot14387.herokuapp.com/data/${num}/${JSON.parse(this.responseText).access_token}`)
  

  }
};

request.send();
}
  
  var msg=[];
  msg.push("Welcome to this Whatsapp integration of ClickUp. Send *Tasks* to get your current tasks and other info.") 
  msg.push("")
  msg.push("p.s. it might take a few seconds to fetch your tasks...")
  senddata(msg,num)
})


  
async function getallTeams(token_id)
{
    var request = new XMLHttpRequest();

request.open('GET', 'https://api.clickup.com/api/v2/team');

request.setRequestHeader('Authorization', token_id);

request.onreadystatechange = function () {
  if (this.readyState === 4) {
  
    // console.log('Body:', (JSON.parse(this.responseText)));
 
    const obj=JSON.parse(this.responseText).teams;
   
    obj.map((p,index)=>{
 
          getallSpaces(obj[index].id,token_id)
      })
  }
};

request.send();
}

  async function getallSpaces(id,token_id){

    var request = new XMLHttpRequest();

request.open('GET', `https://api.clickup.com/api/v2/team/${id}/space?archived=`);

request.setRequestHeader('Authorization', token_id);

request.onreadystatechange = function () {
  if (this.readyState === 4) {
  
    // console.log('Body:', (JSON.parse(this.responseText)).spaces);
  
    const obj=JSON.parse(this.responseText).spaces;

        obj.map((p,index)=>{
      {
          getallFolder(obj[index].id,token_id);
          setTimeout(()=>{
            allfolderlessList(obj[index].id,token_id)
          },500)
          
          }
        })
  }
};

request.send();
}

async function getallFolder(id,token_id)
{
    var request = new XMLHttpRequest();

request.open('GET', `https://api.clickup.com/api/v2/space/${id}/folder?archived=`);

request.setRequestHeader('Authorization', token_id);

request.onreadystatechange = function () {
  if (this.readyState === 4) {

    // console.log('Body:', JSON.parse(this.responseText));

    
    const obj=JSON.parse(this.responseText).folders;

 
        obj.map((p,index)=>{
   
         
       
          {
       alllists(obj[index].id,token_id)
          }
        
        })
  }
};

request.send();

}

async function allfolderlessList(id,token_id)
{
    var request = new XMLHttpRequest();

    request.open('GET', `https://api.clickup.com/api/v2/space/${id}/list?archived=`);
    
    request.setRequestHeader('Authorization', token_id);
    
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        
    const obj=JSON.parse(this.responseText).lists;


        obj.map((p,index)=>{

        
       
          {
            alltasks(obj[index].id,token_id);
          }
        
        })
        // console.log('Body:', JSON.parse(this.responseText));
      }
    };
    
    request.send();

}

async function alllists(id,token_id)
{
    var request = new XMLHttpRequest();

    request.open('GET', `https://api.clickup.com/api/v2/folder/${id}/list?archived=`);
    
    request.setRequestHeader('Authorization', token_id);
    
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
      
        // console.log('Body:', JSON.parse(this.responseText));
        
    const obj=JSON.parse(this.responseText).lists;
//    document.getElementById("tasknames").innerHTML=""


    obj.map((p,index)=>{

 
    
      {
        alltasks(obj[index].id,token_id)

      }
    })
      }
    };
    
    request.send();
}

async function alltasks(id,token_id)
{
    
    var request = new XMLHttpRequest();

request.open('GET', `https://api.clickup.com/api/v2/list/${id}/task?order_by=due_date&reverse=true`);
request.setRequestHeader('Authorization', token_id);


request.onreadystatechange = function () {
  if (this.readyState === 4) {

    // console.log('Body:', JSON.parse(this.responseText));
    const obj=JSON.parse(this.responseText);
    
        obj.tasks.map((p,index)=>{
          if(obj.tasks[index].status.status!="complete")
          {
            temp2.push(obj.tasks[index].id)
        // console.log(obj.tasks[index].name)
        temp.push("*"+Math.ceil((temp.length+1)/2)+". "+obj.tasks[index].name+"*")
          if(obj.tasks[index].due_date)
          temp.push((("Due date: " +new Date(parseInt(obj.tasks[index].due_date))).toString().slice(0,20)))
          else
          temp.push("No due date")
          }
      })
    


   
      
      
  }
};

request.send();
}

async function singletask(token_id,id,from)
{
   console.log(token_id,id)
    var request = new XMLHttpRequest();
    var tempdata=[]
request.open('GET', `https://api.clickup.com/api/v2/task/${id}/?custom_task_ids=&team_id=&include_subtasks=`);

request.setRequestHeader('Authorization', token_id);
request.setRequestHeader('Content-Type', 'application/json');

request.onreadystatechange = function () {
  if (this.readyState === 4) {
   
    var data=  JSON.parse(this.responseText);
        tempdata.push("*"+data.name+"*")
    tempdata.push("")
        tempdata.push("Description: "+data.description)
    tempdata.push("")
        tempdata.push("Date created: "+new Date(parseInt(data.date_created)).toString().slice(0,15))
    if(data.due_date)
        tempdata.push("Due: "+new Date(parseInt(data.due_date)).toString().slice(0,15))
    else
      tempdata.push("Due: Not set")
    tempdata.push("")
        tempdata.push(data.url)


    senddata(tempdata,from)
};

}
  request.send();

}
