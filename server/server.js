const express=require('express')
const bodyParser =require('body-parser')
const app=express()
const mysql = require('mysql')
const IPAddress='127.0.0.1'//因为这里是要链接远程数据库，ip 地址是 mysql 的地址！！本地就是 127.0.0.1，服务器上就自己找找看
const UserName='root'
const PWD='200555'
const DBName='wx_nimi1'
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
//这上面一段固定的，[] 的部分需要根据自己数据库的信息修改



//处理get请求。这里是一个 get 请求的方法演示，作用是查询 table1 表中的所有数据并返回。
app.get('/getUser', (req, res) => {
  var connection = mysql.createConnection({
    host: IPAddress,
    port: 3306,
    user: UserName,
    password: PWD,
    database: DBName
  });

  connection.connect();

  // 使用JOIN关联查询用户表
  const sqlQuery = `
    SELECT posts.*, users.username 
    FROM posts 
    INNER JOIN users ON posts.user_id = users.id
  `;

  connection.query(sqlQuery, function (error, results, fields) {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "数据库查询失败" });
    }
    res.json(results);
    console.log(results);
  });

  connection.end();
});

app.listen(3000,()=>{//这是一个监听端口，会输出监听到的信息。上面的 console.log 就会在这里输出
  console.log('server running at http://10.225.71.177:3000')
})

// 添加POST接口
app.post('/post', (req, res) => {
  const { content, user_id } = req.body
  const connection = mysql.createConnection({
    host: IPAddress,
    port: 3306,
    user: UserName,
    password: PWD,
    database: DBName
  })

  connection.connect()
  connection.query(
    'INSERT INTO posts (user_id, content) VALUES (?, ?)',
    [user_id, content],
    (error, results) => {
      if (error) {
        console.error(error)
        res.status(500).json({ success: false })
      } else {
        res.json({ success: true, id: results.insertId })
      }
    }
  )
  connection.end()
})

