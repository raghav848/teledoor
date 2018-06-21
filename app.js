var express = require("express");
var mysql = require("mysql");
var app = express();
var bodyParser = require('body-parser');
var url = require("url");
var random = require("random-key");
var fs = require('fs-extra');
var session = require('express-session');
var formidable = require('formidable');

app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret:'user'}));
app.set("view engine","ejs");
app.use('/images',express.static('images'));
app.use('/css',express.static('css'));
app.use('/javascript',express.static('javascript'));
app.use('/videos_to_show',express.static('videos_to_show'));
var con = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"",
	database:"admin"
});

app.get('/logout',function(req, res)
{
	req.session.destroy(function(err)
	{
       res.redirect('/');
	});
});

app.get('/profile',function(req,res){
	var q = "select * from profile inner join payment_options on profile.Pay_id  = payment_options.Pay_id";
	var q1 = "select * from movies_list inner join profile on movies_list.email  = profile.email";	
	con.query(q,function(err,result){
		if(err) throw err;
		con.query(q1,function(err,result1){
			if(err) throw err;
			// console.log(result1);
			res.render('profile',{data:result,data1:result1,data4:req.session.user});
		});	
	});
});


app.get('/loginIn',function(req,res){

res.render('login');
});



app.post('/success',function(req,res){
	var email = req.body.email;
	var password = req.body.password;
	var q='select email from profile where email = "'+email+'" and password = "'+password+'" ';
	con.query(q,function(err,result){
	if(err) throw err;
	if(result[0].email)
	{
		req.session.user = email;
		res.send("done");
	}
	else
	{
		res.send('fail');
	}
	});


});


// payment routes start

app.post('/your-server-side-code',function(req,res){
			res.redirect('/thanks');
});

app.get('/thanks',function(req,res){
	// var q = 'update profile  set payment_id = "'+req.session.payment_id+'" ,';
	// con.query(q,function(err,result){
	// 	if (err) throw err;
		var q1= 'update paymentaction set status = "success" where payment_id = "'+req.session.payment_id+'" ';
		con.query(q1,function(err,result1)
		{
			var q2 = 'select Pay_id from payment_options where Pay_price = "(select Pay_price from paymentaction where payment_id ='+req.session.payment_id+')" ' ;
			con.query(q2,function(err,result){
				var p = result[0].Pay_id;
				if(err) throw err;
				var q3 = 'update profile set payment_id = "'+req.session.payment_id+'", Pay_id = "'+p+'" where email = "'+req.session.user+'" ';
				
				con.query(q3,function(err,result2){
					if(err) throw err;
					
					req.session.payment_id='';
		 			res.redirect('/');
					
				});
			});
		});
	});


// cancel cart 

app.get('/cancelCart',function(req,res){
	var q = 'delete  from paymentaction where payment_id = "'+req.session.payment_id+'"';
	con.query(q,function(err,result){
		if(err) throw err;
		req.session.payment_id='';
		res.redirect('/');
	});
});


app.get('/pay/:msg',function(req,res){

	var q1 = 'select * from paymentaction where payment_id = "'+req.session.payment_id+'"';
		if(req.params.msg=='Paypal'){
 			con.query(q1,function(err,result1){
 				res.render('paypal',{data:result1});
 			});
			
		}
		else
		{	
			con.query(q1,function(err,result1){
 				res.render('stripe',{data:result1});
 			});
		}
});

app.get('/payment/:msg',function(req,res){
	if(req.session.user){
		var q1 = 'select  * from payment_options where Pay_id = "'+req.params.msg+'"';
		con.query(q1,function(err,result1){
			res.render('mem',{data:result1});
		});
	}
	else
	{
		res.redirect('/signup');
	}
});


app.post('/paymentuser',function(req,res){

	var fname = req.body.fname;
	var cno = parseInt(req.body.cno);
	var email = req.body.email;
	var address = req.body.address;
	var payradio = req.body.payradio;
	var payprice = req.body.price;
	var randomKey = random.generate();
	req.session.payment_id = randomKey;
	var q = 'insert into paymentaction set payment_id = "'+req.session.payment_id+'", fname = "'+fname+'", cno = "'+cno+'", email = "'+email+'", address= "'+address+'", payment_method = "'+payradio+'", status = "cart",Pay_price = "'+payprice+'" ';
	con.query(q,function(err,result){
		res.redirect('/pay/'+payradio);
	});
});

// payment routes end


app.get('/payment_detail',function(req,res){

res.render('index1');
});

app.get('/signup',function(req,res){

res.render('signup');
});

