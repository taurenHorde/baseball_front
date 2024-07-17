
import { useState } from 'react'
import './../css/login.css'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate();
    const [username_login, setUsername_login] = useState<string>("")
    const [password_login, setPassword_login] = useState<string>("")
    const [warning_login, setWarning_login] = useState<boolean[]>([true, true])


    async function summit_checkdata(e: React.FormEvent<HTMLFormElement>) {
        await e.preventDefault();
        const check_result = await summit_checkdata2();
        //  가입하고 로그인 둘다 이거 확인해야함 
        if (check_result) {
            await summit_login()
        }
        return
    }

    async function summit_checkdata2() {
        var copy = await [...warning_login]
        copy[0] = await !username_login ? false : true;
        copy[1] = await !password_login ? false : true;
        await setWarning_login(copy)
        if (!copy[0] || !copy[1]) return false
        return true
    }

    async function summit_login() {

        //  check 요소 넣기
        fetch('/api/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username_login,
                password: password_login
            })
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else if (!res.ok) {
                return res.json().then((err) => {
                    const error = new Error(err.message);
                    err.status = res.status;
                    throw error
                })
            }
        }).then(async (res) => {
            if (res.success) {
                return navigate('/board')
            } else {
                return alert('아이디 및 비밀번호를 다시 확인해주세요')
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    return (
        <div className="Login-Wrap">
            <form onSubmit={summit_checkdata}>
                <div className='login-box'>
                    <div className='login-title'>
                        <h5 onClick={() => { console.log(warning_login) }}>로그인</h5>
                    </div>
                    <div className='login-form'>
                        <div className='login-input'>
                            <p>아이디</p>
                            <input
                                type='text'
                                name='username'
                                onChange={(e) => { setUsername_login(e.target.value) }}
                                autoComplete='off'
                                className={warning_login[0] ? "" : "warn"}
                            />
                        </div>
                        <div className='login-input'>
                            <p>비밀번호</p>
                            <input
                                type='password'
                                name='password'
                                onChange={(e) => { setPassword_login(e.target.value) }}
                                autoComplete='off'
                                className={warning_login[1] ? "" : "warn"}
                            />
                        </div>
                        <div className='login-warning'>
                            <p>{!warning_login.includes(true) && ('아이디 및 비밀번호를 입력해주세요.')}</p>
                        </div>
                    </div>
                    <div className='login-button'>
                        <div>
                            <button className='pointer'
                                type={'submit'}
                            >로그인</button>
                        </div>
                        <div>
                            <Link to="/regist"><button className='pointer'>회원가입</button></Link>
                        </div>
                    </div>
                </div>
            </form>
        </div >
    )
}

function Regist() {

    const navigate = useNavigate();

    const [username_regist, setUsername_regist] = useState<string>("")
    const [nickname_regist, setNickname_regist] = useState<string>("")
    const [password1_regist, setPassword1_regist] = useState<string>("")
    const [password2_regist, setPassword2_regist] = useState<string>("")
    const [warning_regist, setWarning_writeG] = useState<boolean[]>([true, true, true, true])
    const [overlapping_regist, setOverlapping_regist] = useState<boolean[]>([false, false])
    // 중복이 아닌 기본값이 false 임


    const username_Reg: RegExp = /^[a-z]+[a-z0-9]{5,19}$/g;
    const nickname_Reg: RegExp = /^[가-힣]{2,8}$/;
    const password_Reg: RegExp = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/;

    async function summit_checkdata(e: React.FormEvent<HTMLFormElement>) {
        await e.preventDefault();
        const check_result = await summit_checkdata2()
        if (check_result) {
            return submit_regist()
        } else {
            return
        }
    }

    async function summit_checkdata2() {
        var copy = await [...warning_regist]
        copy[0] = await username_Reg.test(username_regist) ? true : false
        copy[1] = await nickname_Reg.test(nickname_regist) ? true : false
        copy[2] = await password_Reg.test(password1_regist) ? true : false
        if (password_Reg.test(password2_regist) && password1_regist === password2_regist) {
            copy[3] = await true
        } else {
            copy[3] = await false
        }
        await setWarning_writeG(copy)
        if (copy[0] && copy[1] && copy[2] && copy[3]) return true
        return false
    }

    async function submit_regist() {
        fetch('/api/regist', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username_regist,
                password: password1_regist,
                nickname: nickname_regist
            })
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else if (!res.ok) {
                return res.json().then((err) => {
                    const error = new Error(err.message);
                    err.status = res.status;
                    throw error
                })
            }
        }).then(async (res) => {
            if (res.success) {
                navigate('/login')
                return
            } else {
                // res.result 배열이고 0- username / 1- nickname  중복일 경우엔 ture / 중복이 아닐 경우엔 false
                var copy = await [...overlapping_regist]
                copy[0] = await res?.overlapping_result[0]
                copy[1] = await res?.overlapping_result[1]
                await setOverlapping_regist(copy)
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }


    return (
        <div className="Regist-Wrap">
            <form onSubmit={summit_checkdata}>
                <div className='regist-box'>
                    <div className='regist-title'>
                        <h5 onClick={() => navigate('/login')}>회원가입</h5>
                    </div>
                    <div className='regist-form'>
                        <div className='regist-input'>
                            <p>아이디
                                {overlapping_regist[0] && (
                                    <span className='red-warning'> &ensp; 중복 된 아이디입니다.</span>
                                )}
                            </p>
                            <input type='text' name="username" onChange={(e) => {
                                setUsername_regist(e.target.value)
                            }}
                                placeholder='영어 + 숫자조합 5 ~ 19글자 (첫글자는 영문)'
                                style={{ textTransform: "lowercase" }}
                                autoComplete='off'
                                className={warning_regist[0] ? "" : "warn"}
                            />
                        </div>
                        <div className='regist-input'>
                            <p>닉네임
                                {overlapping_regist[1] && (
                                    <span className='red-warning'> &ensp; 중복 된 닉네임입니다..</span>
                                )}
                            </p>
                            <input type='text' name="nickname" onChange={(e) => {
                                setNickname_regist(e.target.value)
                            }}
                                placeholder='한글 2 ~ 8글자'
                                autoComplete='off'
                                className={warning_regist[1] ? "" : "warn"}
                            />
                        </div>
                        <div className='regist-input'>
                            <p>비밀번호</p>
                            <input type='password' name="password1" onChange={(e) => {
                                setPassword1_regist(e.target.value)
                            }}
                                placeholder='영어+숫자+특수문자 조합 8 ~ 16글자'
                                className={warning_regist[2] ? "" : "warn"}
                            />
                        </div>
                        <div className='regist-input'>
                            <p>비밀번호 확인</p>
                            <input type='password' name='password2' onChange={(e) => {
                                setPassword2_regist(e.target.value)
                            }}
                                placeholder='위와 동일'
                                className={warning_regist[3] ? "" : "warn"}
                            />
                        </div>
                        <div className='regist-warning'>
                            <p>{warning_regist.includes(false) && ('입력사항을 다시 확인해주세요.(서식등)')}</p>
                        </div>
                    </div>
                    <div className='regist-button'>
                        <div>
                            <button
                                className='pointer'
                                type={'submit'}
                            >가입완료</button>
                        </div>
                        <div>
                            <button
                                onClick={() => { navigate('/login') }}
                                className='pointer'
                            >뒤로가기</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}


export { Login, Regist }