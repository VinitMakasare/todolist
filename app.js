
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://vinitmakasare:8626013216v@cluster0.em2hnko.mongodb.net/todolistDB");

const itemSchema ={
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const Item1 =new Item({
  name:"Welcome"
});

const Item2 =new Item({
  name:"Hit + to add Item"
});

const Item3 =new Item({
  name:"<-- Hit this to remove Item"
});

const defaultItem = [Item1,Item2,Item3];

const ListSchema ={
  name:String,
  items:[itemSchema]
};

const List = mongoose.model("List", ListSchema);




//

// Item.deleteMany({name:"Welcome"},function (err) { 
//     if(err){
//       console.log(err);
//     }else{
//       console.log("Succes");
//     }
//    });
  

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItem,function (err) { 
          if(err){
            console.log(err);
          }else{
            console.log("Succes");
          }
         }) 
         res.redirect("/"); 
    }else{
            res.render("list", {listTitle:"Today", newListItems:foundItems});
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);

  // console.log(req.params);

List.findOne({name:customListName},function(err, foundList){
  if(!err){
    if(!foundList){
      const list = new List({
        name:customListName,
        items:defaultItem
      });
    
      list.save();
      res.redirect("/"+customListName);

    }else{
      res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
    }
  }
});

});



app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item =new Item({
    name:itemName
  });

if(listName==="Today"){
  item.save();
  res.redirect("/");
} else{
  List.findOne({name:listName},function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}
});


app.post("/delete",function(req,res){
  const checkerItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkerItemId, function (err, docs) {
      if (err){
          console.log(err)
      }
      else{          
          res.redirect("/");
      };
  });  
  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkerItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })

  }



});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems:item});
});

app.get("/about", function(req, res){
  res.render("about");
});



// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 4000;
// }
const port = process.env.PORT || 3000

app.listen(port, function() {
  console.log("Server started successfully on " + port);
});
