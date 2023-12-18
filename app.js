var express=require('express')
var sql=require('mysql2')
var path=require('path');
var bp=require('body-parser')
var encodedata=bp.urlencoded({extended:true})
var session=require('express-session');
var flash=require('connect-flash');


var app=express()
var client=sql.createConnection({
    host:'localhost',
    user:'root',
    password:'system',
    database:'canteen'
})
let cartItems = [];
let wallet=1000;
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/',function(req,res){
    res.render('home')
})
app.get('/about',function(req,res){
    res.render('about')
})
app.get('/user',function(req,res){
    res.render('user')
})
app.get('/userhome',function(req,res){
    var sql="select * from menu";
    client.connect(function(err)
    {
        if(err) throw err
        client.query(sql,function(err,data)
        {
            if(err) throw err
            res.render('userHome',{title:'menu',sampleData:data})
        })
    })
})

app.get('/register',function(req,res){
    res.render('reg')
})
app.post('/register',encodedata,function(req,res){
    var name=req.body.name;
    var rno=req.body.rno;
    var phno=req.body.phno;
    var pwd=req.body.pwd;
    console.log(name,rno,phno,pwd)
    var sql="INSERT INTO details(rno,name,pwd,phno,wallet) VALUES('"+rno+"','"+name+"','"+pwd+"','"+phno+"',"+wallet+")"
    client.connect(function(err){
        if(err) throw err;
    client.query(sql,function(err,result){
        if(err){
            throw err;
        }
        else{
            res.redirect('/user')
        }
    })
})
})

app.get('/login',function(req,res){
    res.render('login')
})
app.post('/login',encodedata,function(req,res){
    var rno=req.body.rno;
    var pwd=req.body.pwd;
    client.connect(function(err){
        if(err) throw err;
        else{
            var sql1="select * from details"
            client.query(sql1,function(err,data){
                if(err) throw err;
                var flag=0;
                for(let x of data){
                    if(x['rno']==rno && x['pwd']==pwd){
                        console.log(rno,pwd)
                        flag=1;
                    }
                }
                if(flag==1)
                {
                    global.rn=rno;
                    res.render('login',{message:"Login successful"})
                    res.redirect('/userhome')
                }
                else{
                    res.send({msg:"Invalid User"})
                    res.redirect('/user');
                }
            })
        }
    })
})

app.get('/odetails',function(req,res){
    var sql="select * from orders where rollno='"+rn+"'"
    client.connect(function(err){
        if(err) throw err
        client.query(sql,function(err,data){
            console.log("data displayed");
            if(err) throw err
            else{
                res.render('orderdetails',{title:'my orders',action:'ordetails',sampleData:data})
            }
        })
    })
})

app.get('/profile',function(req,res){
    var sql="select * from details where rno='"+rn+"'"
    client.connect(function(err){
        if(err) throw err
        client.query(sql,function(err,data){
            if(err) throw err
            else{
                res.render('orderdetails',{title:'my profile',action:'profile',sampleData:data})
            }
        })
    })
})

app.get('/admin',function(req,res){
    res.render('admin')
})
app.post('/admin',encodedata,function(req,res)
{
    var email=req.body.email;
    var pwd=req.body.pwd;
    if(email=="s@gmail.com" && pwd=="333")
    {
        res.redirect('/adminhome');
    }
    else{
        console.log("invalid details");
        res.redirect('/admin');
    }
})
app.get('/orders', function(req, res) {
    var date_obj = new Date();
    var day = date_obj.getDate();
    var mon = date_obj.getMonth() + 1;
    var year = date_obj.getFullYear();
    var date = year + "-" + mon + "-" + day;
    console.log(date);

    var sql = "select items from orders where deliverydate='" + date + "'";
    client.connect(function(err) {
        if (err) throw err;
        client.query(sql, function(err, data) {
            if (err) throw err;

            var order_items = []; 

            for (var y = 0; y < data.length; y++) {
                var dummy = data[y]['items'];
                for (var k = 0; k < dummy.length; k++) {
                    var name = dummy[k].name;
                    var quan = dummy[k].quantity;
                    var obj = { name, quan };
                    order_items.push(obj);
                }
            }
            console.log("actual orders", order_items);

            const uniqueMap = new Map();
            for (const item of order_items) {
                if (uniqueMap.has(item['name'])) {
                    uniqueMap.set(item['name'], uniqueMap.get(item['name']) + item['quan']);
                } else {
                    uniqueMap.set(item['name'], item['quan']);
                }
            }
            var torders = Array.from(uniqueMap, ([name1, cnt1]) => ({ 'name1': name1, 'cnt1': cnt1 }));
            console.log("total orders", torders);

            res.render('adminOrders', { sampleData: torders });
        });
    });
});

