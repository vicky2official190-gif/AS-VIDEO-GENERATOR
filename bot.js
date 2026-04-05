const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

let videos = [];
let pageSize = 10;


// Load videos

function loadVideos(){

const data = fs.readFileSync('videos.txt','utf8');

const lines = data.split('\n');

videos = lines.map(line => {

const parts = line.split(':');

return {
title: parts[0],
url: parts[1]
}

});

}

loadVideos();


// Start

bot.onText(/\/start/, (msg)=>{

bot.sendMessage(msg.chat.id,
`🎬 Welcome to AS VIDEO GENERATOR

Select Category`,
{
reply_markup:{
inline_keyboard:[
[
{ text:"📚 English Classes", callback_data:"page_0" }
]
]
}
});

});


// Pagination

bot.on('callback_query', (query)=>{

const chatId = query.message.chat.id;

if(query.data.startsWith("page_")){

const page = parseInt(query.data.split("_")[1]);

const start = page * pageSize;

const end = start + pageSize;

const pageVideos = videos.slice(start,end);

const buttons = pageVideos.map((v,i)=>[
{
text:v.title,
callback_data:"video_"+(start+i)
}
]);

let nav = [];

if(page > 0){

nav.push({
text:"⬅️ Back",
callback_data:"page_"+(page-1)
});

}

if(end < videos.length){

nav.push({
text:"Next ➡️",
callback_data:"page_"+(page+1)
});

}

if(nav.length){

buttons.push(nav);

}

bot.editMessageText("🎬 Select Video",{

chat_id:chatId,
message_id:query.message.message_id,

reply_markup:{
inline_keyboard:buttons
}

});

}


if(query.data.startsWith("video_")){

const index = query.data.split("_")[1];

const video = videos[index];

bot.sendMessage(chatId,

`🎬 ${video.title}

${video.url}

⚡ Powered by AS VIDEO GENERATOR`
);

}

});
