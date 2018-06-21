var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs=require('fs-extra');
var formidable = require("formidable");

var con = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"",
	database:"admin"
});

router.get('/viewProduct', function(req,res) 
{
	var q = "select * from products";
	con.query(q, function(err,result)
	{
		res.render('viewProduct', {data:result,data1:req.session.name});
	});
});

router.get('/updateProductForm/:id',function(req,res){
    var q = "select * from products where Pid = '" + req.params.id + "'";
	con.query(q, function(err,result)
	{
		if(err)
		{
			throw err;
		}
		var q1 = 'select * from categories';
		con.query(q1,function(err,result1){
			if(err) throw err;
			res.render('product', {data:result1,data2:result,data1:req.session.name});
		});
		
	});
});

router.post('/updateProduct/:id',function(req,res){
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
            var q = "update products set Cid = '"+Cid+"' , Pname = '"+Pname+"' , Pdesc = '"+Pdisc+"' , Pimge = '"+Pimge+"' , Pstatus = '"+Pstatus+"' where Pid = '"+req.params.id+"' ";  
		    con.query(q,function(err,result)
			{
				if(err)
				throw err;
				fs.copy(oldpath, Pimge, err => {
				  if (err) return console.error(err)
				//   console.log('success!')
				});
            

				// console.log("connection created");
				res.redirect('/viewP/viewProduct');
	     	});    
    	});
});

router.get('/deleteProduct/:id',function(req,res){
    var q = "delete from products where Pid = '" + req.params.id + "'";
	con.query(q, function(err,result)
	{
		if(err)
		{
			throw err;
		}
		res.redirect('/viewP/viewProduct');
	});
});

router.post('/deleteProductchecks',function(req,res)  
{
	var ch = req.body.check;
	if(typeof ch == "string")    //single delete through checks
	{
		var h= "delete from products where Pid='"+ch+"'";
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
			var h= "delete from products where Pid='"+ch[i]+"'";
			console.log("DC 2 " + h);		
			con.query(h,function(err,result)
			{   if(err) throw err;
				console.log('deleted');
	      	});
		}
	}
	res.redirect('/viewP/viewProduct');
});

module.exports = router;