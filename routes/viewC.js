var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var con = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"",
	database:"admin"
});


router.get('/viewCategory', function(req,res) 
{
	var q = "select * from categories";
	con.query(q, function(err,result)
	{
		res.render('viewCategory', {data:result,data1:req.session.name});
	});
});

router.get('/updateCategoryForm/:id',function(req,res){
    var q = "select * from categories where Cid = '" + req.params.id + "'";
	con.query(q, function(err,result)
	{
		if(err)
		{
			throw err;
		}
		res.render('category', {data:result,data1:req.session.name});
	});
});

router.post('/updateCategory/:id',function(req,res){
    var Cname = req.body.Cname;
    var Cdesc = req.body.Cdesc;
    var option = req.body.option;
    var id = req.params.id;
    var q = "UPDATE categories SET Cname = '" + Cname + "', Cdesc = '" + Cdesc + "', Cstatus = '" + option + "' where Cid = '" + id + "'";
    con.query(q,function(err,result)
    {
        if(err)
        throw err;
        res.redirect('/viewC/viewCategory');
    });
});

router.get('/deleteCategory/:id',function(req,res){
    var q = "delete from categories where Cid = '" + req.params.a + "'";
	con.query(q, function(err,result)
	{
		if(err)
		{
			throw err;
		}
		res.redirect('/viewC/viewCategory');
	});
});

router.post('/deleteCategorychecks',function(req,res)  
{
	var ch = req.body.check;
	if(typeof ch == "string")    //single delete through checks
	{
		var h= "delete from categories where Cid='"+ch+"'";
		console.log("DC 1 " + h);		
		con.query(h,function(err,result)
		{   if(err) throw err;
			console.log('deleted');
      	});
	}	
	else	                   //multiple delete's
	{
		for( var i = 0; i < ch.length; i++) 
		{
			var h= "delete from categories where Cid='"+ch[i]+"'";
			console.log("DC 2 " + h);		
			con.query(h,function(err,result)
			{   if(err) throw err;
				console.log('deleted');
	      	});
		}
	}
	res.redirect('/viewC/viewCategory');
});

module.exports = router;