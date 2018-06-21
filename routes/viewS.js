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

router.get('/viewSeason', function(req,res) 
{
	var q = "select * from season";
	con.query(q, function(err,result)
	{
		res.render('viewSeason', {data:result,data1:req.session.name});
	});
});

router.get('/updateSeasonForm/:id',function(req,res){
    var q = "select * from season where Sid = '" + req.params.id + "'";
	con.query(q, function(err,result)
	{
		if(err)
		{
			throw err;
		}
		var q1 = 'select * from products';
		con.query(q1,function(err,result1){
			if(err) throw err;
			res.render('season', {data:result1,data2:result,data1:req.session.name});
		});
		
	});
});

router.post('/updateSeason/:id',function(req,res){
    var Sname = req.body.Sname;
		var Sdesc = req.body.Sdesc;
		var Pid = req.body.Pid;		
        var q = "update season set Sname = '"+Sname+"' , Sdesc = '"+Sdesc+"' , Pid = '"+Pid+"' where Sid = '"+req.params.id+"' ";
        con.query(q,function(err,result)
		{
			if(err)
			throw err;
			res.redirect('/viewS/viewSeason');
     	});
});

router.get('/deleteSeason/:id',function(req,res){
    var q = "delete from season where Sid = '" + req.params.id + "'";
	con.query(q, function(err,result)
	{
		if(err)
		{
			throw err;
		}
		res.redirect('/viewS/viewSeason');
	});
});

router.post('/deleteSeasonchecks',function(req,res)  
{
	var ch = req.body.check;
	if(typeof ch == "string")    //single delete through checks
	{
		var h= "delete from season where Sid='"+ch+"'";
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
			var h= "delete from season where Sid='"+ch[i]+"'";
			console.log("DC 2 " + h);		
			con.query(h,function(err,result)
			{   if(err) throw err;
				console.log('deleted');
	      	});
		}
	}
	res.redirect('/viewS/viewSeason');
});

module.exports = router;