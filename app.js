const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const date=require(__dirname + "/date.js");

const app = express();
mongoose.connect("mongodb+srv://dnyanesh:dnyanesh@cluster0-20iuu.mongodb.net/accountsDB",{useNewUrlParser:true,useUnifiedTopology: true});
//mongoose.connect("mongodb://localhost:27017/accountsDB",{useNewUrlParser:true,useUnifiedTopology: true});


app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use('/static', express.static(__dirname + "/public"));

var member = {
	Name:{type:String,
		 require:true},
	Post:{type:String,
		 require:true},
	Email:{type:String,
		 require:true},
	Img:{type:String,
		 require:true},
}

var employ = mongoose.model("employ",member);

var customerSchema = new mongoose.Schema({
	FName:{type:String,
		require:true},
	LName:{type:String,
		require:true},
	Email:{type:String,
		 require:true},
	Password:{type:String,
		 require:true},
	AccNo: String,
	IFSC: String,
	Balance: String,
	MobileNo: String
});

const customer = mongoose.model("Customer",customerSchema);

const LoanTakerSchema = {
	AccNo : {type:String,
		 require:true},
	IFSC : {type:String,
		 require:true},
	MobileNo : {type:String,
		 require:true},
	LoanAmount :{type:String,
		 require:true},
	FullName : String,
	Email : String,
	Annual_Income : String,
	City : String,
	State : String,
	NY : String,
	LType : String,
}
const LoanTaker= mongoose.model("LoanTaker",LoanTakerSchema);

const  thistorySchema = {
	Date : String,
	Time : String,
	msg : String,
	Email : String,
	Amount : String
}

const thistory = mongoose.model("TransactionHistory",thistorySchema);

app.get("/",function(req,res){
	res.render("welcome");
});

app.get("/signin",function(req,res){
	res.render("signIn",{msg:"Sign In to Your Bank Account"});
});
app.get("/register",function(req,res){
	//console.log("hii");
	res.render("register",{msg:"Create Your Bank Account Now!!"});
});
app.get("/contact",function(req,res){
	employ.find({},function(err,obj){
		res.render("contact",{cdata:obj});
	})	
});
app.get("/features",function(req,res){
	res.render("features");
});
app.get("/Application",function(req,res){
	res.render("Application");
})
app.get("/bankbalance/:type?",function(req,res){
	let type = req.params.type;
	//console.log("$2b$10$9ULcXW.9rPuflRzCDA3r6.fRCgynJyd0XdZfVMnFBaApf3sc4uING"+"="+req.query.pass);
		customer.findOne({Email:type},function(err,obj){
			if(obj)
			{
    				if(req.query.pass === obj.Password){
						res.render("bankbalance",{msg:obj.Balance,mail:req.params.type});
					}else{
						res.redirect("/signIn");
					}
				
			}
			else{
				res.redirect("/");
			}
	});
});
app.get("/bankdetail/:type?",function(req,res){
	customer.findOne({Email:req.params.type},function(err,obj){
		if(obj){
    				if(req.query.pass === obj.Password){
						res.render("bankdetails",					{obj:obj,msg:date.getHours(),mail:req.params.type,pass:req.query.pass});
					}else{
						res.redirect("/signIn");
					}
		}else{
			res.redirect("/");
		}
});});
app.get("/add/:type",function(req,res){
	res.render("add",{mail:req.params.type});
});
app.get("/withdraw/:type",function(req,res){
	res.render("withdraw",{msg:"Here You can withdraw money",mail:req.params.type});
});
app.get("/share/:type",function(req,res){
	res.render("share",{msg:"Here you can send money",mail:req.params.type});
});
app.get("/TC",function(req,res){
	res.render("TC");
});
app.get("/TH/:type",function(req,res){
	res.render("TH",{mail:req.params.type});
});