app.get('/adminhome',function(req,res){
    var sql="select * from menu";
    client.connect(function(err)
    {
        if(err) throw err
        client.query(sql,function(err,data)
        {
            if(err) throw err
            res.render('adminHome',{title:'menu',sampleData:data})
        })
    })
})

app.get('/addmitem',function(req,res)
{
    var c1=true;var c2=false;var c3=false;var c4=false;
    res.render('searchToken',{c1,c2,c3,c4});
})
app.post('/addmitem',encodedata,function(req,res)
{
    var iname=req.body.iname;
    var icost=req.body.icost;
    client.connect(function(err)
    {
        if(err) throw err;
        var sql="insert into menu(item_name,cost) values('"+iname+"',"+icost+")"
        client.query(sql,function(err,data)
        {
            if(err) throw err;
            console.log("item added");
            res.redirect('/adminhome');
        })
    })
})

app.get('/delmitem',function(req,res)
{
    var c1=false;var c2=false;var c3=true;var c4=false;
    res.render('searchToken',{c1,c2,c3,c4});
})
app.post('/delmitem',encodedata,function(req,res)
{
    var iname=req.body.iname;
    client.connect(function(err)
    {
        if(err) throw err;
        var sql="delete from menu where item_name='"+iname+"'"
        client.query(sql,function(err,data)
        {
            if(err) throw err;
            console.log("item deleted");
            res.redirect('/adminhome');
        })
    })
})

app.get('/modcost',function(req,res)
{
    var c1=false;var c2=false;var c3=false;var c4=true;
    res.render('searchToken',{c1,c2,c3,c4});
})
app.post('/modcost',encodedata,function(req,res)
{
    var iname=req.body.iname;
    var icost=req.body.icost;
    client.connect(function(err)
    {
        if(err) throw err;
        var sql="update menu set cost="+icost+" where item_name='"+iname+"'"
        client.query(sql,function(err,data)
        {
            if(err) throw err;
            console.log("cost updated");
            res.redirect('/adminhome');
        })
    })
})

app.get('/authToken',function(req,res)
{
    var c1=false;var c2=true;var c3=false;var c4=false;
    res.render('searchToken',{c1,c2,c3,c4});
})
app.post('/authToken',encodedata,function(req,res)
{
    var tid=req.body.tid;
    client.connect(function(err)
    {
        if(err) throw err
        var sql="select * from orders where tokenid="+tid+""
        client.query(sql,function(err,data)
        {
            if(err) throw err;
            var flag=0;
            var date_obj= new Date()
            var day=date_obj.getDate()
            var mon=date_obj.getMonth()+1
            var year=date_obj.getFullYear()
            var date=year+"-"+mon+"-"+day;
            for(let x of data){
                if(x['tokenid']==tid && x['status']=="pending" && x['deliverydate']==date){
                    flag=1;
                }
            }
            console.log(data['cost']);
            if(flag==1)
            {
                var deli="delivered";
                var sql1="update orders set status='"+deli+"' where tokenid="+tid+""
                client.query(sql1,function(err,data)
                {
                    if(err) throw err
                    else{
                        console.log("order delivered");
                        res.redirect('/adminhome');
                    }
                })
            }
            else{
                res.send("<h1>no order exists with given token today</h1>");
            }
        })
    })
})

app.get('/adminLogout',function(req,res)
{
    res.redirect('/');
})

