import express from "express";
import bodyParser from "body-parser"
import shortid from "shortid";
import pg from "pg";

const app=express();
const port=3000;
const db= new pg.Client({
    user:"postgres",
    host: "localhost",
    database: "ShortURl",
    password: "123",
    port: 5432,
  });
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    res.render("index.ejs",{shortUrl:"Empty"});
})
app.post("/postlnk",async(req,res)=>{
    const link=req.body.url;
    let empty =true;
    let code;
    const result=await db.query("SELECT id FROM urlconnect WHERE link = $1", [link]);
    if (result.rows.length > 0) {
        code = result.rows[0].id;  
    } else {
        code = shortid.generate();
        await db.query("INSERT INTO urlconnect (id, link) VALUES ($1, $2)", [code, link]);
    }
    res.render("index.ejs", { shortUrl: `http://localhost:3000/${code}` });

})
app.get("/:code",async(req,res)=>{
    const { code } = req.params;
    try{
        const red = await db.query("SELECT link FROM urlconnect WHERE id = $1", [code]);
        if(red.rows.length>0){
            res.redirect(red.rows[0].link);
        }
        else{
            res.status(404).send("Short URL Not Found");
        }
    }
    catch{
        console.log("Something went Wrong")
    }


})

app.listen(port,()=>{
    console.log(`Server running on: http://localhost:${port} `)
})