app.post("/register",function(req,res){
	var a=Math.floor(1000 + Math.random() * 9000);
	var b=Math.floor(1000 + Math.random() * 9000);
	var c=Math.floor(1000 + Math.random() * 9000);
	var d=Math.floor(100 + Math.random() * 900);
bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newCustomer = new customer({
		FName: req.body.fname,
		LName: req.body.lname,
		Email: req.body.mail,
		Password: hash,
		AccNo:(a+" " + b + " " + c +" " + d),
		IFSC:"DSKCFL"+d,
		Balance:"10000",
		MobileNo:req.body.mobileno
	});
	customer.countDocuments({}, function (err, count) {
		if(count===0){
			
			newCustomer.save(function(err){
						if(err){
							console.log(err);
						}else{
							res.redirect("/bankdetail/"+ req.body.mail+"?pass="+newCustomer.Password);
						}
				});
		}else{
			customer.findOne({Email: req.body.mail},function(err,obj){
		if(!err){
			if(obj){
				//console.log("hii");
				res.render("signIn",{msg:"You have already registered Now please SignIn"});
			}else{
				newCustomer.save(function(err){
						if(err){
							console.log(err);
						}else{
							//console.log("hii");
							res.redirect("/bankdetail/"+ req.body.mail+"?pass="+newCustomer.Password);
						}
				});
			}
		}
	});
}
});});});

app.post("/signIn",function(req,res){
	customer.findOne({Email: req.body.mail},function(err,obj){
		if(obj){
					bcrypt.compare(req.body.password, obj.Password, function(err, result) {
    				if(result){
						res.redirect("/bankdetail/"+ req.body.mail+"?pass="+obj.Password);
					}else{
						res.redirect("/signIn");
					}
			});			
		}else{
			res.redirect("/register");
		}
	});
});

app.post("/add/:type",function(req,res){
	customer.findOne({Email:req.params.type},function(err,obj){
		if(obj){
			//console.log(req.params.type);
			bcrypt.compare(req.body.password, obj.Password, function(err, result) {
    				if(result){
						//console.log(req.params.type+" "+req.body.password);
			var balance = parseInt(obj.Balance)+parseInt(req.body.amount);
			customer.updateOne(
			{Email:req.params.type},
			{$set:{Balance:balance.toString()}},
			function(err){
				if(err){
					console.log(err);
				}else{
					res.redirect("/bankbalance/"+ req.params.type+"?pass="+obj.Password);
				}
			});
			var today = new Date();
			const newTH = new thistory({
				Date : " "+(today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()),
				Time : " "+(today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()),
				msg : " Payment credited successfully by you",
				Email : req.params.type,
				Amount: req.body.amount + "Rs ",
			});
			newTH.save();
					}else{
			res.redirect("/add/"+req.params.type);
		}
		});
		}
	});

});