app.post('/register',function(req,res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var password = req.body.password;
	var q = 'insert into profile set firstname = "'+firstname+'", lastname = "'+lastname+'", email = "'+email+'", password = "'+password+'" ';

	con.query(q,function(err,result){
      	res.redirect('/loginIn');
	});

});


app.get('/login',function(req,res){

res.render('login');
});


app.get('/membership',function(req,res){

res.render('hiw');

});





app.get("/",function(req, res){
	  var q = "select * from movies_list";
	  var q1 = 'select * from products  where Cid=11 ';
	  var q2 = 'select * from products where Cid=12';
	  var q3 = 'select * from payment_options';
	  var q4 = 'select firstname from profile where email = "'+req.session.user+'"';
	  con.query(q, function(err,result){
		 if (err) throw err;
		 con.query(q1,function(err,result1){
	  	 	if (err) throw err;
	 		con.query(q2, function(err,result2){
		 		if (err) throw err;
	 			con.query(q3, function(err,result3){
		 			if (err) throw err;
	 				con.query(q4, function(err,result4){
		 				if (err) throw err;
	  					res.render("index",{data:result,data1:result1,data2:result2,data3:result3,data4:req.session.user});
	  				}); 	
				});
			});
		});
	});
});

app.get('/play/:msg',function(req,res){

var q = "select * from movies_list where id ='"+req.params.msg+"'";
var q1 = "update movies_list set views = views +1 where id='"+req.params.msg+"'";
var q3 = "select * from movies_list";
var q4 = "select * from comment where id = '"+req.params.msg+"'" ;


con.query(q1,function(err,result){

}); 
	
con.query(q,function(err,result1){

con.query(q3,function(err,result2){

con.query(q4,function(err,result3){



res.render("player",{data:result1,data2:result2,data3:result3,data4:req.session.user});
	
});

});



});


});

app.get('/tplay/:msg',function(req,res){

var q = "select * from  categories  inner join products  on categories.Cid  = products.Cid  inner join season  on products.Pid = season.Pid  inner join episodes  on season.Sid = episodes.Sid where products.Pid = '"+ req.params.msg + "'";
con.query(q,function(err,result)
{
	
   res.render('tplayer',{data:result,data4:req.session.user});
});


});

app.get('/mplay/:msg',function(req,res){
var q = "select * from  categories  inner join products  on categories.Cid  = products.Cid  inner join season  on products.Pid = season.Pid  inner join episodes  on season.Sid = episodes.Sid where products.Pid = '"+ req.params.msg + "'";
con.query(q,function(err,result){
	// console.log(result);
	res.render('mplayer',{data:result,data4:req.session.user});
});

});


app.post('/comment',function(req,res){


var name = req.body.name;
var email = req.body.email;
var addComment  =req.body.addComment;
var id = req.body.id;
var q = 'insert into comment set name = "'+name+'" , email = "'+email+'", comments = "'+addComment+'" , id = "'+id+'"';

con.query(q,function(err,result){
	if (err) throw err;
	res.redirect('/play/'+id);
});


});


// user upload

app.post('/upload',function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		var utitle = fields.utitle;
		var uimageOld = files.uimage.path;
		var uimageNew = './images/'+files.uimage.name;
		fs.copy(uimageOld,uimageNew,function(err)
        {
			if(err) throw err;
		});
		var uurlOld = files.uurl.path;
		var uurlNew = './videos_to_show/'+files.uurl.name;
		fs.copy(uurlOld,uurlNew,function(err)
        {
			if(err) throw err;
		});		
		var duration = fields.uduration;
		var q = 'insert into movies_list set title = "'+utitle+'", image = "'+uimageNew+'",url = "'+uurlNew+'", duration ="'+duration+'", email =  "'+req.session.user+'" ';
		con.query(q,function(err,result){
			if (err) throw err;

			res.redirect('/profile');
		});
	});
});

app.get('/deleteUpload/:id',function(req,res){
	var  q  = ' delete from movies_list where id = "'+req.params.id+'" ';
	con.query(q,function(err,result){
		res.redirect('/profile');
	});
});


// search products

app.get('/search',function(req,res){
	var t = url.parse(req.url,true);
		var q = 'select * from categories inner join products  on categories.Cid  = products.Cid  inner join season  on products.Pid = season.Pid  inner join episodes  on season.Sid = episodes.Sid where products.Pname like "'+t.query.s+'%" group by Pname';
		con.query(q,function(err,result){
			if(err) throw err;
			// console.log(result);
			res.render('search',{data:result,data4:req.session.user});

		});
	
});

app.listen(8080);

