var express = require("express");
var session = require('express-session');

var mysql = require("mysql");


var app = express();
var url = require("url");
var fs=require('fs-extra');
var formidable = require("formidable");
var form=new formidable.IncomingForm();
var bodyParser = require('body-parser');
var viewC = require('./routes/viewC');
var viewP = require('./routes/viewP');
var viewS = require('./routes/viewS');
var viewE = require('./routes/viewE');


app.use(session({
	secret:'admin',
	resave: true,
    saveUninitialized: true
}));


app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use('/images',express.static('images'));
app.use('/css',express.static('css'));
app.use('/videos_to_show',express.static('videos_to_show'));
app.use('/viewC',viewC);
app.use('/viewP',viewP);
app.use('/viewS',viewS);
app.use('/viewE',viewE);

var con = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"",
	database:"admin"
});

app.get('/',function(req,res){
		if(!req.session.name){
			
			res.render("adminLogin");	
		}
		else{
			res.redirect('/dashboard');
		}
	
		
});

// user part start


app.post('/change_password',function(req,res){
	if(req.session.name){
	var q = "select password from admint where user = '"+req.session.name+"' and status = 'active' ";
	con.query(q,function(err,result){
		if(err) throw err;
		if( req.body.inputPassword != result[0].password){
			console.log('wrong password !');
			res.send("wrong password ! ");
		} else 
		{
			var q2 = "update admint set password = '"+req.body.inputNewPassword+"'where user = '"+req.session.name+"' ";
			con.query(q2,function(err,result1)
			{
				if (err) throw err;
				res.send("done");
				return false;
			});	
		}
	});
}
else{
	res.redirect('/');
}
});

app.post('/welcome',function(req,res)
{
	console.log(req.body);
	var user = req.body.inputUser;
	var pass = req.body.inputPassword;
	var q = 'select count(user) as nor from admint where user = "'+user+'" and password = "'+pass+'" and status="active" ';
	con.query(q,function(err,result)
	{
		if (err)
		throw err;
		if(result[0].nor)
		{	
			req.session.name=user;
			res.send("done");
		}
		else
		{
			res.send('username and password are incorrect !');
		}
	});
 
});

app.get('/logout',function(req, res)
{
	req.session.destroy(function(err)
	{
       res.redirect('/');
	});
});


// user part end

app.get('/dashboard',function(req,res){
	if(!req.session.name){
     res.redirect('/');
	}else{
     res.render("menu",{data1:req.session.name,req:req});
	}
});




app.get('/add_product',function(req,res)
{
	if(!req.session.name)
	{
    	res.redirect('/');
	}
	else
	{
		var q= 'select * from categories';
	    con.query(q,function(err,result)
		{
			if(err)
			throw err;
	    	res.render('product',{data:result,data1:req.session.name});
		});
	}
});

app.get('/add_season',function(req,res){
	if(!req.session.name){
     res.redirect('/');
	}else{
    var q= 'select * from products';
    con.query(q,function(err,result)
	{
		if(err)
		throw err;
    	res.render('season',{data:result,data1:req.session.name});
	});
}
});


app.get('/add_episode',function(req,res){
	if(!req.session.name)
	{
    	res.redirect('/');
	}
	else
	{
		var q= 'select * from season';
	    con.query(q,function(err,result)
		{
			if(err)
			throw err;
	    	res.render('episode',{data:result,data1:req.session.name});
		});
	}
});

app.get('/add_category',function(req,res){
	if(!req.session.name){
     res.redirect('/');
	}else{
    res.render('category',{data1:req.session.name});
}
});

app.post('/categoryform',function(req,res){
	if(!req.session.name){
     res.redirect('/');
	}else{
		var Cname = req.body.Cname;
		var Cdesc = req.body.Cdesc;
		var option = req.body.option;

        var q = "insert into categories set  Cname = '"+Cname+"' , Cdesc = '"+Cdesc+"' , Cstatus = '"+option+"' ";
        con.query(q,function(err,result)
		{
			if(err)
			throw err;
			// console.log("connection created");
			// console.log(result);
			res.redirect('/add_product');
     	});
}
});


app.post('/productform',function(req,res)
{
	if(!req.session.name)
	{
    	res.redirect('/');
	}
	else
	{
		var form=new formidable.IncomingForm();
		form.maxFileSize = 21474836480;
    	form.parse(req,function(err,fields,files)
    	{
	    	var Cid = fields.cat;
	    	var Pname = fields.Pname;
	    	var Pdisc = fields.Pdisc;
	    	var oldpath = files.Pimge.path;
	    	var Pimge = '.'+'/images/'+files.Pimge.name;
	    	var Pstatus = fields.Pstatus;
			var q = "insert into products set Cid = '"+Cid+"' , Pname = '"+Pname+"' , Pdesc = '"+Pdisc+"' , Pimge = '"+Pimge+"' , Pstatus = '"+Pstatus+"' ";  
		    con.query(q,function(err,result)
			{
				if(err)
				throw err;
				fs.copy(oldpath, Pimge, err => {
				  if (err) return console.error(err)
				//   console.log('success!')
				});
            

				// console.log("connection created");
				res.redirect('/add_season');
	     	});    
    	});
	}
});

app.post('/seasonform',function(req,res){
	if(!req.session.name){
     res.redirect('/');
	}else{

		var Sname = req.body.Sname;
		var Sdesc = req.body.Sdesc;
		var Pid = req.body.Pid;		
        var q = "insert into season set Sname = '"+Sname+"' , Sdesc = '"+Sdesc+"' , Pid = '"+Pid+"' ";
        con.query(q,function(err,result)
		{
			if(err)
			throw err;
			res.redirect('/add_episode');
     	});
    }
});


app.post('/episodeform',function(req,res)
{
	if(!req.session.name)
	{
    	res.redirect('/');
	}
	else
	{
		var form = new formidable.IncomingForm();
		form.maxFileSize = 21474836480;
     	form.parse(req,function(err,fields,files)
     	{
			var Ename = fields.Ename;
			var oldpath = files.Url.path;
			var url = __dirname +'/videos_to_show/'+files.Url.name;
			 var Sid = fields.Sid;
	         var q = "insert into episodes set Ename = '"+Ename+"' , Sid = '"+Sid+"' , Url = '"+url+"' ";
	        fs.copy(oldpath,url,function(err)
	        {
				if(err) throw err;
			});
	  		   con.query(q,function(err,result)
			 {
				if(err)
			 	throw err;	
             });
				// console.log("connection created");
			 	res.redirect('/dashboard');
	    });
		
	}
});


// app.get("/hello",function(req,res)
// {
// 	var q = "select password from admint where user = 'admin'";
// 	con.query(q,function(err,result)
// 	{
// 	   	if(err)
// 		throw err;
// 		if(result[0].password == req.query.test)
// 		{

// 		}
// 		else
// 		{
// 			res.end("wrong passwrod");
			
// 		}
// 	}); 
// });


app.listen(8888);