app.get('/cart', (req, res) => {
  res.render('cart', { cartItems: cartItems });
  console.log('Cart items:', cartItems);
});

const fs = require('fs');
app.post('/addItem', (req, res) => {
  const { name, price,'data-id':dataId,quantity} = req.body;

  const itemExists = cartItems.some(item => item.name === name && item['data-id']===dataId);
  if (itemExists) {
    res.send('<script>alert("Item is already in the cart"); window.location="/userhome";</script>');

  } else {
    cartItems.push({ name, price: parseInt(price),'data-id':dataId,quantity:parseInt(quantity)});
    const fs = require('fs');

fs.readFile('cartItems.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading cartItems.json:', err);
    return;
  }

  try {
    const cartItems = JSON.parse(data);
    console.log('Cart items:');
    cartItems.forEach(item => {
    });
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});
  }
});

app.post('/incrementQuantity', (req, res) => {
  const { 'data-id': dataId } = req.body;
  const foundItem = cartItems.find(item => item['data-id'] === dataId);
  if (foundItem) {
    foundItem.quantity++;
    const totalCost = calculateTotalCost(); 
    res.redirect('/cart');
  }
});

app.post('/clearCart', (req, res) => {
  cartItems = [];
  res.json({ success: true });
});

app.post('/decrementQuantity', (req, res) => {
  const { 'data-id': dataId } = req.body;
  const foundItem = cartItems.find(item => item['data-id'] === dataId);
  if (foundItem && foundItem.quantity > 1) {
    foundItem.quantity--;
    const totalCost = calculateTotalCost(); 
    res.redirect('/cart');
  }
});

app.post('/removeItem', (req, res) => {
  const { index } = req.body;
  if (index !== undefined) {
    cartItems.splice(parseInt(index), 1);
  }
  res.redirect('/cart');
});

function calculateTotalCost() {
  return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

app.get('/totalCost', (req, res) => {
  const totalCost = calculateTotalCost();
  console.log(totalCost)
});
app.get('/totalCostdis', (req, res) => {
    const totalCost1 = calculateTotalCost();
    res.json({ totalCost1 });
});

app.post('/proceedOrder', async (req, res) => {
    const size=5;
    const min=Math.pow(10,size-1);
    const max=Math.pow(10,size)-1;
    const randnum=Math.floor(Math.random()*(max-min+1))+min;
    console.log(randnum);
    var status='pending'
    var date_obj= new Date()
    var day=date_obj.getDate()
    var mon=date_obj.getMonth()+1
    var year=date_obj.getFullYear()
    var date=year+"-"+mon+"-"+day
    var deliverydate1=req.body.dDate;
    const [year1,month,day1]=deliverydate1.split('-');
    const day2=parseInt(day1,10).toString();
    const deliverydate=year1+'-'+month+'-'+day2;
    console.log(deliverydate);
    totalCost=calculateTotalCost();
    client.connect(function(err)
    {
    if(err) throw err
    var sql="select wallet from details where rno='"+rn+"'";
    client.query(sql,function(err,data)
    {
        if(err) throw err
        console.log(data[0]['wallet']);
        global.x=data[0]['wallet']
        if((data[0]['wallet']-totalCost)<=10)
        {
            console.log("you don't have enough money");
            res.redirect('/userhome');
        }
        else
        {
            var sql1="INSERT INTO orders VALUES('"+rn+"','"+randnum+"','"+JSON.stringify(cartItems,null,2)+"','"+totalCost+"','"+status+"','"+date+"','"+deliverydate+"')"
            client.query(sql1,function(err,data)
            {
                if(err) throw err
                console.log("order placed");
                res.redirect('/userhome')
            })
            wallet=x-totalCost;
            console.log("after wallet",wallet);
            var sql2="update details set wallet="+wallet+" where rno='"+rn+"'"
            console.log("after wallet",wallet);
            client.query(sql2,function(err,data)
            {
                if(err) throw err
                cartItems=[];
                console.log("cart emptied");
                console.log("wallet updated");
            })
        }
    })
    })
});

app.listen(2002)