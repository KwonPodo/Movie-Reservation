window.onload = () => {
    const btn = document.getElementById('btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    // console.log(btn);
    // console.log(usernameInput);
    // console.log(passwordInput);
    
    function onClickSubmit(event)
    {
        event.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;
        const data = {
            username: username,
            password: password,
        };

        // console.log(username);
        // console.log(password);

        usernameInput.value = '';
        passwordInput.value = '';

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = (event) => {
            if (xhr.readyState == 4)
            {
                if (xhr.status == 200)
                {
                    const data = JSON.parse(xhr.response);
                    console.log(data);
                    console.log(data.length);
                    // console.log(typeof(data));

                    if (data.length)
                    {
                        console.log(location.hash);
                        console.log(location.host);
                        console.log(location.hostname);
                        console.log(location.href);
                        console.log(location.origin);
                        // console.log(location.pathname);
                        // console.log(location.protocol);
                        location.assign(`${location.origin}/reserve/${data[0].username}`);
                    }
                    else 
                    {
                        window.alert('회원가입이 필요합니다');
                    }
                }
            }
        };

        xhr.open('POST', '/login', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));

    }
    
    // btn.addEventListener('click', onClickSubmit);
    btn.addEventListener('click', onClickSubmit);
}