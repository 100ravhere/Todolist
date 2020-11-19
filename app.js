const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
var items = ["Buy food","Cook food","Eat food"];
var workItems = [];
const _ = require("lodash");


app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
mongoose.connect("mongodb+srv://admin-Sourav:Incorrect1@cluster0.ii7x8.mongodb.net/todolist",{useNewUrlParser:true, useUnifiedTopology: true });
const listschema = new mongoose.Schema({
  name:String
})
const customschema = {
  name:String,
  items:[listschema]
}
const Custom = new mongoose.model("Custom",customschema);

const List = mongoose.model("List",listschema);
const taskone = new List({name:"Welcome to my to-do-list"});
const tasktwo = new List({name:"Press the + button to add your work to do"});
const taskthree = new List({name:"<------- Hit this to delete an item"});
const defaultItems = [taskone,tasktwo,taskthree];
/*
*/
app.get("/",function(req,res)
{

  List.find({},function(err,result)
  {
    if(result == 0)
    {
      List.insertMany(defaultItems,function(err)
      {
        if(err)
        {
          console.log(err);
        }
        else {
            console.log("Successfully added default items");
        }
      });
res.redirect("/");

    }
    else {
      res.render("list",{listTitle:"Today" , newItems : result});
    }
  });
});
app.post("/delete",function(req,res)
{
  const checkeditem = req.body.checkbox;
  const listtitle = req.body.listtitle;

  if (listtitle == "Today")
  {
  List.deleteOne({_id:checkeditem},function(err)
{
  if(err)
  {
    console.log(err);
  }
  else {
    console.log("Item deleted!");
  }
  res.redirect("/");
});
}
else {
  Custom.findOneAndUpdate({name:listtitle},{$pull :{items:{_id:checkeditem}}},function(err,result)
{
  res.redirect("/"+listtitle);
});
}
});
app.get("/:param",function(req,res)
{

  const parameter = _.capitalize(req.params.param);
  Custom.findOne({name:parameter},function(err,result)
{
  if(!err)
  {
    if(!result)
    {
      const custom = new Custom({
        name:parameter,
        items : defaultItems
      });
      custom.save();
      res.redirect("/"+parameter);
  }
  else {
    res.render("list",{listTitle:parameter,newItems:result.items});
  }
}
});


})
app.get("/about",function(req,res)
{
  res.render("about");
})
app.post("/",function(req,res)
{
  const button = req.body.list;

  const itemName = req.body.newItem;
  const item = new List({name:itemName});
  if (button == "Today")
  {
  item.save();
  res.redirect("/");
}
else {
    Custom.findOne({name:button},function(err,result)
  {
    result.items.push(item);
    result.save();
    res.redirect("/"+button);
  })
}
})
app.listen(process.env.PORT||3000,function(req,res)
{
  console.log("Server started using heroku!");
});
