
const express=require("express");
const app=express();
const bodyParser=require("body-parser");
const res = require("express/lib/response");
// const ex=require(__dirname+"/date.js");
const _=require("lodash");


app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoose=require("mongoose");
main().catch(err => console.log(err));


//todoList DB
async function main(){
   // await mongoose.connect('mongodb://localhost:27017/todolistDB')
   await mongoose.connect('mongodb+srv://aditi:test123@cluster0.tzfyo.mongodb.net/todolistDB');
}

//Item collection
const itemsSchema=new mongoose.Schema({
    name:String
});
const Item=new mongoose.model("Item",itemsSchema);
//List collection 
const listSchema={
    name:String,// name of new custom lists
    items:[itemsSchema] //an array of itemsSchema based chize
};
const List=new mongoose.model("List",listSchema);


app.set('view engine', 'ejs');
const item1=new Item({
    name:"Welcome"
});
const item2=new Item({
    name:"Hit the + button to add a new item"
});
const item3=new Item({
    name:"Hit the checkbox to delete an item"
});
const defaultList=[item1,item2,item3];

app.get("/",function(req,res){ 
//    const day=ex.getDate();
Item.find({},function(err,foundItems){
    if(foundItems.length===0)
    {
        Item.insertMany(defaultList,function(err){
    if(err){
        console.log(err);
      }else{
        console.log("sucessfully added to collection Items")
      }
});
res.redirect("/");
    }
        else {console.log(foundItems);
            res.render("lists",{listTitle:"Todo",newListItems:foundItems})}
}); 
    });
app.post("/",function(req,res){
console.log(req.body);

//Adding New Items to our ToDoList Database
const itemName=req.body.added;
const ListName=req.body.list;
const Newitem=new Item({
    name:itemName})

if(ListName==="Todo")
{
    Newitem.save();
    res.redirect("/");
}
else{
    List.findOne({name:ListName},function(err,foundList){
        foundList.items.push(Newitem);
        foundList.save();
        res.redirect("/"+ListName);
    });
}


//So now after we save our item then we re-enter inside app.get("/",function(req,res){ ..} and we find all the items inside our items
//collection and render it on the screen by entering else block

    
});

app.post("/delete",function(req,res){
    const checkedItemID=req.body.check;
    //get name of the list the item came from
    const ListName=req.body.listname;

    //check if this list is default or not
    if(ListName==="Todo")
    {
        Item.findByIdAndRemove(checkedItemID, function(err){
            if(err){
                console.log(err);
              }
              else {
                console.log("success in deleting");
              }
            })
            res.redirect("/");
    }
    else {
        //delete array element in a document and save
        List.findOneAndUpdate({name:ListName},{$pull:{items:{_id:checkedItemID}}},function(err,foundlist){
            {
                if(!err){
                    res.redirect("/"+ListName);
                }
            }
        });

    }

    
   
    

})
app.get("/:goto",function(req,res){
    const customListName=_.capitalize(req.params.goto);
    //check weather a certain list already exists or not 
    List.findOne({name:customListName},function(err,result){
        if(!err){
            if(!result){// if result list does not exist
               //create a new list
               const list=new List({
                name: customListName,
                items: defaultList
            })
            list.save();
            res.redirect("/"+customListName);
            }
            else{//show existing lists
                res.render("lists",{listTitle:result.name,newListItems:result.items});
            }
           
            }
        })

    
    
   
    })
    let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
//app.listen(port);
app.listen(port  || 3000,function(){
    console.log("Server is running on port 3000 and dynamic port");
});
 app.get("/about",function(req,res){
     res.render("about")});



