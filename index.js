const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const mysql = require('mysql');

const app = express();
const httpServer = http.createServer(app);
const io = new socketio.Server(httpServer);

const port = 9999;


// Create Seats variable
// let seats = [
//     [1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
//     [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
// ];


// Create Server
httpServer.listen(port, () => {
    console.log(`Server running at port: ${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Express Routing
app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, '/html/index.html'));
    // res.sendFile(path.join(__dirname, 'public/html/index.html'));
    // res.sendFile(path.join(__dirname, '/login.html'));
    res.redirect('html/login.html');
});

app.get('/reserve/:username', (req, res) => {
    const username = req.params.username;
    // console.log(username);
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/seats', (req, res) => {
    let seats = [];

    getAllSeats((result) => {
        // console.log(result);

        let flag = result[0].seat_row;
        let row = [];
        for (let seat of result)
        {
            // console.log(seat, flag);

            if (flag == seat.seat_row)
                row.push(Number(seat.status));
            else
            {
                // console.log(`row: ${row}`);
                // console.log(`seats: ${seats}`);
                seats.push(row);
                row = new Array();
                row.push(Number(seat.status));
                flag = seat.seat_row;
            }
        }
        seats.push(row);

        // console.log(seats.length);

        res.send(JSON.stringify(seats));
    });
});

app.post('/login', (req, res) => {
    // console.log(req.body);
    // console.log(typeof(req.body));
    const data = req.body; 
    getUser(data.username, data.password, (result) => {
        // console.log(result);
        res.send(result);
    });
});


// Create DB Connection
let conn = mysql.createConnection(
    {
        user: 'root',
        password: 'm',
        database: 'Theatre',
    }
);


// DB Interactions

// User Id
function getUser(username, password, callback)
{
    const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;

    conn.query(query, (error, results, fields) => {
        if (error) console.error(error);
        else 
        {
            // console.log(results);
            return callback(results);
        }
    });
}

// Seats
function getAllSeats(callback)
{
    const query = `SELECT * FROM seats;`;

    conn.query(query, (error, results, fields) => {
        if (error) console.error(error);
        else
        {
            return callback(results);
        }
    })
}

function getSeat(x, y, callback) 
{
    // console.log(x, y);
    // console.log(typeof(x));
    const query = `SELECT * FROM seats WHERE seat_row=${y} AND seat_column=${x};`;
    // console.log(query);
    conn.query(query, (error, result) => {
        if (error) console.error(error)
        else
        {
            // console.log(result);
            return callback(result[0]);
        }
    });
}

function modifySeat(x, y, status, username, callback)
{
    const usrQuery = `SELECT * FROM users WHERE username='${username}';`;
    // console.log(usrQuery);
    conn.query(usrQuery, (error, result) => {
        if (error) console.error(error)
        else 
        {
            // console.log(result);
            // console.log(result[0]);
            const userId = result[0].id;
            // console.log(userId);
            const query = `UPDATE seats SET status=${status}, userIdx=${userId} WHERE seat_row=${y} AND seat_column=${x}`;

            conn.query(query, (error, result) => {
                if (error) console.error(error)
                else 
                {
                    return callback(result);
                }
            });
        }
    })




    // const query = `UPDATE seats SET status=${status} WHERE seat_row=${y} AND seat_column=${x}`;

    // conn.query(query, (error, result) => {
    //     if (error) console.error(error)
    //     else 
    //     {
    //         return callback(result);
    //     }
    // });
}

function postAllSeats()
{
    let x, y;
    
    const query = `INSERT INTO seats (seat_row, seat_column, status, userIdx) VALUES (?, ?, ?, 0);`;

    for (y in seats)
    {
        for (x in seats[y])
        {
            conn.query(query, [y, x, seats[y][x]], (err, results, fields) => {
                if (err) console.error(err);
                else 
                {
                    try
                    {
                        console.log(results);
                        console.log(fields);
                    }
                    catch(error)
                    {
                        console.error(error);
                    }
                }
            });
        }
    }
}

// getAllSeats();
// postAllSeats();

// Socket Server listening on Events
io.on('connection', (socket) => {

    socket.on('reserve', (data) => {
        // console.log(data);
        // console.log(typeof(data.y));
        const username = data.username;

        getSeat(data.x, data.y, (result) => {
            let status = result.status;
            if (!status)
            {
                socket.emit('unable', '예약할 수 없는 좌석입니다.');
            }
            else
            {
                if (status == 1) 
                {
                    modifySeat(data.x, data.y, 2, username, (result) => {
                        console.log(result);
                    });


                    socket.emit('reserveSuccess', '예약되었습니다.');
                    io.sockets.emit('reserve', data);
                }
                else socket.emit('alreadyReserved', '이미 예약된 좌석입니다');
            }
        });

        

    });
});



// ASYNC PROMISES

// function get_info(data, callback){
//     var sql = "SELECT a from b where info = data";

//     connection.query(sql, function(err, results){
//           if (err){ 
//             throw err;
//           }
//           console.log(results[0].objid); // good
//           stuff_i_want = results[0].objid;  // Scope is larger than function

//           return callback(results[0].objid);
//   })
// }


// //usage

// var stuff_i_want = '';

// get_info(parm, function(result){
//   stuff_i_want = result;

//   //rest of your code goes in here
// });