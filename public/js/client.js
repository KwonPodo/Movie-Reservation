
window.onload = () => {
    const socket = io();


    // create callback event function
    function onClickSeat (event) 
    {
        if (this.classList.contains('disabled'))
        {
            alert('예매할 수 없는 좌석입니다.');
            return;
        }
        let x = this.getAttribute('data-x');
        let y = this.getAttribute('data-y');

        console.log(`x: ${x}, y: ${y}`);

        if (confirm('좌석을 예약하시겠습니까?'))
        {
            // this.removeEventListener('click', onClickSeat);
            console.log(location.pathname);
            const parse = location.pathname.split('/');
            console.log(parse);
            socket.emit('reserve', {
                x: x,
                y: y,
                username: parse[2],
            });
            // window.alert('예약되었습니다');
        }
        else 
            window.alert('취소되었습니다.');
    }


    // AJAX
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = (event) => {
        if (xhr.readyState == 4)
            if (xhr.status == 200) 
            {
                let seats = JSON.parse(xhr.response);
                console.log(seats);
                let seat, seatRow;
                let allSeatsElement = document.querySelector('.seats');

                let x, y;
                // let txt = '';
                for(y in seats)
                {
                    seatRow = document.createElement('div');
                    seatRow.className = 'seat-row';
                    for (x in seats[y])
                    {
                        seat = document.createElement('div');
                        seat.classList.add('seat', 'enable');
                        seat.setAttribute('data-x', x);
                        seat.setAttribute('data-y', y);
                        seat.setAttribute('status', seats[y][x]);
                        if (seats[y][x] == 0)
                        {
                            seat.classList.remove('enable');
                            seat.style.backgroundColor = 'darkslategray';
                            seat.style.borderColor = 'darkslategray';
                            seat.setAttribute('disabled', 'disabled');
                        }
                        else if (seats[y][x] == 1)
                            seat.addEventListener('click', onClickSeat);
                        else if (seats[y][x] == 2)
                        {
                            seat.classList.replace('enable', 'disable');
                            seat.setAttribute('disabled', 'disabled');
                        }

                        seatRow.appendChild(seat);
                    }
                    allSeatsElement.appendChild(seatRow);
                }
            }
    }

    xhr.open('GET', '/seats', true);
    xhr.send();
    

    // Recieve Data from the Socket Server
    socket.on('unable', (msg) => {
        window.alert(msg);
    });

    socket.on('reserveSuccess', (msg) => {
        window.alert(msg);
    })

    socket.on('reserve', (data) => {
        // let target = document.querySelector(`[data-x=${data.x}][data-y=${data.y}]`);
        let target = document.querySelector(`.seat[data-x="${data.x}"][data-y="${data.y}"`);
        // console.log(target);
        target.classList.replace('enable', 'disable');
        target.removeEventListener('click', onClickSeat);
        
        // window.alert(msg);
    });

    socket.on('alreadyReserved', (msg) => {
        window.alert(msg);
    });
};
