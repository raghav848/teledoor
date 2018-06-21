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

router.get('/viewEpisode', function(req,res) 
{
	var q = "select * from episodes";
	con.query(q, function(err,result)
	{
		res.render('viewEpisode', {data:result,data1:req.session.name});
	});
});

router.get('/updateEpisodeForm/:id',function(req,res){
    var q = "select * from episodes where Eid = '" + req.params.id + "'";
	con.query(q, function(err,result)
	{
		if(err)
		{
			throw err;
		}
		var q1 = 'select * from season';
		con.query(q1,function(err,result1){
			if(err) throw err;
			res.render('episode', {data:result1,data2:result,data1:req.session.name});
		});
		
	});
});

router.post('/updateEpisode/:id',function(req,res){
    var form = new formidable.IncomingForm();
    form.maxFileSize = 21474836480;
     form.parse(req,function(err,fields,files)
     {
        var Ename = fields.Ename;
        var oldpath = files.Url.path;
        var url = __dirname +'/videos_to_show/'+files.Url.name;
         var Sid = fields.Sid;
         var q = "update episodes set Ename = '"+Ename+"' , Sid = '"+Sid+"' , Url = '"+url+"' where Eid = '"+req.params.id+"' ";
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
             res.redirect('/viewE/viewEpisode');
    });
});

router.get('/deleteEpisode/:id',function(req,res){
    var q = "delete from episodes where Eid = '" + req.params.id + "'";
	con.query(q, function(err,result)
	{
		if(err)
		{
			throw err;
		}
		res.redirect('/viewE/viewEpisode');
	});
});

router.post('/deleteEpisodechecks',function(req,res)  
{
	var ch = req.body.check;
	if(typeof ch == "string")    //single delete through checks
	{
		var h= "delete from episodes where Eid='"+ch+"'";
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
			var h= "delete from episodes where Eid='"+ch[i]+"'";
			console.log("DC 2 " + h);		
			con.query(h,function(err,result)
			{   if(err) throw err;
				console.log('deleted');
	      	});
		}
	}
	res.redirect('/viewE/viewEpisode');
});

module.exports = router;