app.post("/withdraw/:type",function(req,res){
	customer.findOne({Email: req.params.type},function(err,obj){
		if(obj){
			if(parseInt(req.body.amount)> parseInt(obj.Balance)){
				res.render("failure",{msg:"Sry! You cant send!! Cheack balance First"});
			}
			else{
				var balance = parseInt(obj.Balance)-parseInt(req.body.amount);
				bcrypt.compare(req.body.password, obj.Password, function(err, result) {
    				if(result){
						customer.updateOne(
							{Email:req.params.type},
							{$set:{Balance:balance.toString()}},
							function(err){
								if(err){
									console.log(err);
								}else{
									res.redirect("/bankbalance/"+ req.params.type+"?pass="+obj.Password);
								}
							});
						var today = new Date();
						const newTH = new thistory({
							Date : " "+(today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()),
							Time : " "+(today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()),
							msg : " Payment withdraw successfully by you",
							Email : req.params.type,
							Amount: req.body.amount + "Rs ",
						});
						newTH.save();
					}else{
						res.redirect("/withdraw/"+req.params.type);
					}
				});			

		}
	}else{
			res.redirect("/register");
		}
});
});
app.post("/share/:type",function(req,res){
	customer.findOne({Email:req.params.type},function(err,obj1){
		if(obj1){
			customer.findOne({Email:req.body.mail2},function(err,obj2){
				if(obj2){
					var today = new Date();
					if(parseInt(req.body.amount)> parseInt(obj1.Balance)){
						res.render("failure",{msg:"Sry! You cant send Cheack balance"});
					}
					var balance1 = parseInt(obj1.Balance)-parseInt(req.body.amount);
					bcrypt.compare(req.body.password, obj1.Password, function(err, result) {
    					if(result){
							customer.updateOne(
								{Email:req.params.type},
								{$set:{Balance:balance1.toString()}},
								function(err){
									if(err){
										console.log(err);
									}else{
											var balance2 = parseInt(obj2.Balance)+parseInt(req.body.amount);
										
											customer.updateOne(
													{Email:req.body.mail2},
													{$set:{Balance:balance2.toString()}},
													function(err){
														if(err){
															console.log(err);
														}else{
											const newTH1 = new thistory({
											Date : " "+(today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()),
											Time : " "+(today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()),
											msg : " Payment is credited successfully to your Bank by " + req.body.mail1,
											Email : req.body.mail2,
											Amount: req.body.amount + "Rs ",
											});
											newTH1.save();
											const newTH = new thistory({
											Date : " "+(today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()),
											Time : " "+(today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()),
											msg : " Payment is transfered successfully to "+req.body.mail2,
											Email : req.params.type,
											Amount: req.body.amount + "Rs ",
										});
										newTH.save();
															res.redirect("/bankbalance/"+ req.params.type+"?pass="+obj1.Password);
														}
										});
										
									}
								});
											
											
						}else{
							res.redirect("/share/"+req.params.type);
						}
				});
			}
			else{
				res.render("failure",{msg:"Sry dear customer!! Receiver does not have account in our bank."});
			//res.render("register",{msg:"Pls register first"});
		}
		});
	}else{
			res.redirect("/register");
		}
		
	});
});

app.post("/Application/:type",function(req,res){
	let o = req.body;
	//console.log(o);
	customer.findOne({Email:req.params.type},function(err,obj){
		if(obj){
			bcrypt.compare(req.body.password, obj.Password, function(err, result) {
    					if(result){
								if(o.fname===obj.FName && o.lname===obj.LName && o.AccNo === obj.AccNo && o.IFSC ===obj.IFSC && o.mobileno.length===10){
										if( parseInt(o.AI)>=250000){
												if(parseInt(o.LA)<10000000 && parseInt(o.LA)>1000000){ 
													let balance = parseInt(obj.Balance) + parseInt(o.LA);
													customer.updateOne(
													{Email:req.body.mail},
													{$set:{Balance:balance.toString()}},
													function(err){
														if(err){
															console.log(err);
														}
													});
													let newLoan = new LoanTaker({
														AccNo : o.AccNo ,
														IFSC  : obj.IFSC,
														MobileNo : obj.MobileNo,
														LoanAmount : o.LA,
														FullName : obj.FName + " " + obj.LName,
														Email:o.mail,
														Annual_Income:o.AI,
														City:o.cname,
														State:o.sname,
														NY:o.years,
														LType:req.params.type+" Loan",
													});
													newLoan.save(function(err){
														if(!err){
															res.render("success",{msg:"Loan Sanction Successful",obj:newLoan});
														}
													});
													
												}else{
														res.render("failure",{msg:"Loan Amount is Greater or Small"})
												}
											}else{
												res.render("failure",{msg:"Anual Income is Less"});
											}
									
										}else{
											res.render("failure",{msg:"Pls fill information corretaly"})
										}
								}else{
									res.render("failure",{msg:"Oops!!! Something went  Wrong"})
								}
			});
		}else{
			//console.log(obj);
			res.redirect("/register");
		}
	});
});

app.post("/failure",function(req,res){
	res.redirect("/register");//,{msg:"Pls confirm password"})
});

app.post("/TH/:type",function(req,res){
	customer.findOne({Email: req.params.type},function(err,obj){
		if(obj){
					bcrypt.compare(req.body.password, obj.Password, function(err, result) {
    				if(result){
						thistory.find({Email:req.params.type},function(err,obj){
							res.render("ShowTH",{arr:obj});
						});
					}else{
						res.redirect("/TH/"+req.params.type);
					}
			});			
		}else{
			res.redirect("/register");
		}
	});
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
	console.log("server is started on port: 3000");
});

